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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            // Identificador de la empresa para Multitenancy
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->onDelete('cascade');
            
            // Código PUC (Ej: 1, 11, 1105, 110505)
            $table->string('code', 20);
            $table->string('name', 150);
            
            // Jerarquía del PUC
            $table->enum('type', ['clase', 'grupo', 'cuenta', 'subcuenta', 'auxiliar'])->default('auxiliar');
            
            // Naturaleza de la cuenta (Débito o Crédito)
            $table->enum('nature', ['debito', 'credito']);
            
            // Relación padre-hijo (Ej: '110505' es hijo de '1105')
            $table->foreignId('parent_id')->nullable()->constrained('accounts')->onDelete('cascade');
            
            // ¿Es cuenta de movimiento (asentable)? o solo de agrupación
            $table->boolean('is_transactional')->default(true);
            $table->boolean('is_active')->default(true);
            
            $table->text('description')->nullable();
            
            $table->timestamps();
            $table->softDeletes(); // Para no borrar historial contable

            // Una misma empresa no puede repetir un código de cuenta
            $table->unique(['empresa_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
