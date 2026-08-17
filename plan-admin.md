# Plan de Rediseño Admin + Fidelización + Multi-Tiendas

## Visión General
Transformar el admin en app nativa iOS-like, agregar sistema de fidelización por puntos,
mejorar multi-tiendas, y que clientes logueados no re-ingresen datos en checkout.

**IMPORTANTE:** No tocar la lógica de notificaciones push existente.
Los archivos `sw-push.js`, `functions/api/push-notify.ts`,
`functions/api/register-subscription.ts`, y la lógica de suscripción
en `AppContext.tsx` se mantienen intactos.

---

## FASE 1: Expandir Tipos — `src/types/store.ts`

### 1.1 Nuevo tipo LoyaltyConfig

```typescript
export interface LoyaltyConfig {
  enabled: boolean;
  points_per_dollar: number;
  min_order_for_points: number;
  redemption_rate: number;
  max_discount_percent: number;
  welcome_bonus: number;
  bonus_actions: {
    daily_login: number;
    first_order: number;
    review: number;
    referral: number;
  };
  tiers: LoyaltyTier[];
}

export interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  multiplier: number;
  benefits: string[];
  color: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  type: 'earn' | 'redeem' | 'bonus' | 'adjustment' | 'expire';
  points: number;
  description: string;
  order_id?: string;
  sede_id?: string;
  created_at: string;
  expires_at?: string;
}
```

### 1.2 Expandir AppUser

```typescript
export interface AppUser {
  // ... campos existentes sin cambios ...
  loyalty_points?: number;
  loyalty_lifetime_points?: number;
  loyalty_tier_id?: string;
  sede_preferida_id?: string;
}
```

### 1.3 Expandir Sede

```typescript
export interface Sede {
  // ... campos existentes sin cambios ...
  whatsapp_numero?: string;
  horario_detallado?: SedeHorario;
  esta_abierta_manual?: boolean;
  imagen_url?: string;
}

export interface SedeHorario {
  lunes?: { open: string; close: string };
  martes?: { open: string; close: string };
  miercoles?: { open: string; close: string };
  jueves?: { open: string; close: string };
  viernes?: { open: string; close: string };
  sabado?: { open: string; close: string };
  domingo?: { open: string; close: string };
}
```

### 1.4 Expandir StoreConfig

```typescript
export interface StoreConfig {
  // ... campos existentes se mantienen ...

  // Fidelización
  loyalty?: LoyaltyConfig;

  // SEO por página
  seo_home_title?: string;
  seo_home_description?: string;
  seo_home_keywords?: string;
  seo_catalog_title?: string;
  seo_catalog_description?: string;

  // Textos del Home
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  section_promos_title?: string;
  section_new_title?: string;
  section_bestseller_title?: string;
  section_rewards_title?: string;
  section_rewards_description?: string;

  // Footer
  footer_text?: string;
  footer_copyright?: string;

  // Redes sociales
  instagram_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  youtube_url?: string;

  // Tipografía display
  font_display?: string;

  // Schema JSON-LD
  jsonld_type?: string;
  jsonld_priceRange?: string;
  jsonld_servesCuisine?: string[];
}
```

---

## FASE 2: Defaults y Estado — `src/store/AppContext.tsx`

### 2.1 Default loyalty en DEFAULT_CONFIG

```typescript
loyalty: {
  enabled: false,
  points_per_dollar: 1,
  min_order_for_points: 5,
  redemption_rate: 100,
  max_discount_percent: 30,
  welcome_bonus: 50,
  bonus_actions: { daily_login: 5, first_order: 25, review: 10, referral: 100 },
  tiers: [
    { id: 'tier-bronze', name: 'Bronce', min_points: 0, multiplier: 1,
      benefits: ['Puntos base'], color: '#CD7F32' },
    { id: 'tier-silver', name: 'Plata', min_points: 500, multiplier: 1.25,
      benefits: ['25% más puntos'], color: '#8E8E93' },
    { id: 'tier-gold', name: 'Oro', min_points: 1500, multiplier: 1.5,
      benefits: ['50% más puntos', 'Envío gratis'], color: '#FF9500' },
  ],
},
```

