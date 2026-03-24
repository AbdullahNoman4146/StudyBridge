<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Scholarship extends Model
{
    protected $fillable = [
        'agent_id',
        'country_id',
        'title',
        'university_name',
        'degree_level',
        'funding_type',
        'amount',
        'deadline',
        'intake',
        'description',
        'eligibility',
        'required_documents',
        'application_instructions',
        'status',
    ];

    protected $casts = [
        'deadline' => 'date',
        'required_documents' => 'array',
        'is_interested' => 'boolean',
    ];

    protected $appends = [
        'is_interested',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(ScholarshipApplication::class, 'scholarship_id');
    }

    public function interests(): HasMany
    {
        return $this->hasMany(ScholarshipInterest::class, 'scholarship_id');
    }

    public function getIsInterestedAttribute(): bool
    {
        if (array_key_exists('is_interested', $this->attributes)) {
            return (bool) $this->attributes['is_interested'];
        }

        if (array_key_exists('is_interested', $this->relations)) {
            return (bool) $this->relations['is_interested'];
        }

        return false;
    }
}