<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * NexoPOS — Tablas Contables Base (Paso 5a)
     *
     * Propósito: Recibir los asientos automáticos generados por el POS.
     * Estas tablas serán el punto de entrada del futuro Módulo de Contabilidad.
     *
     * PRINCIPIO: El POS NO conoce estas tablas directamente.
     *            El PosVentaObserver es el único puente.
     *
     * Tablas:
     *  - contab_asientos       : Cabecera del asiento contable
     *  - contab_asientos_items : Líneas de débito/crédito (partida doble)
     */
    public function up(): void
    {
        // ─────────────────────────────────────────────────────────
        // TABLA 1: CABECERA DEL ASIENTO
        // ─────────────────────────────────────────────────────────
        Schema::create('contab_asientos', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->unsignedBigInteger('empresa_id');

            // Tipo de asiento — extensible para el módulo contable completo
            $table->enum('tipo', [
                'VENTA_POS',          // Generado automáticamente desde el POS
                'COMPRA',             // Futuro: compras a proveedor
                'GASTO',              // Futuro: gastos operativos
                'TRASLADO',           // Futuro: traslados entre sedes
                'AJUSTE_INVENTARIO',  // Futuro: ajustes manuales
                'APERTURA',           // Futuro: asiento de apertura de periodo
                'CIERRE',             // Futuro: asiento de cierre de periodo
                'MANUAL',             // Futuro: asiento manual del contador
            ])->default('VENTA_POS');

            // Trazabilidad: qué documento del POS originó este asiento
            $table->string('documento_tipo', 60)->nullable();  // 'pos_venta', 'compra', etc.
            $table->uuid('documento_id')->nullable();           // UUID del doc. de origen
            $table->string('descripcion', 500)->nullable();

            // Totales del asiento (para validar que débitos = créditos)
            $table->decimal('total_debito', 15, 2)->default(0.00);
            $table->decimal('total_credito', 15, 2)->default(0.00);

            // Estado contable
            $table->enum('estado', ['borrador', 'confirmado', 'anulado'])->default('confirmado');

            // Periodo contable (año-mes) para facilitar cierres
            $table->char('periodo', 7)->nullable(); // Ej: '2026-06'

            $table->date('fecha_asiento');
            $table->unsignedBigInteger('creado_por')->nullable(); // user_id o null si es automático
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->index(['empresa_id', 'periodo', 'tipo']);
            $table->index(['documento_tipo', 'documento_id']); // Para drill-down futuro
        });

        // ─────────────────────────────────────────────────────────
        // TABLA 2: LÍNEAS CONTABLES (PARTIDA DOBLE)
        // ─────────────────────────────────────────────────────────
        Schema::create('contab_asientos_items', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('asiento_id');

            // Cuenta del Plan Único de Cuentas (PUC)
            // Ej: '1105' = Caja, '4135' = Ventas, '2408' = IVA por pagar
            $table->string('cuenta_puc', 20);
            $table->string('cuenta_nombre', 150)->nullable(); // Nombre en el momento del asiento

            $table->enum('tipo_movimiento', ['debito', 'credito']);
            $table->decimal('valor', 15, 2);

            $table->string('descripcion', 300)->nullable();
            $table->uuid('tercero_id')->nullable(); // Para auxiliar por tercero (futuro)

            $table->foreign('asiento_id')
                ->references('id')
                ->on('contab_asientos')
                ->onDelete('cascade');

            $table->index(['asiento_id', 'cuenta_puc']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contab_asientos_items');
        Schema::dropIfExists('contab_asientos');
    }
};
