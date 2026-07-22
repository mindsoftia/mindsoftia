<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MindSoftia — Tablas de Facturación Electrónica DIAN (`UBL 2.1 / CUFE / RADIAN`)
     *
     * Especialidades: /master-db + /master-cont + /master-sec
     * Propósito: Almacenar resoluciones de numeración, historial inmutable de documentos
     * XML validados (Facturas, Notas C/D, Nómina) y el seguimiento de eventos RADIAN.
     */
    public function up(): void
    {
        // 1. TABLA: fe_resoluciones (Autorizaciones de numeración y clave técnica DIAN)
        Schema::create('fe_resoluciones', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->unsignedBigInteger('empresa_id');

            $table->string('numero_resolucion', 50);
            $table->string('prefijo', 10)->nullable();
            $table->unsignedBigInteger('numero_inicial');
            $table->unsignedBigInteger('numero_final');
            $table->unsignedBigInteger('consecutivo_actual')->default(0);
            
            // Clave técnica secreta entregada por la DIAN para calcular el CUFE
            $table->string('clave_tecnica', 150);
            
            // 1 = Producción Oficial, 2 = Ambiente de Pruebas / Habilitación
            $table->unsignedSmallInteger('ambiente')->default(2);
            
            $table->date('vigencia_desde');
            $table->date('vigencia_hasta');
            $table->boolean('activo')->default(true);

            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->index(['empresa_id', 'activo']);
            $table->unique(['empresa_id', 'prefijo', 'numero_resolucion'], 'uk_fe_resoluciones_empresa_prefijo');
        });

        // 2. TABLA: fe_documentos (Historial y trazabilidad de facturas/notas XML UBL 2.1)
        Schema::create('fe_documentos', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->unsignedBigInteger('empresa_id');

            // Código de tipo de documento DIAN: 01 Factura, 03 Nota Débito, 04 Nota Crédito, 05 POS Electrónico, 10 Nómina
            $table->string('tipo_documento', 5)->default('01');

            // Referencia polimórfica al documento original del ERP (pos_venta, com_factura, etc.)
            $table->string('documento_origen_tipo', 50)->nullable();
            $table->uuid('documento_origen_id')->nullable();

            // Identificadores visuales y de control de la factura
            $table->string('prefijo', 10)->nullable();
            $table->unsignedBigInteger('consecutivo');
            $table->string('numero_completo', 60); // Ej: SETP990000001

            // CUFE (Código Único de Factura Electrónica) o CUNE (Nómina) — Hash SHA-384
            $table->string('cufe_cune', 96)->nullable();
            $table->text('qr_code_url')->nullable();

            // Almacenamiento de XML en formato texto puro o ruta de almacenamiento en cloud
            $table->longText('xml_generado')->nullable();
            $table->longText('xml_firmado')->nullable();

            // Identificador de seguimiento devuelto por el servicio web de la DIAN
            $table->string('track_id_dian', 100)->nullable();

            // Estado oficial de validación ante la DIAN
            // borrador | generado | enviado | aprobado | rechazado | anulado
            $table->string('estado_dian', 30)->default('borrador');
            
            $table->string('codigo_error_dian', 100)->nullable();
            $table->text('mensaje_dian')->nullable();

            // Fechas de emisión fiscal y de validación por parte del servicio de impuestos
            $table->date('fecha_emision');
            $table->time('hora_emision');
            $table->timestamp('fecha_validacion_dian')->nullable();

            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->index(['empresa_id', 'estado_dian']);
            $table->index(['empresa_id', 'cufe_cune']);
            $table->index(['documento_origen_tipo', 'documento_origen_id'], 'idx_fe_documento_origen');
            $table->unique(['empresa_id', 'numero_completo', 'tipo_documento'], 'uk_fe_docs_empresa_numero_tipo');
        });

        // 3. TABLA: fe_eventos_radian (Títulos valores, acuse de recibo y aceptación expresa)
        Schema::create('fe_eventos_radian', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('fe_documento_id');
            $table->unsignedBigInteger('empresa_id');

            // Código de evento DIAN RADIAN: 030 Acuse, 032 Recibo Bienes, 033 Aceptación Expresa, 034 Reclamo
            $table->string('codigo_evento', 10);
            $table->string('descripcion_evento', 200);

            $table->longText('xml_evento')->nullable();
            $table->string('track_id_dian', 100)->nullable();
            $table->string('estado', 30)->default('aprobado');
            
            $table->timestamp('fecha_evento')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamps();

            $table->foreign('fe_documento_id')->references('id')->on('fe_documentos')->onDelete('cascade');
            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->index(['fe_documento_id', 'codigo_evento']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fe_eventos_radian');
        Schema::dropIfExists('fe_documentos');
        Schema::dropIfExists('fe_resoluciones');
    }
};
