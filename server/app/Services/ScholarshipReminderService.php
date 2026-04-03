<?php

namespace App\Services;

use App\Mail\ScholarshipReminderMail;
use App\Models\EmailReminderLog;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipInterest;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class ScholarshipReminderService
{
    public function sendInterestedDeadlineReminder(ScholarshipInterest $interest, Carbon $reminderDate, bool $force = false): bool
    {
        $interest->loadMissing([
            'student:id,name,email',
            'scholarship:id,title,university_name,deadline,status'
        ]);

        if (!$interest->student || !$interest->student->email || !$interest->scholarship) {
            return false;
        }

        if (!$force && $this->alreadySent(
            'interested_deadline_7_days',
            (int) $interest->student_id,
            (int) $interest->scholarship_id,
            null,
            $reminderDate
        )) {
            return false;
        }

        $deadline = Carbon::parse($interest->scholarship->deadline);

        Mail::to($interest->student->email)->send(new ScholarshipReminderMail([
            'subject' => 'StudyBridge Scholarship Deadline Reminder',
            'heading' => 'Scholarship deadline is coming soon',
            'student_name' => $interest->student->name,
            'scholarship_title' => $interest->scholarship->title,
            'university_name' => $interest->scholarship->university_name,
            'deadline_text' => $deadline->format('F j, Y'),
            'status_label' => 'Interested',
            'agent_note' => null,
            'paragraphs' => [
                'You marked this scholarship as interested on StudyBridge.',
                'This is an automatic reminder that the application deadline is only 7 days away. Please review the scholarship details and submit your application before the deadline.'
            ],
            'footer_note' => 'This reminder was sent automatically by StudyBridge.',
        ]));

        $this->log([
            'reminder_type' => 'interested_deadline_7_days',
            'student_id' => $interest->student_id,
            'scholarship_id' => $interest->scholarship_id,
            'reminder_for_date' => $reminderDate->toDateString(),
        ]);

        return true;
    }

    public function sendNeedsDocumentsReminder(ScholarshipApplication $application, string $type, ?Carbon $reminderDate = null, bool $force = false): bool
    {
        $application->loadMissing([
            'student:id,name,email',
            'agent:id,name,email',
            'scholarship:id,title,university_name,deadline'
        ]);

        if (!$application->student || !$application->student->email || !$application->scholarship) {
            return false;
        }

        $logReminderDate = $reminderDate ? $reminderDate->toDateString() : now()->toDateString();

        if (!$force && $this->alreadySent(
            $type,
            (int) $application->student_id,
            (int) $application->scholarship_id,
            (int) $application->id,
            Carbon::parse($logReminderDate)
        )) {
            return false;
        }

        $deadline = Carbon::parse($application->scholarship->deadline);
        $footerNote = 'Please make sure your required documents are uploaded before the deadline.';

        if ($type === 'needs_documents_status_change') {
            $subject = 'StudyBridge: Additional Documents Needed';
            $heading = 'Additional documents are required for your application';
            $paragraphs = [
                'Your application status has been updated to Needs Documents.',
                'Please review the note from your agent and upload the required documents as soon as possible so your application can continue before the deadline.'
            ];
        } elseif ($type === 'needs_documents_deadline_7_days') {
            $subject = 'StudyBridge: Deadline Reminder for Pending Documents';
            $heading = 'Only 7 days remain to submit your required documents';
            $paragraphs = [
                'Your application is still waiting for additional documents.',
                'This is an automatic reminder that the scholarship deadline is only 7 days away. Please upload the requested documents before the deadline.'
            ];
        } else {
            $subject = 'StudyBridge: Deadline Reminder from Your Agent';
            $heading = 'Your agent sent you a manual reminder';
            $paragraphs = [
                'Your agent sent you a manual reminder for this scholarship application.',
                'Please review the application deadline and complete any remaining steps before the deadline.'
            ];
        }

        Mail::to($application->student->email)->send(new ScholarshipReminderMail([
            'subject' => $subject,
            'heading' => $heading,
            'student_name' => $application->student->name,
            'scholarship_title' => $application->scholarship->title,
            'university_name' => $application->scholarship->university_name,
            'deadline_text' => $deadline->format('F j, Y'),
            'status_label' => ucfirst(str_replace('_', ' ', $application->status)),
            'agent_note' => $application->agent_note,
            'paragraphs' => $paragraphs,
            'footer_note' => $footerNote,
        ]));

        $this->log([
            'reminder_type' => $type,
            'student_id' => $application->student_id,
            'agent_id' => $application->agent_id,
            'scholarship_id' => $application->scholarship_id,
            'application_id' => $application->id,
            'reminder_for_date' => $logReminderDate,
        ]);

        return true;
    }

    private function alreadySent(string $type, int $studentId, ?int $scholarshipId, ?int $applicationId, Carbon $reminderDate): bool
    {
        return EmailReminderLog::query()
            ->where('reminder_type', $type)
            ->where('student_id', $studentId)
            ->when($scholarshipId, function ($query) use ($scholarshipId) {
                $query->where('scholarship_id', $scholarshipId);
            })
            ->when($applicationId, function ($query) use ($applicationId) {
                $query->where('application_id', $applicationId);
            })
            ->whereDate('reminder_for_date', $reminderDate->toDateString())
            ->exists();
    }

    private function log(array $data): void
    {
        EmailReminderLog::create([
            'reminder_type' => $data['reminder_type'],
            'student_id' => $data['student_id'] ?? null,
            'agent_id' => $data['agent_id'] ?? null,
            'scholarship_id' => $data['scholarship_id'] ?? null,
            'application_id' => $data['application_id'] ?? null,
            'reminder_for_date' => $data['reminder_for_date'] ?? null,
            'sent_at' => now(),
        ]);
    }
}