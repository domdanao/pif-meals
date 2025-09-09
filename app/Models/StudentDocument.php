<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentDocument extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'student_id',
        'voucher_id',
        'file_url',
        'file_type',
        'file_size',
        'original_filename',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    // Accessors
    public function getFormattedFileSizeAttribute(): string
    {
        if ($this->file_size < 1024) {
            return $this->file_size.' B';
        } elseif ($this->file_size < 1048576) {
            return round($this->file_size / 1024, 2).' KB';
        } else {
            return round($this->file_size / 1048576, 2).' MB';
        }
    }
}
