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
        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantId = request()->attributes->get('tenant_id');
            if ($tenantId) {
                $builder->where('tenant_id', $tenantId);
            }
        });

        // Inyección automática al crear
        static::creating(function ($model) {
            if (!$model->tenant_id) {
                $tenantId = request()->attributes->get('tenant_id');
                if ($tenantId) {
                    $model->tenant_id = $tenantId;
                }
            }
        });
    }
}
