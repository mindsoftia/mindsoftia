<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvProducto;
use Illuminate\Http\Request;

class InvProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $empresaId = $request->header('X-Tenant-ID');
        if (!$empresaId) {
            return response()->json(['error' => 'Tenant no especificado'], 400);
        }

        $productos = InvProducto::where('empresa_id', $empresaId)->get();
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
            'referencia' => 'nullable|string|max:50',
            'codigo_barras' => 'nullable|string|max:100',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'unidad_medida' => 'nullable|string|max:20',
            'precio_venta' => 'required|numeric|min:0',
            'costo_promedio' => 'required|numeric|min:0',
            'stock_minimo' => 'numeric|min:0',
            'tipo' => 'nullable|string|max:50',
            'maneja_inventario' => 'boolean',
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
        $producto = InvProducto::findOrFail($id);
        return response()->json($producto);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $producto = InvProducto::findOrFail($id);

        $validated = $request->validate([
            'referencia' => 'nullable|string|max:50',
            'codigo_barras' => 'nullable|string|max:100',
            'nombre' => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'unidad_medida' => 'nullable|string|max:20',
            'precio_venta' => 'sometimes|required|numeric|min:0',
            'costo_promedio' => 'sometimes|required|numeric|min:0',
            'stock_minimo' => 'numeric|min:0',
            'tipo' => 'nullable|string|max:50',
            'maneja_inventario' => 'boolean',
            'activo' => 'boolean'
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
        $producto->update(['activo' => false]);
        return response()->json(['message' => 'Producto inactivo']);
    }
}
