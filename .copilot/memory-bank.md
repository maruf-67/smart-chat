# Copilot Memory Bank — Smart Chat

**Last Updated**: October 30, 2025  
**Project**: smart-chat (Automated Workflow Chat Management)  
**Status**: Ready for Development  
**Phase**: Backend Core Engine + RBAC Integration

---

## 🤖 MCP Server Requirements (MANDATORY)

**CRITICAL**: Every task must use these MCP servers. This is not optional.

### Required MCP Servers:

1. **Laravel Boost** → app-info, database queries, Artisan commands, debugging
2. **Context7** → Package documentation, API references, version compatibility
3. **Sequential Thinking** → Problem breakdown, solution verification, architectural decisions
4. **Git MCP** → Track changes, commits, branches (if available)

### Workflow for Every Task:

```
1. Use Sequential Thinking → Break down task
2. Use Laravel Boost → Get app context + database info
3. Use Context7 → Get package docs if needed
4. Make changes → Code implementation
5. Update memory-bank.md → Log progress + decisions
6. Update planning.md → If plan changes
```

### Documentation Rules:

- ✅ Update `.copilot/memory-bank.md` after every session (SHORT NOTES ONLY)
- ✅ Update `docs/planning.md` if requirements change
- ❌ **NEVER** create task-based `.md` files or any new `.md` files (unless explicitly approved)
- ✅ Keep only: `planning.md`, `requirement.md`, `RBAC_QUICK_REFERENCE.md`
- ℹ️ **Note**: Memory bank updates are SHORT bullet points for future reference, not detailed documentation

---

## 🎯 Current State

**Phase**: Phase 3 (Backend & Database) (IN PROGRESS)  
**Focus**: Database setup, seed data, React components  
**Blocker**: None  
**Progress**: Database fully migrated + Roles seeded with permissions

### Phase 3 Progress (October 31, 2025):

**Migrations & Data** ✅

- ✅ Fixed duplicate FK constraint error in `2025_10_30_000002_add_rbac_to_users_table` migration
- ✅ Removed redundant FK constraints (roles migration already defines created_by/updated_by FKs)
- ✅ Successfully ran `php artisan migrate:fresh` - all 6 migrations pass
- ✅ Users table verified with all RBAC columns: first_name, last_name, image, phone, otp, status, user_type, role_id, created_by, updated_by, created_ip, updated_ip
- ✅ Ran RoleSeeder - 3 roles created with permissions:
    - Admin: 15 permissions (full system access)
    - Agent: 7 permissions (assigned chats, messaging, rules read-only)
    - Guest: 1 permission (send messages only)
- ✅ Updated UserFactory with RBAC fields (first_name, last_name, phone, user_type, role_id, status)
- ✅ Added admin() and agent() state methods to UserFactory
- ✅ Created UserSeeder with 3 test accounts:
    - admin@test.local (admin role - id 1)
    - agent@test.local (agent role - id 2)
    - guest@test.local (guest role - id 3)
- ✅ All 3 users successfully created and assigned correct roles/permissions
- ✅ Code formatted with `vendor/bin/pint` (35 files, 4 style issues fixed)
- ✅ DashboardTest passes (2/2 assertions - RBAC middleware working)

**Next Steps**:

- [ ] Chat/Message/Rule test data seeding
- [ ] React Pages: Admin Dashboard, Admin Chats, Agent Chats, Chat Thread
- [ ] Feature tests for RBAC workflow and chat creation
- [ ] Real-time updates with Reverb

### Route Optimization (October 31, 2025):

- **Controller Grouping**: Used `Route::controller()` method for each controller group to eliminate repetitive class references
- **Admin Routes**: Chats and Rules controllers grouped with `controller()->prefix()->name()->group()` pattern
- **Agent Routes**: Chat controller grouped with nested route definitions under `chats` prefix
- **Public Routes**: Guest chat access grouped under `chat` prefix
- **Result**: Maximum code reduction with clean, maintainable route definitions using Laravel's controller grouping features

### Phase 2 Completed (Session 8):

