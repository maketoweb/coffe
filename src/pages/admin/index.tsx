import React, { Suspense, lazy, useState, useCallback } from 'react';
import { useApp } from '../../store/AppContext';
import { useAdminStore } from '../../store/stores/adminStore';
import { useOrders } from './hooks/useOrders';
import { Order, FoodItem, AppUser } from '../../types/store';
import {
  BarChart3, ShoppingBag, Utensils, Grid, User, Ticket, Settings,
  X, Bell, MessageSquare, Megaphone, Package, Award,
  LayoutGrid, ChevronLeft, MapPin, Shield, Store
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';
import { EditProductForm } from '../../components/EditProductForm';

const DashboardSection = lazy(() => import('./sections/DashboardSection'));
const OrdersSection = lazy(() => import('./sections/OrdersSection'));
const InventorySection = lazy(() => import('./sections/InventorySection'));
const TablesSection = lazy(() => import('./sections/TablesSection'));
const CustomersSection = lazy(() => import('./sections/CustomersSection'));
const CouponsSection = lazy(() => import('./sections/CouponsSection'));
const SettingsSection = lazy(() => import('./sections/SettingsSection'));
const NotificationsSection = lazy(() => import('./sections/NotificationsSection'));
const ChatSection = lazy(() => import('./sections/ChatSection'));
const PromosSection = lazy(() => import('./sections/PromosSection'));
const CombosSection = lazy(() => import('./sections/CombosSection'));
const LoyaltySection = lazy(() => import('./sections/LoyaltySection'));
const TiendaSection = lazy(() => import('./sections/TiendaSection'));
const TrackingSection = lazy(() => import('./sections/TrackingSection'));
const RolesSection = lazy(() => import('./sections/RolesSection'));
const MarketingSection = lazy(() => import('./sections/MarketingSection'));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--ios-border)', borderTopColor: 'transparent' }} />
      <p className="text-sm" style={{ color: 'var(--ios-text-secondary)' }}>Cargando...</p>
    </div>
  </div>
);

interface AdminIndexProps {
  setTab: (tab: 'home' | 'catalog' | 'cart' | 'admin') => void;
}

const ALL_SECTIONS = [
  { id: 'reports',      label: 'Panel',          icon: BarChart3,        group: 'principal' },
  { id: 'orders',       label: 'Pedidos',        icon: ShoppingBag,      group: 'principal' },
  { id: 'tracking',     label: 'Rastreo',        icon: MapPin,           group: 'principal' },
  { id: 'inventory',    label: 'Menú',           icon: Utensils,         group: 'principal' },
  { id: 'promos',       label: 'Ofertas',        icon: Megaphone,        group: 'principal' },
  { id: 'combos',       label: 'Combos',         icon: Package,          group: 'principal' },
  { id: 'tables',       label: 'Mesas',          icon: Grid,             group: 'principal' },
  { id: 'loyalty',      label: 'Fidelización',   icon: Award,            group: 'clientes' },
  { id: 'customers',    label: 'Clientes',       icon: User,             group: 'clientes' },
  { id: 'chat',         label: 'Mensajes',       icon: MessageSquare,    group: 'clientes' },
  { id: 'notifications',label: 'Avisos',         icon: Bell,             group: 'comunicacion' },
  { id: 'marketing',    label: 'Marketing',      icon: Megaphone,        group: 'comunicacion' },
  { id: 'tienda',       label: 'Tienda',         icon: Store,            group: 'contenido', adminOnly: true },
  { id: 'coupons',      label: 'Cupones',        icon: Ticket,           group: 'contenido' },
  { id: 'roles',        label: 'Roles',          icon: Shield,           group: 'sistema', adminOnly: true },
  { id: 'settings',     label: 'Configuración',  icon: Settings,         group: 'sistema', adminOnly: true },
];

const BOTTOM_TABS = [
  { id: 'reports', label: 'Panel',   icon: BarChart3 },
  { id: 'orders',  label: 'Pedidos', icon: ShoppingBag },
  { id: 'inventory', label: 'Menú',  icon: Utensils },
  { id: '__more',  label: 'Más',     icon: LayoutGrid },
  { id: 'settings',label: 'Config',  icon: Settings },
];

