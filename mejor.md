# Plan de Mejora - Panel Administrativo Market Coffee

## Objetivo

Reorganizar el menu del admin con submenus logicos por modulo, eliminar Mesas, unificar pedidos/rastreo, crear reportes profesionales, y separar lo tecnico (solo admin) de lo operativo (todos los roles).

---

## ESTRUCTURA FINAL DEL MENU

```
┌─────────────────────────────────────────────────────────────┐
│  📊 REPORTES            (todos los roles)                   │
├─────────────────────────────────────────────────────────────┤
│  Resumen General        → KPIs del negocio                  │
│  Ventas                 → Diarias, semanales, mensuales     │
│  Productos Report       → Mas vendidos, inventario          │
│  App                    → Descargas, suscripciones          │
│  Estadisticas           → Graficos, comparativas            │
├─────────────────────────────────────────────────────────────┤
│  🛒 PEDIDOS             (todos los roles)                   │
├─────────────────────────────────────────────────────────────┤
│  Comandas               → Kanban de pedidos activos         │
│  Historial              → Pedidos entregados/cancelados     │
│  Mapa Delivery          → Rastreo de delivery en vivo       │
├─────────────────────────────────────────────────────────────┤
│  📣 MARKETING           (todos los roles)                   │
├─────────────────────────────────────────────────────────────┤
│  Clientes               → Datos, correo, telefono           │
│  Mensajes               → Enviar/recibir mensajes push      │
│  Promociones            → Campagnas push, ofertas           │
│  Cupones                → Gestion de cupones                │
│  Fidelizacion           → Sistema de puntos                 │
│  Segmentacion           → Segmentos de clientes             │
│  Automatizacion         → Reglas automaticas                │
│  Analytics Push         → Reporte de notificaciones         │
├─────────────────────────────────────────────────────────────┤
│  🏪 TIENDA              (todos los roles)                   │
├─────────────────────────────────────────────────────────────┤
│  General                → Nombre, direccion, telefono       │
│  ─── PRODUCTOS ───────────────────────────────────────────  │
│  Productos              → Lista, crear, editar, pausar      │
│    └ Submenus:                                               │
│       Inventario      → Lista completa con filtros          │
│       Crear/Editar    → Formulario completo del producto    │
│       Etiquetas       → Nuevo, Promo, Mas Vendido, Gratis  │
│       Variaciones     → Tamanos, precios por tamano         │
│       Extras/Opciones → Grupos de opciones con precios      │
│       Recomendados    → Productos relacionados              │
│       Imagenes        → Galeria multi-imagen                │
│       Stock           → Inventario y disponibilidad         │
│  ─── CATALOGO ─────────────────────────────────────────────  │
│  Categorias            → Organizacion del menu              │
│  Ofertas               → Flash sales y promociones          │
│  Combos                → Bundles con descuento              │
│  ─── OPERACIONES ──────────────────────────────────────────  │
│  Delivery              → Costos, zonas, calculo             │
│  Pagos                 → Metodos de pago, tasa cambio       │
│  Banners               → Gestion de banners                 │
├─────────────────────────────────────────────────────────────┤
│  ⚙️ CONFIGURACION       (SOLO admin: kecho8a@gmail.com)     │
├─────────────────────────────────────────────────────────────┤
│  Personalizacion       → Colores, logo, tipografia          │
│  PWA                   → Iconos, splash, service worker     │
│  SEO                   → Meta tags, JSON-LD                 │
│  Sucursales            → Multi-sucursal, credenciales       │
│  Roles                 → Gestion de usuarios admin          │
│  Sistema               → Backup, limpiar DB, logs           │
│  Extras Productos      → Grupos de opciones globales        │
│  FAQ                   → Preguntas frecuentes               │
└─────────────────────────────────────────────────────────────┘
```

---

## FASE 1: Eliminar Mesas

