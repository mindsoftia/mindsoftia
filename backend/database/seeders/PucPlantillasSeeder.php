<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PucPlantillasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Cuentas Base / Universales (Prefijo '00')
        $baseAccounts = [
            // ACTIVO
            ['ciiu_prefix' => '00', 'code' => '1', 'name' => 'Activo', 'type' => 'clase', 'nature' => 'debito', 'parent_code' => null, 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '11', 'name' => 'Efectivo y Equivalentes', 'type' => 'grupo', 'nature' => 'debito', 'parent_code' => '1', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '1105', 'name' => 'Caja', 'type' => 'cuenta', 'nature' => 'debito', 'parent_code' => '11', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '110505', 'name' => 'Caja General', 'type' => 'subcuenta', 'nature' => 'debito', 'parent_code' => '1105', 'is_transactional' => true],
            ['ciiu_prefix' => '00', 'code' => '1110', 'name' => 'Bancos', 'type' => 'cuenta', 'nature' => 'debito', 'parent_code' => '11', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '111005', 'name' => 'Bancos Moneda Nacional', 'type' => 'subcuenta', 'nature' => 'debito', 'parent_code' => '1110', 'is_transactional' => true],
            ['ciiu_prefix' => '00', 'code' => '13', 'name' => 'Deudores', 'type' => 'grupo', 'nature' => 'debito', 'parent_code' => '1', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '1305', 'name' => 'Clientes', 'type' => 'cuenta', 'nature' => 'debito', 'parent_code' => '13', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '130505', 'name' => 'Nacionales', 'type' => 'subcuenta', 'nature' => 'debito', 'parent_code' => '1305', 'is_transactional' => true],
            
            // PASIVO
            ['ciiu_prefix' => '00', 'code' => '2', 'name' => 'Pasivo', 'type' => 'clase', 'nature' => 'credito', 'parent_code' => null, 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '22', 'name' => 'Proveedores', 'type' => 'grupo', 'nature' => 'credito', 'parent_code' => '2', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '2205', 'name' => 'Nacionales', 'type' => 'cuenta', 'nature' => 'credito', 'parent_code' => '22', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '220505', 'name' => 'Proveedores Nacionales', 'type' => 'subcuenta', 'nature' => 'credito', 'parent_code' => '2205', 'is_transactional' => true],
            ['ciiu_prefix' => '00', 'code' => '23', 'name' => 'Cuentas por Pagar', 'type' => 'grupo', 'nature' => 'credito', 'parent_code' => '2', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '24', 'name' => 'Impuestos, Gravámenes y Tasas', 'type' => 'grupo', 'nature' => 'credito', 'parent_code' => '2', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '2408', 'name' => 'Impuesto sobre las Ventas por Pagar', 'type' => 'cuenta', 'nature' => 'credito', 'parent_code' => '24', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '240801', 'name' => 'IVA Generado', 'type' => 'subcuenta', 'nature' => 'credito', 'parent_code' => '2408', 'is_transactional' => true],
            ['ciiu_prefix' => '00', 'code' => '240802', 'name' => 'IVA Descontable', 'type' => 'subcuenta', 'nature' => 'debito', 'parent_code' => '2408', 'is_transactional' => true],
            
            // PATRIMONIO
            ['ciiu_prefix' => '00', 'code' => '3', 'name' => 'Patrimonio', 'type' => 'clase', 'nature' => 'credito', 'parent_code' => null, 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '31', 'name' => 'Capital Social', 'type' => 'grupo', 'nature' => 'credito', 'parent_code' => '3', 'is_transactional' => false],
            
            // GASTOS (General)
            ['ciiu_prefix' => '00', 'code' => '5', 'name' => 'Gastos', 'type' => 'clase', 'nature' => 'debito', 'parent_code' => null, 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '51', 'name' => 'Operacionales de Administración', 'type' => 'grupo', 'nature' => 'debito', 'parent_code' => '5', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '5195', 'name' => 'Diversos', 'type' => 'cuenta', 'nature' => 'debito', 'parent_code' => '51', 'is_transactional' => false],
            ['ciiu_prefix' => '00', 'code' => '519595', 'name' => 'Otros', 'type' => 'subcuenta', 'nature' => 'debito', 'parent_code' => '5195', 'is_transactional' => true],
        ];

        // 2. Cuentas Comerciales (Prefijo '47')
        $comercioAccounts = [
            ['ciiu_prefix' => '47', 'code' => '14', 'name' => 'Inventarios', 'type' => 'grupo', 'nature' => 'debito', 'parent_code' => '1', 'is_transactional' => false],
            ['ciiu_prefix' => '47', 'code' => '1435', 'name' => 'Mercancías No Fabricadas por la Empresa', 'type' => 'cuenta', 'nature' => 'debito', 'parent_code' => '14', 'is_transactional' => false],
            ['ciiu_prefix' => '47', 'code' => '143505', 'name' => 'Mercancías No Fabricadas por la Empresa', 'type' => 'subcuenta', 'nature' => 'debito', 'parent_code' => '1435', 'is_transactional' => true],
            
            ['ciiu_prefix' => '47', 'code' => '4', 'name' => 'Ingresos', 'type' => 'clase', 'nature' => 'credito', 'parent_code' => null, 'is_transactional' => false],
            ['ciiu_prefix' => '47', 'code' => '41', 'name' => 'Operacionales', 'type' => 'grupo', 'nature' => 'credito', 'parent_code' => '4', 'is_transactional' => false],
            ['ciiu_prefix' => '47', 'code' => '4135', 'name' => 'Comercio al por Mayor y al por Menor', 'type' => 'cuenta', 'nature' => 'credito', 'parent_code' => '41', 'is_transactional' => false],
            ['ciiu_prefix' => '47', 'code' => '413505', 'name' => 'Ingresos por Venta de Mercancías', 'type' => 'subcuenta', 'nature' => 'credito', 'parent_code' => '4135', 'is_transactional' => true],
            
            ['ciiu_prefix' => '47', 'code' => '6', 'name' => 'Costos de Ventas', 'type' => 'clase', 'nature' => 'debito', 'parent_code' => null, 'is_transactional' => false],
            ['ciiu_prefix' => '47', 'code' => '61', 'name' => 'Costo de Ventas y de Prestación de Servicios', 'type' => 'grupo', 'nature' => 'debito', 'parent_code' => '6', 'is_transactional' => false],
            ['ciiu_prefix' => '47', 'code' => '6135', 'name' => 'Comercio al por Mayor y al por Menor', 'type' => 'cuenta', 'nature' => 'debito', 'parent_code' => '61', 'is_transactional' => false],
            ['ciiu_prefix' => '47', 'code' => '613505', 'name' => 'Costo de Venta de Mercancías', 'type' => 'subcuenta', 'nature' => 'debito', 'parent_code' => '6135', 'is_transactional' => true],
        ];

        // 3. Cuentas Servicios / Software (Prefijo '62')
        $serviciosAccounts = [
            ['ciiu_prefix' => '62', 'code' => '4', 'name' => 'Ingresos', 'type' => 'clase', 'nature' => 'credito', 'parent_code' => null, 'is_transactional' => false],
            ['ciiu_prefix' => '62', 'code' => '41', 'name' => 'Operacionales', 'type' => 'grupo', 'nature' => 'credito', 'parent_code' => '4', 'is_transactional' => false],
            ['ciiu_prefix' => '62', 'code' => '4155', 'name' => 'Actividades Inmobiliarias, Empresariales y de Alquiler', 'type' => 'cuenta', 'nature' => 'credito', 'parent_code' => '41', 'is_transactional' => false],
            ['ciiu_prefix' => '62', 'code' => '415505', 'name' => 'Ingresos por Servicios', 'type' => 'subcuenta', 'nature' => 'credito', 'parent_code' => '4155', 'is_transactional' => true],
            
            ['ciiu_prefix' => '62', 'code' => '7', 'name' => 'Costos de Producción o de Operación', 'type' => 'clase', 'nature' => 'debito', 'parent_code' => null, 'is_transactional' => false],
            ['ciiu_prefix' => '62', 'code' => '73', 'name' => 'Costos Indirectos', 'type' => 'grupo', 'nature' => 'debito', 'parent_code' => '7', 'is_transactional' => false],
            ['ciiu_prefix' => '62', 'code' => '7305', 'name' => 'Costos Indirectos de Servicios', 'type' => 'cuenta', 'nature' => 'debito', 'parent_code' => '73', 'is_transactional' => false],
            ['ciiu_prefix' => '62', 'code' => '730505', 'name' => 'Costo Indirecto Servicio', 'type' => 'subcuenta', 'nature' => 'debito', 'parent_code' => '7305', 'is_transactional' => true],
        ];

        $allAccounts = array_merge($baseAccounts, $comercioAccounts, $serviciosAccounts);

        foreach ($allAccounts as $account) {
            DB::table('puc_plantillas_base')->updateOrInsert(
                [
                    'ciiu_prefix' => $account['ciiu_prefix'],
                    'code' => $account['code']
                ],
                array_merge($account, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