export default function AdminIndex({ setTab }: AdminIndexProps) {
  const { config, updateFoodItem, userRole, adminScopeSedeId } = useApp();
  const { activeSection, setActiveSection } = useAdminStore();
  const { advanceStatus } = useOrders();
  const themeColor = config.theme_color || '#007AFF';
  const isAdmin = userRole === 'admin';
  // scopeSedeId: sucursal a la que está limitado el operador; '' = admin ve todas.
  const scopeSedeId = isAdmin ? '' : (adminScopeSedeId || '');

  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [openOrderDetailIds, setOpenOrderDetailIds] = useState<string[]>([]);
  const [editingOrderItems, setEditingOrderItems] = useState<Order | null>(null);
  const [openEditor, setOpenEditor] = useState<FoodItem | null>(null);
  const [, setSendMsgTitle] = useState('');
  const [, setSendMsgBody] = useState('');
  const [, setSendMsgModal] = useState<{ user: AppUser } | null>(null);
  const [, setPrintingOrder] = useState<Order | null>(null);

  const toggleOrderDetail = useCallback((orderId: string) => {
    setOpenOrderDetailIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  }, []);

  const handleStatusAdvance = useCallback((order: Order) => {
    advanceStatus(order);
  }, [advanceStatus]);

  const visibleSections = ALL_SECTIONS
    .filter(s => s.id !== 'tables' || config.tiene_mesas)
    .filter(s => isAdmin || !s.adminOnly);
  const sectionLabel = visibleSections.find(s => s.id === activeSection)?.label || 'Panel';

  const moreSections = visibleSections.filter(s =>
    !BOTTOM_TABS.some(t => t.id === s.id)
  );

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId as Parameters<typeof setActiveSection>[0]);
    setShowMoreSheet(false);
    setSidebarOpen(false);
  };

  const renderSection = () => {
    // Si es operador y trata de acceder a una sección admin-only, redirigir a pedidos
    if (!isAdmin && (activeSection === 'settings' || activeSection === 'roles')) {
      return <OrdersSection
        openOrderDetailIds={openOrderDetailIds}
        toggleOrderDetail={toggleOrderDetail}
        editingOrderItems={editingOrderItems}
        setEditingOrderItems={setEditingOrderItems}
        setPrintingOrder={setPrintingOrder}
        handleStatusAdvance={handleStatusAdvance}
        scopeSedeId={scopeSedeId}
      />;
    }

    switch (activeSection) {
      case 'reports': return <DashboardSection scopeSedeId={scopeSedeId} />;
      case 'orders': return (
        <OrdersSection
          openOrderDetailIds={openOrderDetailIds}
          toggleOrderDetail={toggleOrderDetail}
          editingOrderItems={editingOrderItems}
          setEditingOrderItems={setEditingOrderItems}
          setPrintingOrder={setPrintingOrder}
          handleStatusAdvance={handleStatusAdvance}
          scopeSedeId={scopeSedeId}
        />
      );
      case 'inventory': return <InventorySection openEditor={setOpenEditor} config={config} />;
      case 'tables': return (
        <TablesSection
          openOrderDetailIds={openOrderDetailIds}
          toggleOrderDetail={toggleOrderDetail}
        />
      );
      case 'customers': return (
        <CustomersSection
          setSendMsgTitle={setSendMsgTitle}
          setSendMsgBody={setSendMsgBody}
          setSendMsgModal={setSendMsgModal}
        />
      );
      case 'coupons': return <CouponsSection />;
      case 'settings': return <SettingsSection setTab={setTab} />;
      case 'notifications': return <NotificationsSection />;
      case 'chat': return <ChatSection />;
      case 'promos': return <PromosSection />;
      case 'combos': return <CombosSection />;
      case 'tracking': return <TrackingSection scopeSedeId={scopeSedeId} />;
      case 'loyalty': return <LoyaltySection />;
      case 'tienda': return <TiendaSection />;
      case 'marketing': return <MarketingSection />;
      case 'roles': return <RolesSection />;
      default: return <DashboardSection />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--ios-bg)' }}>
      <SEOHead title={`Admin - ${config.site_nombre || 'Panel'}`} type="admin" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0" style={{ background: 'var(--ios-card)', borderRight: '1px solid var(--ios-border)' }}>
        <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--ios-border)' }}>
          {config.logo_url ? (
            <img src={config.logo_url} alt={config.site_nombre || 'Logo'} className="h-8 w-auto max-w-[140px] object-contain" />
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: themeColor }}>
                {config.site_nombre?.[0] || 'A'}
              </div>
              <span className="font-bold text-base truncate" style={{ color: 'var(--ios-text)' }}>{config.site_nombre || 'Admin'}</span>
            </>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleSections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer touch-target"
                style={{
                  background: isActive ? `${themeColor}15` : 'transparent',
                  color: isActive ? themeColor : 'var(--ios-text-secondary)',
                  borderLeft: isActive ? `3px solid ${themeColor}` : '3px solid transparent',
                }}
              >
                <Icon size={20} />
                {section.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3" style={{ borderTop: '1px solid var(--ios-border)' }}>
          <button onClick={() => setTab('home')} className="w-full text-sm py-3 transition-colors cursor-pointer flex items-center justify-center gap-2" style={{ color: 'var(--ios-text-secondary)' }}>
            <ChevronLeft size={16} /> Volver a la tienda
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {/* Header */}
        <header className="admin-header shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl cursor-pointer" style={{ color: 'var(--ios-text)' }}>
            <BarChart3 size={22} />
          </button>
          {config.logo_url ? (
            <img src={config.logo_url} alt={config.site_nombre || 'Logo'} className="h-7 w-auto max-w-[100px] object-contain ml-2" />
          ) : (
            <h1 className="admin-section-title ml-2">{sectionLabel}</h1>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{ padding: '16px', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
          <Suspense fallback={<SectionLoader />}>
            {renderSection()}
          </Suspense>
        </main>

        {/* Mobile Bottom Tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 admin-bottom-tabs">
          {BOTTOM_TABS.map(tab => {
            const Icon = tab.icon;
            const isMore = tab.id === '__more';
            const isActive = isMore ? showMoreSheet : activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isMore) {
                    setShowMoreSheet(true);
                  } else {
                    handleSectionChange(tab.id);
                  }
                }}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 cursor-pointer touch-target"
                style={{ color: isActive ? themeColor : 'var(--ios-text-secondary)' }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Product Modal */}
      {openEditor && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <EditProductForm
            part={openEditor}
            onSubmit={(updated) => {
              updateFoodItem(updated.id, updated);
              setOpenEditor(null);
            }}
            onClose={() => setOpenEditor(null)}
          />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 flex flex-col" style={{ background: 'var(--ios-card)' }}>
            <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--ios-border)' }}>
              {config.logo_url ? (
                <img src={config.logo_url} alt={config.site_nombre || 'Logo'} className="h-8 w-auto max-w-[120px] object-contain" />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: themeColor }}>
                    {config.site_nombre?.[0] || 'A'}
                  </div>
                  <span className="font-bold text-base truncate" style={{ color: 'var(--ios-text)' }}>{config.site_nombre || 'Admin'}</span>
                </>
              )}
              <button onClick={() => setSidebarOpen(false)} className="ml-auto p-2 rounded-xl" style={{ color: 'var(--ios-text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {visibleSections.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer touch-target"
                    style={{
                      background: isActive ? `${themeColor}15` : 'transparent',
                      color: isActive ? themeColor : 'var(--ios-text-secondary)',
                      borderLeft: isActive ? `3px solid ${themeColor}` : '3px solid transparent',
                    }}
                  >
                    <Icon size={20} />
                    {section.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-3" style={{ borderTop: '1px solid var(--ios-border)' }}>
              <button onClick={() => setTab('home')} className="w-full text-sm py-3 flex items-center justify-center gap-2" style={{ color: 'var(--ios-text-secondary)' }}>
                <ChevronLeft size={16} /> Volver a la tienda
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* More Sections Bottom Sheet */}
      {showMoreSheet && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowMoreSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 bottom-sheet" style={{ background: 'var(--ios-card)' }}>
            <div className="bottom-sheet-handle" />
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--ios-text)' }}>Más opciones</h3>
              <div className="space-y-1">
                {moreSections.map(section => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer touch-target"
                      style={{
                        background: isActive ? `${themeColor}15` : 'transparent',
                        color: isActive ? themeColor : 'var(--ios-text)',
                      }}
                    >
                      <Icon size={20} />
                      {section.label}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => { setTab('home'); setShowMoreSheet(false); }}
                className="w-full mt-4 py-3.5 rounded-xl text-sm font-semibold cursor-pointer touch-target"
                style={{ color: 'var(--ios-text-secondary)', borderTop: '1px solid var(--ios-border)' }}
              >
                ← Volver a la tienda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
