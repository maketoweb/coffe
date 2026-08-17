import React, { useState } from 'react';
import { Send, Users, UserPlus, Target, Megaphone, X } from 'lucide-react';
import { FoodItem, StoreConfig } from '../types/store';

interface PromoPushSenderProps {
  foodItems: FoodItem[];
  config: StoreConfig;
  onSend: (data: {
    title: string;
    message: string;
    product_id?: string;
    audience: 'all' | 'returning' | 'new';
    scheduledAt?: string;
  }) => Promise<boolean>;
  onClose: () => void;
}

export const PromoPushSender: React.FC<PromoPushSenderProps> = ({
  foodItems,
  config,
  onSend,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [productId, setProductId] = useState('');
  const [audience, setAudience] = useState<'all' | 'returning' | 'new'>('all');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const themeColor = config.theme_color || '#FF6B35';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    const success = await onSend({
      title: title.trim(),
      message: message.trim(),
      product_id: productId || undefined,
      audience,
      scheduledAt: scheduledAt || undefined
    });
    setSending(false);
    if (success) {
      setSent(true);
      setTimeout(() => onClose(), 1500);
    }
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
            <Send size={28} style={{ color: themeColor }} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-1">¡Enviado!</h3>
          <p className="text-sm text-zinc-500">Tu promoción está siendo procesada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
              <Megaphone size={18} style={{ color: themeColor }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Enviar Push Promocional</h3>
              <p className="text-[10px] text-zinc-400">Máx. 3 por semana por usuario</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer">
            <X size={16} className="text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-1">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: 2x1 en Hamburguesas hoy"
              className="w-full text-sm border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-zinc-400"
              required
              maxLength={80}
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-1">Mensaje *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej: ¡Hoy martes lleva 2 hamburguesas por el precio de 1! No te lo pierdas."
              className="w-full text-sm border border-zinc-200 rounded-xl px-3 py-2.5 outline-none resize-none focus:border-zinc-400"
              rows={3}
              required
              maxLength={200}
            />
            <p className="text-[10px] text-zinc-400 text-right mt-0.5">{message.length}/200</p>
          </div>

          {/* Product */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-1">Producto vinculado (opcional)</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full text-sm border border-zinc-200 rounded-xl px-3 py-2.5 outline-none bg-white"
            >
              <option value="">Ninguno</option>
              {foodItems.filter(p => p.activo !== false).map(p => (
                <option key={p.id} value={p.id}>{p.nombre} - ${p.precio_usd.toFixed(2)}</option>
              ))}
            </select>
          </div>

          {/* Audience */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-2">Audiencia</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'all' as const, label: 'Todos', icon: <Users size={14} /> },
                { value: 'returning' as const, label: 'Recurrentes', icon: <Target size={14} /> },
                { value: 'new' as const, label: 'Nuevos', icon: <UserPlus size={14} /> }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAudience(opt.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-[10px] font-bold transition-all cursor-pointer ${
                    audience === opt.value ? 'border-current' : 'border-zinc-200 text-zinc-400 hover:border-zinc-300'
                  }`}
                  style={audience === opt.value ? { color: themeColor, borderColor: themeColor, backgroundColor: `${themeColor}08` } : undefined}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-1">Programar envío (opcional)</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full text-sm border border-zinc-200 rounded-xl px-3 py-2.5 outline-none"
            />
            <p className="text-[10px] text-zinc-400 mt-0.5">Hora ideal: 11am-1pm o 6pm-8pm</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim() || !message.trim() || sending}
            className="w-full text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: themeColor }}
          >
            <Send size={14} />
            {sending ? 'Enviando...' : scheduledAt ? 'Programar Envío' : 'Enviar Ahora'}
          </button>
        </form>
      </div>
    </div>
  );
};
