<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InvProducto extends Model
{
    use HasUuids;

    protected $table = 'inv_productos';
    protected $fillable = [
        'empresa_id', 'referencia', 'codigo_barras', 'nombre',
        'descripcion', 'unidad_medida', 'precio_venta',
        'costo_promedio', 'stock_minimo', 'tipo',
        'maneja_inventario', 'activo',
    ];

    protected $casts = [
        'precio_venta'   => 'decimal:2',
        'costo_promedio' => 'decimal:2',
        'stock_minimo'   => 'decimal:3',
        'maneja_inventario' => 'boolean',
        'activo'         => 'boolean',
    ];

    // ── Relaciones ──────────────────────────────────────
    public function stockSedes()
    {
        return $this->hasMany(InvStockSede::class, 'producto_id');
    }

    public function lotes()
    {
        return $this->hasMany(InvLote::class, 'producto_id');
    }

    public function kardex()
    {
        return $this->hasMany(InvKardex::class, 'producto_id');
    }

    // ── Scopes ──────────────────────────────────────────
    public function scopeActivos($query)
    {
        return $query->where('activo', true)->where('maneja_inventario', true);
    }

    // Stock consolidado de todas las sedes
    public function stockTotal(): float
    {
        return $this->stockSedes()->sum('cantidad');
    }

    // Stock de una sede específica
    public function stockEnSede(string $sedeId): float
    {
        $stock = $this->stockSedes()->where('sede_id', $sedeId)->first();
        return $stock ? (float) $stock->cantidad : 0.0;
    }

    // ¿Tiene stock mínimo crítico en alguna sede?
    public function tieneAlertaStock(): bool
    {
        return $this->stockTotal() <= $this->stock_minimo;
    }
}
