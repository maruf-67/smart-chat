# Smart Auto-Reply Workflow Management System

**Reference:** https://gemini.google.com/share/a5379c6b62c1

## 1. Core Objective

Build an advanced Laravel-based chat management system that automatically handles guest messages with context-relevant auto-replies. The system must feature dynamic workflow control and agent assignment automation.

## 2. Core Workflow Logic (The "State Machine")

This is the central requirement. The system's behavior changes based on the `agent_id` of a Chat.

### State 1: No Agent Assigned

- **Trigger:** A Guest sends a message to a Chat where `agent_id` is null.
- **Action:** The system must analyze the message and send a context-aware auto-reply.
- **Developer Note:** This implies your `MessageReceived` listener must check if `($chat->agent_id === null)`. "Context-aware" means you must query a data store (e.g., an `auto_reply_rules` table) to find a relevant reply, not just send a static "we are away" message.

### State 2: Agent Assigned

- **Trigger:** A human Agent is assigned to the Chat (e.g., `agent_id` is set to a user ID).
- **Action:** The auto-reply system for this specific chat is immediately disabled.
- **Developer Note:** This should be handled by an `AgentAssigned` event. The listener for this event should set `$chat->auto_reply_enabled = false;` to instantly stop the bot.

### State 3: Agent Unassigned / Inactive

- **Trigger:** An Agent is unassigned (
  `agent_id` set to null) or goes inactive.
- **Action:** The auto-reply system for this chat is automatically reactivated.
- **Developer Note:** This should be handled by an `AgentUnassigned` event, which sets `$chat->auto_reply_enabled = true;`. The "inactive" part suggests a scheduled task is needed to find chats with assigned agents but no activity for 'X' minutes, then unassign the agent and reactivate the bot.

## 3. Core Requirements

### A. Entities (Database Schema)

- **Guest:** Unauthenticated user. (Will likely be identified by a session ID or a "guest identifier" in the chats table).
- **Agent:** Authenticated User (with `user_type = 'agent'` or an 'Agent' role).
- **Admin:** Authenticated User (with `user_type = 'admin'` or an 'Admin' role).
- **Chat:** The main conversation session.
    - Must have: `agent_id` (nullable foreign key), `auto_reply_enabled` (boolean), `last_activity_at` (timestamp).
- **Message:** Individual chat entry.
    - Must have: `chat_id` (foreign key), `user_id` (nullable, for agent messages), `content` (text), `is_auto_reply` (boolean, to identify bot messages).

### B. Workflow Logic (Application Layer)

**Auto-Reply System:**

- If `agent_id` is present, store the message (no bot reply).
- If `agent_id` is null, trigger the smart auto-reply.

**Smart Auto-Reply:**

- Must be keyword-based (e.g., 'price', 'support' -> relevant replies).
- Implies an `auto_reply_rules` table (keyword, reply_message) is required.
- All bot replies must be saved to the messages table with `is_auto_reply = true`.

**Workflow Events (The "Engine"):**

- `MessageReceived`: Triggers the `HandleAutoReply` listener.
- `AgentAssigned`: Triggers a listener to disable auto-reply.
- `AgentUnassigned`: Triggers a listener to enable auto-reply.

**Workflow State Control:**

- Admin must be able to manually override `auto_reply_enabled` and `agent_id` for any chat.

### C. Admin Panel Features (The React UI)

- Dashboard of all guest chats and their statuses (e.g., "Bot Active", "With Agent").
- Ability to Assign/Unassign agents from a chat.
- Ability to Enable/Disable auto-reply per chat.
- A CRUD interface to manage the auto-reply rules (keyword -> custom reply).
- View chat transcripts (a list of all messages in a chat).

## 4. Technical Expectations

- Laravel 11+
- Correct use of Events, Listeners, and Queues. (The `HandleAutoReply` job must be queued).
- Policies for roles (Admin, Agent, Guest).
- Scheduled Command for reactivating idle chats.
- Tests for the core workflow logic.
- README.md with setup instructions.

## 5. Bonus Challenges

- AI Reply Integration: (Swap keyword logic for OpenAI/Hugging Face).
- Real-time Updates: (Use Laravel Echo / Reverb).
- Redis Caching: (Cache chat states like `auto_reply_enabled`).
- Workflow Change Logs: (Log when an agent is assigned, bot is toggled, etc.).
- Rate Limiting for guests.
