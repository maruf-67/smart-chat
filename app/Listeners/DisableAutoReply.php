<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\AgentAssigned;
use Illuminate\Support\Facades\Log;

/**
 * DisableAutoReply Listener
 *
 * Listens for AgentAssigned events and disables auto-reply for the chat.
 * This ensures that when a human agent takes over, the bot stops responding.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class DisableAutoReply
{
    /**
     * Handle the AgentAssigned event.
     *
     * @param  AgentAssigned  $event  The agent assigned event
     */
    public function handle(AgentAssigned $event): void
    {
        $chat = $event->chat;

        // Disable auto-reply when agent takes over
        $chat->update(['auto_reply_enabled' => false]);

        Log::info('Auto-reply disabled for chat', [
            'chat_id' => $chat->id,
            'agent_id' => $chat->agent_id,
            'guest_identifier' => $chat->guest_identifier,
        ]);
    }
}
