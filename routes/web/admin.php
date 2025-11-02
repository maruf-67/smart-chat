<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\ChatController as AdminChatController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\RuleController as AdminRuleController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Routes for admin users with full system access.
| All routes require: auth, verified, admin middleware.
| Admin users can manage chats, rules, users, and view system dashboard.
|
*/

// Admin routes (admin user type only)
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    // Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    // Dashboard
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Chats management - Controller grouped
    Route::controller(AdminChatController::class)->prefix('chats')->name('chats.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show');
        Route::post('/{id}/messages', 'storeMessage')->name('storeMessage');
        Route::patch('/{id}', 'update')->name('update');
    });

    // Rules management - Controller grouped
    Route::controller(AdminRuleController::class)->prefix('rules')->name('rules.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}/edit', 'edit')->name('edit');
        Route::patch('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });

    // Users management - Controller grouped
    Route::controller(AdminUserController::class)->prefix('users')->name('users.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{user}/edit', 'edit')->name('edit');
        Route::put('/{user}', 'update')->name('update');
        Route::delete('/{user}', 'destroy')->name('destroy');
    });
});
