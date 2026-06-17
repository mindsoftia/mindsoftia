<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    use HasFactory;

    protected $table = 'cnf_roles';
    protected $primaryKey = 'id_rol';
    const CREATED_AT = 'fecha_registro';
    const UPDATED_AT = null; // No usamos updated_at en esta tabla

    protected $fillable = [
        'nombre_rol',
        'descripcion_rol',
        'es_sistema',
    ];

    public function permisos()
    {
        return $this->belongsToMany(Permiso::class, 'cnf_roles_permisos', 'id_rol', 'id_permiso');
    }
}
