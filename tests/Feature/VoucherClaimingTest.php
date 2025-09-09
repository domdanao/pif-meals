<?php

use App\Models\MealInventory;
use App\Models\Role;
use App\Models\TimeSlot;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can claim a voucher using quick-claim endpoint', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);
    $admin->assignRole(Role::ADMIN);

    // Create voucher data
    $timeSlot = TimeSlot::create([
        'display_name' => 'Lunch Time',
        'start_time' => '12:00:00',
        'end_time' => '13:00:00',
        'is_active' => true,
    ]);

    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole(Role::STUDENT);

    $mealInventory = MealInventory::factory()->create(['status' => 'reserved']);

    $voucher = Voucher::factory()->create([
        'student_id' => $student->id,
        'meal_inventory_id' => $mealInventory->id,
        'time_slot_id' => $timeSlot->id,
        'scheduled_date' => today(),
        'student_name' => $student->name,
        'student_course' => $student->course,
        'student_year' => $student->year_level,
        'student_phone' => $student->phone,
        'status' => 'active',
    ]);

    // Act as admin and make the request
    $response = $this->actingAs($admin)
        ->postJson('/admin/vouchers/quick-claim', [
            'reference_number' => $voucher->reference_number,
        ]);

    // Assert successful response
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'voucher' => [
                'reference_number' => $voucher->reference_number,
                'student_name' => $student->name,
                'time_slot' => $timeSlot->display_name,
            ],
        ]);

    // Assert voucher was updated
    $voucher->refresh();
    expect($voucher->status)->toBe('claimed')
        ->and($voucher->claimed_at)->not->toBeNull()
        ->and($voucher->claimed_by_staff_id)->toBe($admin->id);
});

it('cannot claim non-existent voucher', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);
    $admin->assignRole(Role::ADMIN);

    // Try to claim non-existent voucher
    $response = $this->actingAs($admin)
        ->postJson('/admin/vouchers/quick-claim', [
            'reference_number' => 'BB-250109-FAKE',
        ]);

    // Assert validation error
    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['reference_number']);
});

it('cannot claim already claimed voucher', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);
    $admin->assignRole(Role::ADMIN);

    // Create voucher data
    $timeSlot = TimeSlot::create([
        'display_name' => 'Lunch Time',
        'start_time' => '12:00:00',
        'end_time' => '13:00:00',
        'is_active' => true,
    ]);

    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole(Role::STUDENT);

    $mealInventory = MealInventory::factory()->create(['status' => 'claimed']);

    $voucher = Voucher::factory()->create([
        'student_id' => $student->id,
        'meal_inventory_id' => $mealInventory->id,
        'time_slot_id' => $timeSlot->id,
        'scheduled_date' => today(),
        'student_name' => $student->name,
        'student_course' => $student->course,
        'student_year' => $student->year_level,
        'student_phone' => $student->phone,
        'status' => 'claimed',
        'claimed_at' => now(),
        'claimed_by_staff_id' => $admin->id,
    ]);

    // Try to claim already claimed voucher
    $response = $this->actingAs($admin)
        ->postJson('/admin/vouchers/quick-claim', [
            'reference_number' => $voucher->reference_number,
        ]);

    // Assert error response
    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => 'Voucher cannot be claimed.',
        ]);
});

it('requires authentication to access quick-claim endpoint', function () {
    // Try to claim voucher without authentication
    $response = $this->postJson('/admin/vouchers/quick-claim', [
        'reference_number' => 'BB-250109-TEST',
    ]);

    // Assert unauthorized response (JSON endpoint)
    $response->assertUnauthorized();
});

it('requires admin role to access quick-claim endpoint', function () {
    // Create regular user (no admin role)
    $user = User::factory()->create();

    // Try to claim voucher without admin role
    $response = $this->actingAs($user)
        ->postJson('/admin/vouchers/quick-claim', [
            'reference_number' => 'BB-250109-TEST',
        ]);

    // Assert forbidden access
    $response->assertForbidden();
});

it('can claim voucher with staff role', function () {
    // Create staff user
    $staff = User::factory()->create(['role' => 'staff']);
    $staff->assignRole(Role::STAFF);

    // Create voucher data
    $timeSlot = TimeSlot::create([
        'display_name' => 'Breakfast Time',
        'start_time' => '08:00:00',
        'end_time' => '09:00:00',
        'is_active' => true,
    ]);

    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole(Role::STUDENT);

    $mealInventory = MealInventory::factory()->create(['status' => 'reserved']);

    $voucher = Voucher::factory()->create([
        'student_id' => $student->id,
        'meal_inventory_id' => $mealInventory->id,
        'time_slot_id' => $timeSlot->id,
        'scheduled_date' => today(),
        'student_name' => $student->name,
        'student_course' => $student->course,
        'student_year' => $student->year_level,
        'student_phone' => $student->phone,
        'status' => 'active',
    ]);

    // Act as staff and make the request
    $response = $this->actingAs($staff)
        ->postJson('/admin/vouchers/quick-claim', [
            'reference_number' => $voucher->reference_number,
        ]);

    // Assert successful response
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'voucher' => [
                'reference_number' => $voucher->reference_number,
                'student_name' => $student->name,
                'time_slot' => $timeSlot->display_name,
            ],
        ]);

    // Assert voucher was claimed by staff
    $voucher->refresh();
    expect($voucher->status)->toBe('claimed')
        ->and($voucher->claimed_by_staff_id)->toBe($staff->id);
});

it('validates reference_number parameter', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);
    $admin->assignRole(Role::ADMIN);

    // Try to claim voucher without reference_number
    $response = $this->actingAs($admin)
        ->postJson('/admin/vouchers/quick-claim', []);

    // Assert validation error
    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['reference_number']);
});

it('can access voucher scanner page as admin', function () {
    // Create admin user
    $admin = User::factory()->create(['role' => 'admin']);
    $admin->assignRole(Role::ADMIN);

    // Visit scanner page
    $response = $this->actingAs($admin)
        ->get('/admin/vouchers/scan');

    // Assert successful page load
    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/vouchers/scan')
        );
});

it('can access voucher scanner page as staff', function () {
    // Create staff user
    $staff = User::factory()->create(['role' => 'staff']);
    $staff->assignRole(Role::STAFF);

    // Visit scanner page
    $response = $this->actingAs($staff)
        ->get('/admin/vouchers/scan');

    // Assert successful page load
    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/vouchers/scan')
        );
});
