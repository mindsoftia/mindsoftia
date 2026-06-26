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
        Schema::create('pos_ventas_detalles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('venta_id');
            $table->uuid('producto_id');
            $table->decimal('cantidad', 10, 2);
            $table->decimal('precio_unitario', 15, 2);
            $table->decimal('porcentaje_descuento', 5, 2)->default(0.00);
            $table->decimal('porcentaje_impuesto', 5, 2)->default(0.00);
            $table->decimal('subtotal', 15, 2);
            $table->decimal('total', 15, 2);
            $table->timestamps();

            $table->foreign('venta_id')->references('id')->on('pos_ventas')->onDelete('cascade');
            $table->foreign('producto_id')->references('id')->on('inv_productos')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_ventas_detalles');
    }
};
