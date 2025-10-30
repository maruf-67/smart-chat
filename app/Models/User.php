<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\ImageOptimizable;
use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Attributes\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, ImageOptimizable, Loggable, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'image',
        'email',
        'email_verified_at',
        'password',
        'phone',
        'phone_verified_at',
        'otp',
        'otp_expires_at',
        'status',
        'user_type',
        'role_id',
        'created_by',
        'updated_by',
        'created_ip',
        'updated_ip',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'otp_expires_at' => 'datetime',
            'status' => 'boolean',
            'user_type' => 'string',
        ];
    }

    // ====== ACCESSORS ======

    /**
     * Get the user's full name by combining first_name and last_name.
     */
    #[Attribute]
    public function name(): Attribute
    {
        return Attribute::make(
            get: fn (): string => trim("{$this->first_name} {$this->last_name}"),
        );
    }

    // ====== RELATIONSHIPS ======

    /**
     * Get the role associated with this user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Check if user has a specific permission.
     *
     * @param  string  $permission  Permission key (e.g., 'users.view')
     */
    public function hasPermission(string $permission): bool
    {
        if (! $this->role) {
            return false;
        }

        return $this->role->hasPermission($permission);
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }

    /**
     * Check if user is an agent.
     */
    public function isAgent(): bool
    {
        return $this->user_type === 'agent';
    }
}