| Archivo | Accion |
|---------|--------|
| `src/pages/admin/index.tsx` | Eliminar import, lazy-load, seccion `tables`, case del `switch` |
| `src/pages/admin/sections/TablesSection.tsx` | **Eliminar archivo completo** |

---

## FASE 2: Modulo PRODUCTOS (el mas importante)

### 2.1 Estructura del modulo Productos

El modulo de productos se divide en **7 subsecciones** dentro de Tienda:

```
TIENDA → Productos
├── Inventario       → Lista completa de productos con filtros y acciones
├── Crear Producto   → Formulario completo de creacion
├── Editar Producto  → Formulario completo de edicion (mismo componente)
├── Etiquetas        → Gestion de etiquetas/labels por producto
├── Variaciones      → Tamanos y precios por variante
├── Extras/Opciones  → Grupos de opciones con precios adicionales
├── Recomendados     → Productos relacionados/recomendados
├── Imagenes         → Galeria multi-imagen del producto
└── Stock            → Inventario y control de disponibilidad
```

### 2.2 ProductosSection (nuevo - pantalla principal)

**Archivo:** `src/pages/admin/sections/tienda/ProductosSection.tsx`

Esta es la pantalla principal que muestra la lista de todos los productos con acciones rapidas.

**Funcionalidades:**
- Lista de productos con tarjetas (imagen, nombre, precio, categoria, stock, estado)
- Busqueda por nombre (incluye busqueda por voz en espanol)
- Filtro por categoria
- Filtro por estado: Todos | Activos | Inactivos | En Promo | Bajo Stock
- Ordenar por: Nombre | Precio | Stock | Mas vendidos | Recientes
- Acciones por producto:
  - **Ver** → Abre preview del producto
  - **Editar** → Abre formulario completo
  - **Pausar/Activar** → Toggle `activo` (visible/invisible en tienda)
  - **Promo** → Toggle `es_promo` + precio anterior
  - **Eliminar** → Confirmacion + delete
- Boton "Crear Producto" → Abre formulario de creacion
- Importar/Exportar CSV
- Vista: Lista | Grid

**Campos visibles por producto en la lista:**
- Imagen principal (con badge de imagenes multiples)
- Nombre
- Categoria / Subcategoria
- Precio USD (con precio tachado si es promo)
- Stock (rojo si <= 3)
- Estado: Disponible | Agotado | En Reposicion | Inactivo
- Etiquetas: Nuevo | Promo | Mas Vendido | Envio Gratis

### 2.3 ProductoFormSection (nuevo - formulario completo)

**Archivo:** `src/pages/admin/sections/tienda/ProductoFormSection.tsx`

Formulario completo para crear/editar un producto. **Reemplaza** `ProductForm.tsx` y `EditProductForm.tsx`.

**Secciones del formulario (en orden):**

#### Seccion 1: Informacion Basica
- Nombre del producto (requerido)
- Descripcion corta (1 linea)
- Descripcion completa (textarea, 3 lineas)
- Categoria (select de categorias existentes)
- Subcategoria (select, depende de categoria)
- Precio USD (requerido, step 0.01)
- Precio anterior USD (para mostrar tachado en promo)

#### Seccion 2: Estado y Etiquetas
- **Activo/Inactivo** → Toggle principal (visible en tienda)
- **Disponibilidad** → Disponible | Agotado | En Reposicion
- **Etiquetas:**
  - Nuevo (badge verde)
  - En Oferta/Promo (badge tematico)
  - Mas Vendido (badge amber)
  - Delivery Gratis (badge cyan)

#### Seccion 3: Imagenes
- Galeria de imagenes (min 1, max 10)
- Subir archivo (compresion automatica a WEBP/JPG)
- URL directa
- Arrastrar para reordenar
- Eliminar imagen individual
- Preview de cada imagen

#### Seccion 4: Variaciones (Tamanos)
- Agregar variante de tamano (ej: Pequeña $5, Mediana $7, Grande $9)
- Cada variante: nombre, precio USD, descripcion opcional
- Eliminar variante
- Si no hay variaciones, el producto usa precio base

