<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * PosVenta — Modelo de la factura POS.
 * Corresponde a la tabla 'pos_ventas' creada en la migración
 * 2026_06_26_211026_a_create_pos_ventas_table.php
 *
 * El PosVentaObserver escucha los eventos 'created' y 'updated'
 * de este modelo para generar asientos contables automáticamente.
 */
class PosVenta extends Model
{
    use HasUuids;

    protected $table = 'pos_ventas';

    protected $fillable = [
        'empresa_id',
        'tercero_id',
        'usuario_cajero_id',
        'prefijo',
        'consecutivo',
        'fecha_emision',
        'hora_emision',
        'subtotal',
        'total_descuento',
        'total_impuestos',
        'total_factura',
        'metodo_pago',
        'estado',
        // Campos híbridos offline-first
        'caja_id',
        'sede_id',
        'sync_status',
        'dian_status',
        'fecha_emision_local',
    ];

    protected $casts = [
        'subtotal'        => 'decimal:2',
        'total_descuento' => 'decimal:2',
        'total_impuestos' => 'decimal:2',
        'total_factura'   => 'decimal:2',
        'fecha_emision'   => 'date',
    ];

    // ── Relaciones ──────────────────────────────────────────────
    public function detalles()
    {
        return $this->hasMany(PosVentaDetalle::class, 'venta_id');
    }

    public function asientoContable()
    {
        return $this->hasOne(ContabAsiento::class, 'documento_id')
                    ->where('documento_tipo', 'pos_venta');
    }

    // ── Scopes ──────────────────────────────────────────────────
    public function scopePendienteSync($query)
    {
        return $query->where('sync_status', 'pending');
    }

    public function scopeSincronizadas($query)
    {
        return $query->where('sync_status', 'synced');
    }
}
