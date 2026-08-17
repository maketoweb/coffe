import React from 'react';
import { useApp } from '../store/AppContext';
import { FoodItem } from '../types/store';
import { Plus } from 'lucide-react';

interface CartUpsellProps {
  onAddToCart: (item: FoodItem) => void;
}

export const CartUpsell: React.FC<CartUpsellProps> = ({ onAddToCart }) => {
  const { cart, foodItems, config } = useApp();

  if (cart.length === 0) return null;

  const themeColor = config.theme_color || '#0f5d34';

  const cartItemIds = new Set(cart.map(ci => ci.item.id));

  const hasBebidas = cart.some(ci => ci.item.categoria.toLowerCase().includes('bebida') || ci.item.categoria.toLowerCase().includes('drink'));
  const hasPostres = cart.some(ci => ci.item.categoria.toLowerCase().includes('postre') || ci.item.categoria.toLowerCase().includes('dessert'));
  const hasPapas = cart.some(ci => ci.item.categoria.toLowerCase().includes('papa') || ci.item.categoria.toLowerCase().includes('fries'));

  const isBurgerCategory = (cat: string) => cat.toLowerCase().includes('hamburguesa') || cat.toLowerCase().includes('burger');

  const suggestions: { items: FoodItem[]; message: string }[] = [];

  if (!hasBebidas) {
    const bebidas = foodItems.filter(f =>
      f.activo !== false &&
      !cartItemIds.has(f.id) &&
      (f.categoria.toLowerCase().includes('bebida') || f.categoria.toLowerCase().includes('drink')) &&
      f.stock > 0
    ).slice(0, 2);
    if (bebidas.length > 0) {
      suggestions.push({ items: bebidas, message: 'Agregá una bebida' });
    }
  }

  if (!hasPostres) {
    const postres = foodItems.filter(f =>
      f.activo !== false &&
      !cartItemIds.has(f.id) &&
      (f.categoria.toLowerCase().includes('postre') || f.categoria.toLowerCase().includes('dessert')) &&
      f.stock > 0
    ).slice(0, 2);
    if (postres.length > 0) {
      suggestions.push({ items: postres, message: 'Completá con un postre' });
    }
  }

  if (!hasPapas && cart.some(ci => isBurgerCategory(ci.item.categoria))) {
    const papas = foodItems.filter(f =>
      f.activo !== false &&
      !cartItemIds.has(f.id) &&
      (f.categoria.toLowerCase().includes('papa') || f.categoria.toLowerCase().includes('fries') || f.categoria.toLowerCase().includes('acompañamiento')) &&
      f.stock > 0
    ).slice(0, 2);
    if (papas.length > 0) {
      suggestions.push({ items: papas, message: 'Completá tu combo con papas' });
    }
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="p-3 border border-zinc-200 rounded-lg bg-amber-50/50">
      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-2">¿Algo más?</p>
      {suggestions.map((sug, si) => (
        <div key={si} className="mb-2 last:mb-0">
          <p className="text-[11px] text-amber-600 mb-1.5">{sug.message}</p>
          <div className="flex gap-2">
            {sug.items.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => onAddToCart(item)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200 rounded-lg text-[11px] font-semibold text-zinc-800 hover:border-amber-400 transition-all cursor-pointer flex-1"
              >
                <div className="w-8 h-8 rounded-md overflow-hidden bg-zinc-100 shrink-0">
                  <img src={item.imagen_urls[0]} alt={item.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="line-clamp-1">{item.nombre}</p>
                  <p className="font-mono font-bold" style={{ color: themeColor }}>${item.precio_usd.toFixed(2)}</p>
                </div>
                <Plus size={14} style={{ color: themeColor }} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
