<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    public function getStatus(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Missing Tenant ID'], 400);
        }

        // Por ahora, estructura dummy. master-cont la llenará con queries reales de base de datos
        // usando el tenantId.
        $status = [
            'dian' => [
                'estado' => 'ok', 
                'pendientes' => 0, 
                'ultima_sync' => 'Hace 5 min'
            ],
            'contabilidad' => [
                'estado' => 'warning', 
                'pendientes' => 12, 
                'ultima_sync' => 'Ayer'
            ],
            'local' => [
                'estado' => 'offline', 
                'pendientes' => 45, 
                'ultima_sync' => 'Hace 2 horas'
            ]
        ];

        return response()->json(['success' => true, 'data' => $status]);
    }

    public function forceSync(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        $tipo = $request->input('tipo'); // dian, contabilidad, local

        if (!$tenantId || !$tipo) {
            return response()->json(['success' => false, 'message' => 'Invalid parameters'], 400);
        }

        // Registro de auditoría
        $empresa = \App\Models\Empresa::where('subdominio', $tenantId)->first();
        if ($empresa) {
            DB::table('sync_logs')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'empresa_id' => $empresa->id,
                'tipo' => $tipo,
                'estado' => 'ok',
                'detalles_json' => json_encode(['mensaje' => 'Sincronización manual iniciada']),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // TODO (master-cont): Despachar el Job correspondiente (ej. SyncContableDIAN::dispatch($empresa->id))

        return response()->json([
            'success' => true, 
            'message' => "Sincronización de tipo {$tipo} iniciada en segundo plano."
        ]);
    }
}
