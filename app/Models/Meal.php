<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Meal extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'price',
        'category',
        'is_vegetarian',
        'is_halal',
        'contains_nuts',
        'contains_dairy',
        'allergen_info',
        'image_url',
        'quantity_available',
        'is_active',
        'created_by',
    ];

    protected $appends = [
        'formatted_price',
        'dietary_info',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_vegetarian' => 'boolean',
            'is_halal' => 'boolean',
            'contains_nuts' => 'boolean',
            'contains_dairy' => 'boolean',
            'is_active' => 'boolean',
            'quantity_available' => 'integer',
        ];
    }

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('quantity_available', '>', 0);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeVegetarian($query)
    {
        return $query->where('is_vegetarian', true);
    }

    public function scopeHalal($query)
    {
        return $query->where('is_halal', true);
    }

    // Accessors
    public function getFormattedPriceAttribute(): string
    {
        return $this->price ? '₱'.number_format($this->price, 2) : 'Free';
    }

    public function getDietaryInfoAttribute(): array
    {
        $info = [];
        if ($this->is_vegetarian) {
            $info[] = 'Vegetarian';
        }
        if ($this->is_halal) {
            $info[] = 'Halal';
        }
        if ($this->contains_nuts) {
            $info[] = 'Contains Nuts';
        }
        if ($this->contains_dairy) {
            $info[] = 'Contains Dairy';
        }

        return $info;
    }
}
