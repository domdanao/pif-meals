<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DefaultDataSeeder extends Seeder
{
    public function run(): void
    {
        // Insert default time slots
        $timeSlots = [
            [
                'id' => Str::uuid(),
                'start_time' => '11:00:00',
                'end_time' => '13:00:00',
                'display_name' => '11am - 1pm',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'start_time' => '17:00:00',
                'end_time' => '19:00:00',
                'display_name' => '5pm - 7pm',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('time_slots')->insert($timeSlots);

        // Insert default system metrics
        $metrics = [
            [
                'id' => Str::uuid(),
                'metric_name' => 'total_meals_available',
                'metric_value' => 0,
                'last_updated' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'metric_name' => 'total_meals_claimed',
                'metric_value' => 0,
                'last_updated' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'metric_name' => 'total_pledges_active',
                'metric_value' => 0,
                'last_updated' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'metric_name' => 'total_donations_received',
                'metric_value' => 0,
                'last_updated' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('system_metrics')->insert($metrics);

        // Create a default staff user
        DB::table('users')->insert([
            'id' => Str::uuid(),
            'name' => 'Banned Books Staff',
            'email' => 'staff@bannedbooks.ph',
            'phone' => '09123456789',
            'role' => 'staff',
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create a default admin user
        $adminId = Str::uuid();
        DB::table('users')->insert([
            'id' => $adminId,
            'name' => 'System Administrator',
            'email' => 'admin@pifmeals.ph',
            'phone' => '09198765432',
            'role' => 'admin',
            'password' => bcrypt('admin123'),
            'email_verified_at' => now(),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create a test donation to fund some meals
        $donationId = Str::uuid();
        DB::table('donations')->insert([
            'id' => $donationId,
            'donor_id' => $adminId, // Admin is also a donor for testing
            'amount' => 650.00, // 10 meals worth
            'meal_count' => 10,
            'payment_method' => 'test',
            'payment_reference' => 'TEST-DONATION-001',
            'payment_status' => 'completed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create meal inventory from the donation
        for ($i = 0; $i < 10; $i++) {
            DB::table('meal_inventory')->insert([
                'id' => Str::uuid(),
                'donation_id' => $donationId,
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Update metrics to reflect available meals
        DB::table('system_metrics')
            ->where('metric_name', 'total_meals_available')
            ->update(['metric_value' => 10, 'last_updated' => now()]);
    }
}
