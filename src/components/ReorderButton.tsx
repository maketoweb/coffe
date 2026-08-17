import React from 'react';
import { useApp } from '../store/AppContext';
import { Order } from '../types/store';
import { RotateCcw } from 'lucide-react';

interface ReorderButtonProps {
  order: Order;
  onNavigateToCheckout?: () => void;
}

export const ReorderButton: React.FC<ReorderButtonProps> = ({ order, onNavigateToCheckout }) => {
  const { addToCart, foodItems, config } = useApp();
  const themeColor = config.theme_color || '#0f5d34';

  const handleReorder = () => {
    order.items.forEach(orderItem => {
      const foodItem = foodItems.find(f => f.id === orderItem.food_id);
      if (foodItem && foodItem.stock >= orderItem.cantidad) {
        for (let i = 0; i < orderItem.cantidad; i++) {
          addToCart(foodItem, 1, orderItem.selected_options, orderItem.options_total_usd, orderItem.ingredientes_removidos);
        }
      }
    });
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    }
  };

  return (
    <button
      type="button"
      onClick={handleReorder}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer hover:opacity-90"
      style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
    >
      <RotateCcw size={12} />
      Reordenar
    </button>
  );
};
