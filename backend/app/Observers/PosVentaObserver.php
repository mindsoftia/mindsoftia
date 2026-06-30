<?php

namespace App\Observers;

use App\Models\PosVenta;
use App\Models\ContabAsiento;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

/**
 * PosVentaObserver — El "Motor Contable Invisible" del NexoPOS.
 *
 * PRINCIPIO CLAVE:
 *   El cajero cobra → la venta se guarda → este observer reacciona automáticamente.
 *   Ni el cajero ni el administrador necesitan hacer nada extra.
 *
 * CUENTAS PUC (configurables en config/pos.php):
 *   DÉBITO  → 1105 (Caja) o 1110 (Bancos) según método de pago
 *   CRÉDITO → 4135 (Ventas) + 2408 (IVA por pagar si aplica)
 *
 * MANEJO DE ERRORES:
 *   Si falla la generación del asiento, la venta NO se revierte.
 *   El error se registra en el log para revisión posterior.
 *   Esto cumple la regla: el POS nunca se bloquea por un error contable.
 */
class PosVentaObserver
{
    public function created(PosVenta $venta): void
    {
        // Solo generar asiento si la venta está sincronizada (vino de la nube)
        // Las ventas con sync_status='pending' aún no tienen datos completos en la nube
        if ($venta->sync_status !== 'synced') {
            return;
        }

        $this->generarAsientoVenta($venta);
    }

    /**
     * También disparar cuando una venta pasa de 'pending' a 'synced'.
     * Este es el caso más común: venta offline que llega a la nube.
     */
    public function updated(PosVenta $venta): void
    {
        $cambioASync = $venta->isDirty('sync_status') &&
                       $venta->sync_status === 'synced' &&
                       $venta->getOriginal('sync_status') === 'pending';

        if ($cambioASync) {
            $this->generarAsientoVenta($venta);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // LÓGICA PRINCIPAL — Generación del asiento de partida doble
    // ──────────────────────────────────────────────────────────────
    private function generarAsientoVenta(PosVenta $venta): void
    {
        // Verificar que no exista ya un asiento para esta venta (idempotencia)
        $yaExiste = ContabAsiento::where('documento_tipo', 'pos_venta')
            ->where('documento_id', $venta->id)
            ->exists();

        if ($yaExiste) {
            return; // No generar duplicados
        }

        // Leer cuentas PUC desde configuración (no hardcodeado)
        $cuentas = $this->cuentasPorMetodoPago($venta->metodo_pago);

        // Calcular base gravable e IVA si aplica
        $ivaRate    = Config::get('pos.iva_rate', 0.19);         // 19% por defecto Colombia
        $aplicaIva  = Config::get('pos.aplica_iva', true);
        $totalVenta = (float) $venta->total_factura ?? (float) $venta->total;

        $baseVenta  = $aplicaIva
            ? round($totalVenta / (1 + $ivaRate), 2)
            : $totalVenta;
        $valorIva   = $aplicaIva ? round($totalVenta - $baseVenta, 2) : 0;

        DB::beginTransaction();
        try {
            // ── 1. Crear cabecera del asiento ────────────────────
            $asiento = ContabAsiento::create([
                'empresa_id'     => $venta->empresa_id,
                'tipo'           => 'VENTA_POS',
                'documento_tipo' => 'pos_venta',
                'documento_id'   => $venta->id,
                'descripcion'    => "Venta POS #{$venta->consecutivo} — {$venta->metodo_pago}",
                'total_debito'   => $totalVenta,
                'total_credito'  => $totalVenta,
                'estado'         => 'confirmado',
                'periodo'        => ContabAsiento::periodoDesde($venta->fecha_emision ?? now()),
                'fecha_asiento'  => $venta->fecha_emision ?? now()->toDateString(),
                'creado_por'     => null, // null = generado automáticamente
            ]);

            // ── 2. Línea DÉBITO — Caja o Bancos ─────────────────
            $asiento->items()->create([
                'cuenta_puc'      => $cuentas['debito_cuenta'],
                'cuenta_nombre'   => $cuentas['debito_nombre'],
                'tipo_movimiento' => 'debito',
                'valor'           => $totalVenta,
                'descripcion'     => "Ingreso por venta {$venta->metodo_pago}",
                'tercero_id'      => $venta->tercero_id ?? null,
            ]);

            // ── 3. Línea CRÉDITO — Ventas (base gravable) ────────
            $asiento->items()->create([
                'cuenta_puc'      => Config::get('pos.cuenta_ventas', '4135'),
                'cuenta_nombre'   => 'Comercio al por menor',
                'tipo_movimiento' => 'credito',
                'valor'           => $baseVenta,
                'descripcion'     => 'Ingresos por ventas al contado',
                'tercero_id'      => $venta->tercero_id ?? null,
            ]);

            // ── 4. Línea CRÉDITO — IVA por pagar (si aplica) ─────
            if ($aplicaIva && $valorIva > 0) {
                $asiento->items()->create([
                    'cuenta_puc'      => Config::get('pos.cuenta_iva', '2408'),
                    'cuenta_nombre'   => 'IVA por pagar',
                    'tipo_movimiento' => 'credito',
                    'valor'           => $valorIva,
                    'descripcion'     => "IVA 19% sobre venta #{$venta->consecutivo}",
                ]);
            }

            DB::commit();

            Log::info("[NexoPOS] Asiento contable generado automáticamente", [
                'asiento_id' => $asiento->id,
                'venta_id'   => $venta->id,
                'total'      => $totalVenta,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            // IMPORTANTE: No re-lanzar la excepción.
            // La venta ya está guardada. Solo registramos el error.
            Log::error("[NexoPOS] Error al generar asiento contable — Venta NO afectada", [
                'venta_id' => $venta->id,
                'error'    => $e->getMessage(),
            ]);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // CUENTAS PUC POR MÉTODO DE PAGO (configurables)
    // ──────────────────────────────────────────────────────────────
    private function cuentasPorMetodoPago(string $metodoPago): array
    {
        return match ($metodoPago) {
            'tarjeta'       => [
                'debito_cuenta' => Config::get('pos.cuenta_bancos', '1110'),
                'debito_nombre' => 'Bancos — Datáfono',
            ],
            'transferencia' => [
                'debito_cuenta' => Config::get('pos.cuenta_bancos', '1110'),
                'debito_nombre' => 'Bancos — Transferencia',
            ],
            'nequi'         => [
                'debito_cuenta' => Config::get('pos.cuenta_nequi', '1110'),
                'debito_nombre' => 'Bancos — Nequi/Billetera digital',
            ],
            default         => [
                'debito_cuenta' => Config::get('pos.cuenta_caja', '1105'),
                'debito_nombre' => 'Caja General',
            ],
        };
    }
}
