<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

/**
 * ContabSaldoPeriodo — Modelo Eloquent para Saldos Contables Mensualizados.
 *
 * Especialidades: /master-db + /master-cont
 * Propósito: Gestionar el Balance de Prueba y saldos por cuenta PUC y periodo (YYYY-MM).
 */
class ContabSaldoPeriodo extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'contab_saldos_periodo';

    protected $fillable = [
        'empresa_id',
        'periodo',
        'cuenta_puc',
        'cuenta_nombre',
        'saldo_anterior',
        'debito_periodo',
        'credito_periodo',
        'saldo_nuevo',
    ];

    protected $casts = [
        'saldo_anterior'  => 'decimal:2',
        'debito_periodo'  => 'decimal:2',
        'credito_periodo' => 'decimal:2',
        'saldo_nuevo'     => 'decimal:2',
    ];

    /**
     * Recalcula y persiste el saldo nuevo basándose en la ecuación fundamental NIIF:
     * Saldo Nuevo = Saldo Anterior + Débito - Crédito
     */
    public function recalcularSaldoNuevo(): void
    {
        $this->saldo_nuevo = round(
            $this->saldo_anterior + $this->debito_periodo - $this->credito_periodo,
            2
        );
        $this->save();
    }

    /**
     * Actualiza o crea el saldo de un periodo y cuenta PUC sumando un movimiento débito o crédito.
     */
    public static function registrarMovimiento(
        int $empresaId,
        string $periodo,
        string $cuentaPuc,
        ?string $cuentaNombre,
        float $montoDebito,
        float $montoCredito
    ): self {
        $saldo = static::firstOrNew([
            'empresa_id' => $empresaId,
            'periodo'    => $periodo,
            'cuenta_puc' => $cuentaPuc,
        ]);

        if (!$saldo->exists) {
            $saldo->cuenta_nombre = $cuentaNombre ?? "Cuenta {$cuentaPuc}";
            
            // Buscar si existe saldo de periodos anteriores para heredar saldo_anterior
            $periodoAnterior = static::obtenerPeriodoAnterior($periodo);
            $regAnterior = static::where('empresa_id', $empresaId)
                ->where('periodo', $periodoAnterior)
                ->where('cuenta_puc', $cuentaPuc)
                ->first();

            $saldo->saldo_anterior = $regAnterior ? $regAnterior->saldo_nuevo : 0.00;
        } elseif ($cuentaNombre) {
            $saldo->cuenta_nombre = $cuentaNombre;
        }

        $saldo->debito_periodo  = round($saldo->debito_periodo + $montoDebito, 2);
        $saldo->credito_periodo = round($saldo->credito_periodo + $montoCredito, 2);
        $saldo->recalcularSaldoNuevo();

        return $saldo;
    }

    /**
     * Devuelve el periodo mes inmediatamente anterior en formato YYYY-MM.
     */
    public static function obtenerPeriodoAnterior(string $periodo): string
    {
        $fecha = \DateTime::createFromFormat('Y-m-d', "{$periodo}-01");
        if (!$fecha) {
            return $periodo;
        }
        $fecha->modify('-1 month');
        return $fecha->format('Y-m');
    }
}
