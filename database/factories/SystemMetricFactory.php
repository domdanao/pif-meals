<?php

namespace Database\Factories;

use App\Models\SystemMetric;
use Illuminate\Database\Eloquent\Factories\Factory;

class SystemMetricFactory extends Factory
{
    protected $model = SystemMetric::class;

    public function definition(): array
    {
        return [
            'metric_name' => $this->faker->randomElement([
                'total_meals_available',
                'total_vouchers_issued',
                'total_donations_received',
                'active_students',
                'system_uptime',
            ]),
            'metric_value' => $this->faker->numberBetween(0, 1000),
            'last_updated' => $this->faker->dateTimeThisMonth(),
        ];
    }

    public function withName(string $name): static
    {
        return $this->state(fn (array $attributes) => [
            'metric_name' => $name,
        ]);
    }

    public function withValue(int $value): static
    {
        return $this->state(fn (array $attributes) => [
            'metric_value' => $value,
        ]);
    }
}
