<?php

declare(strict_types=1);

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepositBulkController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\MealController;
use App\Http\Controllers\ShoppingExpenseController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Bulk deposit routes (must be before resource routes)
    Route::get('deposits/export', [DepositController::class, 'export'])->name('deposits.export');
    Route::post('deposits/bulk/import', [DepositBulkController::class, 'import'])->name('deposits.bulk.import');
    Route::get('deposits/bulk/template', [DepositBulkController::class, 'template'])->name('deposits.bulk.template');

    Route::resource('deposits', DepositController::class);

    // Shopping expense routes
    Route::get('shopping-expenses/export', [ShoppingExpenseController::class, 'export'])->name('shopping-expenses.export');
    Route::resource('shopping-expenses', ShoppingExpenseController::class);

    // Meal routes
    Route::get('meals/export', [MealController::class, 'export'])->name('meals.export');
    Route::post('meals/bulk', [MealController::class, 'bulkStore'])->name('meals.bulk');
    Route::resource('meals', MealController::class);

    // User management routes
    Route::resource('users', UserController::class);
    Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
