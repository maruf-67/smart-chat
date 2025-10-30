# Smart Chat - Coding Patterns

**Location**: `.github/patterns.md`  
**Purpose**: Document repeating coding patterns for consistency across the codebase  
**Last Updated**: October 30, 2025

---

## PHP/Laravel Patterns

### 1. Strict Types & Return Types

**Pattern**: ALL PHP files must declare strict types and use explicit return types.

```php
<?php

declare(strict_types=1);

namespace App\Services;

public function processChat(Chat $chat): Chat {
    // Always explicit return type
}

public function getName(User $user): string {
    return $user->first_name.' '.$user->last_name;
}
```

**Why**: Catches type-related bugs at parse time, improves IDE autocomplete, documents intent.

---

### 2. PHPDoc Blocks on Public Methods

**Pattern**: Every public method gets PHPDoc with `@param`, `@return`, `@throws`, `@context`, `@pattern`.

```php
/**
 * Check if user has permission.
 *
 * @param  string  $permission  Permission key (e.g., 'users.view')
 * @return bool
 * @throws PermissionNotFoundException If permission enum doesn't exist
 * @context: Used by middleware to guard routes
 * @pattern: RBAC permission checking via role.hasPermission()
 */
public function hasPermission(string $permission): bool {
    // Implementation
}
```

**Why**: Auto-documents behavior, helps IDE suggestions, explains context and usage pattern.

---

### 3. Constructor Property Promotion

**Pattern**: Use PHP 8 property promotion for dependency injection.

```php
// ❌ DON'T
public function __construct(private ChatService $service) {
    // This is empty - avoid
}

// ✅ DO
public function __construct(
    private readonly ChatService $chatService,
    private readonly RoleService $roleService,
) {}
```

**Why**: Cleaner, less boilerplate, forces non-empty constructors.

---

### 4. Trait-Based Functionality

**Pattern**: Use traits for cross-cutting concerns (logging, image handling, broadcasting).

```php
class User extends Authenticatable {
    use Loggable, ImageOptimizable, Notifiable;
}

class Chat extends Model {
    use Loggable, BroadcastCast;
}
```

**Traits Available**:
- `Loggable`: Auto-populates `created_by`, `updated_by`, `created_ip`, `updated_ip`
- `ImageOptimizable`: Manages image storage/retrieval with Storage facade
- `BroadcastCast`: Handles Reverb real-time broadcasting

**Why**: DRY, reusable, keeps model code focused.

---

### 5. Eloquent Relationships with Return Types

**Pattern**: All relationships must have explicit return types.

```php
class User extends Authenticatable {
    public function role(): BelongsTo {
        return $this->belongsTo(Role::class);
    }

    public function chats(): HasMany {
        return $this->hasMany(Chat::class, 'agent_id');
    }
}

class Chat extends Model {
    public function messages(): HasMany {
        return $this->hasMany(Message::class);
    }
}
```

**Why**: IDE autocomplete, prevents N+1 queries when eager loading, documents schema relationships.

---

### 6. RBAC Permission Checks

**Pattern**: Use enum-based permissions, check via model methods or middleware.

```php
// ✅ Model Method (Controllers)
if (! auth()->user()->hasPermission(Permission::UsersView->value)) {
    abort(403);
}

// ✅ Middleware (Routes)
Route::middleware('permission:users.view')->group(function() {
    // Protected routes
});

// ✅ Enum Definition
enum Permission: string {
    case UsersView = 'users.view';
    case UsersCreate = 'users.create';
}
```

**Why**: Type-safe, single source of truth, prevents typos.

---

### 7. Database Transactions for Multi-Step Operations

**Pattern**: Wrap operations that modify multiple records in transactions.

```php
public function assignChatToAgent(Chat $chat, User $agent): Chat {
    return DB::transaction(function () use ($chat, $agent): Chat {
        $chat->update(['agent_id' => $agent->id]);
        $chat->recordActivity('Assigned to agent');
        event(new ChatAssigned($chat, $agent));
        return $chat;
    });
}
```

**Why**: Prevents partial updates, ensures consistency, simplifies rollback.

---

### 8. Eloquent Accessors for Computed Properties

**Pattern**: Use `#[Attribute]` for computed or transformed properties.

```php
use Illuminate\Database\Eloquent\Attributes\Attribute;

class User extends Authenticatable {
    /**
     * Get the user's full name.
     */
    #[Attribute]
    public function name(): Attribute {
        return Attribute::make(
            get: fn (): string => trim("{$this->first_name} {$this->last_name}"),
        );
    }
}

// Usage (computed automatically):
$user->name  // "John Doe"
```

**Why**: Clean API, lazy-evaluated, database doesn't store redundant data.

---

## Route Organization Patterns

### 9. Route File Structure

**Pattern**: Separate routes into logical groups by domain and auth requirements.

