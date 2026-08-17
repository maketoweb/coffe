import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface StickyCartProps {
  onOpenCart: () => void;
}

export const StickyCart: React.FC<StickyCartProps> = ({ onOpenCart }) => {
  const { cart, config } = useApp();
  const themeColor = config.theme_color || '#E31837';

  if (cart.length === 0) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const basePrice = item.item.precio_usd * item.quantity;
    const optionsPrice = item.options_total_usd || 0;
    return sum + basePrice + optionsPrice;
  }, 0);

  return (
    <div className="fixed bottom-24 right-4 z-40 lg:hidden animate-slide-up">
      <button
        onClick={onOpenCart}
        className="flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-2xl shadow-xl transition-all active:scale-95 hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
        }}
      >
        <div className="relative">
          <ShoppingBag size={18} className="text-white" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-[9px] font-black rounded-full flex items-center justify-center" style={{ color: themeColor }}>
            {totalItems}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-white/80 font-medium">Tu pedido</span>
          <span className="text-xs font-black text-white">${totalPrice.toFixed(2)}</span>
        </div>
        <ChevronRight size={14} className="text-white/60" />
      </button>
    </div>
  );
};
