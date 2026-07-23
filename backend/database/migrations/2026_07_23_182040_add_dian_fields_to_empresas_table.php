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
            // Identificación y Registro DIAN
            $table->string('nombre_comercial')->nullable()->after('nombre')->comment('Puede ser igual a la razón social o nombre de fantasía');
            $table->enum('tipo_persona', ['Jurídica', 'Natural'])->default('Jurídica')->after('nombre_comercial');
            $table->string('tipo_documento_id', 3)->default('31')->after('tipo_persona')->comment('31=NIT, 13=Cédula, etc.');
            $table->char('digito_verificacion', 1)->nullable()->after('ruc_nit');
            $table->string('codigo_ciiu', 10)->nullable()->after('digito_verificacion')->comment('Actividad económica principal');
            $table->json('responsabilidades_rut')->nullable()->after('codigo_ciiu')->comment('Array de códigos ej. O-13, O-15, O-47, ZZ');
            
            // Localización
            $table->string('direccion_fiscal')->nullable()->after('email');
            $table->string('codigo_postal', 10)->nullable()->after('direccion_fiscal');
            $table->string('codigo_departamento', 2)->nullable()->after('codigo_postal')->comment('Código DANE de departamento');
            $table->string('codigo_municipio', 3)->nullable()->after('codigo_departamento')->comment('Código DANE de municipio');
            
            // Contacto Facturación
            $table->string('email_facturacion')->nullable()->after('codigo_municipio')->comment('Para recepción electrónica RADIAN');
            $table->string('matricula_mercantil', 50)->nullable()->after('email_facturacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn([
                'nombre_comercial',
                'tipo_persona',
                'tipo_documento_id',
                'digito_verificacion',
                'codigo_ciiu',
                'responsabilidades_rut',
                'direccion_fiscal',
                'codigo_postal',
                'codigo_departamento',
                'codigo_municipio',
                'email_facturacion',
                'matricula_mercantil',
            ]);
        });
    }
};
