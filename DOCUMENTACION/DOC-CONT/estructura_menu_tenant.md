# Arquitectura del Menú y Navegación: Módulos Contables y Operativos (Tenant)

## 1. CONTEXTO
Actualmente, el menú lateral para los inquilinos (tenants) en Mindsoftia incluye secciones como *Tablero Gerencial, Ventas e Ingresos, Punto de Venta, Contactos, Inventario, Compras y Gastos, Contabilidad y Ajustes*. Se requiere reorganizar esta estructura para que sea intuitiva, siga los estándares de los ERP modernos del mercado colombiano (como Dataico) y mantenga la rigurosidad y lógica contable subyacente (como Helisa), garantizando que agrupar funcionalidades operativas (POS, Catálogo, Proveedores) tenga sentido comercial y financiero.

## 2. ROL
Arquitecto Financiero Híbrido y Especialista en Experiencia de Usuario (UX) de Software ERP.

## 3. TAREA
Diseñar y justificar una estructura de menú lateral jerárquica y estandarizada que agrupe lógicamente los submódulos de Ventas, Compras, Inventario y Contabilidad, facilitando la curva de aprendizaje para los usuarios finales.

## 4. FLUJO (Análisis y Propuesta de Reestructuración)

### Estructura Propuesta (Inspirada en Dataico / Helisa)

El menú debe dividir las operaciones en flujos naturales de trabajo: **Ingresos (Ventas), Egresos (Compras), Control (Inventario) y Resultados (Contabilidad).**

1. 📊 **Tablero Gerencial (Dashboard)**
   - Vista rápida de ingresos, cuentas por cobrar, cuentas por pagar y stock bajo.

2. 🛒 **Punto de Venta (POS)** *(Acceso rápido, fuera de desplegables)*
   - Debe mantenerse en la raíz por ser una interfaz de operación rápida e intensiva.

3. 💰 **Ventas e Ingresos** *(Flujo de entrada de dinero)*
   - Facturas de Venta (Electrónica / Tradicional)
   - Cotizaciones
   - Recibos de Caja (Pagos de clientes)
   - Notas Crédito / Débito (Ventas)
   - *Clientes* (Opcional agruparlo aquí en lugar de un módulo general de "Contactos")

4. 📦 **Catálogo e Inventario** *(Control de Activos)*
   - Productos y Servicios
   - Categorías y Familias
   - Bodegas / Sucursales
   - Movimientos (Kardex, Entradas, Salidas, Ajustes)
   - Lista de Precios

5. 🛒 **Compras y Gastos** *(Flujo de salida de dinero)*
   - Facturas de Compra (Recepción)
   - Órdenes de Compra
   - Comprobantes de Egreso (Pagos a proveedores)
   - Documento Soporte (Nómina / No obligados a facturar)
   - *Proveedores* (Opcional agruparlo aquí)

6. 👥 **Contactos** *(Alternativa Centralizada)*
   - *Si se prefiere mantener centralizado en lugar de dividir en Ventas/Compras:*
   - Clientes
   - Proveedores
   - Empleados / Vendedores

7. 🏦 **Finanzas y Contabilidad** *(El Motor NIIF de Helisa)*
   - Asientos Contables / Comprobantes Diarios
   - Conciliación Bancaria / Cajas
   - Impuestos y Retenciones
   - Reportes Financieros (Balance General, Estado de Resultados, Auxiliares)

8. ⚙️ **Ajustes**
   - Perfil de la Empresa (Tenant)
   - Usuarios y Roles
   - Configuración POS e Impresoras
   - Sincronización (Estado Híbrido / Nube)

### Justificación Contable y Comercial
- **Catálogo Centralizado:** Agrupar "Productos" y "Categorías" dentro de **Inventario** evita redundancias. En Helisa y Dataico, la categoría (familia) dicta la contabilización (la cuenta PUC de ingresos y costos).
- **Separación de Flujos:** Mantener separados Ventas e Ingresos (Cuentas por Cobrar) de Compras y Gastos (Cuentas por Pagar) es vital para la salud financiera y para aplicar permisos de usuario restrictivos (quien compra no necesariamente vende).
- **POS Aislado:** El POS es una vista táctil/operativa, no administrativa. Merece estar separado visualmente del flujo administrativo de facturación electrónica.

## 5. REGLAS (Restricciones y Criterios de Aceptación)
- **Coherencia de Permisos:** La estructura debe permitir que el sistema de Roles oculte fácilmente grupos enteros (Ej. Ocultar "Contabilidad" al cajero).
- **Regla de 3 Clics:** El usuario debe llegar a cualquier submódulo crítico en máximo 3 clics desde el menú principal.
- **Terminología Estándar:** Usar términos financieros ampliamente aceptados por contadores en Colombia (Factura de Venta, Recibo de Caja, Comprobante de Egreso).

## 6. RESULTADO
Se recomienda actualizar el componente de navegación del inquilino (posiblemente `Sidebar.jsx` o similar) para reflejar esta jerarquía. Este documento dicta la estructura de los próximos desarrollos de vistas y ruteo en React (React Router).

---
*(Documento generado bajo la directriz /master-cont)*
