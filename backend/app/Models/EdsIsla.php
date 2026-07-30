<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class EdsIsla extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'eds_islas';

    protected $fillable = [
        'empresa_id',
        'nombre',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function surtidores()
    {
        return $this->hasMany(EdsSurtidor::class, 'isla_id');
    }
}
