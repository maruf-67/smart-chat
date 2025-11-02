<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Chat;
use App\Models\Message;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin Dashboard Controller
 *
 * Handles display of the admin dashboard overview page.
 * This is a thin controller that only renders the Inertia page.
 * No business logic is performed here - all logic is delegated to services.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class DashboardController
{
    /**
     * Display the admin dashboard.
     *
     * Shows overview metrics and recent activity.
     *
     * @return Response Inertia response with dashboard component
     */
    public function index(): Response
    {
        $stats = [
            'total_chats' => Chat::count(),
            'active_agents' => Chat::whereNotNull('agent_id')->distinct('agent_id')->count('agent_id'),
            'unassigned_chats' => Chat::whereNull('agent_id')->count(),
            'messages_today' => Message::whereDate('created_at', today())->count(),
        ];

        return Inertia::render('admin/dashboard', [
            'title' => 'Admin Dashboard',
            'stats' => $stats,
        ]);
    }
}