- ✅ Fixed RoleSeeder Permission enum names (SCREAMING_SNAKE_CASE)
- ✅ Created 3 models: Chat, Message, AutoReplyRule (with Loggable trait, relationships)
- ✅ Created 3 migrations: chats, messages, auto_reply_rules tables (with FK dependencies)
- ✅ Renamed migrations to proper Laravel format: 2025_10_30_000003, 000004, 000005 (after RBAC)
- ✅ Created ChatService (24 methods: getChats, getChatById, createChat, updateChat, assignAgent, addMessage, etc.)
- ✅ Created RuleService (10 methods: getRules, getRuleById, createRule, updateRule, deleteRule, etc.)
- ✅ Created 5 Controllers: Admin/Dashboard, Admin/Chat, Admin/Rule, Agent/Dashboard, Agent/Chat (thin controllers)
- ✅ Created 3 Form Requests: StoreRuleRequest, UpdateRuleRequest, StoreMessageRequest (validation + messages)
- ✅ Organized routes into routes/web/ folder: admin.php, agent.php, public.php (Laravel best practice)
- ✅ Formatted all files with Pint (14 style issues fixed)
- ✅ **TODO Next**: Run migrations, seed data, create React components

---

## 🏗️ Architecture Identity

### What This IS

- ✅ **Advanced chat workflow system** with agent assignment automation
- ✅ **RBAC-based access control** (borrowed from lara-api-starter)
- ✅ **Event-driven architecture** (MessageReceived, AgentAssigned, AgentUnassigned)
- ✅ **Queued job processing** for auto-reply generation
- ✅ **Real-time updates** via Laravel Reverb (Pusher protocol)
- ✅ **React 19 + Inertia.js v2** admin panel for workflow management

### What This IS NOT

- ❌ NOT a simple chat app (complex workflow state machine)
- ❌ NOT a traditional auth system (No user login/registration initially)
- ❌ NOT a static rule engine (Dynamic, context-aware replies)

### Key Differentiator from Planning Docs

**RBAC Integration**: Unlike the initial planning (static token auth), we're implementing the full RBAC system from lara-api-starter to support:

- **Admin**: Full system control (manage rules, agents, chats)
- **Agent**: Can take over chats, respond to guests
- **Guest**: Anonymous, receives auto-replies

---

## 📋 Core Requirements Overview

### State Machine (The Heart of the System)

| State              | Trigger                           | Action                       | Event Fired     |
| ------------------ | --------------------------------- | ---------------------------- | --------------- |
| **No Agent**       | Guest message, `agent_id` is null | Auto-reply generated + saved | MessageReceived |
| **Agent Active**   | Agent assigned to chat            | Auto-reply DISABLED          | AgentAssigned   |
| **Agent Inactive** | Agent unassigned or 60+ min idle  | Auto-reply RE-ENABLED        | AgentUnassigned |

### Database Entities (To Be Created)

**chats** table:

- `id`, `guest_identifier` (indexed), `agent_id` (nullable FK), `auto_reply_enabled` (bool), `last_activity_at` (timestamp), `timestamps`

**messages** table:

- `id`, `chat_id` (FK), `user_id` (nullable FK), `content` (text), `is_auto_reply` (bool), `sender` (enum: guest|agent|bot), `timestamps`

**auto_reply_rules** table:

- `id`, `keyword` (unique), `reply_message` (text), `created_by` (FK to users), `updated_by` (FK to users), `is_active` (bool), `timestamps`

**users** table (enhanced with RBAC):

- Added: `user_type` (enum: admin|agent), `role_id` (FK to roles)

**roles** table (RBAC):

- `id`, `name`, `title`, `permissions` (JSON array), `type`, `is_active`, `created_by`, `updated_by`, `timestamps`

### User Types (RBAC)

```
┌─ Admin
│  └─ Permissions: manage.users, manage.rules, manage.agents, view.dashboard, view.chats
├─ Agent
│  └─ Permissions: view.chats, respond.to.guest, take.over.chat, release.chat
└─ Guest
   └─ Permissions: send.message (limited rate limit)
```

---

## 🔄 Project Structure

