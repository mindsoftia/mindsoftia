<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

class ContabAsiento extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'contab_asientos';

    protected $fillable = [
        'empresa_id', 'tipo', 'documento_tipo', 'documento_id',
        'descripcion', 'total_debito', 'total_credito',
        'estado', 'periodo', 'fecha_asiento', 'creado_por',
    ];

    protected $casts = [
        'total_debito'  => 'decimal:2',
        'total_credito' => 'decimal:2',
        'fecha_asiento' => 'date',
    ];

    // ── Inmutabilidad Contable (Append-Only) ────────────
    protected static function boot()
    {
        parent::boot();

        // Bloquear cambios en los valores financieros clave
        static::updating(function ($model) {
            // Solo se permite cambiar el 'estado' (ej. para anular), pero NUNCA los valores, empresa o fechas
            if ($model->isDirty(['total_debito', 'total_credito', 'empresa_id', 'fecha_asiento', 'periodo'])) {
                throw new \Exception("Violación de seguridad (FASE 5): Los montos y fechas de un Asiento Contable son inmutables. Debe emitir un asiento de reversión o nota crédito.");
            }
        });

        // Bloquear eliminaciones
        static::deleting(function ($model) {
            throw new \Exception("Violación de seguridad (FASE 5): No se permite eliminar Asientos Contables del historial.");
        });
    }

    // ── Relaciones ──────────────────────────────────────────────
    public function items()
    {
        return $this->hasMany(ContabAsientoItem::class, 'asiento_id');
    }

    // ── Helpers ─────────────────────────────────────────────────

    /**
     * Verifica que el asiento esté cuadrado (débitos == créditos).
     * Invariante fundamental de la partida doble.
     */
    public function estaCuadrado(): bool
    {
        return abs($this->total_debito - $this->total_credito) < 0.01;
    }

    /**
     * Genera el periodo contable automáticamente desde la fecha.
     * Formato: 'YYYY-MM' (ej: '2026-06')
     */
    public static function periodoDesde(\DateTimeInterface $fecha): string
    {
        return $fecha->format('Y-m');
    }
}
