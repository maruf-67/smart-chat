<?php

declare(strict_types=1);

use App\Http\Controllers\Guest\ChatController as GuestChatController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    return Inertia::render('welcome');
})->name('home');

// Guest chat access
Route::get('/chat', [GuestChatController::class, 'index'])->name('chat.index');
Route::get('/chat/{guestIdentifier}', [GuestChatController::class, 'show'])->name('chat.show');
Route::get('/chat/{guestIdentifier}/messages', [GuestChatController::class, 'loadMoreMessages'])->name('chat.messages.load');

// Rate limiting: 10 messages per minute per guest to prevent spam
Route::post('/chat/{guestIdentifier}/messages', [GuestChatController::class, 'storeMessage'])
    ->middleware('throttle:10,1')
    ->name('chat.messages.store');
