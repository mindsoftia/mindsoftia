# Documento de Datos de Prueba - Catálogo de Productos

Para probar exhaustivamente el sistema de creación de productos (especialmente la UI de Mindsoftia SaaS), aquí tienes un conjunto de datos realistas de 10 productos que abarcan distintos casos de uso (físicos, servicios, exentos de IVA, etc.).

## 📌 ¿Cómo manejar Categorías y Etiquetas?

1. **Categorías (Familias):**
   Antes de crear los productos, debes ir al módulo de **Categorías y Familias** y crear estas 3 familias base:
   * **Electrónica** (Ingreso: 4135, Costo: 6135, Inv: 1435)
   * **Snacks y Bebidas** (Ingreso: 4135, Costo: 6135, Inv: 1435)
   * **Servicios Profesionales** (Ingreso: 4140, Costo: 0, Inv: 0)

2. **Etiquetas (Tags):**
   En el formulario, simplemente escribe las palabras separadas por una coma. 
   *Ejemplo:* `oferta, navidad, destacado`. El sistema (React) automáticamente las convertirá en un arreglo JSON en la base de datos de Supabase.

---

## 📦 Lista de 10 Productos de Prueba

| Producto | SKU | Código Barras | Categoría | Tipo | Costo | Venta | IVA % | Stock Min | Stock Max | Etiquetas |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auriculares Bluetooth** | AUD-BT01 | 7701234001 | Electrónica | Físico | 45.000 | 120.000 | 19.00 | 5 | 50 | `audio, inalambrico, oferta` |
| **Teclado Mecánico RGB** | TEC-M02 | 7701234002 | Electrónica | Físico | 120.000 | 250.000 | 19.00 | 2 | 20 | `gamer, pc, premium` |
| **Bebida Energética 250ml** | BEB-E01 | 7701234003 | Snacks y Bebidas | Físico | 2.500 | 6.000 | 19.00 | 12 | 100 | `bebida, energia, nevera` |
| **Manzana Verde (Unidad)** | FRU-M01 | 7701234004 | Snacks y Bebidas | Físico | 800 | 1.500 | **0.00** | 10 | 100 | `fruta, natural, exento` |
| **Mantenimiento PC Básico** | SRV-PC1 | No aplica | Servicios Prof. | Servicio | 0 | 80.000 | 19.00 | 0 | 0 | `mantenimiento, pc, tecnico` |
| **Licencia Antivirus 1 Año** | SRV-ANT | No aplica | Servicios Prof. | Servicio | 30.000 | 95.000 | 19.00 | 0 | 0 | `software, seguridad, anual` |
| **Agua Mineral 500ml** | BEB-A02 | 7701234007 | Snacks y Bebidas | Físico | 1.000 | 2.500 | **5.00** | 24 | 200 | `agua, hidratacion` |
| **Mouse Inalámbrico** | MOU-IN1 | 7701234008 | Electrónica | Físico | 15.000 | 45.000 | 19.00 | 10 | 50 | `oficina, pc, inalambrico` |
| **Galletas de Chocolate** | SNK-G01 | 7701234009 | Snacks y Bebidas | Físico | 1.200 | 3.000 | 19.00 | 15 | 80 | `dulce, snack, caja_fuerte` |
| **Instalación de Redes** | SRV-RED | No aplica | Servicios Prof. | Servicio | 0 | 250.000 | 19.00 | 0 | 0 | `infraestructura, redes, horas` |

---
*Nota para pruebas:* Utiliza la herramienta de "Agregar Producto" que acabamos de programar. Observa cómo el IVA del `19.00` se precarga por defecto gracias a la configuración de la empresa, pero en productos como la **Manzana Verde** o el **Agua Mineral**, el cajero (tú) debe sobrescribirlo por `0.00` o `5.00` según la tabla.
