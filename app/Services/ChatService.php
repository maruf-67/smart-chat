<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * ChatService
 *
 * Service layer for chat management.
 * Handles all business logic for chat operations including creation, retrieval,
 * filtering, pagination, and agent assignment.
 *
 * This service follows a thick-service, thin-controller pattern where all
 * business logic is delegated here from controllers.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class ChatService
{
    /**
     * Get paginated list of chats with optional filtering.
     *
     * Supports filtering by agent assignment, auto-reply status, and search.
     * Returns paginated results with eager-loaded relationships.
     *
     * @param array{
     *     page?: int,
     *     per_page?: int,
     *     agent_id?: int|null,
     *     auto_reply_enabled?: bool|null,
     *     search?: string|null,
     *     sort_by?: string,
     *     sort_order?: string
     * } $filters Filter parameters for query
     * @return LengthAwarePaginator Paginated chat results
     */
    public function getChats(array $filters = []): LengthAwarePaginator
    {
        $query = $this->buildChatQuery($filters);
        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }

    /**
     * Retrieve a single chat by ID with all relationships.
     *
     * Eager loads messages and auto-reply rules for complete chat context.
     *
     * @param  int  $id  Chat ID
     * @return Chat The chat instance with relationships loaded
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If chat not found
     */
    public function getChatById(int $id): Chat
    {
        return Chat::with(['messages', 'autoReplyRules', 'agent'])
            ->findOrFail($id);
    }

    /**
     * Retrieve a chat by guest identifier.
     *
     * Used for public guest chat access without authentication.
     *
     * @param  string  $guestIdentifier  Unique guest identifier
     * @return Chat|null The chat instance or null if not found
     */
    public function getChatByGuestIdentifier(string $guestIdentifier): ?Chat
    {
        return Chat::with(['messages', 'autoReplyRules'])
            ->where('guest_identifier', $guestIdentifier)
            ->first();
    }

    /**
     * Create a new chat thread.
     *
     * Initializes a chat with a unique guest identifier.
     * Auto-reply is enabled by default.
     *
     * @param  array{guest_identifier?: string, auto_reply_enabled?: bool}  $data  Chat data
     * @return Chat Created chat instance
     */
    public function createChat(array $data): Chat
    {
        // Generate unique guest identifier if not provided
        if (empty($data['guest_identifier'])) {
            $data['guest_identifier'] = $this->generateGuestIdentifier();
        }

        // Set defaults
        $data['auto_reply_enabled'] = $data['auto_reply_enabled'] ?? true;
        $data['created_by'] = auth()->id();

        return Chat::create($data);
    }

    /**
     * Update an existing chat.
     *
     * @param  int  $id  Chat ID to update
     * @param  array{agent_id?: int|null, auto_reply_enabled?: bool, last_activity_at?: string}  $data  Update data
     * @return Chat Updated chat instance
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If chat not found
     */
    public function updateChat(int $id, array $data): Chat
    {
        $chat = Chat::findOrFail($id);
        $data['updated_by'] = auth()->id();

        $chat->update($data);

        return $chat;
    }

    /**
     * Assign a chat to an agent.
     *
     * @param  int  $chatId  Chat ID to assign
     * @param  int  $agentId  User ID of agent to assign
     * @return Chat Updated chat with new agent assignment
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If chat not found
     */
    public function assignAgent(int $chatId, int $agentId): Chat
    {
        return $this->updateChat($chatId, [
            'agent_id' => $agentId,
            'last_activity_at' => now(),
        ]);
    }

    /**
     * Release a chat from its assigned agent.
     *
     * @param  int  $chatId  Chat ID to release
     * @return Chat Updated chat with agent unassigned
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If chat not found
     */
    public function releaseChat(int $chatId): Chat
    {
        return $this->updateChat($chatId, [
            'agent_id' => null,
        ]);
    }

    /**
     * Add a message to a chat and update last_activity_at timestamp.
     *
     * @param  int  $chatId  Chat ID
     * @param  array{user_id?: int|null, content: string, sender: string, is_auto_reply?: bool}  $messageData  Message data
     * @return Message Created message instance
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If chat not found
     */
    public function addMessage(int $chatId, array $messageData): Message
    {
        $chat = Chat::findOrFail($chatId);

        // Add message
        $message = $chat->messages()->create($messageData);

        // Update chat's last activity timestamp
        $chat->update(['last_activity_at' => now()]);

        return $message;
    }

    /**
     * Build a query for chats with optional filtering and relationships.
     *
     * Private method used internally to construct filtered queries.
     * Supports filtering, sorting, and eager loading.
     *
     * @param array{
     *     agent_id?: int|null,
     *     auto_reply_enabled?: bool|null,
     *     search?: string|null,
     *     sort_by?: string,
     *     sort_order?: string
     * } $filters Filter parameters
     * @return Builder Query builder instance
     */
    private function buildChatQuery(array $filters): Builder
    {
        $query = Chat::with(['agent', 'messages' => function ($q) {
            $q->latest()->limit(1); // Eager load only latest message
        }]);

        // Filter by agent assignment
        if (isset($filters['agent_id'])) {
            $agentId = $filters['agent_id'];
            if ($agentId === 'unassigned') {
                $query->whereNull('agent_id');
            } else {
                $query->where('agent_id', $agentId);
            }
        }

        // Filter by auto-reply status
        if (isset($filters['auto_reply_enabled'])) {
            $query->where('auto_reply_enabled', (bool) $filters['auto_reply_enabled']);
        }

        // Search by guest identifier
        if (! empty($filters['search'])) {
            $query->where('guest_identifier', 'like', '%'.$filters['search'].'%');
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'last_activity_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query;
    }

    /**
     * Generate a unique guest identifier for new chats.
     *
     * Uses timestamp and random string to ensure uniqueness.
     *
     * @return string Unique guest identifier
     */
    private function generateGuestIdentifier(): string
    {
        do {
            $identifier = 'guest_'.time().'_'.bin2hex(random_bytes(4));
        } while (Chat::where('guest_identifier', $identifier)->exists());

        return $identifier;
    }
}
