<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Chat;
use App\Models\User;

/**
 * ChatPolicy
 *
 * Authorization policy for chat operations.
 * Defines who can view, update, assign agents, and manage chats.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class ChatPolicy
{
    /**
     * Determine whether the user can view any chats.
     */
    public function viewAny(User $user): bool
    {
        // Both admin and agent can view chats
        return in_array($user->user_type, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can view the chat.
     */
    public function view(User $user, Chat $chat): bool
    {
        // Admin can view any chat
        if ($user->user_type === 'admin') {
            return true;
        }

        // Agent can only view chats assigned to them or unassigned chats
        if ($user->user_type === 'agent') {
            return $chat->agent_id === null || $chat->agent_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create chats.
     * (Guests create chats implicitly, admins/agents typically don't)
     */
    public function create(User $user): bool
    {
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can update the chat.
     */
    public function update(User $user, Chat $chat): bool
    {
        // Admin can update any chat
        if ($user->user_type === 'admin') {
            return true;
        }

        // Agent can only update their assigned chats
        if ($user->user_type === 'agent') {
            return $chat->agent_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can assign an agent to the chat.
     */
    public function assignAgent(User $user, Chat $chat): bool
    {
        // Only admin can assign agents
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can unassign an agent from the chat.
     */
    public function unassignAgent(User $user, Chat $chat): bool
    {
        // Admin can unassign any agent
        if ($user->user_type === 'admin') {
            return true;
        }

        // Agent can only unassign themselves
        if ($user->user_type === 'agent') {
            return $chat->agent_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can toggle auto-reply for the chat.
     */
    public function toggleAutoReply(User $user, Chat $chat): bool
    {
        // Only admin can manually toggle auto-reply
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can delete the chat.
     */
    public function delete(User $user, Chat $chat): bool
    {
        // Only admin can delete chats
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can restore the chat.
     */
    public function restore(User $user, Chat $chat): bool
    {
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the chat.
     */
    public function forceDelete(User $user, Chat $chat): bool
    {
        return $user->user_type === 'admin';
    }
}
