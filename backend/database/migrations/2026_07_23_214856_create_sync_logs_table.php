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
        Schema::create('sync_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('empresa_id');
            $table->string('tipo'); // dian, contabilidad, local
            $table->string('estado'); // ok, error, warning
            $table->jsonb('detalles_json')->nullable();
            
            $table->timestamps();

            $table->foreign('empresa_id')
                  ->references('id')
                  ->on('empresas')
                  ->onDelete('cascade');
                  
            // Índices de búsqueda frecuente (Regla master-db)
            $table->index(['empresa_id', 'tipo']);
            $table->index('created_at');
        });

        // Regla master-db: Aislamiento Multi-Tenant (RLS) en Supabase/PostgreSQL
        DB::statement('ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;');
        DB::statement('CREATE POLICY "Aislamiento por Empresa_id" ON sync_logs FOR ALL USING (empresa_id = current_setting(\'app.current_tenant_id\', true)::bigint);');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP POLICY IF EXISTS "Aislamiento por Empresa_id" ON sync_logs;');
        Schema::dropIfExists('sync_logs');
    }
};
