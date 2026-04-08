<?php

namespace App\Console\Commands;

use App\Models\ScholarshipApplication;
use App\Models\ScholarshipInterest;
use App\Services\ScholarshipReminderService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendScholarshipReminderEmails extends Command
{
    protected $signature = 'studybridge:send-scholarship-reminders';

    protected $description = 'Send automatic scholarship deadline reminder emails to interested students and applicants who still need documents';

    public function handle(ScholarshipReminderService $reminderService)
    {
        $targetDate = Carbon::today()->addDays(7);
        $interestSentCount = 0;
        $needsDocumentsSentCount = 0;

        ScholarshipInterest::query()
            ->with([
                'student:id,name,email',
                'scholarship:id,title,university_name,deadline,status'
            ])
            ->whereHas('scholarship', function ($query) use ($targetDate) {
                $query->where('status', 'active')
                    ->whereDate('deadline', $targetDate->toDateString());
            })
            ->chunkById(100, function ($interests) use ($reminderService, $targetDate, &$interestSentCount) {
                foreach ($interests as $interest) {
                    try {
                        if ($reminderService->sendInterestedDeadlineReminder($interest, $targetDate)) {
                            $interestSentCount++;
                        }
                    } catch (\Throwable $exception) {
                        report($exception);
                        $this->error('Failed to send interested reminder for interest ID ' . $interest->id);
                    }
                }
            });

        ScholarshipApplication::query()
            ->with([
                'student:id,name,email',
                'agent:id,name,email',
                'scholarship:id,title,university_name,deadline'
            ])
            ->where('status', 'needs_documents')
            ->whereHas('scholarship', function ($query) use ($targetDate) {
                $query->whereDate('deadline', $targetDate->toDateString());
            })
            ->chunkById(100, function ($applications) use ($reminderService, $targetDate, &$needsDocumentsSentCount) {
                foreach ($applications as $application) {
                    try {
                        if ($reminderService->sendNeedsDocumentsReminder($application, 'needs_documents_deadline_7_days', $targetDate)) {
                            $needsDocumentsSentCount++;
                        }
                    } catch (\Throwable $exception) {
                        report($exception);
                        $this->error('Failed to send needs-documents reminder for application ID ' . $application->id);
                    }
                }
            });

        $this->info("Interested scholarship reminders sent: {$interestSentCount}");
        $this->info("Needs-documents reminders sent: {$needsDocumentsSentCount}");

        return Command::SUCCESS;
    }
}