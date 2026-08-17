import React, { useState } from 'react';
import { Promotion, FoodItem } from '../../../types/store';
import { X, Save, Send, Clock, Calendar, Bell, BellOff } from 'lucide-react';

interface PromotionFormProps {
  promotion?: Promotion | null;
  foodItems: FoodItem[];
  onSave: (promo: Omit<Promotion, 'id' | 'created_at'>) => Promise<void>;
  onSendNotification?: (title: string, message: string, imageUrl?: string) => Promise<boolean>;
  onClose: () => void;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({ promotion, foodItems, onSave, onSendNotification, onClose }) => {
  const [title, setTitle] = useState(promotion?.title || '');
  const [message, setMessage] = useState(promotion?.message || '');
  const [imageUrl, setImageUrl] = useState(promotion?.image_url || '');
  const [productId, setProductId] = useState(promotion?.product_id || '');
  const [discountType, setDiscountType] = useState<Promotion['discount_type']>(promotion?.discount_type || 'percent');
  const [discountValue, setDiscountValue] = useState(promotion?.discount_value || 0);
  const [couponCode, setCouponCode] = useState(promotion?.coupon_code || '');
  const [startDate, setStartDate] = useState(promotion?.start_date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(promotion?.end_date?.slice(0, 10) || '');
  const [startTime, setStartTime] = useState(promotion?.start_time || '');
  const [endTime, setEndTime] = useState(promotion?.end_time || '');
  const [audience, setAudience] = useState<Promotion['audience']>(promotion?.audience || 'all');
  const [channel, setChannel] = useState<Promotion['channel']>(promotion?.channel || 'both');
  const [maxUses, setMaxUses] = useState(promotion?.max_uses || 0);
  const [status, setStatus] = useState<Promotion['status']>(promotion?.status || 'draft');
  const [sendPush, setSendPush] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (activateAndSend = false) => {
    if (!title.trim() || !message.trim() || !startDate || !endDate) {
      alert('Por favor completa los campos obligatorios: título, mensaje, fecha inicio y fecha fin');
      return;
    }
    setSaving(true);
    try {
      const finalStatus = activateAndSend ? 'active' : status;
      await onSave({
        title: title.trim(),
        message: message.trim(),
        image_url: imageUrl || undefined,
        product_id: productId || undefined,
        discount_type: discountType,
        discount_value: discountValue,
        coupon_code: couponCode || undefined,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        audience,
        channel,
        max_uses: maxUses > 0 ? maxUses : undefined,
        current_uses: promotion?.current_uses || 0,
        impressions: promotion?.impressions || 0,
        clicks: promotion?.clicks || 0,
        conversions: promotion?.conversions || 0,
        status: finalStatus,
        sent_at: activateAndSend ? new Date().toISOString() : promotion?.sent_at,
      });

      if (sendPush && onSendNotification) {
        const notifSent = await onSendNotification(title.trim(), message.trim(), imageUrl || undefined);
        if (notifSent) {
          console.warn('✅ Notificación push enviada para la promoción:', title);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-base font-bold text-slate-900">
            {promotion ? 'Editar Promoción' : 'Nueva Promoción'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"><X size={20} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Título *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: 2x1 en Hamburguesas" className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Producto vinculado</label>
              <select value={productId} onChange={e => setProductId(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500">
                <option value="">Ninguno</option>
                {foodItems.filter(p => p.activo !== false).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Mensaje *</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Describe la promoción..." className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500 resize-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">URL de imagen</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo descuento</label>
              <select value={discountType} onChange={e => setDiscountType(e.target.value as Promotion['discount_type'])} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500">
                <option value="percent">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
                <option value="2x1">2x1</option>
                <option value="combo">Combo</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Valor descuento</label>
              <input type="number" min="0" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Código cupón</label>
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="AUTO" className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500 uppercase" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={10} /> Fecha inicio *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={10} /> Fecha fin *</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Clock size={10} /> Hora inicio</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Clock size={10} /> Hora fin</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Audiencia</label>
              <select value={audience} onChange={e => setAudience(e.target.value as Promotion['audience'])} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500">
                <option value="all">Todos</option>
                <option value="returning">Clientes recurrentes</option>
                <option value="new">Clientes nuevos</option>
                <option value="by_category">Por categoría</option>
                <option value="by_zone">Por zona</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Canal</label>
              <select value={channel} onChange={e => setChannel(e.target.value as Promotion['channel'])} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500">
                <option value="push">Push</option>
                <option value="in_app">In-App</option>
                <option value="both">Ambos</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Estado</label>
              <select value={status} onChange={e => setStatus(e.target.value as Promotion['status'])} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500">
                <option value="draft">Borrador</option>
                <option value="scheduled">Programada</option>
                <option value="active">Activa</option>
                <option value="paused">Pausada</option>
                <option value="finished">Finalizada</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Límite de usos (0 = ilimitado)</label>
            <input type="number" min="0" value={maxUses} onChange={e => setMaxUses(Number(e.target.value))} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
          </div>

          {/* Toggle Enviar notificación push */}
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  {sendPush ? <Bell size={18} className="text-violet-600" /> : <BellOff size={18} className="text-slate-400" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Enviar como notificación push</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Los clientes recibirán una alerta en su dispositivo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSendPush(!sendPush)}
                className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
                  sendPush ? 'bg-violet-600' : 'bg-slate-300'
                }`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  sendPush ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            {sendPush && (
              <div className="mt-3 bg-white rounded-lg p-3 border border-violet-100">
                <p className="text-[10px] text-slate-500 mb-2">Vista previa de la notificación:</p>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                    <Bell size={14} className="text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 truncate">{title || 'Título de la promoción'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{message || 'Mensaje de la promoción'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row justify-end gap-2 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer">Cancelar</button>
          <button onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2.5 text-xs font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            <Save size={14} />
            {saving ? 'Guardando...' : 'Guardar Borrador'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2.5 text-xs font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            <Send size={14} />
            {sendPush ? 'Activar y Enviar' : 'Guardar y Activar'}
          </button>
        </div>
      </div>
    </div>
  );
};
