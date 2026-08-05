<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends Controller
{
    /**
     * Obtiene las métricas generales para el Superadmin SaaS.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getMetrics(Request $request): JsonResponse
    {
        Log::info('AdminDashboardController getMetrics INICIADO');
        try {
            // 1. Contar empresas activas
            $empresasActivas = 0;
            if (\Schema::hasTable('empresas')) {
                $empresasActivas = DB::table('empresas')->count();
            }

            // 2. Facturación Electrónica global
            $facturacionDocs = 0;
            if (\Schema::hasTable('fe_documentos')) {
                $facturacionDocs = DB::table('fe_documentos')->count();
            }

            // 3. Nómina / Asientos Contables global (Volumen procesado)
            $nominaProcesado = 0;
            if (\Schema::hasTable('contab_asientos_items')) {
                $nominaProcesado = DB::table('contab_asientos_items')->where('tipo_movimiento', 'credito')->sum('valor');
                if (!$nominaProcesado) {
                    $nominaProcesado = DB::table('contab_asientos_items')->sum('valor') / 2;
                }
            }

            // 4. Ingresos procesados hoy globalmente (Volumen transaccional del SaaS)
            $ingresosHoy = 0;
            $ingresosAyer = 0;
            if (\Schema::hasTable('pos_ventas')) {
                $ingresosHoy = DB::table('pos_ventas')->whereDate('created_at', now()->toDateString())->sum('total_factura');
                $ingresosAyer = DB::table('pos_ventas')->whereDate('created_at', now()->subDay()->toDateString())->sum('total_factura');
            }

            // 5. Transacciones Recientes Globales (Simulando feed del SaaS)
            $transacciones = [];
            if (\Schema::hasTable('pos_ventas') && \Schema::hasTable('empresas')) {
                $transacciones = DB::table('pos_ventas')
                    ->join('empresas', 'pos_ventas.empresa_id', '=', 'empresas.id')
                    ->select('pos_ventas.id', 'empresas.nombre as empresa', 'pos_ventas.total_factura as monto', 'pos_ventas.estado', 'pos_ventas.created_at as fecha')
                    ->orderBy('pos_ventas.created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function($t) {
                        return [
                            'id' => $t->id,
                            'empresa' => $t->empresa,
                            'modulo' => 'POS / Ventas',
                            'estado' => $t->estado ?? 'Completado',
                            'monto' => (float) $t->monto,
                            'fecha' => \Carbon\Carbon::parse($t->fecha)->format('Y-m-d H:i')
                        ];
                    });
            }

            // 6. Gráfico Dinámico (Últimos 7 días de ventas/transacciones globales)
            $fechas = [];
            $valores = [];
            if (\Schema::hasTable('pos_ventas')) {
                for ($i = 6; $i >= 0; $i--) {
                    $date = now()->subDays($i)->toDateString();
                    $fechas[] = now()->subDays($i)->locale('es')->shortDayName; // Lun, Mar, etc.
                    
                    $suma = DB::table('pos_ventas')
                        ->whereDate('created_at', $date)
                        ->sum('total_factura');
                    $valores[] = (float) $suma;
                }
            } else {
                $fechas = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                $valores = [0, 0, 0, 0, 0, 0, 0];
            }

            // 7. Estructurar la respuesta
            return response()->json([
                'success' => true,
                'data' => [
                    'ingresosHoy' => $ingresosHoy,
                    'ingresosAyer' => $ingresosAyer,
                    'empresasActivas' => $empresasActivas,
                    'empresasCrecimiento' => 0,
                    'revenueAnual' => $nominaProcesado, // Usando volumen procesado como métrica grande
                    'revenueCrecimiento' => 0,
                    'conversion' => 100,
                    'conversionCrecimiento' => 0,
                    'suscripciones' => $empresasActivas, // 1 suscripcion por empresa activa
                    'facturacionDocs' => $facturacionDocs,
                    'nominaProcesado' => $nominaProcesado,
                    'transacciones' => $transacciones,
                    'chartData' => [
                        'fechas' => $fechas,
                        'valores' => $valores
                    ]
                ]
            ]);

        } catch (\Throwable $e) {
            Log::error('Error al obtener métricas SaaS: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar las métricas SaaS.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
