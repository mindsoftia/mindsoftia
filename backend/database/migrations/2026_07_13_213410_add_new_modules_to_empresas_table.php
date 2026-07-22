<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->boolean('modulo_compras')->default(true)->after('modulo_pos_inventario');
            $table->boolean('modulo_contabilidad')->default(true)->after('modulo_compras');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn(['modulo_compras', 'modulo_contabilidad']);
        });
    }
};