### 2.2 Funciones nuevas (agregar sin modificar existentes)

```typescript
const earnLoyaltyPoints = async (userId, orderId, amountUsd, sedeId?) => { ... };
const redeemLoyaltyPoints = async (userId, pointsToRedeem, orderId?) => { ... };
const getUserLoyaltyPoints = (userId) => { ... };
const getUserLoyaltyTier = (userId) => { ... };
const adjustUserPoints = async (userId, points, reason) => { ... };
const getLoyaltyTransactions = (userId) => { ... };
```

### 2.3 NO MODIFICAR (intocable)

- Función `addNotification()` — sin cambios
- Función `syncPushSubscription()` — sin cambios
- Función `registerNotificationClick()` — sin cambios
- Estado de `notifications` — sin cambios
- Canal Supabase de notificaciones — sin cambios
- Todo `sw-push.js` y workers

---

## FASE 3: CSS iOS-like — `src/index.css`

### 3.1 Variables nuevas (agregar al :root)

```css
:root {
  /* ... variables pop existentes se mantienen ... */
  --ios-bg: #F2F2F7;
  --ios-card: #FFFFFF;
  --ios-border: #E5E5EA;
  --ios-text: #1C1C1E;
  --ios-text-secondary: #8E8E93;
  --ios-separator: #C6C6C8;
  --ios-success: #34C759;
  --ios-error: #FF3B30;
  --ios-warning: #FF9500;
  --ios-radius: 16px;
  --ios-radius-sm: 12px;
}
```

### 3.2 Clases nuevas

```css
.admin-bg { background: var(--ios-bg); }
.admin-card {
  background: var(--ios-card);
  border-radius: var(--ios-radius);
  border: 1px solid var(--ios-border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.admin-card-sm { border-radius: var(--ios-radius-sm); }
.admin-header {
  background: var(--ios-card);
  border-bottom: 1px solid var(--ios-border);
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
}
.admin-bottom-tabs {
  background: var(--ios-card);
  border-top: 1px solid var(--ios-border);
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom);
}
.admin-section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--ios-text);
  letter-spacing: -0.3px;
}
.admin-input {
  background: var(--ios-card);
  border: 1px solid var(--ios-border);
  border-radius: var(--ios-radius-sm);
  padding: 12px 16px;
  font-size: 16px;
  color: var(--ios-text);
  width: 100%;
  box-sizing: border-box;
}
.admin-input:focus { outline: none; border-color: var(--theme-color, #007AFF); }
.admin-btn {
  background: var(--theme-color, #007AFF);
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 24px;
  border-radius: var(--ios-radius-sm);
  border: none;
  width: 100%;
  min-height: 44px;
  cursor: pointer;
}
.admin-btn-secondary {
  background: transparent;
  color: var(--theme-color, #007AFF);
  border: 1px solid var(--ios-border);
}
.admin-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ios-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.touch-target { min-height: 44px; min-width: 44px; }
.bottom-sheet-handle {
  width: 36px; height: 5px;
  background: var(--ios-separator);
  border-radius: 3px;
  margin: 8px auto;
}
.bottom-sheet {
  border-radius: 16px 16px 0 0;
  max-height: 85vh;
  overflow-y: auto;
}
```

---

## FASE 4: Nuevo Admin Layout — `src/pages/admin/index.tsx`

### 4.1 Mobile (≤768px) — Bottom tabs

```
┌─────────────────────────────┐
│ Header: [Logo] [Título]     │  56px
├─────────────────────────────┤
│                             │
│   Contenido de la sección   │  scroll
│                             │
├─────────────────────────────┤
│ 📊  🛒  🍽️  ⋯  ⚙️         │  64px
│Panel Ped Men Más Config     │
└─────────────────────────────┘
```

