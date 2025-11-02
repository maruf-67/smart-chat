<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensure the authenticated user is an agent.
 *
 * Usage: middleware('agent')
 *
 * @context: Guards routes for agent-only access
 *
 * @pattern: User type-based authorization
 */
class EnsureAgent
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

        if (! $user->isAgent()) {
            abort(403, 'Agent access required');
        }

        return $next($request);
    }
}
