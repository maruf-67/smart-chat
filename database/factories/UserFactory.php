<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= 'password',
            'phone' => fake()->phoneNumber(),
            'image' => null,
            'status' => true,
            'user_type' => 'agent', // Default to agent
            'role_id' => null, // Will be set by seeder
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model does not have two-factor authentication configured.
     */
    public function withoutTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => 'admin',
            'role_id' => 1, // Admin role
            'status' => true,
        ]);
    }

    public function agent(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => 'agent',
            'role_id' => 2, // Agent role
            'status' => true,
        ]);
    }
}
