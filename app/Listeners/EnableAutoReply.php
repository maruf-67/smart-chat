<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\AgentUnassigned;
use Illuminate\Support\Facades\Log;

/**
 * EnableAutoReply Listener
 *
 * Listens for AgentUnassigned events and re-enables auto-reply for the chat.
 * This ensures that when an agent releases a chat, the bot takes over again.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class EnableAutoReply
{
    /**
     * Handle the AgentUnassigned event.
     *
     * @param  AgentUnassigned  $event  The agent unassigned event
     */
    public function handle(AgentUnassigned $event): void
    {
        $chat = $event->chat;

        // Re-enable auto-reply when agent releases chat
        $chat->update(['auto_reply_enabled' => true]);

        Log::info('Auto-reply re-enabled for chat', [
            'chat_id' => $chat->id,
            'guest_identifier' => $chat->guest_identifier,
        ]);
    }
}
