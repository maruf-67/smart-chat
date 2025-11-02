# Smart Auto-Reply Chat — 2-Day Sprint Plan

A focused plan to ship an automated chat with **full RBAC system** (borrowed from lara-api-starter). Authentication uses Laravel Fortify + Passport OAuth2.

## Stack

- Backend: Laravel 12
- Frontend: React 19 + Inertia.js v2
- Styling: Tailwind CSS v4 + shadcn/ui
- Real-Time: Laravel Reverb (Pusher protocol)
- Testing: Pest v4
- Auth: Laravel Fortify (login) + Passport OAuth2 (API tokens)
- RBAC: Custom (User + Role with JSON permissions array)

## User Model (With RBAC)

### Three User Types
1. **Admin** (`user_type='admin'`)
   - Full system control (manage rules, agents, chats, users)
   - Via web UI (Inertia) after login

2. **Agent** (`user_type='agent'`)
   - Can take over chats, respond to guests, view assigned chats
   - Via web UI (Inertia) after login

3. **Guest** (Anonymous)
   - Identified by `guest_identifier` string in chats table
   - Receives auto-replies via REST API (no auth needed)

### Authentication
- **Web**: Fortify login → creates session → Inertia UI
- **API**: OAuth2 Passport tokens (for programmatic access, optional)
- **Guests**: No auth required (identified by guest_identifier)

---

## Day 1 — Core Engine (Backend Focus)

Goal: Fully functional automated reply engine with events, queues, and a minimal authorization gate (no auth).

### 1) Setup & Scaffolding (≈1.5h)

- Create project and configure database (.env).
- Install and configure:
    - Inertia.js (Laravel adapter + React v19)
    - Tailwind CSS v4 (import "tailwindcss";)
    - shadcn/ui initialized to resources/js/Components (or your existing convention)
- Run npm install and a dev/build to verify the frontend pipeline.

### 2) Database & Models (≈1.5h)

Migrations:

- chats
    - id
    - guest_identifier string, index
    - auto_reply_enabled boolean default true
    - taken_over_by_authorized boolean default false
    - last_activity_at timestamp nullable
    - timestamps
- messages
    - id
    - chat_id foreignId -> constrained()
    - content text
    - sender enum('guest','bot','authorized')
    - timestamps
- auto_reply_rules
    - id
    - keyword string unique
    - reply_message text
    - timestamps

Models and relationships:

Note: No users/roles tables. We keep the system anonymous and token-gated.

### 3) Authorization (Token Middleware) (≈0.5h)

Create middleware EnsureAuthorized:

- Read header X-Admin-Token.
- Compare to config('auth.admin_token') or similar.
- If mismatch, abort(403).

Apply to all /admin routes.

### 4) Core Workflow: Events, Queues, Smart Reply (≈4h)

- Enable queues (e.g., QUEUE_CONNECTION=database). Create jobs table and migrate. Run queue worker.
- Events
    - MessageReceived (Chat $chat, string $content, string $guestIdentifier)
    - OperatorTookOver (Chat $chat)
    - OperatorReleased (Chat $chat)
- Service
    - SmartReplyService::findReply(string $content): ?string
        - Query auto_reply_rules using basic LIKE matching on keyword.
- Listeners (queued where appropriate)
    - HandleAutoReply (on MessageReceived)
        - Guard: if $chat->taken_over_by_authorized || !$chat->auto_reply_enabled → return
        - If SmartReplyService returns a reply, create Message with sender='bot'
    - DisableAutoReply (on OperatorTookOver)
        - $chat->update(['auto_reply_enabled' => false])
    - EnableAutoReply (on OperatorReleased)
        - $chat->update(['auto_reply_enabled' => true])

### 5) Basic Test Endpoint (≈1h)

- Simple controller route:
    - Upsert/find Chat by guest_identifier.
    - Create a guest message (sender='guest').
    - Fire MessageReceived.
- Run queue worker and verify bot replies are created.
- Fire OperatorTookOver / OperatorReleased and verify flags.

---

## Day 2 — Admin Panel (React + Inertia) and Real-Time

