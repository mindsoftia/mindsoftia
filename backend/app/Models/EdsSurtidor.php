<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class EdsSurtidor extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'eds_surtidores';

    protected $fillable = [
        'empresa_id',
        'isla_id',
        'numero',
    ];

    public function isla()
    {
        return $this->belongsTo(EdsIsla::class, 'isla_id');
    }

    public function mangueras()
    {
        return $this->hasMany(EdsManguera::class, 'surtidor_id');
    }
}
