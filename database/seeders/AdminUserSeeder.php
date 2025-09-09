<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default admin user
        User::updateOrCreate(
            ['email' => 'admin@pif-meals.test'],
            [
                'name' => 'System Administrator',
                'email' => 'admin@pif-meals.test',
                'phone' => '+639123456789',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create a staff user for testing
        User::updateOrCreate(
            ['email' => 'staff@pif-meals.test'],
            [
                'name' => 'Banned Books Staff',
                'email' => 'staff@pif-meals.test',
                'phone' => '+639987654321',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create a sample student for testing
        User::updateOrCreate(
            ['email' => 'student@uplb.edu.ph'],
            [
                'name' => 'Juan dela Cruz',
                'email' => 'student@uplb.edu.ph',
                'phone' => '+639111222333',
                'password' => Hash::make('password'),
                'role' => 'student',
                'course' => 'Computer Science',
                'year_level' => '3rd Year',
                'student_id' => '2021-12345',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Admin users created successfully!');
        $this->command->info('Admin: admin@pif-meals.test / password');
        $this->command->info('Staff: staff@pif-meals.test / password');
        $this->command->info('Student: student@uplb.edu.ph / password');
    }
}
