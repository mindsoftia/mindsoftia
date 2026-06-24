<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Obtiene las métricas generales para el Centro de Control SaaS (Dashboard).
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getMetrics(Request $request): JsonResponse
    {
        try {
            // 1. Métricas Generales de Tenants (Empresas)
            $totalEmpresas = Empresa::count();
            $empresasActivas = Empresa::where('is_active', true)->count();
            
            // 2. Simulador de MRR y Crecimiento (Hasta implementar módulo de facturación SaaS real)
            // Asumimos un ingreso promedio por usuario (ARPU) simulado de $49 USD por empresa activa
            $arpu = 49;
            $mrr = $empresasActivas * $arpu;
            
            // 3. Usuarios Totales en la plataforma (Todas las empresas)
            $totalUsuarios = User::count();

            // 4. Feed de Onboarding: Últimas 5 empresas registradas
            // Obtenemos los campos clave para llenar la tabla del frontend
            $ultimasEmpresas = Empresa::select('id', 'nombre', 'ruc_nit', 'is_active', 'created_at')
                                      ->orderBy('created_at', 'desc')
                                      ->take(5)
                                      ->get()
                                      ->map(function ($empresa) use ($arpu) {
                                          return [
                                              'id' => $empresa->id,
                                              'nombre' => $empresa->nombre,
                                              'ruc_nit' => $empresa->ruc_nit ?? 'N/A',
                                              'plan' => 'Básico', // Simulado por ahora
                                              'ingreso_mensual' => $arpu,
                                              'is_active' => $empresa->is_active,
                                              'fecha_registro' => $empresa->created_at->format('Y-m-d H:i')
                                          ];
                                      });

            // 5. Devolver la respuesta en formato JSON
            return response()->json([
                'success' => true,
                'data' => [
                    'kpis' => [
                        'total_empresas' => $totalEmpresas,
                        'empresas_activas' => $empresasActivas,
                        'mrr' => $mrr,
                        'arpu' => $arpu,
                        'total_usuarios' => $totalUsuarios,
                        'churn_rate' => 1.2, // Simulado estático por ahora
                    ],
                    'ultimas_empresas' => $ultimasEmpresas,
                    // Espacio para métricas de infraestructura (Storage, DB) si se requieren luego
                    'infraestructura' => [
                        'db_connections' => 142, // Se puede dinamizar consultando pg_stat_activity
                        'storage_used' => '1.2 TB'
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al obtener métricas del dashboard: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar las métricas del dashboard.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
