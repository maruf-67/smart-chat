<?php

declare(strict_types=1);

use App\Http\Controllers\Agent\ChatController as AgentChatController;
use App\Http\Controllers\Agent\DashboardController as AgentDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Agent Routes
|--------------------------------------------------------------------------
|
| Routes for support agent users.
| All routes require: auth, verified, agent middleware.
| Agents can view assigned chats, respond to messages, and manage their workload.
|
*/

// Agent routes (agent user type only)
Route::middleware(['auth', 'verified', 'agent'])->prefix('agent')->name('agent.')->group(function () {

    // Dashboard
    Route::get('/', [AgentDashboardController::class, 'index'])->name('dashboard');

    // Assigned chats management - Controller grouped
    Route::controller(AgentChatController::class)->prefix('chats')->name('chats.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show');
        Route::post('/{id}/messages', 'storeMessage')->name('storeMessage');
        Route::post('/{id}/release', 'release')->name('release');
    });
});
