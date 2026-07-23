<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class EmpresaController extends Controller
{
    /**
     * Obtiene el perfil de la empresa actual
     */
    public function getPerfil(Request $request): JsonResponse
    {
        $empresaId = $request->attributes->get('empresa_id');
        
        if (!$empresaId) {
            return response()->json(['success' => false, 'message' => 'Empresa no encontrada en el contexto'], 404);
        }

        $empresa = Empresa::find($empresaId);

        if (!$empresa) {
            return response()->json(['success' => false, 'message' => 'Empresa no encontrada'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $empresa
        ]);
    }

    /**
     * Actualiza el perfil de la empresa actual
     */
    public function updatePerfil(Request $request): JsonResponse
    {
        $empresaId = $request->attributes->get('empresa_id');
        
        if (!$empresaId) {
            return response()->json(['success' => false, 'message' => 'Empresa no encontrada en el contexto'], 404);
        }

        $empresa = Empresa::find($empresaId);

        if (!$empresa) {
            return response()->json(['success' => false, 'message' => 'Empresa no encontrada'], 404);
        }

        // Validación estricta DIAN
        $validator = Validator::make($request->all(), [
            'nombre_comercial'      => 'nullable|string|max:255',
            'tipo_persona'          => 'required|in:Jurídica,Natural',
            'tipo_documento_id'     => 'required|string|max:3',
            'ruc_nit'               => 'required|string|max:50',
            'digito_verificacion'   => 'nullable|string|max:1',
            'codigo_ciiu'           => 'nullable|string|max:10',
            'responsabilidades_rut' => 'nullable|array',
            'direccion_fiscal'      => 'nullable|string|max:255',
            'codigo_postal'         => 'nullable|string|max:10',
            'codigo_departamento'   => 'nullable|string|max:2',
            'codigo_municipio'      => 'nullable|string|max:3',
            'email_facturacion'     => 'nullable|email|max:255',
            'matricula_mercantil'   => 'nullable|string|max:50',
            'telefono'              => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors'  => $validator->errors()
            ], 422);
        }

        $empresa->update($request->only([
            'nombre_comercial',
            'tipo_persona',
            'tipo_documento_id',
            'ruc_nit',
            'digito_verificacion',
            'codigo_ciiu',
            'responsabilidades_rut',
            'direccion_fiscal',
            'codigo_postal',
            'codigo_departamento',
            'codigo_municipio',
            'email_facturacion',
            'matricula_mercantil',
            'telefono'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Perfil de empresa actualizado correctamente',
            'data'    => $empresa
        ]);
    }
}