Goal: Minimal admin panel for an “authorized user” (via token) to observe/take over chats and manage rules. No auth.

### 1) Real-Time with Reverb (≈1h)

- Install and configure Reverb; keep BROADCAST_DRIVER=pusher (Reverb uses Pusher protocol).
- Create NewMessage event implementing ShouldBroadcast.
- Dispatch NewMessage for:
    - Guest messages (on inbound)
    - Bot messages (in HandleAutoReply)
- Inertia/React: enable Echo in resources/js/bootstrap.js and subscribe to private channel chat.{id}.

### 2) Admin Panel (≈4h)

Routes (web.php):

- Group under /admin protected by EnsureAuthorized middleware.

Controllers:

- Admin/DashboardController
    - Return chats with latest activity and flags.
- Admin/ChatController
    - takeOver(Chat): sets taken_over_by_authorized=true and fires OperatorTookOver
    - release(Chat): sets taken_over_by_authorized=false and fires OperatorReleased
    - toggleAutoReply(Chat): flips auto_reply_enabled
- Admin/AutoReplyRuleController
    - CRUD for auto_reply_rules

Pages:

- Admin/Dashboard.jsx
    - List chats using shadcn/ui Table
    - Badge: “Bot Active” or “Taken Over”
    - Link to ChatShow
- Admin/ChatShow.jsx
    - Render messages stream
    - Echo subscription: Echo.private(`chat.${chat.id}`).listen('NewMessage', ...)
    - Actions:
        - “Take Over” / “Release” buttons
        - “Auto-Reply Enabled” switch
    - Wire with Inertia.post/put to ChatController

### 3) Rule Manager (≈1.5h)

- Admin/Rules.jsx
    - shadcn/ui Table for listing
    - shadcn/ui Dialog for create/edit (Input + Textarea)
    - Delete with confirmation
    - Inertia-based forms

### 4) Tests and Polish (≈1.5h)

- Pest tests:
    - HandleAutoReply happy path and guard paths
    - EnsureAuthorized middleware (403 on bad/missing token; pass with correct token)
- Optional:
    - Scheduled command to mark/archive idle chats
    - Basic README

---

---

## RBAC Implementation Plan (Copied from lara-api-starter)

### 1. **Core Structure (No Custom Variation Needed)**

| Component | Approach | Why It Works |
|-----------|----------|-------------|
| **User Model** | `user_type` enum + `role_id` FK | Type-safe access control + role-based permissions |
| **Role Model** | `permissions` JSON array + helper methods | Flexible permission assignment without extra tables |
| **Permissions** | String keys like `'chats.view'`, `'rules.manage'` | Simple, queryable, cacheable |
| **Audit Columns** | `created_by`, `updated_by`, `created_ip`, `updated_ip` on User + Role (+ Chat/Rules) | Complete audit trail (see previous section) |
| **Loggable Trait** | Auto-populate audit columns via `bootLoggable()` | Zero manual overhead |

### 2. **Permission Matrix (Chat-Specific)**

```
ADMIN:
├─ users.view
├─ users.create
├─ users.edit
├─ users.delete
├─ roles.manage
├─ rules.view
├─ rules.create
├─ rules.edit
├─ rules.delete
├─ chats.view_all
├─ chats.manage (assign/unassign agents, toggle bot)
└─ dashboard.access

AGENT:
├─ chats.view_assigned (only own chats)
├─ chats.respond_to_guest
├─ chats.take_over
├─ chats.release
└─ rules.view (read-only)

GUEST:
└─ messages.send (rate-limited)
```

### 3. **Database Migration Strategy**

**Adapt lara-api-starter exactly:**
- `users` table: id, name, email, password, user_type (enum), role_id (FK), created_by, updated_by, created_ip, updated_ip
- `roles` table: id, name, title, permissions (JSON), is_active, created_by, updated_by, created_ip, updated_ip
- `chats` table: + created_by, updated_by, created_ip, updated_ip (for state changes)
- `auto_reply_rules` table: + created_by, updated_by, created_ip, updated_ip (for admin audit)

### 4. **Implementation (3 Clean Steps)**

