<?php

namespace Database\Factories;

use App\Models\MealInventory;
use App\Models\TimeSlot;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoucherFactory extends Factory
{
    protected $model = Voucher::class;

    public function definition(): array
    {
        $student = User::factory()->create(['role' => 'student']);
        $timeSlot = TimeSlot::factory()->create();
        $mealInventory = MealInventory::factory()->create();

        return [
            'reference_number' => $this->generateReferenceNumber(),
            'student_id' => $student->id,
            'meal_inventory_id' => $mealInventory->id,
            'time_slot_id' => $timeSlot->id,
            'scheduled_date' => $this->faker->dateTimeBetween('now', '+7 days'),
            'status' => $this->faker->randomElement(['active', 'claimed', 'expired', 'cancelled']),
            'claimed_at' => null,
            'claimed_by_staff_id' => null,
            'student_name' => $student->name,
            'student_course' => $this->faker->randomElement(['Computer Science', 'Engineering', 'Business', 'Arts', 'Medicine']),
            'student_year' => $this->faker->randomElement(['1st Year', '2nd Year', '3rd Year', '4th Year']),
            'student_phone' => $this->faker->phoneNumber(),
        ];
    }

    private function generateReferenceNumber(): string
    {
        $date = date('ymd');
        $random = strtoupper($this->faker->bothify('??##'));

        return "BB-{$date}-{$random}";
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'claimed_at' => null,
            'claimed_by_staff_id' => null,
        ]);
    }

    public function claimed(): static
    {
        $staff = User::factory()->create(['role' => 'staff']);

        return $this->state(fn (array $attributes) => [
            'status' => 'claimed',
            'claimed_at' => $this->faker->dateTimeThisWeek(),
            'claimed_by_staff_id' => $staff->id,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'expired',
            'scheduled_date' => $this->faker->dateTimeBetween('-7 days', '-1 day'),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    public function forStudent(User $student): static
    {
        return $this->state(fn (array $attributes) => [
            'student_id' => $student->id,
            'student_name' => $student->name,
        ]);
    }

    public function withTimeSlot(TimeSlot $timeSlot): static
    {
        return $this->state(fn (array $attributes) => [
            'time_slot_id' => $timeSlot->id,
        ]);
    }
}