```
smart-chat/
├── app/
│   ├── Actions/                    # Fortify actions
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/              # AdminDashboard, ChatController, RuleController
│   │   │   ├── Agent/              # ChatController (agent takeover)
│   │   │   └── Guest/              # ChatController (send message, get thread)
│   │   ├── Middleware/
│   │   │   └── EnsureAgentOrAdmin.php
│   │   └── Requests/
│   │       ├── StoreChatMessageRequest.php
│   │       ├── StoreAutoReplyRuleRequest.php
│   │       └── UpdateChatRequest.php
│   ├── Models/
│   │   ├── User.php                # With RBAC traits
│   │   ├── Role.php                # With permissions JSON
│   │   ├── Chat.php                # Main workflow entity
│   │   ├── Message.php
│   │   └── AutoReplyRule.php
│   ├── Services/
│   │   ├── ChatService.php         # Core workflow logic
│   │   ├── AutoReplyService.php    # Keyword matching + reply logic
│   │   └── AgentService.php        # Agent assignment logic
│   ├── Events/
│   │   ├── MessageReceived.php
│   │   ├── AgentAssigned.php
│   │   └── AgentUnassigned.php
│   ├── Listeners/
│   │   ├── HandleAutoReply.php     # Queued job
│   │   ├── DisableAutoReply.php
│   │   └── EnableAutoReply.php
│   ├── Traits/
│   │   ├── HasRBAC.php             # From lara-api-starter
│   │   ├── Loggable.php            # Audit logging
│   │   └── Broadcastable.php       # Real-time sync
│   └── Enums/
│       ├── UserType.php            # admin|agent|guest
│       ├── MessageSender.php       # guest|agent|bot
│       └── Permission.php          # Type-safe permissions
├── resources/
│   ├── js/
│   │   ├── Pages/
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Chats.jsx
│   │   │   │   ├── ChatDetail.jsx
│   │   │   │   └── Rules.jsx
│   │   │   ├── Agent/
│   │   │   │   ├── ChatList.jsx
│   │   │   │   └── ChatDetail.jsx
│   │   │   └── Guest/
│   │   │       └── Chat.jsx
│   │   └── Components/
│   │       ├── ChatWindow.jsx
│   │       ├── MessageList.jsx
│   │       └── RuleForm.jsx
│   └── css/
│       └── app.css                 # Tailwind v4 imports
├── tests/
│   ├── Feature/
│   │   ├── ChatWorkflowTest.php    # State machine tests
│   │   ├── AutoReplyTest.php
│   │   ├── RBACTest.php
│   │   └── RealtimeTest.php        # Reverb echo tests
│   └── Unit/
│       ├── AutoReplyServiceTest.php
│       └── ChatServiceTest.php
├── routes/
│   ├── web.php                     # Inertia routes
│   └── events.php                  # Broadcast channels
├── database/
│   ├── migrations/
│   │   ├── create_chats_table.php
│   │   ├── create_messages_table.php
│   │   ├── create_auto_reply_rules_table.php
│   │   └── enhance_users_for_rbac.php
│   ├── factories/
│   │   ├── ChatFactory.php
│   │   ├── MessageFactory.php
│   │   └── AutoReplyRuleFactory.php
│   └── seeders/
│       ├── RoleSeeder.php          # Admin, Agent, Guest roles
│       ├── AutoReplyRuleSeeder.php
│       └── TestChatSeeder.php
├── bootstrap/
│   ├── app.php                     # Middleware, exception handling
│   └── providers.php
├── config/
│   ├── auth.php                    # RBAC + token config
│   ├── chat.php                    # Chat-specific config (timeouts, rate limits)
│   └── rbac.php                    # Role/permission definitions
├── .copilot/
│   ├── memory-bank.md              # This file
│   ├── decisions.md                # Architectural decisions
│   └── patterns.md                 # Code patterns
└── docs/
    ├── planning.md                 # 2-day sprint plan
    ├── requirement.md              # Full requirements
    ├── RBAC_INTEGRATION.md         # How we borrowed from lara-api-starter
    ├── WORKFLOW_STATE_MACHINE.md  # State machine documentation
    ├── API_ENDPOINTS.md            # All routes + auth requirements
    └── development/
        ├── SETUP_GUIDE.md
        ├── EVENT_FLOW.md
        └── TESTING_GUIDE.md
```

---

