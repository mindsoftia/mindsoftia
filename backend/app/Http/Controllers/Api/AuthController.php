<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\UsuarioEmpresa;

class AuthController extends Controller
{
    /**
     * Retorna el perfil del usuario autenticado.
     * El middleware ya validó el JWT y cargó los atributos.
     */
    public function me(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $tenantId = $request->attributes->get('empresa_id');
        $roleName = $request->attributes->get('auth_role');

        $permisos = [];
        $empresaNombre = null;

        // Si tenemos tenant_id, buscamos los permisos exactos en la base de datos
        if ($userId && $tenantId) {
            $usuarioEmpresa = UsuarioEmpresa::with(['rol.permisos', 'empresa'])
                ->where('id_usuario', $userId)
                ->where('id_empresa', $tenantId)
                ->where('estado_acceso', true)
                ->first();

            if ($usuarioEmpresa && $usuarioEmpresa->rol) {
                // Extraemos solo el arreglo de 'codigo_permiso' (ej: ['cartera.ver', 'marketing.crear'])
                $permisos = $usuarioEmpresa->rol->permisos->pluck('codigo_permiso')->toArray();
                $roleName = $usuarioEmpresa->rol->nombre_rol; // Aseguramos el nombre real de BD
            }
            
            if ($usuarioEmpresa && $usuarioEmpresa->empresa) {
                $empresaNombre = $usuarioEmpresa->empresa->nombre_empresa;
            }
        }

        return response()->json([
            'user_id'      => $userId,
            'email'        => $request->attributes->get('auth_user_email'),
            'tenant_id'    => $tenantId,
            'empresa_name' => $empresaNombre,
            'role'         => $roleName,
            'permissions'  => $permisos,
        ]);
    }
}
