<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Chat Model
 *
 * Represents a chat thread between guest and agent(s).
 * Each chat has a unique guest_identifier, optional agent assignment,
 * and manages auto-reply rules and message history.
 *
 * @author Development Team
 *
 * @version 1.0
 *
 * @property int $id
 * @property string $guest_identifier Unique identifier for anonymous guest
 * @property int|null $agent_id FK to assigned support agent
 * @property bool $auto_reply_enabled Whether auto-reply rules are active for this chat
 * @property \Illuminate\Support\Carbon|null $last_activity_at Timestamp of last message
 * @property int|null $created_by User who created this chat
 * @property int|null $updated_by User who last updated this chat
 * @property string|null $created_ip IP address of creator
 * @property string|null $updated_ip IP address of updater
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class Chat extends Model
{
    use HasFactory;
    use Loggable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'guest_identifier',
        'agent_id',
        'auto_reply_enabled',
        'last_activity_at',
        'created_by',
        'updated_by',
        'created_ip',
        'updated_ip',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'auto_reply_enabled' => 'boolean',
            'last_activity_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get all messages for this chat.
     *
     * @return HasMany Collection of messages ordered by creation time
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get the assigned agent for this chat.
     *
     * Returns null if chat is unassigned or waiting for agent pickup.
     *
     * @return BelongsTo The assigned user (agent) or null
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Get all auto-reply rules for this chat.
     *
     * @return HasMany Collection of active auto-reply rules
     */
    public function autoReplyRules(): HasMany
    {
        return $this->hasMany(AutoReplyRule::class);
    }
}