#### Seccion 5: Extras / Opciones
- Agregar grupo de opciones (ej: "Toppings", "Salsas", "Tamaño")
- Cada grupo tiene:
  - Nombre del grupo
  - Minimo de selecciones (0 = opcional)
  - Maximo de selecciones (1 = radio, >1 = checkbox)
  - Lista de opciones:
    - Nombre de opcion
    - Precio adicional USD
    - Activo/Inactivo
- Agregar/eliminar opciones dentro de cada grupo
- Agregar/eliminar grupos

#### Seccion 6: Productos Recomendados
- Seleccionar productos relacionados (multi-select con busqueda)
- Se muestran como "Tambien te puede gustar" en la tienda
- Maximo 6 recomendaciones

#### Seccion 7: Combos
- Seleccionar a que combos pertenece este producto (multi-select)
- Los combos aplican descuento adicional

#### Seccion 8: Info Adicional
- Tiempo estimado de preparacion (minutos)
- Calorias (opcional)
- Ingredientes (tags)
- Alergenos (multi-select de 14 opciones predefinidas)

#### Seccion 9: Stock
- Cantidad en stock
- Alerta de bajo stock (<= 5)
- Sin stock = automaticamente "Agotado"

**Botones de accion:**
- Guardar (crea o actualiza)
- Guardar y crear otro
- Cancelar
- Preview en vivo

### 2.4 EtiquetasSection (nuevo)

**Archivo:** `src/pages/admin/sections/tienda/EtiquetasSection.tsx`

Vista especializada para gestionar etiquetas/labels de productos.

**Funcionalidades:**
- Lista de productos agrupados por etiqueta
- **Productos Nuevos:** Todos con `es_nuevo = true`
- **En Oferta:** Todos con `es_promo = true`
- **Mas Vendidos:** Todos con `es_mas_vendido = true`
- **Envio Gratis:** Todos con `delivery_gratis = true`
- **Sin Etiqueta:** Productos sin ninguna etiqueta activa
- Acciones rapidas: Quitar/agregar etiqueta con un click
- Conteo por etiqueta

### 2.5 VariacionesSection (nuevo)

**Archivo:** `src/pages/admin/sections/tienda/VariacionesSection.tsx`

Gestion de variaciones/tamanos de productos.

**Funcionalidades:**
- Lista de productos que tienen variaciones
- Crear variacion: nombre (ej "Mediana"), precio, descripcion
- Editar variacion inline
- Eliminar variacion
- Duplicar variacion (copiar con precio modificado)
- Productos sin variaciones muestran precio fijo

### 2.6 ExtrasSection (nuevo - gestion global)

**Archivo:** `src/pages/admin/sections/config/ExtrasSection.tsx`

Gestion global de grupos de opciones/extras para productos.

**Funcionalidades:**
- Lista de grupos de opciones existentes
- Crear grupo: nombre, min_select, max_select
- Agregar opciones al grupo: nombre, precio, activo
- Editar/eliminar opciones
- Editar/eliminar grupos
- Asignar grupos a productos (multi-select)

### 2.7 RecomendadosSection (nuevo)

**Archivo:** `src/pages/admin/sections/tienda/RecomendadosSection.tsx`

Gestion de productos recomendados/relacionados.

**Funcionalidades:**
- Lista de productos con sus recomendaciones actuales
- Editar recomendaciones por producto (multi-select con busqueda)
- Vista de "Tambien te puede gustar" por producto
- Productos sin recomendaciones

### 2.8 ImagenesSection (nuevo - opcional)

**Archivo:** `src/pages/admin/sections/tienda/ImagenesSection.tsx`

Gestion centralizada de imagenes de productos.

**Funcionalidades:**
- Grid de todos los productos con sus imagenes
- Subir/reemplazar imagen por producto
- Comprimir automaticamente
- Verificar productos sin imagen
- Galeria de imagenes por producto

