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
            $tenantId = $request->header('X-Tenant-ID');
            
            if (!$tenantId) {
                return response()->json(['success' => false, 'message' => 'Tenant ID no proporcionado'], 400);
            }

            // 1. POS Metrics
            $ventasHoy = \App\Models\PosVenta::where('empresa_id', $tenantId)
                ->whereDate('created_at', now()->toDateString())
                ->sum('total_factura');
            
            $ticketsHoy = \App\Models\PosVenta::where('empresa_id', $tenantId)
                ->whereDate('created_at', now()->toDateString())
                ->count();

            // 2. Inventario Metrics
            $totalProductos = \App\Models\InvProducto::where('empresa_id', $tenantId)
                ->where('estado', true)
                ->count();
            
            // 3. Contabilidad Metrics
            $asientosContables = 0; // Si la tabla existe la usamos, si no en 0 por ahora.
            if (\Schema::hasTable('contab_asientos')) {
                $asientosContables = \DB::table('contab_asientos')->where('empresa_id', $tenantId)->count();
            }

            $clientesActivos = 0;
            if (\Schema::hasTable('crm_terceros')) {
                $clientesActivos = \DB::table('crm_terceros')->where('empresa_id', $tenantId)->where('es_cliente', true)->where('estado', true)->count();
            }

            $cuentasPuc = 0;
            if (\Schema::hasTable('accounts')) {
                $cuentasPuc = \DB::table('accounts')->where('empresa_id', $tenantId)->where('is_active', true)->count();
            }

            // 4. Últimas Ventas POS
            $ultimasVentas = [];
            if (\Schema::hasTable('pos_ventas')) {
                $ultimasVentas = \App\Models\PosVenta::where('empresa_id', $tenantId)
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get()
                    ->map(function ($venta) {
                        return [
                            'id' => $venta->id,
                            'ticket' => ($venta->prefijo . $venta->consecutivo) ?: 'TKT-' . substr($venta->id, 0, 5),
                            'total' => $venta->total_factura,
                            'estado' => $venta->estado ?? 'Completado',
                            'fecha' => $venta->created_at->format('Y-m-d H:i')
                        ];
                    });
            }
                
            $empresa = null;
            if ($tenantId && is_numeric($tenantId)) {
                $empresa = \App\Models\Empresa::find($tenantId);
            }
            if (!$empresa && $tenantId) {
                $empresa = \App\Models\Empresa::where('subdominio', $tenantId)->first();
            }
            if (!$empresa) {
                $host = $request->getHost();
                $subdomain = explode('.', $host)[0] ?? null;
                if ($subdomain && !in_array($subdomain, ['www', 'localhost', 'mindsoftia'])) {
                    $empresa = \App\Models\Empresa::where('subdominio', $subdomain)->first();
                }
            }
            if (!$empresa) {
                $empresa = \App\Models\Empresa::first();
            }

            $empresaNombre = $empresa ? $empresa->nombre : 'Bucaramanga App';
            $empresaNit = ($empresa && $empresa->ruc_nit) ? $empresa->ruc_nit : '901.458.112-8';
            
            // Período en formato amigable en español (Ej: "Julio 2026")
            $mesesEs = [
                1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
                5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
                9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
            ];
            $periodoActual = ($mesesEs[(int)now()->format('n')] ?? 'Julio') . ' ' . now()->format('Y');

            return response()->json([
                'success' => true,
                'data' => [
                    'empresa_nombre' => $empresaNombre,
                    'empresa_nit' => $empresaNit,
                    'periodo_actual' => $periodoActual,
                    'kpis' => [
                        'ventas_hoy' => $ventasHoy ?? 0,
                        'tickets_hoy' => $ticketsHoy ?? 0,
                        'total_productos' => $totalProductos ?? 0,
                        'asientos_contables' => $asientosContables ?? 0,
                        'clientes_activos' => $clientesActivos ?? 0,
                        'cuentas_puc' => $cuentasPuc ?? 0,
                    ],
                    'ultimas_ventas' => $ultimasVentas
                ]
            ]);

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
