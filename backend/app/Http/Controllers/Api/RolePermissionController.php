<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Rol;
use App\Models\Permiso;

class RolePermissionController extends Controller
{
    /**
     * Lista todos los roles con sus permisos asignados
     */
    public function index(): JsonResponse
    {
        $roles = Rol::with('permisos')->orderBy('id_rol', 'asc')->get();
        return response()->json($roles);
    }

    /**
     * Lista maestra de todos los permisos disponibles, agrupados por módulo
     */
    public function listPermissions(): JsonResponse
    {
        // Trae todos los permisos y los agrupa por la columna modulo_permiso
        $permisos = Permiso::orderBy('id_permiso', 'asc')->get()->groupBy('modulo_permiso');
        return response()->json($permisos);
    }

    /**
     * Sincroniza los permisos de un rol (Sobrescribe los anteriores)
     */
    public function syncPermissions(Request $request, $idRol): JsonResponse
    {
        // Validar que se envíe un array de IDs de permisos
        $request->validate([
            'permisos_ids' => 'required|array',
            'permisos_ids.*' => 'integer|exists:cnf_permisos,id_permiso'
        ]);

        $rol = Rol::findOrFail($idRol);

        // Protección de seguridad: Evitar que modifiquen el Rol 1 y 2 si es necesario
        if ($rol->es_sistema && $rol->id_rol == 1) {
            return response()->json(['error' => 'No se pueden modificar los permisos del Super Administrador.'], 403);
        }

        // Sincronizar los permisos en la tabla pivote (cnf_roles_permisos)
        // Ojo: En Laravel, como no usamos timestamps en la tabla pivote, sync funciona directo.
        $rol->permisos()->sync($request->permisos_ids);

        return response()->json([
            'message' => 'Permisos actualizados correctamente',
            'rol' => $rol->load('permisos')
        ]);
    }
}
