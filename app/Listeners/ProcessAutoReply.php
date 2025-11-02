<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\MessageReceived;
use App\Models\Message;
use App\Services\AutoReplyService;
use App\Services\ChatService;
use Illuminate\Support\Facades\Log;

/**
 * ProcessAutoReply Listener
 *
 * Listens for MessageReceived events and synchronously generates auto-reply
 * messages so replies can be broadcast via Reverb without relying on queues.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class ProcessAutoReply
{
    /**
     * Create the event listener.
     */
    public function __construct(
        private readonly AutoReplyService $autoReplyService,
        private readonly ChatService $chatService
    ) {}

    /**
     * Handle the MessageReceived event.
     *
     * @param  MessageReceived  $event  The message received event
     */
    public function handle(MessageReceived $event): void
    {
        $message = $event->message;
        $chat = $message->chat;

        if (! $this->autoReplyService->shouldGenerateAutoReply($chat)) {
            Log::info('Auto-reply skipped for message', [
                'message_id' => $message->id,
                'chat_id' => $chat->id,
                'reason' => 'Auto-reply disabled or agent assigned',
            ]);

            return;
        }

        $replyContent = $this->autoReplyService->generateReply($message);

        if (! $replyContent) {
            Log::warning('Failed to generate auto-reply', [
                'message_id' => $message->id,
                'chat_id' => $chat->id,
            ]);

            return;
        }

        // Create auto-reply message directly without broadcasting again
        $autoReply = $chat->messages()->create([
            'user_id' => null,
            'content' => $replyContent,
            'sender' => Message::SENDER_BOT,
            'is_auto_reply' => true,
            'is_from_guest' => false,
        ]);

        $chat->update(['last_activity_at' => now()]);

        $autoReply->loadMissing(['chat', 'user']);

        // Broadcast the auto-reply only once
        \App\Events\MessageSent::dispatch($autoReply);
    }
}
