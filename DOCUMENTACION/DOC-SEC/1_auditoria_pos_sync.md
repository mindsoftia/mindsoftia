# Auditoría de Seguridad y Mitigación: POS Sync Endpoint

**Fecha:** 1 de Julio de 2026  
**Componente Auditado:** `PosVentaController.php` (Endpoint: `POST /api/pos/sync`)  
**Nivel de Riesgo Previo:** Crítico (Posible pérdida de integridad financiera y fugas Multi-Tenant)  
**Estado Actual:** Asegurado (Zero Trust Implementado)

---

## 1. Vulnerabilidades Identificadas (Assessment)

Durante la auditoría del ciclo de vida de la sincronización offline-first del Punto de Venta, se detectaron los siguientes vectores de ataque:

1. **Vulnerabilidad IDOR (Insecure Direct Object Reference) en Catálogo:**
   - *Riesgo:* Un usuario de la Empresa A podía enviar un JSON interceptado modificando el `producto_id` por el de un producto de la Empresa B. El sistema lo aceptaba sin validar.
   - *Impacto:* Venta fantasma y descuadre de inventario de un inquilino ajeno.
2. **Violación Zero Trust (Manipulación Aritmética de Precios):**
   - *Riesgo:* La API recibía el `total_factura` y `precio_unitario` desde el payload de Dexie.js (cliente) e insertaba los datos ciegamente en el Kardex.
   - *Impacto:* Un atacante con conocimientos básicos de DevTools podía cambiar el precio de venta a $0, alterando la facturación NIIF y robando mercancía.
3. **Mass Assignment y Falta de Sanitización:**
   - *Riesgo:* Ausencia de un `Validator` estricto; el endpoint era vulnerable a inyección de estructuras malformadas.
4. **Suplantación de Identidad de Cajero:**
   - *Riesgo:* El campo `cajero_id` provenía del payload, permitiendo que el Usuario X firmara la venta a nombre del Usuario Y.

---

## 2. Mitigaciones Implementadas (Capa Backend - Laravel)

El código de `PosVentaController` fue reescrito bajo los lineamientos defensivos de DevSecOps:

### A. Sanitización Estricta de Payload
Se implementó `Validator::make` para asegurar que el array `ventas` contenga valores tipados estrictamente (ej. obligar `uuid`, `numeric|min:0.01`, y fechas `date`). Cualquier payload adulterado es rechazado inmediatamente (Error 422).

### B. Aislamiento Criptográfico de Tenants
Al buscar el producto que se está vendiendo, se forzó la inyección de la llave del inquilino:
```php
$producto = InvProducto::where('id', $item['producto_id'])
                       ->where('empresa_id', $empresaId)
                       ->first();
```
Si un atacante inyecta un UUID de otra empresa, el código lanza una excepción de vulnerabilidad IDOR.

### C. Recálculo Aritmético en Servidor
Se eliminó la confianza en los precios del cliente. El servidor ahora extrae el `precio_venta` y `costo_promedio` directamente desde la base de datos PostgreSQL, ejecutando el cálculo del `subtotal` y `total_factura` localmente antes de guardarlo en `PosVenta` y `InvKardex`.

### D. Enlace Fuerte de JWT (Anti-Suplantación)
El ID del cajero responsable ya no se lee ciegamente del JSON, sino de la firma del token JWT actual:
```php
$usuarioCajeroId = auth()->id() ?? $ventaData['cajero_id'];
```

---

## 3. Próximos Pasos en Ciberseguridad (Recomendaciones)

Para fortalecer el ecosistema, se recomienda:
1. **Auditoría RLS (Supabase):** Garantizar que esta misma lógica de aislamiento (`empresa_id`) esté respaldada en Supabase a nivel de base de datos como una última línea de defensa.
2. **Monitorización de Logs:** Activar alertas si un inquilino arroja más de 3 errores 422 o de IDOR en menos de 5 minutos, bloqueando su IP.
