<?php

namespace Database\Factories;

use App\Models\Donation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DonationFactory extends Factory
{
    protected $model = Donation::class;

    public function definition(): array
    {
        $donor = User::factory()->create(['role' => 'donor']);

        return [
            'donor_id' => $donor->id,
            'amount' => $this->faker->numberBetween(10, 1000),
            'meal_count' => $this->faker->numberBetween(1, 5),
            'payment_method' => $this->faker->randomElement(['credit_card', 'paypal', 'bank_transfer']),
            'payment_reference' => $this->faker->uuid(),
            'payment_status' => $this->faker->randomElement(['pending', 'completed', 'failed', 'refunded']),
            'magpie_checkout_session_id' => $this->faker->optional()->uuid(),
            'magpie_payment_intent_id' => $this->faker->optional()->uuid(),
            'magpie_metadata' => $this->faker->optional()->randomElement([null, json_encode(['test' => true])]),
            'payment_completed_at' => $this->faker->optional()->dateTimeThisMonth(),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'completed',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'pending',
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'failed',
        ]);
    }

    public function anonymous(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_anonymous' => true,
        ]);
    }

    public function withAmount(int $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $amount,
        ]);
    }
}
