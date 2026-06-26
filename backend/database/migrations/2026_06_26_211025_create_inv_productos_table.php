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
        Schema::create('inv_productos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('empresa_id');
            $table->string('codigo_sku', 50)->nullable();
            $table->string('codigo_barras', 100)->nullable();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('tipo', 20)->default('fisico');
            $table->boolean('controla_inventario')->default(true);
            $table->decimal('costo_promedio', 15, 2)->default(0.00);
            $table->decimal('precio_venta_1', 15, 2)->default(0.00);
            $table->decimal('tarifa_impuesto', 5, 2)->default(0.00);
            $table->decimal('stock_actual', 10, 2)->default(0.00);
            $table->boolean('estado')->default(true);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inv_productos');
    }
};
