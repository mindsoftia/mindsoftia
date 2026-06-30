<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\InvProducto;
use App\Models\InvStockSede;
use App\Models\InvLote;
use App\Models\InvKardex;

class InventarioController extends Controller
{
    // ════════════════════════════════════════════════════
    // 1. CONSULTA DE STOCK — Consolidado o por sede
    // GET /api/inventario/stock?sede_id=UUID (opcional)
    // ════════════════════════════════════════════════════
    public function stockConsolidado(Request $request)
    {
        $empresaId = auth()->user()->empresa_id;
        $sedeId    = $request->query('sede_id');

        $query = InvProducto::with(['stockSedes.sede'])
            ->where('empresa_id', $empresaId)
            ->where('activo', true)
            ->where('maneja_inventario', true);

        $productos = $query->get()->map(function ($producto) use ($sedeId) {
            $stock = $sedeId
                ? $producto->stockSedes->where('sede_id', $sedeId)->first()
                : null;

            return [
                'id'             => $producto->id,
                'referencia'     => $producto->referencia,
                'codigo_barras'  => $producto->codigo_barras,
                'nombre'         => $producto->nombre,
                'unidad_medida'  => $producto->unidad_medida,
                'precio_venta'   => $producto->precio_venta,
                'costo_promedio' => $producto->costo_promedio,
                'stock_minimo'   => $producto->stock_minimo,
                // Si se filtra por sede, muestra ese stock; si no, muestra el total
                'stock_actual'   => $sedeId
                    ? ($stock ? $stock->cantidad : 0)
                    : $producto->stockTotal(),
                'stock_por_sede' => $sedeId ? null : $producto->stockSedes->map(fn($s) => [
                    'sede_id'    => $s->sede_id,
                    'sede_nombre'=> $s->sede->nombre ?? 'N/A',
                    'cantidad'   => $s->cantidad,
                ]),
                'alerta_stock'   => $producto->tieneAlertaStock(),
            ];
        });

        return response()->json(['data' => $productos]);
    }

    // ════════════════════════════════════════════════════
    // 2. TRASLADO ENTRE SEDES (Atómico)
    // POST /api/inventario/traslados
    // ════════════════════════════════════════════════════
    public function traslado(Request $request)
    {
        $request->validate([
            'producto_id'  => 'required|uuid|exists:inv_productos,id',
            'sede_origen'  => 'required|uuid|exists:inv_sedes,id',
            'sede_destino' => 'required|uuid|exists:inv_sedes,id|different:sede_origen',
            'cantidad'     => 'required|numeric|min:0.001',
            'observacion'  => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $productoId  = $request->producto_id;
            $sedeOrigen  = $request->sede_origen;
            $sedeDestino = $request->sede_destino;
            $cantidad    = $request->cantidad;
            $usuarioId   = auth()->id();
            $trasladoId  = Str::uuid()->toString();

            // ─── Verificar stock suficiente en origen ───
            $stockOrigen = InvStockSede::where('producto_id', $productoId)
                ->where('sede_id', $sedeOrigen)
                ->lockForUpdate() // Lock para evitar condición de carrera
                ->first();

            if (!$stockOrigen || $stockOrigen->cantidad < $cantidad) {
                DB::rollBack();
                return response()->json([
                    'error' => 'Stock insuficiente en la sede de origen.',
                    'stock_disponible' => $stockOrigen?->cantidad ?? 0,
                ], 422);
            }

            // ─── Descontar de sede origen ────────────────
            $stockOrigen->decrement('cantidad', $cantidad);
            $stockOrigen->touch();

            // ─── Acreditar en sede destino ───────────────
            InvStockSede::updateOrCreate(
                ['producto_id' => $productoId, 'sede_id' => $sedeDestino],
                ['cantidad'    => DB::raw("cantidad + {$cantidad}")]
            );

            // ─── Registrar en Kardex (2 filas: salida + entrada) ──
            $costoUnitario = $stockOrigen->costo_promedio;

            InvKardex::create([
                'producto_id'      => $productoId,
                'sede_id'          => $sedeOrigen,
                'tipo_movimiento'  => 'TRASLADO_SALIDA',
                'cantidad'         => -$cantidad,
                'costo_unitario'   => $costoUnitario,
                'costo_total'      => $costoUnitario * $cantidad,
                'stock_resultante' => $stockOrigen->cantidad,
                'documento_tipo'   => 'traslado',
                'documento_id'     => $trasladoId,
                'observacion'      => $request->observacion,
                'usuario_id'       => $usuarioId,
            ]);

            $stockDestino = InvStockSede::where('producto_id', $productoId)
                ->where('sede_id', $sedeDestino)->first();

            InvKardex::create([
                'producto_id'      => $productoId,
                'sede_id'          => $sedeDestino,
                'tipo_movimiento'  => 'TRASLADO_ENTRADA',
                'cantidad'         => $cantidad,
                'costo_unitario'   => $costoUnitario,
                'costo_total'      => $costoUnitario * $cantidad,
                'stock_resultante' => $stockDestino->cantidad,
                'documento_tipo'   => 'traslado',
                'documento_id'     => $trasladoId,
                'observacion'      => $request->observacion,
                'usuario_id'       => $usuarioId,
            ]);

            DB::commit();

            return response()->json([
                'message'     => 'Traslado ejecutado correctamente.',
                'traslado_id' => $trasladoId,
                'cantidad'    => $cantidad,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ════════════════════════════════════════════════════
    // 3. CONSULTA DE KARDEX (Historial de movimientos)
    // GET /api/inventario/kardex/{productoId}?sede_id=UUID
    // ════════════════════════════════════════════════════
    public function kardex(Request $request, string $productoId)
    {
        $query = InvKardex::with('sede')
            ->where('producto_id', $productoId)
            ->orderBy('fecha_movimiento', 'desc');

        if ($request->query('sede_id')) {
            $query->where('sede_id', $request->query('sede_id'));
        }

        $movimientos = $query->paginate(50);

        return response()->json($movimientos);
    }
}
