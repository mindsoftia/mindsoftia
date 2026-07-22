<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MindSoftia — Tabla de Saldos Contables por Periodo (`contab_saldos_periodo`)
     *
     * Especialidades: /master-db + /master-cont + /master-sec
     * Propósito: Almacenar los saldos acumulados de cada cuenta PUC por periodo fiscal (YYYY-MM).
     * Permite emitir el Balance de Prueba instantáneo y generar los Libros Oficiales DIAN/NIIF
     * sin sobrecargar la base de datos sumando millones de registros del Libro Diario.
     */
    public function up(): void
    {
        Schema::create('contab_saldos_periodo', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->unsignedBigInteger('empresa_id');

            // Periodo contable — formato 'YYYY-MM' (ej: '2026-07')
            $table->char('periodo', 7);

            // Código y nombre de la cuenta del Plan Único de Cuentas (PUC)
            $table->string('cuenta_puc', 20);
            $table->string('cuenta_nombre', 150)->nullable();

            // Saldos e importes acumulados monetarios exactos
            $table->decimal('saldo_anterior', 15, 2)->default(0.00);
            $table->decimal('debito_periodo', 15, 2)->default(0.00);
            $table->decimal('credito_periodo', 15, 2)->default(0.00);
            
            // Saldo nuevo resultante al cierre o corte del periodo
            // NIIF Fórmula universal: Saldo Anterior + Débitos - Créditos
            $table->decimal('saldo_nuevo', 15, 2)->default(0.00);

            $table->timestamps();

            // Llaves foráneas e integridad referencial
            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');

            // Una cuenta PUC solo tiene UN registro por periodo para cada empresa
            $table->unique(['empresa_id', 'periodo', 'cuenta_puc'], 'uk_contab_saldos_empresa_periodo_puc');

            // Índices para búsquedas y generación ultrarrápida de balances de prueba
            $table->index(['empresa_id', 'periodo']);
            $table->index(['empresa_id', 'cuenta_puc']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contab_saldos_periodo');
    }
};
