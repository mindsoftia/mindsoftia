<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EdsIsla;
use App\Models\EdsSurtidor;
use App\Models\EdsManguera;
use App\Models\EdsTurno;
use App\Models\EdsLectura;
use Illuminate\Support\Facades\DB;

class EdsController extends Controller
{
    public function __construct()
    {
        // En un caso real, aquí iría un middleware que verifique que $empresa->has_eds_module == true
    }

    // ── INFRAESTRUCTURA ──────────────────────────────────────────

    public function getIslas()
    {
        $islas = EdsIsla::with('surtidores.mangueras')->get();
        return response()->json($islas);
    }

    public function storeIsla(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'estado' => 'boolean'
        ]);

        $data['empresa_id'] = request()->attributes->get('empresa_id'); // Asumiendo middleware de tenant
        
        $isla = EdsIsla::create($data);
        return response()->json($isla, 201);
    }

    public function storeSurtidor(Request $request, $islaId)
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:50',
            'estado' => 'boolean'
        ]);

        $data['empresa_id'] = request()->attributes->get('empresa_id');
        $data['isla_id'] = $islaId;
        
        $surtidor = EdsSurtidor::create($data);
        return response()->json($surtidor, 201);
    }

    public function storeManguera(Request $request, $surtidorId)
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:50',
            'combustible' => 'required|string|max:50',
            'color_hex' => 'required|string|max:10',
            'precio_actual' => 'required|numeric',
            'estado' => 'boolean'
        ]);

        $data['empresa_id'] = request()->attributes->get('empresa_id');
        $data['surtidor_id'] = $surtidorId;
        
        $manguera = EdsManguera::create($data);
        return response()->json($manguera, 201);
    }

    public function getDashboardData()
    {
        $islas = EdsIsla::with('surtidores.mangueras')->get();
        $turno = EdsTurno::where('estado', 'ABIERTO')
                    ->where('usuario_id', auth()->id())
                    ->with('lecturas')
                    ->first();
        
        return response()->json([
            'islas' => $islas,
            'turnoActual' => $turno
        ]);
    }

    // ── OPERATIVA (TURNOS Y LECTURAS) ─────────────────────────────

    public function getTurnoActual()
    {
        $turno = EdsTurno::where('estado', 'ABIERTO')
                    ->where('usuario_id', auth()->id())
                    ->with('lecturas')
                    ->first();
        
        return response()->json($turno);
    }

    public function abrirTurno(Request $request)
    {
        // Validar que no tenga turnos abiertos
        $turnoAbierto = EdsTurno::where('estado', 'ABIERTO')
                            ->where('usuario_id', auth()->id())
                            ->first();

        if ($turnoAbierto) {
            return response()->json(['message' => 'Ya tienes un turno abierto'], 400);
        }

        $turno = EdsTurno::create([
            'empresa_id' => request()->attributes->get('empresa_id'),
            'usuario_id' => auth()->id(),
            'fecha_apertura' => now(),
            'estado' => 'ABIERTO'
        ]);

        return response()->json($turno, 201);
    }

    public function cerrarTurno(Request $request, $id)
    {
        $turno = EdsTurno::findOrFail($id);
        
        if ($turno->estado === 'CERRADO') {
            return response()->json(['message' => 'El turno ya está cerrado'], 400);
        }

        $turno->update([
            'fecha_cierre' => now(),
            'estado' => 'CERRADO'
        ]);

        return response()->json($turno);
    }

    public function registrarLectura(Request $request)
    {
        $data = $request->validate([
            'turno_id' => 'required|uuid|exists:eds_turnos,id',
            'manguera_id' => 'required|uuid|exists:eds_mangueras,id',
            'lectura_galones' => 'required|numeric',
            'lectura_dinero' => 'required|numeric',
            'tipo' => 'required|in:APERTURA,CIERRE'
        ]);

        $data['empresa_id'] = request()->attributes->get('empresa_id');

        $lectura = EdsLectura::create($data);
        return response()->json($lectura, 201);
    }
}
