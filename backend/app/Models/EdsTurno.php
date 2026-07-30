<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class EdsTurno extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'eds_turnos';

    protected $fillable = [
        'empresa_id',
        'usuario_id',
        'fecha_apertura',
        'fecha_cierre',
        'estado',
    ];

    protected $casts = [
        'fecha_apertura' => 'datetime',
        'fecha_cierre' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function lecturas()
    {
        return $this->hasMany(EdsLectura::class, 'turno_id');
    }
}
