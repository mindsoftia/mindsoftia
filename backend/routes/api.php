<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SyncController;

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

    // ── Contabilidad (Fase A - PUC y Asientos) ───────────────────────────────
    Route::apiResource('puc', \App\Http\Controllers\Api\AccountController::class);
    Route::apiResource('accounts', \App\Http\Controllers\Api\AccountController::class);
    Route::apiResource('terceros', \App\Http\Controllers\Api\TerceroController::class);

    // ── Dashboard Metrics (Accesible por Tenants) ──────────────────────────────────
    Route::get('/dashboard/metrics', [\App\Http\Controllers\Api\DashboardController::class, 'getMetrics']);

    // ── Solo Admins (Gestión de Empresas) ───────────────────────────────────
    Route::middleware(['role:admin'])->group(function () {
        Route::apiResource('empresas', \App\Http\Controllers\EmpresaController::class);
    });

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
    Route::get('/empresa/perfil', [\App\Http\Controllers\Api\EmpresaController::class, 'getPerfil']);
    Route::put('/empresa/perfil', [\App\Http\Controllers\Api\EmpresaController::class, 'updatePerfil']);

    // Rutas de Sincronización
    Route::get('/sync/status', [SyncController::class, 'getStatus']);
    Route::post('/sync/force', [SyncController::class, 'forceSync']);
});
