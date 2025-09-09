<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemMetric extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'metric_name',
        'metric_value',
        'last_updated',
    ];

    protected function casts(): array
    {
        return [
            'metric_value' => 'integer',
            'last_updated' => 'datetime',
        ];
    }

    // Helper methods for common metrics
    public static function getMetric(string $name): int
    {
        return self::where('metric_name', $name)->value('metric_value') ?? 0;
    }

    public static function setMetric(string $name, int $value): void
    {
        self::updateOrCreate(
            ['metric_name' => $name],
            ['metric_value' => $value, 'last_updated' => now()]
        );
    }

    public static function incrementCounter(string $name, int $increment = 1): void
    {
        $current = self::getMetric($name);
        self::setMetric($name, $current + $increment);
    }

    public static function decrementCounter(string $name, int $decrement = 1): void
    {
        $current = self::getMetric($name);
        self::setMetric($name, max(0, $current - $decrement));
    }

    // Get all public metrics for dashboard
    public static function getPublicMetrics(): array
    {
        return [
            'available_meals' => self::getMetric('total_meals_available'),
            'claimed_meals' => self::getMetric('total_meals_claimed'),
            'active_pledges' => self::getMetric('total_pledges_active'),
            'total_donations' => self::getMetric('total_donors_count'), // This should be donor count, not amount
        ];
    }
}