### 4.2 Bottom Tabs principales

| Tab | Icono | Sección | Badge |
|-----|-------|---------|-------|
| Panel | BarChart3 | reports | - |
| Pedidos | ShoppingBag | orders | Pedidos activos |
| Menú | Utensils | inventory | - |
| Más | LayoutGrid | Abre sheet | - |
| Config | Settings | settings | - |

### 4.3 Sheet "Más"

- Fidelización (Award)
- Clientes (Users)
- Mensajes (MessageSquare)
- Avisos (Bell)
- Contenido (FileText)
- Ofertas (Megaphone)
- Combos (Package)
- Mesas (Grid, condicional)
- Cupones (Ticket)
- ← Volver a la tienda

### 4.4 Desktop (>768px) — Sidebar

Sidebar 240px con los mismos módulos agrupados.

### 4.5 Nombres de secciones

```typescript
const ADMIN_SECTIONS = [
  { id: 'reports',      label: 'Panel',          icon: BarChart3,    group: 'principal' },
  { id: 'orders',       label: 'Pedidos',        icon: ShoppingBag,  group: 'principal' },
  { id: 'inventory',    label: 'Menú',           icon: Utensils,     group: 'principal' },
  { id: 'promos',       label: 'Ofertas',        icon: Megaphone,    group: 'principal' },
  { id: 'combos',       label: 'Combos',         icon: Package,      group: 'principal' },
  { id: 'tables',       label: 'Mesas',          icon: Grid,         group: 'principal' },
  { id: 'loyalty',      label: 'Fidelización',   icon: Award,        group: 'clientes', isNew: true },
  { id: 'customers',    label: 'Clientes',       icon: Users,        group: 'clientes' },
  { id: 'chat',         label: 'Mensajes',       icon: MessageSquare,group: 'clientes' },
  { id: 'notifications',label: 'Avisos',         icon: Bell,         group: 'comunicacion' },
  { id: 'content',      label: 'Contenido',      icon: FileText,     group: 'contenido', isNew: true },
  { id: 'coupons',      label: 'Cupones',        icon: Ticket,       group: 'contenido' },
  { id: 'settings',     label: 'Configuración',  icon: Settings,     group: 'sistema' },
];
```

### 4.6 Lazy imports nuevos

```typescript
const LoyaltySection = lazy(() => import('./sections/LoyaltySection'));
const ContentSection = lazy(() => import('./sections/ContentSection'));
```

### 4.7 Estilo (sin gradientes)

- Fondo: `bg-[#F2F2F7]`
- Header: `bg-white border-b border-[#E5E5EA]`
- Sidebar: `bg-white border-r border-[#E5E5EA]`
- Active item: `bg-[themeColor]` opacidad 10%, borde izquierdo 3px sólido
- Cards: `bg-white rounded-2xl border border-[#E5E5EA] shadow-[0_1px_3px_rgba(0,0,0,0.04)]`

---

## FASE 5: LoyaltySection — `src/pages/admin/sections/LoyaltySection.tsx` (CREAR)

### Sub-tabs: Configuración | Niveles | Historial | Ajustar

### Configuración
- Toggle activar/desactivar
- Inputs: puntos por $1, pedido mínimo, tasa canje, descuento máximo
- Inputs: bonos (bienvenida, login, primera compra, reseña, referido)

### Niveles
- Lista de tiers: nombre, puntos, multiplicador, beneficios, color
- CRUD completo

### Historial
- Tabla: usuario, tipo, puntos, fecha
- Filtros y exportar CSV

### Ajustar
- Buscar usuario por teléfono
- Mostrar puntos actuales y nivel
- Input cantidad (+/-) y razón

---

## FASE 6: ContentSection — `src/pages/admin/sections/ContentSection.tsx` (CREAR)