### 2.9 StockSection (nuevo)

**Archivo:** `src/pages/admin/sections/tienda/StockSection.tsx`

Control de inventario y stock.

**Funcionalidades:**
- Lista de productos con su stock actual
- Alertas de bajo stock (<= 5)
- Productos agotados (stock = 0)
- Actualizar stock inline
- Historial de cambios (si se implementa)
- Valor total del inventario
- Stock por categoria

---

## FASE 3: Modulo REPORTES

### 3.1 ResumenGeneralSection (nuevo)
**Migrar de DashboardSection.tsx:**
- KPIs: Ventas hoy, semana, mes
- Pedidos activos, total ordenes, unidades vendidas
- Ahorro en cupones
- Ingresos USD y Bs
- Comparativa mensual con crecimiento %

**Archivos:**
- Crear `src/pages/admin/sections/reports/ResumenGeneralSection.tsx`

### 3.2 VentasReportSection (nuevo)
- Filtro por rango de fechas (hoy, 7 dias, 30 dias, personalizado)
- Grafico de ventas diarias (line chart)
- Grafico de ventas semanales (bar chart)
- Grafico de ventas mensuales (bar chart)
- Tabla de pedidos por dia con totales
- Exportar a CSV
- Filtro por sede

**Archivos:**
- Crear `src/pages/admin/sections/reports/VentasReportSection.tsx`

### 3.3 ProductosReportSection (nuevo)
- Top 10 productos mas vendidos (tabla + bar chart)
- Productos con bajo stock (alerta)
- Productos sin stock (agotados)
- Valor total del inventario
- Productos por categoria (pie chart)
- Productos mas rentables

**Archivos:**
- Crear `src/pages/admin/sections/reports/ProductosReportSection.tsx`

### 3.4 AppReportSection (nuevo)
- Total de suscriptores push (`push_subscriptions`)
- Usuarios registrados vs guests
- Nuevos usuarios esta semana/mes
- Tasa de retencion (usuarios con 2+ pedidos)
- Usuarios activos (con pedido en ultimos 30 dias)

**Archivos:**
- Crear `src/pages/admin/sections/reports/AppReportSection.tsx`

### 3.5 EstadisticasSection (nuevo)
- Ticket promedio (USD)
- Tiempo promedio de entrega
- Pedidos por hora del dia (heat map)
- Metodo de pago mas usado
- Zonas de delivery mas activas
- Tasa de cancelacion
- Tasa de satisfaccion (reviews)

**Archivos:**
- Crear `src/pages/admin/sections/reports/EstadisticasSection.tsx`

---

## FASE 4: Modulo PEDIDOS

### 4.1 ComandasSection (renombrar/unificar)
**Fusionar OrdersSection + TrackingSection:**
- Vista Kanban por defecto (PC): Nuevos | En Preparacion | Listos | En Camino
- Vista Lista (movil)
- Vista Mapa (delivery)
- Filtros por estado con conteo
- Filtro por sede
- Exportar CSV
- Boton imprimir por pedido
- Sonido de nuevo pedido

**Archivos:**
- Crear `src/pages/admin/sections/pedidos/ComandasSection.tsx`
- Eliminar `OrdersSection.tsx` y `TrackingSection.tsx`

### 4.2 HistorialPedidosSection (nuevo)
- Lista de pedidos entregados y cancelados
- Filtro por rango de fechas
- Filtro por estado
- Busqueda por ID, cliente, telefono
- Vista detallada de cada pedido
- Exportar historial a CSV

**Archivos:**
- Crear `src/pages/admin/sections/pedidos/HistorialPedidosSection.tsx`

### 4.3 MapaDeliverySection (nuevo)
- Mapa Leaflet con pedidos activos de delivery
- Lista de pedidos al lado
- Seleccionar pedido para ver en mapa
- Avanzar estado desde aqui

