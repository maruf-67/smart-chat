<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AutoReplyRule>
 */
class AutoReplyRuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'keyword' => fake()->word(),
            'reply_message' => fake()->sentence(10),
            'is_active' => true,
            'created_by' => User::where('user_type', 'admin')->first()?->id,
            'updated_by' => User::where('user_type', 'admin')->first()?->id,
            'created_ip' => fake()->ipv4(),
            'updated_ip' => fake()->ipv4(),
        ];
    }
}
