<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

/**
 * FeEventoRadian — Modelo Eloquent para Títulos Valores y Eventos Electrónicos DIAN.
 * 
 * Especialidades: /master-db + /master-cont
 * Propósito: Gestionar el acuse de recibo, recibo del bien, aceptación expresa y reclamos.
 */
class FeEventoRadian extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'fe_eventos_radian';

    protected $fillable = [
        'fe_documento_id',
        'empresa_id',
        'codigo_evento',
        'descripcion_evento',
        'xml_evento',
        'track_id_dian',
        'estado',
        'fecha_evento',
    ];

    protected $casts = [
        'fecha_evento' => 'datetime',
    ];

    public function documento()
    {
        return $this->belongsTo(FeDocumento::class, 'fe_documento_id');
    }
}
