<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
| Routes are organized by user type for better maintainability:
| - public.php: Routes accessible without authentication
| - admin.php: Admin-only routes with full system access
| - agent.php: Support agent routes for chat management
|
*/

// Authenticated routes (any authenticated user)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Load organized route files
require __DIR__.'/web/public.php';
require __DIR__.'/web/admin.php';
require __DIR__.'/web/agent.php';

// Settings routes (Fortify, etc.)
require __DIR__.'/settings.php';
