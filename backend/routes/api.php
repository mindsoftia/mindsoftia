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
    Route::apiResource('terceros', \App\Http\Controllers\Api\TerceroController::class);
    // Route::apiResource('asientos', AsientoController::class);

    // ── Solo Admins ─────────────────────────────────────────────────────────
    Route::middleware(['role:admin'])->group(function () {
        // Route::apiResource('usuarios', UserController::class);
    });

    // ── Superadmin (Gestión de Tenants y Dashboard) ────────────────────────────────────
    Route::get('/dashboard/metrics', [\App\Http\Controllers\Api\DashboardController::class, 'getMetrics']);
    Route::apiResource('empresas', \App\Http\Controllers\EmpresaController::class);

    // ── NexoPOS — Módulo Inventario Multisede (Paso 3) ─────────────────────────
    Route::prefix('inventario')->group(function () {
        Route::post('productos/import', [\App\Http\Controllers\Api\InvProductoController::class, 'import']);
        Route::apiResource('categorias', \App\Http\Controllers\Api\InvCategoriaController::class);
        Route::apiResource('productos', \App\Http\Controllers\Api\InvProductoController::class);
        Route::apiResource('compras', \App\Http\Controllers\Api\InvCompraController::class);
        // Stock consolidado o filtrado por sede: GET /api/inventario/stock?sede_id=UUID
        Route::get('/stock', [\App\Http\Controllers\Api\InventarioController::class, 'stockConsolidado']);
        // Ajuste de stock manual o entrada por compra: POST /api/inventario/ajuste
        Route::post('/ajuste', [\App\Http\Controllers\Api\InventarioController::class, 'ajuste']);
        // Traslado entre sedes: POST /api/inventario/traslados
        Route::post('/traslados', [\App\Http\Controllers\Api\InventarioController::class, 'traslado']);
        // Historial de movimientos: GET /api/inventario/kardex/{productoId}?sede_id=UUID
        Route::get('/kardex/{productoId}', [\App\Http\Controllers\Api\InventarioController::class, 'kardex']);
    });

    // ── NexoPOS — Punto de Venta ─────────────────────────
    Route::prefix('pos')->group(function () {
        Route::post('/sync', [\App\Http\Controllers\Api\PosVentaController::class, 'sync']);
    });

    // ── Configuracion ────────────────────────────────────────────────────────
    Route::get('/empresa/settings', [\App\Http\Controllers\EmpresaController::class, 'settings']);
});
