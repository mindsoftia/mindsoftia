<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\UsuarioEmpresa;

class CheckPermission
{
    /**
     * Verifica que el usuario tenga el permiso requerido en el tenant actual.
     * Uso: ->middleware('permission:cartera.crear')
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $userId = $request->attributes->get('auth_user_id');
        $tenantId = $request->attributes->get('tenant_id');
        
        // Si no hay sesión válida, denegar. (VerifySupabaseToken ya debería haber validado esto)
        if (!$userId || !$tenantId) {
            return response()->json([
                'error'   => 'No autorizado',
                'message' => 'Faltan credenciales de usuario o empresa activa.'
            ], 401);
        }

        // Buscar al usuario en la empresa actual para obtener sus permisos
        $usuarioEmpresa = UsuarioEmpresa::with('rol.permisos')
            ->where('id_usuario', $userId)
            ->where('id_empresa', $tenantId)
            ->where('estado_acceso', true)
            ->first();

        $permisosDelUsuario = [];
        if ($usuarioEmpresa && $usuarioEmpresa->rol) {
            $permisosDelUsuario = $usuarioEmpresa->rol->permisos->pluck('codigo_permiso')->toArray();
        }

        // Verificar si el arreglo de permisos contiene el que se está solicitando
        if (!in_array($permission, $permisosDelUsuario)) {
            return response()->json([
                'error'   => 'Acceso denegado',
                'message' => "No tienes el permiso necesario para realizar esta acción ({$permission})."
            ], 403);
        }

        return $next($request);
    }
}
