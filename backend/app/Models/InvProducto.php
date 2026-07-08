<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class InvProducto extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'inv_productos';
    protected $fillable = [
        'empresa_id', 'categoria_id', 'codigo_sku', 'codigo_barras', 'nombre',
        'descripcion', 'etiquetas', 'precio_venta_1',
        'costo_promedio', 'tarifa_impuesto', 'stock_actual', 'stock_maximo', 
        'tipo', 'controla_inventario', 'estado', 'imagen_url'
    ];

    protected $casts = [
        'precio_venta_1' => 'decimal:2',
        'costo_promedio' => 'decimal:2',
        'tarifa_impuesto'=> 'decimal:2',
        'stock_actual'   => 'decimal:3',
        'stock_maximo'   => 'decimal:3',
        'controla_inventario' => 'boolean',
        'estado'         => 'boolean',
        'etiquetas'      => 'array',
    ];

    // ── Relaciones ──────────────────────────────────────
    public function categoria()
    {
        return $this->belongsTo(InvCategoria::class, 'categoria_id');
    }

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
        return $query->where('estado', true)->where('controla_inventario', true);
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
