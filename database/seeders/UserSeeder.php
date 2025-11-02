<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test admin user
        User::factory()
            ->admin()
            ->create([
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@test.local',
                'phone' => '+1234567890',
            ]);

        // Create test agent user
        User::factory()
            ->agent()
            ->create([
                'first_name' => 'Agent',
                'last_name' => 'User',
                'email' => 'agent@test.local',
                'phone' => '+1234567891',
            ]);

        // Create test guest user (no role assignment, relies on default)
        User::factory()
            ->create([
                'first_name' => 'Guest',
                'last_name' => 'User',
                'email' => 'guest@test.local',
                'phone' => '+1234567892',
                'user_type' => 'guest',
                'role_id' => 3, // Guest role
            ]);
    }
}
