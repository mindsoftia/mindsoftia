<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InvKardex extends Model
{
    use HasUuids;

    protected $table    = 'inv_kardex';
    public $timestamps  = false; // Solo usamos fecha_movimiento

    protected $fillable = [
        'producto_id', 'sede_id', 'lote_id', 'tipo_movimiento',
        'cantidad', 'costo_unitario', 'costo_total',
        'stock_resultante', 'documento_tipo', 'documento_id',
        'observacion', 'usuario_id', 'fecha_movimiento',
    ];

    protected $casts = [
        'cantidad'         => 'decimal:3',
        'costo_unitario'   => 'decimal:4',
        'costo_total'      => 'decimal:2',
        'stock_resultante' => 'decimal:3',
        'fecha_movimiento' => 'datetime',
    ];

    // ── Relaciones ──────────────────────────────────────
    public function producto()
    {
        return $this->belongsTo(InvProducto::class, 'producto_id');
    }

    public function sede()
    {
        return $this->belongsTo(InvSede::class, 'sede_id');
    }
}
