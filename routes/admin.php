<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MealController;
use App\Http\Controllers\Admin\SystemSettingsController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\VoucherController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Routes accessible by both admin and staff
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    // Admin Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Voucher Management (Admin & Staff)
    Route::prefix('vouchers')->name('vouchers.')->group(function () {
        Route::get('/', [VoucherController::class, 'index'])->name('index');
        Route::get('/scan', function () {
            return Inertia::render('admin/vouchers/scan');
        })->name('scan');
        Route::get('/{voucher}', [VoucherController::class, 'show'])->name('show');

        // Voucher Actions (Staff & Admin)
        Route::patch('/{voucher}/claim', [VoucherController::class, 'claim'])->name('claim');
        Route::patch('/{voucher}/void', [VoucherController::class, 'void'])->name('void');
        Route::patch('/{voucher}/expire', [VoucherController::class, 'expire'])->name('expire');
        Route::post('/bulk-action', [VoucherController::class, 'bulkAction'])->name('bulk-action');
        Route::post('/quick-claim', [VoucherController::class, 'quickClaim'])->name('quick-claim');
    });

});

// Admin-only routes
Route::middleware(['auth', 'verified', 'admin-only'])->prefix('admin')->name('admin.')->group(function () {

    // Meal Management (Admin Only)
    Route::prefix('meals')->name('meals.')->group(function () {
        Route::get('/', [MealController::class, 'index'])->name('index');
        Route::get('/create', [MealController::class, 'create'])->name('create');
        Route::post('/', [MealController::class, 'store'])->name('store');
        Route::get('/{meal}', [MealController::class, 'show'])->name('show');
        Route::get('/{meal}/edit', [MealController::class, 'edit'])->name('edit');
        Route::patch('/{meal}', [MealController::class, 'update'])->name('update');
        Route::delete('/{meal}', [MealController::class, 'destroy'])->name('destroy');
        Route::patch('/{meal}/toggle-status', [MealController::class, 'toggleStatus'])->name('toggle-status');
        Route::post('/bulk-update-quantity', [MealController::class, 'bulkUpdateQuantity'])->name('bulk-update-quantity');
    });

    // User Management (Admin Only)
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('index');
        Route::get('/create', [UserManagementController::class, 'create'])->name('create');
        Route::post('/', [UserManagementController::class, 'store'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('edit');
        Route::patch('/{user}', [UserManagementController::class, 'update'])->name('update');
        Route::patch('/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('toggle-status');
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
    });

    // System Settings (Admin Only)
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SystemSettingsController::class, 'index'])->name('index');
        Route::patch('/', [SystemSettingsController::class, 'update'])->name('update');

        // Time Slots Management
        Route::prefix('time-slots')->name('time-slots.')->group(function () {
            Route::get('/', [SystemSettingsController::class, 'timeSlots'])->name('index');
            Route::post('/', [SystemSettingsController::class, 'storeTimeSlot'])->name('store');
            Route::patch('/{timeSlot}', [SystemSettingsController::class, 'updateTimeSlot'])->name('update');
            Route::delete('/{timeSlot}', [SystemSettingsController::class, 'destroyTimeSlot'])->name('destroy');
        });

        // System Metrics
        Route::get('/metrics', [SystemSettingsController::class, 'metrics'])->name('metrics');
        Route::post('/metrics/reset', [SystemSettingsController::class, 'resetMetrics'])->name('metrics.reset');
    });

});
