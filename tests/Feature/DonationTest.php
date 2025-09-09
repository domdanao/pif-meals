<?php

use App\Models\Donation;
use App\Models\User;
use App\Services\MagpiePaymentService;

test('donation page can be rendered', function () {
    $response = $this->get('/donate');
    $response->assertStatus(200);
});

test('donation model can be created', function () {
    $donor = User::factory()->create([
        'role' => 'donor',
        'email' => 'donor@test.com',
    ]);

    $donation = Donation::create([
        'donor_id' => $donor->id,
        'amount' => 130.00,
        'meal_count' => 2,
        'payment_method' => 'gcash',
        'payment_status' => 'pending',
    ]);

    expect($donation->exists)->toBeTrue();
    expect($donation->formatted_amount)->toBe('PHP 130.00');
    expect($donation->donor->email)->toBe('donor@test.com');
});

test('donation scopes work correctly', function () {
    $donor = User::factory()->create(['role' => 'donor']);

    // Create donations with different statuses
    Donation::create([
        'donor_id' => $donor->id,
        'amount' => 65.00,
        'meal_count' => 1,
        'payment_method' => 'gcash',
        'payment_status' => 'completed',
    ]);

    Donation::create([
        'donor_id' => $donor->id,
        'amount' => 130.00,
        'meal_count' => 2,
        'payment_method' => 'maya',
        'payment_status' => 'pending',
    ]);

    expect(Donation::completed()->count())->toBe(1);
    expect(Donation::pending()->count())->toBe(1);
    expect((float) Donation::completed()->sum('amount'))->toBe(65.00);
});

test('donation service can be instantiated', function () {
    $service = app(MagpiePaymentService::class);
    expect($service)->toBeInstanceOf(MagpiePaymentService::class);
});

test('donation success page requires completed donation', function () {
    $donor = User::factory()->create(['role' => 'donor']);

    // Create a pending donation
    $pendingDonation = Donation::create([
        'donor_id' => $donor->id,
        'amount' => 65.00,
        'meal_count' => 1,
        'payment_method' => 'gcash',
        'payment_status' => 'pending',
    ]);

    // Should redirect for pending donation
    $response = $this->get("/donate/success/{$pendingDonation->id}");
    $response->assertRedirect('/donate');

    // Create a completed donation
    $completedDonation = Donation::create([
        'donor_id' => $donor->id,
        'amount' => 65.00,
        'meal_count' => 1,
        'payment_method' => 'gcash',
        'payment_status' => 'completed',
        'payment_completed_at' => now(),
    ]);

    // Should show success page for completed donation
    $response = $this->get("/donate/success/{$completedDonation->id}");
    $response->assertStatus(200);
});

test('payment callback routes exist', function () {
    $donor = User::factory()->create(['role' => 'donor']);

    $donation = Donation::create([
        'donor_id' => $donor->id,
        'amount' => 65.00,
        'meal_count' => 1,
        'payment_method' => 'gcash',
        'payment_status' => 'pending',
    ]);

    // Test success callback route exists (should redirect)
    $response = $this->get("/donation/{$donation->id}/payment/success");
    expect($response->status())->not->toBe(404);

    // Test cancel callback route exists (should redirect)
    $response = $this->get("/donation/{$donation->id}/payment/cancel");
    expect($response->status())->not->toBe(404);
});

test('webhook route exists and is accessible', function () {
    // Test webhook route is accessible
    $response = $this->post('/webhooks/magpie', ['test' => 'data']);
    // Should not return 404 (route exists)
    expect($response->status())->not->toBe(404);
});
