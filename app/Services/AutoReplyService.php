<?php

namespace App\Services;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Prism\Prism\Enums\Provider;
use Prism\Prism\Exceptions\PrismException;
use Prism\Prism\Facades\Prism;
use Prism\Prism\ValueObjects\Media\Image;
use Prism\Prism\ValueObjects\Messages\UserMessage;
use Spatie\PdfToText\Exceptions\BinaryNotFoundException;
use Spatie\PdfToText\Exceptions\CouldNotExtractText;
use Spatie\PdfToText\Exceptions\PdfNotFound;
use Spatie\PdfToText\Pdf;

class AutoReplyService
{
    private const MAX_PDF_EXCERPT_CHARACTERS = 3500;

    private const PDF_EXTRACTION_TIMEOUT_SECONDS = 20;

    private const CONTEXT_MESSAGE_LIMIT = 5;

    /**
     * Generate an AI-powered auto-reply for a given message.
     */
    public function generateReply(Message $message): ?string
    {
        try {
            $chat = $message->chat;

            // Build conversation context
            $contextMessages = $this->buildConversationContext($chat);

            // Create the user message with optional file attachment
            $userMessage = $this->createUserMessage($message, $contextMessages);

            // Generate response using Gemini
            $response = Prism::text()
                ->using(Provider::Gemini, 'gemini-2.5-flash-lite')
                ->withSystemPrompt($this->getSystemPrompt($chat))
                ->withMessages([$userMessage])
                ->withMaxTokens(500)
                ->usingTemperature(0.7)
                ->asText();

            return $response->text;
        } catch (PrismException $e) {
            Log::error('Prism API error during auto-reply generation', [
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        } catch (\Throwable $e) {
            Log::error('Unexpected error during auto-reply generation', [
                'message_id' => $message->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    /**
     * Build conversation context from recent messages.
     */
    protected function buildConversationContext(Chat $chat): string
    {
        $recentMessages = $chat->messages()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(self::CONTEXT_MESSAGE_LIMIT + 1)
            ->get();

        $hasMoreMessages = $recentMessages->count() > self::CONTEXT_MESSAGE_LIMIT;

        $recentMessages = $recentMessages
            ->take(self::CONTEXT_MESSAGE_LIMIT)
            ->reverse();

        $context = 'Recent conversation history (showing last '.self::CONTEXT_MESSAGE_LIMIT." messages):\n\n";

        if ($hasMoreMessages) {
            $context = "Earlier messages omitted for brevity.\n\n".$context;
        }

        foreach ($recentMessages as $msg) {
            $sender = $msg->is_from_guest ? 'Guest' : ($msg->user->name ?? 'Agent');
            $context .= "{$sender}: {$msg->content}\n";

            if ($msg->file_path) {
                $label = strtoupper((string) $msg->file_type ?: 'FILE');
                $context .= "[Attachment: {$label}]\n";
            }
        }

        return $context;
    }

    /**
     * Create a user message with optional file context.
     */
    protected function createUserMessage(Message $message, string $context): UserMessage
    {
        $content = $context."\n\nLatest message from guest:\n".trim($message->content);

        $attachments = $this->resolveAttachmentContent($message);

        if ($message->file_path) {
            $label = strtoupper((string) $message->file_type ?: 'FILE');
            $content .= "\n\nGuest included an attachment ({$label}). Use it as needed.";

            if ($this->isPdf($message->file_type)) {
                $excerpt = $this->extractPdfExcerpt($message);

                if ($excerpt !== null) {
                    $content .= "\n\n{$label} content preview".($excerpt['truncated'] ? ' (truncated)' : '').":\n".$excerpt['text'];
                }
            }
        }

        return new UserMessage($content, $attachments);
    }

    /**
     * Get the system prompt for the AI.
     */
    protected function getSystemPrompt(Chat $chat): string
    {
        return <<<PROMPT
You are a helpful customer support AI assistant. Your role is to provide immediate, accurate, and friendly responses to customer inquiries.

Guidelines:
- Be concise but thorough in your responses
- If you're not sure about something, be honest about it
- Maintain a professional yet friendly tone
- If a question requires human expertise, acknowledge that and suggest waiting for an agent
- Use the conversation history to provide contextually relevant responses
- If the user uploaded an image, analyze it carefully and reference details from it in your response
- If the user uploaded a PDF, use the extracted text to provide accurate information

Current conversation context: Guest is chatting from {$chat->guest_name} ({$chat->guest_email})
PROMPT;
    }

    /**
     * Check if file type is an image.
     */
    protected function isImage(?string $fileType): bool
    {
        return in_array($fileType, ['jpg', 'jpeg', 'png', 'gif', 'webp']);
    }

    /**
     * Prepare additional content payload for attachments.
     *
     * @return array<int, \Prism\Prism\ValueObjects\Media\Media>
     */
    protected function resolveAttachmentContent(Message $message): array
    {
        if (! $message->file_path) {
            return [];
        }

        $disk = 'public';

        if (! Storage::disk($disk)->exists($message->file_path)) {
            Log::warning('Attachment missing on disk for auto-reply context', [
                'message_id' => $message->id,
                'path' => $message->file_path,
            ]);

            return [];
        }

        if ($this->isImage($message->file_type)) {
            return [
                Image::fromStoragePath($message->file_path, $disk),
            ];
        }

        return [];
    }

    /**
     * Check if auto-reply should be generated for a chat.
     */
    public function shouldGenerateAutoReply(Chat $chat): bool
    {
        return $chat->auto_reply_enabled
            && $chat->agent_id === null;
    }

    protected function isPdf(?string $fileType): bool
    {
        return $fileType === 'pdf';
    }

    /**
     * Extract a concise text excerpt from the attached PDF for prompt injection.
     *
     * @return array{ text: string, truncated: bool }|null
     */
    protected function extractPdfExcerpt(Message $message): ?array
    {
        if (! $this->isPdf($message->file_type) || ! $message->file_path) {
            return null;
        }

        $disk = 'public';

        if (! Storage::disk($disk)->exists($message->file_path)) {
            Log::warning('Attachment missing on disk during PDF extraction for auto-reply context', [
                'message_id' => $message->id,
                'path' => $message->file_path,
            ]);

            return null;
        }

        try {
            $absolutePath = Storage::disk($disk)->path($message->file_path);
        } catch (\Throwable $exception) {
            Log::warning('Unable to resolve storage path for PDF auto-reply attachment', [
                'message_id' => $message->id,
                'path' => $message->file_path,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }

        $binary = config('services.pdf_to_text.binary');
        $timeout = (int) (config('services.pdf_to_text.timeout') ?? self::PDF_EXTRACTION_TIMEOUT_SECONDS);
        $timeout = $timeout > 0 ? $timeout : self::PDF_EXTRACTION_TIMEOUT_SECONDS;

        try {
            $rawText = Pdf::getText($absolutePath, $binary ?: null, [], $timeout);
        } catch (BinaryNotFoundException|CouldNotExtractText|PdfNotFound $exception) {
            Log::warning('Failed to extract text from PDF attachment for auto-reply context', [
                'message_id' => $message->id,
                'path' => $message->file_path,
                'error' => $exception->getMessage(),
            ]);

            return null;
        } catch (\Throwable $exception) {
            Log::warning('Unexpected error during PDF text extraction for auto-reply context', [
                'message_id' => $message->id,
                'path' => $message->file_path,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }

        $stringable = Str::of($rawText)
            ->replace(["\r\n", "\r"], "\n")
            ->replaceMatches('/[ \t]+/', ' ')
            ->replaceMatches('/\n{3,}/', "\n\n")
            ->trim();

        if ($stringable->isEmpty()) {
            return null;
        }

        $limit = (int) (config('services.pdf_to_text.max_excerpt_length') ?? self::MAX_PDF_EXCERPT_CHARACTERS);
        $limit = $limit > 0 ? $limit : self::MAX_PDF_EXCERPT_CHARACTERS;

        $normalized = (string) $stringable;
        $truncated = Str::length($normalized) > $limit;

        if ($truncated) {
            $normalized = Str::limit($normalized, $limit, '...');
        }

        return [
            'text' => $normalized,
            'truncated' => $truncated,
        ];
    }
}
