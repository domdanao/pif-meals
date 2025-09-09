<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:admin 
                            {name : The full name of the admin user}
                            {email : The email address of the admin user}
                            {--role=admin : The role of the user (admin or staff)}
                            {--phone= : The phone number of the admin user}
                            {--password= : The password for the admin user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new admin or staff user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $email = $this->argument('email');
        $role = $this->option('role');
        $phone = $this->option('phone');
        $password = $this->option('password');

        // Validate role
        if (! in_array($role, ['admin', 'staff'])) {
            $this->error('Role must be either "admin" or "staff"');

            return 1;
        }

        // Validate email
        $validator = Validator::make(['email' => $email], [
            'email' => 'required|email|unique:users,email',
        ]);

        if ($validator->fails()) {
            $this->error('Invalid or existing email address');

            return 1;
        }

        // Get phone number if not provided (non-interactive)
        if (! $phone) {
            $phone = null; // Allow null phone numbers
        }

        // Get password if not provided (non-interactive)
        if (! $password) {
            $password = \Illuminate\Support\Str::random(12);
            $this->info("Generated password: {$password}");
        }

        // Create the user
        try {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'password' => Hash::make($password),
                'role' => $role,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $this->info("✅ {$role} user created successfully!");
            $this->table(
                ['Field', 'Value'],
                [
                    ['ID', $user->id],
                    ['Name', $user->name],
                    ['Email', $user->email],
                    ['Role', $user->role],
                    ['Phone', $user->phone ?? 'N/A'],
                ]
            );

            $this->info('🔑 Login credentials:');
            $this->info("   Email: {$email}");
            $this->info("   Password: {$password}");
            $this->info('   Admin URL: '.url('/admin/dashboard'));

            return 0;
        } catch (\Exception $e) {
            $this->error('Failed to create user: '.$e->getMessage());

            return 1;
        }
    }
}
