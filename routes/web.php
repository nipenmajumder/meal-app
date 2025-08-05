<?php

declare(strict_types=1);

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepositBulkController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\MealController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ShoppingExpenseController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Test route for debugging (no auth required)
Route::get('test/scopes', [\App\Http\Controllers\TestController::class, 'testScopes'])->name('test.scopes');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Bulk deposit routes (must be before resource routes)
    Route::get('deposits/export', [DepositController::class, 'export'])->name('deposits.export')->middleware('can:export deposits');
    Route::post('deposits/bulk/import', [DepositBulkController::class, 'import'])->name('deposits.bulk.import')->middleware('can:bulk import deposits');
    Route::get('deposits/bulk/template', [DepositBulkController::class, 'template'])->name('deposits.bulk.template')->middleware('can:bulk import deposits');

    Route::resource('deposits', DepositController::class)->middleware('can:view deposits');

    // Shopping expense routes
    Route::get('shopping-expenses/export', [ShoppingExpenseController::class, 'export'])->name('shopping-expenses.export')->middleware('can:export shopping expenses');
    Route::resource('shopping-expenses', ShoppingExpenseController::class)->middleware('can:view shopping expenses');

    // Meal routes
    Route::get('meals/export', [MealController::class, 'export'])->name('meals.export')->middleware('can:export meals');
    Route::post('meals/bulk', [MealController::class, 'bulkStore'])->name('meals.bulk')->middleware('can:bulk import meals');
    Route::resource('meals', MealController::class)->middleware('can:view meals');

    // User management routes - only accessible by users with appropriate permissions
    Route::middleware('can:view users')->group(function () {
        Route::resource('users', UserController::class);
        Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status')->middleware('can:manage user status');
    });

    // Role management routes - only accessible by users with role management permissions
    Route::middleware('can:view roles')->group(function () {
        Route::resource('roles', RoleController::class)->except(['show', 'create', 'edit']);
        Route::get('roles/permissions', [RoleController::class, 'permissions'])->name('roles.permissions');
        Route::post('roles/update-permissions', [RoleController::class, 'updatePermissions'])->name('roles.update-permissions')->middleware('can:manage permissions');
        Route::get('roles/{role}/permissions', [RoleController::class, 'rolePermissions'])->name('roles.role-permissions');
        Route::post('roles/{role}/permissions', [RoleController::class, 'updateRolePermissions'])->name('roles.update-role-permissions')->middleware('can:manage permissions');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
