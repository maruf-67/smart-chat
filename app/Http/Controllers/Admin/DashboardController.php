<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

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
     * Currently renders a basic dashboard template.
     *
     * @return Response Inertia response with dashboard component
     */
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'title' => 'Admin Dashboard',
        ]);
    }
}
