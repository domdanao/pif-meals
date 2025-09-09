<?php

use App\Models\TimeSlot;
use App\Models\User;

beforeEach(function () {
    $this->adminUser = User::factory()->create(['role' => 'admin']);
    $this->staffUser = User::factory()->create(['role' => 'staff']);
    $this->studentUser = User::factory()->create(['role' => 'student']);
});

describe('Admin-only Routes', function () {
    it('allows admin to access user management', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/users')
            ->assertStatus(200);
    });

    it('denies staff access to user management', function () {
        $this->actingAs($this->staffUser)
            ->get('/admin/users')
            ->assertStatus(403);
    });

    it('denies students access to user management', function () {
        $this->actingAs($this->studentUser)
            ->get('/admin/users')
            ->assertStatus(403);
    });

    it('allows admin to access system settings', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/settings')
            ->assertStatus(200);
    });

    it('denies staff access to system settings', function () {
        $this->actingAs($this->staffUser)
            ->get('/admin/settings')
            ->assertStatus(403);
    });

    it('allows admin to access time slots management', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/settings/time-slots')
            ->assertStatus(200);
    });

    it('denies staff access to time slots management', function () {
        $this->actingAs($this->staffUser)
            ->get('/admin/settings/time-slots')
            ->assertStatus(403);
    });

    it('allows admin to access system metrics', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/settings/metrics')
            ->assertStatus(200);
    });

    it('denies staff access to system metrics', function () {
        $this->actingAs($this->staffUser)
            ->get('/admin/settings/metrics')
            ->assertStatus(403);
    });

    it('allows admin to create new users', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/users/create')
            ->assertStatus(200);
    });

    it('denies staff from creating new users', function () {
        $this->actingAs($this->staffUser)
            ->get('/admin/users/create')
            ->assertStatus(403);
    });
});

describe('Staff-accessible Routes', function () {
    it('allows admin to access dashboard', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/dashboard')
            ->assertStatus(200);
    });

    it('allows staff to access dashboard', function () {
        $this->actingAs($this->staffUser)
            ->get('/admin/dashboard')
            ->assertStatus(200);
    });

    it('denies students access to dashboard', function () {
        $this->actingAs($this->studentUser)
            ->get('/admin/dashboard')
            ->assertStatus(403);
    });

    it('allows admin to access voucher management', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/vouchers')
            ->assertStatus(200);
    });

    it('allows staff to access voucher management', function () {
        $this->actingAs($this->staffUser)
            ->get('/admin/vouchers')
            ->assertStatus(200);
    });

    it('denies students access to voucher management', function () {
        $this->actingAs($this->studentUser)
            ->get('/admin/vouchers')
            ->assertStatus(403);
    });
});

describe('Unauthenticated Access', function () {
    it('redirects to login for admin routes', function () {
        $this->get('/admin/dashboard')
            ->assertRedirect('/login');
    });

    it('redirects to login for admin-only routes', function () {
        $this->get('/admin/users')
            ->assertRedirect('/login');
    });

    it('redirects to login for system settings', function () {
        $this->get('/admin/settings')
            ->assertRedirect('/login');
    });
});

describe('Route Parameters', function () {
    it('allows admin to view specific user', function () {
        $user = User::factory()->create();

        $this->actingAs($this->adminUser)
            ->get("/admin/users/{$user->id}")
            ->assertStatus(200);
    });

    it('denies staff from viewing specific user', function () {
        $user = User::factory()->create();

        $this->actingAs($this->staffUser)
            ->get("/admin/users/{$user->id}")
            ->assertStatus(403);
    });

    it('allows admin to edit users', function () {
        $user = User::factory()->create();

        $this->actingAs($this->adminUser)
            ->get("/admin/users/{$user->id}/edit")
            ->assertStatus(200);
    });

    it('allows admin to manage time slots', function () {
        $timeSlot = TimeSlot::factory()->create();

        $this->actingAs($this->adminUser)
            ->patch("/admin/settings/time-slots/{$timeSlot->id}", [
                'start_time' => '10:00',
                'end_time' => '11:00',
                'display_name' => 'Updated Slot',
                'is_active' => true,
            ])
            ->assertRedirect();
    });

    it('denies staff from managing time slots', function () {
        $timeSlot = TimeSlot::factory()->create();

        $this->actingAs($this->staffUser)
            ->patch("/admin/settings/time-slots/{$timeSlot->id}", [
                'start_time' => '10:00',
                'end_time' => '11:00',
                'display_name' => 'Updated Slot',
                'is_active' => true,
            ])
            ->assertStatus(403);
    });
});
