<?php

use App\Models\MealInventory;
use App\Models\Role;
use App\Models\TimeSlot;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can display a voucher page with voucher details', function () {
    // Create necessary data
    $timeSlot = TimeSlot::create([
        'display_name' => 'Lunch Time',
        'start_time' => '12:00:00',
        'end_time' => '13:00:00',
        'is_active' => true,
    ]);

    $student = User::factory()->create([
        'name' => 'John Doe',
        'course' => 'Computer Science',
        'year_level' => 'Third Year',
        'phone' => '09123456789',
    ]);
    $student->assignRole(Role::STUDENT);

    $mealInventory = MealInventory::factory()->create([
        'status' => 'reserved',
    ]);

    $voucher = Voucher::factory()->create([
        'student_id' => $student->id,
        'meal_inventory_id' => $mealInventory->id,
        'time_slot_id' => $timeSlot->id,
        'scheduled_date' => today(),
        'student_name' => $student->name,
        'student_course' => $student->course,
        'student_year' => $student->year_level,
        'student_phone' => $student->phone,
    ]);

    // Visit the voucher page
    $response = $this->get("/students/voucher/{$voucher->reference_number}");

    // Assert the response is successful
    $response->assertOk();

    // Assert that the voucher data is passed to the page
    $response->assertInertia(fn ($page) => $page
        ->component('students/voucher')
        ->has('voucher')
        ->where('voucher.reference_number', $voucher->reference_number)
        ->where('voucher.student_name', $student->name)
        ->where('voucher.student_course', $student->course)
        ->where('voucher.time_slot.display_name', $timeSlot->display_name)
    );
});

it('returns 404 for non-existent voucher reference number', function () {
    $response = $this->get('/students/voucher/INVALID-REFERENCE');

    $response->assertNotFound();
});

it('voucher has correct properties for QR code generation', function () {
    $timeSlot = TimeSlot::create([
        'display_name' => 'Lunch Time',
        'start_time' => '12:00:00',
        'end_time' => '13:00:00',
        'is_active' => true,
    ]);

    $student = User::factory()->create();
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
    ]);

    // Assert voucher has a reference number (this is what our QR code will contain)
    expect($voucher->reference_number)->not->toBeEmpty();
    expect($voucher->reference_number)->toBeString();

    // Visit the voucher page
    $response = $this->get("/students/voucher/{$voucher->reference_number}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('students/voucher')
        ->has('voucher')
        ->where('voucher.reference_number', $voucher->reference_number)
    );
});
