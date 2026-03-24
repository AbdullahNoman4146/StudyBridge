<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use App\Models\ScholarshipInterest;
use Illuminate\Http\Request;

class ScholarshipController extends Controller
{
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

    private function validateScholarship(Request $request)
    {
        return $request->validate([
            'title' => 'required|string|max:160',
            'university_name' => 'required|string|max:160',
            'degree_level' => 'required|string|max:100',
            'funding_type' => 'required|string|max:100',
            'amount' => 'nullable|string|max:120',
            'deadline' => 'required|date',
            'intake' => 'nullable|string|max:100',
            'description' => 'required|string',
            'eligibility' => 'nullable|string',
            'application_instructions' => 'nullable|string',
            'required_documents' => 'nullable|array',
            'required_documents.*' => 'nullable|string|max:120',
            'status' => 'nullable|in:active,inactive',
        ]);
    }

    private function studentScholarshipBaseQuery(int $studentId)
    {
        return Scholarship::query()
            ->with([
                'country:id,name',
                'agent:id,name,email'
            ])
            ->withCount([
                'interests as is_interested' => function ($query) use ($studentId) {
                    $query->where('student_id', $studentId);
                }
            ])
            ->where('status', 'active');
    }

    private function applyStudentFilters($query, Request $request)
    {
        $countryId = trim((string) $request->query('country_id', ''));
        $degreeLevel = trim((string) $request->query('degree_level', ''));
        $fundingType = trim((string) $request->query('funding_type', ''));
        $intake = trim((string) $request->query('intake', ''));
        $search = trim((string) $request->query('search', ''));

        if ($countryId !== '') {
            $query->where('country_id', $countryId);
        }

        if ($degreeLevel !== '') {
            $query->where('degree_level', $degreeLevel);
        }

        if ($fundingType !== '') {
            $query->where('funding_type', $fundingType);
        }

        if ($intake !== '') {
            $query->where('intake', $intake);
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', '%' . $search . '%')
                    ->orWhere('university_name', 'like', '%' . $search . '%')
                    ->orWhere('degree_level', 'like', '%' . $search . '%')
                    ->orWhere('funding_type', 'like', '%' . $search . '%')
                    ->orWhere('intake', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        return $query;
    }

    public function agentIndex()
    {
        $agent = $this->ensureAgent();

        if (!$agent->country_id) {
            return response()->json([], 200);
        }

        $scholarships = Scholarship::with(['country:id,name'])
            ->withCount('applications')
            ->where('agent_id', $agent->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($scholarships);
    }

    public function store(Request $request)
    {
        $agent = $this->ensureAgent();

        if (!$agent->country_id) {
            return response()->json([
                'message' => 'This agent is not assigned to any country yet'
            ], 422);
        }

        $payload = $this->validateScholarship($request);

        $payload['agent_id'] = $agent->id;
        $payload['country_id'] = $agent->country_id;
        $payload['status'] = $payload['status'] ?? 'active';
        $payload['required_documents'] = array_values(array_filter($payload['required_documents'] ?? [], function ($item) {
            return $item !== null && trim($item) !== '';
        }));

        $scholarship = Scholarship::create($payload);

        return response()->json([
            'message' => 'Scholarship created successfully',
            'scholarship' => Scholarship::with('country:id,name')->find($scholarship->id)
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $agent = $this->ensureAgent();

        if (!$agent->country_id) {
            return response()->json([
                'message' => 'This agent is not assigned to any country yet'
            ], 422);
        }

        $scholarship = Scholarship::where('agent_id', $agent->id)->find($id);

        if (!$scholarship) {
            return response()->json([
                'message' => 'Scholarship not found'
            ], 404);
        }

        $payload = $this->validateScholarship($request);
        $payload['country_id'] = $agent->country_id;
        $payload['required_documents'] = array_values(array_filter($payload['required_documents'] ?? [], function ($item) {
            return $item !== null && trim($item) !== '';
        }));

        $scholarship->update($payload);

        return response()->json([
            'message' => 'Scholarship updated successfully',
            'scholarship' => Scholarship::with('country:id,name')->find($scholarship->id)
        ]);
    }

    public function studentIndex(Request $request)
    {
        $student = $this->ensureStudent();

        $query = $this->studentScholarshipBaseQuery((int) $student->id)
            ->orderBy('deadline')
            ->orderByDesc('created_at');

        $scholarships = $this->applyStudentFilters($query, $request)->get();

        return response()->json($scholarships);
    }

    public function interestedIndex(Request $request)
    {
        $student = $this->ensureStudent();

        $query = $this->studentScholarshipBaseQuery((int) $student->id)
            ->whereHas('interests', function ($builder) use ($student) {
                $builder->where('student_id', $student->id);
            })
            ->orderBy('deadline')
            ->orderByDesc('created_at');

        $scholarships = $this->applyStudentFilters($query, $request)->get();

        return response()->json($scholarships);
    }

    public function markInterested($scholarshipId)
    {
        $student = $this->ensureStudent();

        $scholarship = Scholarship::where('status', 'active')->find($scholarshipId);

        if (!$scholarship) {
            return response()->json([
                'message' => 'Scholarship not found'
            ], 404);
        }

        $alreadyApplied = $student->studentApplications()
            ->where('scholarship_id', $scholarship->id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json([
                'message' => 'This scholarship is already in your applications list.'
            ], 422);
        }

        ScholarshipInterest::firstOrCreate([
            'scholarship_id' => $scholarship->id,
            'student_id' => $student->id,
        ]);

        return response()->json([
            'message' => 'Scholarship added to your Interested list.'
        ], 201);
    }

    public function unmarkInterested($scholarshipId)
    {
        $student = $this->ensureStudent();

        ScholarshipInterest::where('scholarship_id', $scholarshipId)
            ->where('student_id', $student->id)
            ->delete();

        return response()->json([
            'message' => 'Scholarship removed from your Interested list.'
        ]);
    }
}