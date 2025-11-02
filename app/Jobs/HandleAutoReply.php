<?php

namespace App\Jobs;

use App\Events\MessageSent;
use App\Models\Message;
use App\Services\AutoReplyService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class HandleAutoReply implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Message $message
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AutoReplyService $autoReplyService): void
    {
        $chat = $this->message->chat()->with(['messages'])->first();

        // Check if auto-reply should be generated
        if (! $autoReplyService->shouldGenerateAutoReply($chat)) {
            Log::info('Auto-reply skipped for message', [
                'message_id' => $this->message->id,
                'chat_id' => $chat->id,
                'reason' => 'Auto-reply disabled or agent assigned',
            ]);

            return;
        }

        // Generate AI response
        $replyContent = $autoReplyService->generateReply($this->message);

        if (! $replyContent) {
            Log::warning('Failed to generate auto-reply', [
                'message_id' => $this->message->id,
                'chat_id' => $chat->id,
            ]);

            return;
        }

        // Create auto-reply message
        $autoReplyMessage = Message::create([
            'chat_id' => $chat->id,
            'user_id' => null,
            'content' => $replyContent,
            'sender' => Message::SENDER_BOT,
            'is_from_guest' => false,
            'is_auto_reply' => true,
        ]);

        $autoReplyMessage->loadMissing(['chat', 'user']);

        MessageSent::dispatch($autoReplyMessage);

        Log::info('Auto-reply generated and broadcasted successfully', [
            'message_id' => $this->message->id,
            'auto_reply_id' => $autoReplyMessage->id,
            'chat_id' => $chat->id,
        ]);
    }
}