**Archivos:**
- Crear `src/pages/admin/sections/pedidos/MapaDeliverySection.tsx`

---

## FASE 5: Modulo MARKETING

### 5.1 ClientesSection (mejorar)
- Lista de clientes registrados y guests
- Busqueda por nombre, telefono, email
- Enviar mensaje individual
- Ver historial de pedidos del cliente
- Exportar lista de clientes

### 5.2 MensajesSection (fusion)
**Fusionar ChatSection + NotificationsSection:**
- Centro de mensajes unificado
- Chat 1:1 con clientes
- Enviar broadcast a todos
- Enviar notificacion personal
- Vincular producto para promocion
- Subir imagenes
- Ver historial de conversaciones

### 5.3 PromocionesSection (mejorar)
- CRUD de promociones formales
- Toggle rapido de "es_promo" por producto
- Enviar promocion como push
- Programar envio
- Estadisticas de cada promocion

### 5.4 CuponesSection (mantener)
- CRUD de cupones
- Tipos: porcentaje, fijo, envio gratis

### 5.5 FidelizacionSection (mantener)
- Configuracion de puntos
- Tiers (Bronce, Plata, Oro)
- Catalogo de premios
- Historial de transacciones
- Ajuste manual de puntos

### 5.6 SegmentacionSection (migrar)
- Segmentos: VIP, alto valor, nuevo, recurrente, en riesgo, inactivo
- Recalcular segmentos
- Ver usuarios por segmento

### 5.7 AutomatizacionSection (migrar)
- Reglas de automatizacion (toggle on/off)
- Ver historial de ejecuciones

### 5.8 AnalyticsPushSection (migrar)
- Embudo de entrega push
- Grafico de 14 dias
- Tasa de clicks

---

## FASE 6: Modulo TIENDA (resto)

### 6.1 StoreGeneralSection (extraer)
- Nombre del sitio
- Mensaje de bienvenida
- Direccion fisica
- Telefono / WhatsApp
- Coordenadas GPS
- Estado abierto/cerrado

### 6.2 CategoriasSection (extraer)
- CRUD de categorias
- Subcategorias por categoria
- Imagen de categoria
- Orden de categorias

### 6.3 OfertasSection (nuevo)
**Separar de PromosSection:**
- Flash sales con countdown
- Productos en oferta con precio especial
- Crear oferta: producto, descuento %, fecha fin, cantidad maxima

### 6.4 CombosSection (mantener)
- CRUD de combos
- Seleccion de productos
- Descuento por combo

### 6.5 DeliverySection (extraer)
- Toggle envio gratis
- Costo por km
- Recogida en local
- Zonas de envio (CRUD)
- Envio nacional

### 6.6 PaymentsSection (extraer)
- 4 metodos de pago
- Toggle activar/desactivar
- Datos de pago
- Descuento por metodo
- Tasa de cambio USD/Bs

### 6.7 BannersSection (extraer)
- Hero banner
- Banners secundarios
- Reordenar
- Preview movil/desktop

---

## FASE 7: Modulo CONFIGURACION (solo admin)

### 7.1 PersonalizacionSection
- Logo principal, logo secundario, favicon
- Colores: primario, secundario, acento
- Tema: claro/oscuro/sistema
- Tipografia del sitio
- Textos de secciones
- Preview en vivo

### 7.2 PWASection
- Icono PWA
- Logo de splash screen
- Nombre de la app
- Color del tema
- Preview de splash e icono

### 7.3 SEOSection
- Meta title/description/keywords (Home)
- Meta title/description (Catalogo)
- JSON-LD schema

### 7.4 SucursalesSection
- Toggle multi-sucursal
- CRUD de sedes
- Crear credenciales de operador por sede

### 7.5 RolesSection
- CRUD de usuarios admin
- Roles: admin, operator, customer
- Asignacion de sede a operadores

### 7.6 SistemaSection
- Backup/Restore JSON
- Test de notificacion push
- Mantenimiento PWA (forzar actualizacion)
- Limpiar cache
- Webhook push config
- Reportes de errores
- Logs del sistema

