# RBAC Implementation — Quick Reference Card

## The Decision: ✅ Use Your lara-api-starter RBAC System

---

## What You'll Copy (Exact, No Changes)

### 1. **User Model**
```
Relationships:
  ├─ belongsTo(Role)
  └─ hasMany(Chat) - for audit tracking

Traits:
  └─ use Loggable  ← Auto-captures created_by, updated_by, created_ip, updated_ip

Attributes:
  ├─ user_type (enum: admin, agent)
  ├─ role_id (FK → roles)
  └─ audit columns (created_by, updated_by, created_ip, updated_ip)
```

### 2. **Role Model**
```
Schema:
  ├─ name (string)
  ├─ title (string)
  ├─ permissions (JSON array)
  ├─ is_active (boolean)
  └─ audit columns (created_by, updated_by, created_ip, updated_ip)

Key Methods (Copy Exactly):
  ├─ hasPermission($permission) → bool
  ├─ addPermission($permission)
  ├─ removePermission($permission)
  └─ setPermissions(array $perms)

Traits:
  └─ use Loggable
```

### 3. **Loggable Trait**
```
What It Does:
  ├─ Captures Auth::id() → created_by / updated_by
  ├─ Captures Request::ip() → created_ip / updated_ip
  └─ Fires on creating() and updating() events

Zero Manual Code Needed:
  Just add `use Loggable;` to model and it works
```

---

## What You'll Adapt (Chat-Specific)

### Permission Matrix

#### Admin Role
```
'users.view', 'users.create', 'users.edit', 'users.delete'
'roles.manage'
'rules.view', 'rules.create', 'rules.edit', 'rules.delete'
'chats.view_all', 'chats.manage'
'dashboard.access'
```

#### Agent Role
```
'chats.view_assigned'
'chats.respond'
'chats.take_over'
'chats.release'
'rules.view' (read-only)
```

#### Guest Role (API)
```
'messages.send' (rate-limited)
```

### Seeders

Create 3 roles with correct permissions:
- AdminRole
- AgentRole
- GuestRole

---

## Implementation Checklist

### ✅ Phase 1: Database (Migrations)
- [ ] Enhance users: add user_type enum + role_id FK + audit columns
- [ ] Create roles: name, title, permissions (JSON), is_active + audit columns
- [ ] Create roles_users pivot (if many-to-many needed, but start with one-to-one)

### ✅ Phase 2: Models
- [ ] Copy User.php from lara-api-starter
- [ ] Copy Role.php from lara-api-starter
- [ ] Copy Loggable trait from lara-api-starter
- [ ] Add role() relationship to User
- [ ] Add users() relationship to Role

### ✅ Phase 3: Apply Traits
- [ ] Add `use Loggable` to User model
- [ ] Add `use Loggable` to Role model
- [ ] Add `use Loggable` to Chat model
- [ ] Add `use Loggable` to AutoReplyRule model

### ✅ Phase 4: Enums
- [ ] Create app/Enums/Permission.php (or AdminPermission.php, AgentPermission.php)
- [ ] Define constants like CHATS_VIEW_ALL, RULES_MANAGE, etc.

### ✅ Phase 5: Middleware
- [ ] Create EnsureAdmin (check user_type === 'admin')
- [ ] Create EnsureAgent (check user_type === 'agent')
- [ ] Create EnsurePermission (check $user->role->hasPermission($perm))

### ✅ Phase 6: Seeders
- [ ] Create RoleSeeder (Admin, Agent, Guest roles)
- [ ] Create UserSeeder (test admin, test agent)

---

## Key Files to Copy

| File | From lara-api-starter | Action |
|------|------------------------|--------|
| `app/Models/User.php` | ✅ Copy Exact | Use as-is for smart-chat |
| `app/Models/Role.php` | ✅ Copy Exact | Use as-is for smart-chat |
| `app/Traits/Loggable.php` | ✅ Copy Exact | Use as-is for smart-chat |
| `database/migrations/create_roles_table.php` | ✅ Copy + Adapt | Add chat-specific fields if needed |
| `database/migrations/create_users_table.php` | ✅ Copy + Adapt | Keep structure, adapt columns |
| `config/rbac.php` | ✅ Copy + Adapt | Change user_types to ['admin', 'agent'] |

---

## Permission Check Examples

### In Route Middleware
```php
Route::middleware('can:chats.view_all')->get('/admin/chats', ...);
Route::middleware('can:rules.manage')->get('/admin/rules', ...);
```

### In Controller
```php
if (!auth()->user()->role->hasPermission('chats.manage')) {
    abort(403);
}
```

### In Query (Scope Visibility)
```php
if (auth()->user()->user_type === 'agent') {
    $chats = Chat::where('agent_id', auth()->id());
} else {
    $chats = Chat::all();
}
```

### Using Enum (Type-Safe)
```php
if ($user->role->hasPermission(Permission::CHATS_MANAGE)) {
    // Do something
}
```

---

## Why This Is the Right Choice

| Criteria | Score | Reason |
|----------|-------|--------|
| **Speed** | ⭐⭐⭐⭐⭐ | In-memory array check < 1ms |
| **Simplicity** | ⭐⭐⭐⭐⭐ | 2 tables, no complex joins |
| **Code Reuse** | ⭐⭐⭐⭐⭐ | 90% already written in lara-api-starter |
| **Audit Trail** | ⭐⭐⭐⭐⭐ | Loggable trait built-in |
| **Type-Safe** | ⭐⭐⭐⭐⭐ | Enum-based permissions |
| **Scalability** | ⭐⭐⭐⭐ | Works for 20-50 permissions easily |
| **Team Knowledge** | ⭐⭐⭐⭐⭐ | You built it, you know it |

---

## Expected Implementation Time

| Phase | Effort | Notes |
|-------|--------|-------|
| Copy models + trait | 30 min | Paste 3 files |
| Create migrations | 30 min | Add audit columns |
| Create enums | 15 min | Define constants |
| Create middleware | 30 min | 3 simple classes |
| Create seeders | 30 min | Seed roles + users |
| Apply to controllers | 1 hr | Add permission checks |
| **Total** | **~3.5 hours** | Mostly copy-paste + adaptation |

---

## Nothing to Reinvent

✅ User ↔ Role relationship? Done in lara-api-starter  
✅ Permission checking logic? Done in lara-api-starter  
✅ Audit columns auto-population? Done in Loggable trait  
✅ Type-safety via enums? Ready to adopt  
✅ Middleware patterns? Proven approach  

**Just copy, adapt permission names, and you're done.**

---

## Files Created for Reference

1. **docs/planning.md** — Updated with RBAC section
2. **docs/RBAC_IMPLEMENTATION_PLAN.md** — Detailed approach
3. **docs/RBAC_ALTERNATIVES_ANALYSIS.md** — Why this is best

**Read these before coding to stay aligned.**
