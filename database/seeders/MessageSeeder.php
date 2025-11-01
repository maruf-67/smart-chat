<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // For each chat, create messages (guest messages, agent responses, auto-replies)
        Chat::all()->each(function (Chat $chat): void {
            // 2-3 guest messages
            Message::factory()
                ->count(fake()->numberBetween(2, 3))
                ->create(['chat_id' => $chat->id]);

            // If chat has agent, add agent responses
            if ($chat->agent_id) {
                Message::factory()
                    ->count(fake()->numberBetween(1, 2))
                    ->fromAgent()
                    ->create(['chat_id' => $chat->id]);
            } else {
                // Otherwise add auto-replies
                Message::factory()
                    ->count(fake()->numberBetween(1, 2))
                    ->autoReply()
                    ->create(['chat_id' => $chat->id]);
            }
        });
    }
}