## 🔐 RBAC System (Borrowed from lara-api-starter)

### Key Differences from Original Planning

**Original Plan**: Simple token-based auth (X-Admin-Token header)  
**Enhanced Plan**: Full RBAC with user types and permission matrices

### Implementation Strategy

**Adapt from lara-api-starter**:

1. Copy RBAC model structure (User + Role with permissions JSON)
2. Adapt Role.php to include chat-specific permissions
3. Create Permission enum for type-safe permission checks
4. Implement HasRBAC trait for User model
5. Create middleware: `EnsureAgentOrAdmin`, `EnsurePermission`

**Permission Matrix**:

```php
// Admin permissions (all granted)
MANAGE_USERS, MANAGE_AGENTS, MANAGE_RULES, VIEW_DASHBOARD, VIEW_ALL_CHATS

// Agent permissions
VIEW_ASSIGNED_CHATS, RESPOND_TO_GUEST, TAKE_OVER_CHAT, RELEASE_CHAT

// Guest permissions (rate-limited)
SEND_MESSAGE (max 5/min), VIEW_OWN_CHAT_THREAD
```

---

## 📝 Recent Progress

### Session 1: Initial Setup (Oct 30, 2025)

- ✅ Reviewed lara-api-starter RBAC implementation
- ✅ Analyzed smart-chat requirements vs planning
- ✅ Designed integrated architecture
- ✅ Created .copilot/ directory with memory-bank, decisions, patterns

---

## 📝 Recent Progress

### Session 1: Initial Setup (Oct 30, 2025)

- ✅ Reviewed lara-api-starter RBAC implementation
- ✅ Analyzed smart-chat requirements vs planning
- ✅ Designed integrated architecture
- ✅ Created .copilot/ directory with memory-bank, decisions, patterns

### Session 2: RBAC Planning & Documentation (Oct 30, 2025)

- ✅ Analyzed audit trail strategy (selective columns + activity log)
- ✅ Reviewed lara-api-starter RBAC system (User + Role + Loggable trait)
- ✅ Compared alternatives (spatie vs your RBAC vs Gates vs Token)
- ✅ **DECISION**: Copy your lara-api-starter RBAC as-is (90% code reuse)
- ✅ **CONFIDENCE**: Very High (proven architecture, zero risk)
- ✅ Created comprehensive planning with RBAC section in docs/
- ✅ Updated `.copilot/memory-bank.md` with planning progress
- ✅ Updated `.github/copilot-instructions.md` with planning progress

### Session 3: Documentation Cleanup & MCP Requirements (Oct 30, 2025)

- ✅ Removed unnecessary RBAC markdown files from /docs
- ✅ Kept only essential docs: planning.md, requirement.md, RBAC_QUICK_REFERENCE.md
- ✅ **MANDATORY RULE**: Added MCP server requirement to copilot-instructions
- ✅ **MANDATORY RULE**: Added "NO ADDITIONAL MD FILES" rule to copilot-instructions
- ✅ Added Sequential Thinking + Context7 + Laravel Boost to every task workflow
- ✅ Updated memory-bank.md with new requirements
- ⏳ **Next**: Begin implementing models, migrations, events system (using MCP servers)

---

## 📊 Tech Stack (Final)

| Layer      | Technology         | Version |
| ---------- | ------------------ | ------- |
| Backend    | Laravel            | 12      |
| PHP        | PHP                | 8.3.26  |
| Auth       | OAuth2 (Passport)  | -       |
| RBAC       | Custom (inherited) | -       |
| DB         | MySQL              | 8.0+    |
| Queue      | Database/Redis     | -       |
| Real-Time  | Laravel Reverb     | -       |
| Frontend   | React              | 19      |
| State      | Inertia.js         | v2      |
| Styling    | Tailwind CSS       | v4      |
| Components | shadcn/ui          | -       |
| Testing    | Pest               | v4      |
| Build      | Vite               | -       |

---

## 📝 Session 7: Architecture Corrected — API Routes → Web Routes (Monolithic)

**Date**: October 30, 2025  
**Task**: Fix architecture - this is a web app with React via Inertia, NOT an API

### What Was Done:

