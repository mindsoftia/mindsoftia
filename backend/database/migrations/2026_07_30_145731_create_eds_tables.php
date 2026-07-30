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
        // 1. eds_islas
        Schema::create('eds_islas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->string('nombre');
            $table->boolean('estado')->default(true);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
        });

        // 2. eds_surtidores
        Schema::create('eds_surtidores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->uuid('isla_id');
            $table->string('numero');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->foreign('isla_id')->references('id')->on('eds_islas')->onDelete('cascade');
        });

        // 3. eds_mangueras
        Schema::create('eds_mangueras', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->uuid('surtidor_id');
            $table->string('producto_nombre'); // ej: Corriente, Extra, ACPM
            $table->string('color')->nullable();
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->foreign('surtidor_id')->references('id')->on('eds_surtidores')->onDelete('cascade');
        });

        // 4. eds_turnos
        Schema::create('eds_turnos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->uuid('usuario_id');
            $table->dateTime('fecha_apertura');
            $table->dateTime('fecha_cierre')->nullable();
            $table->enum('estado', ['ABIERTO', 'CERRADO'])->default('ABIERTO');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
        });

        // 5. eds_lecturas
        Schema::create('eds_lecturas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('empresa_id');
            $table->uuid('turno_id');
            $table->uuid('manguera_id');
            $table->decimal('lectura_galones', 15, 4);
            $table->decimal('lectura_dinero', 15, 2);
            $table->enum('tipo', ['APERTURA', 'CIERRE']);
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->foreign('turno_id')->references('id')->on('eds_turnos')->onDelete('cascade');
            $table->foreign('manguera_id')->references('id')->on('eds_mangueras')->onDelete('cascade');
        });

        // Activar RLS en todas las tablas
        $tablas = ['eds_islas', 'eds_surtidores', 'eds_mangueras', 'eds_turnos', 'eds_lecturas'];
        foreach ($tablas as $tabla) {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE {$tabla} ENABLE ROW LEVEL SECURITY");
            \Illuminate\Support\Facades\DB::statement("
                CREATE POLICY \"Aislamiento por empresa en {$tabla}\" 
                ON {$tabla} FOR ALL 
                USING (empresa_id = current_setting('app.current_tenant_id', true)::uuid)
            ");
        }
    }

    public function down(): void
    {
        $tablas = ['eds_lecturas', 'eds_turnos', 'eds_mangueras', 'eds_surtidores', 'eds_islas'];
        foreach ($tablas as $tabla) {
            Schema::dropIfExists($tabla);
        }
    }
};
