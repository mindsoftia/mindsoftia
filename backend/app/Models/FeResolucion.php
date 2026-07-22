<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

/**
 * FeResolucion — Modelo Eloquent para Resoluciones y Rangos de Facturación DIAN.
 * 
 * Especialidades: /master-db + /master-cont
 */
class FeResolucion extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'fe_resoluciones';

    protected $fillable = [
        'empresa_id',
        'numero_resolucion',
        'prefijo',
        'numero_inicial',
        'numero_final',
        'consecutivo_actual',
        'clave_tecnica',
        'ambiente',
        'vigencia_desde',
        'vigencia_hasta',
        'activo',
    ];

    protected $casts = [
        'numero_inicial'     => 'integer',
        'numero_final'       => 'integer',
        'consecutivo_actual' => 'integer',
        'ambiente'           => 'integer',
        'vigencia_desde'     => 'date',
        'vigencia_hasta'     => 'date',
        'activo'             => 'boolean',
    ];

    /**
     * Devuelve la resolución activa para un prefijo y ambiente en la empresa en curso.
     */
    public static function resolucionActiva(int $empresaId, ?string $prefijo = null, int $ambiente = 2): ?self
    {
        $query = static::where('empresa_id', $empresaId)
            ->where('activo', true)
            ->where('ambiente', $ambiente)
            ->where('vigencia_hasta', '>=', now()->toDateString());

        if ($prefijo) {
            $query->where('prefijo', $prefijo);
        }

        return $query->first();
    }
}
