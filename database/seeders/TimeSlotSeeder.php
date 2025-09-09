<?php

namespace Database\Seeders;

use App\Models\TimeSlot;
use Illuminate\Database\Seeder;

class TimeSlotSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $timeSlots = [
            [
                'start_time' => '11:00:00',
                'end_time' => '13:00:00',
                'display_name' => '11am - 1pm',
                'is_active' => true,
            ],
            [
                'start_time' => '17:00:00',
                'end_time' => '19:00:00',
                'display_name' => '5pm - 7pm',
                'is_active' => true,
            ],
        ];

        foreach ($timeSlots as $slotData) {
            TimeSlot::firstOrCreate(
                ['display_name' => $slotData['display_name']],
                $slotData
            );
        }

        $this->command->info('Time slots seeded successfully!');
    }
}
