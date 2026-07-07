<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvCategoria;
use Illuminate\Http\Request;

class InvCategoriaController extends Controller
{
    public function index()
    {
        $categorias = InvCategoria::orderBy('nombre')->get();
        return response()->json(['categorias' => $categorias]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:20',
            'activo' => 'boolean'
        ]);

        $categoria = InvCategoria::create($validated);
        return response()->json(['success' => true, 'categoria' => $categoria]);
    }

    public function update(Request $request, $id)
    {
        $categoria = InvCategoria::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:150',
            'descripcion' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:20',
            'activo' => 'boolean'
        ]);

        $categoria->update($validated);
        return response()->json(['success' => true, 'categoria' => $categoria]);
    }

    public function destroy($id)
    {
        $categoria = InvCategoria::findOrFail($id);
        
        // Verifica si tiene productos antes de borrar (depende de on delete set null de BD, pero es buena práctica)
        if ($categoria->productos()->count() > 0) {
            return response()->json(['success' => false, 'error' => 'No se puede eliminar la categoría porque tiene productos asociados.'], 400);
        }

        $categoria->delete();
        return response()->json(['success' => true]);
    }
}
