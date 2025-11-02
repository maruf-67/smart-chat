<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * AutoReplyRule Model
 *
 * Represents an automated response rule for a chat.
 * When a guest message contains the keyword, an auto-reply message is sent.
 * Rules can be enabled/disabled and track creation/modification history via Loggable trait.
 *
 * @author Development Team
 *
 * @version 1.0
 *
 * @property int $id
 * @property int $chat_id FK to chat thread (if null, rule is global)
 * @property string $keyword Trigger keyword to match in guest messages
 * @property string $reply_message Auto-reply response message to send
 * @property bool $is_active Whether this rule is currently active
 * @property int|null $created_by User who created this rule
 * @property int|null $updated_by User who last updated this rule
 * @property string|null $created_ip IP address of creator
 * @property string|null $updated_ip IP address of updater
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class AutoReplyRule extends Model
{
    use HasFactory;
    use Loggable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'auto_reply_rules';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'chat_id',
        'keyword',
        'reply_message',
        'is_active',
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
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the chat this rule belongs to.
     *
     * Can be null if this is a global/system-wide auto-reply rule.
     *
     * @return BelongsTo|null The parent chat thread
     */
    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    /**
     * Get the user who created this rule.
     *
     * @return BelongsTo The user (admin/agent) who created this rule
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
