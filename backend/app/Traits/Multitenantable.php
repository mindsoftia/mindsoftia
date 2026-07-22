<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Multitenantable
{
    /**
     * Boot del trait: aplica filtro global de tenant_id en todas las consultas
     * e inyecta el tenant_id automáticamente al crear nuevos registros.
     */
    public static function bootMultitenantable(): void
    {
        // Filtro global de lectura
        static::addGlobalScope('empresa', function (Builder $builder) {
            if (auth()->check() && auth()->user()->empresa_id) {
                $builder->where('empresa_id', auth()->user()->empresa_id);
            }
        });

        // Inyección automática al crear
        static::creating(function ($model) {
            if (!$model->empresa_id && auth()->check()) {
                $model->empresa_id = auth()->user()->empresa_id;
            }
        });
    }
}
