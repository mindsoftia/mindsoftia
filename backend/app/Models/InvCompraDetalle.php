<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class InvCompraDetalle extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'inv_compras_detalles';

    protected $fillable = [
        'empresa_id',
        'compra_id',
        'producto_id',
        'cantidad',
        'costo_unitario',
        'porcentaje_impuesto',
        'valor_impuesto',
        'subtotal',
        'total'
    ];

    protected $casts = [
        'cantidad' => 'decimal:2',
        'costo_unitario' => 'decimal:2',
        'porcentaje_impuesto' => 'decimal:2',
        'valor_impuesto' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function compra()
    {
        return $this->belongsTo(InvCompra::class, 'compra_id');
    }

    public function producto()
    {
        return $this->belongsTo(InvProducto::class, 'producto_id');
    }
}
