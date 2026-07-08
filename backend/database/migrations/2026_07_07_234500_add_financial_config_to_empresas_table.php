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
            $table->string('moneda_defecto', 3)->default('COP')->comment('Moneda principal para transacciones (ISO 4217)');
            $table->decimal('impuesto_defecto', 5, 2)->default(19.00)->comment('Tarifa de impuesto base por defecto (Ej: 19.00)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn(['moneda_defecto', 'impuesto_defecto']);
        });
    }
};
