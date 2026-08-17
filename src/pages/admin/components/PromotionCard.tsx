import React from 'react';
import { Promotion } from '../../../types/store';
import { Eye, Trash2, Send, Clock } from 'lucide-react';

interface PromotionCardProps {
  promotion: Promotion;
  onEdit: (promo: Promotion) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
  themeColor: string;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onEdit, onDelete, onSend, themeColor }) => {
  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Borrador' },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Programada' },
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Activa' },
    paused: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pausada' },
    finished: { bg: 'bg-red-100', text: 'text-red-600', label: 'Finalizada' },
  };

  const status = statusColors[promotion.status] || statusColors.draft;

  const discountLabel = {
    percent: `${promotion.discount_value}%`,
    fixed: `$${promotion.discount_value}`,
    '2x1': '2x1',
    combo: 'Combo',
  }[promotion.discount_type];

  const isActive = promotion.status === 'active' &&
    new Date(promotion.start_date) <= new Date() &&
    new Date(promotion.end_date) >= new Date();

  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${isActive ? 'border-green-300' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              {discountLabel}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 truncate">{promotion.title}</h4>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">{promotion.message}</p>
        </div>
        {promotion.image_url && (
          <img src={promotion.image_url} alt="" className="w-12 h-12 rounded-lg object-cover ml-3 shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-3">
        <span className="flex items-center gap-1"><Clock size={10} /> {promotion.start_date?.slice(0, 10)} - {promotion.end_date?.slice(0, 10)}</span>
        <span>{promotion.channel === 'both' ? 'Push + In-App' : promotion.channel === 'push' ? 'Push' : 'In-App'}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-slate-50 rounded-lg py-1.5 px-2">
          <p className="text-[10px] text-slate-400">Impresiones</p>
          <p className="text-xs font-bold text-slate-700">{promotion.impressions}</p>
        </div>
        <div className="bg-slate-50 rounded-lg py-1.5 px-2">
          <p className="text-[10px] text-slate-400">Clics</p>
          <p className="text-xs font-bold text-slate-700">{promotion.clicks}</p>
        </div>
        <div className="bg-slate-50 rounded-lg py-1.5 px-2">
          <p className="text-[10px] text-slate-400">Conversiones</p>
          <p className="text-xs font-bold text-slate-700">{promotion.conversions}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => onEdit(promotion)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer">
          <Eye size={12} /> Editar
        </button>
        {promotion.status === 'draft' && (
          <button onClick={() => onSend(promotion.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold text-white rounded-lg hover:opacity-90 cursor-pointer" style={{ backgroundColor: themeColor }}>
            <Send size={12} /> Enviar
          </button>
        )}
        <button onClick={() => onDelete(promotion.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
