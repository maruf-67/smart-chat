<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Chat;
use Illuminate\Database\Seeder;

class ChatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 5 chats without agent (unassigned)
        Chat::factory()
            ->count(5)
            ->create();

        // Create 3 chats with agent assigned
        Chat::factory()
            ->count(3)
            ->withAgent()
            ->create();
    }
}
