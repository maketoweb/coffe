import React from 'react';
import { Promotion } from '../../../types/store';
import { TrendingUp, MousePointerClick, ShoppingCart, Eye } from 'lucide-react';

interface PromotionStatsProps {
  promotion: Promotion;
  themeColor: string;
}

export const PromotionStats: React.FC<PromotionStatsProps> = ({ promotion, themeColor }) => {
  const ctr = promotion.impressions > 0 ? ((promotion.clicks / promotion.impressions) * 100).toFixed(1) : '0';
  const conversionRate = promotion.clicks > 0 ? ((promotion.conversions / promotion.clicks) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Estadísticas en vivo</h4>
      <div className="grid grid-cols-4 gap-3">
        <div className="flex flex-col items-center gap-1 bg-slate-50 rounded-lg py-3 px-2">
          <Eye size={16} className="text-slate-400" />
          <span className="text-lg font-black text-slate-800">{promotion.impressions}</span>
          <span className="text-[9px] text-slate-400 font-medium">Impresiones</span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-slate-50 rounded-lg py-3 px-2">
          <MousePointerClick size={16} style={{ color: themeColor }} />
          <span className="text-lg font-black" style={{ color: themeColor }}>{promotion.clicks}</span>
          <span className="text-[9px] text-slate-400 font-medium">Clics ({ctr}%)</span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-slate-50 rounded-lg py-3 px-2">
          <ShoppingCart size={16} className="text-green-500" />
          <span className="text-lg font-black text-green-600">{promotion.conversions}</span>
          <span className="text-[9px] text-slate-400 font-medium">Conversiones</span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-slate-50 rounded-lg py-3 px-2">
          <TrendingUp size={16} className="text-blue-500" />
          <span className="text-lg font-black text-blue-600">{conversionRate}%</span>
          <span className="text-[9px] text-slate-400 font-medium">Tasa conversión</span>
        </div>
      </div>
      {promotion.max_uses && promotion.max_uses > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span>Usos del cupón</span>
            <span>{promotion.current_uses} / {promotion.max_uses}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (promotion.current_uses / promotion.max_uses) * 100)}%`, backgroundColor: themeColor }} />
          </div>
        </div>
      )}
    </div>
  );
};