### 7.7 ExtrasGlobalesSection
- Gestion global de grupos de opciones
- Asignar opciones a productos

### 7.8 FAQSection
- CRUD de preguntas frecuentes
- Reordenar

---

## FASE 8: Corregir Errores

| # | Error | Solucion |
|---|-------|----------|
| 1 | `window.prompt()` | Reemplazar por modal inline |
| 2 | `alert()` | Reemplazar por toast notifications |
| 3 | `confirm()` | Reemplazar por modal de confirmacion |
| 4 | IDs con `Date.now()` | Usar `crypto.randomUUID()` |
| 5 | `markAllAsRead` N+1 | Batch update en AppContext |
| 6 | Leaflet polling | Cargar como modulo |
| 7 | ImageField leak | Delete de archivo anterior |
| 8 | Status duplicado | Extraer a `statusUtils.ts` |

---

## FASE 9: Utilidades Compartidas

### 9.1 statusUtils.ts
```typescript
export type ComandaStatus = 'Nuevo' | 'En Preparacion' | 'Enviado';
export function getComandaStatus(status: string): ComandaStatus { ... }
export function sortOrdersByPriority(orders: Order[]): Order[] { ... }
export const STATUS_CONFIG = { ... };
```

### 9.2 Toast.tsx
- Componente reutilizable
- Tipos: success, error, warning, info
- Auto-dismiss 3 segundos
- Stack en esquina superior derecha

---

## Archivos a Crear (resumen)

| Modulo | Archivo | Descripcion |
|--------|---------|-------------|
| **Tienda/Productos** | `sections/tienda/ProductosSection.tsx` | Lista principal de productos |
| **Tienda/Productos** | `sections/tienda/ProductoFormSection.tsx` | Formulario crear/editar |
| **Tienda/Productos** | `sections/tienda/EtiquetasSection.tsx` | Gestion de etiquetas |
| **Tienda/Productos** | `sections/tienda/VariacionesSection.tsx` | Variaciones/tamanos |
| **Tienda/Productos** | `sections/tienda/RecomendadosSection.tsx` | Productos recomendados |
| **Tienda/Productos** | `sections/tienda/StockSection.tsx` | Control de inventario |
| **Tienda** | `sections/tienda/StoreGeneralSection.tsx` | General de tienda |
| **Tienda** | `sections/tienda/CategoriasSection.tsx` | Categorias |
| **Tienda** | `sections/tienda/OfertasSection.tsx` | Flash sales |
| **Tienda** | `sections/tienda/CombosSection.tsx` | Combos |
| **Tienda** | `sections/tienda/DeliverySection.tsx` | Delivery |
| **Tienda** | `sections/tienda/PaymentsSection.tsx` | Pagos |
| **Tienda** | `sections/tienda/BannersSection.tsx` | Banners |
| **Reportes** | `sections/reports/ResumenGeneralSection.tsx` | KPIs |
| **Reportes** | `sections/reports/VentasReportSection.tsx` | Ventas |
| **Reportes** | `sections/reports/ProductosReportSection.tsx` | Productos |
| **Reportes** | `sections/reports/AppReportSection.tsx` | App |
| **Reportes** | `sections/reports/EstadisticasSection.tsx` | Estadisticas |
| **Pedidos** | `sections/pedidos/ComandasSection.tsx` | Comandas Kanban |
| **Pedidos** | `sections/pedidos/HistorialPedidosSection.tsx` | Historial |
| **Pedidos** | `sections/pedidos/MapaDeliverySection.tsx` | Mapa |
| **Marketing** | `sections/marketing/ClientesSection.tsx` | Clientes |
| **Marketing** | `sections/marketing/MensajesSection.tsx` | Chat + notificaciones |
| **Marketing** | `sections/marketing/PromocionesSection.tsx` | Promociones |
| **Marketing** | `sections/marketing/CuponesSection.tsx` | Cupones |
| **Marketing** | `sections/marketing/FidelizacionSection.tsx` | Fidelizacion |
| **Marketing** | `sections/marketing/SegmentacionSection.tsx` | Segmentacion |
| **Marketing** | `sections/marketing/AutomatizacionSection.tsx` | Automatizacion |
| **Marketing** | `sections/marketing/AnalyticsPushSection.tsx` | Analytics |
| **Config** | `sections/config/PersonalizacionSection.tsx` | Colores/logo |
| **Config** | `sections/config/PWASection.tsx` | PWA |
| **Config** | `sections/config/SEOSection.tsx` | SEO |
| **Config** | `sections/config/SucursalesSection.tsx` | Sucursales |
| **Config** | `sections/config/RolesSection.tsx` | Roles |
| **Config** | `sections/config/SistemaSection.tsx` | Sistema |
| **Config** | `sections/config/ExtrasGlobalesSection.tsx` | Extras globales |
| **Config** | `sections/config/FAQSection.tsx` | FAQ |
| **Shared** | `utils/statusUtils.ts` | Utilidades |
| **Shared** | `components/Toast.tsx` | Toast |

