<?php

namespace Database\Factories;

use App\Models\Donation;
use App\Models\MealInventory;
use Illuminate\Database\Eloquent\Factories\Factory;

class MealInventoryFactory extends Factory
{
    protected $model = MealInventory::class;

    public function definition(): array
    {
        $donation = Donation::factory()->create();

        return [
            'donation_id' => $donation->id,
            'status' => $this->faker->randomElement(['available', 'reserved', 'claimed', 'expired']),
            'expires_at' => $this->faker->optional(0.7)->dateTimeBetween('now', '+30 days'),
        ];
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'available',
        ]);
    }

    public function reserved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'reserved',
        ]);
    }

    public function claimed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'claimed',
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'expired',
            'expires_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }
}
