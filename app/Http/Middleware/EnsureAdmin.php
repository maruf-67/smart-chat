<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensure the authenticated user is an admin.
 *
 * Usage: middleware('admin')
 *
 * @context: Guards routes for admin-only access
 *
 * @pattern: User type-based authorization
 */
class EnsureAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        if (! $user->isAdmin()) {
            abort(403, 'Admin access required');
        }

        return $next($request);
    }
}
