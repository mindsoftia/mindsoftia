<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvCompra;
use App\Models\InvCompraDetalle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Tercero;
use App\Models\InvProducto;

class InvCompraController extends Controller
{
    /**
     * Almacena una nueva compra y afecta el Kardex de inventario.
     */
    public function store(Request $request)
    {
        $empresaId = $request->header('X-Tenant-ID');
        if (!$empresaId) {
            return response()->json(['error' => 'Tenant no especificado'], 400);
        }

        $validated = $request->validate([
            'tercero_id' => 'required|uuid',
            'sede_id' => 'required|uuid',
            'numero_factura' => 'required|string|max:50',
            'fecha_compra' => 'required|date',
            'condicion_pago' => 'required|string|in:CONTADO,CREDITO',
            'notas' => 'nullable|string',
            'detalles' => 'required|array|min:1',
            'detalles.*.producto_id' => 'required|uuid',
            'detalles.*.cantidad' => 'required|numeric|min:0.01',
            'detalles.*.costo_unitario' => 'required|numeric|min:0',
            'detalles.*.porcentaje_impuesto' => 'required|numeric|min:0'
        ]);

        // Calcular fecha de vencimiento basado en los días de crédito del proveedor
        $proveedor = Tercero::where('empresa_id', $empresaId)
            ->where('id', $validated['tercero_id'])
            ->firstOrFail();

        $diasCredito = $proveedor->dias_credito ?? 0;
        $fechaVencimiento = date('Y-m-d', strtotime($validated['fecha_compra'] . " + {$diasCredito} days"));

        try {
            DB::beginTransaction();

            $subtotalGlobal = 0;
            $impuestosGlobal = 0;

            // 1. Crear el Encabezado de la Compra (temporalmente con totales 0)
            $compra = InvCompra::create([
                'empresa_id' => $empresaId,
                'tercero_id' => $validated['tercero_id'],
                'sede_id' => $validated['sede_id'],
                'numero_factura' => $validated['numero_factura'],
                'fecha_compra' => $validated['fecha_compra'],
                'fecha_vencimiento' => $fechaVencimiento,
                'condicion_pago' => $validated['condicion_pago'],
                'notas' => $validated['notas'] ?? null,
                'estado' => 'COMPLETADA',
                'subtotal' => 0,
                'total_impuestos' => 0,
                'total_factura' => 0
            ]);

            // 2. Procesar Detalles y Afectar Inventario
            foreach ($validated['detalles'] as $item) {
                $subtotalItem = $item['cantidad'] * $item['costo_unitario'];
                $valorImpuesto = $subtotalItem * ($item['porcentaje_impuesto'] / 100);
                $totalItem = $subtotalItem + $valorImpuesto;

                $subtotalGlobal += $subtotalItem;
                $impuestosGlobal += $valorImpuesto;

                // Crear el Detalle
                InvCompraDetalle::create([
                    'empresa_id' => $empresaId,
                    'compra_id' => $compra->id,
                    'producto_id' => $item['producto_id'],
                    'cantidad' => $item['cantidad'],
                    'costo_unitario' => $item['costo_unitario'],
                    'porcentaje_impuesto' => $item['porcentaje_impuesto'],
                    'valor_impuesto' => $valorImpuesto,
                    'subtotal' => $subtotalItem,
                    'total' => $totalItem
                ]);

                // 3. Afectar Kardex (Lógica NIIF de Costo Promedio)
                // Se invoca un método de InventarioController o se inserta directo en Kardex
                // En Mindsoftia, se suele usar la base de datos para registrar el movimiento
                $this->registrarEntradaKardex(
                    $empresaId, 
                    $item['producto_id'], 
                    $validated['sede_id'], 
                    $item['cantidad'], 
                    $item['costo_unitario'],
                    "COMPRA: " . $validated['numero_factura'],
                    $compra->id
                );
            }

            // 4. Actualizar Totales de la Compra
            $compra->update([
                'subtotal' => $subtotalGlobal,
                'total_impuestos' => $impuestosGlobal,
                'total_factura' => $subtotalGlobal + $impuestosGlobal
            ]);

            DB::commit();
            return response()->json($compra->load('detalles'), 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al procesar compra', 'message' => $e->getMessage()], 500);
        }
    }

    private function registrarEntradaKardex($empresaId, $productoId, $sedeId, $cantidad, $costoUnitario, $concepto, $referenciaId)
    {
        // Calcular el nuevo costo promedio
        $producto = InvProducto::where('empresa_id', $empresaId)->where('id', $productoId)->lockForUpdate()->firstOrFail();
        
        // Obtener stock actual global o por sede (depende de arquitectura)
        $stockActual = $producto->stock_actual ?? 0;
        $costoPromedioActual = $producto->costo_promedio ?? 0;

        $valorTotalActual = $stockActual * $costoPromedioActual;
        $valorEntrada = $cantidad * $costoUnitario;
        
        $nuevoStock = $stockActual + $cantidad;
        $nuevoCostoPromedio = $nuevoStock > 0 ? ($valorTotalActual + $valorEntrada) / $nuevoStock : 0;

        // Actualizar maestro producto
        $producto->update([
            'stock_actual' => $nuevoStock,
            'costo_promedio' => $nuevoCostoPromedio
        ]);

        // Insertar en inv_kardex
        DB::table('inv_kardex')->insert([
            'id' => \Illuminate\Support\Str::uuid(),
            'empresa_id' => $empresaId,
            'producto_id' => $productoId,
            'sede_id' => $sedeId,
            'tipo_movimiento' => 'ENTRADA',
            'cantidad' => $cantidad,
            'costo_unitario' => $costoUnitario,
            'saldo_cantidad' => $nuevoStock,
            'concepto' => $concepto,
            'referencia_id' => $referenciaId, // ID de la compra
            'referencia_tipo' => 'App\Models\InvCompra',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