#### Step 1: Enhance Users Migration
- Add `user_type` enum (admin, agent)
- Add `role_id` foreign key to roles
- Add audit columns (created_by, updated_by, created_ip, updated_ip)
- Foreign keys point to users table

#### Step 2: Create Roles Table
- Copy exact structure from lara-api-starter
- Columns: name, title, permissions (JSON), is_active, created_by, updated_by, created_ip, updated_ip
- Seeder: Create "Admin", "Agent" roles with correct permissions

#### Step 3: Update Models + Traits
- **User model**: Add role() relationship, use Loggable trait
- **Role model**: Add users() relationship, use Loggable trait, keep permission helper methods (hasPermission, addPermission, removePermission, setPermissions)
- **Chat model**: Use Loggable trait (auto-captures who changed agent_id, who toggled bot)
- **AutoReplyRule model**: Use Loggable trait (auto-captures admin changes)

### 5. **Authorization Strategy (No Middleware Bloat)**

**NOT using spatie/permission or Laravel's built-in gates heavily.** Instead:

- **Route-level**: Middleware `can:permission` on route groups
  ```
  Route::middleware('can:chats.view_all')->group(...)
  Route::middleware('can:rules.manage')->group(...)
  ```

- **Controller-level**: Early return or policy check
  ```php
  if (!auth()->user()->role->hasPermission('chats.manage')) {
      abort(403);
  }
  ```

- **Query-level**: Scope visibility by user type
  ```php
  if (auth()->user()->user_type === 'agent') {
      $chats = Chat::where('agent_id', auth()->id());
  }
  ```

**Why this is better than alternatives:**
- ✅ No extra packages (spatie bloat)
- ✅ JSON permissions are cacheable (Redis)
- ✅ No separate permission table join overhead
- ✅ Type-safe via Enum constants
- ✅ Easy to audit (permissions array is human-readable)
- ✅ Already proven in lara-api-starter

### 6. **Config File (config/rbac.php)**

Copy structure from lara-api-starter:
- `user_types`: ['admin', 'agent']
- `route_access`: Maps route prefixes to allowed types
- `default_type`: 'agent'
- `admin_type`: 'admin'
- `permission_separator`: '.'
- `role_caching`: true (enable Redis caching)

### 7. **Enum for Type-Safe Permissions**

Create `app/Enums/Permission.php`:
```
AdminPermission::USERS_VIEW = 'users.view'
AdminPermission::USERS_CREATE = 'users.create'
AdminPermission::RULES_MANAGE = 'rules.manage'
AdminPermission::CHATS_VIEW_ALL = 'chats.view_all'

AgentPermission::CHATS_VIEW_ASSIGNED = 'chats.view_assigned'
AgentPermission::CHATS_TAKE_OVER = 'chats.take_over'
```

**Why**: Eliminates string typos, provides IDE autocomplete, enforces consistency.

### 8. **Seeding Strategy**

Seeder creates:
- **Admin role** with all permissions
- **Agent role** with limited permissions (chats, rules read-only)
- **Guest role** (minimal, mostly used for API access control)

Plus seed 2-3 test users (1 admin, 1 agent) for manual testing.

### 9. **Why NO Custom Variation?**

Your lara-api-starter RBAC is **production-grade**:
- ✅ Proven in real API projects
- ✅ Simple JSON approach vs complex permission tables
- ✅ Built for Laravel 12 patterns
- ✅ Already has audit columns + Loggable trait
- ✅ No over-engineering

**The only adaptation**: Add chat-specific permissions + roles for Guest (if needed for REST API rate-limiting).

### 10. **Testing RBAC**

- Test: Admin can manage rules ✓
- Test: Agent can only see own chats ✓
- Test: Guest gets 403 on protected routes ✓
- Test: Permission checks return false for inactive roles ✓
- Test: Audit columns populate correctly ✓

---

## Notes

- If frontend changes aren't visible, run: npm run dev or npm run build.
- Chat: hasMany(Message)
- Message: belongsTo(Chat)
- User: belongsTo(Role)
- Role: hasMany(User)
