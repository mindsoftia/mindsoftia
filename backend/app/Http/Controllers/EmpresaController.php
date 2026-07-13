<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;

class EmpresaController extends Controller
{
    public function index()
    {
        return response()->json(Empresa::orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'     => 'required|string|max:255',
            'subdominio' => 'required|string|max:50|unique:empresas,subdominio|regex:/^[a-z0-9\-]+$/i',
            'ruc_nit'    => 'nullable|string|max:50|unique:empresas,ruc_nit',
            'email'      => 'nullable|email|max:255',
            'telefono'   => 'nullable|string|max:20',
            'is_active'  => 'boolean',
            // Módulos premium
            'modulo_facturacion_electronica' => 'boolean',
            'modulo_nomina'                  => 'boolean',
            'modulo_pos_inventario'          => 'boolean',
            'modulo_ia_copiloto'             => 'boolean',
        ]);

        $empresa = Empresa::create($validated);
        return response()->json($empresa, 201);
    }

    public function show(Empresa $empresa)
    {
        return response()->json($empresa);
    }

    public function update(Request $request, Empresa $empresa)
    {
        $validated = $request->validate([
            'nombre'     => 'required|string|max:255',
            'subdominio' => 'required|string|max:50|regex:/^[a-z0-9\-]+$/i|unique:empresas,subdominio,' . $empresa->id,
            'ruc_nit'    => 'nullable|string|max:50|unique:empresas,ruc_nit,' . $empresa->id,
            'email'      => 'nullable|email|max:255',
            'telefono'   => 'nullable|string|max:20',
            'is_active'  => 'boolean',
            // Módulos premium
            'modulo_facturacion_electronica' => 'boolean',
            'modulo_nomina'                  => 'boolean',
            'modulo_pos_inventario'          => 'boolean',
            'modulo_ia_copiloto'             => 'boolean',
        ]);

        $empresa->update($validated);
        return response()->json($empresa);
    }

    public function destroy(Empresa $empresa)
    {
        $empresa->delete();
        return response()->json(null, 204);
    }

    public function settings(Request $request)
    {
        $empresaId = $request->attributes->get('empresa_id') ?? $request->header('X-Tenant-ID');
        if (!$empresaId) {
            return response()->json(['error' => 'Tenant no especificado'], 400);
        }
        $empresa = Empresa::find($empresaId);
        
        return response()->json([
            'impuesto_defecto' => $empresa->impuesto_defecto ?? 19,
            'moneda_defecto'   => $empresa->moneda_defecto ?? 'COP'
        ]);
    }
}
