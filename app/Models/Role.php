<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    // Role constants
    public const STUDENT = 'student';

    public const DONOR = 'donor';

    public const STAFF = 'staff';

    public const ADMIN = 'admin';

    public static function getAvailableRoles(): array
    {
        return [
            self::STUDENT => 'Student',
            self::DONOR => 'Donor',
            self::STAFF => 'Staff',
            self::ADMIN => 'Admin',
        ];
    }

    // Relationships
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles');
    }

    // Scopes
    public function scopeByName($query, string $name)
    {
        return $query->where('name', $name);
    }
}
