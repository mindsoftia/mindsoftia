<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\PosVenta;
use App\Observers\PosVentaObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ── NexoPOS: Motor Contable Invisible ────────────────────
        // Escucha eventos del modelo PosVenta y genera asientos
        // contables automáticamente al sincronizarse cada venta.
        PosVenta::observe(PosVentaObserver::class);
    }
}
