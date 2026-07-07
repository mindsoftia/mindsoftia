<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class InvCategoria extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'inv_categorias';

    protected $fillable = [
        'empresa_id',
        'nombre',
        'descripcion',
        'color',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function productos()
    {
        return $this->hasMany(InvProducto::class, 'categoria_id');
    }

    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }
}
