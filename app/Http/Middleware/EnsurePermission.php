<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensure the authenticated user has a specific permission.
 *
 * Usage:
 *  - Route: middleware('permission:users.view')
 *  - Multiple: middleware('permission:users.view,users.edit')
 *
 * @context: Guards web route access based on RBAC permission system
 *
 * @pattern: Permission-based authorization via role.hasPermission()
 */
class EnsurePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (! auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        if (! $user->hasPermission($permission)) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
