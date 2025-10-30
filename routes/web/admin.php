<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\ChatController as AdminChatController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\RuleController as AdminRuleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    // Dashboard
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Chats management - Controller grouped
    Route::controller(AdminChatController::class)->prefix('chats')->name('chats.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show');
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

    // Users management (placeholder for future)
    Route::get('users', function () {
        return Inertia::render('Admin/Users');
    })->name('users.index');
});
