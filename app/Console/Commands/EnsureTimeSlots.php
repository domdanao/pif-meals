<?php

namespace App\Console\Commands;

use App\Models\TimeSlot;
use Illuminate\Console\Command;

class EnsureTimeSlots extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:ensure-time-slots';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ensure time slots exist in the database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for time slots...');
        
        $existingSlots = TimeSlot::count();
        $this->info("Found {$existingSlots} existing time slots.");
        
        if ($existingSlots === 0) {
            $this->warn('No time slots found. Creating default time slots...');
            
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
                $slot = TimeSlot::create($slotData);
                $this->info("Created time slot: {$slot->display_name}");
            }
            
            $this->info('✅ Default time slots created successfully!');
        } else {
            $this->info('✅ Time slots already exist.');
            
            // Display existing slots
            TimeSlot::active()->get()->each(function($slot) {
                $this->line("  - {$slot->display_name} ({$slot->start_time->format('H:i')} - {$slot->end_time->format('H:i')})");
            });
        }
        
        return Command::SUCCESS;
    }
}
