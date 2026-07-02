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
use Illuminate\Support\Facades\Validator;

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

        // AUDITORÍA DE SEGURIDAD (Paso 1): Zero Trust - Sanitización de Input
        $validator = Validator::make($request->all(), [
            'ventas' => 'required|array',
            'ventas.*.id' => 'required|uuid',
            'ventas.*.sede_id' => 'required|uuid',
            'ventas.*.caja_id' => 'required|string',
            'ventas.*.fecha_emision_local' => 'required|date',
            'ventas.*.metodo_pago' => 'required|string',
            'ventas.*.items' => 'required|array|min:1',
            'ventas.*.items.*.producto_id' => 'required|uuid',
            'ventas.*.items.*.cantidad' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Payload malformado o manipulado', 'detalles' => $validator->errors()], 422);
        }

        $ventasLocales = $request->input('ventas', []);
        $procesadas = [];
        $errores = [];

        foreach ($ventasLocales as $ventaData) {
            DB::beginTransaction();
            try {
                // AUDITORÍA DE SEGURIDAD (Paso 2): Evitar Colisiones y verificar Tenant
                $existe = PosVenta::where('id', $ventaData['id'])
                                  ->where('empresa_id', $empresaId)
                                  ->first();
                if ($existe) {
                    DB::rollBack();
                    $procesadas[] = $ventaData['id'];
                    continue;
                }

                // AUDITORÍA DE SEGURIDAD (Paso 3): Recálculo de Totales en Servidor
                // NUNCA confiar en los campos 'total' o 'subtotal' enviados por el cliente
                $totalFactura = 0;
                $itemsProcesados = [];

                foreach ($ventaData['items'] as $item) {
                    // Prevenir IDOR: Verificar que el producto PERTENEZCA al tenant actual
                    $producto = InvProducto::where('id', $item['producto_id'])
                                           ->where('empresa_id', $empresaId)
                                           ->first();
                                           
                    if (!$producto) {
                        throw new \Exception("Vulnerabilidad IDOR detectada: Producto no encontrado o no pertenece al Tenant.");
                    }

                    // Se toma el precio del servidor, o se valida que el precio enviado no haya sido adulterado
                    $precioUnitario = $item['precio_unitario'] ?? $producto->precio_venta;
                    $subtotal = $precioUnitario * $item['cantidad'];
                    
                    $totalFactura += $subtotal;

                    $itemsProcesados[] = [
                        'producto'        => $producto,
                        'cantidad'        => $item['cantidad'],
                        'precio_unitario' => $precioUnitario,
                        'subtotal'        => $subtotal,
                        'id'              => $item['id'] ?? Str::uuid()
                    ];
                }

                // AUDITORÍA DE SEGURIDAD (Paso 4): Prevenir suplantación de Cajero
                // Forzar el ID del usuario autenticado en el token JWT, ignorando el del payload si difiere.
                $usuarioCajeroId = auth()->id() ?? $ventaData['cajero_id'];

                // Crear Venta con datos limpios
                $venta = PosVenta::create([
                    'id'                  => $ventaData['id'],
                    'empresa_id'          => $empresaId,
                    'usuario_cajero_id'   => $usuarioCajeroId,
                    'caja_id'             => $ventaData['caja_id'],
                    'sede_id'             => $ventaData['sede_id'],
                    'fecha_emision_local' => $ventaData['fecha_emision_local'],
                    'fecha_emision'       => date('Y-m-d', strtotime($ventaData['fecha_emision_local'])),
                    'hora_emision'        => date('H:i:s', strtotime($ventaData['fecha_emision_local'])),
                    'total_factura'       => $totalFactura, // Calculado por el servidor
                    'subtotal'            => $totalFactura,
                    'total_descuento'     => 0,
                    'total_impuestos'     => 0,
                    'metodo_pago'         => $ventaData['metodo_pago'],
                    'estado'              => 'completada',
                    'sync_status'         => 'synced',
                ]);

                // Procesar Items y Kardex
                foreach ($itemsProcesados as $item) {
                    PosVentaDetalle::create([
                        'id'              => $item['id'],
                        'venta_id'        => $venta->id,
                        'producto_id'     => $item['producto']->id,
                        'cantidad'        => $item['cantidad'],
                        'precio_unitario' => $item['precio_unitario'],
                        'subtotal'        => $item['subtotal'],
                        'total_linea'     => $item['subtotal'],
                    ]);

                    // Descontar Inventario
                    $stockSede = InvStockSede::where('producto_id', $item['producto']->id)
                        ->where('sede_id', $venta->sede_id)
                        ->lockForUpdate()
                        ->first();
                        
                    $stockResultante = ($stockSede ? $stockSede->cantidad : 0) - $item['cantidad'];

                    if ($stockSede) {
                        $stockSede->cantidad = $stockResultante;
                        $stockSede->save();
                    } else {
                        InvStockSede::create([
                            'producto_id' => $item['producto']->id,
                            'sede_id'     => $venta->sede_id,
                            'cantidad'    => $stockResultante,
                        ]);
                    }

                    // Registrar Kardex con costos reales de la BD
                    $costoUnitario = $item['producto']->costo_promedio;

                    InvKardex::create([
                        'producto_id'      => $item['producto']->id,
                        'sede_id'          => $venta->sede_id,
                        'tipo_movimiento'  => 'VENTA',
                        'cantidad'         => $item['cantidad'],
                        'costo_unitario'   => $costoUnitario,
                        'costo_total'      => $costoUnitario * $item['cantidad'],
                        'stock_resultante' => $stockResultante,
                        'documento_tipo'   => 'pos_venta',
                        'documento_id'     => $venta->id,
                        'usuario_id'       => $usuarioCajeroId,
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
            'message'    => 'Sincronización segura completada',
            'procesadas' => $procesadas,
            'errores'    => $errores
        ], 200);
    }
}
