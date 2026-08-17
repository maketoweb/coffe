import React, { useState, useRef } from 'react';
import { useApp } from '../../../store/AppContext';
import { uploadFileToStorage, compressImage } from '../../../store/supabaseClient';
import { Sede, FoodOptionGroup, FoodOption, FAQItem } from '../../../types/store';
import {
  Send, Bell, Package, X, MessageSquare, MessageCircle, ExternalLink, Upload,
  Trash2, RefreshCcw, FileJson, Settings, Palette, MapPin, SlidersHorizontal, Eye, EyeOff,
  CheckCircle, Edit, Plus, Check, Search, User, HelpCircle, GripVertical
} from 'lucide-react';

interface SettingsSectionProps {
  setTab?: (tab: any) => void;
}

const ExtrasManager: React.FC<{ foodItems: any[]; updateFoodItem: (id: string, updated: any) => void }> = ({ foodItems, updateFoodItem }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [editingGroupName, setEditingGroupName] = useState('');
  const [editingOptionName, setEditingOptionName] = useState('');
  const [editingOptionPrice, setEditingOptionPrice] = useState(0);

  const selectedProduct = foodItems.find(p => p.id === selectedProductId);
  const optionGroups: FoodOptionGroup[] = selectedProduct?.option_groups || [];

  const saveGroups = (groups: FoodOptionGroup[]) => {
    if (selectedProduct) {
      updateFoodItem(selectedProduct.id, { option_groups: groups });
    }
  };

  const addGroup = () => {
    const name = prompt('Nombre del nuevo grupo de opciones (ej: "Tamaño", "Extras", "Salsa"):');
    if (!name || !name.trim()) return;
    const newGroup: FoodOptionGroup = {
      id: `og-${Date.now()}`,
      nombre: name.trim(),
      min_select: 0,
      max_select: 1,
      options: []
    };
    saveGroups([...optionGroups, newGroup]);
  };

  const deleteGroup = (groupId: string) => {
    if (confirm('¿Eliminar este grupo de opciones y todas sus opciones?')) {
      saveGroups(optionGroups.filter(g => g.id !== groupId));
    }
  };

  const addOption = (groupId: string) => {
    setEditingGroupName(groupId);
    setEditingOptionName('');
    setEditingOptionPrice(0);
  };

  const saveOption = (groupId: string) => {
    if (!editingOptionName.trim()) return;
    const newOption: FoodOption = {
      id: `opt-${Date.now()}`,
      nombre: editingOptionName.trim(),
      precio_usd: editingOptionPrice,
      activo: true
    };
    const updated = optionGroups.map(g =>
      g.id === groupId ? { ...g, options: [...g.options, newOption] } : g
    );
    saveGroups(updated);
    setEditingGroupName('');
    setEditingOptionName('');
    setEditingOptionPrice(0);
  };

  const deleteOption = (groupId: string, optionId: string) => {
    const updated = optionGroups.map(g =>
      g.id === groupId ? { ...g, options: g.options.filter(o => o.id !== optionId) } : g
    );
    saveGroups(updated);
  };

  const updateGroupLimits = (groupId: string, field: 'min_select' | 'max_select', value: number) => {
    const updated = optionGroups.map(g =>
      g.id === groupId ? { ...g, [field]: value } : g
    );
    saveGroups(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Seleccionar Producto</span>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-2.5 py-2 outline-none focus:border-violet-500 text-xs"
        >
          <option value="">-- Selecciona un producto --</option>
          {foodItems.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Grupos de Opciones de &quot;{selectedProduct.nombre}&quot;</span>
            <button
              onClick={addGroup}
              className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              <Plus size={12} /> Agregar Grupo
            </button>
          </div>

          {optionGroups.length === 0 && (
            <p className="text-[11px] text-slate-400 italic text-center py-4">Este producto no tiene grupos de opciones configurados.</p>
          )}

          {optionGroups.map(group => (
            <div key={group.id} className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{group.nombre}</span>
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-1 text-[9px] text-slate-500">
                    <span>Min:</span>
                    <input type="number" min="0" max={group.max_select} value={group.min_select} onChange={(e) => updateGroupLimits(group.id, 'min_select', parseInt(e.target.value) || 0)} className="w-10 border border-slate-300 rounded px-1 py-0.5 text-center text-[10px]" />
                    <span>Max:</span>
                    <input type="number" min={group.min_select} value={group.max_select} onChange={(e) => updateGroupLimits(group.id, 'max_select', parseInt(e.target.value) || 1)} className="w-10 border border-slate-300 rounded px-1 py-0.5 text-center text-[10px]" />
                  </div>
                  <button onClick={() => deleteGroup(group.id)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer"><Trash2 size={12}/></button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {group.options.map(opt => (
                  <div key={opt.id} className="flex items-center justify-between bg-slate-50 p-2 rounded text-[11px]">
                    <span>{opt.nombre} <strong className="text-violet-600 font-mono">{opt.precio_usd > 0 ? `+$${opt.precio_usd}` : 'Gratis'}</strong></span>
                    <button onClick={() => deleteOption(group.id, opt.id)} className="text-rose-400 hover:text-rose-600"><X size={12}/></button>
                  </div>
                ))}
              </div>

              {editingGroupName === group.id ? (
                <div className="flex gap-2 items-end mt-1">
                  <input type="text" value={editingOptionName} onChange={(e) => setEditingOptionName(e.target.value)} placeholder="Nombre" className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]" autoFocus />
                  <input type="number" value={editingOptionPrice} onChange={(e) => setEditingOptionPrice(parseFloat(e.target.value) || 0)} className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]" />
                  <button onClick={() => saveOption(group.id)} className="bg-emerald-500 text-white px-3 py-1 rounded text-[10px] font-bold cursor-pointer"><Check size={12}/></button>
                  <button onClick={() => setEditingGroupName('')} className="text-slate-400 px-2 py-1 cursor-pointer"><X size={12}/></button>
                </div>
              ) : (
                <button onClick={() => addOption(group.id)} className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded p-1.5 text-[10px] font-bold transition-colors mt-1 cursor-pointer">
                  <Plus size={12} /> Agregar Opción
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SettingsSection: React.FC<SettingsSectionProps> = () => {
  const [adminSection, setAdminSection] = useState<'settings' | 'branding' | 'sedes' | 'extras' | 'notifications' | 'faq'>('settings');
  const {
    foodItems, config, notifications, currentUser, userRole,
    updateFoodItem, updateConfig,
    addNotification, deleteNotification, addCategory, deleteCategory, updateCategory,
    coupons
  } = useApp();
  const isAdmin = userRole === 'admin';

  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );
  const [activeChatPhone, setActiveChatPhone] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [notifCatFilter, setNotifCatFilter] = useState<'clientes' | 'grupal' | 'sistema'>('clientes');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTipo, setBroadcastTipo] = useState<'todos' | 'personal' | 'admin'>('todos');
  const [broadcastImage, setBroadcastImage] = useState('');
  const [broadcastLink, setBroadcastLink] = useState('');
  const [broadcastDestinatarioTelefono, setBroadcastDestinatarioTelefono] = useState('');
  const [showProductPickerForBroadcast, setShowProductPickerForBroadcast] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [, setToastMessage] = useState('');
  const [, setToastTitle] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const bImageInputRef = useRef<HTMLInputElement>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingSedeId, setEditingSedeId] = useState<string | null>(null);
  const [sedeForm, setSedeForm] = useState({ nombre: '', telefono: '', whatsapp_numero: '', direccion: '', horario: '', lat: 0, lng: 0 });

  const pickerFilteredProducts = foodItems.slice(0, 5).filter(p =>
    !pickerSearch.trim() || p.nombre.toLowerCase().includes(pickerSearch.toLowerCase())
  ).slice(0, 8);

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    if (broadcastTipo === 'personal' && !broadcastDestinatarioTelefono.trim()) {
      addNotification('⚠️ Falta Teléfono', 'Para notificaciones personales debes especificar el número de teléfono del destinatario.', 'admin');
      return;
    }

    const sentTitle = broadcastTitle.trim();
    const sentMessage = broadcastMessage.trim();
    const targetPhone = broadcastTipo === 'personal' ? broadcastDestinatarioTelefono.trim() : undefined;

    const success = await addNotification(sentTitle, sentMessage, broadcastTipo, targetPhone, broadcastImage, broadcastLink);

    if (!success) {
      alert('Error al enviar notificación. Verifique la consola.');
      return;
    }

    setToastTitle(
      broadcastTipo === 'todos' ? '📢 Comunicado Difundido Exitosamente' :
      broadcastTipo === 'personal' ? '👤 Envío de Notificación Personalizada' :
      '🛡️ Alerta de Sistema Registrada'
    );

    setToastMessage(
      broadcastTipo === 'todos'
        ? `El mensaje "${sentTitle}" ha sido enviado vía Push a todos los suscriptores.`
        : `Notificación dirigida al cliente ${targetPhone || 'seleccionado'}.`
    );

    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastDestinatarioTelefono('');
    setBroadcastImage('');
    setBroadcastLink('');
    setBroadcastTipo('todos');
  };

  const handleManualBackup = (isAuto = false) => {
    const backupData = {
      version: "1.0",
      site: config.site_nombre,
      date: new Date().toISOString(),
      type: isAuto ? "automatic" : "manual",
      data: {
        products: foodItems,
        orders: [],
        users: [],
        config,
        coupons,
        notifications
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.site_nombre?.toLowerCase().replace(/\s/g, '_') || 'backup'}_backup_${isAuto ? 'auto_' : 'manual'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (!isAuto) {
      localStorage.setItem('foodapp_last_backup_date', String(new Date().getTime()));
      alert("¡Respaldo de seguridad generado y descargado con éxito!");
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (!backup.data || !backup.version) throw new Error("Formato de respaldo inválido");

        if (confirm(`¿Está seguro? Esto sobrescribirá la configuración actual de la tienda.`)) {
          if (backup.data.config) updateConfig(backup.data.config);
          
          if (backup.data.config.categories) {
             const { supabase } = await import('../../../store/supabaseClient');
             await supabase.from('store_config').update({ categories: backup.data.config.categories }).eq('id', 1);
          }

          alert("Sincronización completada.");
          window.location.reload();
        }
      } catch {
        alert(`Error al restaurar: El archivo no es un respaldo válido de ${config.site_nombre || 'la aplicación'}.`);
      }
    };
    reader.readAsText(file);
  };

  const forceUpdateApp = async () => {
    if (confirm("¿Desea forzar la actualización de la aplicación?")) {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleUploadBroadcastImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setBroadcastImage(localUrl);
    setIsUploadingImage(true);
    try {
      const compressed = await compressImage(file, { maxWidth: 800, quality: 0.8 });
      const url = await uploadFileToStorage(compressed, 'settings', `promos/${Date.now()}.webp`);
      setBroadcastImage(url);
    } catch (err: any) {
      alert('Error al subir imagen: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
    if (e.target) e.target.value = '';
  };

  const handleAddFaq = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
    };
    const updatedFaqs = [...(config.faq_items || []), newFaq];
    updateConfig({ faq_items: updatedFaqs });
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const handleEditFaq = (faq: FAQItem) => {
    setEditingFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
  };

  const handleSaveEditFaq = () => {
    if (!editingFaqId || !faqQuestion.trim() || !faqAnswer.trim()) return;
    const updatedFaqs = (config.faq_items || []).map(f =>
      f.id === editingFaqId ? { ...f, question: faqQuestion.trim(), answer: faqAnswer.trim() } : f
    );
    updateConfig({ faq_items: updatedFaqs });
    setEditingFaqId(null);
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const handleDeleteFaq = (id: string) => {
    if (confirm('¿Eliminar esta pregunta?')) {
      const updatedFaqs = (config.faq_items || []).filter(f => f.id !== id);
      updateConfig({ faq_items: updatedFaqs });
    }
  };

  const handleSendReply = async () => {
    if (!activeChatPhone || !replyMessage.trim() || notifCatFilter !== 'clientes') return;
    const success = await addNotification(`Re: Tu mensaje`, replyMessage.trim(), 'personal', activeChatPhone, '', '');
    if (success) {
      setReplyMessage('');
    }
  };

  const handleDeleteClientMessages = () => {
    if (!activeChatPhone) return;
    const clientNotifs = notifications.filter(n => n.destinatario_telefono === activeChatPhone);
    clientNotifs.forEach(n => deleteNotification(n.id));
    setActiveChatPhone(null);
  };

  let filteredNotifications: typeof notifications = [];
  let clientPhones: string[] = [];
  let groupNotifs: typeof notifications = [];
  let systemNotifs: typeof notifications = [];

  if (notifCatFilter === 'clientes') {
    const phoneSet = new Set<string>();
    notifications.filter(n => n.destinatario_telefono && n.tipo === 'personal').forEach(n => phoneSet.add(n.destinatario_telefono!));
    clientPhones = Array.from(phoneSet);
    filteredNotifications = notifications.filter(n => n.destinatario_telefono && n.tipo === 'personal');
  } else if (notifCatFilter === 'grupal') {
    groupNotifs = notifications.filter(n => n.tipo === 'todos');
    filteredNotifications = groupNotifs;
  } else {
    systemNotifs = notifications.filter(n => n.tipo === 'admin');
    filteredNotifications = systemNotifs;
  }

  const broadcastNotifs = groupNotifs;
  const broadcastCount = broadcastNotifs.length;

  const getClientMessages = (phone: string) =>
    notifications.filter(n => n.destinatario_telefono === phone).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const getLastMessage = (phone: string) => {
    const msgs = getClientMessages(phone);
    return msgs[msgs.length - 1];
  };

  const SETTINGS_TABS = isAdmin ? [
    { id: 'settings' as const, label: 'General', icon: Settings },
    { id: 'branding' as const, label: 'Branding', icon: Palette },
    { id: 'sedes' as const, label: 'Sucursales', icon: MapPin },
    { id: 'extras' as const, label: 'Extras', icon: SlidersHorizontal },
    { id: 'notifications' as const, label: 'Notificaciones', icon: Bell },
    { id: 'faq' as const, label: 'FAQ', icon: HelpCircle },
  ] : [
    { id: 'settings' as const, label: 'Delivery', icon: MapPin },
  ];

  const renderSubSection = () => {
  if (adminSection === 'notifications') {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-violet-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase">Centro de Notificaciones</h3>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {(['clientes', 'grupal', 'sistema'] as const).map(cat => (
                  <button key={cat} onClick={() => setNotifCatFilter(cat)} className={`flex-1 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${notifCatFilter === cat ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {cat === 'clientes' ? '👤 Clientes' : cat === 'grupal' ? '📢 Envío Grupal' : '⚙️ Sistema'}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { setToastTitle('🔊 Prueba de Audio/Vista'); setToastMessage('Así es como el cliente visualizará la notificación.'); const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); audio.volume = 0.5; audio.play().catch(() => console.warn('Audio bloqueado')); }} className="ml-auto p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all" title="Probar sonido"><RefreshCcw size={14} /></button>
            </div>
            
            <form onSubmit={handleCreateBroadcast} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Título de la Notificación</label>
                <input type="text" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} placeholder="Ej: ¡Oferta Relámpago en Carnes! 🥩" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-violet-500 transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Alcance</label>
                  <select value={broadcastTipo} onChange={(e) => setBroadcastTipo(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-violet-500">
                    <option value="todos">📣 Todos los Clientes</option>
                    <option value="personal">👤 Cliente Específico</option>
                  </select>
                </div>

                {broadcastTipo === 'personal' ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Teléfono del Destinatario</label>
                    <input type="text" value={broadcastDestinatarioTelefono} onChange={(e) => setBroadcastDestinatarioTelefono(e.target.value)} placeholder="Ej: 04124976451" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Asistente de Ofertas</label>
                    <button type="button" onClick={() => setShowProductPickerForBroadcast(true)} className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-indigo-100 transition-colors">
                      <Package size={14} /> Vincular Producto
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Imagen Promocional</label>
                  <div className="flex gap-2">
                    <input type="text" value={broadcastImage} onChange={(e) => setBroadcastImage(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] outline-none" placeholder="URL de imagen o sube un archivo..." />
                    <button type="button" onClick={() => bImageInputRef.current?.click()} className="p-2.5 bg-violet-100 text-violet-600 rounded-xl hover:bg-violet-200 transition-colors" title="Subir imagen"><Upload size={14} /></button>
                    <input type="file" ref={bImageInputRef} hidden accept="image/*" onChange={handleUploadBroadcastImage} />
                  </div>
                  {broadcastImage && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-100 group shadow-sm bg-slate-50">
                      <img src={broadcastImage} className={`w-full h-full object-cover transition-opacity duration-300 ${isUploadingImage ? 'opacity-40' : 'opacity-100'}`} alt="Preview" />
                      {isUploadingImage && (<div className="absolute inset-0 flex items-center justify-center"><RefreshCcw size={16} className="text-violet-600 animate-spin" /></div>)}
                      {!isUploadingImage && (<button type="button" onClick={() => setBroadcastImage('')} className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X size={10} /></button>)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Enlace de Acción</label>
                  <input type="text" value={broadcastLink} onChange={(e) => setBroadcastLink(e.target.value)} placeholder="/?id=codigo-producto" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Mensaje / Contenido</label>
                <textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs outline-none focus:border-violet-500 min-h-[100px]" placeholder="Escribe aquí el contenido de la promoción u oferta..." />
              </div>

              <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-violet-200">
                Enviar Notificación
              </button>
            </form>
          </div>

          {/* Chat area */}
          <div className="flex gap-4 h-[600px]">
            <div className="w-1/3 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-violet-50">
                <div className="flex items-center gap-2 mb-3">
                  {notifCatFilter === 'clientes' ? <MessageSquare size={16} className="text-violet-600" /> : notifCatFilter === 'grupal' ? <Send size={16} className="text-violet-600" /> : <Settings size={16} className="text-violet-600" />}
                  <h3 className="text-xs font-bold text-slate-800 uppercase">
                    {notifCatFilter === 'clientes' ? 'Clientes' : notifCatFilter === 'grupal' ? 'Envíos Grupales' : 'Registro del Sistema'}
                  </h3>
                  <span className="ml-auto text-[10px] bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full font-bold">
                    {notifCatFilter === 'clientes' ? clientPhones.length : notifCatFilter === 'grupal' ? broadcastCount : systemNotifs.length}
                  </span>
                </div>
                {notifCatFilter === 'grupal' && broadcastCount > 0 && (
                  <button onClick={() => setActiveChatPhone('broadcast')} className={`w-full text-left p-2.5 rounded-xl text-xs font-bold mb-2 transition-all ${activeChatPhone === 'broadcast' ? 'bg-violet-600 text-white shadow-lg' : 'bg-white border border-violet-200 text-violet-700 hover:bg-violet-50'}`}>
                    📢 Todos los Broadcasts
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {notifCatFilter === 'clientes' ? (
                  clientPhones.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic px-4">No hay mensajes de clientes aún.</div>
                  ) : (
                    clientPhones.map(phone => {
                      const lastMsg = getLastMessage(phone);
                      const unread = getClientMessages(phone).filter(m => !m.leida).length;
                      return (
                        <button key={phone} onClick={() => setActiveChatPhone(phone)} className={`w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50 transition-all ${activeChatPhone === phone ? 'bg-violet-50 border-l-4 border-l-violet-600' : ''}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{phone}</span>
                            {unread > 0 && <span className="w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-1">{lastMsg?.mensaje || 'Sin mensajes'}</p>
                          <p className="text-[9px] text-slate-400 mt-1">{lastMsg?.fecha}</p>
                        </button>
                      );
                    })
                  )
                ) : notifCatFilter === 'grupal' ? (
                  broadcastCount === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic px-4">No hay envíos grupales.</div>
                  ) : (
                    broadcastNotifs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(notif => (
                      <button key={notif.id} onClick={() => { setActiveChatPhone('broadcast'); }} className="w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">📢 Broadcast</span>
                          <span className="text-[9px] text-slate-400">{notif.fecha}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-1">{notif.titulo}</p>
                      </button>
                    ))
                  )
                ) : (
                  systemNotifs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic px-4">No hay notificaciones del sistema.</div>
                  ) : (
                    systemNotifs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(notif => (
                      <button key={notif.id} onClick={() => { setActiveChatPhone('system'); }} className="w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">⚙️ Sistema</span>
                          <span className="text-[9px] text-slate-400">{notif.fecha}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-1">{notif.titulo}</p>
                      </button>
                    ))
                  )
                )}
              </div>
            </div>

            <div className="w-2/3 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {activeChatPhone ? (
                <>
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                        <User size={18} className="text-violet-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {activeChatPhone === 'broadcast' ? '📢 Todos los Clientes' : activeChatPhone === 'system' ? '⚙️ Registro del Sistema' : activeChatPhone}
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          {activeChatPhone === 'broadcast' ? `${broadcastCount} mensajes broadcast` : activeChatPhone === 'system' ? `${systemNotifs.length} mensajes` : `${getClientMessages(activeChatPhone).length} mensajes`}
                        </p>
                      </div>
                    </div>
                    {activeChatPhone !== 'broadcast' && activeChatPhone !== 'system' && (
                      <div className="flex gap-2">
                        <a href={`https://wa.me/${activeChatPhone.replace(/\D/g, '')}`} target="_blank" className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="WhatsApp"><MessageCircle size={16} /></a>
                        <button onClick={handleDeleteClientMessages} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" title="Eliminar conversación"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
                    {(activeChatPhone === 'broadcast' || activeChatPhone === 'system' ? filteredNotifications : getClientMessages(activeChatPhone)).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map(msg => (
                      <div key={msg.id} className={`flex ${msg.tipo === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] ${msg.tipo === 'admin' ? 'order-2' : 'order-1'}`}>
                          <div className={`p-3 rounded-2xl ${msg.tipo === 'admin' ? 'bg-violet-600 text-white rounded-br-md' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'}`}>
                            {msg.imagen_url && (<div className="mb-2"><img src={msg.imagen_url} alt="Imagen" className="w-full max-h-40 object-cover rounded-xl" /></div>)}
                            {msg.titulo && <p className="text-xs font-bold mb-1">{msg.titulo}</p>}
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.mensaje}</p>
                            {msg.link_url && (<a href={msg.link_url} target="_blank" className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${msg.tipo === 'admin' ? 'text-violet-200' : 'text-violet-600'}`}><ExternalLink size={10} /> Ver oferta</a>)}
                          </div>
                          <p className={`text-[9px] mt-1 ${msg.tipo === 'admin' ? 'text-right text-violet-400' : 'text-left text-slate-400'}`}>{msg.fecha}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeChatPhone !== 'broadcast' && activeChatPhone !== 'system' && (
                    <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
                      <input type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendReply()} placeholder="Escribir respuesta..." className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs outline-none focus:border-violet-500" />
                      <button onClick={handleSendReply} disabled={!replyMessage.trim()} className="p-2.5 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Send size={14} /></button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-xs">Selecciona una conversación</p>
                    <p className="text-[10px] mt-1">o revisa los broadcasts</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showProductPickerForBroadcast && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[80vh]">
              <div className="flex justify-between items-center border-b pb-3">
                <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Vincular Producto a Promo</h4>
                <button onClick={() => setShowProductPickerForBroadcast(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="Buscar por nombre o código..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500" autoFocus />
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 no-scrollbar">
                {pickerFilteredProducts.map(p => (
                  <button key={p.id} onClick={() => { setBroadcastTitle(`🔥 ¡${p.nombre} en Oferta!`); setBroadcastMessage(`¡No te pierdas esta oportunidad! Llévatelo hoy por solo $${p.precio_usd.toFixed(2)}. ${p.descripcion.substring(0, 50)}...`); setBroadcastImage(p.imagen_urls[0] || ''); setBroadcastLink(`/?id=${p.id}`); setShowProductPickerForBroadcast(false); }} className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-violet-50 border border-slate-100 rounded-xl transition-all text-left">
                    <img src={p.imagen_urls[0]} className="w-10 h-10 rounded-lg object-cover border" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-700">{p.nombre}</span>
                      <span className="text-[9px] text-slate-500 font-mono">${p.precio_usd} • Stock: {p.stock}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {notifPermission === 'default' && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0"><Bell size={18} /></div>
              <div className="text-left">
                <p className="text-xs font-bold text-amber-900 leading-tight">Alertas de Navegador Desactivadas</p>
                <p className="text-[10px] text-amber-700 mt-0.5">Para que suenen los pedidos nuevos y ver avisos en tiempo real, active los permisos de notificación.</p>
              </div>
            </div>
            <button onClick={async () => { const res = await Notification.requestPermission(); setNotifPermission(res); }} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer">
              Activar Sonidos y Alertas 🔔
            </button>
          </div>
        )}
      </div>
    );
  }

  if (adminSection === 'settings') {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Admin-only sections: Backup, Notifications Test, PWA Maintenance, Categories */}
        {isAdmin && (
          <>
            <div className="flex flex-col gap-4 p-5 border border-amber-200 rounded-2xl bg-amber-50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl"><FileJson size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Respaldo de Seguridad Integral</h4>
                  <p className="text-[11px] text-amber-700">Descarga un archivo JSON con todos los productos, ventas y clientes. El sistema realiza esto automáticamente cada 15 días.</p>
                </div>
              </div>
              <button onClick={() => handleManualBackup(false)} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-amber-200">Generar Respaldo Ahora</button>
              <input type="file" ref={restoreInputRef} onChange={handleRestoreBackup} accept=".json" className="hidden" />
              <button onClick={() => restoreInputRef.current?.click()} className="w-full bg-white border border-amber-300 text-amber-700 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all hover:bg-amber-100">Restaurar Copia de Seguridad</button>
            </div>

            <div className="flex flex-col gap-4 p-5 border border-violet-200 rounded-2xl bg-violet-50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl"><Bell size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-violet-900">Verificador de Notificaciones Push</h4>
                  <p className="text-[11px] text-violet-700">Lanza una alerta de prueba para verificar el estilo visual nativo y los permisos del navegador.</p>
                </div>
              </div>
              <button onClick={async () => { const target = config.telefono_soporte || currentUser?.telefono; if (!target) { alert('⚠️ No hay un número de teléfono configurado.'); return; } const success = await addNotification(`Prueba de Sistema ${config.site_nombre || ''} 🔔`, "Si recibes esta alerta, el sistema de Web Push real está funcionando correctamente.", "admin", target); if (success) { setToastTitle('🧪 Prueba de Notificación'); setToastMessage(`Se ha enviado una alerta a ${target}.`); } else { alert('Error al enviar prueba.'); } }} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-violet-200 cursor-pointer">Ejecutar Test de Notificación Push</button>
            </div>

            <div className="flex flex-col gap-4 p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl"><RefreshCcw size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Mantenimiento de Aplicación (PWA)</h4>
                  <p className="text-[11px] text-slate-500">Si los clientes no ven los últimos cambios visuales, pídales que ejecuten esta acción.</p>
                </div>
              </div>
              <button onClick={forceUpdateApp} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer">Forzar Actualización Global</button>
            </div>

            <div className="flex flex-col gap-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Settings size={14} className="text-violet-600" />
                  <span className="text-xs uppercase font-mono font-bold text-slate-900">Administración de Categorías (Departamentos)</span>
                </div>
              </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input type="text" id="new-category-input" placeholder="Ej. Congelados y Pescadería..." className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 flex-1 text-xs text-slate-900 font-sans" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (val) { addCategory(val); (e.target as HTMLInputElement).value = ''; alert(`Categoría "${val}" agregada.`); } } }} />
              <button type="button" onClick={() => { const el = document.getElementById('new-category-input') as HTMLInputElement; const val = el?.value.trim(); if (val) { addCategory(val); el.value = ''; alert(`Categoría "${val}" agregada.`); } else { alert('Por favor escribe un nombre de categoría válido.'); } }} className="bg-violet-600 hover:bg-violet-750 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">Agregar</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-2">
              {(config.categories || []).map((cat) => (
                <div key={cat} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="font-semibold text-slate-800 truncate pr-1" title={cat}>{cat}</span>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => { const nuevoNombre = prompt(`Editar nombre de categoría "${cat}":`, cat); if (nuevoNombre && nuevoNombre.trim() !== cat) { updateCategory(cat, nuevoNombre.trim()); alert(`Categoría actualizada a "${nuevoNombre.trim()}"`); } }} className="p-1 hover:text-violet-600 bg-white border border-slate-200 rounded text-slate-500 hover:border-violet-300 transition-colors cursor-pointer" title="Editar nombre"><Edit size={11} /></button>
                    <button type="button" onClick={() => { if (confirm(`¿Seguro que deseas eliminar la categoría "${cat}"?\nTodos los productos pertenecientes a ella se moverán a "Hamburguesas".`)) { deleteCategory(cat); alert(`Categoría "${cat}" eliminada.`); } }} className="p-1 hover:text-red-600 bg-white border border-slate-200 rounded text-slate-500 hover:border-red-300 transition-colors cursor-pointer" title="Eliminar categoría"><Trash2 size={11} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Images */}
            <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 mt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Imágenes de Categorías (Fondo)</span>
              <p className="text-[10px] text-slate-400">Sube una imagen de fondo para cada categoría (aparece como tarjeta en Home).</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-2">
                {(config.categories || []).map((cat) => (
                  <div key={cat} className="flex flex-col gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-700 truncate" title={cat}>{cat}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const compressed = await compressImage(file, { maxWidth: 400, format: 'image/jpeg' });
                            const url = await uploadFileToStorage(compressed, 'categories', `${cat.replace(/\s+/g, '-').toLowerCase()}.jpg`);
                            updateConfig({ categories_images: { ...(config.categories_images || {}), [cat]: url } });
                          } catch (err) {
                            alert('Error al subir imagen: ' + (err as any).message);
                          }
                        }}
                        className="bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-violet-500 text-[10px] w-full"
                      />
                      {(config.categories_images || {})[cat] && (
                        <img src={(config.categories_images || {})[cat]} alt={cat} className="w-10 h-10 rounded object-cover border border-slate-200" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </>
        )}

        {isAdmin && (
          <div className="flex flex-col gap-3 p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Bell size={14} className="text-violet-600" />
              <span className="text-xs uppercase font-mono font-bold text-slate-900">Configuracion del Webhook Push</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Conecta Supabase con el Worker de Cloudflare para enviar notificaciones push reales.
            </p>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">URL del Webhook (Cloudflare Pages)</span>
                <input type="url" value={config.push_webhook_url || ''} onChange={(e) => updateConfig({ push_webhook_url: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 font-mono text-[11px]"
                  placeholder="https://su-app.pages.dev/api/push-notify" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Webhook Secret (Auth)</span>
                <input type="password" value={config.push_webhook_secret || ''} onChange={(e) => updateConfig({ push_webhook_secret: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 font-mono text-[11px]"
                  placeholder="Clave de seguridad del webhook..." />
              </div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="flex flex-col gap-3 p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Settings size={14} className="text-violet-600" />
              <span className="text-xs uppercase font-mono font-bold text-slate-900">Gestion de Categorias</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Las categorias, imagenes, logos, colores, banners, delivery y pagos se configuran desde el modulo <strong>Tienda</strong>.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (adminSection === 'branding') {
    return (
      <div className="flex flex-col gap-5 animate-fade-in">
        <div className="flex flex-col gap-4 p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl"><Palette size={20} /></div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Identidad Visual (Colores)</h4>
              <p className="text-[11px] text-slate-500">Configura los colores principales de la tienda. Los cambios se aplican en toda la interfaz.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Color Primario</span>
              <div className="flex items-center gap-3">
                <input type="color" value={config.theme_color || '#6d28d9'} onChange={(e) => updateConfig({ theme_color: e.target.value })} className="w-12 h-12 p-0 border-0 rounded-lg cursor-pointer shadow-sm" />
                <input type="text" value={config.theme_color || '#6d28d9'} onChange={(e) => updateConfig({ theme_color: e.target.value })} className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 font-mono text-xs flex-1" />
              </div>
            </div>

            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Color Secundario</span>
              <div className="flex items-center gap-3">
                <input type="color" value={config.secondary_color || '#1e293b'} onChange={(e) => updateConfig({ secondary_color: e.target.value })} className="w-12 h-12 p-0 border-0 rounded-lg cursor-pointer shadow-sm" />
                <input type="text" value={config.secondary_color || '#1e293b'} onChange={(e) => updateConfig({ secondary_color: e.target.value })} className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 font-mono text-xs flex-1" />
              </div>
            </div>

            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Color de Acento</span>
              <div className="flex items-center gap-3">
                <input type="color" value={config.accent_color || '#f59e0b'} onChange={(e) => updateConfig({ accent_color: e.target.value })} className="w-12 h-12 p-0 border-0 rounded-lg cursor-pointer shadow-sm" />
                <input type="text" value={config.accent_color || '#f59e0b'} onChange={(e) => updateConfig({ accent_color: e.target.value })} className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 font-mono text-xs flex-1" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-[11px] font-bold text-slate-900 block">Modo Oscuro</span>
              <span className="text-[10px] text-slate-500">Permite a los usuarios alternar entre tema claro y oscuro</span>
            </div>
            <button
              onClick={() => updateConfig({ theme_mode: config.theme_mode === 'dark' ? 'light' : config.theme_mode === 'light' ? 'system' : 'dark' })}
              className="relative w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer"
              style={{ backgroundColor: config.theme_mode === 'dark' ? '#6d28d9' : config.theme_mode === 'system' ? '#64748b' : '#d1d5db' }}
            >
              <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300"
                style={{ transform: config.theme_mode === 'dark' ? 'translateX(24px)' : config.theme_mode === 'system' ? 'translateX(12px)' : 'translateX(0)' }} />
            </button>
          </div>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map(mode => (
              <button key={mode} onClick={() => updateConfig({ theme_mode: mode })}
                className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: config.theme_mode === mode ? '#6d28d9' : '#f1f5f9',
                  color: config.theme_mode === mode ? '#ffffff' : '#64748b',
                }}>
                {mode === 'light' ? '☀️ Claro' : mode === 'dark' ? '🌙 Oscuro' : '💻 Sistema'}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Vista Previa del Header</span>
            <div className="rounded-xl overflow-hidden shadow-md border border-slate-200">
              <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: config.theme_color || '#6d28d9' }}>
                <div className="flex items-center gap-2">
                  {config.logo_url ? (
                    <img src={config.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: config.secondary_color || '#1e293b' }}>
                      {config.site_nombre?.[0] || 'F'}
                    </div>
                  )}
                  <span className="text-white font-bold text-sm">{config.site_nombre || 'Tienda'}</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: config.accent_color || '#f59e0b' }}>🛒</div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: config.secondary_color || '#1e293b' }}>🔔</div>
                </div>
              </div>
              <div className="flex gap-2 p-2 bg-white border-t border-slate-100">
                {['Inicio', 'Catálogo', 'Pedidos'].map(tab => (
                  <div key={tab} className="px-3 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: tab === 'Inicio' ? (config.theme_color || '#6d28d9') + '20' : 'transparent', color: tab === 'Inicio' ? (config.theme_color || '#6d28d9') : '#64748b' }}>{tab}</div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => { updateConfig({ theme_color: config.theme_color || '#6d28d9', secondary_color: config.secondary_color || '#1e293b', accent_color: config.accent_color || '#f59e0b' }); setToastTitle('🎨 Colores Guardados'); setToastMessage('La identidad visual de la tienda ha sido actualizada.'); }} className="w-full bg-violet-600 hover:bg-violet-750 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-violet-200">Guardar Colores de Branding</button>
        </div>
      </div>
    );
  }

  if (adminSection === 'sedes') {
    return (
      <div className="flex flex-col gap-5 animate-fade-in">
        <div className="flex flex-col gap-4 p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl"><MapPin size={20} /></div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Gestión de Sedes</h4>
              <p className="text-[11px] text-slate-500">Administra las ubicaciones físicas de tu negocio.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {(config.sedes || []).map((sede) => (
              <div key={sede.id} className={`p-4 border rounded-xl transition-all ${sede.es_principal ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{sede.nombre}</span>
                      {sede.es_principal && (<span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Principal</span>)}
                      {!sede.activa && (<span className="text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Inactiva</span>)}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{sede.direccion}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[10px] text-slate-500">
                      <span>📞 {sede.telefono}</span>
                      {sede.horario && <span>🕐 {sede.horario}</span>}
                      <span>📍 {sede.coordenadas.lat.toFixed(4)}, {sede.coordenadas.lng.toFixed(4)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0 ml-3">
                    <button onClick={() => { const updatedSedes = (config.sedes || []).map(s => s.id === sede.id ? { ...s, activa: !s.activa } : s); updateConfig({ sedes: updatedSedes }); }} className={`p-1.5 rounded-md transition-colors cursor-pointer ${sede.activa ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'}`} title={sede.activa ? 'Desactivar' : 'Activar'}>{sede.activa ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    {!sede.es_principal && (<button onClick={() => { if (confirm(`¿Marcar "${sede.nombre}" como sede principal?`)) { const updatedSedes = (config.sedes || []).map(s => ({ ...s, es_principal: s.id === sede.id })); updateConfig({ sedes: updatedSedes }); } }} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer" title="Marcar como principal"><CheckCircle size={14} /></button>)}
                    <button onClick={() => { setEditingSedeId(sede.id); setSedeForm({ nombre: sede.nombre, telefono: sede.telefono || '', whatsapp_numero: sede.whatsapp_numero || '', direccion: sede.direccion || '', horario: sede.horario || '', lat: sede.coordenadas?.lat || 0, lng: sede.coordenadas?.lng || 0 }); }} className="p-1.5 rounded-md hover:bg-violet-50 text-violet-600 transition-colors cursor-pointer" title="Editar"><Edit size={14} /></button>
                    <button onClick={() => { if (confirm(`¿Eliminar la sede "${sede.nombre}"? Esta acción no se puede deshacer.`)) { const updatedSedes = (config.sedes || []).filter(s => s.id !== sede.id); updateConfig({ sedes: updatedSedes }); if (editingSedeId === sede.id) { setEditingSedeId(null); setSedeForm({ nombre: '', telefono: '', whatsapp_numero: '', direccion: '', horario: '', lat: 0, lng: 0 }); } } }} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
            {(!config.sedes || config.sedes.length === 0) && (<p className="text-[11px] text-slate-400 italic text-center py-4">No hay sedes configuradas. Agrega una sede usando el formulario de abajo.</p>)}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h5 className="text-xs font-bold text-slate-800 mb-3">{editingSedeId ? 'Editar Sede' : 'Agregar Nueva Sede'}</h5>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre *</span>
                  <input type="text" value={sedeForm.nombre} onChange={e => setSedeForm({ ...sedeForm, nombre: e.target.value })} placeholder="Ej: Sede Principal" className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dirección *</span>
                  <input type="text" value={sedeForm.direccion} onChange={e => setSedeForm({ ...sedeForm, direccion: e.target.value })} placeholder="Ej: Av. Principal, Caracas" className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Teléfono</span>
                  <input type="tel" value={sedeForm.telefono} onChange={e => setSedeForm({ ...sedeForm, telefono: e.target.value })} placeholder="Ej: 0412-1234567" className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp (opcional)</span>
                  <input type="tel" value={sedeForm.whatsapp_numero} onChange={e => setSedeForm({ ...sedeForm, whatsapp_numero: e.target.value })} placeholder="Si difiere del teléfono" className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Horario</span>
                  <input type="text" value={sedeForm.horario} onChange={e => setSedeForm({ ...sedeForm, horario: e.target.value })} placeholder="Ej: Lun-Sab 8am-6pm" className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latitud</span>
                  <input type="number" step="0.0001" value={sedeForm.lat || ''} onChange={e => setSedeForm({ ...sedeForm, lat: parseFloat(e.target.value) || 0 })} placeholder="10.198300" className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Longitud</span>
                  <input type="number" step="0.0001" value={sedeForm.lng || ''} onChange={e => setSedeForm({ ...sedeForm, lng: parseFloat(e.target.value) || 0 })} placeholder="-68.004400" className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-violet-500 text-xs" />
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
                  setToastTitle(editingSedeId ? '✏️ Sede Actualizada' : '📍 Sede Agregada');
                  setToastMessage(`"${nuevaSede.nombre}" ha sido ${editingSedeId ? 'actualizada' : 'añadida'} exitosamente.`);
                }} disabled={!sedeForm.nombre.trim()} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex-1 cursor-pointer">
                  {editingSedeId ? 'Guardar Cambios' : 'Agregar Sede'}
                </button>
                {editingSedeId && (
                  <button onClick={() => { setEditingSedeId(null); setSedeForm({ nombre: '', telefono: '', whatsapp_numero: '', direccion: '', horario: '', lat: 0, lng: 0 }); }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (adminSection === 'extras') {
    return (
      <div className="flex flex-col gap-5 animate-fade-in">
        <div className="flex flex-col gap-4 p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl"><SlidersHorizontal size={20} /></div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Gestión de Extras / Opciones</h4>
              <p className="text-[11px] text-slate-500">Configura los grupos de opciones (extras) para cada producto del catálogo.</p>
            </div>
          </div>
          <ExtrasManager foodItems={foodItems} updateFoodItem={updateFoodItem} />
        </div>
      </div>
    );
  }

  if (adminSection === 'faq') {
    return (
      <div className="flex flex-col gap-5 animate-fade-in">
        <div className="flex flex-col gap-4 p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><HelpCircle size={20} /></div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Gestión de Preguntas Frecuentes</h4>
              <p className="text-[11px] text-slate-500">Administra las preguntas frecuentes que verán los clientes.</p>
            </div>
          </div>

          {/* Add/Edit FAQ Form */}
          <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h5 className="text-xs font-bold text-slate-800">{editingFaqId ? 'Editar Pregunta' : 'Nueva Pregunta'}</h5>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="Pregunta (ej: ¿Cuáles son los horarios?)"
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500"
              />
              <textarea
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder="Respuesta..."
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500 min-h-[80px]"
              />
              <div className="flex gap-2">
                <button
                  onClick={editingFaqId ? handleSaveEditFaq : handleAddFaq}
                  disabled={!faqQuestion.trim() || !faqAnswer.trim()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {editingFaqId ? 'Guardar Cambios' : 'Agregar'}
                </button>
                {editingFaqId && (
                  <button
                    onClick={() => { setEditingFaqId(null); setFaqQuestion(''); setFaqAnswer(''); }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="flex flex-col gap-2">
            {(config.faq_items || []).length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">No hay preguntas frecuentes configuradas.</p>
            )}
            {(config.faq_items || []).map((faq) => (
              <div key={faq.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                <GripVertical size={14} className="text-slate-300 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">{faq.question}</p>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEditFaq(faq)}
                    className="p-1.5 rounded-md hover:bg-violet-50 text-violet-600 transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex overflow-x-auto gap-1 p-1 bg-slate-100 rounded-xl no-scrollbar">
        {SETTINGS_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = adminSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminSection(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isActive ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>
      {renderSubSection()}
    </div>
  );
};

export default SettingsSection;
