import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
  itemCount: number;
  total: number;
  onClick: () => void;
  themeColor: string;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  itemCount,
  total,
  onClick,
  themeColor,
}) => {
  if (itemCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all active:scale-95 hover:shadow-xl cursor-pointer"
      style={{
        backgroundColor: themeColor,
        color: '#ffffff',
        boxShadow: `0 8px 32px ${themeColor}40, 0 2px 8px rgba(0,0,0,0.1)`,
      }}
      aria-label={`Ir al carrito con ${itemCount} items`}
    >
      <div className="relative">
        <ShoppingCart size={20} />
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-[10px] font-bold flex items-center justify-center" style={{ color: themeColor }}>
          {itemCount > 9 ? '+9' : itemCount}
        </span>
      </div>
      <span className="text-sm font-bold">
        Ver carrito
      </span>
      <span className="text-xs font-bold opacity-80">
        ${total.toFixed(2)}
      </span>
    </button>
  );
};
