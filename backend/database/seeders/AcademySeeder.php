<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LmsCategory;
use App\Models\LmsCourse;
use App\Models\KbCategory;
use App\Models\KbArticle;
use Illuminate\Support\Str;

class AcademySeeder extends Seeder
{
    public function run()
    {
        // Categorías LMS
        $catDocs = LmsCategory::firstOrCreate(['slug' => 'manuales-erp'], ['name' => 'Manuales ERP']);
        $catContabilidad = LmsCategory::firstOrCreate(['slug' => 'contabilidad'], ['name' => 'Contabilidad']);
        $catFacturacion = LmsCategory::firstOrCreate(['slug' => 'facturacion-electronica'], ['name' => 'Facturación Electrónica']);
        $catNomina = LmsCategory::firstOrCreate(['slug' => 'nomina-electronica'], ['name' => 'Nómina Electrónica']);

        // Cursos
        LmsCourse::firstOrCreate(
            ['slug' => Str::slug('Manual de Mindsoftia')],
            [
                'category_id' => $catDocs->id,
                'title' => 'Manual de Mindsoftia',
                'description' => 'Aprende a dominar todos los módulos del ERP Mindsoftia, desde inventarios hasta reportes financieros.',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
                'level' => 'Básico',
                'is_published' => true,
            ]
        );

        LmsCourse::firstOrCreate(
            ['slug' => Str::slug('Contabilidad Electrónica Mindsoftia')],
            [
                'category_id' => $catContabilidad->id,
                'title' => 'Contabilidad Electrónica Mindsoftia',
                'description' => 'Parametrización del PUC bajo NIIF, comprobantes contables y reportes exigidos por la DIAN.',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
                'level' => 'Intermedio',
                'is_published' => true,
            ]
        );

        LmsCourse::firstOrCreate(
            ['slug' => Str::slug('Facturación Electrónica Mindsoftia')],
            [
                'category_id' => $catFacturacion->id,
                'title' => 'Facturación Electrónica Mindsoftia',
                'description' => 'Domina el ecosistema RADIAN, acuses de recibo y la correcta emisión del Anexo Técnico 1.9.',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
                'level' => 'Avanzado',
                'is_published' => true,
            ]
        );

        LmsCourse::firstOrCreate(
            ['slug' => Str::slug('Nómina Electrónica Mindsoftia')],
            [
                'category_id' => $catNomina->id,
                'title' => 'Nómina Electrónica Mindsoftia',
                'description' => 'Liquidación de conceptos, provisiones y transmisión del CUNE sin errores a la DIAN.',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=600&auto=format&fit=crop',
                'level' => 'Intermedio',
                'is_published' => true,
            ]
        );

        // KB Categorías
        $catRes = KbCategory::firstOrCreate(['slug' => 'resoluciones-dian'], ['name' => 'Resoluciones DIAN']);
        $catEstatuto = KbCategory::firstOrCreate(['slug' => 'estatuto-tributario'], ['name' => 'Estatuto Tributario']);
        $catNiif = KbCategory::firstOrCreate(['slug' => 'contabilidad-niif'], ['name' => 'Contabilidad NIIF']);
        $catErp = KbCategory::firstOrCreate(['slug' => 'procesos-erp'], ['name' => 'Procesos ERP']);

        // Artículos de Resoluciones
        KbArticle::firstOrCreate(
            ['slug' => Str::slug('Resolucion 000165 de 2023 - Anexo 1.9')],
            [
                'category_id' => $catRes->id,
                'title' => 'Resolución 000165 de 2023 - Nuevo Anexo Técnico 1.9',
                'content' => '<h1>Resolución 000165 (Facturación Electrónica)</h1><p>Esta resolución expide el Anexo Técnico 1.9 para la facturación electrónica en Colombia, incluyendo nuevos validadores y estructuras XML para impuestos saludables y equivalentes.</p>',
                'is_published' => true,
                'views' => 1250,
                'helpful_votes' => 340
            ]
        );

        KbArticle::firstOrCreate(
            ['slug' => Str::slug('Resolucion 000013 de 2021 - Nomina Electronica')],
            [
                'category_id' => $catRes->id,
                'title' => 'Resolución 000013 de 2021 - Nómina Electrónica',
                'content' => '<h1>Nómina Electrónica</h1><p>Define la estructura del Documento Soporte de Pago de Nómina Electrónica, estableciendo la obligación de transmitir el CUNE a la DIAN dentro de los primeros 10 días del mes siguiente.</p>',
                'is_published' => true,
                'views' => 1100,
                'helpful_votes' => 280
            ]
        );
        
        KbArticle::firstOrCreate(
            ['slug' => Str::slug('Resolucion 000167 de 2021 - Documento Soporte')],
            [
                'category_id' => $catRes->id,
                'title' => 'Resolución 000167 de 2021 - Documento Soporte',
                'content' => '<h1>Documento Soporte Electrónico</h1><p>Regula el documento soporte en adquisiciones efectuadas a sujetos no obligados a expedir factura de venta o documento equivalente. Esencial para deducir costos en renta.</p>',
                'is_published' => true,
                'views' => 950,
                'helpful_votes' => 200
            ]
        );

        KbArticle::firstOrCreate(
            ['slug' => Str::slug('Resolucion 000085 de 2022 - RADIAN')],
            [
                'category_id' => $catRes->id,
                'title' => 'Resolución 000085 de 2022 - RADIAN y Eventos',
                'content' => '<h1>RADIAN y Título Valor</h1><p>Establece las reglas para el registro de la factura electrónica como título valor, haciendo obligatorio el Acuse de Recibo y el Recibo de Mercancías/Servicios.</p>',
                'is_published' => true,
                'views' => 1340,
                'helpful_votes' => 450
            ]
        );

        // Artículos del Estatuto Tributario
        KbArticle::firstOrCreate(
            ['slug' => Str::slug('Articulo 383 ET - Limites de Retencion')],
            [
                'category_id' => $catEstatuto->id,
                'title' => 'Límites de Retención en la Fuente (Art. 383 ET)',
                'content' => '<h1>Artículo 383 del E.T.</h1><p>Tabla de tarifas de retención en la fuente para ingresos laborales y pensiones. Actualizada anualmente según el valor de la UVT.</p>',
                'is_published' => true,
                'views' => 980,
                'helpful_votes' => 210
            ]
        );

        // Artículos de NIIF
        KbArticle::firstOrCreate(
            ['slug' => Str::slug('NIIF Pymes Seccion 13 - Inventarios')],
            [
                'category_id' => $catNiif->id,
                'title' => 'NIIF para PYMES (Sección 13 - Inventarios)',
                'content' => '<h1>Medición de Inventarios</h1><p>Los inventarios deben medirse al menor valor entre el costo y el precio de venta estimado menos los costos de terminación y venta.</p>',
                'is_published' => true,
                'views' => 670,
                'helpful_votes' => 120
            ]
        );
        
        KbArticle::firstOrCreate(
            ['slug' => Str::slug('Parametrizacion PUC bajo NIIF')],
            [
                'category_id' => $catNiif->id,
                'title' => 'Parametrización del PUC bajo NIIF',
                'content' => '<h1>El PUC bajo convergencia NIIF</h1><p>Aunque el Decreto 2650 de 1993 perdió vigencia regulatoria plena, la estructuración contable en MindSoftia requiere un mapeo de taxonomía NIIF hacia cuentas contables locales (ESFA).</p>',
                'is_published' => true,
                'views' => 700,
                'helpful_votes' => 190
            ]
        );

        // Artículos de ERP
        KbArticle::firstOrCreate(
            ['slug' => Str::slug('Como generar el Acuse de Recibo en RADIAN')],
            [
                'category_id' => $catErp->id,
                'title' => 'Cómo generar el Acuse de Recibo en MindSoftia',
                'content' => '<h1>Eventos de Factura</h1><p>Aprende paso a paso cómo registrar los eventos del RADIAN desde el módulo de compras para convertir las facturas de tus proveedores en Títulos Valores deducibles.</p>',
                'is_published' => true,
                'views' => 450,
                'helpful_votes' => 89
            ]
        );
    }
}
