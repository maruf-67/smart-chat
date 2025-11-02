# Web App vs API - Quick Reference for smart-chat

This document clarifies the differences between this project (monolithic web app) and lara-api-starter (API).

## Quick Comparison

| Aspect | smart-chat (Web) | lara-api-starter (API) |
|--------|-----------------|----------------------|
| **Routes** | routes/web.php | routes/api/*.php |
| **Auth** | Fortify (session) | OAuth2 Passport (tokens) |
| **Auth Check** | auth() | auth('api') |
| **Response** | Inertia pages (HTML) | JSON responses |
| **404 Response** | abort(404) → HTML | abort(404) → JSON |
| **403 Response** | abort(403) → HTML | response()->json(['message' => '...'], 403) |
| **Controllers** | return Inertia::render() | return $this->sendResponse() |
| **Frontend** | React via Inertia (in same app) | Separate client (mobile/SPA) |
| **Middleware Auth** | middleware('auth', 'verified') | middleware('auth:api') |
| **Redirect Login** | redirect()->route('login') | N/A (API returns 401) |

## What's Reusable from lara-api-starter

✅ **Take these as-is:**
- User model structure (with RBAC)
- Role model (with permissions JSON)
- Loggable trait (audit columns)
- Permission enum (type-safe constants)
- RBAC logic methods (hasPermission, isAdmin, isAgent)

❌ **Don't take these:**
- routes/api/ structure (use routes/web.php instead)
- BaseController (use Inertia::render() instead)
- API middleware (use Fortify middleware instead)
- JSON response patterns (use Inertia pages instead)

## Code Examples

### WRONG for smart-chat (API style):
```php
// ❌ DON'T DO THIS
Route::middleware('auth:api')->get('/admin/chats', 'ChatsController@index');
// ❌ DON'T DO THIS
if (!auth('api')->check()) return response()->json(['error' => '...'], 401);
// ❌ DON'T DO THIS
return $this->sendResponse($chats, 'Success', 200);
```

### RIGHT for smart-chat (Web style):
```php
// ✅ DO THIS
Route::middleware(['auth', 'verified', 'admin'])->get('/admin/chats', 'Admin\ChatController@index');
// ✅ DO THIS
if (!auth()->check()) redirect()->route('login');
// ✅ DO THIS
return Inertia::render('Admin/Chats', ['chats' => $chats]);
```

## Middleware Pattern

**API (lara-api-starter):**
```php
// routes/api/admin.php
Route::middleware('auth:api', 'admin')->group(...);
```

**Web (smart-chat):**
```php
// routes/web.php
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->group(...);
```

## Authentication Flow

**API:**
```
Client → POST /oauth/token → Get token → Store locally → Use in Authorization header
```

**Web:**
```
User → POST /login (Fortify) → Session created → Browser stores session cookie → Authenticated
```

## When to Use What

- Use **API structure** if building a separate backend for mobile/SPA clients
- Use **Web structure** if the frontend is server-side rendered (React via Inertia)

This project uses **Web structure** because:
- ✅ React components are in same codebase
- ✅ User logs in, gets session cookie
- ✅ All pages rendered server-side via Inertia
- ✅ Session persists across requests
