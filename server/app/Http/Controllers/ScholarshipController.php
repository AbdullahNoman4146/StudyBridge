<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
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
        unset($student);

        $countryId = $request->query('country_id');
        $search = trim((string) $request->query('search', ''));

        $query = Scholarship::with([
                'country:id,name',
                'agent:id,name,email'
            ])
            ->where('status', 'active')
            ->orderBy('deadline')
            ->orderByDesc('created_at');

        if ($countryId) {
            $query->where('country_id', $countryId);
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', '%' . $search . '%')
                    ->orWhere('university_name', 'like', '%' . $search . '%')
                    ->orWhere('degree_level', 'like', '%' . $search . '%')
                    ->orWhere('funding_type', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        $scholarships = $query->get();

        return response()->json($scholarships);
    }
}