<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Empresa;
use App\Models\User;

class OnboardingController extends Controller
{
    /**
     * Procesa la creación de la empresa y asocia al usuario actual.
     */
    public function store(Request $request)
    {
        // Validar los datos que envía el Wizard
        $request->validate([
            'nombre'    => 'required|string|max:255',
            'nit'       => 'required|string|max:50|unique:empresas,ruc_nit',
            'industria' => 'nullable|string|max:100',
            'moneda'    => 'required|string|max:3',
            'telefono'  => 'nullable|string|max:50'
        ]);

        // Obtener el ID y el Correo inyectados por el Middleware (VerifySupabaseToken)
        $supabaseId = $request->attributes->get('auth_user_id');
        $email = $request->attributes->get('auth_user_email');

        if (!$supabaseId || !$email) {
            return response()->json(['error' => 'Usuario de Supabase no identificado.'], 401);
        }

        try {
            DB::beginTransaction();

            // 1. Crear la Empresa
            $empresa = new Empresa();
            $empresa->nombre    = $request->nombre;
            $empresa->ruc_nit   = $request->nit;
            $empresa->industria = $request->industria;
            $empresa->moneda    = $request->moneda;
            $empresa->telefono  = $request->telefono;
            $empresa->email     = $email; // Email de contacto por defecto
            $empresa->is_active = true;
            $empresa->save();

            // 2. Crear o Actualizar el Usuario en Laravel (vinculado a Supabase)
            // Usamos updateOrCreate para que si ya existe, solo le asignemos la empresa
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name'        => explode('@', $email)[0], // Nombre temporal basado en email
                    'password'    => bcrypt(str()->random(16)), // Contraseña dummy, usamos Supabase Auth
                    'supabase_id' => $supabaseId,
                    'empresa_id'  => $empresa->id
                ]
            );

            // TODO: En el futuro asignar rol (Ej: $user->assignRole('Propietario'))
            // y actualizar el 'app_metadata' del JWT en Supabase con Admin API (si es necesario).

            DB::commit();

            return response()->json([
                'message' => 'Entorno creado exitosamente.',
                'empresa' => $empresa,
                'user'    => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error'   => 'Error al crear el ecosistema de la empresa.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