### Sub-tabs: Identidad | Colores | Banners | Textos | SEO | FAQ | Redes

### Identidad
- Logo, favicon, nombre del sitio, mensaje bienvenida

### Colores
- Primario, secundario, acento con color pickers

### Banners
- Upload JPG/PNG/GIF o URL, textos overlay, activar/desactivar, reordenar

### Textos
- H1, subtítulo, CTA, títulos de secciones

### SEO
- Title, description, keywords por página (home, catálogo, producto)
- Schema JSON-LD editable

### FAQ
- CRUD de preguntas/respuestas (mover desde Settings)

### Redes
- Instagram, Twitter, Facebook, TikTok, YouTube URLs

---

## FASE 7: SedeForm Mejorado — `src/pages/admin/components/SedeForm.tsx`

### Campos nuevos
- WhatsApp número (separado del teléfono)
- Imagen de la sede (upload)
- Horario detallado por día (7 días, open/close)
- Auto-reply WhatsApp (toggle + mensaje)
- Botón "Copiar horario a todos"

### Función isSedeOpen()

```typescript
const isSedeOpen = (sede: Sede): boolean => {
  if (sede.esta_abierta_manual !== undefined) return sede.esta_abierta_manual;
  if (!sede.horario_detallado) return sede.activa;
  const now = new Date();
  const days = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  const today = days[now.getDay()];
  const schedule = sede.horario_detallado[today];
  if (!schedule) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const [oH, oM] = schedule.open.split(':').map(Number);
  const [cH, cM] = schedule.close.split(':').map(Number);
  return mins >= (oH*60+oM) && mins < (cH*60+cM);
};
```

---

## FASE 8: SEO Dinámico — `src/components/SEOHead.tsx`

- Title home: `config.seo_home_title || default`
- Description: `config.seo_home_description || default`
- Keywords: `config.seo_home_keywords || default`
- Template producto: `"{name} | {site_name}"`
- JSON-LD editable desde config
- GEO tags: `geo.region`, `geo.placename`
- NO tocar IndexedDB de manifest dinámico
- NO tocar service worker messages

---

## FASE 9: Home Editable — `src/pages/Home.tsx`

- H1: `config.hero_title || 'Pide Tu Comida Favorita'`
- Subtítulo: `config.hero_subtitle`
- CTA: `config.hero_cta_text`
- Títulos secciones: `config.section_*_title`
- FAQ visible si `config.faq_items?.length > 0`

---

## FASE 10: Mover FAQ — SettingsSection → ContentSection

### SettingsSection.tsx
- Eliminar sub-tab FAQ del array SETTINGS_TABS
- Eliminar estados y funciones de FAQ
- Eliminar render de FAQ

### ContentSection.tsx
- Mover CRUD de FAQ aquí

---

## FASE 11: Checkout Inteligente — `src/pages/Checkout.tsx`

### 11.1 Recordar datos de delivery para usuarios logueados

Cuando un usuario logueado elige delivery, guardar en localStorage:
- `trv_last_shipping_method`: 'mapa' | 'recogida' | 'zonas'
- `trv_last_shipping_lat`: número
- `trv_last_shipping_lng`: número
- `trv_last_shipping_zone`: string
- `trv_last_sede_id`: string

Al abrir checkout, si el usuario está logueado:
- Restaurar `shippingMethod` desde localStorage
- Restaurar coordenadas y zona desde localStorage
- Si era 'recogida', no pedir ubicación
- Si era 'mapa', mostrar mapa con ubicación previa marcada
- Solo pedir nueva ubicación si el usuario cambia de método o es la primera vez

### 11.2 Lógica de inicialización

