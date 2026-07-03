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
        'estado'
    ];

    protected $casts = [
        'es_cliente' => 'boolean',
        'es_proveedor' => 'boolean',
        'estado' => 'boolean'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
