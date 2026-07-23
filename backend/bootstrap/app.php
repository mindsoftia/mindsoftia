<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: '',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Alias de middleware personalizados
        $middleware->alias([
            'supabase.auth' => \App\Http\Middleware\VerifySupabaseToken::class,
            'role'          => \App\Http\Middleware\CheckRole::class,
            'permission'    => \App\Http\Middleware\CheckPermission::class,
        ]);

        // Deshabilitar la verificación CSRF para las rutas API
        $middleware->validateCsrfTokens(except: ['api/*']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->wantsJson(),
        );
    })->create();
