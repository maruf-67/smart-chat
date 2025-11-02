<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait Loggable
{
    /**
     * Boot the trait and set up model events.
     *
     * Automatically populates created_by, updated_by, created_ip, and updated_ip
     * columns on model create and update events.
     */
    protected static function bootLoggable(): void
    {
        // Set created_by and created_ip on model creation
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
            }
            $model->created_ip = Request::ip();
        });

        // Set updated_by and updated_ip on model update
        static::updating(function ($model) {
            if (Auth::check()) {
                $model->updated_by = Auth::id();
            }
            $model->updated_ip = Request::ip();
        });
    }
}
