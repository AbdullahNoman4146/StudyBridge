<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Country;
use App\Models\StudentProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    private function ensureAdmin()
    {
        $authUser = auth('api')->user();

        if (!$authUser || $authUser->role !== 'admin') {
            abort(response()->json([
                'message' => 'Only admin can perform this action'
            ], 403));
        }

        return $authUser;
    }

    public function countries()
    {
        $countries = Country::orderBy('name')->get(['id', 'name']);

        return response()->json($countries);
    }
    public function createCountry(Request $request)
    {
    $this->ensureAdmin();

    $request->validate([
        'name' => 'required|string|max:100|unique:countries,name',
    ]);

    $country = Country::create([
        'name' => trim($request->name),
    ]);

    return response()->json([
        'message' => 'Country added successfully',
        'country' => $country
    ], 201);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'student',
            'country_id' => null,
            'must_change_password' => false,
            'status' => 'active',
        ]);

        StudentProfile::create([
            'user_id' => $user->id,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        $token = auth('api')->login($user);

        $freshUser = User::with('studentProfile')->find($user->id);

        return response()->json([
            'message' => 'Student registered successfully',
            'token' => $token,
            'user' => $freshUser
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = auth('api')->user();

        if ($user->status !== 'active') {
            auth('api')->logout();

            return response()->json([
                'message' => 'This account is inactive'
            ], 403);
        }

        if ($user->role === 'student') {
            $user = User::with('studentProfile')->find($user->id);
        } elseif ($user->role === 'agent') {
            $user = User::with('country')->find($user->id);
        }

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user
        ]);
    }

    public function me()
    {
        $user = auth('api')->user();

        if ($user->role === 'student') {
            $user = User::with('studentProfile')->find($user->id);
        } elseif ($user->role === 'agent') {
            $user = User::with('country')->find($user->id);
        }

        return response()->json($user);
    }

    public function createAgent(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'country_id' => [
                'required',
                'integer',
                'exists:countries,id',
                Rule::unique('users', 'country_id')->where(function ($query) {
                    return $query->where('role', 'agent');
                }),
            ],
        ]);

        $agent = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'agent',
            'country_id' => $request->country_id,
            'must_change_password' => true,
            'status' => 'active',
        ]);

        $freshAgent = User::with('country')->find($agent->id);

        return response()->json([
            'message' => 'Agent created successfully',
            'agent' => $freshAgent
        ], 201);
    }

    public function adminSummary()
    {
        $this->ensureAdmin();

        return response()->json([
            'students_count' => User::where('role', 'student')->count(),
            'agents_count' => User::where('role', 'agent')->count(),
        ]);
    }

    public function listStudents()
    {
        $this->ensureAdmin();

        $students = User::with('studentProfile')
            ->where('role', 'student')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($students);
    }

    public function listAgents()
    {
        $this->ensureAdmin();

        $agents = User::with('country')
            ->where('role', 'agent')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($agents);
    }

    public function updateStudentStatus(Request $request, $id)
    {
        $this->ensureAdmin();

        $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $student = User::with('studentProfile')
            ->where('role', 'student')
            ->find($id);

        if (!$student) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }

        $student->status = $request->status;
        $student->save();

        return response()->json([
            'message' => 'Student status updated successfully',
            'student' => $student->fresh('studentProfile')
        ]);
    }

    public function deleteStudent($id)
    {
        $this->ensureAdmin();

        $student = User::where('role', 'student')->find($id);

        if (!$student) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }

        $student->delete();

        return response()->json([
            'message' => 'Student removed successfully'
        ]);
    }

    public function deleteAgent($id)
    {
        $this->ensureAdmin();

        $agent = User::where('role', 'agent')->find($id);

        if (!$agent) {
            return response()->json([
                'message' => 'Agent not found'
            ], 404);
        }

        $agent->delete();

        return response()->json([
            'message' => 'Agent removed successfully'
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = auth('api')->user();

        if (!$user || $user->role !== 'agent') {
            return response()->json([
                'message' => 'Only agents can change password here'
            ], 403);
        }

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        if (Hash::check($request->new_password, $user->password)) {
            return response()->json([
                'message' => 'New password must be different from current password'
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->must_change_password = false;
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully',
            'must_change_password' => false
        ]);
    }

    public function logout()
    {
        auth('api')->logout();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}