<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'saas_empresas';
    protected $primaryKey = 'id_empresa';
    public $incrementing = false; // UUID
    protected $keyType = 'string';

    const CREATED_AT = 'fecha_registro';
    const UPDATED_AT = 'fecha_actualizacion';

    protected $fillable = [
        'nombre_empresa',
        'documento_identidad',
        'estado_empresa',
    ];
}
