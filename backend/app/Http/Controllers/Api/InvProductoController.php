<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvProducto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Usar empresa_id inyectado por el middleware de autenticación (fuente de verdad)
        // Fallback al header X-Tenant-ID para compatibilidad con peticiones directas
        $empresaId = $request->attributes->get('empresa_id') ?? $request->header('X-Tenant-ID');
        if (!$empresaId) {
            return response()->json(['error' => 'Tenant no especificado'], 400);
        }

        $productos = InvProducto::with('categoria')->where('empresa_id', $empresaId)->get();
        return response()->json($productos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $empresaId = $request->header('X-Tenant-ID');
        if (!$empresaId) {
            return response()->json(['error' => 'Tenant no especificado'], 400);
        }

        $validated = $request->validate([
            'categoria_id' => 'nullable|uuid|exists:inv_categorias,id',
            'codigo_sku' => 'nullable|string|max:50',
            'codigo_barras' => 'nullable|string|max:100',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'precio_venta_1' => 'required|numeric|min:0',
            'costo_promedio' => 'required|numeric|min:0',
            'tarifa_impuesto' => 'numeric|min:0',
            'stock_actual' => 'numeric|min:0',
            'stock_maximo' => 'numeric|min:0',
            'tipo' => 'nullable|string|max:50',
            'controla_inventario' => 'boolean',
            'etiquetas' => 'nullable|array',
            'imagen_url' => 'nullable|string',
        ]);

        $validated['empresa_id'] = $empresaId;

        $producto = InvProducto::create($validated);
        return response()->json($producto, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $producto = InvProducto::with('categoria')->findOrFail($id);
        return response()->json($producto);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $producto = InvProducto::findOrFail($id);

        $validated = $request->validate([
            'categoria_id' => 'nullable|uuid|exists:inv_categorias,id',
            'codigo_sku' => 'nullable|string|max:50',
            'codigo_barras' => 'nullable|string|max:100',
            'nombre' => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'precio_venta_1' => 'sometimes|required|numeric|min:0',
            'costo_promedio' => 'sometimes|required|numeric|min:0',
            'tarifa_impuesto' => 'numeric|min:0',
            'stock_actual' => 'numeric|min:0',
            'stock_maximo' => 'numeric|min:0',
            'tipo' => 'nullable|string|max:50',
            'controla_inventario' => 'boolean',
            'etiquetas' => 'nullable|array',
            'estado' => 'boolean',
            'imagen_url' => 'nullable|string',
        ]);

        $producto->update($validated);
        return response()->json($producto);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $producto = InvProducto::findOrFail($id);
        $producto->update(['estado' => false]);
        return response()->json(['message' => 'Producto inactivo']);
    }

    /**
     * Import products in bulk via CSV (Supabase Batch Insert)
     */
    public function import(Request $request)
    {
        $empresaId = $request->header('X-Tenant-ID');
        if (!$empresaId) {
            return response()->json(['error' => 'Tenant no especificado'], 400);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120', // Max 5MB
        ]);

        $file = $request->file('file');
        $csvData = file_get_contents($file->getRealPath());
        $rows = array_map('str_getcsv', explode("\n", $csvData));
        $header = array_shift($rows);

        // Expected headers: nombre, codigo_sku, codigo_barras, precio_venta, costo_promedio, tipo
        $recordsToInsert = [];
        $now = now();

        foreach ($rows as $row) {
            if (count($row) !== count($header)) continue;
            
            $data = array_combine($header, $row);
            
            // Basic validation for mandatory fields in CSV
            if (empty(trim($data['nombre'] ?? ''))) continue;

            $recordsToInsert[] = [
                'id'             => Str::uuid()->toString(),
                'empresa_id'     => $empresaId,
                'nombre'         => trim($data['nombre']),
                'codigo_sku'     => trim($data['codigo_sku'] ?? ''),
                'codigo_barras'  => trim($data['codigo_barras'] ?? ''),
                'precio_venta_1' => (float) ($data['precio_venta'] ?? 0),
                'costo_promedio' => (float) ($data['costo_promedio'] ?? 0),
                'tarifa_impuesto'=> (float) ($data['tarifa_impuesto'] ?? 0),
                'tipo'           => trim($data['tipo'] ?? 'fisico'),
                'created_at'     => $now,
                'updated_at'     => $now,
            ];
        }

        if (count($recordsToInsert) === 0) {
            return response()->json(['error' => 'No se encontraron registros válidos para importar.'], 400);
        }

        // Batch Insert leveraging PostgreSQL/Supabase raw power for high performance
        DB::table('inv_productos')->insert($recordsToInsert);

        return response()->json([
            'success' => true,
            'message' => count($recordsToInsert) . ' productos importados exitosamente.',
        ]);
    }
}
