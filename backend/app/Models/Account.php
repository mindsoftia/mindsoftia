<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Multitenantable;

class Account extends Model
{
    use SoftDeletes, Multitenantable;

    protected $fillable = [
        'empresa_id',
        'code',
        'name',
        'type',
        'nature',
        'parent_id',
        'is_transactional',
        'is_active',
        'description'
    ];

    /**
     * Relación: Una cuenta pertenece a una Empresa
     */
    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    /**
     * Relación: Una cuenta puede tener una cuenta Padre (jerarquía PUC)
     */
    public function parent()
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    /**
     * Relación: Una cuenta puede tener múltiples subcuentas (Hijos)
     */
    public function children()
    {
        return $this->hasMany(Account::class, 'parent_id');
    }
}
