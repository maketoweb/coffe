import React, { useState, useRef } from 'react';
import { useApp } from '../../../store/AppContext';
import { uploadFileToStorage, compressImage } from '../../../store/supabaseClient';
import { Send, Bell, Package, Upload, RefreshCcw, Search } from 'lucide-react';

const NotificationsSection: React.FC = () => {
  const {
    foodItems,
    addNotification
  } = useApp();

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTipo, setBroadcastTipo] = useState<'todos' | 'personal' | 'admin'>('todos');
  const [broadcastImage, setBroadcastImage] = useState('');
  const [broadcastLink, setBroadcastLink] = useState('');
  const [broadcastDestinatarioTelefono, setBroadcastDestinatarioTelefono] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTitle, setToastTitle] = useState('');
  const bImageInputRef = useRef<HTMLInputElement>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );

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
    } catch (err: unknown) {
      alert('Error al subir imagen: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploadingImage(false);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      {toastTitle && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600"><Bell size={18} /></div>
            <div>
              <p className="text-xs font-bold text-emerald-900">{toastTitle}</p>
              <p className="text-[10px] text-emerald-700">{toastMessage}</p>
            </div>
          </div>
          <button onClick={() => { setToastTitle(''); setToastMessage(''); }} className="text-emerald-400 hover:text-emerald-600">×</button>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Send size={18} className="text-violet-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase">Centro de Notificaciones</h3>
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
              <select value={broadcastTipo} onChange={(e) => setBroadcastTipo(e.target.value as 'todos' | 'personal' | 'admin')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-violet-500">
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
                <button type="button" onClick={() => setShowProductPicker(true)} className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-indigo-100 transition-colors">
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
                  {!isUploadingImage && (<button type="button" onClick={() => setBroadcastImage('')} className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">×</button>)}
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

      {notifPermission === 'default' && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
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

      {showProductPicker && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[80vh]">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Vincular Producto a Promo</h4>
              <button onClick={() => setShowProductPicker(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input type="text" placeholder="Buscar por nombre o código..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500" autoFocus />
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 no-scrollbar">
              {pickerFilteredProducts.map(p => (
                <button key={p.id} onClick={() => { setBroadcastTitle(`🔥 ¡${p.nombre} en Oferta!`); setBroadcastMessage(`¡No te pierdas esta oportunidad! Llévatelo hoy por solo $${p.precio_usd.toFixed(2)}. ${p.descripcion.substring(0, 50)}...`); setBroadcastImage(p.imagen_urls[0] || ''); setBroadcastLink(`/?id=${p.id}`); setShowProductPicker(false); }} className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-violet-50 border border-slate-100 rounded-xl transition-all text-left">
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
    </div>
  );
};

export default NotificationsSection;