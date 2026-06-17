<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Rol;

class RolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'id_rol' => 1,
                'nombre_rol' => 'Super Administrador',
                'descripcion_rol' => 'Administrador global de Mindsoftia',
                'es_sistema' => true,
            ],
            [
                'id_rol' => 2,
                'nombre_rol' => 'Propietario',
                'descripcion_rol' => 'Dueño de la empresa cliente (Acceso total)',
                'es_sistema' => true,
            ],
            [
                'id_rol' => 3,
                'nombre_rol' => 'Analista de Cartera',
                'descripcion_rol' => 'Gestión de cobros, pagos y facturación',
                'es_sistema' => false,
            ],
            [
                'id_rol' => 4,
                'nombre_rol' => 'Director de Marketing',
                'descripcion_rol' => 'Gestión de campañas, leads y comunicaciones',
                'es_sistema' => false,
            ],
            [
                'id_rol' => 5,
                'nombre_rol' => 'Vendedor',
                'descripcion_rol' => 'Gestión de ventas y cotizaciones propias',
                'es_sistema' => false,
            ],
            [
                'id_rol' => 6,
                'nombre_rol' => 'Auditor Externo',
                'descripcion_rol' => 'Acceso de solo lectura a finanzas y reportes',
                'es_sistema' => false,
            ]
        ];

        foreach ($roles as $rol) {
            Rol::updateOrCreate(['id_rol' => $rol['id_rol']], $rol);
        }
    }
}
