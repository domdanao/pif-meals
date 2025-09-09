<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'course',
        'year_level',
        'student_id',
        'avatar_url',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    // Role helper methods
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    public function hasAnyRole(array $roleNames): bool
    {
        return $this->roles()->whereIn('name', $roleNames)->exists();
    }

    public function assignRole(string $roleName): void
    {
        $role = Role::where('name', $roleName)->first();
        if ($role && ! $this->hasRole($roleName)) {
            $this->roles()->attach($role->id);
        }
    }

    public function removeRole(string $roleName): void
    {
        $role = Role::where('name', $roleName)->first();
        if ($role) {
            $this->roles()->detach($role->id);
        }
    }

    public function isStudent(): bool
    {
        return $this->hasRole(Role::STUDENT);
    }

    public function isDonor(): bool
    {
        return $this->hasRole(Role::DONOR);
    }

    public function isStaff(): bool
    {
        return $this->hasRole(Role::STAFF);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(Role::ADMIN);
    }

    public function canManageVouchers(): bool
    {
        return $this->hasAnyRole([Role::STAFF, Role::ADMIN]);
    }

    public function getPrimaryRole(): ?string
    {
        // Return the first role, or you can implement priority logic
        $firstRole = $this->roles()->first();

        return $firstRole ? $firstRole->name : null;
    }

    // Relationships
    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class, 'donor_id');
    }

    public function vouchers(): HasMany
    {
        return $this->hasMany(Voucher::class, 'student_id');
    }

    public function pledges(): HasMany
    {
        return $this->hasMany(Pledge::class, 'student_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(StudentDocument::class, 'student_id');
    }

    public function claimedVouchers(): HasMany
    {
        return $this->hasMany(Voucher::class, 'claimed_by_staff_id');
    }

    // Scopes
    public function scopeWithRole($query, string $roleName)
    {
        return $query->whereHas('roles', function ($q) use ($roleName) {
            $q->where('name', $roleName);
        });
    }

    public function scopeStudents($query)
    {
        return $query->withRole(Role::STUDENT);
    }

    public function scopeDonors($query)
    {
        return $query->withRole(Role::DONOR);
    }

    public function scopeStaff($query)
    {
        return $query->whereHas('roles', function ($q) {
            $q->whereIn('name', [Role::STAFF, Role::ADMIN]);
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
