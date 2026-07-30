<?php

namespace App\Observers;

use App\Models\Empresa;
use App\Services\PucCloneService;

class EmpresaObserver
{
    protected $pucCloneService;

    public function __construct(PucCloneService $pucCloneService)
    {
        $this->pucCloneService = $pucCloneService;
    }

    /**
     * Handle the Empresa "created" event.
     *
     * @param  \App\Models\Empresa  $empresa
     * @return void
     */
    public function created(Empresa $empresa)
    {
        // Al crear, clonamos usando su CIUU (o la base si no tiene)
        $this->pucCloneService->clonePucToEmpresa($empresa->id, $empresa->codigo_ciiu);
    }

    /**
     * Handle the Empresa "updated" event.
     *
     * @param  \App\Models\Empresa  $empresa
     * @return void
     */
    public function updated(Empresa $empresa)
    {
        // Si el codigo_ciiu cambió (por ejemplo, lo establecen en el onboarding)
        if ($empresa->wasChanged('codigo_ciiu')) {
            $this->pucCloneService->clonePucToEmpresa($empresa->id, $empresa->codigo_ciiu);
        }
    }
}
