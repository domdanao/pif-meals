<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateStaff extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'create:staff 
                            {name : The full name of the staff user}
                            {email : The email address of the staff user}
                            {--password= : The password for the staff user (will generate random if not provided)}
                            {--phone= : The phone number of the staff user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new staff user (non-interactive)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = $this->argument('name');
        $email = $this->argument('email');
        $password = $this->option('password') ?: Str::random(12);
        $phone = $this->option('phone');

        // Check if user already exists
        if (User::where('email', $email)->exists()) {
            $this->error("❌ User with email '{$email}' already exists!");
            return 1;
        }

        try {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'password' => Hash::make($password),
                'role' => 'staff',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $this->info('✅ Staff user created successfully!');
            $this->newLine();
            $this->info('📋 User Details:');
            $this->info("   ID: {$user->id}");
            $this->info("   Name: {$user->name}");
            $this->info("   Email: {$user->email}");
            $this->info("   Role: {$user->role}");
            $this->info("   Phone: " . ($user->phone ?: 'Not provided'));
            $this->newLine();
            $this->info('🔑 Login Credentials:');
            $this->info("   Email: {$email}");
            $this->info("   Password: {$password}");
            
            if (!$this->option('password')) {
                $this->warn('⚠️  Password was auto-generated. Please save it securely!');
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to create staff user: ' . $e->getMessage());
            return 1;
        }
    }
}
