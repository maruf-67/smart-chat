<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Requests\StoreMessageRequest;
use App\Models\Message;
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

        return Inertia::render('admin/chats/index', [
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

        // Get all agents for assignment dropdown
        $agents = \App\Models\User::where('user_type', 'agent')
            ->select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name, // Uses the accessor
                    'email' => $user->email,
                ];
            });

        return Inertia::render('admin/chats/show', [
            'chat' => $chat,
            'agents' => $agents,
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

        // Load current chat to detect assignment changes
        $chat = $this->chatService->getChatById($id);
        $incomingAgentId = $data['agent_id'] ?? $chat->agent_id;

        // If agent assignment changed, use dedicated service methods
        if (array_key_exists('agent_id', $data) && $incomingAgentId !== $chat->agent_id) {
            if ($incomingAgentId) {
                $this->chatService->assignAgent($id, $incomingAgentId);
            } else {
                $this->chatService->releaseChat($id);
            }
            // Remove agent_id so we don't double-update below
            unset($data['agent_id']);
        }

        // Update remaining toggles (e.g., auto_reply_enabled)
        if (! empty($data)) {
            $this->chatService->updateChat($id, $data);
        }

        return redirect()->route('admin.chats.show', $id)
            ->with('success', 'Chat updated successfully.');
    }

    /**
     * Allow an admin user to send a message into a chat thread.
     */
    public function storeMessage(StoreMessageRequest $request, int $id): RedirectResponse
    {
        $messageData = [
            'content' => $request->input('content'),
            'sender' => Message::SENDER_AGENT,
            'user_id' => auth()->id(),
            'is_auto_reply' => false,
            'is_from_guest' => false,
        ];

        // Handle file upload if present (use 'attachment' to match validation)
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('chat-attachments', 'public');

            $messageData['file_path'] = $path;
            $messageData['file_type'] = strtolower($file->getClientOriginalExtension());
            $messageData['file_size'] = $file->getSize();
        }

        $this->chatService->addMessage($id, $messageData);

        return redirect()->route('admin.chats.show', $id)
            ->with('success', 'Message sent successfully.');
    }
}
