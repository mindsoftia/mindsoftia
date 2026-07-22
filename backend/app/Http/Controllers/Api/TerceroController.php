<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tercero;
use Illuminate\Http\Request;

class TerceroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $empresaId = $request->header('X-Tenant-ID') ?? null;
        if (!$empresaId) {
            return response()->json(['error' => 'Tenant no especificado'], 400);
        }

        $query = Tercero::where('empresa_id', $empresaId);

        if ($request->has('tipo')) {
            if ($request->tipo === 'proveedor') {
                $query->where('es_proveedor', true);
            } elseif ($request->tipo === 'cliente') {
                $query->where('es_cliente', true);
            }
        }

        return response()->json($query->get());
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
            'tipo_identificacion' => 'required|string|max:5',
            'numero_identificacion' => 'required|string|max:20',
            'nombres' => 'nullable|string|max:100',
            'apellidos' => 'nullable|string|max:100',
            'razon_social' => 'nullable|string|max:200',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'es_cliente' => 'boolean',
            'es_proveedor' => 'boolean',
            'dias_credito' => 'nullable|integer|min:0',
            'limite_credito' => 'nullable|numeric|min:0',
            'documento_rut_url' => 'nullable|string',
            'camara_comercio_url' => 'nullable|string',
            'certificacion_bancaria_url' => 'nullable|string'
        ]);

        $validated['empresa_id'] = $empresaId;

        $tercero = Tercero::create($validated);

        return response()->json($tercero, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $tercero = Tercero::findOrFail($id);
        return response()->json($tercero);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $tercero = Tercero::findOrFail($id);
        
        $validated = $request->validate([
            'tipo_identificacion' => 'sometimes|string|max:5',
            'numero_identificacion' => 'sometimes|string|max:20',
            'nombres' => 'nullable|string|max:100',
            'apellidos' => 'nullable|string|max:100',
            'razon_social' => 'nullable|string|max:200',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'es_cliente' => 'boolean',
            'es_proveedor' => 'boolean',
            'estado' => 'boolean',
            'dias_credito' => 'nullable|integer|min:0',
            'limite_credito' => 'nullable|numeric|min:0',
            'documento_rut_url' => 'nullable|string',
            'camara_comercio_url' => 'nullable|string',
            'certificacion_bancaria_url' => 'nullable|string'
        ]);

        $tercero->update($validated);

        return response()->json($tercero);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $tercero = Tercero::findOrFail($id);
        $tercero->update(['estado' => false]); // Soft delete visual
        return response()->json(['message' => 'Tercero inactivo']);
    }
}
