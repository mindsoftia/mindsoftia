<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class EdsLectura extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'eds_lecturas';

    protected $fillable = [
        'empresa_id',
        'turno_id',
        'manguera_id',
        'lectura_galones',
        'lectura_dinero',
        'tipo',
    ];

    protected $casts = [
        'lectura_galones' => 'decimal:4',
        'lectura_dinero' => 'decimal:2',
    ];

    public function turno()
    {
        return $this->belongsTo(EdsTurno::class, 'turno_id');
    }

    public function manguera()
    {
        return $this->belongsTo(EdsManguera::class, 'manguera_id');
    }
}
