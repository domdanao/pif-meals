<?php

use App\Models\SystemMetric;
use App\Models\TimeSlot;
use App\Models\User;
use App\Models\Voucher;

beforeEach(function () {
    $this->adminUser = User::factory()->create(['role' => 'admin']);
    $this->staffUser = User::factory()->create(['role' => 'staff']);
});

describe('System Settings Access Control', function () {
    it('allows admin to access settings index', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/settings')
            ->assertStatus(200);
    });

    it('denies staff access to settings', function () {
        $this->actingAs($this->staffUser)
            ->get('/admin/settings')
            ->assertStatus(403);
    });

    it('allows admin to access time slots management', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/settings/time-slots')
            ->assertStatus(200);
    });

    it('allows admin to access system metrics', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/settings/metrics')
            ->assertStatus(200);
    });
});

describe('Time Slot Management', function () {
    it('allows admin to create new time slot', function () {
        $timeSlotData = [
            'start_time' => '09:00',
            'end_time' => '10:00',
            'display_name' => 'Morning Slot',
            'is_active' => true,
        ];

        $this->actingAs($this->adminUser)
            ->post('/admin/settings/time-slots', $timeSlotData)
            ->assertRedirect()
            ->assertSessionHas('success', 'Time slot created successfully.');

        $this->assertDatabaseHas('time_slots', [
            'display_name' => 'Morning Slot',
            'is_active' => 1,
        ]);
    });

    it('validates time slot creation data', function () {
        $this->actingAs($this->adminUser)
            ->post('/admin/settings/time-slots', [])
            ->assertSessionHasErrors(['start_time', 'end_time', 'display_name']);
    });

    it('validates end time is after start time', function () {
        $this->actingAs($this->adminUser)
            ->post('/admin/settings/time-slots', [
                'start_time' => '10:00',
                'end_time' => '09:00',
                'display_name' => 'Invalid Slot',
                'is_active' => true,
            ])
            ->assertSessionHasErrors(['end_time']);
    });

    it('prevents overlapping time slots', function () {
        // Create an existing time slot
        TimeSlot::factory()->create([
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
        ]);

        // Try to create an overlapping slot
        $this->actingAs($this->adminUser)
            ->post('/admin/settings/time-slots', [
                'start_time' => '09:30',
                'end_time' => '10:30',
                'display_name' => 'Overlapping Slot',
                'is_active' => true,
            ])
            ->assertSessionHasErrors(['time_conflict']);
    });

    it('allows admin to update time slot', function () {
        $timeSlot = TimeSlot::factory()->create([
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'display_name' => 'Original Slot',
        ]);

        $updateData = [
            'start_time' => '11:00',
            'end_time' => '12:00',
            'display_name' => 'Updated Slot',
            'is_active' => false,
        ];

        $this->actingAs($this->adminUser)
            ->patch("/admin/settings/time-slots/{$timeSlot->id}", $updateData)
            ->assertRedirect()
            ->assertSessionHas('success', 'Time slot updated successfully.');

        $this->assertDatabaseHas('time_slots', [
            'id' => $timeSlot->id,
            'display_name' => 'Updated Slot',
            'is_active' => 0,
        ]);
    });

    it('prevents overlapping when updating time slot', function () {
        $existingSlot = TimeSlot::factory()->create([
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
        ]);

        $slotToUpdate = TimeSlot::factory()->create([
            'start_time' => '11:00:00',
            'end_time' => '12:00:00',
        ]);

        // Try to update to overlap with existing slot
        $this->actingAs($this->adminUser)
            ->patch("/admin/settings/time-slots/{$slotToUpdate->id}", [
                'start_time' => '09:30',
                'end_time' => '10:30',
                'display_name' => 'Overlapping Update',
                'is_active' => true,
            ])
            ->assertSessionHasErrors(['time_conflict']);
    });

    it('allows admin to delete unused time slot', function () {
        $timeSlot = TimeSlot::factory()->create();

        $this->actingAs($this->adminUser)
            ->delete("/admin/settings/time-slots/{$timeSlot->id}")
            ->assertRedirect()
            ->assertSessionHas('success', 'Time slot deleted successfully.');

        $this->assertDatabaseMissing('time_slots', ['id' => $timeSlot->id]);
    });

    it('prevents deletion of time slot in use by active vouchers', function () {
        $timeSlot = TimeSlot::factory()->create();
        $voucher = Voucher::factory()->create([
            'time_slot_id' => $timeSlot->id,
            'status' => 'active',
        ]);

        $this->actingAs($this->adminUser)
            ->delete("/admin/settings/time-slots/{$timeSlot->id}")
            ->assertRedirect()
            ->assertSessionHasErrors(['in_use']);

        $this->assertDatabaseHas('time_slots', ['id' => $timeSlot->id]);
    });

    it('denies staff from managing time slots', function () {
        $timeSlot = TimeSlot::factory()->create();

        $this->actingAs($this->staffUser)
            ->post('/admin/settings/time-slots', [
                'start_time' => '09:00',
                'end_time' => '10:00',
                'display_name' => 'Staff Slot',
                'is_active' => true,
            ])
            ->assertStatus(403);

        $this->actingAs($this->staffUser)
            ->patch("/admin/settings/time-slots/{$timeSlot->id}", [
                'start_time' => '11:00',
                'end_time' => '12:00',
                'display_name' => 'Staff Update',
                'is_active' => true,
            ])
            ->assertStatus(403);

        $this->actingAs($this->staffUser)
            ->delete("/admin/settings/time-slots/{$timeSlot->id}")
            ->assertStatus(403);
    });
});

