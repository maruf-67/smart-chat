# Smart Chat

Smart Chat is a Laravel 12 + React 19 application that delivers real-time customer conversations with bot hand-off, role-based workflows, and AI-powered auto responses.

## Feature Highlights

- Real-time messaging via Laravel Reverb and Echo React.
- Guest, agent, and admin workspaces with tailored permissions.
- Auto-reply rules and bot takeover when no agent is assigned.
- File attachments (PDF, JPG, JPEG, PNG) with size validation.
- Out-of-the-box seed data so you can explore immediately.

## Requirements

- PHP 8.3+
- Composer
- Node.js 18+ (pnpm or npm)
- MySQL (default), PostgreSQL, or SQLite
- Redis (optional for queues / cache)

## Quick Start (Local)

```bash
git clone <repository-url>
cd smart-chat
composer install
pnpm install # or npm install
php artisan smart-chat:install --fresh
```

The `smart-chat:install` command will:

- Copy `.env` (if it does not exist) and generate an app key.
- Create the storage symlink.
- Run database migrations and seed demo data.

### Demo Credentials

| Role  | Email            | Password |
| ----- | ---------------- | -------- |
| Admin | admin@test.local | password |
| Agent | agent@test.local | password |
| Guest | guest@test.local | password |

> **Important:** Update these passwords when deploying to any shared or production environment.

### Environment Notes

- Open `.env` to configure database credentials, broadcasting (Reverb), queue connection, and Prism AI provider keys.
- If you need to rebuild the database during development, re-run the installer with `--fresh`.
- When running in production, pass `--force` to the installer to confirm destructive operations.

### Start the Development Stack

```bash
pnpm dev             # Vite + hot module replacement
php artisan serve    # HTTP server (http://localhost:8000)
php artisan queue:work
php artisan reverb:start --debug
```

You can also use `composer run dev` to start the Laravel server, queue worker, Vite, and log streamer in one command.

## Deployment Checklist

1. Copy `.env.example` to `.env` and set production values.
2. `composer install --no-dev` and `pnpm install --frozen-lockfile` (or `npm ci`).
3. `php artisan smart-chat:install --force` (omit `--fresh` to keep existing data).
4. `pnpm build` (or `npm run build`).
5. Configure process managers for:
    - `php artisan octane:start` or `php-fpm`/`nginx` (preferred HTTP stack).
    - `php artisan queue:work --daemon`.
    - `php artisan reverb:start`.
6. Schedule `php artisan schedule:run` every minute.

## Database Seeders

The installer seeds the following:

- `RoleSeeder` – Admin, Agent, and Guest roles with granular permissions.
- `UserSeeder` – Demo accounts listed above.
- `AutoReplyRuleSeeder` – Five keyword-driven auto replies (`hello`, `help`, `pricing`, `hours`, `support`).
- `ChatSeeder` and `MessageSeeder` – Sample conversations between guests, agents, and the bot.

Re-run `php artisan db:seed` or the individual seeder classes if you need to refresh demo content.

## Scripts & Tooling

- `pnpm dev` / `npm run dev` – Vite development server.
- `pnpm build` / `npm run build` – Production asset build.
- `composer run dev` – Convenience script for Laravel server + queue + Vite + logs.
- `php artisan smart-chat:install` – Environment bootstrapper described above.

## Testing

```bash
php artisan test
```

Feature and unit tests cover chat workflows, RBAC, and scheduled tasks. Add new tests with Pest (`php artisan make:test --pest`).

## User Guide

See [`guide.md`](guide.md) for step-by-step instructions covering each role, chat routing, and auto-reply configuration.

---

**Built with Laravel, Inertia, React, Tailwind, and a real-time-first mindset.**
