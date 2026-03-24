<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable implements JWTSubject
{
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'country_id',
        'must_change_password',
        'status'
    ];

    protected $hidden = [
        'password'
    ];

    protected $casts = [
        'must_change_password' => 'boolean',
    ];

    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class, 'user_id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    public function scholarships(): HasMany
    {
        return $this->hasMany(Scholarship::class, 'agent_id');
    }

    public function scholarshipInterests(): HasMany
    {
        return $this->hasMany(ScholarshipInterest::class, 'student_id');
    }

    public function studentApplications(): HasMany
    {
        return $this->hasMany(ScholarshipApplication::class, 'student_id');
    }

    public function assignedApplications(): HasMany
    {
        return $this->hasMany(ScholarshipApplication::class, 'agent_id');
    }

    public function applicationMessages(): HasMany
    {
        return $this->hasMany(ApplicationMessage::class, 'sender_id');
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}