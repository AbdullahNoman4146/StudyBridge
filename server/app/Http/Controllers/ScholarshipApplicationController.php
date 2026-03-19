<?php

namespace App\Http\Controllers;

use App\Models\ApplicationDocument;
use App\Models\ApplicationMessage;
use App\Models\Scholarship;
use App\Models\ScholarshipApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ScholarshipApplicationController extends Controller
{
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
            'documents' => 'required|array|min:1|max:10',
            'documents.*' => 'file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

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

        DB::transaction(function () use ($request, $student, $scholarship, &$application) {
            $application = ScholarshipApplication::create([
                'scholarship_id' => $scholarship->id,
                'student_id' => $student->id,
                'agent_id' => $scholarship->agent_id,
                'message' => $request->message,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            foreach ($request->file('documents', []) as $file) {
                $originalName = $file->getClientOriginalName();
                $storedName = uniqid('doc_', true) . '_' . preg_replace('/\s+/', '_', $originalName);
                $relativePath = 'scholarship-applications/' . $application->id . '/' . $storedName;

                Storage::disk('local')->putFileAs(
                    'scholarship-applications/' . $application->id,
                    $file,
                    $storedName
                );

                ApplicationDocument::create([
                    'application_id' => $application->id,
                    'original_name' => $originalName,
                    'stored_name' => $storedName,
                    'file_path' => $relativePath,
                    'mime_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }

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

    public function updateStatus(Request $request, $applicationId)
    {
        $agent = $this->ensureAgent();

        $request->validate([
            'status' => 'required|in:submitted,under_review,needs_documents,approved,rejected',
            'agent_note' => 'nullable|string|max:2000',
        ]);

        $application = ScholarshipApplication::where('agent_id', $agent->id)->find($applicationId);

        if (!$application) {
            return response()->json([
                'message' => 'Application not found'
            ], 404);
        }

        $application->update([
            'status' => $request->status,
            'agent_note' => $request->agent_note,
        ]);

        return response()->json([
            'message' => 'Application updated successfully',
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