```typescript
// Al montar el checkout
useEffect(() => {
  if (currentUser) {
    const savedMethod = localStorage.getItem('trv_last_shipping_method');
    const savedLat = localStorage.getItem('trv_last_shipping_lat');
    const savedLng = localStorage.getItem('trv_last_shipping_lng');
    const savedZone = localStorage.getItem('trv_last_shipping_zone');
    const savedSede = localStorage.getItem('trv_last_sede_id');

    if (savedMethod) {
      setShippingMethod(savedMethod as any);
      if (savedLat && savedLng) {
        setShippingLat(parseFloat(savedLat));
        setShippingLng(parseFloat(savedLng));
      }
      if (savedZone) setShippingZone(savedZone);
      if (savedSede) setSelectedSedeId(savedSede);
    }
  }
}, [currentUser?.id]);

// Al enviar exitosamente
if (created && currentUser) {
  localStorage.setItem('trv_last_shipping_method', shippingMethod);
  localStorage.setItem('trv_last_shipping_lat', String(shippingLat));
  localStorage.setItem('trv_last_shipping_lng', String(shippingLng));
  localStorage.setItem('trv_last_shipping_zone', shippingZone);
  localStorage.setItem('trv_last_sede_id', selectedSedeId);
}
```

### 11.3 Canje de puntos en checkout

- Si usuario tiene puntos y loyalty.enabled, mostrar opción de canje
- Calcular descuento respetando max_discount_percent
- Al completar: `redeemLoyaltyPoints()` y `earnLoyaltyPoints()`

---

## FASE 12: UserProfile con Recompensas — `src/pages/UserProfile.tsx`

### Nuevo sub-tab "Recompensas"
- Puntos disponibles
- Nivel actual (tier con color)
- Próximo nivel y puntos faltantes
- Historial de transacciones
- Botón "Canjear"

---

## FASE 13: Navigation — `src/components/Navigation.tsx`

- WhatsApp: usar `sede.whatsapp_numero || sede.telefono`

---

## ARCHIVOS NO MODIFICADOS (INTOCABLES)

- `public/sw-push.js`
- `functions/api/push-notify.ts`
- `functions/api/register-subscription.ts`
- `src/store/AppContext.tsx` — funciones `addNotification`, `syncPushSubscription`,
  `registerNotificationClick`, estado `notifications`, canal Supabase
- `src/pages/admin/sections/NotificationsSection.tsx`
- `src/pages/admin/sections/ChatSection.tsx`

---

## RESUMEN DE ARCHIVOS

| # | Archivo | Acción |
|---|---------|--------|
| 1 | `src/types/store.ts` | Editar |
| 2 | `src/store/AppContext.tsx` | Editar (solo agregar funciones loyalty + defaults) |
| 3 | `src/index.css` | Editar |
| 4 | `src/pages/admin/index.tsx` | Reescribir |
| 5 | `src/pages/admin/sections/LoyaltySection.tsx` | Crear |
| 6 | `src/pages/admin/sections/ContentSection.tsx` | Crear |
| 7 | `src/pages/admin/components/SedeForm.tsx` | Editar |
| 8 | `src/components/SEOHead.tsx` | Editar |
| 9 | `src/pages/Home.tsx` | Editar |
| 10 | `src/pages/admin/sections/SettingsSection.tsx` | Editar |
| 11 | `src/pages/Checkout.tsx` | Editar |
| 12 | `src/pages/UserProfile.tsx` | Editar |
| 13 | `src/components/Navigation.tsx` | Editar |

---

## ORDEN DE EJECUCIÓN

1. types/store.ts
2. AppContext.tsx (defaults + funciones loyalty)
3. index.css (variables iOS + clases)
4. pages/admin/index.tsx (nuevo layout)
5. pages/admin/sections/LoyaltySection.tsx
6. pages/admin/sections/ContentSection.tsx
7. pages/admin/components/SedeForm.tsx
8. components/SEOHead.tsx
9. pages/Home.tsx
10. pages/admin/sections/SettingsSection.tsx
11. pages/Checkout.tsx
12. pages/UserProfile.tsx
13. components/Navigation.tsx
