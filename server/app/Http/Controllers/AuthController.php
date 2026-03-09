<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\StudentProfile;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
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
        }

        return response()->json($user);
    }

    public function logout()
    {
        auth('api')->logout();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
}