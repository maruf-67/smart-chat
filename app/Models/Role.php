<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory, Loggable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'title',
        'permissions',
        'type',
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
            'permissions' => 'array',
            'is_active' => 'boolean',
        ];
    }

    // ====== RELATIONSHIPS ======

    /**
     * Get users with this role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the user who created this role.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this role.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // ====== PERMISSION METHODS ======

    /**
     * Check if role has specific permission.
     *
     * @param  string  $permission  Permission key (e.g., 'users.view')
     */
    public function hasPermission(string $permission): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $permissions = $this->permissions;

        // Handle edge cases for permissions format
        if (is_string($permissions)) {
            $permissions = json_decode($permissions, true) ?? [];
        }

        if (! is_array($permissions)) {
            $permissions = [];
        }

        return in_array($permission, $permissions, true);
    }

    /**
     * Add a permission to this role.
     *
     * @param  string  $permission  Permission key
     */
    public function addPermission(string $permission): void
    {
        $permissions = $this->permissions ?? [];

        if (! in_array($permission, $permissions, true)) {
            $permissions[] = $permission;
            $this->permissions = $permissions;
            $this->save();
        }
    }

    /**
     * Remove a permission from this role.
     *
     * @param  string  $permission  Permission key
     */
    public function removePermission(string $permission): void
    {
        $permissions = $this->permissions ?? [];

        $permissions = array_filter($permissions, fn ($p) => $p !== $permission);
        $this->permissions = array_values($permissions);
        $this->save();
    }

    /**
     * Set all permissions for this role (replaces existing).
     *
     * @param  array<int, string>  $permissions  Array of permission keys
     */
    public function setPermissions(array $permissions): void
    {
        // Remove duplicates and ensure proper format
        $permissions = array_unique($permissions);
        $this->permissions = array_values($permissions);
        $this->save();
    }
}
