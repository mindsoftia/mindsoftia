<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'empresas';

    protected $fillable = [
        'nombre',
        'subdominio',
        'ruc_nit',
        'email',
        'telefono',
        'is_active',
        // Módulos premium
        'modulo_facturacion_electronica',
        'modulo_nomina',
        'modulo_pos_inventario',
        'modulo_compras',
        'modulo_contabilidad',
        'modulo_ia_copiloto',
        // Información DIAN
        'nombre_comercial',
        'tipo_persona',
        'tipo_documento_id',
        'digito_verificacion',
        'codigo_ciiu',
        'responsabilidades_rut',
        'direccion_fiscal',
        'codigo_postal',
        'codigo_departamento',
        'codigo_municipio',
        'email_facturacion',
        'matricula_mercantil',
    ];

    protected $casts = [
        'is_active'                      => 'boolean',
        'modulo_facturacion_electronica' => 'boolean',
        'modulo_nomina'                  => 'boolean',
        'modulo_pos_inventario'          => 'boolean',
        'modulo_compras'                 => 'boolean',
        'modulo_contabilidad'            => 'boolean',
        'modulo_ia_copiloto'             => 'boolean',
        'responsabilidades_rut'          => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
