# Smart Chat Usage Guide

This guide walks through the core workflows for each role after installing Smart Chat.

## Getting Started

1. Install dependencies and seed the database:
    ```bash
    composer install
    pnpm install
    php artisan smart-chat:install --fresh
    ```
2. Start the required services:
    ```bash
    pnpm dev
    php artisan serve
    php artisan queue:work
    php artisan reverb:start
    ```
3. Visit `http://localhost:8000` in your browser.

### Demo Accounts

| Role  | Email            | Password |
| ----- | ---------------- | -------- |
| Admin | admin@test.local | password |
| Agent | agent@test.local | password |
| Guest | guest@test.local | password |

> Update demo credentials before any shared or production deployment.

## Guest Experience

1. Navigate to `/chat` from the landing page.
2. Enter your message and optionally attach a PDF or image (≤ 1 MB).
3. Submit to create a new guest chat thread.
4. The bot replies automatically when no agent is assigned.
5. Keep the browser tab open to see messages arrive instantly via WebSockets.

## Agent Workspace

1. Sign in with the agent account and you will be redirected to `/agent`.
2. Open **Chats** to view conversations assigned to you.
3. Click any chat to open the thread, review history, and respond in real time.
4. Use the attachment button to share files with the guest.
5. Click **Release Chat** when you want to hand control back to the bot.

## Admin Console

1. Sign in with the admin account to access `/admin`.
2. **Chats** → Monitor all threads, assign/unassign agents, and toggle auto reply per chat.
3. **Rules** → Manage auto-reply rules. Keyword matches trigger the configured fallback responses.
4. **Users** → Create or update agent accounts and manage access.
5. Admins can upload attachments and send messages within any chat thread.

## Auto Reply Rules

- Located under **Admin → Rules**.
- Each rule combines a `keyword` and a `reply`.
- When a guest message contains the keyword and no agent is assigned, the rule reply is sent immediately.
- Disable the rule or assign an agent to pause bot responses.

## Scheduled Tasks

Add the scheduler to your crontab so idle chats are reactivated automatically:

```bash
* * * * * cd /path/to/smart-chat && php artisan schedule:run >> /dev/null 2>&1
```

The scheduler invokes `php artisan chats:reactivate-idle` to return inactive chats to the bot after the configured threshold.

## Production Notes

- Run `php artisan smart-chat:install --force` to bootstrap a fresh environment while preventing accidental drops.
- Configure broadcasting keys (Reverb), queue drivers, and Prism provider credentials in `.env`.
- Build assets with `pnpm build` (or `npm run build`) and serve the `public/build` directory via your web server.
- Keep long-running processes (`queue:work`, `reverb:start`) alive with Supervisor or systemd.

## Support

If you run into issues, check:

- `storage/logs/laravel.log` for backend errors.
- Browser console for client-side errors.
- Re-run `php artisan smart-chat:install --fresh` during development to reset your environment.
