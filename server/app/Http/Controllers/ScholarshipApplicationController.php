<?php

namespace App\Http\Controllers;

use App\Models\ApplicationDocument;
use App\Models\ApplicationMessage;
use App\Models\Scholarship;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipInterest;
use App\Services\ScholarshipReminderService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ScholarshipApplicationController extends Controller
{
    private function normalizeUploadedDocuments(Request $request): array
    {
        $files = $request->file('documents');

        if ($files instanceof UploadedFile) {
            return [$files];
        }

        if (is_array($files)) {
            return array_values(array_filter($files, fn ($file) => $file instanceof UploadedFile));
        }

        $allFiles = $request->allFiles();

        if (isset($allFiles['documents']) && $allFiles['documents'] instanceof UploadedFile) {
            return [$allFiles['documents']];
        }

        if (isset($allFiles['documents']) && is_array($allFiles['documents'])) {
            return array_values(array_filter($allFiles['documents'], fn ($file) => $file instanceof UploadedFile));
        }

        return [];
    }

    private function validateUploadedDocuments(array $files): ?array
    {
        if (count($files) === 0) {
            return [
                'message' => 'Please upload at least one document.'
            ];
        }

        if (count($files) > 10) {
            return [
                'message' => 'You can upload up to 10 documents at a time.'
            ];
        }

        foreach ($files as $file) {
            $validator = Validator::make([
                'document' => $file,
            ], [
                'document' => 'file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
            ]);

            if ($validator->fails()) {
                return [
                    'message' => $validator->errors()->first('document') ?: 'One or more uploaded files are invalid.'
                ];
            }
        }

        return null;
    }

    private function storeApplicationDocuments(int $applicationId, array $files): void
    {
        foreach ($files as $file) {
            $originalName = $file->getClientOriginalName();
            $storedName = uniqid('doc_', true) . '_' . preg_replace('/\s+/', '_', $originalName);
            $relativePath = 'scholarship-applications/' . $applicationId . '/' . $storedName;

            Storage::disk('local')->putFileAs(
                'scholarship-applications/' . $applicationId,
                $file,
                $storedName
            );

            ApplicationDocument::create([
                'application_id' => $applicationId,
                'original_name' => $originalName,
                'stored_name' => $storedName,
                'file_path' => $relativePath,
                'mime_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }
    }

    private function ensureStudent()
    {
        $user = auth('api')->user();

        if (!$user || $user->role !== 'student') {
            abort(response()->json([
                'message' => 'Only students can perform this action'
            ], 403));
        }

        return $user;
    }

    private function ensureAgent()
    {
        $user = auth('api')->user();

        if (!$user || $user->role !== 'agent') {
            abort(response()->json([
                'message' => 'Only agents can perform this action'
            ], 403));
        }

        return $user;
    }

    private function applicationWithRelations(int $applicationId)
    {
        return ScholarshipApplication::with([
            'scholarship.country:id,name',
            'scholarship.agent:id,name,email',
            'student:id,name,email',
            'student.studentProfile:id,user_id,phone,address',
            'documents:id,application_id,original_name,mime_type,file_size,created_at',
            'messages:id,application_id,sender_id,message,created_at',
            'messages.sender:id,name,email,role'
        ])->find($applicationId);
    }

    private function ensureApplicationAccess(int $applicationId)
    {
        $user = auth('api')->user();

        if (!$user) {
            abort(response()->json([
                'message' => 'Unauthenticated'
            ], 401));
        }

        $application = ScholarshipApplication::find($applicationId);

        if (!$application) {
            abort(response()->json([
                'message' => 'Application not found'
            ], 404));
        }

        $isAllowed = $user->role === 'admin'
            || ($user->role === 'student' && (int) $application->student_id === (int) $user->id)
            || ($user->role === 'agent' && (int) $application->agent_id === (int) $user->id);

        if (!$isAllowed) {
            abort(response()->json([
                'message' => 'You are not allowed to access this application'
            ], 403));
        }

        return $application;
    }

    public function apply(Request $request, $scholarshipId)
    {
        $student = $this->ensureStudent();

        $request->validate([
            'message' => 'nullable|string|max:2000',
        ]);

        $files = $this->normalizeUploadedDocuments($request);
        $fileValidationError = $this->validateUploadedDocuments($files);

        if ($fileValidationError) {
            return response()->json($fileValidationError, 422);
        }

        $scholarship = Scholarship::with('agent:id,name,email')->where('status', 'active')->find($scholarshipId);

        if (!$scholarship) {
            return response()->json([
                'message' => 'Scholarship not found'
            ], 404);
        }

        $alreadyApplied = ScholarshipApplication::where('scholarship_id', $scholarship->id)
            ->where('student_id', $student->id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json([
                'message' => 'You have already applied for this scholarship'
            ], 422);
        }

        $application = null;

        DB::transaction(function () use ($request, $student, $scholarship, $files, &$application) {
            $application = ScholarshipApplication::create([
                'scholarship_id' => $scholarship->id,
                'student_id' => $student->id,
                'agent_id' => $scholarship->agent_id,
                'message' => $request->message,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            ScholarshipInterest::where('scholarship_id', $scholarship->id)
                ->where('student_id', $student->id)
                ->delete();

            $this->storeApplicationDocuments($application->id, $files);

            if ($request->filled('message')) {
                ApplicationMessage::create([
                    'application_id' => $application->id,
                    'sender_id' => $student->id,
                    'message' => $request->message,
                ]);
            }
        });

        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $this->applicationWithRelations($application->id)
        ], 201);
    }

    public function submitRequestedDocuments(Request $request, $applicationId)
    {
        $student = $this->ensureStudent();

        $request->validate([
            'message' => 'nullable|string|max:2000',
        ]);

        $files = $this->normalizeUploadedDocuments($request);
        $fileValidationError = $this->validateUploadedDocuments($files);

        if ($fileValidationError) {
            return response()->json($fileValidationError, 422);
        }

        $application = ScholarshipApplication::where('student_id', $student->id)->find($applicationId);

        if (!$application) {
            return response()->json([
                'message' => 'Application not found'
            ], 404);
        }

        if ($application->status !== 'needs_documents') {
            return response()->json([
                'message' => 'Additional documents can only be submitted when the application status is Needs Documents.'
            ], 422);
        }

        DB::transaction(function () use ($application, $files, $request, $student) {
            $this->storeApplicationDocuments($application->id, $files);

            if ($request->filled('message')) {
                ApplicationMessage::create([
                    'application_id' => $application->id,
                    'sender_id' => $student->id,
                    'message' => trim((string) $request->message),
                ]);
            }

            $application->update([
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Requested documents submitted successfully',
            'application' => $this->applicationWithRelations($application->id)
        ], 201);
    }

    public function studentIndex()
    {
        $student = $this->ensureStudent();

        $applications = ScholarshipApplication::with([
                'scholarship.country:id,name',
                'scholarship.agent:id,name,email',
                'documents:id,application_id,original_name,mime_type,file_size,created_at',
                'messages:id,application_id,sender_id,message,created_at',
                'messages.sender:id,name,email,role'
            ])
            ->where('student_id', $student->id)
            ->orderByDesc('submitted_at')
            ->get();

        return response()->json($applications);
    }

    public function agentIndex()
    {
        $agent = $this->ensureAgent();

        $applications = ScholarshipApplication::with([
                'student:id,name,email',
                'student.studentProfile:id,user_id,phone,address',
                'scholarship:id,title,university_name,country_id,agent_id,deadline',
                'scholarship.country:id,name',
                'documents:id,application_id,original_name,mime_type,file_size,created_at',
                'messages:id,application_id,sender_id,message,created_at',
                'messages.sender:id,name,email,role'
            ])
            ->where('agent_id', $agent->id)
            ->orderByRaw("FIELD(status, 'submitted', 'under_review', 'needs_documents', 'approved', 'rejected')")
            ->orderByDesc('submitted_at')
            ->get();

        return response()->json($applications);
    }

    public function updateStatus(Request $request, $applicationId, ScholarshipReminderService $reminderService)
    {
        $agent = $this->ensureAgent();

        $request->validate([
            'status' => 'required|in:submitted,under_review,needs_documents,approved,rejected',
            'agent_note' => 'nullable|string|max:2000',
        ]);

        if ($request->status === 'needs_documents' && trim((string) $request->agent_note) === '') {
            return response()->json([
                'message' => 'Please tell the student which documents are needed before setting this status.'
            ], 422);
        }

        $application = ScholarshipApplication::with([
                'student:id,name,email',
                'agent:id,name,email',
                'scholarship:id,title,university_name,deadline'
            ])
            ->where('agent_id', $agent->id)
            ->find($applicationId);

        if (!$application) {
            return response()->json([
                'message' => 'Application not found'
            ], 404);
        }

        $previousStatus = $application->status;

        $application->update([
            'status' => $request->status,
            'agent_note' => $request->agent_note,
        ]);

        $application->refresh();
        $application->loadMissing([
            'student:id,name,email',
            'agent:id,name,email',
            'scholarship:id,title,university_name,deadline'
        ]);

        $responseMessage = 'Application updated successfully';

        if ($request->status === 'needs_documents' && $previousStatus !== 'needs_documents') {
            try {
                $reminderService->sendNeedsDocumentsReminder($application, 'needs_documents_status_change', Carbon::today(), true);
                $responseMessage = 'Application updated successfully and needs-documents reminder email sent.';
            } catch (\Throwable $exception) {
                report($exception);
                $responseMessage = 'Application updated successfully, but the reminder email could not be sent. Please check mail settings.';
            }
        }

        return response()->json([
            'message' => $responseMessage,
            'application' => $this->applicationWithRelations($application->id)
        ]);
    }

    public function sendDeadlineReminder($applicationId, ScholarshipReminderService $reminderService)
    {
        $agent = $this->ensureAgent();

        $application = ScholarshipApplication::with([
                'student:id,name,email',
                'agent:id,name,email',
                'scholarship:id,title,university_name,deadline'
            ])
            ->where('agent_id', $agent->id)
            ->find($applicationId);

        if (!$application) {
            return response()->json([
                'message' => 'Application not found'
            ], 404);
        }

        if (!$application->scholarship || !$application->scholarship->deadline) {
            return response()->json([
                'message' => 'No scholarship deadline is available for this application.'
            ], 422);
        }

        if (Carbon::parse($application->scholarship->deadline)->startOfDay()->lt(Carbon::today())) {
            return response()->json([
                'message' => 'Deadline reminder cannot be sent because the deadline has already passed.'
            ], 422);
        }

        try {
            $reminderService->sendNeedsDocumentsReminder($application, 'manual_deadline_reminder', Carbon::today(), true);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'The reminder email could not be sent. Please check mail settings and try again.'
            ], 500);
        }

        return response()->json([
            'message' => 'Deadline reminder email sent successfully.',
            'application' => $this->applicationWithRelations($application->id)
        ]);
    }

    public function sendMessage(Request $request, $applicationId)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $user = auth('api')->user();

        $application = $this->ensureApplicationAccess((int) $applicationId);

        $message = ApplicationMessage::create([
            'application_id' => $application->id,
            'sender_id' => $user->id,
            'message' => trim((string) $request->message),
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'chat_message' => ApplicationMessage::with('sender:id,name,email,role')->find($message->id),
            'application' => $this->applicationWithRelations($application->id)
        ], 201);
    }

    public function download($documentId)
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        $document = ApplicationDocument::with('application')->find($documentId);

        if (!$document || !$document->application) {
            return response()->json([
                'message' => 'Document not found'
            ], 404);
        }

        $isAllowed = $user->role === 'admin'
            || ($user->role === 'student' && (int) $document->application->student_id === (int) $user->id)
            || ($user->role === 'agent' && (int) $document->application->agent_id === (int) $user->id);

        if (!$isAllowed) {
            return response()->json([
                'message' => 'You are not allowed to access this document'
            ], 403);
        }

        if (!Storage::disk('local')->exists($document->file_path)) {
            return response()->json([
                'message' => 'Stored file could not be found'
            ], 404);
        }

        return Storage::disk('local')->download($document->file_path, $document->original_name);
    }
}