<?php

use App\Models\Donation;
use App\Models\User;
use App\Models\Voucher;

beforeEach(function () {
    $this->adminUser = User::factory()->create(['role' => 'admin']);
    $this->staffUser = User::factory()->create(['role' => 'staff']);
    $this->testUser = User::factory()->create(['role' => 'student']);
});

describe('User Management Access Control', function () {
    it('allows admin to access user index', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/users')
            ->assertStatus(200);
    });

    it('denies staff access to user index', function () {
        $this->actingAs($this->staffUser)
            ->get('/admin/users')
            ->assertStatus(403);
    });
});

describe('User Creation', function () {
    it('allows admin to create new user', function () {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '1234567890',
            'role' => 'student',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'is_active' => true,
        ];

        $this->actingAs($this->adminUser)
            ->post('/admin/users', $userData)
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success', 'User created successfully.');

        $this->assertDatabaseHas('users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'student',
            'is_active' => true,
        ]);
    });

    it('validates required fields when creating user', function () {
        $this->actingAs($this->adminUser)
            ->post('/admin/users', [])
            ->assertSessionHasErrors(['name', 'email', 'role', 'password']);
    });

    it('validates email uniqueness when creating user', function () {
        $existingUser = User::factory()->create();

        $this->actingAs($this->adminUser)
            ->post('/admin/users', [
                'name' => 'Test User',
                'email' => $existingUser->email,
                'role' => 'student',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertSessionHasErrors(['email']);
    });

    it('validates password confirmation', function () {
        $this->actingAs($this->adminUser)
            ->post('/admin/users', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'role' => 'student',
                'password' => 'password123',
                'password_confirmation' => 'different_password',
            ])
            ->assertSessionHasErrors(['password']);
    });

    it('creates user with admin role', function () {
        $userData = [
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'is_active' => true,
        ];

        $this->actingAs($this->adminUser)
            ->post('/admin/users', $userData)
            ->assertRedirect('/admin/users');

        $this->assertDatabaseHas('users', [
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);
    });
});

describe('User Display and Editing', function () {
    it('allows admin to view user details', function () {
        $this->actingAs($this->adminUser)
            ->get("/admin/users/{$this->testUser->id}")
            ->assertStatus(200);
    });

    it('allows admin to edit user', function () {
        $this->actingAs($this->adminUser)
            ->get("/admin/users/{$this->testUser->id}/edit")
            ->assertStatus(200);
    });

    it('allows admin to update user details', function () {
        $updateData = [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'phone' => '9876543210',
            'role' => 'staff',
            'is_active' => false,
        ];

        $this->actingAs($this->adminUser)
            ->patch("/admin/users/{$this->testUser->id}", $updateData)
            ->assertRedirect("/admin/users/{$this->testUser->id}")
            ->assertSessionHas('success', 'User updated successfully.');

        $this->assertDatabaseHas('users', [
            'id' => $this->testUser->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'staff',
            'is_active' => false,
        ]);
    });

    it('validates email uniqueness when updating user', function () {
        $anotherUser = User::factory()->create();

        $this->actingAs($this->adminUser)
            ->patch("/admin/users/{$this->testUser->id}", [
                'name' => 'Test Name',
                'email' => $anotherUser->email,
                'role' => 'student',
                'is_active' => true,
            ])
            ->assertSessionHasErrors(['email']);
    });

    it('allows updating password when provided', function () {
        $this->actingAs($this->adminUser)
            ->patch("/admin/users/{$this->testUser->id}", [
                'name' => 'Test Name',
                'email' => 'test@example.com',
                'role' => 'student',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
                'is_active' => true,
            ])
            ->assertRedirect("/admin/users/{$this->testUser->id}");

        // Verify password was updated (we can't directly check the hash)
        $this->testUser->refresh();
        expect(\Hash::check('newpassword123', $this->testUser->password))->toBeTrue();
    });
});

describe('User Status Management', function () {
    it('allows admin to toggle user status', function () {
        // Ensure we start with a known state
        $this->testUser->update(['is_active' => true]);

        $this->actingAs($this->adminUser)
            ->patch("/admin/users/{$this->testUser->id}/toggle-status")
            ->assertRedirect()
            ->assertSessionHas('success');

        // Should now be false (inactive)
        $this->assertDatabaseHas('users', [
            'id' => $this->testUser->id,
            'is_active' => 0,
        ]);

        // Toggle again
        $this->actingAs($this->adminUser)
            ->patch("/admin/users/{$this->testUser->id}/toggle-status")
            ->assertRedirect()
            ->assertSessionHas('success');

        // Should now be true (active) again
        $this->assertDatabaseHas('users', [
            'id' => $this->testUser->id,
            'is_active' => 1,
        ]);
    });

    it('prevents admin from deactivating themselves', function () {
        $this->actingAs($this->adminUser)
            ->patch("/admin/users/{$this->adminUser->id}/toggle-status")
            ->assertRedirect()
            ->assertSessionHasErrors(['general']);

        // Verify status hasn't changed
        $this->adminUser->refresh();
        expect($this->adminUser->is_active)->toBeTrue();
    });
});

describe('User Deletion', function () {
    it('allows admin to delete user without vouchers or donations', function () {
        $userToDelete = User::factory()->create(['role' => 'student']);

        $this->actingAs($this->adminUser)
            ->delete("/admin/users/{$userToDelete->id}")
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success', 'User deleted successfully.');

        $this->assertDatabaseMissing('users', ['id' => $userToDelete->id]);
    });

    it('prevents deletion of user with vouchers', function () {
        $userWithVouchers = User::factory()->create(['role' => 'student']);
        Voucher::factory()->create(['student_id' => $userWithVouchers->id]);

        $this->actingAs($this->adminUser)
            ->delete("/admin/users/{$userWithVouchers->id}")
            ->assertRedirect()
            ->assertSessionHasErrors(['general']);

        $this->assertDatabaseHas('users', ['id' => $userWithVouchers->id]);
    });

    it('prevents deletion of user with donations', function () {
        $userWithDonations = User::factory()->create(['role' => 'donor']);
        Donation::factory()->create(['donor_id' => $userWithDonations->id]);

        $this->actingAs($this->adminUser)
            ->delete("/admin/users/{$userWithDonations->id}")
            ->assertRedirect()
            ->assertSessionHasErrors(['general']);

        $this->assertDatabaseHas('users', ['id' => $userWithDonations->id]);
    });

    it('prevents admin from deleting themselves', function () {
        $this->actingAs($this->adminUser)
            ->delete("/admin/users/{$this->adminUser->id}")
            ->assertRedirect()
            ->assertSessionHasErrors(['general']);

        $this->assertDatabaseHas('users', ['id' => $this->adminUser->id]);
    });
});

describe('User Filtering and Search', function () {
    beforeEach(function () {
        User::factory()->create(['role' => 'admin', 'name' => 'Admin Test', 'is_active' => true]);
        User::factory()->create(['role' => 'staff', 'name' => 'Staff Test', 'is_active' => false]);
        User::factory()->create(['role' => 'student', 'name' => 'Student Test', 'is_active' => true]);
        User::factory()->create(['role' => 'donor', 'name' => 'Donor Test', 'is_active' => true]);
    });

    it('filters users by role', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/users?role=admin')
            ->assertStatus(200);
    });

    it('filters users by status', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/users?status=active')
            ->assertStatus(200);
    });

    it('searches users by name and email', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/users?search=Admin')
            ->assertStatus(200);
    });
});
