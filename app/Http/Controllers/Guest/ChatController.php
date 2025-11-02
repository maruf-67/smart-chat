<?php

declare(strict_types=1);

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Message;
use App\Services\ChatService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function __construct(private readonly ChatService $chatService) {}

    public function index(HttpRequest $request): RedirectResponse
    {
        // Check if guest has identifier in cookie
        $guestIdentifier = $request->cookie('guest_chat_id');

        // If no cookie or wants new chat, generate new identifier
        if (! $guestIdentifier || $request->query('new') === '1') {
            $guestIdentifier = 'guest_'.time().'_'.Str::random(8);
        }

        Cookie::queue(cookie('guest_chat_id', $guestIdentifier, 60 * 24 * 30));

        return redirect()->route('chat.show', ['guestIdentifier' => $guestIdentifier]);
    }

    public function show(string $guestIdentifier, HttpRequest $request): Response
    {
        $chat = $this->chatService->getChatByGuestIdentifier($guestIdentifier);

        // Get paginated messages (last 20)
        $messages = $chat
            ? $chat->messages()
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get()
                ->reverse()
                ->values()
                ->map(fn ($message) => [
                    'id' => $message->id,
                    'content' => $message->content,
                    'sender' => $message->sender,
                    'user_id' => $message->user_id,
                    'is_auto_reply' => $message->is_auto_reply,
                    'file_path' => $message->file_path,
                    'file_type' => $message->file_type,
                    'file_size' => $message->file_size,
                    'file_url' => $message->file_url,
                    'created_at' => $message->created_at?->toIso8601String(),
                ])
            : collect();

        Cookie::queue(cookie('guest_chat_id', $guestIdentifier, 60 * 24 * 30));

        return Inertia::render('chat/thread', [
            'guestId' => $guestIdentifier,
            'chat' => $chat ? [
                'id' => $chat->id,
                'guest_identifier' => $chat->guest_identifier,
                'auto_reply_enabled' => $chat->auto_reply_enabled,
                'agent_id' => $chat->agent_id,
                'messages' => $messages,
                'has_more_messages' => $chat->messages()->count() > 20,
            ] : null,
        ]);
    }

    public function loadMoreMessages(HttpRequest $request, string $guestIdentifier): \Illuminate\Http\JsonResponse
    {
        $chat = $this->chatService->getChatByGuestIdentifier($guestIdentifier);

        if (! $chat) {
            return response()->json(['messages' => []]);
        }

        $beforeId = $request->query('before_id');

        $query = $chat->messages()->orderBy('created_at', 'desc');

        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        $messages = $query
            ->limit(20)
            ->get()
            ->reverse()
            ->values()
            ->map(fn ($message) => [
                'id' => $message->id,
                'content' => $message->content,
                'sender' => $message->sender,
                'user_id' => $message->user_id,
                'is_auto_reply' => $message->is_auto_reply,
                'file_path' => $message->file_path,
                'file_type' => $message->file_type,
                'file_size' => $message->file_size,
                'file_url' => $message->file_url,
                'created_at' => $message->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'messages' => $messages,
            'has_more' => $messages->count() === 20,
        ]);
    }

    public function storeMessage(StoreMessageRequest $request, string $guestIdentifier): RedirectResponse
    {
        $chat = $this->chatService->getChatByGuestIdentifier($guestIdentifier);

        if (! $chat) {
            $chat = $this->chatService->createChat([
                'guest_identifier' => $guestIdentifier,
                'auto_reply_enabled' => true,
            ]);
        }

        $validated = $request->validated();

        $messageData = [
            'content' => $validated['content'],
            'sender' => Message::SENDER_GUEST,
            'user_id' => null,
            'is_auto_reply' => false,
            'is_from_guest' => true,
        ];

        // Handle file upload if present
        /** @var HttpRequest $baseRequest */
        $baseRequest = $request;

        /** @var UploadedFile|null $attachment */
        $attachment = $baseRequest->file('attachment');

        if ($attachment instanceof UploadedFile) {
            $path = $attachment->store('chat-attachments', 'public');

            $messageData['file_path'] = $path;
            $messageData['file_type'] = strtolower($attachment->getClientOriginalExtension());
            $messageData['file_size'] = $attachment->getSize();
        }

        $this->chatService->addMessage($chat->id, $messageData);

        return back()->with('success', 'Message sent successfully.');
    }
}
