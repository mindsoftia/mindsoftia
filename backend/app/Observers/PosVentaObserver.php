<?php

namespace App\Observers;

use App\Models\PosVenta;
use App\Models\ContabAsiento;
use App\Models\ContabSaldoPeriodo;
use App\Models\Empresa;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

/**
 * PosVentaObserver — El "Motor Contable Invisible" de MindSoftia (FASE 2 y 3).
 *
 * Especialidades que operaron este motor:
 *   - /master-cont : Reglas NIIF, partida doble (Ingreso + Costo de Ventas) y validación tributaria.
 *   - /master-dev  : Lógica transaccional limpia, validación del toggle SaaS y sincronización de saldos.
 *   - /master-db   : Persistencia en contab_asientos y contab_saldos_periodo.
 *
 * PRINCIPIO CLAVE:
 *   1. El cajero cobra → la venta se guarda → este observer reacciona automáticamente.
 *   2. Si la empresa NO tiene activado el módulo contable (`modulo_contabilidad == false`), se omite el asiento.
 *   3. Si está activo, genera Partida Doble total (Ingreso + Costo de mercancía vendida 6135/1435).
 *   4. Actualiza en tiempo real los saldos del mes en `contab_saldos_periodo` para balances instantáneos.
 */
class PosVentaObserver
{
    public function created(PosVenta $venta): void
    {
        // Solo generar asiento si la venta está sincronizada (vino de la nube o se completó en firme)
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
        // ── VERIFICACIÓN DEL TOGGLE SAAS (FASE 3) ──────────────────
        // Respetamos la configuración del SuperAdmin sobre los módulos de la empresa.
        $empresa = Empresa::find($venta->empresa_id);
        if (!$empresa || !$empresa->modulo_contabilidad) {
            Log::info("[MindSoftia Contabilidad] Asiento omitido — Módulo contable inactivo en la empresa", [
                'empresa_id' => $venta->empresa_id,
                'venta_id'   => $venta->id,
            ]);
            return;
        }

        // Verificar que no exista ya un asiento para esta venta (idempotencia)
        $yaExiste = ContabAsiento::where('documento_tipo', 'pos_venta')
            ->where('documento_id', $venta->id)
            ->exists();

        if ($yaExiste) {
            return; // No generar duplicados
        }

        // Leer cuentas PUC de tesorería e ingreso
        $cuentas = $this->cuentasPorMetodoPago($venta->metodo_pago);

        // ── CÁLCULO DE INGRESOS E IMPUESTOS (NIIF) ─────────────────
        $ivaRate    = Config::get('pos.iva_rate', 0.19);         // 19% por defecto Colombia
        $aplicaIva  = Config::get('pos.aplica_iva', true);
        $totalVenta = (float) ($venta->total_factura ?? $venta->total ?? 0.00);

        $baseVenta  = $aplicaIva
            ? round($totalVenta / (1 + $ivaRate), 2)
            : $totalVenta;
        $valorIva   = $aplicaIva ? round($totalVenta - $baseVenta, 2) : 0;

        // ── CÁLCULO DE COSTO DE LO VENDIDO (FASE 2) ────────────────
        // NIIF Sistema de inventario permanente: calculamos el costo real de los ítems vendidos
        $costoTotalVenta = 0.00;
        $detalles = $venta->detalles()->with('producto')->get();
        foreach ($detalles as $detalle) {
            $costoUnitario = $detalle->producto ? (float) $detalle->producto->costo_promedio : 0.00;
            $costoTotalVenta += round((float) $detalle->cantidad * $costoUnitario, 2);
        }

        $totalAsiento = round($totalVenta + $costoTotalVenta, 2);
        $periodo = ContabAsiento::periodoDesde($venta->fecha_emision ?? now());

        DB::beginTransaction();
        try {
            // ── 1. Crear cabecera del asiento ────────────────────
            $asiento = ContabAsiento::create([
                'empresa_id'     => $venta->empresa_id,
                'tipo'           => 'VENTA_POS',
                'documento_tipo' => 'pos_venta',
                'documento_id'   => $venta->id,
                'descripcion'    => "Venta POS #{$venta->consecutivo} — {$venta->metodo_pago}",
                'total_debito'   => $totalAsiento,
                'total_credito'  => $totalAsiento,
                'estado'         => 'confirmado',
                'periodo'        => $periodo,
                'fecha_asiento'  => $venta->fecha_emision ?? now()->toDateString(),
                'creado_por'     => null, // null = generado automáticamente por el motor
            ]);

            // ── 2. Línea DÉBITO — Caja o Bancos (Ingreso monetario) ──
            $asiento->items()->create([
                'cuenta_puc'      => $cuentas['debito_cuenta'],
                'cuenta_nombre'   => $cuentas['debito_nombre'],
                'tipo_movimiento' => 'debito',
                'valor'           => $totalVenta,
                'descripcion'     => "Ingreso por venta {$venta->metodo_pago}",
                'tercero_id'      => $venta->tercero_id ?? null,
            ]);
            ContabSaldoPeriodo::registrarMovimiento(
                $venta->empresa_id, $periodo, $cuentas['debito_cuenta'], $cuentas['debito_nombre'], $totalVenta, 0.00
            );

            // ── 3. Línea CRÉDITO — Ventas (Base gravable) ────────────
            $cuentaVentas = Config::get('pos.cuenta_ventas', '4135');
            $nombreVentas = 'Comercio al por menor';
            $asiento->items()->create([
                'cuenta_puc'      => $cuentaVentas,
                'cuenta_nombre'   => $nombreVentas,
                'tipo_movimiento' => 'credito',
                'valor'           => $baseVenta,
                'descripcion'     => 'Ingresos por ventas al contado',
                'tercero_id'      => $venta->tercero_id ?? null,
            ]);
            ContabSaldoPeriodo::registrarMovimiento(
                $venta->empresa_id, $periodo, $cuentaVentas, $nombreVentas, 0.00, $baseVenta
            );

            // ── 4. Línea CRÉDITO — IVA por pagar (si aplica) ─────────
            if ($aplicaIva && $valorIva > 0) {
                $cuentaIva = Config::get('pos.cuenta_iva', '2408');
                $nombreIva = 'IVA por pagar';
                $asiento->items()->create([
                    'cuenta_puc'      => $cuentaIva,
                    'cuenta_nombre'   => $nombreIva,
                    'tipo_movimiento' => 'credito',
                    'valor'           => $valorIva,
                    'descripcion'     => "IVA 19% sobre venta #{$venta->consecutivo}",
                ]);
                ContabSaldoPeriodo::registrarMovimiento(
                    $venta->empresa_id, $periodo, $cuentaIva, $nombreIva, 0.00, $valorIva
                );
            }

            // ── 5. ASIENTO DEL COSTO DE VENTAS NIIF (6135 vs 1435) ───
            if ($costoTotalVenta > 0) {
                // Débito a 6135: Costo de ventas
                $cuentaCosto = Config::get('pos.cuenta_costo', '6135');
                $nombreCosto = 'Costo de ventas de mercancías';
                $asiento->items()->create([
                    'cuenta_puc'      => $cuentaCosto,
                    'cuenta_nombre'   => $nombreCosto,
                    'tipo_movimiento' => 'debito',
                    'valor'           => $costoTotalVenta,
                    'descripcion'     => "Costo NIIF mercancías vendidas en factura #{$venta->consecutivo}",
                ]);
                ContabSaldoPeriodo::registrarMovimiento(
                    $venta->empresa_id, $periodo, $cuentaCosto, $nombreCosto, $costoTotalVenta, 0.00
                );

                // Crédito a 1435: Inventarios (Descarga contable de mercancía)
                $cuentaInv = Config::get('pos.cuenta_inventario', '1435');
                $nombreInv = 'Inventario de mercancías';
                $asiento->items()->create([
                    'cuenta_puc'      => $cuentaInv,
                    'cuenta_nombre'   => $nombreInv,
                    'tipo_movimiento' => 'credito',
                    'valor'           => $costoTotalVenta,
                    'descripcion'     => "Descarga contable inventario venta #{$venta->consecutivo}",
                ]);
                ContabSaldoPeriodo::registrarMovimiento(
                    $venta->empresa_id, $periodo, $cuentaInv, $nombreInv, 0.00, $costoTotalVenta
                );
            }

            DB::commit();

            Log::info("[MindSoftia Contabilidad] Asiento de venta e inventario generado exitosamente", [
                'asiento_id' => $asiento->id,
                'venta_id'   => $venta->id,
                'total_ingreso' => $totalVenta,
                'total_costo'   => $costoTotalVenta,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            // La venta en POS NUNCA se bloquea por error en el asientador invisible
            Log::error("[MindSoftia Contabilidad] Error al generar asiento — Venta POS preservada intacta", [
                'venta_id' => $venta->id,
                'error'    => $e->getMessage(),
            ]);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // CUENTAS PUC POR MÉTODO DE PAGO
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
