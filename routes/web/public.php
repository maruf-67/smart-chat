<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
|
| Routes accessible without authentication.
| Includes welcome page, guest chat access, and public information.
|
*/

// Public routes (no authentication required)
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Guest chat access
Route::prefix('chat')->name('chat.')->group(function () {
    Route::get('/{guestIdentifier}', function ($guestIdentifier) {
        return Inertia::render('Chat/Thread', ['guestIdentifier' => $guestIdentifier]);
    })->name('show');
});
