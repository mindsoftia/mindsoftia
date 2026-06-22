<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes — Mindsoftia
|--------------------------------------------------------------------------
| Todas las rutas bajo el prefijo /api
|
| Rutas públicas  → Sin middleware
| Rutas privadas  → Protegidas por 'supabase.auth'
| Rutas de admin  → Protegidas por 'supabase.auth' + 'role:admin'
*/

// ─── Rutas Públicas ──────────────────────────────────────────────────────────
Route::get('/health', fn () => response()->json([
    'status'    => 'ok',
    'service'   => 'Mindsoftia API',
    'timestamp' => now()->toIso8601String(),
]));

// ─── Rutas Protegidas ────────────────────────────────────────────────────────
Route::middleware(['supabase.auth'])->group(function () {

    // Rutas de Autenticación
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
    });

    // ── Onboarding / Setup de Tenant ────────────────────────────────────────
    Route::post('/onboarding', [\App\Http\Controllers\OnboardingController::class, 'store']);

    // ── Módulo de Seguridad (Roles y Permisos) ──────────────────────────────
    // Protegido con el permiso 'seguridad.editar'
    Route::middleware(['permission:seguridad.editar'])->group(function () {
        Route::get('/roles', [\App\Http\Controllers\Api\RolePermissionController::class, 'index']);
        Route::get('/permisos', [\App\Http\Controllers\Api\RolePermissionController::class, 'listPermissions']);
        Route::post('/roles/{id}/permisos', [\App\Http\Controllers\Api\RolePermissionController::class, 'syncPermissions']);
    });

    // ── Contabilidad (Fase A) ────────────────────────────────────────────────
    // Route::apiResource('puc', PucAccountController::class);
    // Route::apiResource('terceros', TerceroController::class);
    // Route::apiResource('asientos', AsientoController::class);

    // ── Solo Admins ─────────────────────────────────────────────────────────
    Route::middleware(['role:admin'])->group(function () {
        // Route::apiResource('usuarios', UserController::class);
    });

    // ── Superadmin (Gestión de Tenants) ────────────────────────────────────
    Route::apiResource('empresas', \App\Http\Controllers\EmpresaController::class);
});
