<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class UsuarioEmpresa extends Pivot
{
    protected $table = 'saas_usuarios_empresas';
    public $incrementing = false;
    const CREATED_AT = 'fecha_asignacion';
    const UPDATED_AT = null;

    protected $fillable = [
        'id_usuario',
        'id_empresa',
        'id_rol',
        'estado_acceso',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }
}
