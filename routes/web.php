<?php

use App\Http\Controllers\DonationController;
use App\Http\Controllers\Students\MealRequestController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

// Donation routes
Route::get('/donate', [DonationController::class, 'show'])->name('donate');
Route::post('/donate', [DonationController::class, 'store'])->name('donate.store');
Route::get('/donate/success/{donation}', [DonationController::class, 'success'])->name('donate.success');

// Magpie payment callback routes
Route::get('/donation/{donation}/payment/success', [DonationController::class, 'paymentSuccess'])->name('donation.payment.success');
Route::get('/donation/{donation}/payment/cancel', [DonationController::class, 'paymentCancel'])->name('donation.payment.cancel');
Route::post('/webhooks/magpie', [DonationController::class, 'webhook'])->name('webhooks.magpie');

// Test flash messages
Route::get('/test-flash', function () {
    return redirect()->route('donate')
        ->with('info', 'This is a test flash message!');
})->name('test.flash');

// Student meal request flow
Route::prefix('students')->name('students.')->group(function () {
    Route::get('/request-meal', [MealRequestController::class, 'create'])->name('request-meal');
    Route::post('/request-meal', [MealRequestController::class, 'store'])->name('request-meal.store');
    Route::post('/check-email', [MealRequestController::class, 'checkEmail'])->name('check-email');
    Route::get('/voucher/{referenceNumber}', [MealRequestController::class, 'showVoucher'])->name('voucher.show');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
