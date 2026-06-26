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
        Schema::create('pos_ventas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('empresa_id');
            $table->uuid('tercero_id');
            $table->unsignedBigInteger('usuario_cajero_id');
            $table->string('prefijo', 10)->nullable();
            $table->integer('consecutivo');
            $table->date('fecha_emision')->useCurrent();
            $table->time('hora_emision')->useCurrent();
            $table->decimal('subtotal', 15, 2)->default(0.00);
            $table->decimal('total_descuento', 15, 2)->default(0.00);
            $table->decimal('total_impuestos', 15, 2)->default(0.00);
            $table->decimal('total_factura', 15, 2)->default(0.00);
            $table->string('metodo_pago', 50)->default('efectivo');
            $table->string('estado', 20)->default('pagada');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->foreign('tercero_id')->references('id')->on('crm_terceros')->onDelete('restrict');
            $table->foreign('usuario_cajero_id')->references('id')->on('users')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_ventas');
    }
};
