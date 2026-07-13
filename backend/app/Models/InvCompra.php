<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class InvCompra extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'inv_compras';

    protected $fillable = [
        'empresa_id',
        'tercero_id',
        'sede_id',
        'numero_factura',
        'fecha_compra',
        'fecha_vencimiento',
        'condicion_pago',
        'estado',
        'subtotal',
        'total_impuestos',
        'total_factura',
        'notas'
    ];

    protected $casts = [
        'fecha_compra' => 'date',
        'fecha_vencimiento' => 'date',
        'subtotal' => 'decimal:2',
        'total_impuestos' => 'decimal:2',
        'total_factura' => 'decimal:2'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function proveedor()
    {
        return $this->belongsTo(Tercero::class, 'tercero_id');
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class, 'sede_id'); // Assuming Sede model exists
    }

    public function detalles()
    {
        return $this->hasMany(InvCompraDetalle::class, 'compra_id');
    }
}
