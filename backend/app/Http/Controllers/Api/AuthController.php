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
        $modules = [];
        $emp = null;

        // Si tenemos tenant_id, buscamos los permisos exactos en la base de datos
        if ($userId && $tenantId) {

            // — Paso 1: Intentar cargar rol y permisos desde usuarios_empresas —
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
                    $emp = $usuarioEmpresa->empresa;
                }
            } catch (\Exception $e) {
                // Ignorar errores de UUID cast (SQLSTATE 22P02) u otros
                \Illuminate\Support\Facades\Log::warning('UsuarioEmpresa lookup failed: ' . $e->getMessage());
            }

            // — Paso 2: Si no se obtuvo empresa desde la relacion, buscar directamente —
            if (!$emp) {
                $emp = \App\Models\Empresa::find($tenantId);
            }

            // — Paso 3: Mapear modulos desde la empresa (siempre que exista) —
            if ($emp) {
                $empresaNombre = $emp->nombre;
                $subdominio    = $emp->subdominio;

                // Mapeo estricto: solo agrega el modulo si la columna es true en BD
                if ($emp->modulo_pos_inventario)          $modules[] = 'pos';
                if ($emp->modulo_facturacion_electronica) $modules[] = 'facturacion';
                if ($emp->modulo_compras)                 $modules[] = 'compras';
                if ($emp->modulo_contabilidad)            $modules[] = 'contabilidad';
                if ($emp->modulo_nomina)                  $modules[] = 'nomina';
                if ($emp->modulo_ia_copiloto)             $modules[] = 'ia';
                if ($emp->has_eds_module)                 $modules[] = 'eds';
            }
        }

        // Forzar rol de propietario para desarrollo local
        $roleName = 'propietario';

        return response()->json([
            'user_id'      => $userId,
            'email'        => $request->attributes->get('auth_user_email'),
            'tenant_id'    => $tenantId,
            'empresa_name' => $empresaNombre,
            'subdominio'   => $subdominio,
            'role'         => $roleName,
            'permissions'  => $permisos,
            'modules'      => $modules,
        ]);
    }
}
