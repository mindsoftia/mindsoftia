<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * PosVentaDetalle — Modelo del ítem vendido en la factura POS.
 * Corresponde a la tabla 'pos_ventas_detalles'.
 */
class PosVentaDetalle extends Model
{
    use HasUuids;

    protected $table = 'pos_ventas_detalles';

    protected $fillable = [
        'venta_id',
        'producto_id',
        'cantidad',
        'precio_unitario',
        'porcentaje_descuento',
        'porcentaje_impuesto',
        'subtotal',
        'total',
    ];

    protected $casts = [
        'cantidad'             => 'decimal:2',
        'precio_unitario'      => 'decimal:2',
        'porcentaje_descuento' => 'decimal:2',
        'porcentaje_impuesto'  => 'decimal:2',
        'subtotal'             => 'decimal:2',
        'total'                => 'decimal:2',
    ];

    public function venta()
    {
        return $this->belongsTo(PosVenta::class, 'venta_id');
    }

    public function producto()
    {
        return $this->belongsTo(InvProducto::class, 'producto_id');
    }
}
