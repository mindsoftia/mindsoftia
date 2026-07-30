<?php

namespace App\Services;

use App\Models\Account;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PucCloneService
{
    /**
     * Clona las cuentas base y específicas por CIUU a la empresa dada.
     *
     * @param int $empresaId
     * @param string|null $codigoCiiu
     */
    public function clonePucToEmpresa(int $empresaId, ?string $codigoCiiu)
    {
        // Verificar si la empresa ya tiene cuentas
        $hasAccounts = Account::where('empresa_id', $empresaId)->exists();
        if ($hasAccounts) {
            Log::info("La empresa {$empresaId} ya tiene un PUC asignado. Se aborta la clonación.");
            return;
        }

        // Determinar el prefijo CIUU a utilizar (primeros 2 caracteres)
        // Por defecto usaremos '00' (Solo base), si tiene CIUU buscamos el específico
        $prefixes = ['00'];
        if ($codigoCiiu && strlen($codigoCiiu) >= 2) {
            $prefix = substr($codigoCiiu, 0, 2);
            $prefixes[] = $prefix;
        }

        Log::info("Clonando PUC para empresa {$empresaId} con prefijos: " . implode(', ', $prefixes));

        // Obtener plantillas
        $plantillas = DB::table('puc_plantillas_base')
            ->whereIn('ciiu_prefix', $prefixes)
            ->orderBy('code') // Ordenar por código asegura que los padres se inserten primero
            ->get();

        if ($plantillas->isEmpty()) {
            Log::warning("No se encontraron plantillas PUC para los prefijos: " . implode(', ', $prefixes));
            return;
        }

        $codeToIdMap = []; // Mapa local para resolver parent_ids

        DB::beginTransaction();
        try {
            foreach ($plantillas as $plantilla) {
                // Resolver el parent_id buscando en el mapa
                $parentId = null;
                if ($plantilla->parent_code && isset($codeToIdMap[$plantilla->parent_code])) {
                    $parentId = $codeToIdMap[$plantilla->parent_code];
                }

                $account = Account::create([
                    'empresa_id' => $empresaId,
                    'code' => $plantilla->code,
                    'name' => $plantilla->name,
                    'type' => $plantilla->type,
                    'nature' => $plantilla->nature,
                    'parent_id' => $parentId,
                    'is_transactional' => $plantilla->is_transactional,
                    'description' => $plantilla->description,
                    'is_active' => true,
                ]);

                // Guardar el id creado en el mapa
                $codeToIdMap[$account->code] = $account->id;
            }
            DB::commit();
            Log::info("Clonación del PUC finalizada con éxito para la empresa {$empresaId}. Se insertaron " . count($plantillas) . " cuentas.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error clonando PUC para empresa {$empresaId}: " . $e->getMessage());
        }
    }
}
