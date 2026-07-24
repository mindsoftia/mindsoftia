<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('empresa_id'); // Referencia al tenant
            $table->string('tipo', 50); // critica, operativa, sistema
            $table->string('titulo');
            $table->text('mensaje');
            $table->boolean('leida')->default(false);
            $table->timestamp('leido_en')->nullable();
            $table->jsonb('metadata')->nullable(); // Para guardar info extra (ej: id_factura)
            $table->timestamps();
        });

        // Habilitar RLS en la tabla
        DB::statement('ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY');

        // Crear política de seguridad para el Tenant
        DB::statement('
            CREATE POLICY "tenant_isolation_notificaciones" ON notificaciones
            FOR ALL
            USING (empresa_id = current_setting(\'app.current_tenant_id\')::bigint);
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP POLICY IF EXISTS "tenant_isolation_notificaciones" ON notificaciones');
        Schema::dropIfExists('notificaciones');
    }
};
