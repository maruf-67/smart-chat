# Smart Auto-Reply Chat Management System

An advanced Laravel-based chat management system with AI-powered auto-replies, real-time communication, and intelligent workflow control.

## 🚀 Features

### Core Features
- **AI-Powered Auto-Replies** - Context-aware responses using Prism (Gemini, OpenAI, Anthropic)
- **Multi-Modal Support** - Text, images (JPG/PNG), and PDF attachments
- **State Machine Workflow** - Automatic bot enabling/disabling based on agent assignment
- **Real-Time Communication** - Laravel Reverb/Pusher WebSocket integration
- **Role-Based Access Control** - Admin, Agent, and Guest roles
- **Scheduled Task Management** - Automatic reactivation of idle chats

### Admin Panel
- Dashboard with chat overview and statistics
- Assign/unassign agents to chats
- Enable/disable auto-reply per chat
- Manage auto-reply rules (CRUD)
- User management (create/edit/delete agents)
- View full chat transcripts

### Agent Panel
- View assigned chats
- Respond to guests in real-time
- Release chats back to bot

### Guest Interface
- Anonymous chat (cookie-based identification)
- File uploads (images and PDFs)
- Real-time message updates
- Typing indicators

## 📋 Requirements

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm/pnpm
- SQLite (or MySQL/PostgreSQL)
- Redis (optional, for caching)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-chat
```

### 2. Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
# or
pnpm install
```

### 3. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Configure Environment Variables

Edit `.env` file:

```env
APP_NAME="Smart Chat"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (SQLite default)
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite

# Queue (database for simplicity)
QUEUE_CONNECTION=database

# Broadcasting (Reverb)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http

# AI Configuration (Prism)
PRISM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: Use OpenAI instead
# PRISM_PROVIDER=openai
# OPENAI_API_KEY=your-openai-api-key-here
```

### 5. Database Setup
```bash
# Create SQLite database file
touch database/database.sqlite

# Run migrations
php artisan migrate

# Seed database with sample data (optional)
php artisan db:seed
```

### 6. Build Frontend Assets
```bash
# Development build
npm run dev

# Production build
npm run build
```

## 🚦 Running the Application

### Development Mode (Recommended)
```bash
# Runs Laravel server, queue worker, Vite, and logs viewer
composer run dev
```

This starts:
- Laravel development server (`http://localhost:8000`)
- Queue worker (for background jobs)
- Vite dev server (with HMR)
- Laravel Pail (log viewer)

### Manual Start (Individual Services)
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Queue worker
php artisan queue:work

# Terminal 3: Reverb WebSocket server
php artisan reverb:start

# Terminal 4: Vite dev server
npm run dev
```

### Production Deployment
```bash
# Build assets
npm run build

# Start services with supervisor/systemd
php artisan serve
php artisan queue:work --daemon
php artisan reverb:start
```

## 🔧 Configuration

### AI Provider Setup

#### Gemini (Google AI)
1. Get API key from: https://makersuite.google.com/app/apikey
2. Add to `.env`: `GEMINI_API_KEY=your-key-here`

#### OpenAI
1. Get API key from: https://platform.openai.com/api-keys
2. Update `.env`:
   ```env
   PRISM_PROVIDER=openai
   OPENAI_API_KEY=your-key-here
   ```

#### Anthropic (Claude)
1. Get API key from: https://console.anthropic.com/
2. Update `.env`:
   ```env
   PRISM_PROVIDER=anthropic
   ANTHROPIC_API_KEY=your-key-here
   ```

### Scheduled Tasks

The system includes a scheduled command to reactivate idle chats. Add to your crontab:

```bash
* * * * * cd /path/to/smart-chat && php artisan schedule:run >> /dev/null 2>&1
```

Or run manually:
```bash
# Reactivate chats idle for 15+ minutes
php artisan chats:reactivate-idle

# Custom idle threshold
php artisan chats:reactivate-idle --minutes=30

