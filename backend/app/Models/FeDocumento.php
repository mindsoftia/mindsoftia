<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Multitenantable;

/**
 * FeDocumento — Modelo Eloquent para el Historial de Documentos Electrónicos DIAN (UBL 2.1).
 * 
 * Especialidades: /master-db + /master-cont + /master-sec
 * Propósito: Administrar la emisión de facturas, notas C/D, cálculo de CUFE y estado DIAN.
 */
class FeDocumento extends Model
{
    use HasUuids, Multitenantable;

    protected $table = 'fe_documentos';

    protected $fillable = [
        'empresa_id',
        'tipo_documento',
        'documento_origen_tipo',
        'documento_origen_id',
        'prefijo',
        'consecutivo',
        'numero_completo',
        'cufe_cune',
        'qr_code_url',
        'xml_generado',
        'xml_firmado',
        'track_id_dian',
        'estado_dian',
        'codigo_error_dian',
        'mensaje_dian',
        'fecha_emision',
        'hora_emision',
        'fecha_validacion_dian',
    ];

    protected $casts = [
        'consecutivo'           => 'integer',
        'fecha_emision'         => 'date',
        'fecha_validacion_dian' => 'datetime',
    ];

    // Relaciones
    public function resolucion()
    {
        return $this->belongsTo(FeResolucion::class, 'empresa_id', 'empresa_id')
                    ->where('prefijo', $this->prefijo);
    }

    public function eventosRadian()
    {
        return $this->hasMany(FeEventoRadian::class, 'fe_documento_id');
    }

    /**
     * Calcula el hash criptográfico SHA-384 universal del CUFE cumpliendo el Anexo Técnico 1.8 DIAN.
     */
    public static function calcularCufeSha384(
        string $numFact,
        string $fecFact,
        string $horaFact,
        float $valFac,
        float $valIva,
        float $valImpoconsumo,
        float $valIca,
        float $valTot,
        string $nitOfe,
        string $numAdq,
        string $claveTecnica,
        int $tipoAmbiente
    ): string {
        $strValFac = number_format($valFac, 2, '.', '');
        
        // Impuestos concatenados: CodImp + Valor
        $codImp1 = '01';
        $strValImp1 = number_format($valIva, 2, '.', '');
        
        $codImp2 = '04';
        $strValImp2 = number_format($valImpoconsumo, 2, '.', '');
        
        $codImp3 = '03';
        $strValImp3 = number_format($valIca, 2, '.', '');
        
        $valImpSum = $valIva + $valImpoconsumo + $valIca;
        $strValImp = number_format($valImpSum, 2, '.', '');
        $strValTot = number_format($valTot, 2, '.', '');

        $cadenaConcatenada = $numFact .
            $fecFact .
            $horaFact .
            $strValFac .
            $codImp1 . $strValImp1 .
            $codImp2 . $strValImp2 .
            $codImp3 . $strValImp3 .
            $strValImp .
            $strValTot .
            $nitOfe .
            $numAdq .
            $claveTecnica .
            $tipoAmbiente;

        return hash('sha384', $cadenaConcatenada);
    }
}
