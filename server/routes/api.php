<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ScholarshipController;
use App\Http\Controllers\ScholarshipApplicationController;

Route::get('/countries', [AuthController::class, 'countries']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/admin/agents', [AuthController::class, 'createAgent']);
    Route::get('/admin/summary', [AuthController::class, 'adminSummary']);
    Route::get('/admin/students', [AuthController::class, 'listStudents']);
    Route::patch('/admin/students/{id}/status', [AuthController::class, 'updateStudentStatus']);
    Route::get('/admin/agents', [AuthController::class, 'listAgents']);
    Route::delete('/admin/students/{id}', [AuthController::class, 'deleteStudent']);
    Route::delete('/admin/agents/{id}', [AuthController::class, 'deleteAgent']);

    Route::post('/agent/change-password', [AuthController::class, 'changePassword']);

    Route::get('/agent/scholarships', [ScholarshipController::class, 'agentIndex']);
    Route::post('/agent/scholarships', [ScholarshipController::class, 'store']);
    Route::put('/agent/scholarships/{id}', [ScholarshipController::class, 'update']);
    Route::get('/agent/applications', [ScholarshipApplicationController::class, 'agentIndex']);
    Route::put('/agent/applications/{id}', [ScholarshipApplicationController::class, 'updateStatus']);
    Route::post('/agent/applications/{id}/deadline-reminder', [ScholarshipApplicationController::class, 'sendDeadlineReminder']);

    Route::get('/student/scholarships', [ScholarshipController::class, 'studentIndex']);
    Route::get('/student/interested-scholarships', [ScholarshipController::class, 'interestedIndex']);
    Route::post('/student/scholarships/{id}/interest', [ScholarshipController::class, 'markInterested']);
    Route::delete('/student/scholarships/{id}/interest', [ScholarshipController::class, 'unmarkInterested']);
    Route::post('/student/scholarships/{id}/apply', [ScholarshipApplicationController::class, 'apply']);
    Route::get('/student/applications', [ScholarshipApplicationController::class, 'studentIndex']);
    Route::post('/student/applications/{id}/documents', [ScholarshipApplicationController::class, 'submitRequestedDocuments']);

    Route::post('/applications/{id}/messages', [ScholarshipApplicationController::class, 'sendMessage']);
    Route::get('/documents/{id}/download', [ScholarshipApplicationController::class, 'download']);
});