# Dry run (preview without changes)
php artisan chats:reactivate-idle --dry-run
```

## 👥 User Management

### Creating Admin User
```bash
php artisan tinker
```
```php
$admin = User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => Hash::make('password'),
    'user_type' => 'admin',
    'email_verified_at' => now(),
]);
```

### Creating Agent User
```bash
php artisan tinker
```
```php
$agent = User::create([
    'name' => 'Agent Smith',
    'email' => 'agent@example.com',
    'password' => Hash::make('password'),
    'user_type' => 'agent',
    'email_verified_at' => now(),
]);
```

## 🧪 Testing

### Run All Tests
```bash
php artisan test
```

### Run Specific Test Suite
```bash
# Auto-reply tests
php artisan test --filter=AutoReply

# Authentication tests
php artisan test --filter=Auth

# Dashboard tests
php artisan test --filter=Dashboard
```

### Test Coverage
- 57 passing tests
- Feature tests for workflow logic
- Event/listener tests
- File upload validation tests
- Authentication flow tests

## 🏗️ Architecture

### State Machine Workflow

**State 1: No Agent Assigned**
- `agent_id` is `null`
- Auto-reply system active
- Bot responds to guest messages with AI

**State 2: Agent Assigned**
- `agent_id` is set
- Auto-reply disabled immediately
- Human agent handles conversation

**State 3: Agent Unassigned/Inactive**
- Agent manually releases chat OR
- System detects inactivity (15+ minutes)
- Auto-reply re-enabled automatically

### Events & Listeners

| Event | Listener | Action |
|-------|----------|--------|
| `MessageReceived` | `ProcessAutoReply` | Generate and send AI reply |
| `AgentAssigned` | `DisableAutoReply` | Set `auto_reply_enabled = false` |
| `AgentUnassigned` | `EnableAutoReply` | Set `auto_reply_enabled = true` |
| `MessageSent` | *(broadcast)* | Real-time update via WebSocket |

### Database Schema

**Chats**
- `guest_identifier` - Cookie-based guest ID
- `agent_id` - Assigned agent (nullable)
- `auto_reply_enabled` - Bot status
- `last_activity_at` - For idle detection

**Messages**
- `sender` - 'guest', 'agent', or 'bot'
- `is_auto_reply` - Flag for bot messages
- `file_path`, `file_type`, `file_size` - Attachments

**AutoReplyRules**
- `keyword` - Trigger word
- `reply_message` - Fallback response
- `is_active` - Enable/disable rule

## 🔐 Security

- **Authentication**: Laravel Fortify with 2FA support
- **Authorization**: Policy-based (ChatPolicy, AutoReplyRulePolicy)
- **Rate Limiting**: 10 messages/minute for guests
- **File Upload Validation**: Max 1MB, allowed types only
- **CSRF Protection**: Enabled for all POST/PUT/DELETE routes

## 🐛 Troubleshooting

### Vite Build Errors
```bash
# Clear Node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Queue Not Processing
```bash
# Check queue connection
php artisan config:clear
php artisan queue:restart
php artisan queue:work --verbose
```

### WebSocket Connection Failed
```bash
# Restart Reverb server
php artisan reverb:restart

# Check if port 8080 is available
netstat -tuln | grep 8080
```

### AI Not Responding
```bash
# Verify API key is set
php artisan tinker
config('prism.providers.gemini.api_key');

# Check logs
tail -f storage/logs/laravel.log
```

## 📚 Tech Stack

- **Backend**: Laravel 12, PHP 8.3
- **Frontend**: React 19, Inertia.js v2, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Real-Time**: Laravel Reverb (Pusher protocol)
- **AI**: EchoLabs Prism (multi-provider support)
- **Testing**: Pest v4
- **Database**: SQLite (MySQL/PostgreSQL supported)

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.

---

**Built with ❤️ using Laravel and React**

