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
        Schema::create('inv_compras', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('empresa_id');
            $table->uuid('tercero_id')->comment('Proveedor');
            $table->uuid('sede_id')->nullable()->comment('A dónde llega la mercancía física');
            
            $table->string('numero_factura', 50)->comment('N° Factura del Proveedor');
            $table->date('fecha_compra');
            $table->date('fecha_vencimiento');
            
            $table->string('condicion_pago', 20)->default('CONTADO')->comment('CONTADO o CREDITO');
            $table->string('estado', 20)->default('COMPLETADA')->comment('COMPLETADA, ANULADA');
            
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('total_impuestos', 15, 2)->default(0);
            $table->decimal('total_factura', 15, 2)->default(0);
            
            $table->text('notas')->nullable();
            
            $table->timestamps();

            // Claves Foráneas
            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->foreign('tercero_id')->references('id')->on('crm_terceros')->onDelete('restrict');
            $table->foreign('sede_id')->references('id')->on('inv_sedes')->onDelete('restrict');
            
            // Un proveedor no puede enviarnos la misma factura dos veces
            $table->unique(['empresa_id', 'tercero_id', 'numero_factura'], 'uq_compra_proveedor_factura');
        });

        Schema::create('inv_compras_detalles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('empresa_id');
            $table->uuid('compra_id');
            $table->uuid('producto_id');
            
            $table->decimal('cantidad', 12, 2);
            $table->decimal('costo_unitario', 15, 2)->comment('Costo al que se compró');
            $table->decimal('porcentaje_impuesto', 5, 2)->default(0);
            $table->decimal('valor_impuesto', 15, 2)->default(0);
            $table->decimal('subtotal', 15, 2)->comment('Costo Unitario x Cantidad');
            $table->decimal('total', 15, 2)->comment('Subtotal + Valor Impuesto');

            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->foreign('compra_id')->references('id')->on('inv_compras')->onDelete('cascade');
            $table->foreign('producto_id')->references('id')->on('inv_productos')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inv_compras_detalles');
        Schema::dropIfExists('inv_compras');
    }
};