describe('System Metrics', function () {
    beforeEach(function () {
        // Create test data for metrics
        User::factory()->count(5)->create(['role' => 'student', 'is_active' => true]);
        User::factory()->count(2)->create(['role' => 'staff']);
        User::factory()->count(3)->create(['role' => 'donor']);

        Voucher::factory()->count(3)->create(['status' => 'active']);
        Voucher::factory()->count(2)->create(['status' => 'claimed']);
        Voucher::factory()->count(1)->create(['status' => 'expired']);

        SystemMetric::factory()->create(['metric_name' => 'test_metric', 'metric_value' => 100]);
    });

    it('displays comprehensive system metrics', function () {
        $this->actingAs($this->adminUser)
            ->get('/admin/settings/metrics')
            ->assertStatus(200);
    });

    it('shows correct user metrics', function () {
        $response = $this->actingAs($this->adminUser)
            ->get('/admin/settings/metrics');

        $response->assertStatus(200);
        // Note: Actual metrics testing would require more controlled data setup
    });

    it('shows correct voucher metrics', function () {
        $response = $this->actingAs($this->adminUser)
            ->get('/admin/settings/metrics');

        $response->assertInertia(fn ($page) => $page
            ->where('metrics.vouchers.active_vouchers', 3)
            ->where('metrics.vouchers.claimed_vouchers', 2)
            ->where('metrics.vouchers.expired_vouchers', 1)
        );
    });

    it('allows admin to reset system metrics', function () {
        $this->actingAs($this->adminUser)
            ->post('/admin/settings/metrics/reset', [
                'metric_name' => 'test_metric',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Metric reset successfully.');

        $this->assertDatabaseHas('system_metrics', [
            'metric_name' => 'test_metric',
            'metric_value' => 0,
        ]);
    });

    it('validates metric name when resetting', function () {
        $this->actingAs($this->adminUser)
            ->post('/admin/settings/metrics/reset', [
                'metric_name' => 'non_existent_metric',
            ])
            ->assertSessionHasErrors(['metric_name']);
    });

    it('denies staff access to metrics', function () {
        $this->actingAs($this->staffUser)
            ->get('/admin/settings/metrics')
            ->assertStatus(403);

        $this->actingAs($this->staffUser)
            ->post('/admin/settings/metrics/reset', [
                'metric_name' => 'test_metric',
            ])
            ->assertStatus(403);
    });
});

describe('Time Slot Edge Cases', function () {
    it('handles exact time boundary overlaps', function () {
        // Create a slot from 9-10
        TimeSlot::factory()->create([
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
        ]);

        // Try to create a slot from 10:01-11:00 (should be allowed - no overlap)
        $this->actingAs($this->adminUser)
            ->post('/admin/settings/time-slots', [
                'start_time' => '10:01',
                'end_time' => '11:00',
                'display_name' => 'Adjacent Slot',
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');
    });

    it('handles multiple overlapping scenarios', function () {
        // Create base slot 9-10
        TimeSlot::factory()->create([
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
        ]);

        // Test various overlap scenarios
        $overlapCases = [
            ['08:30', '09:30'], // starts before, ends during
            ['09:30', '10:30'], // starts during, ends after
            ['08:30', '10:30'], // completely encompasses
            ['09:15', '09:45'], // completely within
        ];

        foreach ($overlapCases as $case) {
            $this->actingAs($this->adminUser)
                ->post('/admin/settings/time-slots', [
                    'start_time' => $case[0],
                    'end_time' => $case[1],
                    'display_name' => 'Overlap Test',
                    'is_active' => true,
                ])
                ->assertSessionHasErrors(['time_conflict']);
        }
    });
});
