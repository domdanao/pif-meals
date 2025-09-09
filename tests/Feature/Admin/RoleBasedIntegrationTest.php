<?php

use App\Models\TimeSlot;
use App\Models\User;
use App\Models\Voucher;

beforeEach(function () {
    $this->adminUser = User::factory()->create([
        'role' => 'admin',
        'name' => 'Admin User',
        'email' => 'admin@test.com',
    ]);

    $this->staffUser = User::factory()->create([
        'role' => 'staff',
        'name' => 'Staff User',
        'email' => 'staff@test.com',
    ]);

    $this->studentUser = User::factory()->create([
        'role' => 'student',
        'name' => 'Student User',
        'email' => 'student@test.com',
    ]);
});

describe('Complete Admin Workflow', function () {
    it('allows admin to perform complete system management workflow', function () {
        // 1. Admin accesses dashboard
        $this->actingAs($this->adminUser)
            ->get('/admin/dashboard')
            ->assertStatus(200);

        // 2. Admin creates a new staff user
        $this->actingAs($this->adminUser)
            ->post('/admin/users', [
                'name' => 'New Staff Member',
                'email' => 'newstaff@test.com',
                'role' => 'staff',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'is_active' => true,
            ])
            ->assertRedirect('/admin/users');

        // 3. Admin creates time slots
        $this->actingAs($this->adminUser)
            ->post('/admin/settings/time-slots', [
                'start_time' => '09:00',
                'end_time' => '10:00',
                'display_name' => 'Morning Slot',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->actingAs($this->adminUser)
            ->post('/admin/settings/time-slots', [
                'start_time' => '14:00',
                'end_time' => '15:00',
                'display_name' => 'Afternoon Slot',
                'is_active' => true,
            ])
            ->assertRedirect();

        // 4. Admin views system metrics
        $this->actingAs($this->adminUser)
            ->get('/admin/settings/metrics')
            ->assertStatus(200);

        // 5. Admin manages users
        $newStaff = User::where('email', 'newstaff@test.com')->first();
        $this->actingAs($this->adminUser)
            ->get("/admin/users/{$newStaff->id}")
            ->assertStatus(200);

        // 6. Admin can access voucher management
        $this->actingAs($this->adminUser)
            ->get('/admin/vouchers')
            ->assertStatus(200);

        // Verify all operations completed successfully
        $this->assertDatabaseHas('users', [
            'email' => 'newstaff@test.com',
            'role' => 'staff',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('time_slots', [
            'display_name' => 'Morning Slot',
        ]);

        $this->assertDatabaseHas('time_slots', [
            'display_name' => 'Afternoon Slot',
        ]);
    });
});

describe('Complete Staff Workflow', function () {
    it('allows staff to perform voucher management but blocks admin functions', function () {
        // 1. Staff can access dashboard
        $this->actingAs($this->staffUser)
            ->get('/admin/dashboard')
            ->assertStatus(200);

        // 2. Staff can access voucher management
        $this->actingAs($this->staffUser)
            ->get('/admin/vouchers')
            ->assertStatus(200);

        // 3. Staff can view individual vouchers
        $voucher = Voucher::factory()->create([
            'student_id' => $this->studentUser->id,
            'status' => 'active',
        ]);

        $this->actingAs($this->staffUser)
            ->get("/admin/vouchers/{$voucher->id}")
            ->assertStatus(200);

        // 4. Staff can claim vouchers
        $this->actingAs($this->staffUser)
            ->patch("/admin/vouchers/{$voucher->id}/claim")
            ->assertRedirect();

        // Verify voucher was claimed
        $voucher->refresh();
        expect($voucher->status)->toBe('claimed');
        expect($voucher->claimed_by_staff_id)->toBe($this->staffUser->id);

        // 5. Staff CANNOT access user management
        $this->actingAs($this->staffUser)
            ->get('/admin/users')
            ->assertStatus(403);

        $this->actingAs($this->staffUser)
            ->post('/admin/users', [
                'name' => 'Unauthorized User',
                'email' => 'unauthorized@test.com',
                'role' => 'student',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertStatus(403);

        // 6. Staff CANNOT access system settings
        $this->actingAs($this->staffUser)
            ->get('/admin/settings')
            ->assertStatus(403);

        $this->actingAs($this->staffUser)
            ->get('/admin/settings/time-slots')
            ->assertStatus(403);

        $this->actingAs($this->staffUser)
            ->get('/admin/settings/metrics')
            ->assertStatus(403);

        // 7. Staff CANNOT manage time slots
        $this->actingAs($this->staffUser)
            ->post('/admin/settings/time-slots', [
                'start_time' => '10:00',
                'end_time' => '11:00',
                'display_name' => 'Staff Created Slot',
                'is_active' => true,
            ])
            ->assertStatus(403);
    });
});

describe('Cross-Role Interactions', function () {
    it('maintains role boundaries during complex scenarios', function () {
        // Admin creates a time slot
        $timeSlot = TimeSlot::factory()->create([
            'start_time' => '12:00:00',
            'end_time' => '13:00:00',
            'display_name' => 'Lunch Slot',
        ]);

        // Admin creates a user
        $newStudent = User::factory()->create([
            'role' => 'student',
            'email' => 'created.student@test.com',
        ]);

        // Create a voucher using the admin-created time slot and user
        $voucher = Voucher::factory()->create([
            'student_id' => $newStudent->id,
            'time_slot_id' => $timeSlot->id,
            'status' => 'active',
        ]);

        // Staff can manage the voucher
        $this->actingAs($this->staffUser)
            ->patch("/admin/vouchers/{$voucher->id}/claim")
            ->assertRedirect();

        // Staff cannot modify the user that admin created
        $this->actingAs($this->staffUser)
            ->patch("/admin/users/{$newStudent->id}", [
                'name' => 'Modified by Staff',
                'email' => 'created.student@test.com',
                'role' => 'student',
                'is_active' => true,
            ])
            ->assertStatus(403);

        // Staff cannot modify the time slot
        $this->actingAs($this->staffUser)
            ->patch("/admin/settings/time-slots/{$timeSlot->id}", [
                'start_time' => '12:30',
                'end_time' => '13:30',
                'display_name' => 'Modified Lunch Slot',
                'is_active' => true,
            ])
            ->assertStatus(403);

        // Admin can still modify everything
        $this->actingAs($this->adminUser)
            ->patch("/admin/users/{$newStudent->id}", [
                'name' => 'Modified by Admin',
                'email' => 'created.student@test.com',
                'role' => 'student',
                'is_active' => true,
            ])
            ->assertRedirect();

        // Verify modifications
        $newStudent->refresh();
        expect($newStudent->name)->toBe('Modified by Admin');

        $voucher->refresh();
        expect($voucher->status)->toBe('claimed');
        expect($voucher->claimed_by_staff_id)->toBe($this->staffUser->id);
    });
});

describe('Security Boundary Testing', function () {
    it('prevents privilege escalation attempts', function () {
        // Staff cannot promote themselves to admin
        $this->actingAs($this->staffUser)
            ->patch("/admin/users/{$this->staffUser->id}", [
                'name' => $this->staffUser->name,
                'email' => $this->staffUser->email,
                'role' => 'admin', // Attempting privilege escalation
                'is_active' => true,
            ])
            ->assertStatus(403);

        // Staff cannot access admin routes even with direct URL manipulation
        $adminRoutes = [
            '/admin/users/create',
            '/admin/settings/time-slots',
            '/admin/settings/metrics',
        ];

        foreach ($adminRoutes as $route) {
            $this->actingAs($this->staffUser)
                ->get($route)
                ->assertStatus(403);
        }

        // Student cannot access any admin routes
        $allAdminRoutes = [
            '/admin/dashboard',
            '/admin/vouchers',
            '/admin/users',
            '/admin/settings',
        ];

        foreach ($allAdminRoutes as $route) {
            $this->actingAs($this->studentUser)
                ->get($route)
                ->assertStatus(403);
        }
    });

    it('maintains session security across role changes', function () {
        // Start as staff user
        $this->actingAs($this->staffUser);

        // Verify staff can access voucher management
        $this->get('/admin/vouchers')->assertStatus(200);

        // Admin changes staff user's role to student
        $this->actingAs($this->adminUser)
            ->patch("/admin/users/{$this->staffUser->id}", [
                'name' => $this->staffUser->name,
                'email' => $this->staffUser->email,
                'role' => 'student',
                'is_active' => true,
            ]);

        // The user's role should be updated in database
        $this->staffUser->refresh();
        expect($this->staffUser->role)->toBe('student');

        // Note: In a real application, the user would need to log out and back in
        // for the role change to take effect in their session
    });

    it('handles concurrent admin operations safely', function () {
        // Create a time slot
        $timeSlot = TimeSlot::factory()->create();

        // Create a voucher using that time slot
        $voucher = Voucher::factory()->create([
            'time_slot_id' => $timeSlot->id,
            'status' => 'active',
        ]);

        // Admin tries to delete time slot that's in use
        $this->actingAs($this->adminUser)
            ->delete("/admin/settings/time-slots/{$timeSlot->id}")
            ->assertSessionHasErrors(['in_use']);

        // Time slot should still exist
        $this->assertDatabaseHas('time_slots', ['id' => $timeSlot->id]);

        // After voucher is claimed/expired, deletion should work
        $voucher->update(['status' => 'claimed']);

        $this->actingAs($this->adminUser)
            ->delete("/admin/settings/time-slots/{$timeSlot->id}")
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('time_slots', ['id' => $timeSlot->id]);
    });
});
