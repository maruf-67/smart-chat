<?php

declare(strict_types=1);

namespace App\Http\Controllers\Agent;

use App\Services\ChatService;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Agent Dashboard Controller
 *
 * Handles display of the agent dashboard with assigned chats and metrics.
 * This is a thin controller that delegates all business logic to ChatService.
 * Controllers are responsible only for HTTP concerns (request/response, rendering).
 *
 * @author Development Team
 *
 * @version 1.0
 */
class DashboardController
{
    /**
     * ChatService instance for delegated operations.
     */
    public function __construct(private readonly ChatService $chatService) {}

    /**
     * Display the agent dashboard.
     *
     * Shows agent's assigned chats and performance metrics.
     * All query logic is delegated to ChatService.
     *
     * @return Response Inertia response with agent dashboard component
     *
     * @context Agent view of their assigned work queue
     */
    public function index(): Response
    {
        // Get chats assigned to the current agent
        $filters = ['agent_id' => auth()->id()];
        $chats = $this->chatService->getChats($filters);

        return Inertia::render('Agent/Dashboard', [
            'chats' => $chats,
        ]);
    }
}
