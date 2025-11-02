<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\AutoReplyRule;
use App\Models\User;

/**
 * AutoReplyRulePolicy
 *
 * Authorization policy for auto-reply rule operations.
 * Only admins can create, update, and delete auto-reply rules.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class AutoReplyRulePolicy
{
    /**
     * Determine whether the user can view any auto-reply rules.
     */
    public function viewAny(User $user): bool
    {
        // Only admin can manage auto-reply rules
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can view the auto-reply rule.
     */
    public function view(User $user, AutoReplyRule $autoReplyRule): bool
    {
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can create auto-reply rules.
     */
    public function create(User $user): bool
    {
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can update the auto-reply rule.
     */
    public function update(User $user, AutoReplyRule $autoReplyRule): bool
    {
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can delete the auto-reply rule.
     */
    public function delete(User $user, AutoReplyRule $autoReplyRule): bool
    {
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can restore the auto-reply rule.
     */
    public function restore(User $user, AutoReplyRule $autoReplyRule): bool
    {
        return $user->user_type === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the auto-reply rule.
     */
    public function forceDelete(User $user, AutoReplyRule $autoReplyRule): bool
    {
        return $user->user_type === 'admin';
    }
}
