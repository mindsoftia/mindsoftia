<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class InvSede extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'inv_sedes';

    protected $fillable = [
        'empresa_id',
        'nombre',
        'codigo',
        'direccion',
        'es_principal',
        'activa'
    ];

    protected $casts = [
        'es_principal' => 'boolean',
        'activa' => 'boolean'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