---

## Archivos a Eliminar

| Archivo | Razon |
|---------|-------|
| `sections/TablesSection.tsx` | Mesas eliminadas |
| `sections/TrackingSection.tsx` | Fusionado en ComandasSection |
| `sections/DashboardSection.tsx` | Migrado a ResumenGeneralSection |
| `sections/SettingsSection.tsx` | Dividido en config/* |
| `sections/TiendaSection.tsx` | Dividido en tienda/* + config/* |
| `sections/MarketingSection.tsx` | Dividido en marketing/* |
| `sections/ChatSection.tsx` | Fusionado en MensajesSection |
| `sections/NotificationsSection.tsx` | Fusionado en MensajesSection |
| `sections/PromosSection.tsx` | Dividido en PromocionesSection + OfertasSection |
| `sections/InventorySection.tsx` | Reemplazado por ProductosSection |
| `components/ProductForm.tsx` | Reemplazado por ProductoFormSection |
| `components/ProductPreviewModal.tsx` | Integrado en ProductosSection |

---

## Orden de Ejecucion

```
FASE 1  → Eliminar Mesas (30 min)
   ↓
FASE 9  → Crear statusUtils.ts + Toast.tsx (45 min)
   ↓
FASE 2  → Modulo Productos completo (3-4 horas)
   ↓
FASE 8  → Corregir errores (1-2 horas)
   ↓
FASE 3  → Modulo Reportes (2-3 horas)
   ↓
FASE 4  → Modulo Pedidos (1-2 horas)
   ↓
FASE 5  → Modulo Marketing (2-3 horas)
   ↓
FASE 6  → Modulo Tienda resto (1-2 horas)
   ↓
FASE 7  → Modulo Configuracion (1-2 horas)
```

**Tiempo estimado total: 14-20 horas**

---

## Criterios de Aceptacion

1. El modulo Productos tiene: crear, editar, pausar, etiquetas, variaciones, extras, recomendados, imagenes, stock
2. El menu tiene 5 modulos: Reportes, Pedidos, Marketing, Tienda, Configuracion
3. Configuracion solo la ve el admin
4. Reportes muestra: ventas, productos, app, estadisticas
5. Pedidos tiene: comandas Kanban, historial, mapa
6. Marketing tiene: clientes, mensajes, promos, cupones, fidelizacion, segmentacion, automatizacion, analytics
7. Tienda tiene: general, productos, categorias, ofertas, combos, delivery, pagos, banners
8. No hay duplicacion de funcionalidades
9. Cada archivo tiene < 400 lineas
10. Se corrigen errores de alert/prompt/confirm
11. Sidebar con separadores visuales entre modulos
12. Bottom tabs movil: Reportes, Pedidos, Tienda, Mas
