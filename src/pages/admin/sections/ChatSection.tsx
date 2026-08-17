import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { Send, MessageSquare, MessageCircle, ExternalLink, Trash2, User } from 'lucide-react';

const ChatSection: React.FC = () => {
  const { notifications, addNotification, deleteNotification } = useApp();
  const [activeChatPhone, setActiveChatPhone] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [chatFilter, setChatFilter] = useState<'clientes' | 'grupal' | 'sistema'>('clientes');

  const getClientMessages = (phone: string) =>
    notifications.filter(n => n.destinatario_telefono === phone).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const getLastMessage = (phone: string) => {
    const msgs = getClientMessages(phone);
    return msgs[msgs.length - 1];
  };

  let clientPhones: string[] = [];
  let filteredNotifications: typeof notifications = [];
  let groupNotifs: typeof notifications = [];
  let systemNotifs: typeof notifications = [];

  if (chatFilter === 'clientes') {
    const phoneSet = new Set<string>();
    notifications.filter(n => n.destinatario_telefono && n.tipo === 'personal').forEach(n => phoneSet.add(n.destinatario_telefono!));
    clientPhones = Array.from(phoneSet);
    filteredNotifications = notifications.filter(n => n.destinatario_telefono && n.tipo === 'personal');
  } else if (chatFilter === 'grupal') {
    groupNotifs = notifications.filter(n => n.tipo === 'todos');
    filteredNotifications = groupNotifs;
  } else {
    systemNotifs = notifications.filter(n => n.tipo === 'admin');
    filteredNotifications = systemNotifs;
  }

  const broadcastCount = groupNotifs.length;

  const handleSendReply = async () => {
    if (!activeChatPhone || !replyMessage.trim() || chatFilter !== 'clientes') return;
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <MessageSquare size={18} className="text-violet-600" />
        <h3 className="text-sm font-bold text-slate-900 uppercase">Mensajes y Chat</h3>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl ml-auto">
          {(['clientes', 'grupal', 'sistema'] as const).map(cat => (
            <button key={cat} onClick={() => { setChatFilter(cat); setActiveChatPhone(null); }} className={`flex-1 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${chatFilter === cat ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {cat === 'clientes' ? '👤 Clientes' : cat === 'grupal' ? '📢 Envíos' : '⚙️ Sistema'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 h-[600px]">
        <div className="w-1/3 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-violet-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                {chatFilter === 'clientes' ? 'Clientes' : chatFilter === 'grupal' ? 'Envíos Grupales' : 'Registro del Sistema'}
              </h3>
              <span className="text-[10px] bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full font-bold">
                {chatFilter === 'clientes' ? clientPhones.length : chatFilter === 'grupal' ? broadcastCount : systemNotifs.length}
              </span>
            </div>
            {chatFilter === 'grupal' && broadcastCount > 0 && (
              <button onClick={() => setActiveChatPhone('broadcast')} className={`w-full text-left p-2.5 rounded-xl text-xs font-bold mt-2 transition-all ${activeChatPhone === 'broadcast' ? 'bg-violet-600 text-white shadow-lg' : 'bg-white border border-violet-200 text-violet-700 hover:bg-violet-50'}`}>
                📢 Todos los Broadcasts
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatFilter === 'clientes' ? (
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
            ) : chatFilter === 'grupal' ? (
              broadcastCount === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic px-4">No hay envíos grupales.</div>
              ) : (
                groupNotifs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(notif => (
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
  );
};

export default ChatSection;