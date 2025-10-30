# Smart Chat - Quick Start Guide

## Architecture at a Glance

**smart-chat** is a **monolithic web application** (not an API):

```
User Login → Fortify Session → Laravel + React (Inertia) → Pages
```

## Key URLs

| URL | Auth | Purpose |
|-----|------|---------|
| `/` | None | Welcome page |
| `/login` | None | Login page (Fortify) |
| `/dashboard` | Fortify | User dashboard |
| `/admin` | Fortify + Admin | Admin dashboard |
| `/admin/chats` | Fortify + Admin | Manage all chats |
| `/admin/rules` | Fortify + Admin | Manage auto-reply rules |
| `/agent` | Fortify + Agent | Agent dashboard |
| `/agent/chats` | Fortify + Agent | View assigned chats |
| `/chat/{id}` | None | Guest chat (no login) |

## Middleware Stack

All routes follow this pattern:

```php
// Example: Admin routes
Route::middleware(['auth', 'verified', 'admin'])->group(...);

// auth        → Fortify session auth
// verified    → Fortify email verification
// admin       → Custom middleware (checks user_type == 'admin')
```

## Authentication Flow

### For Web Users (Admin/Agent):
```
1. POST /login (Fortify) with email + password
2. Session created + verified
3. Redirected to /dashboard or /admin or /agent
4. Middleware checks: auth() → verified → admin/agent
```

### For Guests:
```
1. No login needed
2. GET /chat/{guestIdentifier}
3. No auth required
4. Can send messages (rate-limited)
```

## Key Models & RBAC

```php
// User has one Role
$user->role()                    // Get user's role
$user->hasPermission('key')      // Check permission
$user->isAdmin()                 // Check if admin
$user->isAgent()                 // Check if agent

// Role has permissions
$role->hasPermission('key')      // Check if role has permission
$role->permissions              // Array of permission strings
```

## Permissions Matrix

**Admin permissions:** All (users.*, rules.*, chats.*, dashboard.access)
**Agent permissions:** chats.view_assigned, chats.respond, chats.take_over, chats.release, rules.view
**Guest permissions:** messages.send (rate-limited)

## Controllers Pattern

All controllers return **Inertia pages**, NOT JSON:

```php
namespace App\Http\Controllers\Admin;

class ChatController
{
    public function index()
    {
        return Inertia::render('Admin/Chats', [
            'chats' => Chat::with('messages')->get(),
        ]);
    }
}
```

## React Components Location

```
resources/js/Pages/
├── Admin/
│   ├── Dashboard.jsx
│   ├── Chats.jsx
│   ├── ChatShow.jsx
│   ├── Rules.jsx
│   └── Users.jsx
├── Agent/
│   ├── Dashboard.jsx
│   ├── Chats.jsx
│   └── ChatShow.jsx
├── Chat/
│   └── Thread.jsx
└── ...
```

## Development Commands

```bash
# Start development
php artisan serve      # Backend
npm run dev            # Frontend + Vite

# Create new component
touch resources/js/Pages/Admin/NewPage.jsx

# Run tests
php artisan test

# Format code
vendor/bin/pint --dirty

# Clear caches
php artisan optimize:clear
```

## Common Routes

```php
// Admin routes
Route::get('/admin', 'Admin\DashboardController@index')->name('admin.dashboard');
Route::resource('/admin/chats', 'Admin\ChatController');
Route::resource('/admin/rules', 'Admin\RuleController');

// Agent routes
Route::get('/agent', 'Agent\DashboardController@index')->name('agent.dashboard');
Route::get('/agent/chats', 'Agent\ChatController@index')->name('agent.chats.index');

// Guest routes (no auth)
Route::get('/chat/{guestIdentifier}', 'Guest\ChatController@show')->name('chat.show');
```

## Important Files

- **Routes**: `routes/web.php` (all routes here, organized by role)
- **Models**: `app/Models/` (User, Role, Chat, Message, AutoReplyRule)
- **Middleware**: `app/Http/Middleware/` (EnsureAdmin, EnsureAgent, EnsurePermission)
- **Traits**: `app/Traits/` (Loggable for audit columns, ImageOptimizable for images)
- **Patterns**: `.github/patterns.md` (15 coding patterns - follow these!)
- **RBAC Docs**: `.github/WEB_VS_API.md` (web vs API comparison)

## Workflow

1. **Plan** with Sequential Thinking MCP
2. **Get app info** with Laravel Boost MCP
3. **Get docs** with Context7 MCP
4. **Write code** following `.github/patterns.md`
5. **Format** with `vendor/bin/pint --dirty`
6. **Test** with `php artisan test`
7. **Update** `.copilot/memory-bank.md`

## DO's and DON'Ts

✅ **DO:**
- Use `routes/web.php` for all routes
- Use `Inertia::render()` for all responses
- Use `auth()->user()` for authentication checks
- Use middleware `['auth', 'verified', 'admin']`
- Follow patterns from `.github/patterns.md`

❌ **DON'T:**
- Create `routes/api/` files
- Use `auth('api')` (that's for APIs)
- Return `response()->json()` from controllers
- Use `return $this->sendResponse()` (that's for APIs)
- Forget to apply `Loggable` trait to models

## Next Steps

1. Create RoleSeeder (define Admin, Agent roles)
2. Create Chat/Message/AutoReplyRule models + migrations
3. Create controllers for Admin/Agent/Guest
4. Create React components
5. Implement real-time updates via Reverb

See `.copilot/memory-bank.md` for current progress.
