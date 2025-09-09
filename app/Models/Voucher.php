<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Voucher extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'reference_number',
        'student_id',
        'meal_inventory_id',
        'time_slot_id',
        'scheduled_date',
        'status',
        'claimed_at',
        'claimed_by_staff_id',
        'student_name',
        'student_course',
        'student_year',
        'student_phone',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'claimed_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($voucher) {
            if (empty($voucher->reference_number)) {
                $voucher->reference_number = self::generateReferenceNumber();
            }
        });
    }

    // Generate unique reference number
    public static function generateReferenceNumber(): string
    {
        do {
            $prefix = 'BB'; // Banned Books
            $timestamp = Carbon::now()->format('ymd');
            $random = strtoupper(Str::random(4));
            $reference = "{$prefix}-{$timestamp}-{$random}";
        } while (self::where('reference_number', $reference)->exists());

        return $reference;
    }

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function mealInventory(): BelongsTo
    {
        return $this->belongsTo(MealInventory::class);
    }

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class);
    }

    public function claimedByStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_staff_id');
    }

    public function pledges(): HasMany
    {
        return $this->hasMany(Pledge::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(StudentDocument::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeClaimed($query)
    {
        return $query->where('status', 'claimed');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_date', Carbon::today());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_date', '>=', Carbon::today());
    }

    public function scopeForTimeSlot($query, $timeSlotId)
    {
        return $query->where('time_slot_id', $timeSlotId);
    }

    // Business Logic Methods
    public function canBeClaimed(): bool
    {
        return $this->status === 'active'
            && $this->scheduled_date->isToday()
            && Carbon::now()->between(
                Carbon::parse($this->timeSlot->start_time),
                Carbon::parse($this->timeSlot->end_time)
            );
    }

    public function markAsClaimed(User $staff): void
    {
        $this->update([
            'status' => 'claimed',
            'claimed_at' => Carbon::now(),
            'claimed_by_staff_id' => $staff->id,
        ]);

        // Update meal inventory (only if this voucher has one - for donation-based meals)
        if ($this->meal_inventory_id) {
            $this->mealInventory()->update(['status' => 'claimed']);
        }

        // Update system metrics
        SystemMetric::incrementCounter('total_meals_claimed');
    }

    public function isExpired(): bool
    {
        return $this->scheduled_date->isPast() && $this->status === 'active';
    }

    public function markAsExpired(): void
    {
        if ($this->isExpired()) {
            $this->update(['status' => 'expired']);
            // Only update meal inventory if this voucher has one (for donation-based meals)
            if ($this->meal_inventory_id) {
                $this->mealInventory()->update(['status' => 'available']);
            }
            // For managed meals, we could increment the meal quantity back, but that would
            // require tracking which specific meal was reserved
        }
    }

    // Accessors
    public function getFormattedScheduledDateAttribute(): string
    {
        return $this->scheduled_date->format('F j, Y');
    }

    public function getTimeSlotDisplayAttribute(): string
    {
        return $this->timeSlot->display_name ?? '';
    }

    public function getCanClaimAttribute(): bool
    {
        return $this->canBeClaimed();
    }
}
