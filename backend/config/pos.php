<?php

/**
 * config/pos.php — Configuración del Módulo POS NexoPOS
 *
 * Todas las cuentas PUC y parámetros contables se centralizan aquí.
 * Para cambiar una cuenta, se modifica este archivo (o .env), NO el código.
 */
return [

    // ── Cuentas PUC Colombia (Plan Único de Cuentas) ─────────────
    'cuenta_caja'    => env('POS_CUENTA_CAJA',    '1105'),  // Caja General
    'cuenta_bancos'  => env('POS_CUENTA_BANCOS',  '1110'),  // Bancos
    'cuenta_nequi'   => env('POS_CUENTA_NEQUI',   '1110'),  // Billeteras digitales → Bancos
    'cuenta_ventas'  => env('POS_CUENTA_VENTAS',  '4135'),  // Comercio al por menor
    'cuenta_iva'     => env('POS_CUENTA_IVA',     '2408'),  // IVA por pagar

    // ── Parámetros de Impuestos ───────────────────────────────────
    'aplica_iva'     => env('POS_APLICA_IVA', true),
    'iva_rate'       => env('POS_IVA_RATE', 0.19),           // 19% Colombia

    // ── Configuración del Sincronizador ───────────────────────────
    'sync_interval_seconds' => env('POS_SYNC_INTERVAL', 30), // Frecuencia del sync worker

];
