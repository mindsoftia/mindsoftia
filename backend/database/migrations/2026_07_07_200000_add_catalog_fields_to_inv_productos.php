<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Crear tabla de categorías
        if (!Schema::hasTable('inv_categorias')) {
            Schema::create('inv_categorias', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->unsignedBigInteger('empresa_id');
                $table->string('nombre', 150);
                $table->string('descripcion', 255)->nullable();
                $table->string('color', 20)->nullable()->default('#00B7FF');
                $table->boolean('activo')->default(true);
                $table->timestamps();

                $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
                $table->unique(['empresa_id', 'nombre']); // Evitar categorías duplicadas por empresa
            });
        }

        // 2. Añadir campos al catálogo de productos
        Schema::table('inv_productos', function (Blueprint $table) {
            if (!Schema::hasColumn('inv_productos', 'categoria_id')) {
                $table->uuid('categoria_id')->nullable()->after('empresa_id');
                $table->foreign('categoria_id')->references('id')->on('inv_categorias')->onDelete('set null');
            }
            if (!Schema::hasColumn('inv_productos', 'stock_maximo')) {
                $table->decimal('stock_maximo', 10, 3)->default(0.000)->after('stock_minimo');
            }
            if (!Schema::hasColumn('inv_productos', 'tarifa_impuesto')) {
                $table->decimal('tarifa_impuesto', 5, 2)->default(0.00)->after('costo_promedio');
            }
            if (!Schema::hasColumn('inv_productos', 'etiquetas')) {
                $table->json('etiquetas')->nullable()->after('descripcion');
            }
        });
    }

    public function down(): void
    {
        Schema::table('inv_productos', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->dropColumn(['categoria_id', 'stock_maximo', 'tarifa_impuesto', 'etiquetas']);
        });

        Schema::dropIfExists('inv_categorias');
    }
};
