<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Donation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'donor_id',
        'amount',
        'meal_count',
        'payment_method',
        'payment_reference',
        'payment_status',
        'magpie_checkout_session_id',
        'magpie_payment_intent_id',
        'magpie_metadata',
        'payment_completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'meal_count' => 'integer',
            'magpie_metadata' => 'array',
            'payment_completed_at' => 'datetime',
        ];
    }

    // Relationships
    public function donor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'donor_id');
    }

    public function mealInventory(): HasMany
    {
        return $this->hasMany(MealInventory::class);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('payment_status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('payment_status', 'failed');
    }

    // Accessors & Mutators
    public function getFormattedAmountAttribute(): string
    {
        return 'PHP '.number_format($this->amount, 2);
    }

    public function getMealsRemainingAttribute(): int
    {
        return $this->mealInventory()->where('status', 'available')->count();
    }

    public function getMealsClaimedAttribute(): int
    {
        return $this->mealInventory()->where('status', 'claimed')->count();
    }
}
