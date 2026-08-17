import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { supabase } from '../../../store/supabaseClient';
import { DeliveryZone, Sede } from '../../../types/store';
import ImageField from '../components/ImageField';
import {
  Store, Image, Smartphone, Type, FileText, MapPin, CreditCard,
  Grid, Search, Share2, Building2, AlertTriangle,
  Plus, Trash2, X, Check, ChevronUp, ChevronDown, Eye, EyeOff,
  MessageSquare, ExternalLink, Monitor, KeyRound
} from 'lucide-react';

const TiendaSection: React.FC = () => {
  const { config, updateConfig, currentUser, syncPushSubscription } = useApp();
  const themeColor = config.theme_color || '#007AFF';

  const [activeTab, setActiveTab] = useState<
    'general' | 'logos' | 'pwa' | 'banners' | 'typography' | 'texts' |
    'delivery' | 'payments' | 'categories' | 'seo' | 'social' | 'sedes'
  >('general');

  // Banner state
  const [bannerPreviewMode, setBannerPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Delivery zone state
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCost, setNewZoneCost] = useState(0);
  const [newZoneMinKm, setNewZoneMinKm] = useState(0);
  const [newZoneMaxKm, setNewZoneMaxKm] = useState(0);

  // Sedes state
  const [sedeForm, setSedeForm] = useState({ nombre: '', telefono: '', whatsapp_numero: '', direccion: '', horario: '', lat: 0, lng: 0 });
  const [editingSedeId, setEditingSedeId] = useState<string | null>(null);

  // Credencial de sucursal state
  const [credSedeId, setCredSedeId] = useState<string | null>(null);
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credSaving, setCredSaving] = useState(false);
  const [showCredPassword, setShowCredPassword] = useState(false);

  const handleCreateSucursalCredential = async () => {
    if (!credSedeId || !credEmail.trim() || !credPassword.trim()) {
      alert('Debes indicar el correo y la contraseña de acceso.');
      return;
    }
    if (credPassword.trim().length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setCredSaving(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credEmail.trim().toLowerCase(),
        password: credPassword.trim(),
        options: { data: { nombre: (config.sedes || []).find(s => s.id === credSedeId)?.nombre || '', role: 'operator', sede_id: credSedeId } }
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');
      const { error: dbError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          email: credEmail.trim().toLowerCase(),
          nombre: (config.sedes || []).find(s => s.id === credSedeId)?.nombre || credEmail.trim(),
          role: 'operator',
          active: true,
          sede_id: credSedeId
        });
      if (dbError) throw dbError;
      alert('✅ Acceso de sucursal creado. El operador podrá entrar con ese correo y clave y verá solo esa sucursal.');
      setCredSedeId(null);
      setCredEmail('');
      setCredPassword('');
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Error desconocido'));
    } finally {
      setCredSaving(false);
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Store },
    { id: 'logos' as const, label: 'Logos', icon: Image },
    { id: 'pwa' as const, label: 'PWA', icon: Smartphone },
    { id: 'banners' as const, label: 'Banners', icon: Image },
    { id: 'typography' as const, label: 'Tipografia', icon: Type },
    { id: 'texts' as const, label: 'Textos', icon: FileText },
    { id: 'delivery' as const, label: 'Delivery', icon: MapPin },
    { id: 'payments' as const, label: 'Pagos', icon: CreditCard },
    { id: 'categories' as const, label: 'Categorias', icon: Grid },
    { id: 'seo' as const, label: 'SEO', icon: Search },
    { id: 'social' as const, label: 'Redes', icon: Share2 },
    { id: 'sedes' as const, label: 'Sucursales', icon: Building2 },
  ];

  const handleAddBanner = () => {
    const newBanners = [...(config.banners || []), ''];
    const newTexts = [...(config.banner_texts || []), ''];
    const newTitles = [...(config.banner_titles || []), ''];
    const newDescs = [...(config.banner_descriptions || []), ''];
    updateConfig({ banners: newBanners, banner_texts: newTexts, banner_titles: newTitles, banner_descriptions: newDescs });
  };

  const handleRemoveBanner = (index: number) => {
    const newBanners = (config.banners || []).filter((_, i) => i !== index);
    const newTexts = (config.banner_texts || []).filter((_, i) => i !== index);
    const newTitles = (config.banner_titles || []).filter((_, i) => i !== index);
    const newDescs = (config.banner_descriptions || []).filter((_, i) => i !== index);
    updateConfig({ banners: newBanners, banner_texts: newTexts, banner_titles: newTitles, banner_descriptions: newDescs });
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    const banners = [...(config.banners || [])];
    const texts = [...(config.banner_texts || [])];
    const titles = [...(config.banner_titles || [])];
    const descs = [...(config.banner_descriptions || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;
    [banners[index], banners[newIndex]] = [banners[newIndex], banners[index]];
    [texts[index], texts[newIndex]] = [texts[newIndex], texts[index]];
    [titles[index], titles[newIndex]] = [titles[newIndex], titles[index]];
    [descs[index], descs[newIndex]] = [descs[newIndex], descs[index]];
    updateConfig({ banners, banner_texts: texts, banner_titles: titles, banner_descriptions: descs });
  };

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="admin-label mb-3">{children}</p>
  );

  const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="text-xs font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>{children}</label>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="relative">
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0"
                style={{
                  background: isActive ? themeColor : 'var(--ios-card)',
                  color: isActive ? '#FFFFFF' : 'var(--ios-text-secondary)',
                  border: `1px solid ${isActive ? themeColor : 'var(--ios-border)'}`,
                }}>
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========== 1. GENERAL ========== */}
      {activeTab === 'general' && (
        <div className="flex flex-col gap-4">
          <div className="admin-card p-4">
            <SectionTitle>Nombre del Sitio</SectionTitle>
            <input type="text" value={config.site_nombre} onChange={e => updateConfig({ site_nombre: e.target.value })}
              className="admin-input" placeholder="Mi Restaurante" />
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Mensaje de Bienvenida</SectionTitle>
            <textarea value={config.mensaje_bienvenida || ''} onChange={e => updateConfig({ mensaje_bienvenida: e.target.value })}
              className="admin-input" rows={3} placeholder="La mejor hamburgueseria con delivery express." style={{ resize: 'none' }} />
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Direccion Fisica</SectionTitle>
            <input type="text" value={config.direccion_fisica} onChange={e => updateConfig({ direccion_fisica: e.target.value })}
              className="admin-input" placeholder="Av. Principal, Local #12, Ciudad" />
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Telefono / WhatsApp</SectionTitle>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold" style={{ color: 'var(--ios-text-secondary)' }}>Numero Maestro de Notificaciones</span>
                {currentUser && config.telefono_soporte !== currentUser.telefono && (
                  <button onClick={async () => {
                    updateConfig({ telefono_soporte: currentUser.telefono });
                    const result = await syncPushSubscription();
                    if (!result.success) alert('Error al sincronizar push: ' + result.error);
                  }} className="text-[9px] px-2 py-0.5 rounded font-bold uppercase cursor-pointer" style={{ background: '#FF950020', color: '#FF9500', border: '1px solid #FF950040' }}>
                    Usar mi numero
                  </button>
                )}
              </div>
              <input type="tel" value={config.telefono_soporte} onChange={e => {
                      const v = e.target.value;
                      updateConfig({ telefono_soporte: v });
                      const principales = (config.sedes || []).filter(s => s.es_principal && s.activa);
                      if (principales.length === 1) {
                        updateConfig({ sedes: (config.sedes || []).map(s => s.id === principales[0].id ? { ...s, telefono: v, whatsapp_numero: s.whatsapp_numero || v } : s) });
                      }
                    }}
                className="admin-input" placeholder="+584124058904" style={{
                  borderColor: currentUser && config.telefono_soporte !== currentUser.telefono ? '#FF9500' : undefined
                }} />
              {currentUser && config.telefono_soporte !== currentUser.telefono && (
                <p className="text-[9px] font-bold flex items-center gap-1" style={{ color: '#FF9500' }}>
                  <AlertTriangle size={10} /> Para recibir notificaciones Push, este numero debe coincidir con tu perfil ({currentUser.telefono}).
                </p>
              )}
            </div>
            {config.telefono_soporte && (
              <a href={`https://wa.me/${config.telefono_soporte.replace(/\D/g, '').replace(/^0/, '58')}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1 text-xs font-semibold" style={{ color: themeColor }}>
                <MessageSquare size={12} /> Abrir WhatsApp <ExternalLink size={10} />
              </a>
            )}
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Coordenadas de la Tienda</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Latitud</FieldLabel>
                <input type="number" step="any" value={config.coordenadas_tienda?.lat || 0}
                  onChange={e => updateConfig({ coordenadas_tienda: { ...config.coordenadas_tienda, lat: parseFloat(e.target.value) || 0 } })}
                  className="admin-input mt-1" placeholder="10.198300" />
              </div>
              <div>
                <FieldLabel>Longitud</FieldLabel>
                <input type="number" step="any" value={config.coordenadas_tienda?.lng || 0}
                  onChange={e => updateConfig({ coordenadas_tienda: { ...config.coordenadas_tienda, lng: parseFloat(e.target.value) || 0 } })}
                  className="admin-input mt-1" placeholder="-68.004400" />
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Estado de la Tienda</SectionTitle>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.esta_abierta !== false}
                  onChange={e => updateConfig({ esta_abierta: e.target.checked })}
                  className="accent-activator rounded h-4 w-4" style={{ accentColor: themeColor }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--ios-text)' }}>Tienda Abierta</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.tiene_mesas || false}
                  onChange={e => updateConfig({ tiene_mesas: e.target.checked })}
                  className="accent-activator rounded h-4 w-4" style={{ accentColor: themeColor }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--ios-text)' }}>Tiene Mesas</span>
              </label>
              {config.tiene_mesas && (
                <div>
                  <FieldLabel>Total de Mesas</FieldLabel>
                  <input type="number" min="0" value={config.total_mesas || 0}
                    onChange={e => updateConfig({ total_mesas: parseInt(e.target.value) || 0 })}
                    className="admin-input mt-1" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== 2. LOGOS ========== */}
      {activeTab === 'logos' && (
        <div className="flex flex-col gap-4">
          <div className="admin-card p-4">
            <SectionTitle>Logo Principal (PWA + Tienda)</SectionTitle>
            <p className="text-xs mb-3" style={{ color: 'var(--ios-text-tertiary)' }}>
              Se usa como icono de la app movil (PWA) y en el header de la tienda.
            </p>
            <ImageField
              value={config.logo_url || ''}
              onChange={url => updateConfig({ logo_url: url })}
              bucket="settings"
              folder="logos"
              maxSize={400}
              previewSize="lg"
            />
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Logo Secundario</SectionTitle>
            <p className="text-xs mb-3" style={{ color: 'var(--ios-text-tertiary)' }}>
              Logo alternativo para usar en el footer o secciones especiales.
            </p>
            <ImageField
              value={config.secondary_logo_url || ''}
              onChange={url => updateConfig({ secondary_logo_url: url })}
              bucket="settings"
              folder="logos"
              maxSize={400}
              previewSize="md"
            />
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Favicon (Icono del Navegador)</SectionTitle>
            <p className="text-xs mb-3" style={{ color: 'var(--ios-text-tertiary)' }}>
              Icono que aparece en la pestana del navegador. Recomendado: 32x32 o 64x64 PNG.
            </p>
            <ImageField
              value={config.favicon_url || ''}
              onChange={url => updateConfig({ favicon_url: url })}
              bucket="settings"
              folder="favicons"
              maxSize={64}
              previewSize="sm"
              accept="image/png, image/jpeg, image/x-icon"
            />
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Vista Previa</SectionTitle>
            <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--ios-bg)' }}>
              {config.logo_url ? (
                <img src={config.logo_url} alt="Logo" className="w-12 h-12 object-contain" style={{ border: '2px solid var(--ios-border)' }} />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: themeColor }}>
                  {config.site_nombre?.[0] || 'A'}
                </div>
              )}
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--ios-text)' }}>{config.site_nombre || 'Mi Tienda'}</p>
                <p className="text-xs" style={{ color: 'var(--ios-text-secondary)' }}>Logo principal + PWA icon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 3. PWA ========== */}
      {activeTab === 'pwa' && (
        <div className="flex flex-col gap-4">
          <div className="admin-card p-4">
            <SectionTitle>Icono PWA (Pantalla de Inicio)</SectionTitle>
            <p className="text-xs mb-1" style={{ color: 'var(--ios-text-tertiary)' }}>
              Icono que se muestra en la pantalla de inicio del celular.
            </p>
            <div className="rounded-lg px-3 py-2 mb-3" style={{ background: '#FFF3E0', border: '1px solid #FFE0B2' }}>
              <p className="text-[11px] font-semibold" style={{ color: '#E65100' }}>Importante: Usa PNG con fondo transparente</p>
              <p className="text-[10px]" style={{ color: '#BF360C' }}>El icono se mostrara sobre el color del tema. Si tiene fondo opaco se vera inconsistente.</p>
            </div>
            <ImageField
              value={config.pwa_icon_url || ''}
              onChange={url => updateConfig({ pwa_icon_url: url })}
              bucket="settings"
              folder="pwa-icons"
              maxSize={512}
              previewSize="lg"
            />
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Logo de Bienvenida (Splash Screen)</SectionTitle>
            <p className="text-xs mb-1" style={{ color: 'var(--ios-text-tertiary)' }}>
              Logo que aparece al abrir la app con efecto animado.
            </p>
            <div className="rounded-lg px-3 py-2 mb-3" style={{ background: '#E8F5E9', border: '1px solid #C8E6C9' }}>
              <p className="text-[11px] font-semibold" style={{ color: '#2E7D32' }}>Recomendado: PNG o SVG con fondo transparente</p>
              <p className="text-[10px]" style={{ color: '#1B5E20' }}>Se mostrara sobre el color del tema elegido arriba.</p>
            </div>
            <ImageField
              value={config.splash_logo_url || ''}
              onChange={url => updateConfig({ splash_logo_url: url })}
              bucket="settings"
              folder="splash-logos"
              maxSize={512}
              previewSize="lg"
            />
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Nombre de la App (PWA)</SectionTitle>
            <input type="text" value={config.site_nombre} onChange={e => updateConfig({ site_nombre: e.target.value })}
              className="admin-input" placeholder="Mi Restaurante" />
            <p className="text-[10px] mt-1" style={{ color: 'var(--ios-text-tertiary)' }}>
              Aparece en la pantalla de inicio y en la barra de notificaciones.
            </p>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Color del Tema (PWA)</SectionTitle>
            <p className="text-xs mb-3" style={{ color: 'var(--ios-text-tertiary)' }}>
              Color de fondo del splash screen, barra de navegacion y pantalla de inicio.
            </p>
            <div className="flex items-center gap-3">
              <input type="color" value={config.theme_color || '#FF6B35'}
                onChange={e => updateConfig({ theme_color: e.target.value })}
                className="w-12 h-12 rounded-xl cursor-pointer" style={{ border: 'none', padding: 0 }} />
              <input type="text" value={config.theme_color || '#FF6B35'}
                onChange={e => updateConfig({ theme_color: e.target.value })}
                className="admin-input flex-1 font-mono" />
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Vista Previa: Splash Screen</SectionTitle>
            <div className="rounded-2xl overflow-hidden mx-auto shadow-lg" style={{ width: 220, background: config.theme_color || '#FF6B35' }}>
              <div className="flex flex-col items-center justify-center py-8 px-4">
                {config.splash_logo_url || config.pwa_icon_url || config.logo_url ? (
                  <img
                    src={config.splash_logo_url || config.pwa_icon_url || config.logo_url}
                    alt="Splash Logo"
                    className="w-20 h-20 object-contain"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ background: 'rgba(255,255,255,0.15)' }}>
                    {config.site_nombre?.[0] || 'F'}
                  </div>
                )}
                <p className="text-white text-sm font-extrabold mt-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {config.site_nombre || 'Mi App'}
                </p>
                <p className="text-white/70 text-[10px] mt-1">
                  {config.mensaje_bienvenida || 'Tu delivery favorito'}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-center mt-2" style={{ color: 'var(--ios-text-tertiary)' }}>
              Asi se vera al abrir la app en el celular
            </p>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Vista Previa: Icono en Inicio</SectionTitle>
            <div className="flex flex-col items-center">
              <div className="rounded-2xl overflow-hidden" style={{ width: 220, background: '#f0f0f0', border: '3px solid #333' }}>
                <div className="h-5 flex items-center justify-end px-3" style={{ background: '#333' }}>
                  <span className="text-[7px] text-white/70 font-semibold">9:41</span>
                </div>
                <div className="grid grid-cols-4 gap-3 p-4" style={{ background: `linear-gradient(180deg, ${config.theme_color || '#FF6B35'}30 0%, #f0f0f0 40%)` }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      {i === 0 ? (
                        <>
                          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center overflow-hidden shadow-md"
                            style={{ background: config.theme_color || '#FF6B35' }}>
                            {(config.pwa_icon_url || config.logo_url) ? (
                              <img src={config.pwa_icon_url || config.logo_url} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-white text-lg font-bold">{config.site_nombre?.[0] || 'F'}</span>
                            )}
                          </div>
                          <span className="text-[7px] text-center leading-tight" style={{ color: '#333' }}>{config.site_nombre || 'App'}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-[10px] bg-gray-200" />
                          <span className="text-[7px] text-gray-300">—</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-center mt-2" style={{ color: 'var(--ios-text-tertiary)' }}>
                Icono en la pantalla de inicio del celular
              </p>
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Mensaje de Instalacion</SectionTitle>
            <textarea value={config.mensaje_bienvenida || ''} onChange={e => updateConfig({ mensaje_bienvenida: e.target.value })}
              className="admin-input" rows={3} placeholder="Mensaje que ven los clientes al instalar la app..." style={{ resize: 'none' }} />
          </div>
        </div>
      )}

      {/* ========== 4. BANNERS ========== */}
      {activeTab === 'banners' && (
        <div className="flex flex-col gap-4">
          {/* Preview mode toggle */}
          <div className="admin-card p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: 'var(--ios-text-secondary)' }}>Vista Previa del Banner</span>
              <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--ios-bg)' }}>
                <button onClick={() => setBannerPreviewMode('mobile')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: bannerPreviewMode === 'mobile' ? themeColor : 'transparent',
                    color: bannerPreviewMode === 'mobile' ? '#fff' : 'var(--ios-text-secondary)',
                  }}>
                  <Smartphone size={12} /> Movil
                </button>
                <button onClick={() => setBannerPreviewMode('desktop')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: bannerPreviewMode === 'desktop' ? themeColor : 'transparent',
                    color: bannerPreviewMode === 'desktop' ? '#fff' : 'var(--ios-text-secondary)',
                  }}>
                  <Monitor size={12} /> Escritorio
                </button>
              </div>
            </div>
          </div>

          {(config.banners || []).map((banner, index) => {
            const isHero = index === 0;
            const bannerTitle = isHero ? (config.hero_title || config.site_nombre || '') : (config.banner_titles?.[index] || '');
            const bannerDesc = isHero ? (config.hero_subtitle || config.mensaje_bienvenida || '') : (config.banner_descriptions?.[index] || '');
            const bannerCtaText = isHero ? (config.hero_cta_text || '') : '';
            const bannerCtaUrl = isHero ? (config.hero_cta_url || '') : '';

            return (
              <div key={index} className="admin-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <SectionTitle>
                    {isHero ? 'Banner Principal (Hero)' : `Banner ${index + 1}`}
                  </SectionTitle>
                  <div className="flex gap-1">
                    <button onClick={() => handleMoveBanner(index, 'up')} disabled={index === 0}
                      className="p-1.5 rounded-lg disabled:opacity-30 cursor-pointer" style={{ background: 'var(--ios-bg)', color: 'var(--ios-text-secondary)' }}>
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => handleMoveBanner(index, 'down')} disabled={index === (config.banners?.length || 0) - 1}
                      className="p-1.5 rounded-lg disabled:opacity-30 cursor-pointer" style={{ background: 'var(--ios-bg)', color: 'var(--ios-text-secondary)' }}>
                      <ChevronDown size={14} />
                    </button>
                    <button onClick={() => handleRemoveBanner(index)}
                      className="p-1.5 rounded-lg cursor-pointer" style={{ background: '#FF3B3015', color: '#FF3B30' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Image field */}
                <div className="mb-3">
                  <FieldLabel>Imagen del Banner</FieldLabel>
                  <div className="mt-1">
                    <ImageField
                      value={banner || ''}
                      onChange={url => {
                        const newBanners = [...(config.banners || [])];
                        newBanners[index] = url;
                        updateConfig({ banners: newBanners });
                      }}
                      bucket="settings"
                      folder={`banners/${isHero ? 'hero' : 'secondary'}`}
                      maxSize={1200}
                      previewSize="lg"
                    />
                  </div>
                </div>

                {/* Text fields */}
                <div className="flex flex-col gap-3">
                  <div>
                    <FieldLabel>{isHero ? 'Titulo (H1)' : 'Titulo'}</FieldLabel>
                    <input type="text" value={bannerTitle}
                      onChange={e => {
                        if (isHero) {
                          updateConfig({ hero_title: e.target.value });
                        } else {
                          const newTitles = [...(config.banner_titles || [])];
                          newTitles[index] = e.target.value;
                          updateConfig({ banner_titles: newTitles });
                        }
                      }}
                      className="admin-input mt-1" placeholder={isHero ? 'Pide Tu Comida Favorita' : 'Titulo del banner...'} />
                  </div>

                  <div>
                    <FieldLabel>Descripcion</FieldLabel>
                    <input type="text" value={bannerDesc}
                      onChange={e => {
                        if (isHero) {
                          updateConfig({ hero_subtitle: e.target.value });
                        } else {
                          const newDescs = [...(config.banner_descriptions || [])];
                          newDescs[index] = e.target.value;
                          updateConfig({ banner_descriptions: newDescs });
                        }
                      }}
                      className="admin-input mt-1" placeholder={isHero ? 'Delivery express en minutos' : 'Descripcion del banner...'} />
                  </div>

                  {isHero && (
                    <>
                      <div>
                        <FieldLabel>Texto del Boton CTA</FieldLabel>
                        <input type="text" value={bannerCtaText}
                          onChange={e => updateConfig({ hero_cta_text: e.target.value })}
                          className="admin-input mt-1" placeholder="Ordenar Ahora" />
                      </div>
                      <div>
                        <FieldLabel>URL del Boton (destino)</FieldLabel>
                        <input type="url" value={bannerCtaUrl}
                          onChange={e => updateConfig({ hero_cta_url: e.target.value })}
                          className="admin-input mt-1" placeholder="https://... o deja vacio para ir al catalogo" />
                        <p className="text-[10px] mt-1" style={{ color: 'var(--ios-text-tertiary)' }}>
                          Si se deja vacio, el boton ira al catalogo automaticamente.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Preview */}
                <div className="mt-4">
                  <FieldLabel>Vista Previa</FieldLabel>
                  <div className="mt-2 rounded-xl overflow-hidden" style={{
                    border: '1px solid var(--ios-border)',
                    maxWidth: bannerPreviewMode === 'mobile' ? '375px' : '100%',
                    margin: bannerPreviewMode === 'mobile' ? '0 auto' : '0',
                  }}>
                    <div className="relative" style={{ aspectRatio: bannerPreviewMode === 'mobile' ? '9/14' : '2/1' }}>
                      {banner ? (
                        <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--ios-bg)' }}>
                          <Image size={32} style={{ color: 'var(--ios-text-tertiary)' }} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        {bannerTitle && (
                          <p className="text-white font-extrabold leading-tight mb-1" style={{
                            fontSize: bannerPreviewMode === 'mobile' ? '16px' : '24px',
                          }}>
                            {bannerTitle}
                          </p>
                        )}
                        {bannerDesc && (
                          <p className="text-white/75 mb-2" style={{
                            fontSize: bannerPreviewMode === 'mobile' ? '11px' : '14px',
                          }}>
                            {bannerDesc}
                          </p>
                        )}
                        {isHero && bannerCtaText && (
                          <span className="inline-block px-4 py-1.5 rounded-lg text-white font-bold" style={{
                            background: themeColor,
                            fontSize: bannerPreviewMode === 'mobile' ? '11px' : '13px',
                          }}>
                            {bannerCtaText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={handleAddBanner}
            className="admin-card p-4 flex items-center justify-center gap-2 cursor-pointer transition-all"
            style={{ border: '2px dashed var(--ios-border)', color: 'var(--ios-text-secondary)' }}>
            <Plus size={18} /> Agregar Banner
          </button>

          <p className="text-xs text-center" style={{ color: 'var(--ios-text-tertiary)' }}>
            Formatos: JPG, PNG, WebP · Tamanio recomendado: 1200x600px
          </p>
        </div>
      )}

      {/* ========== 6. TIPOGRAFIA ========== */}
      {activeTab === 'typography' && (
        <div className="flex flex-col gap-4">
          <div className="admin-card p-4">
            <SectionTitle>Fuente del Sitio</SectionTitle>
            <select value={config.font_display || 'Fredoka'} onChange={e => updateConfig({ font_display: e.target.value })}
              className="admin-input">
              <option value="Fredoka">Fredoka</option>
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Inter">Inter</option>
              <option value="Nunito">Nunito</option>
            </select>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Seccion Hero (Home)</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel>Titulo Principal (H1)</FieldLabel>
                <input type="text" value={config.hero_title || ''} onChange={e => updateConfig({ hero_title: e.target.value })}
                  className="admin-input mt-1" placeholder="Pide Tu Comida Favorita" />
              </div>
              <div>
                <FieldLabel>Subtitulo</FieldLabel>
                <input type="text" value={config.hero_subtitle || ''} onChange={e => updateConfig({ hero_subtitle: e.target.value })}
                  className="admin-input mt-1" placeholder="Delivery express en minutos" />
              </div>
              <div>
                <FieldLabel>Texto del Boton CTA</FieldLabel>
                <input type="text" value={config.hero_cta_text || ''} onChange={e => updateConfig({ hero_cta_text: e.target.value })}
                  className="admin-input mt-1" placeholder="Ver Menu" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Efecto del Hero</FieldLabel>
                  <select value={config.hero_effect || 'fade'} onChange={e => updateConfig({ hero_effect: e.target.value as any })}
                    className="admin-input mt-1">
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="typewriter">Typewriter</option>
                    <option value="none">Ninguno</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Altura del Hero</FieldLabel>
                  <select value={config.hero_height || 'auto'} onChange={e => updateConfig({ hero_height: e.target.value as any })}
                    className="admin-input mt-1">
                    <option value="auto">Automatica</option>
                    <option value="60vh">60% vh</option>
                    <option value="70vh">70% vh</option>
                    <option value="full">100% vh</option>
                  </select>
                </div>
              </div>
              <div>
                <FieldLabel>Opacidad del Overlay (%): {config.hero_overlay_opacity ?? 100}</FieldLabel>
                <input type="range" min="0" max="100" value={config.hero_overlay_opacity ?? 100}
                  onChange={e => updateConfig({ hero_overlay_opacity: parseInt(e.target.value) })}
                  className="w-full mt-1" />
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Vista Previa del Hero</SectionTitle>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--ios-border)' }}>
              <div className="relative p-6 text-center" style={{
                background: `linear-gradient(135deg, ${config.theme_color || '#FF6B35'}, ${config.secondary_color || '#1e293b'})`,
                opacity: (config.hero_overlay_opacity ?? 100) / 100,
              }}>
                <p className="text-white font-bold text-lg">{config.hero_title || 'Pide Tu Comida Favorita'}</p>
                <p className="text-white/80 text-sm mt-1">{config.hero_subtitle || 'Delivery express en minutos'}</p>
                {config.hero_cta_text && (
                  <button className="mt-3 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: config.accent_color || '#FF6B35', color: 'white' }}>
                    {config.hero_cta_text}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 7. TEXTOS ========== */}
      {activeTab === 'texts' && (
        <div className="flex flex-col gap-4">
          <div className="admin-card p-4">
            <SectionTitle>Titulos de Secciones</SectionTitle>
            <div className="flex flex-col gap-3">
              {[
                { key: 'section_highlights_title', label: 'Destacados', placeholder: 'Destacados' },
                { key: 'section_categories_title', label: 'Categorias', placeholder: 'LO MAS POPULAR' },
                { key: 'section_bestseller_title', label: 'Mas Vendidos', placeholder: 'LO MAS PEDIDO' },
                { key: 'section_rewards_title', label: 'Recompensas', placeholder: 'RECOMPENSAS' },
                { key: 'section_rewards_description', label: 'Descripcion Recompensas', placeholder: 'Acumula puntos...' },
              ].map(item => (
                <div key={item.key}>
                  <FieldLabel>{item.label}</FieldLabel>
                  <input type="text" value={(config as any)[item.key] || ''} onChange={e => updateConfig({ [item.key]: e.target.value })}
                    className="admin-input mt-1" placeholder={item.placeholder} />
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Pasos de Recompensas</SectionTitle>
            <div className="flex flex-col gap-3">
              {[
                { key1: 'rewards_step1_title', key2: 'rewards_step1_desc', label: 'Paso 1', defaultTitle: 'Registrate gratis', defaultDesc: 'Crea tu cuenta en segundos' },
                { key1: 'rewards_step2_title', key2: 'rewards_step2_desc', label: 'Paso 2', defaultTitle: 'Ordena y acumula', defaultDesc: 'Gana puntos con cada pedido' },
                { key1: 'rewards_step3_title', key2: 'rewards_step3_desc', label: 'Paso 3', defaultTitle: 'Canjea recompensas', defaultDesc: 'Intercambia puntos por comida gratis' },
              ].map((step, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <label className="text-xs font-bold" style={{ color: 'var(--ios-text)' }}>{step.label}</label>
                  <input type="text" value={(config as any)[step.key1] || step.defaultTitle} onChange={e => updateConfig({ [step.key1]: e.target.value })}
                    className="admin-input" placeholder={step.defaultTitle} />
                  <input type="text" value={(config as any)[step.key2] || step.defaultDesc} onChange={e => updateConfig({ [step.key2]: e.target.value })}
                    className="admin-input" placeholder={step.defaultDesc} />
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Footer - Sobre Nosotros</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel>Titulo "Sobre Nosotros"</FieldLabel>
                <input type="text" value={config.footer_about_title || ''} onChange={e => updateConfig({ footer_about_title: e.target.value })}
                  className="admin-input mt-1" placeholder="Sobre Mi Restaurante" />
              </div>
              <div>
                <FieldLabel>Descripcion "Sobre Nosotros"</FieldLabel>
                <textarea value={config.footer_about_text || ''} onChange={e => updateConfig({ footer_about_text: e.target.value })}
                  className="admin-input mt-1" rows={4} placeholder="Somos un restaurante de comida rapida en Valencia..." style={{ resize: 'none' }} />
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Footer - General</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel>Texto del Footer</FieldLabel>
                <textarea value={config.footer_text || ''} onChange={e => updateConfig({ footer_text: e.target.value })}
                  className="admin-input mt-1" rows={2} placeholder="Tu restaurante favorito..." style={{ resize: 'none' }} />
              </div>
              <div>
                <FieldLabel>Copyright</FieldLabel>
                <input type="text" value={config.footer_copyright || ''} onChange={e => updateConfig({ footer_copyright: e.target.value })}
                  className="admin-input mt-1" placeholder="2025 Mi Restaurante" />
              </div>
              <div>
                <FieldLabel>URL del Sitio (SEO)</FieldLabel>
                <input type="url" value={config.site_url || ''} onChange={e => updateConfig({ site_url: e.target.value })}
                  className="admin-input mt-1" placeholder="https://mirestaurante.com" />
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Sección Brand Experience</SectionTitle>
            <p className="text-[11px] text-slate-500 mb-3">Estadísticas y textos de la sección oscura "Más que comida".</p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Stat 1 - Valor</FieldLabel>
                  <input type="text" value={config.brand_stat1_value || ''} onChange={e => updateConfig({ brand_stat1_value: e.target.value })}
                    className="admin-input mt-1" placeholder="15min" />
                </div>
                <div>
                  <FieldLabel>Stat 1 - Etiqueta</FieldLabel>
                  <input type="text" value={config.brand_stat1_label || ''} onChange={e => updateConfig({ brand_stat1_label: e.target.value })}
                    className="admin-input mt-1" placeholder="Entrega Promedio" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Stat 2 - Valor</FieldLabel>
                  <input type="text" value={config.brand_stat2_value || ''} onChange={e => updateConfig({ brand_stat2_value: e.target.value })}
                    className="admin-input mt-1" placeholder="100%" />
                </div>
                <div>
                  <FieldLabel>Stat 2 - Etiqueta</FieldLabel>
                  <input type="text" value={config.brand_stat2_label || ''} onChange={e => updateConfig({ brand_stat2_label: e.target.value })}
                    className="admin-input mt-1" placeholder="Ingredientes Frescos" />
                </div>
              </div>
              <div>
                <FieldLabel>Contador de Usuarios</FieldLabel>
                <input type="text" value={config.brand_users_count || ''} onChange={e => updateConfig({ brand_users_count: e.target.value })}
                  className="admin-input mt-1" placeholder="+50k" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Título Sección</FieldLabel>
                  <input type="text" value={config.brand_section_title || ''} onChange={e => updateConfig({ brand_section_title: e.target.value })}
                    className="admin-input mt-1" placeholder="Más que comida," />
                </div>
                <div>
                  <FieldLabel>Subtítulo Sección</FieldLabel>
                  <input type="text" value={config.brand_section_subtitle || ''} onChange={e => updateConfig({ brand_section_subtitle: e.target.value })}
                    className="admin-input mt-1" placeholder="es una experiencia." />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 8. DELIVERY ========== */}
      {activeTab === 'delivery' && (
        <div className="flex flex-col gap-4">
          <div className="admin-card p-4">
            <SectionTitle>Opciones de Delivery</SectionTitle>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.delivery_gratis || false}
                  onChange={e => updateConfig({ delivery_gratis: e.target.checked })}
                  className="rounded h-4 w-4" style={{ accentColor: themeColor }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--ios-text)' }}>Delivery Gratis</span>
              </label>
              {!config.delivery_gratis && (
                <div>
                  <FieldLabel>Costo base por Km ($)</FieldLabel>
                  <input type="number" min="0" step="0.1" value={config.costo_delivery_km || 0}
                    onChange={e => updateConfig({ costo_delivery_km: parseFloat(e.target.value) || 0 })}
                    className="admin-input mt-1" />
                </div>
              )}
              {config.delivery_gratis && (
                <div>
                  <FieldLabel>Minimo para delivery gratis ($)</FieldLabel>
                  <input type="number" min="0" step="0.5" value={config.delivery_gratis_threshold || 0}
                    onChange={e => updateConfig({ delivery_gratis_threshold: parseFloat(e.target.value) || 0 })}
                    className="admin-input mt-1" />
                </div>
              )}
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Recogida en el Local</SectionTitle>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={config.recogida_en_local !== false}
                onChange={e => updateConfig({ recogida_en_local: e.target.checked })}
                className="rounded h-4 w-4" style={{ accentColor: themeColor }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--ios-text)' }}>Ofrecer Recogida en Tienda</span>
            </label>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Entrega por Zonas</SectionTitle>
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input type="checkbox" checked={config.entrega_por_zonas || false}
                onChange={e => updateConfig({ entrega_por_zonas: e.target.checked })}
                className="rounded h-4 w-4" style={{ accentColor: themeColor }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--ios-text)' }}>Ofrecer Entrega por Zonas</span>
            </label>

            {config.entrega_por_zonas && (
              <div className="flex flex-col gap-2">
                {(config.delivery_zonas || []).map((z, idx) => (
                  <div key={z.id} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'var(--ios-bg)', border: '1px solid var(--ios-border)' }}>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold block truncate" style={{ color: 'var(--ios-text)' }}>{z.name}</span>
                      <span className="text-[10px]" style={{ color: 'var(--ios-text-secondary)' }}>{z.minKm} - {z.maxKm} km | ${z.cost.toFixed(2)}</span>
                    </div>
                    <button onClick={() => { setEditingZone(z); setNewZoneName(z.name); setNewZoneCost(z.cost); setNewZoneMinKm(z.minKm); setNewZoneMaxKm(z.maxKm); }}
                      className="p-1.5 rounded-md cursor-pointer" style={{ color: themeColor }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => { const updated = (config.delivery_zonas || []).filter((_, i) => i !== idx); updateConfig({ delivery_zonas: updated }); }}
                      className="p-1.5 rounded-md cursor-pointer" style={{ color: '#FF3B30' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <div className="p-3 rounded-lg" style={{ background: 'var(--ios-bg)', border: '1px solid var(--ios-border)' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--ios-text)' }}>{editingZone ? 'Editar Zona' : 'Nueva Zona'}</p>
                  <div className="flex flex-col gap-2">
                    <input type="text" value={newZoneName} onChange={e => setNewZoneName(e.target.value)}
                      placeholder="Nombre de la zona" className="admin-input text-xs" />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <FieldLabel>Costo ($)</FieldLabel>
                        <input type="number" min="0" step="0.5" value={newZoneCost}
                          onChange={e => setNewZoneCost(parseFloat(e.target.value) || 0)}
                          className="admin-input mt-1 text-xs" />
                      </div>
                      <div>
                        <FieldLabel>Km Min</FieldLabel>
                        <input type="number" min="0" value={newZoneMinKm}
                          onChange={e => setNewZoneMinKm(parseFloat(e.target.value) || 0)}
                          className="admin-input mt-1 text-xs" />
                      </div>
                      <div>
                        <FieldLabel>Km Max</FieldLabel>
                        <input type="number" min="0" value={newZoneMaxKm}
                          onChange={e => setNewZoneMaxKm(parseFloat(e.target.value) || 0)}
                          className="admin-input mt-1 text-xs" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (!newZoneName.trim()) return;
                        const zone: DeliveryZone = { id: editingZone ? editingZone.id : `z${Date.now()}`, name: newZoneName.trim(), cost: newZoneCost, minKm: newZoneMinKm, maxKm: newZoneMaxKm };
                        const zones = [...(config.delivery_zonas || [])];
                        if (editingZone) { const idx = zones.findIndex(z => z.id === editingZone.id); if (idx >= 0) zones[idx] = zone; }
                        else { zones.push(zone); }
                        updateConfig({ delivery_zonas: zones });
                        setEditingZone(null); setNewZoneName(''); setNewZoneCost(0); setNewZoneMinKm(0); setNewZoneMaxKm(0);
                      }} disabled={!newZoneName.trim()}
                        className="admin-btn text-xs flex-1 cursor-pointer disabled:opacity-40">
                        {editingZone ? 'Guardar' : 'Agregar Zona'}
                      </button>
                      {editingZone && (
                        <button onClick={() => { setEditingZone(null); setNewZoneName(''); setNewZoneCost(0); setNewZoneMinKm(0); setNewZoneMaxKm(0); }}
                          className="admin-btn-secondary admin-btn text-xs cursor-pointer">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Envio Nacional</SectionTitle>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.envio_nacional || false}
                  onChange={e => updateConfig({ envio_nacional: e.target.checked })}
                  className="rounded h-4 w-4" style={{ accentColor: themeColor }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--ios-text)' }}>Habilitar Envio Nacional</span>
              </label>
              {config.envio_nacional && (
                <div>
                  <FieldLabel>Costo Envio Nacional ($)</FieldLabel>
                  <input type="number" min="0" step="0.5" value={config.costo_envio_nacional || 0}
                    onChange={e => updateConfig({ costo_envio_nacional: parseFloat(e.target.value) || 0 })}
                    className="admin-input mt-1" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== 9. PAGOS ========== */}
      {activeTab === 'payments' && (
        <div className="flex flex-col gap-4">
          {[
            { key: 'pagomovil_enabled', label: 'Pago Movil Bs', dataKey: 'pagomovil_data', discKey: 'pagomovil_discount_percent', placeholder: 'Banco, telefono, cedula...' },
            { key: 'zelle_enabled', label: 'Zelle USD', dataKey: 'zelle_data', discKey: 'zelle_discount_percent', placeholder: 'Email de Zelle...' },
            { key: 'efectivo_enabled', label: 'Efectivo', dataKey: 'efectivo_data', discKey: 'efectivo_discount_percent', placeholder: 'Descripcion del metodo...' },
            { key: 'transferencia_enabled', label: 'Transferencia Bancaria', dataKey: 'transferencia_data', discKey: 'transferencia_discount_percent', placeholder: 'Datos de cuenta...' },
          ].map(p => (
            <div key={p.key} className="admin-card p-4">
              <div className="flex items-center justify-between mb-3">
                <SectionTitle>{p.label}</SectionTitle>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={(config as any)[p.key]}
                    onChange={e => updateConfig({ [p.key]: e.target.checked })}
                    className="rounded h-4 w-4" style={{ accentColor: themeColor }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--ios-text)' }}>
                    {(config as any)[p.key] ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
              {(config as any)[p.key] && (
                <div className="flex flex-col gap-3">
                  <div>
                    <FieldLabel>Datos del Metodo de Pago</FieldLabel>
                    <input type="text" value={(config as any)[p.dataKey]}
                      onChange={e => updateConfig({ [p.dataKey]: e.target.value })}
                      className="admin-input mt-1" placeholder={p.placeholder} />
                  </div>
                  <div>
                    <FieldLabel>Descuento por usar este metodo (%)</FieldLabel>
                    <input type="number" min="0" max="100" step="0.1" value={(config as any)[p.discKey]}
                      onChange={e => updateConfig({ [p.discKey]: parseFloat(e.target.value) || 0 })}
                      className="admin-input mt-1" />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="admin-card p-4">
            <SectionTitle>Tasa de Cambio (Bs/USD)</SectionTitle>
            <input type="number" min="0" step="0.01" value={config.tasa_cambio || 0}
              onChange={e => updateConfig({ tasa_cambio: parseFloat(e.target.value) || 0 })}
              className="admin-input" placeholder="612.43" />
          </div>
        </div>
      )}

      {/* ========== 10. CATEGORIAS ========== */}
      {activeTab === 'categories' && (
        <div className="flex flex-col gap-4">
          <div className="admin-card p-4">
            <SectionTitle>Gestionar Categorias</SectionTitle>
            <div className="flex gap-2 mb-3">
              <input type="text" id="tienda-new-category" placeholder="Nueva categoria..."
                className="admin-input flex-1"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !(config.categories || []).includes(val)) {
                      updateConfig({ categories: [...(config.categories || []), val] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }} />
              <button onClick={() => {
                const el = document.getElementById('tienda-new-category') as HTMLInputElement;
                const val = el?.value.trim();
                if (val && !(config.categories || []).includes(val)) {
                  updateConfig({ categories: [...(config.categories || []), val] });
                  el.value = '';
                }
              }} className="admin-btn px-4 cursor-pointer">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {(config.categories || []).map((cat) => {
                const subcats = (config.subcategories || {})[cat] || [];
                return (
                  <div key={cat} className="rounded-lg" style={{ background: 'var(--ios-bg)' }}>
                    <div className="flex items-center justify-between p-2">
                      <span className="text-xs font-semibold truncate pr-1" style={{ color: 'var(--ios-text)' }}>{cat}</span>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => {
                          const nuevo = prompt(`Editar categoria "${cat}":`, cat);
                          if (nuevo && nuevo.trim() !== cat) {
                            const cats = (config.categories || []).map(c => c === cat ? nuevo.trim() : c);
                            const imgs = { ...(config.categories_images || {}) };
                            if (imgs[cat]) { imgs[nuevo.trim()] = imgs[cat]; delete imgs[cat]; }
                            const subs = { ...(config.subcategories || {}) };
                            if (subs[cat]) { subs[nuevo.trim()] = subs[cat]; delete subs[cat]; }
                            updateConfig({ categories: cats, categories_images: imgs, subcategories: subs });
                          }
                        }} className="p-1 rounded cursor-pointer" style={{ color: 'var(--ios-text-secondary)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => {
                          if (confirm(`Eliminar categoria "${cat}"? Los productos se moveran a "Panaderia".`)) {
                            const cats = (config.categories || []).filter(c => c !== cat);
                            const subs = { ...(config.subcategories || {}) };
                            delete subs[cat];
                            updateConfig({ categories: cats, subcategories: subs });
                          }
                        }} className="p-1 rounded cursor-pointer" style={{ color: '#FF3B30' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {/* Subcategories */}
                    <div className="px-2 pb-2">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {subcats.map((sub) => (
                          <span key={sub} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium" style={{ background: 'var(--ios-surface)', color: 'var(--ios-text-secondary)' }}>
                            {sub}
                            <button onClick={() => {
                              const updated = subcats.filter(s => s !== sub);
                              const subs = { ...(config.subcategories || {}), [cat]: updated };
                              updateConfig({ subcategories: subs });
                            }} className="hover:text-red-500 cursor-pointer"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <input type="text" id={`new-sub-${cat}`} placeholder="Nueva subcategoria..."
                          className="admin-input flex-1 text-[11px]"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val && !subcats.includes(val)) {
                                const subs = { ...(config.subcategories || {}), [cat]: [...subcats, val] };
                                updateConfig({ subcategories: subs });
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }} />
                        <button onClick={() => {
                          const el = document.getElementById(`new-sub-${cat}`) as HTMLInputElement;
                          const val = el?.value.trim();
                          if (val && !subcats.includes(val)) {
                            const subs = { ...(config.subcategories || {}), [cat]: [...subcats, val] };
                            updateConfig({ subcategories: subs });
                            el.value = '';
                          }
                        }} className="admin-btn px-2 cursor-pointer text-[11px]">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Imagenes de Categorias</SectionTitle>
            <p className="text-xs mb-3" style={{ color: 'var(--ios-text-tertiary)' }}>
              Sube una imagen de fondo para cada categoria (aparece como tarjeta en Home).
            </p>
            <div className="flex flex-col gap-3">
              {(config.categories || []).map((cat) => (
                <div key={cat} className="p-3 rounded-lg" style={{ background: 'var(--ios-bg)', border: '1px solid var(--ios-border)' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--ios-text)' }}>{cat}</p>
                  <ImageField
                    value={(config.categories_images || {})[cat] || ''}
                    onChange={url => updateConfig({ categories_images: { ...(config.categories_images || {}), [cat]: url } })}
                    bucket="categories"
                    folder={cat.replace(/\s+/g, '-').toLowerCase()}
                    maxSize={400}
                    previewSize="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== 11. SEO ========== */}
      {activeTab === 'seo' && (
        <div className="flex flex-col gap-4">
          <div className="admin-card p-4">
            <SectionTitle>SEO - Pagina Principal</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel>Titulo (title)</FieldLabel>
                <input type="text" value={config.seo_home_title || ''} onChange={e => updateConfig({ seo_home_title: e.target.value })}
                  className="admin-input mt-1" placeholder="Mi Restaurante - Delivery de Comida" />
              </div>
              <div>
                <FieldLabel>Descripcion (meta description)</FieldLabel>
                <textarea value={config.seo_home_description || ''} onChange={e => updateConfig({ seo_home_description: e.target.value })}
                  className="admin-input mt-1" rows={3} placeholder="Pide tu comida favorita con delivery express..." style={{ resize: 'none' }} />
              </div>
              <div>
                <FieldLabel>Palabras clave (keywords)</FieldLabel>
                <input type="text" value={config.seo_home_keywords || ''} onChange={e => updateConfig({ seo_home_keywords: e.target.value })}
                  className="admin-input mt-1" placeholder="restaurante, delivery, comida, hamburguesas" />
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>SEO - Catalogo</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel>Titulo</FieldLabel>
                <input type="text" value={config.seo_catalog_title || ''} onChange={e => updateConfig({ seo_catalog_title: e.target.value })}
                  className="admin-input mt-1" placeholder="Menu y Precios | Mi Restaurante" />
              </div>
              <div>
                <FieldLabel>Descripcion</FieldLabel>
                <textarea value={config.seo_catalog_description || ''} onChange={e => updateConfig({ seo_catalog_description: e.target.value })}
                  className="admin-input mt-1" rows={2} placeholder="Explora nuestro menu completo..." style={{ resize: 'none' }} />
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Schema JSON-LD</SectionTitle>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel>Tipo</FieldLabel>
                <select value={config.jsonld_type || 'Restaurant'} onChange={e => updateConfig({ jsonld_type: e.target.value })}
                  className="admin-input mt-1">
                  <option value="Restaurant">Restaurant</option>
                  <option value="FoodEstablishment">Food Establishment</option>
                  <option value="FastFoodRestaurant">Fast Food Restaurant</option>
                </select>
              </div>
              <div>
                <FieldLabel>Rango de Precios</FieldLabel>
                <input type="text" value={config.jsonld_priceRange || '$$'} onChange={e => updateConfig({ jsonld_priceRange: e.target.value })}
                  className="admin-input mt-1" placeholder="$$" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 12. REDES ========== */}
      {activeTab === 'social' && (
        <div className="flex flex-col gap-4">
          {[
            { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/tuusuario' },
            { key: 'twitter_url', label: 'Twitter / X', placeholder: 'https://x.com/tuusuario' },
            { key: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/tupagina' },
            { key: 'tiktok_url', label: 'TikTok', placeholder: 'https://tiktok.com/@tuusuario' },
            { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@tucanal' },
          ].map(item => (
            <div key={item.key} className="admin-card p-4">
              <SectionTitle>{item.label}</SectionTitle>
              <input type="url" value={(config as any)[item.key] || ''}
                onChange={e => updateConfig({ [item.key]: e.target.value })}
                className="admin-input mt-2" placeholder={item.placeholder} />
            </div>
          ))}
        </div>
      )}

      {/* ========== 13. SEDES ========== */}
      {activeTab === 'sedes' && (
        <div className="flex flex-col gap-4">
          <div className="admin-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <SectionTitle>Modo Multi-Sucursal</SectionTitle>
                <p className="text-[10px] mt-1" style={{ color: 'var(--ios-text-tertiary)' }}>
                  {config.multi_sucursal_enabled
                    ? 'Activado: cada sucursal manejara sus propios pedidos, y el cliente elige desde cual recibe su pedido.'
                    : 'Desactivado: la tienda se comporta como una sola sucursal (la principal). El cliente no elige sucursal.'}
                </p>
              </div>
              <button
                onClick={() => updateConfig({ multi_sucursal_enabled: !config.multi_sucursal_enabled })}
                className="relative w-12 h-7 rounded-full transition-colors cursor-pointer shrink-0"
                style={{ background: config.multi_sucursal_enabled ? themeColor : 'var(--ios-border)' }}
                aria-pressed={config.multi_sucursal_enabled}
              >
                <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: config.multi_sucursal_enabled ? 'translateX(20px)' : 'translateX(0)' }} />
              </button>
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>Gestion de Sucursales</SectionTitle>
            <p className="text-[10px] mb-3" style={{ color: 'var(--ios-text-tertiary)' }}>
              Administra las ubicaciones fisicas de tu negocio. La sede principal se usa para calcular distancias y zonas de delivery.
            </p>

            <div className="flex flex-col gap-2">
              {(config.sedes || []).map((sede) => (
                <div key={sede.id} className="p-3 rounded-xl" style={{
                  background: sede.es_principal ? 'var(--ios-bg)' : 'var(--ios-card)',
                  border: `1px solid ${sede.es_principal ? themeColor + '40' : 'var(--ios-border)'}`
                }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--ios-text)' }}>{sede.nombre}</span>
                        {sede.es_principal && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: themeColor + '20', color: themeColor }}>Principal</span>
                        )}
                        {!sede.activa && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: 'var(--ios-bg)', color: 'var(--ios-text-tertiary)' }}>Inactiva</span>
                        )}
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--ios-text-secondary)' }}>{sede.direccion}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px]" style={{ color: 'var(--ios-text-tertiary)' }}>
                        <span>Tel: {sede.telefono}</span>
                        {sede.whatsapp_numero && <span>WhatsApp: {sede.whatsapp_numero}</span>}
                        {sede.horario && <span>{sede.horario}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <button onClick={() => {
                        setCredSedeId(sede.id);
                        setCredEmail('');
                        setCredPassword('');
                      }} className="p-1.5 rounded-lg cursor-pointer" style={{ color: '#5856D6' }} title="Crear acceso de sucursal (correo y clave)">
                        <KeyRound size={14} />
                      </button>
                      <button onClick={() => {
                        const updated = (config.sedes || []).map(s => s.id === sede.id ? { ...s, activa: !s.activa } : s);
                        updateConfig({ sedes: updated });
                      }} className="p-1.5 rounded-lg cursor-pointer" style={{ color: sede.activa ? '#FF9500' : '#34C759' }}>
                        {sede.activa ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      {!sede.es_principal && (
                        <button onClick={() => {
                          if (confirm(`Marcar "${sede.nombre}" como sede principal?`)) {
                            const updated = (config.sedes || []).map(s => ({ ...s, es_principal: s.id === sede.id }));
                            updateConfig({ sedes: updated });
                          }
                        }} className="p-1.5 rounded-lg cursor-pointer" style={{ color: themeColor }}>
                          <Check size={14} />
                        </button>
                      )}
                      <button onClick={() => {
                        setEditingSedeId(sede.id);
                        setSedeForm({
                          nombre: sede.nombre,
                          telefono: sede.telefono || '',
                          whatsapp_numero: sede.whatsapp_numero || '',
                          direccion: sede.direccion || '',
                          horario: sede.horario || '',
                          lat: sede.coordenadas?.lat || 0,
                          lng: sede.coordenadas?.lng || 0,
                        });
                      }} className="p-1.5 rounded-lg cursor-pointer" style={{ color: 'var(--ios-text-secondary)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      {!sede.es_principal && (
                        <button onClick={() => {
                          if (confirm(`Eliminar la sede "${sede.nombre}"?`)) {
                            const updated = (config.sedes || []).filter(s => s.id !== sede.id);
                            updateConfig({ sedes: updated });
                          }
                        }} className="p-1.5 rounded-lg cursor-pointer" style={{ color: '#FF3B30' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!config.sedes || config.sedes.length === 0) && (
                <p className="text-[11px] italic text-center py-4" style={{ color: 'var(--ios-text-tertiary)' }}>
                  No hay sucursales configuradas. Agrega una abajo.
                </p>
              )}
            </div>
          </div>

          <div className="admin-card p-4">
            <SectionTitle>{editingSedeId ? 'Editar Sede' : 'Agregar Nueva Sede'}</SectionTitle>
            <div className="flex flex-col gap-3">
              <input type="text" value={sedeForm.nombre} onChange={e => setSedeForm({ ...sedeForm, nombre: e.target.value })}
                className="admin-input" placeholder="Nombre de la sede" />
              <input type="tel" value={sedeForm.telefono} onChange={e => setSedeForm({ ...sedeForm, telefono: e.target.value })}
                className="admin-input" placeholder="Telefono" />
              <input type="tel" value={sedeForm.whatsapp_numero} onChange={e => setSedeForm({ ...sedeForm, whatsapp_numero: e.target.value })}
                className="admin-input" placeholder="WhatsApp (opcional, si difiere del telefono)" />
              <input type="text" value={sedeForm.direccion} onChange={e => setSedeForm({ ...sedeForm, direccion: e.target.value })}
                className="admin-input" placeholder="Direccion" />
              <input type="text" value={sedeForm.horario} onChange={e => setSedeForm({ ...sedeForm, horario: e.target.value })}
                className="admin-input" placeholder="Horario (ej: 8am - 10pm)" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Latitud</FieldLabel>
                  <input type="number" step="any" value={sedeForm.lat || ''} onChange={e => setSedeForm({ ...sedeForm, lat: parseFloat(e.target.value) || 0 })}
                    className="admin-input mt-1" placeholder="10.198300" />
                </div>
                <div>
                  <FieldLabel>Longitud</FieldLabel>
                  <input type="number" step="any" value={sedeForm.lng || ''} onChange={e => setSedeForm({ ...sedeForm, lng: parseFloat(e.target.value) || 0 })}
                    className="admin-input mt-1" placeholder="-68.004400" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  if (!sedeForm.nombre.trim()) return;
                  const existingSede = editingSedeId ? (config.sedes || []).find(s => s.id === editingSedeId) : null;
                  const nuevaSede: Sede = {
                    id: editingSedeId || `sede-${Date.now()}`,
                    nombre: sedeForm.nombre.trim(),
                    telefono: sedeForm.telefono,
                    whatsapp_numero: sedeForm.whatsapp_numero || undefined,
                    direccion: sedeForm.direccion,
                    horario: sedeForm.horario,
                    coordenadas: { lat: sedeForm.lat, lng: sedeForm.lng },
                    es_principal: existingSede?.es_principal || (config.sedes || []).length === 0,
                    activa: existingSede?.activa ?? true,
                    delivery_mode: existingSede?.delivery_mode,
                    permite_delivery: existingSede?.permite_delivery,
                    permite_pickup: existingSede?.permite_pickup,
                  };
                  const sedes = [...(config.sedes || [])];
                  if (editingSedeId) {
                    const idx = sedes.findIndex(s => s.id === editingSedeId);
                    if (idx >= 0) sedes[idx] = nuevaSede;
                  } else {
                    sedes.push(nuevaSede);
                  }
                  updateConfig({ sedes });
                  if (nuevaSede.es_principal) {
                    const phone = nuevaSede.whatsapp_numero || nuevaSede.telefono;
                    if (phone) updateConfig({ telefono_soporte: phone });
                  }
                  setEditingSedeId(null);
                  setSedeForm({ nombre: '', telefono: '', whatsapp_numero: '', direccion: '', horario: '', lat: 0, lng: 0 });
                }} disabled={!sedeForm.nombre.trim()}
                  className="admin-btn flex-1 cursor-pointer disabled:opacity-40">
                  {editingSedeId ? 'Guardar Cambios' : 'Agregar Sede'}
                </button>
                {editingSedeId && (
                  <button onClick={() => { setEditingSedeId(null); setSedeForm({ nombre: '', telefono: '', whatsapp_numero: '', direccion: '', horario: '', lat: 0, lng: 0 }); }}
                    className="admin-btn-secondary admin-btn cursor-pointer">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear acceso de sucursal */}
      {credSedeId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCredSedeId(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <KeyRound size={16} style={{ color: '#5856D6' }} /> Crear acceso de sucursal
              </h3>
              <button onClick={() => setCredSedeId(null)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Genera credenciales (correo y clave) para <b>{(config.sedes || []).find(s => s.id === credSedeId)?.nombre}</b>. Este operador solo verá los pedidos y el panel de esa sucursal.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                value={credEmail}
                onChange={e => setCredEmail(e.target.value)}
                placeholder="sucursal@correo.com"
                className="admin-input"
              />
              <div className="relative">
                <input
                  type={showCredPassword ? 'text' : 'password'}
                  value={credPassword}
                  onChange={e => setCredPassword(e.target.value)}
                  placeholder="Contraseña (mín. 6 caracteres)"
                  className="admin-input w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCredPassword(!showCredPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCredPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setCredSedeId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer">
                  Cancelar
                </button>
                <button onClick={handleCreateSucursalCredential} disabled={credSaving}
                  className="flex-1 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50" style={{ background: '#5856D6' }}>
                  {credSaving ? 'Creando...' : 'Crear acceso'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiendaSection;
