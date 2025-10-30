<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Permission constants for the chat system.
 *
 * Permissions are organized by feature/resource.
 * Use these enums to ensure type-safe permission checks throughout the application.
 *
 * @pattern Use in role seeding, permission checks, and authorization policies
 */
enum Permission: string
{
    // ====== USER PERMISSIONS ======
    case USERS_VIEW = 'users.view';
    case USERS_CREATE = 'users.create';
    case USERS_EDIT = 'users.edit';
    case USERS_DELETE = 'users.delete';

    // ====== ROLE MANAGEMENT ======
    case ROLES_MANAGE = 'roles.manage';
    case ROLES_VIEW = 'roles.view';

    // ====== AUTO REPLY RULES ======
    case RULES_VIEW = 'rules.view';
    case RULES_CREATE = 'rules.create';
    case RULES_EDIT = 'rules.edit';
    case RULES_DELETE = 'rules.delete';

    // ====== CHAT MANAGEMENT ======
    case CHATS_VIEW_ALL = 'chats.view_all';
    case CHATS_VIEW_ASSIGNED = 'chats.view_assigned';
    case CHATS_RESPOND = 'chats.respond';
    case CHATS_TAKE_OVER = 'chats.take_over';
    case CHATS_RELEASE = 'chats.release';
    case CHATS_MANAGE = 'chats.manage';

    // ====== MESSAGE PERMISSIONS ======
    case MESSAGES_SEND = 'messages.send';
    case MESSAGES_VIEW = 'messages.view';

    // ====== DASHBOARD ======
    case DASHBOARD_ACCESS = 'dashboard.access';

    /**
     * Get the string value of the permission.
     */
    public function value(): string
    {
        return $this->value;
    }

    /**
     * Get a human-readable label for the permission.
     */
    public function label(): string
    {
        return match ($this) {
            self::USERS_VIEW => 'View Users',
            self::USERS_CREATE => 'Create Users',
            self::USERS_EDIT => 'Edit Users',
            self::USERS_DELETE => 'Delete Users',

            self::ROLES_MANAGE => 'Manage Roles',
            self::ROLES_VIEW => 'View Roles',

            self::RULES_VIEW => 'View Auto Reply Rules',
            self::RULES_CREATE => 'Create Auto Reply Rules',
            self::RULES_EDIT => 'Edit Auto Reply Rules',
            self::RULES_DELETE => 'Delete Auto Reply Rules',

            self::CHATS_VIEW_ALL => 'View All Chats',
            self::CHATS_VIEW_ASSIGNED => 'View Assigned Chats',
            self::CHATS_RESPOND => 'Respond to Chats',
            self::CHATS_TAKE_OVER => 'Take Over Chats',
            self::CHATS_RELEASE => 'Release Chats',
            self::CHATS_MANAGE => 'Manage Chats',

            self::MESSAGES_SEND => 'Send Messages',
            self::MESSAGES_VIEW => 'View Messages',

            self::DASHBOARD_ACCESS => 'Access Dashboard',
        };
    }
}
