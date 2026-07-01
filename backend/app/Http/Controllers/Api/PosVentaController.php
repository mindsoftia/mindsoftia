<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PosVenta;
use App\Models\PosVentaDetalle;
use App\Models\InvProducto;
use App\Models\InvStockSede;
use App\Models\InvKardex;
use Illuminate\Support\Str;

class PosVentaController extends Controller
{
    /**
     * Sincronizar ventas (Offline to Online)
     * POST /api/pos/sync
     */
    public function sync(Request $request)
    {
        $empresaId = $request->header('X-Tenant-ID') ?? auth()->user()->empresa_id;
        if (!$empresaId) {
            return response()->json(['error' => 'Tenant no especificado'], 400);
        }

        $ventasLocales = $request->input('ventas', []);
        $procesadas = [];
        $errores = [];

        foreach ($ventasLocales as $ventaData) {
            DB::beginTransaction();
            try {
                // Verificar si ya existe para no duplicar
                $existe = PosVenta::where('id', $ventaData['id'])->first();
                if ($existe) {
                    DB::rollBack();
                    $procesadas[] = $ventaData['id'];
                    continue;
                }

                // Crear Venta
                $venta = PosVenta::create([
                    'id'                  => $ventaData['id'],
                    'empresa_id'          => $empresaId,
                    'usuario_cajero_id'   => $ventaData['cajero_id'],
                    'caja_id'             => $ventaData['caja_id'],
                    'sede_id'             => $ventaData['sede_id'],
                    'fecha_emision_local' => $ventaData['fecha_emision_local'],
                    'fecha_emision'       => date('Y-m-d', strtotime($ventaData['fecha_emision_local'])),
                    'hora_emision'        => date('H:i:s', strtotime($ventaData['fecha_emision_local'])),
                    'total_factura'       => $ventaData['total'],
                    'subtotal'            => $ventaData['total'],
                    'total_descuento'     => 0,
                    'total_impuestos'     => 0,
                    'metodo_pago'         => $ventaData['metodo_pago'],
                    'estado'              => 'completada',
                    'sync_status'         => 'synced',
                ]);

                // Procesar Items y Kardex
                foreach ($ventaData['items'] as $item) {
                    PosVentaDetalle::create([
                        'id'              => $item['id'] ?? Str::uuid(),
                        'venta_id'        => $venta->id,
                        'producto_id'     => $item['producto_id'],
                        'cantidad'        => $item['cantidad'],
                        'precio_unitario' => $item['precio_unitario'],
                        'subtotal'        => $item['subtotal'],
                        'total_linea'     => $item['subtotal'],
                    ]);

                    // Descontar Inventario
                    $stockSede = InvStockSede::where('producto_id', $item['producto_id'])
                        ->where('sede_id', $venta->sede_id)
                        ->lockForUpdate()
                        ->first();
                        
                    $stockAnterior = $stockSede ? $stockSede->cantidad : 0;
                    $stockResultante = $stockAnterior - $item['cantidad'];

                    if ($stockSede) {
                        $stockSede->cantidad = $stockResultante;
                        $stockSede->save();
                    } else {
                        // Vender sin stock genera negativo (opcional, dependiendo de configuración)
                        $stockSede = InvStockSede::create([
                            'producto_id' => $item['producto_id'],
                            'sede_id'     => $venta->sede_id,
                            'cantidad'    => $stockResultante,
                        ]);
                    }

                    // Registrar Kardex
                    $producto = InvProducto::find($item['producto_id']);
                    $costoUnitario = $producto ? $producto->costo_promedio : 0;

                    InvKardex::create([
                        'producto_id'      => $item['producto_id'],
                        'sede_id'          => $venta->sede_id,
                        'tipo_movimiento'  => 'VENTA',
                        'cantidad'         => $item['cantidad'],
                        'costo_unitario'   => $costoUnitario,
                        'costo_total'      => $costoUnitario * $item['cantidad'],
                        'stock_resultante' => $stockResultante,
                        'documento_tipo'   => 'pos_venta',
                        'documento_id'     => $venta->id,
                        'usuario_id'       => $venta->usuario_cajero_id,
                    ]);
                }

                DB::commit();
                $procesadas[] = $venta->id;
            } catch (\Exception $e) {
                DB::rollBack();
                $errores[] = [
                    'venta_id' => $ventaData['id'],
                    'error'    => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'message'    => 'Sincronización completada',
            'procesadas' => $procesadas,
            'errores'    => $errores
        ], 200);
    }
}
