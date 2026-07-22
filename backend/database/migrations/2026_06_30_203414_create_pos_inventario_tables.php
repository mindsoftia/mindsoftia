<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * NexoPOS — Módulo de Inventario Multisede (Kardex Cloud-Sincronizado)
     * Paso 3 del Plan de Implementación.
     *
     * Tablas:
     *  - inv_sedes          : Sucursales / Bodegas físicas por empresa
     *  - inv_productos      : Catálogo maestro de productos
     *  - inv_stock_sedes    : Stock actual de cada producto por sede (fuente de verdad)
     *  - inv_lotes          : Control PEPS (lotes por fecha de entrada)
     *  - inv_kardex         : Histórico completo de movimientos (trazabilidad total)
     */
    public function up(): void
    {
        // ─────────────────────────────────────────────────
        // 1. SEDES / BODEGAS
        // ─────────────────────────────────────────────────
        if (!Schema::hasTable('inv_sedes')) {
        Schema::create('inv_sedes', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->unsignedBigInteger('empresa_id');
            $table->string('nombre', 150);
            $table->string('codigo', 20)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->boolean('es_principal')->default(false);
            $table->boolean('activa')->default(true);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->unique(['empresa_id', 'codigo']);
        }); }

        // ─────────────────────────────────────────────────
        // 2. CATÁLOGO MAESTRO DE PRODUCTOS
        // ─────────────────────────────────────────────────
        if (!Schema::hasTable('inv_productos')) {
        Schema::create('inv_productos', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->unsignedBigInteger('empresa_id');
            $table->string('referencia', 100)->nullable();
            $table->string('codigo_barras', 100)->nullable();
            $table->string('nombre', 255);
            $table->text('descripcion')->nullable();
            $table->string('unidad_medida', 30)->default('UND');
            $table->decimal('precio_venta', 15, 2)->default(0.00);
            $table->decimal('costo_promedio', 15, 2)->default(0.00);
            $table->decimal('stock_minimo', 10, 3)->default(0.000);
            $table->string('tipo', 30)->default('producto');
            $table->boolean('maneja_inventario')->default(true);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->index(['empresa_id', 'codigo_barras']);
        }); }

        // ─────────────────────────────────────────────────
        // 3. STOCK ACTUAL POR SEDE (Fuente de verdad)
        //    Una fila por [producto + sede]
        // ─────────────────────────────────────────────────
        if (!Schema::hasTable('inv_stock_sedes')) {
        Schema::create('inv_stock_sedes', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('producto_id');
            $table->uuid('sede_id');
            $table->decimal('cantidad', 15, 3)->default(0.000);
            $table->decimal('costo_promedio', 15, 2)->default(0.00);
            $table->timestamp('ultima_actualizacion')->useCurrent();

            $table->foreign('producto_id')->references('id')->on('inv_productos')->onDelete('cascade');
            $table->foreign('sede_id')->references('id')->on('inv_sedes')->onDelete('cascade');
            $table->unique(['producto_id', 'sede_id']);
        }); }

        // ─────────────────────────────────────────────────
        // 4. LOTES — Control PEPS (First-In First-Out)
        //    Cada entrada de mercancía crea un lote
        // ─────────────────────────────────────────────────
        if (!Schema::hasTable('inv_lotes')) {
        Schema::create('inv_lotes', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('producto_id');
            $table->uuid('sede_id');
            $table->string('numero_lote', 100)->nullable();
            $table->date('fecha_vencimiento')->nullable();
            $table->date('fecha_entrada');
            $table->decimal('cantidad_inicial', 15, 3);
            $table->decimal('cantidad_disponible', 15, 3);
            $table->decimal('costo_unitario', 15, 4);
            $table->boolean('agotado')->default(false);
            $table->timestamps();

            $table->foreign('producto_id')->references('id')->on('inv_productos')->onDelete('cascade');
            $table->foreign('sede_id')->references('id')->on('inv_sedes')->onDelete('cascade');
            $table->index(['producto_id', 'sede_id', 'agotado', 'fecha_entrada']);
        }); }

        // ─────────────────────────────────────────────────
        // 5. KARDEX DE MOVIMIENTOS (Histórico inmutable)
        //    Cada entrada/salida/traslado genera 1 fila aquí
        // ─────────────────────────────────────────────────
        if (!Schema::hasTable('inv_kardex')) {
        Schema::create('inv_kardex', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('producto_id');
            $table->uuid('sede_id');
            $table->uuid('lote_id')->nullable();

            $table->enum('tipo_movimiento', [
                'ENTRADA_COMPRA',
                'SALIDA_VENTA',
                'TRASLADO_SALIDA',
                'TRASLADO_ENTRADA',
                'AJUSTE_POSITIVO',
                'AJUSTE_NEGATIVO',
                'DEVOLUCION_CLIENTE',
            ]);

            $table->decimal('cantidad', 15, 3);
            $table->decimal('costo_unitario', 15, 4);
            $table->decimal('costo_total', 15, 2);
            $table->decimal('stock_resultante', 15, 3);

            $table->string('documento_tipo', 50)->nullable();
            $table->uuid('documento_id')->nullable();
            $table->string('observacion', 500)->nullable();

            $table->unsignedBigInteger('usuario_id');
            $table->timestamp('fecha_movimiento')->useCurrent();

            $table->foreign('producto_id')->references('id')->on('inv_productos');
            $table->foreign('sede_id')->references('id')->on('inv_sedes');
            $table->foreign('usuario_id')->references('id')->on('users');
            $table->index(['producto_id', 'sede_id', 'fecha_movimiento']);
        }); }
    }

    public function down(): void
    {
        Schema::dropIfExists('inv_kardex');
        Schema::dropIfExists('inv_lotes');
        Schema::dropIfExists('inv_stock_sedes');
        Schema::dropIfExists('inv_productos');
        Schema::dropIfExists('inv_sedes');
    }
};
