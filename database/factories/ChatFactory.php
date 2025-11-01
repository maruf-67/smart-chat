<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Chat>
 */
class ChatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'guest_identifier' => fake()->uuid(),
            'agent_id' => null,
            'auto_reply_enabled' => true,
            'last_activity_at' => now(),
            'created_by' => User::where('user_type', 'admin')->first()?->id,
            'updated_by' => User::where('user_type', 'admin')->first()?->id,
            'created_ip' => fake()->ipv4(),
            'updated_ip' => fake()->ipv4(),
        ];
    }

    /**
     * State: Chat assigned to an agent.
     */
    public function withAgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'agent_id' => User::where('user_type', 'agent')->first()?->id,
            'auto_reply_enabled' => false,
        ]);
    }
}
