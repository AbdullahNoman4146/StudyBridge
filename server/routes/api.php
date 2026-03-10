<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/countries', [AuthController::class, 'countries']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/admin/agents', [AuthController::class, 'createAgent']);
    Route::get('/admin/summary', [AuthController::class, 'adminSummary']);
    Route::get('/admin/students', [AuthController::class, 'listStudents']);
    Route::get('/admin/agents', [AuthController::class, 'listAgents']);
    Route::delete('/admin/students/{id}', [AuthController::class, 'deleteStudent']);
    Route::delete('/admin/agents/{id}', [AuthController::class, 'deleteAgent']);

    Route::post('/agent/change-password', [AuthController::class, 'changePassword']);
});