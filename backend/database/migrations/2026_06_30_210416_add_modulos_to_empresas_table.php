<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega columnas de módulos premium activables por empresa.
     * Cada columna es un boolean que el superadmin puede activar/desactivar
     * desde el Directorio Global de Empresas.
     */
    public function up(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            // Módulos Premium (activables por empresa)
            $table->boolean('modulo_facturacion_electronica')->default(true)->after('is_active');
            $table->boolean('modulo_nomina')->default(false)->after('modulo_facturacion_electronica');
            $table->boolean('modulo_pos_inventario')->default(false)->after('modulo_nomina');
            $table->boolean('modulo_ia_copiloto')->default(false)->after('modulo_pos_inventario');
        });
    }

    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn([
                'modulo_facturacion_electronica',
                'modulo_nomina',
                'modulo_pos_inventario',
                'modulo_ia_copiloto',
            ]);
        });
    }
};
