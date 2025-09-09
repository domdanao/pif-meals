<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed PIF-specific data first
        $this->call(DefaultDataSeeder::class);
        $this->call(AdminUserSeeder::class);
        $this->call(TimeSlotSeeder::class);
        $this->call(RoleSeeder::class);

        // Create a test student user
        User::factory()->create([
            'name' => 'Test Student',
            'email' => 'student@example.com',
            'role' => 'student',
            'course' => 'BS Computer Science',
            'year_level' => '3rd Year',
            'student_id' => '2021-12345',
        ]);

        // Create a test donor user
        User::factory()->create([
            'name' => 'Test Donor',
            'email' => 'donor@example.com',
            'role' => 'donor',
        ]);
    }
}
