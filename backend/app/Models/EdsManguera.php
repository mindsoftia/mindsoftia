<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class EdsManguera extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'eds_mangueras';

    protected $fillable = [
        'empresa_id',
        'surtidor_id',
        'producto_nombre',
        'color',
    ];

    public function surtidor()
    {
        return $this->belongsTo(EdsSurtidor::class, 'surtidor_id');
    }

    public function lecturas()
    {
        return $this->hasMany(EdsLectura::class, 'manguera_id');
    }
}
