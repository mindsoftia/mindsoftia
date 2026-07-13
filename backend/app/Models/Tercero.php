<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class Tercero extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'crm_terceros';

    protected $fillable = [
        'empresa_id',
        'tipo_identificacion',
        'numero_identificacion',
        'nombres',
        'apellidos',
        'razon_social',
        'email',
        'telefono',
        'direccion',
        'ciudad_id',
        'es_cliente',
        'es_proveedor',
        'estado',
        'dias_credito',
        'limite_credito',
        'documento_rut_url',
        'camara_comercio_url',
        'certificacion_bancaria_url'
    ];

    protected $casts = [
        'es_cliente' => 'boolean',
        'es_proveedor' => 'boolean',
        'estado' => 'boolean',
        'dias_credito' => 'integer',
        'limite_credito' => 'decimal:2'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