1. ✅ **Deleted routes/api/** - Removed admin.php, agent.php, public.php (API structure)
2. ✅ **Updated middleware** - EnsurePermission/Admin/Agent now use auth() not auth('api')
3. ✅ **Reorganized web.php** - Added role-based groups: /admin/_, /agent/_, /chat/\*
4. ✅ **Routes verified** - 11 routes registered, all with proper middleware stacks
5. ✅ **Pint formatted** - 3 style issues fixed
6. ✅ **Syntax verified** - All PHP files verified (zero errors)

### New Architecture (Monolithic Web):

```
Public: GET / → Welcome (no auth)
Auth: GET /dashboard → Dashboard (any user)

Admin (auth → verified → admin):
  GET /admin, /admin/chats, /admin/chats/{id}
  GET /admin/rules, /admin/rules/create, /admin/rules/{id}/edit
  GET /admin/users

Agent (auth → verified → agent):
  GET /agent, /agent/chats, /agent/chats/{id}

Guest (no auth):
  GET /chat/{guestIdentifier}
```

### Key Changes:

- **Auth**: Session-based (Fortify) not token-based
- **Routing**: web.php only (no routes/api/)
- **Middleware**: auth(), not auth('api')
- **Response**: Inertia pages, not JSON
- **Redirects**: 403 aborts, not JSON responses

### Status:

- ✅ Architecture fixed (monolithic + Inertia)
- ✅ Routes organized by role
- ✅ Middleware adapted for session auth
- ⏳ React components needed
- ⏳ Controllers needed

---

## 🎯 Key Checkpoints (To Be Completed)

- [x] **Phase 1**: Database schema (models, migrations, factories) — RBAC done
- [x] **Phase 2**: Middleware structure — Web-based, role gates done
- [ ] **Phase 3**: RoleSeeder + Chat/Message/AutoReplyRule models
- [ ] **Phase 4**: Controllers (Dashboard, Chat, Rules CRUD)
- [ ] **Phase 5**: React components + Inertia pages
- [ ] **Phase 6**: Real-time updates (Reverb)
- [ ] **Phase 7**: Tests (workflow, RBAC, auth)
- [ ] **Phase 8**: Admin panel + Agent panel fully functional

---

## 📚 Related Files

- **Planning**: `/docs/planning.md`
- **Requirements**: `/docs/requirement.md`
- **Decisions**: `.copilot/decisions.md`
- **Patterns**: `.copilot/patterns.md` (follow for code style)
- **lara-api-starter Reference**: `/var/www/laravel/laravel-modular/lara-api-starter/` (RBAC only)

---

## 🚀 Development Commands (Ready to Use)

```bash
# Setup
composer install
php artisan key:generate
php artisan migrate
php artisan passport:install
php artisan db:seed

# Development
php artisan serve
npm run dev
php artisan queue:listen

# Testing
php artisan test
php artisan test --filter=ChatWorkflowTest
php artisan pest

# Broadcasting
php artisan reverb:start

# Admin panel
# Visit: http://localhost:8000/admin
```

---

## ⚠️ Critical Decisions Made

See `.copilot/decisions.md` for full architectural decisions.

**Summary**:

1. ✅ RBAC system inherited from lara-api-starter
2. ✅ Event-driven architecture for workflow
3. ✅ Queued jobs for auto-reply processing
4. ✅ Real-time via Reverb (not polling)
5. ✅ Policy-based authorization (not just middleware)
6. ✅ Strict type hints + PHPDoc on all code

---

## 📝 Session 4: RBAC Implementation — Migrations & Models Complete

**Date**: October 30, 2025  
**Duration**: ~30 min  
**Task**: Create database migrations and models for RBAC system

### What Was Done:

1. ✅ **Created migration**: `add_rbac_to_users_table` - Added user_type enum, role_id FK, audit columns
2. ✅ **Created migration**: `create_roles_table` - New roles table with permissions JSON
3. ✅ **Created Loggable trait**: Auto-captures created_by, updated_by, created_ip, updated_ip
4. ✅ **Updated User model**: Added Loggable trait, role relationship, permission checks
5. ✅ **Created Role model**: Full RBAC model with permission methods (hasPermission, addPermission, etc.)
6. ✅ **Created Permission enum**: Type-safe permission constants (18 permissions defined)
7. ✅ **Pint formatted**: All 7 files fixed (3 style issues)

### Files Created/Modified:

```
database/migrations/2025_10_30_000001_add_rbac_to_users_table.php ✅ NEW
database/migrations/2025_10_30_000002_create_roles_table.php ✅ NEW
app/Traits/Loggable.php ✅ NEW
app/Models/User.php ✅ UPDATED (with Loggable, role relationship)
app/Models/Role.php ✅ NEW (with permission methods)
app/Enums/Permission.php ✅ NEW (18 type-safe permission constants)
```

### Key Implementation Details:

- **User model**: Added Loggable trait, belongsTo(Role), hasPermission(), isAdmin(), isAgent() methods
- **Role model**: Implements hasPermission(), addPermission(), removePermission(), setPermissions()
- **Audit columns**: created_by, updated_by, created_ip, updated_ip on both users and roles tables
- **Permissions JSON**: Stored as JSON array in roles.permissions, parsed on access
- **Enums used**: Strict types declared on all files, proper return types on all methods

### Next Steps:

1. Create role seeder with Admin, Agent, Guest roles + permissions
2. Create middleware for permission checks (EnsureAdmin, EnsureAgent, EnsurePermission)
3. Apply Loggable trait to Chat, AutoReplyRule, Message models
4. Create tests for RBAC system
5. Integrate permission checks into controllers

### Status:

- ✅ Core RBAC infrastructure ready
- ⏳ Seeders needed
- ⏳ Middleware needed
- ⏳ Controllers integration pending

---

## 📝 Session 5: Migration Refinement — Full lara-api-starter Schema + Proper Ordering

**Date**: October 30, 2025  
**Duration**: ~20 min  
**Task**: Reorder migrations and enhance user schema to match lara-api-starter exactly

### What Was Done:

1. ✅ **Reordered migrations**: Roles table now created FIRST (000001) before users enhancement (000002)
2. ✅ **Enhanced user schema**: Added first_name, last_name, image, phone, status, otp, otp_expires_at
3. ✅ **Fixed FK constraints**: Roles FK constraints now added in second migration after users exists
4. ✅ **Updated User model**: Added all new fields to fillable + proper casts
5. ✅ **Pint formatted**: All files checked and fixed

### Migration Order (CORRECT):

```
000001_create_roles_table.php         ← Create roles FIRST (no FK constraints yet)
000002_add_rbac_to_users_table.php    ← Enhance users with RBAC + FK to roles
                                      ← Add FK constraints to roles table in same migration
```

### User Table Schema (Now Matches lara-api-starter):

```
id, name, first_name, last_name, image, email, email_verified_at, password,
phone, phone_verified_at, otp, otp_expires_at, status, user_type, role_id,
created_by, updated_by, created_ip, updated_ip, two_factor_* (Fortify),
remember_token, timestamps, soft_deletes (if used)
```

### Role Table Schema (Unchanged - Correct):

```
id, name, title, permissions (JSON), type, is_active,
created_by, updated_by, created_ip, updated_ip, timestamps
```

### Files Modified:

```
database/migrations/2025_10_30_000001_create_roles_table.php ✅ NEW (FIRST)
database/migrations/2025_10_30_000002_add_rbac_to_users_table.php ✅ NEW (SECOND)
app/Models/User.php ✅ UPDATED (fillable + casts with all new fields)
```

### Key Changes:

- Added `first_name`, `last_name` as separate fields (not just `name`)
- Added `image` for profile picture URL
- Added `phone`, `phone_verified_at` for SMS integration
- Added `otp`, `otp_expires_at` for OTP verification (nullable)
- Added `status` (boolean) for user activation/deactivation
- **Important**: Roles FK constraints deferred to second migration (no circular dependency)

### Next Steps:

1. Create seeders (RoleSeeder with Admin, Agent roles)
2. Create Chat, Message, AutoReplyRule migrations with Loggable trait
3. Create middleware for permission checks
4. Begin integrating into controllers

## 📝 Session 5: Migration Refinement — Full lara-api-starter Schema + Proper Ordering

**Date**: October 30, 2025  
**Duration**: ~20 min  
**Task**: Reorder migrations and enhance user schema to match lara-api-starter exactly

### What Was Done:

1. ✅ **Reordered migrations**: Roles table now created FIRST (000001) before users enhancement (000002)
2. ✅ **Enhanced user schema**: Added first_name, last_name, image, phone, status, otp, otp_expires_at
3. ✅ **Fixed FK constraints**: Roles FK constraints now added in second migration after users exists
4. ✅ **Updated User model**: Added all new fields to fillable + proper casts
5. ✅ **Pint formatted**: All files checked and fixed

### Migration Order (CORRECT):

```
000001_create_roles_table.php         ← Create roles FIRST (no FK constraints yet)
000002_add_rbac_to_users_table.php    ← Enhance users with RBAC + FK to roles
                                      ← Add FK constraints to roles table in same migration
```

### User Table Schema (Now Matches lara-api-starter):

```
id, first_name, last_name, image, email, email_verified_at, password,
phone, phone_verified_at, otp, otp_expires_at, status, user_type, role_id,
created_by, updated_by, created_ip, updated_ip, two_factor_* (Fortify),
remember_token, timestamps
```

### Role Table Schema (Unchanged - Correct):

```
id, name, title, permissions (JSON), type, is_active,
created_by, updated_by, created_ip, updated_ip, timestamps
```

### Files Modified:

```
database/migrations/2025_10_30_000001_create_roles_table.php ✅ NEW (FIRST)
database/migrations/2025_10_30_000002_add_rbac_to_users_table.php ✅ NEW (SECOND)
app/Models/User.php ✅ UPDATED (fillable + casts with all new fields)
```

### Key Changes:

- Added `first_name`, `last_name` as separate fields (not just `name`)
- Added `image` for profile picture URL
- Added `phone`, `phone_verified_at` for SMS integration
- Added `otp`, `otp_expires_at` for OTP verification (nullable)
- Added `status` (boolean) for user activation/deactivation
- **Important**: Roles FK constraints deferred to second migration (no circular dependency)

### Next Steps:

1. Create seeders (RoleSeeder with Admin, Agent roles)
2. Create Chat, Message, AutoReplyRule migrations with Loggable trait
3. Create middleware for permission checks
4. Begin integrating into controllers

### Status:

- ✅ RBAC system complete and ordered correctly
- ✅ User schema matches lara-api-starter exactly
- ⏳ Chat/Message/Rules tables needed
- ⏳ Seeders needed
- ⏳ Controllers & tests pending

---

## 📝 Session 6: Comprehensive Backend Architecture — Middleware + Routes + Patterns

**Date**: October 30, 2025  
**Duration**: ~45 min  
**Task**: Complete architecture setup with middleware, route organization, image optimization, and coding patterns

### What Was Done:

1. ✅ **Removed name field from migration** - Now only first_name, last_name in DB
2. ✅ **Added name accessor to User model** - Computed dynamically as first_name + ' ' + last_name
3. ✅ **Created ImageOptimizable trait** - Image storage/retrieval methods (getImageUrl, storeImageFile, deleteImageFile)
4. ✅ **Added ImageOptimizable to User model** - User can manage profile images
5. ✅ **Created route file structure**:
    - `routes/api/admin.php` - Admin-only endpoints (middleware: auth:api, permission:admin.access)
    - `routes/api/agent.php` - Agent-only endpoints (middleware: auth:api, permission:agent.access)
    - `routes/api/public.php` - Guest/public endpoints (middleware: throttle:5,1)
6. ✅ **Created 3 middleware classes**:
    - `EnsurePermission` - Permission-based access control (parameter: permission name)
    - `EnsureAdmin` - Admin user type check
    - `EnsureAgent` - Agent user type check
7. ✅ **Registered middleware in bootstrap/app.php** - Alias: permission, admin, agent
8. ✅ **Updated routing config** - Added api route to bootstrap/app.php
9. ✅ **Created .github/patterns.md** - 15 coding patterns documented:
    - Strict types & return types
    - PHPDoc blocks on public methods
    - Constructor property promotion
    - Trait-based functionality
    - Eloquent relationships with return types
    - RBAC permission checks
    - Database transactions
    - Eloquent accessors
    - Route organization
    - Middleware stacking
    - JSON responses
    - Pest feature tests
    - Factory custom states
    - Migration patterns
    - Config file patterns
10. ✅ **Updated copilot-instructions.md** - Added reference to patterns.md

### Files Created:

```
routes/api/admin.php ✅ Admin API routes
routes/api/agent.php ✅ Agent API routes
routes/api/public.php ✅ Public/guest API routes
app/Http/Middleware/EnsurePermission.php ✅ Permission middleware
app/Http/Middleware/EnsureAdmin.php ✅ Admin user type middleware
app/Http/Middleware/EnsureAgent.php ✅ Agent user type middleware
app/Traits/ImageOptimizable.php ✅ Image management trait
.github/patterns.md ✅ 15 coding patterns documented
```

### Files Modified:

```
app/Models/User.php ✅ (removed name from fillable, added ImageOptimizable trait)
database/migrations/2025_10_30_000002_add_rbac_to_users_table.php ✅ (removed name field addition)
bootstrap/app.php ✅ (added api routing, registered middleware aliases)
.github/copilot-instructions.md ✅ (added patterns.md reference)
```

### Key Implementation Details:

- **Name Accessor**: `$user->name` returns computed "first_name last_name" (no DB column)
- **ImageOptimizable**: Provides getImageUrl(), storeImageFile(), deleteImageFile() methods
- **Middleware Stacking**: Permission → Admin/Agent → Specific routes
- **Route Organization**: Separate files by auth requirements (admin/agent/public) with optimized controller grouping for reduced code and easier integration
- **Patterns Documentation**: 15 patterns with examples and "why" explanations
- **Code Quality**: Pint formatted all files (6 style issues fixed), syntax verified ✓

### Architecture Now:

```
API Structure:
/api/admin/*        ← Admin-only (auth:api + permission:admin.access)
/api/agent/*        ← Agent-only (auth:api + permission:agent.access)
/api/public/*       ← Guest (throttle:5,1)

Middleware Stack:
middleware('auth:api', 'permission:users.view', 'admin')
        ↓
auth:api        (OAuth2 token validation)
        ↓
permission      (Role-based permission check)
        ↓
admin           (User type = admin)
        ↓
Route Handler
```

### Route Examples (Ready to Implement):

```php
// Admin routes
Route::middleware(['auth:api', 'permission:admin.access'])->prefix('admin')->group(function(): void {
    Route::resource('chats', ChatController::class);
    Route::resource('rules', RuleController::class);
    Route::resource('users', UserController::class);
});

// Agent routes
Route::middleware(['auth:api', 'permission:agent.access'])->prefix('agent')->group(function(): void {
    Route::get('chats', [AgentChatController::class, 'index']);
    Route::post('chats/{chat}/take-over', [AgentChatController::class, 'takeOver']);
});

// Public routes
Route::prefix('public')->middleware('throttle:5,1')->group(function(): void {
    Route::get('chats/{guest_identifier}', [GuestChatController::class, 'show']);
    Route::post('chats/{guest_identifier}/messages', [GuestChatController::class, 'sendMessage']);
});
```

### Patterns Documented:

1. Strict types & return types
2. PHPDoc blocks (@param, @return, @throws, @context, @pattern)
3. Constructor property promotion
4. Trait-based functionality
5. Eloquent relationships with types
6. RBAC permission checks
7. Database transactions
8. Eloquent accessors (#[Attribute])
9. Route file structure
10. Middleware organization
11. JSON responses (BaseController)
12. Pest feature tests
13. Factory custom states
14. Migration dependency order
15. Config file patterns (env → config → code)

### Status:

- ✅ Complete RBAC architecture implemented
- ✅ User schema optimized (no redundant name field)
- ✅ Image management integrated
- ✅ Route structure organized by auth level
- ✅ Middleware stack implemented
- ✅ Coding patterns documented (15 patterns)
- ✅ Code formatted and syntax verified
- ⏳ Next: Create seeders (RoleSeeder, UserSeeder)
- ⏳ Next: Create Chat/Message/Rule models with Loggable trait
- ⏳ Next: Implement controllers and tests
