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
        Schema::create('crm_terceros', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('empresa_id');
            $table->string('tipo_identificacion', 5);
            $table->string('numero_identificacion', 20);
            $table->string('nombres', 100)->nullable();
            $table->string('apellidos', 100)->nullable();
            $table->string('razon_social', 200)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->text('direccion')->nullable();
            $table->integer('ciudad_id')->nullable();
            $table->boolean('es_cliente')->default(true);
            $table->boolean('es_proveedor')->default(false);
            $table->boolean('estado')->default(true);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->unique(['empresa_id', 'numero_identificacion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_terceros');
    }
};