```
routes/
├── api/
│   ├── admin.php          # Admin-only endpoints (/api/admin/*)
│   ├── agent.php          # Agent-only endpoints (/api/agent/*)
│   └── public.php         # Guest/public endpoints (/api/public/*)
├── web.php                # Web routes (Inertia pages)
├── api.php                # API root (imports all api/* files)
└── console.php            # Artisan commands
```

**Why**: Clear separation, easier to find routes, middleware stack visible per group.

---

### 10. Middleware Organization

**Pattern**: Stack middleware from most permissive to most restrictive.

```php
// ✅ DO: From permissive to restrictive
Route::middleware(['auth:api', 'agent', 'permission:chats.view'])
    ->group(function() {
        // Routes here require:
        // 1. Valid OAuth2 token
        // 2. User type = agent
        // 3. Role has 'chats.view' permission
    });
```

**Why**: Fails fast, clear authorization stack, performance.

---

## API Response Patterns

### 11. Consistent JSON Responses

**Pattern**: All API responses follow standard format via BaseController.

```php
class ChatController extends BaseController {
    public function index(): JsonResponse {
        $chats = Chat::paginate();
        return $this->sendResponse($chats, 'Chats retrieved', 200);
    }

    public function store(Request $request): JsonResponse {
        // Validation happens in FormRequest
        $chat = Chat::create($request->validated());
        return $this->sendResponse($chat, 'Chat created', 201);
    }
}

// Response Format:
{
    "success": true,
    "message": "Chat created",
    "data": { "id": 1, ... },
    "code": 201
}
```

**Why**: Predictable client code, easier testing, better error handling.

---

## Testing Patterns

### 12. Pest Feature Tests

**Pattern**: Test workflows, not implementation. Use factories for setup.

```php
// tests/Feature/ChatWorkflowTest.php
it('allows agent to take over chat', function () {
    $agent = User::factory()->agent()->create();
    $chat = Chat::factory()->create(['agent_id' => null]);

    actingAs($agent, 'api')
        ->postJson("/api/agent/chats/{$chat->id}/take-over")
        ->assertSuccessful();

    expect($chat->fresh()->agent_id)->toBe($agent->id);
});
```

**Why**: Tests real behavior, uses realistic data, easy to maintain.

---

### 13. Use Factories with Custom States

**Pattern**: Define factory states for common scenarios.

```php
// database/factories/UserFactory.php
public function admin(): static {
    return $this->state(fn () => [
        'user_type' => 'admin',
        'role_id' => Role::admin()->id,
    ]);
}

public function agent(): static {
    return $this->state(fn () => [
        'user_type' => 'agent',
        'role_id' => Role::agent()->id,
    ]);
}

// Usage
$admin = User::factory()->admin()->create();
$agent = User::factory()->agent()->create();
```

**Why**: Readable, reusable, reduces test setup duplication.

---

## Migration Patterns

### 14. Foreign Key Constraints Order

**Pattern**: Create tables in dependency order, defer constraints if needed.

```php
// Migration 1: Create roles table FIRST (no FK to users yet)
Schema::create('roles', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->json('permissions')->default('[]');
    // Defer FK constraints to after users table exists
});

// Migration 2: Enhance users table SECOND
Schema::table('users', function (Blueprint $table) {
    $table->foreignId('role_id')->constrained('roles');
    // Now add FKs to roles table
    $table->foreign('created_by')->references('id')->on('users');
});
```

**Why**: Avoids circular dependency errors, cleaner migrations.

---

## Configuration Patterns

### 15. Env Vars Only in Config Files

**Pattern**: Never use `env()` outside `config/` directory.

```php
// ❌ DON'T - in app/Services/ChatService.php
$timeout = env('CHAT_TIMEOUT');

// ✅ DO - in config/chat.php
'timeout' => env('CHAT_TIMEOUT', 300),

// ✅ DO - use in code
$timeout = config('chat.timeout');
```

**Why**: Testable, cacheable, single source of truth.

---

## Summary: Pattern Checklist

Before committing code:

- [ ] PHP file has `declare(strict_types=1)` at top
- [ ] All methods have return types
- [ ] Public methods have `@param`, `@return`, `@context`, `@pattern` in PHPDoc
- [ ] Relationships have explicit return types
- [ ] Multi-step operations wrapped in transactions
- [ ] Computed properties use `#[Attribute]`
- [ ] Traits used for cross-cutting concerns
- [ ] Routes organized by domain/auth level
- [ ] Middleware stacked permissive to restrictive
- [ ] Tests use factories with custom states
- [ ] `config()` used instead of `env()` outside `config/`
- [ ] Code formatted with Pint: `vendor/bin/pint --dirty`

---

**See Also**:
- `.copilot/decisions.md` - Architecture rationale
- `.copilot/memory-bank.md` - Project state & progress
- `docs/planning.md` - Sprint plan & requirements
