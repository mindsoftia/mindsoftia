<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * AccountController — Controlador API para el Plan Único de Cuentas (PUC) NIIF
 * 
 * Especialidades: /master-dev + /master-cont + /master-db
 * Propósito: Gestionar la jerarquía PUC (Clase, Grupo, Cuenta, Subcuenta, Auxiliar)
 * determinando automáticamente la naturaleza, el nivel y la relación Padre-Hijo
 * en un entorno multi-tenant aislado por `empresa_id`.
 */
class AccountController extends Controller
{
    /**
     * GET /api/puc  ó  GET /api/accounts
     * Listar el catálogo completo del PUC de la empresa activa
     */
    public function index(Request $request): JsonResponse
    {
        $query = Account::with('parent')
            ->orderBy('code', 'asc');

        if ($request->has('type') && $request->type !== 'TODAS') {
            $query->where('type', $request->type);
        }

        if ($request->has('nature')) {
            $query->where('nature', $request->nature);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $accounts = $query->get();

        return response()->json([
            'status' => 'success',
            'data'   => $accounts
        ]);
    }

    /**
     * POST /api/puc
     * Crear una nueva cuenta contable PUC con autodefinición de jerarquía
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code'             => 'required|string|max:20',
            'name'             => 'required|string|max:150',
            'is_transactional' => 'boolean',
            'is_active'        => 'boolean',
            'description'      => 'nullable|string'
        ], [
            'code.required' => 'El código PUC es obligatorio (Ej: 110505).',
            'name.required' => 'El nombre de la cuenta es obligatorio.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $code = trim($request->input('code'));
        $empresaId = $request->user()->empresa_id ?? 1; // Fallback al tenant actual si no está en JWT

        // 1. Verificar unicidad en el tenant
        $exists = Account::where('empresa_id', $empresaId)
            ->where('code', $code)
            ->exists();

        if ($exists) {
            return response()->json([
                'status'  => 'error',
                'message' => "El código PUC '{$code}' ya existe en esta empresa."
            ], 409);
        }

        // 2. Determinar Nivel/Tipo según longitud NIIF del código
        $len = strlen($code);
        if ($len === 1) {
            $type = 'clase';
        } elseif ($len === 2) {
            $type = 'grupo';
        } elseif ($len === 4) {
            $type = 'cuenta';
        } elseif ($len === 6) {
            $type = 'subcuenta';
        } else {
            $type = 'auxiliar';
        }

        // 3. Determinar Naturaleza predeterminada (1,5,6,7,8 = Débito; 2,3,4,9 = Crédito)
        $firstDigit = substr($code, 0, 1);
        $defaultNature = in_array($firstDigit, ['1', '5', '6', '7', '8']) ? 'debito' : 'credito';
        $nature = $request->input('nature', $defaultNature);

        // 4. Determinar automáticamente la cuenta padre (`parent_id`)
        $parentId = null;
        if ($len > 1) {
            $parentCodesToSearch = [];
            if ($len > 6) {
                $parentCodesToSearch[] = substr($code, 0, 6); // buscar subcuenta de 6 dígitos
            }
            if ($len > 4) {
                $parentCodesToSearch[] = substr($code, 0, 4); // buscar cuenta de 4 dígitos
            }
            if ($len > 2) {
                $parentCodesToSearch[] = substr($code, 0, 2); // buscar grupo de 2 dígitos
            }
            $parentCodesToSearch[] = substr($code, 0, 1);     // buscar clase de 1 dígito

            foreach ($parentCodesToSearch as $pCode) {
                $parent = Account::where('empresa_id', $empresaId)
                    ->where('code', $pCode)
                    ->first();
                if ($parent) {
                    $parentId = $parent->id;
                    break;
                }
            }
        }

        // 5. Crear e insertar el registro PUC
        $account = new Account();
        $account->empresa_id = $empresaId;
        $account->code = $code;
        $account->name = trim($request->input('name'));
        $account->type = $request->input('type', $type);
        $account->nature = $nature;
        $account->parent_id = $request->input('parent_id', $parentId);
        $account->is_transactional = $request->input('is_transactional', $len >= 4);
        $account->is_active = $request->input('is_active', true);
        $account->description = $request->input('description');
        $account->save();

        return response()->json([
            'status'  => 'success',
            'message' => "Cuenta PUC '{$code} — {$account->name}' creada con éxito.",
            'data'    => $account->load('parent')
        ], 201);
    }

    /**
     * GET /api/puc/{id}
     */
    public function show($id): JsonResponse
    {
        $account = Account::with(['parent', 'children'])->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data'   => $account
        ]);
    }

    /**
     * PUT /api/puc/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $account = Account::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'             => 'sometimes|required|string|max:150',
            'nature'           => 'sometimes|required|in:debito,credito',
            'is_transactional' => 'boolean',
            'is_active'        => 'boolean',
            'description'      => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $account->fill($request->only([
            'name', 'nature', 'is_transactional', 'is_active', 'description'
        ]));
        $account->save();

        return response()->json([
            'status'  => 'success',
            'message' => "Cuenta '{$account->code}' actualizada correctamente.",
            'data'    => $account
        ]);
    }

    /**
     * DELETE /api/puc/{id}
     */
    public function destroy($id): JsonResponse
    {
        $account = Account::withCount('children')->findOrFail($id);

        if ($account->children_count > 0) {
            return response()->json([
                'status'  => 'error',
                'message' => "No se puede eliminar la cuenta '{$account->code}' porque tiene subcuentas asociadas."
            ], 400);
        }

        $account->delete();

        return response()->json([
            'status'  => 'success',
            'message' => "Cuenta PUC eliminada correctamente."
        ]);
    }
}
