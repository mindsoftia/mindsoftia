# Análisis Arquitectónico y Contable: Módulo EDS (POS Avanzado Volumétrico)

## 1. Visión Genérica: ¿A qué otras empresas aplica?
El requerimiento de una Estación de Servicio (EDS) exige un software de altísima concurrencia, integración con hardware (surtidores/mangueras), control estricto de turnos (arqueos ciegos) e inventario volumétrico (medición de líquidos que cambian con la temperatura). 

Si desarrollamos este módulo bajo una arquitectura **genérica**, no se llamaría "Módulo EDS", sino **"Módulo POS Industrial & Inventario Continuo"**. Esto justifica una gran inversión de desarrollo porque se podrá vender a:
1. **Ferreterías Industriales:** Venta de arena por m³, cable por metros.
2. **Distribuidoras de Químicos o Lácteos:** Despachos líquidos por galones/litros.
3. **Supermercados de Alta Concurrencia:** Requieren los mismos controles estrictos de turnos de caja, lectura de balanzas (hardware) y arqueos ciegos.
4. **Acopiadoras de Granos:** Inventario en toneladas con merma.

## 2. Impacto Arquitectónico: ¿Qué tocaría modificar de MindSoftia?

La activación de este módulo por parte del SuperAdmin (en el panel de Empresas) requerirá la orquestación de varios componentes existentes:

### A. Base de Datos (`master-db`)
- **Migración Empresas (`empresas`):** Añadir toggle `has_pos_industrial` (similar a `has_pos_inventarios`).
- **Nuevas Tablas Core:**
  - `puntos_despacho` (islas, surtidores, balanzas).
  - `turnos_caja` (Apertura, Lectura Inicial, Lectura Final, Cierre, Arqueo).
  - `transacciones_hardware` (Log de la API del surtidor vs lo facturado en el POS).
- **Inventario:** El Kardex actual debe soportar **"Mermas y Ajustes Volumétricos"**, ya que el combustible se evapora.

### B. Contabilidad y DIAN (`master-cont`)
- **Impuestos Específicos:** Parametrización en el PUC de la "Sobretasa a la gasolina y al ACPM".
- **Facturación Electrónica Masiva:** Las EDS generan miles de tirillas POS. El sistema requerirá un cron/job que agrupe las ventas menores a consumidores finales anónimos en **una única Factura Electrónica Diaria** (o usar la nueva norma del Documento Equivalente Electrónico POS UBL 2.1).

### C. Backend & API (`master-dev`)
- **Daemons / Microservicios IoT:** El backend (Laravel) necesitará servicios locales en la estación (daemon local) que hablen con los protocolos de hardware (Gilbarco, Wayne) y sincronicen con la nube mediante WebSockets.

### D. Interfaz de Usuario (`master-ui`)
- **Panel SuperAdmin:** En `Tenants.jsx` y `Modulos.jsx`, renderizar el nuevo toggle premium "POS Industrial & EDS".
- **Interfaz Operativa POS:** UI táctil para despachadores (isleros), visualización de estado de mangueras en tiempo real.

## Conclusión Estratégica
El desarrollo es altamente rentable y justificable si se abstrae de "Gasolinera" a **"POS Industrial para Hardware e Inventario Continuo"**. Se comercializaría como el nivel más alto de suscripción SaaS, activable de forma asilada (Multi-Tenant) desde el SuperAdmin.
