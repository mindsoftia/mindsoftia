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
            'nombre'    => 'required|string|max:255',
            'ruc_nit'   => 'nullable|string|max:50|unique:empresas,ruc_nit',
            'email'     => 'nullable|email|max:255',
            'telefono'  => 'nullable|string|max:20',
            'is_active' => 'boolean',
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
            'nombre'    => 'required|string|max:255',
            'ruc_nit'   => 'nullable|string|max:50|unique:empresas,ruc_nit,' . $empresa->id,
            'email'     => 'nullable|email|max:255',
            'telefono'  => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $empresa->update($validated);
        return response()->json($empresa);
    }

    public function destroy(Empresa $empresa)
    {
        $empresa->delete();
        return response()->json(null, 204);
    }
}
