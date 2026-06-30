# Motor de Sincronización Inteligente (Fase 2: NexoPOS)

El objetivo de este motor es transferir los datos creados localmente (estado `pending`) hacia la nube en el momento en que se restablece la conexión, de forma completamente invisible para el usuario.

## 1. El Sync Worker (Frontend - JavaScript)

Para no bloquear la pantalla del cajero mientras se suben facturas pesadas, usamos un Web Worker.

```javascript
// Archivo: src/workers/syncWorker.js
import { posDB } from '../database/localPosDb';
import axios from 'axios';

let isSyncing = false;

async function syncPendingData() {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  try {
    // 1. Buscar ventas pendientes
    const ventasPendientes = await posDB.ventas
      .where('sync_status').equals('pending')
      .toArray();

    if (ventasPendientes.length === 0) {
      isSyncing = false;
      return;
    }

    // 2. Por cada venta, buscar sus items
    const payload = await Promise.all(ventasPendientes.map(async (venta) => {
      const items = await posDB.ventas_items
        .where('venta_id').equals(venta.id)
        .toArray();
      return { ...venta, items };
    }));

    // 3. Enviar a la nube (Batch API)
    const response = await axios.post('https://api.mindsoftia.com/v1/pos/sync', {
      ventas: payload
    });

    // 4. Si fue exitoso, marcar como sincronizado localmente
    if (response.status === 200) {
      const idsSincronizados = ventasPendientes.map(v => v.id);
      
      await posDB.ventas
        .where('id').anyOf(idsSincronizados)
        .modify({ sync_status: 'synced' });
        
      self.postMessage({ type: 'SYNC_SUCCESS', count: idsSincronizados.length });
    }

  } catch (error) {
    console.error("Error en sincronización background:", error);
    // Exponential backoff o reintento se manejaría aquí
  } finally {
    isSyncing = false;
  }
}

// Escuchar cuando el navegador recupera el internet
self.addEventListener('online', syncPendingData);

// Opcional: Ejecutar un chequeo cada 30 segundos si estamos online
setInterval(syncPendingData, 30000);
```

## 2. Endpoint Receptor (Backend - Laravel)

El backend debe recibir un lote de ventas y guardarlas usando transacciones de base de datos para asegurar integridad.

```php
// Archivo: app/Http/Controllers/Api/PosSyncController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PosVenta;
use App\Models\PosVentaItem;

class PosSyncController extends Controller
{
    public function syncBatch(Request $request)
    {
        $ventas = $request->input('ventas');
        $syncedIds = [];

        DB::beginTransaction();
        try {
            foreach ($ventas as $ventaData) {
                // Upsert para evitar errores si la venta ya se había sincronizado (Idempotencia)
                $venta = PosVenta::updateOrCreate(
                    ['id' => $ventaData['id']],
                    [
                        'caja_id' => $ventaData['caja_id'],
                        'sede_id' => $ventaData['sede_id'],
                        'cajero_id' => $ventaData['cajero_id'],
                        'total' => $ventaData['total'],
                        'metodo_pago' => $ventaData['metodo_pago'],
                        'fecha_emision_local' => $ventaData['fecha_emision_local'],
                        'sync_status' => 'synced'
                    ]
                );

                foreach ($ventaData['items'] as $itemData) {
                    PosVentaItem::updateOrCreate(
                        ['id' => $itemData['id']],
                        [
                            'venta_id' => $venta->id,
                            'producto_id' => $itemData['producto_id'],
                            'cantidad' => $itemData['cantidad'],
                            'precio_unitario' => $itemData['precio_unitario'],
                            'subtotal' => $itemData['subtotal']
                        ]
                    );
                }
                
                $syncedIds[] = $venta->id;
            }

            DB::commit();
            return response()->json(['message' => 'Sync ok', 'synced' => $syncedIds], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
```
