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
        $subdominio = null;

        // Si tenemos tenant_id, buscamos los permisos exactos en la base de datos
        if ($userId && $tenantId) {
            try {
                $usuarioEmpresa = UsuarioEmpresa::with(['rol.permisos', 'empresa'])
                    ->where('id_usuario', $userId)
                    ->where('id_empresa', (string)$tenantId)
                    ->where('estado_acceso', true)
                    ->first();

                if ($usuarioEmpresa && $usuarioEmpresa->rol) {
                    $permisos = $usuarioEmpresa->rol->permisos->pluck('codigo_permiso')->toArray();
                    $roleName = $usuarioEmpresa->rol->nombre_rol;
                }
                
                if ($usuarioEmpresa && $usuarioEmpresa->empresa) {
                    $empresaNombre = $usuarioEmpresa->empresa->nombre;
                    $subdominio = $usuarioEmpresa->empresa->subdominio;
                } else {
                    // Fallback to primary Empresas table if relationship is broken
                    $emp = \App\Models\Empresa::find($tenantId);
                    if ($emp) {
                        $empresaNombre = $emp->nombre;
                        $subdominio = $emp->subdominio;
                    }
                }
            } catch (\Exception $e) {
                // Ignore UUID cast errors (SQLSTATE 22P02) or other DB relation errors
                $emp = \App\Models\Empresa::find($tenantId);
                if ($emp) {
                    $empresaNombre = $emp->nombre;
                    $subdominio = $emp->subdominio;
                }
                $roleName = $roleName ?: 'admin'; // Default fallback
            }
        }

        // Forzar rol de admin para los superadministradores por correo
        $superAdmins = ['amadomora@gmail.com'];
        if (in_array($request->attributes->get('auth_user_email'), $superAdmins)) {
            $roleName = 'admin';
        }

        return response()->json([
            'user_id'      => $userId,
            'email'        => $request->attributes->get('auth_user_email'),
            'tenant_id'    => $tenantId,
            'empresa_name' => $empresaNombre,
            'subdominio'   => $subdominio,
            'role'         => $roleName,
            'permissions'  => $permisos,
        ]);
    }
}
