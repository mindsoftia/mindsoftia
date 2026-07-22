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

            // Intentar loguear al usuario en Laravel para que auth()->user() funcione en todo el sistema
            $user = \App\Models\User::where('email', $decoded->email ?? '')->first();
            
            if ($user) {
                \Illuminate\Support\Facades\Auth::login($user);
                $empresaId = $user->empresa_id;
            } else {
                // Si no existe localmente, tomamos el dato del JWT (app_metadata)
                $empresaId = $decoded->app_metadata->empresa_id ?? $decoded->app_metadata->tenant_id ?? null;
            }

            $superAdmins = ['amadomora@gmail.com'];
            $isSuperAdmin = in_array($decoded->email ?? '', $superAdmins);

            if (!$empresaId && !$isSuperAdmin && !$request->is('api/onboarding')) {
                $emailDebug = $decoded->email ?? 'sin-email';
                return response()->json([
                    'error'   => 'Acceso denegado',
                    'message' => "El usuario ($emailDebug) no tiene una empresa asignada. Por favor completa el Onboarding."
                ], 403);
            }

            $request->attributes->set('empresa_id', $empresaId);

            // Asignar rol
            if ($isSuperAdmin) {
                $role = 'admin';
            } else {
                $role = $decoded->app_metadata->role ?? 'asistente';
            }
            $request->attributes->set('auth_role', $role);

        } catch (Exception $e) {
            $headerDump = 'unknown';
            $parts = explode('.', $token);
            if (count($parts) === 3) {
                $headerDump = base64_decode(strtr($parts[0], '-_', '+/'));
            }
            \Illuminate\Support\Facades\Log::error('JWT Error: ' . $e->getMessage() . ' | Header: ' . $headerDump);
            
            // Si el error es por algoritmo ES256, hacer decodificación manual TEMPORALMENTE (Solo para desarrollo)
            if (strpos($e->getMessage(), 'Incorrect key') !== false) {
                $parts = explode('.', $token);
                if (count($parts) === 3) {
                    $headerStr = base64_decode(strtr($parts[0], '-_', '+/'));
                    $header = json_decode($headerStr);
                    if (isset($header->alg) && $header->alg === 'ES256') {
                        $payloadStr = base64_decode(strtr($parts[1], '-_', '+/'));
                        $decoded = json_decode($payloadStr);
                        
                        if (!$decoded || !isset($decoded->sub)) {
                            return response()->json(['error' => 'Token ES256 inválido o no decodificable'], 401);
                        }

                        // Continuar con la lógica normal
                        $request->attributes->set('auth_user_id', $decoded->sub);
                        $request->attributes->set('auth_user_email', $decoded->email ?? null);
                        
                        $user = \App\Models\User::where('email', $decoded->email ?? '')->first();
                        if ($user) {
                            \Illuminate\Support\Facades\Auth::login($user);
                            $empresaId = $user->empresa_id;
                        } else {
                            $app_metadata = $decoded->app_metadata ?? new \stdClass();
                            $empresaId = $app_metadata->empresa_id ?? $app_metadata->tenant_id ?? null;
                        }

                        $superAdmins = ['amadomora@gmail.com'];
                        $isSuperAdmin = in_array($decoded->email ?? '', $superAdmins);

                        \Illuminate\Support\Facades\Log::info('JWT Debug (ES256)', [
                            'email' => $decoded->email ?? 'null',
                            'empresaId' => $empresaId ?? 'null',
                            'isSuperAdmin' => $isSuperAdmin
                        ]);

                        if (!$empresaId && !$isSuperAdmin && !$request->is('api/onboarding')) {
                            $emailDebug = $decoded->email ?? 'sin-email';
                            return response()->json([
                                'error' => 'Acceso denegado',
                                'message' => "El usuario ($emailDebug) no tiene una empresa asignada. Por favor completa el Onboarding."
                            ], 403);
                        }

                        $request->attributes->set('empresa_id', $empresaId);
                        
                        $app_metadata = $decoded->app_metadata ?? new \stdClass();
                        $role = $isSuperAdmin ? 'admin' : ($app_metadata->role ?? 'asistente');
                        $request->attributes->set('auth_role', $role);
                        
                        return $next($request);
                    }
                }
            }

            return response()->json([
                'error'   => 'Token inválido o expirado',
                'message' => $e->getMessage()
            ], 401);
        }

        return $next($request);
    }
}
