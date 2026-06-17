<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permiso extends Model
{
    use HasFactory;

    protected $table = 'cnf_permisos';
    protected $primaryKey = 'id_permiso';
    const CREATED_AT = 'fecha_registro';
    const UPDATED_AT = null;

    protected $fillable = [
        'modulo_permiso',
        'accion_permiso',
        'codigo_permiso',
    ];

    public function roles()
    {
        return $this->belongsToMany(Rol::class, 'cnf_roles_permisos', 'id_permiso', 'id_rol');
    }
}
