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
        Schema::table('crm_terceros', function (Blueprint $table) {
            $table->text('documento_rut_url')->nullable()->after('limite_credito');
            $table->text('camara_comercio_url')->nullable()->after('documento_rut_url');
            $table->text('certificacion_bancaria_url')->nullable()->after('camara_comercio_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_terceros', function (Blueprint $table) {
            $table->dropColumn(['documento_rut_url', 'camara_comercio_url', 'certificacion_bancaria_url']);
        });
    }
};
