import React from 'react';
import { Promotion } from '../types/store';
import { Sparkles, ChevronRight } from 'lucide-react';

interface PromotionBannerProps {
  promotion: Promotion;
  onClick?: () => void;
  themeColor: string;
}

export const PromotionBanner: React.FC<PromotionBannerProps> = ({ promotion, onClick, themeColor }) => {
  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }}
      onClick={onClick}
    >
      {promotion.image_url && (
        <img src={promotion.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
      )}
      <div className="relative z-10 p-5 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-yellow-300" />
            <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider">Promoción Activa</span>
          </div>
          <h3 className="text-base font-black text-white mb-1 truncate">{promotion.title}</h3>
          <p className="text-[11px] text-white/80 line-clamp-2">{promotion.message}</p>
          {promotion.discount_value > 0 && (
            <span className="inline-block mt-2 text-[11px] font-bold text-white bg-white/20 rounded-full px-3 py-1">
              {promotion.discount_type === 'percent' ? `${promotion.discount_value}% OFF` :
               promotion.discount_type === 'fixed' ? `$${promotion.discount_value} OFF` :
               promotion.discount_type === '2x1' ? '2x1' : 'Combo'}
            </span>
          )}
        </div>
        <ChevronRight size={20} className="text-white/60 group-hover:text-white shrink-0" />
      </div>
    </div>
  );
};
