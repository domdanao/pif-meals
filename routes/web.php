<?php

use App\Http\Controllers\DonationController;
use App\Http\Controllers\Students\MealRequestController;
use App\Http\Controllers\WelcomeController;
use App\Models\TimeSlot;
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

// Debug route for time slots
Route::get('/debug/time-slots', function () {
    $timeSlots = TimeSlot::active()->get();
    return response()->json([
        'total_time_slots' => TimeSlot::count(),
        'active_time_slots' => $timeSlots->count(),
        'time_slots' => $timeSlots->map(function($slot) {
            return [
                'id' => $slot->id,
                'display_name' => $slot->display_name,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'is_active' => $slot->is_active,
            ];
        }),
    ]);
})->name('debug.time-slots');

// Debug route for testing voucher claim
Route::get('/debug/vouchers', function () {
    $vouchers = \App\Models\Voucher::with('timeSlot')->take(5)->get();
    return response()->json([
        'total_vouchers' => \App\Models\Voucher::count(),
        'sample_vouchers' => $vouchers->map(function($voucher) {
            return [
                'reference_number' => $voucher->reference_number,
                'status' => $voucher->status,
                'student_name' => $voucher->student_name,
                'time_slot' => $voucher->timeSlot?->display_name ?? 'N/A',
                'created_at' => $voucher->created_at?->format('Y-m-d H:i:s'),
            ];
        }),
        'auth_check' => [
            'is_authenticated' => auth()->check(),
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role ?? 'not authenticated',
            'has_admin_middleware' => 'Check if you can access /admin routes',
        ],
    ]);
})->name('debug.vouchers');

// Test quick-claim API with proper authentication
Route::post('/debug/test-quick-claim', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'reference_number' => 'required|string',
    ]);
    
    if (!auth()->check()) {
        return response()->json(['error' => 'Not authenticated'], 401);
    }
    
    $user = auth()->user();
    if (!in_array($user->role, ['admin', 'staff'])) {
        return response()->json(['error' => 'Access denied. Admin or staff privileges required.'], 403);
    }
    
    // Call the actual controller method
    $controller = new \App\Http\Controllers\Admin\VoucherController();
    return $controller->quickClaim($request);
})->name('debug.test-quick-claim');

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
