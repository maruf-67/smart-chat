<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Role Seeder
 *
 * Seeds the roles table with predefined role definitions including Admin, Agent, and Guest roles.
 * Each role has specific permissions that govern what actions users of that role can perform.
 *
 * **Role Definitions**:
 * - **Admin**: Full system access (manage users, rules, agents, view all chats)
 * - **Agent**: Limited access (view assigned chats, respond to guests, take over/release chats)
 * - **Guest**: Minimal access (send messages to guest chat threads only)
 *
 * **Usage**:
 * ```bash
 * php artisan db:seed --class=RoleSeeder
 * ```
 *
 * @author Smart Chat System
 *
 * @version 1.0.0
 */
class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds Admin, Agent, and Guest roles with their respective permissions.
     * Each role is created with a set of permissions that match its responsibility level.
     */
    public function run(): void
    {
        // Start transaction for atomic operation
        DB::transaction(function (): void {
            // ========== ADMIN ROLE ==========
            // Admin users have complete system access
            Role::updateOrCreate(
                ['name' => 'admin'],
                [
                    'title' => 'Administrator',
                    'permissions' => [
                        // User Management
                        Permission::USERS_VIEW->value,
                        Permission::USERS_CREATE->value,
                        Permission::USERS_EDIT->value,
                        Permission::USERS_DELETE->value,
                        // Role Management
                        Permission::ROLES_MANAGE->value,
                        Permission::ROLES_VIEW->value,
                        // Rules Management
                        Permission::RULES_VIEW->value,
                        Permission::RULES_CREATE->value,
                        Permission::RULES_EDIT->value,
                        Permission::RULES_DELETE->value,
                        // Chat Management
                        Permission::CHATS_VIEW_ALL->value,
                        Permission::CHATS_MANAGE->value,
                        // Message Management
                        Permission::MESSAGES_SEND->value,
                        Permission::MESSAGES_VIEW->value,
                        // Dashboard
                        Permission::DASHBOARD_ACCESS->value,
                    ],
                    'type' => 'admin',
                    'is_active' => true,
                ]
            );

            // ========== AGENT ROLE ==========
            // Agent users can manage assigned chats and view auto-reply rules
            Role::updateOrCreate(
                ['name' => 'agent'],
                [
                    'title' => 'Support Agent',
                    'permissions' => [
                        // Assigned Chats
                        Permission::CHATS_VIEW_ASSIGNED->value,
                        Permission::CHATS_RESPOND->value,
                        Permission::CHATS_TAKE_OVER->value,
                        Permission::CHATS_RELEASE->value,
                        // Rules (Read-only)
                        Permission::RULES_VIEW->value,
                        // Messages
                        Permission::MESSAGES_SEND->value,
                        Permission::MESSAGES_VIEW->value,
                    ],
                    'type' => 'agent',
                    'is_active' => true,
                ]
            );

            // ========== GUEST ROLE ==========
            // Guest users (anonymous) can only send messages to chat threads
            Role::updateOrCreate(
                ['name' => 'guest'],
                [
                    'title' => 'Guest User',
                    'permissions' => [
                        // Limited messaging only
                        Permission::MESSAGES_SEND->value,
                    ],
                    'type' => 'guest',
                    'is_active' => true,
                ]
            );
        });
    }
}
