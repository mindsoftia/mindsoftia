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
        'modulo_ia_copiloto',
    ];

    protected $casts = [
        'is_active'                      => 'boolean',
        'modulo_facturacion_electronica' => 'boolean',
        'modulo_nomina'                  => 'boolean',
        'modulo_pos_inventario'          => 'boolean',
        'modulo_ia_copiloto'             => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
