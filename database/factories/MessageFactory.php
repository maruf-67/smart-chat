<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\MessageSender;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'chat_id' => Chat::factory(),
            'user_id' => null,
            'content' => fake()->sentence(),
            'is_auto_reply' => false,
            'sender' => MessageSender::Guest,
            'created_by' => null,
            'updated_by' => null,
            'created_ip' => fake()->ipv4(),
            'updated_ip' => fake()->ipv4(),
        ];
    }

    /**
     * State: Agent message.
     */
    public function fromAgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'sender' => MessageSender::Agent,
            'user_id' => User::where('user_type', 'agent')->first()?->id,
            'created_by' => User::where('user_type', 'agent')->first()?->id,
            'updated_by' => User::where('user_type', 'agent')->first()?->id,
        ]);
    }

    /**
     * State: Auto-reply message.
     */
    public function autoReply(): static
    {
        return $this->state(fn (array $attributes) => [
            'sender' => MessageSender::Bot,
            'is_auto_reply' => true,
            'user_id' => null,
            'created_by' => null,
            'updated_by' => null,
        ]);
    }
}
