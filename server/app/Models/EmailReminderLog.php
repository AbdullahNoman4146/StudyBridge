<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailReminderLog extends Model
{
    protected $fillable = [
        'reminder_type',
        'student_id',
        'agent_id',
        'scholarship_id',
        'application_id',
        'reminder_for_date',
        'sent_at',
    ];

    protected $casts = [
        'reminder_for_date' => 'date',
        'sent_at' => 'datetime',
    ];
}