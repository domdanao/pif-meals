<?php

namespace Database\Factories;

use App\Models\TimeSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

class TimeSlotFactory extends Factory
{
    protected $model = TimeSlot::class;

    public function definition(): array
    {
        $startHour = $this->faker->numberBetween(8, 18);
        $startTime = sprintf('%02d:00:00', $startHour);
        $endTime = sprintf('%02d:00:00', $startHour + 1);

        return [
            'start_time' => $startTime,
            'end_time' => $endTime,
            'display_name' => $this->faker->randomElement([
                'Morning Slot',
                'Afternoon Slot',
                'Evening Slot',
                'Lunch Slot',
                'Breakfast Slot',
            ]).' '.$startHour.':00',
            'is_active' => $this->faker->boolean(80), // 80% chance of being active
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
