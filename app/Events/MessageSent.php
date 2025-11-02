<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Ensure the event is dispatched only after the database transaction commits.
     */
    public bool $afterCommit = true;

    /**
     * Create a new event instance.
     */
    public function __construct(public Message $message)
    {
        $this->message->loadMissing(['chat', 'user']);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $chat = $this->message->chat;
        $channels = [
            new Channel('guest-chat.'.$chat->guest_identifier),
        ];

        // If there's an assigned agent, broadcast to their user channel
        if ($chat->agent_id) {
            $channels[] = new Channel('user.'.$chat->agent_id);
        }

        // Admins get updates on a general admin channel
        $channels[] = new Channel('admin-chats');

        return $channels;
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return ['message' => [
            'id' => $this->message->id,
            'chat_id' => $this->message->chat_id,
            'content' => $this->message->content,
            'sender' => $this->message->sender,
            'user_id' => $this->message->user_id,
            'is_auto_reply' => $this->message->is_auto_reply,
            'file_path' => $this->message->file_path,
            'file_type' => $this->message->file_type,
            'file_size' => $this->message->file_size,
            'created_at' => $this->message->created_at?->toIso8601String(),
            'user' => $this->message->user ? [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
            ] : null,
        ]];
    }

    /**
     * Get the event name to broadcast.
     */
    public function broadcastAs(): string
    {
        return 'MessageSent';
    }
}
