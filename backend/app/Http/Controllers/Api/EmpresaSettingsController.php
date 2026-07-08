<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmpresaSettingsController extends Controller
{
    public function show(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['error' => 'No tenant ID provided'], 400);
        }

        $empresa = DB::table('empresas')->where('id', $tenantId)->first(['moneda_defecto', 'impuesto_defecto', 'nombre', 'email_contacto']);
        
        if (!$empresa) {
            return response()->json(['error' => 'Empresa no encontrada'], 404);
        }

        return response()->json($empresa);
    }

    public function update(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['error' => 'No tenant ID provided'], 400);
        }

        $validated = $request->validate([
            'moneda_defecto' => 'string|max:3',
            'impuesto_defecto' => 'numeric|min:0|max:100',
        ]);

        DB::table('empresas')->where('id', $tenantId)->update($validated);

        return response()->json(['message' => 'Configuración actualizada con éxito']);
    }
}
