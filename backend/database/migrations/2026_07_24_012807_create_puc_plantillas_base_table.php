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
        Schema::create('puc_plantillas_base', function (Blueprint $table) {
            $table->id();
            
            // Prefijo del CIUU al que pertenece esta cuenta. 
            // Ej: '00' = Base/Estándar, '47' = Comercio, '62' = Software/Servicios
            $table->string('ciiu_prefix', 2)->default('00');
            
            // Código PUC (Ej: 1, 11, 1105, 110505)
            $table->string('code', 20);
            $table->string('name', 150);
            
            // Jerarquía del PUC
            $table->enum('type', ['clase', 'grupo', 'cuenta', 'subcuenta', 'auxiliar'])->default('auxiliar');
            
            // Naturaleza de la cuenta (Débito o Crédito)
            $table->enum('nature', ['debito', 'credito']);
            
            // Relación padre-hijo basada en código (Ej: '110505' es hijo de '1105')
            $table->string('parent_code', 20)->nullable();
            
            // ¿Es cuenta de movimiento (asentable)? o solo de agrupación
            $table->boolean('is_transactional')->default(true);
            
            $table->text('description')->nullable();
            
            $table->timestamps();

            // Combinación única
            $table->unique(['ciiu_prefix', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('puc_plantillas_base');
    }
};
