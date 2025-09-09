<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create all roles
        $roles = [
            [
                'name' => Role::STUDENT,
                'display_name' => 'Student',
                'description' => 'Students who can request meals',
            ],
            [
                'name' => Role::DONOR,
                'display_name' => 'Donor',
                'description' => 'Users who make donations to support meals',
            ],
            [
                'name' => Role::STAFF,
                'display_name' => 'Staff',
                'description' => 'Staff members who can manage vouchers and system operations',
            ],
            [
                'name' => Role::ADMIN,
                'display_name' => 'Admin',
                'description' => 'Administrators with full system access',
            ],
        ];

        foreach ($roles as $roleData) {
            Role::firstOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );
        }

        // Migrate existing users from the old role system to the new one
        $this->migrateExistingUsers();
    }

    private function migrateExistingUsers(): void
    {
        // Get all users who have a role in the old 'role' column
        $users = User::whereNotNull('role')->get();

        foreach ($users as $user) {
            $oldRole = $user->role;

            // Find the corresponding role in the new system
            $role = Role::where('name', $oldRole)->first();

            if ($role && ! $user->hasRole($oldRole)) {
                $user->roles()->attach($role->id);
                $this->command->info("Migrated user {$user->email} to role {$oldRole}");
            }
        }
    }
}
