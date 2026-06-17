<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Verifica que el usuario autenticado tenga el rol requerido.
     * Uso en rutas: ->middleware('role:admin') o ->middleware('role:admin,contador')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $userRole = $request->attributes->get('auth_role');

        if (!$userRole || !in_array($userRole, $roles)) {
            return response()->json([
                'error'   => 'Acceso prohibido',
                'message' => "Se requiere uno de los siguientes roles: " . implode(', ', $roles)
            ], 403);
        }

        return $next($request);
    }
}
