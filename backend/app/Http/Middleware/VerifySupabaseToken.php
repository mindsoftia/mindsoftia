<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifySupabaseToken
{
    /**
     * Verifica el JWT emitido por Supabase Auth en cada petición.
     * Extrae el user_id y el tenant_id y los inyecta en la request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'error'   => 'No autorizado',
                'message' => 'Token de autorización ausente.'
            ], 401);
        }

        try {
            $jwtSecret = config('services.supabase.jwt_secret');

            if (!$jwtSecret) {
                return response()->json([
                    'error'   => 'Configuración del servidor incompleta',
                    'message' => 'SUPABASE_JWT_SECRET no está configurado.'
                ], 500);
            }

            // Supabase usa HS256 para sus JWT
            $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));

            // Inyectar el ID del usuario autenticado
            $request->attributes->set('auth_user_id', $decoded->sub);
            $request->attributes->set('auth_user_email', $decoded->email ?? null);

            // Extraer el tenant_id desde app_metadata del JWT
            $tenantId = $decoded->app_metadata->tenant_id ?? null;

            if (!$tenantId) {
                return response()->json([
                    'error'   => 'Acceso denegado',
                    'message' => 'El usuario no tiene una empresa (tenant) asignada.'
                ], 403);
            }

            $request->attributes->set('tenant_id', $tenantId);

            // Extraer el rol del usuario si existe
            $role = $decoded->app_metadata->role ?? 'asistente';
            $request->attributes->set('auth_role', $role);

        } catch (Exception $e) {
            return response()->json([
                'error'   => 'Token inválido o expirado',
                'message' => $e->getMessage()
            ], 401);
        }

        return $next($request);
    }
}
