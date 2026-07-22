<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvCategoria;
use Illuminate\Http\Request;

class InvCategoriaController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $request->attributes->get('empresa_id') ?? $request->header('X-Tenant-ID');
        if (!$empresaId) {
            return response()->json(['error' => 'Tenant no especificado'], 400);
        }

        $categorias = InvCategoria::where('empresa_id', $empresaId)->orderBy('nombre')->get();
        return response()->json(['categorias' => $categorias]);
    }

    public function store(Request $request)
    {
        $empresaId = $request->attributes->get('empresa_id') ?? $request->header('X-Tenant-ID');
        if (!$empresaId) {
            return response()->json(['error' => 'Tenant no especificado'], 400);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:255',
            'parent_id' => 'nullable|uuid',
            'cuenta_contable_ingreso' => 'nullable|string|max:50',
            'cuenta_contable_costo' => 'nullable|string|max:50',
            'cuenta_contable_inventario' => 'nullable|string|max:50',
            'estado' => 'boolean'
        ]);

        $validated['empresa_id'] = $empresaId;
        $categoria = InvCategoria::create($validated);
        return response()->json(['success' => true, 'categoria' => $categoria]);
    }

    public function update(Request $request, $id)
    {
        $empresaId = $request->attributes->get('empresa_id') ?? $request->header('X-Tenant-ID');
        $categoria = InvCategoria::where('empresa_id', $empresaId)->findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:150',
            'descripcion' => 'nullable|string|max:255',
            'parent_id' => 'nullable|uuid',
            'cuenta_contable_ingreso' => 'nullable|string|max:50',
            'cuenta_contable_costo' => 'nullable|string|max:50',
            'cuenta_contable_inventario' => 'nullable|string|max:50',
            'estado' => 'boolean'
        ]);

        $categoria->update($validated);
        return response()->json(['success' => true, 'categoria' => $categoria]);
    }

    public function destroy(Request $request, $id)
    {
        $empresaId = $request->attributes->get('empresa_id') ?? $request->header('X-Tenant-ID');
        $categoria = InvCategoria::where('empresa_id', $empresaId)->findOrFail($id);
        
        // Verifica si tiene productos antes de borrar
        if ($categoria->productos()->count() > 0) {
            return response()->json(['success' => false, 'error' => 'No se puede eliminar la categoría porque tiene productos asociados.'], 400);
        }

        $categoria->delete();
        return response()->json(['success' => true]);
    }
}
