<?php

declare(strict_types=1);

namespace App\Http\Controllers\Agent;

use App\Http\Requests\StoreMessageRequest;
use App\Models\Message;
use App\Services\ChatService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Agent Chat Controller
 *
 * Handles chat operations for support agents.
 * This is a thin controller that delegates all business logic to ChatService.
 * Agents can only view assigned chats and send messages to them.
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
     * Display a list of chats assigned to this agent.
     *
     * Shows paginated list of chats assigned to the current agent.
     * All business logic (filtering, pagination) is in ChatService.
     *
     * @return Response Inertia response with agent's chats component
     *
     * @context Agent viewing their assigned chat list
     */
    public function index(): Response
    {
        // Get only chats assigned to this agent
        $filters = [
            'agent_id' => auth()->id(),
            ...request()->all(),
        ];
        $chats = $this->chatService->getChats($filters);

        return Inertia::render('agent/chats/index', [
            'chats' => $chats,
            'filters' => $filters,
        ]);
    }

    /**
     * Display a specific chat thread assigned to this agent.
     *
     * Shows full chat history and message interface for the agent.
     * All query logic is delegated to ChatService.
     *
     * @param  int  $id  Chat ID
     * @return Response Inertia response with chat detail component
     *
     * @context Agent viewing assigned chat conversation
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If chat not found (404)
     */
    public function show(int $id): Response
    {
        $chat = $this->chatService->getChatById($id);

        // Verify agent owns this chat
        if ($chat->agent_id !== auth()->id()) {
            abort(403, 'You do not have permission to view this chat.');
        }

        return Inertia::render('agent/chats/show', [
            'chat' => $chat,
        ]);
    }

    /**
     * Add a message to a chat.
     *
     * Agent sends a message to an assigned chat.
     * Validates data via StoreMessageRequest and delegates to ChatService.
     *
     * @param  StoreMessageRequest  $request  Validated message data
     * @param  int  $id  Chat ID
     * @return RedirectResponse Redirect back to chat with success message
     *
     * @context Agent responding to a guest message
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If chat not found (404)
     */
    public function storeMessage(StoreMessageRequest $request, int $id): RedirectResponse
    {
        $chat = $this->chatService->getChatById($id);

        // Verify agent owns this chat
        if ($chat->agent_id !== auth()->id()) {
            abort(403, 'You do not have permission to message this chat.');
        }

        // Add message with agent sender type
        $messageData = [
            'content' => $request->input('content'),
            'sender' => Message::SENDER_AGENT,
            'user_id' => auth()->id(),
            'is_auto_reply' => false,
            'is_from_guest' => false,
        ];

        // Handle file upload if present
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('chat-attachments', 'public');

            $messageData['file_path'] = $path;
            $messageData['file_type'] = strtolower($file->getClientOriginalExtension());
            $messageData['file_size'] = $file->getSize();
        }

        $this->chatService->addMessage($id, $messageData);

        return redirect()->route('agent.chats.show', $id)
            ->with('success', 'Message sent successfully.');
    }

    /**
     * Release a chat from agent assignment.
     *
     * Agent can release a chat they no longer wish to handle.
     *
     * @param  int  $id  Chat ID to release
     * @return RedirectResponse Redirect to agent chats list
     *
     * @context Agent releasing a chat
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If chat not found (404)
     */
    public function release(int $id): RedirectResponse
    {
        $chat = $this->chatService->getChatById($id);

        // Verify agent owns this chat
        if ($chat->agent_id !== auth()->id()) {
            abort(403, 'You do not have permission to release this chat.');
        }

        $this->chatService->releaseChat($id);

        return redirect()->route('agent.chats.index')
            ->with('success', 'Chat released successfully.');
    }
}
