<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Services\ChatService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin Chat Controller
 *
 * Handles chat management operations for admin users.
 * This is a thin controller that delegates all business logic to ChatService.
 * Controllers are responsible only for HTTP concerns (request/response, rendering).
 *
 * @author Development Team
 *
 * @version 1.0
 */
class ChatController
{
    /**
     * ChatService instance for delegated operations.
     */
    public function __construct(private readonly ChatService $chatService) {}

    /**
     * Display a list of all chats.
     *
     * Retrieves paginated chats with optional filtering.
     * All business logic (filtering, pagination) is in ChatService.
     *
     * @return Response Inertia response with chat list component
     *
     * @context Admin view of all chats in the system
     */
    public function index(): Response
    {
        $filters = request()->all();
        $chats = $this->chatService->getChats($filters);

        return Inertia::render('Admin/Chats/Index', [
            'chats' => $chats,
            'filters' => $filters,
        ]);
    }

    /**
     * Display a specific chat thread.
     *
     * Shows full chat history, messages, and options to assign/reassign agents.
     * All query logic (eager loading, retrieval) is in ChatService.
     *
     * @param  int  $id  Chat ID
     * @return Response Inertia response with chat detail component
     *
     * @context Admin view of specific chat conversation
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If chat not found (404)
     */
    public function show(int $id): Response
    {
        $chat = $this->chatService->getChatById($id);

        return Inertia::render('Admin/Chats/Show', [
            'chat' => $chat,
        ]);
    }

    /**
     * Update a chat (assignment, auto-reply settings, etc).
     *
     * This method handles PATCH requests to update chat properties.
     * All update logic (validation, DB operations) is in ChatService.
     *
     * @param  int  $id  Chat ID to update
     * @return RedirectResponse Redirect back to chat show page
     *
     * @context Admin updating chat settings or agent assignment
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If chat not found (404)
     */
    public function update(int $id): RedirectResponse
    {
        $data = request()->validate([
            'agent_id' => 'nullable|integer|exists:users,id',
            'auto_reply_enabled' => 'nullable|boolean',
        ]);

        $this->chatService->updateChat($id, $data);

        return redirect()->route('admin.chats.show', $id)
            ->with('success', 'Chat updated successfully.');
    }
}
