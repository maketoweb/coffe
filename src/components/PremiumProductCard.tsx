import React, { useState } from 'react';
import { FoodItem, StoreConfig } from '../types/store';
import { Plus, Star, Users, Flame, Clock, Heart, TrendingUp } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { RippleButton } from './RippleButton';

interface PremiumProductCardProps {
  item: FoodItem;
  config: StoreConfig;
  onViewProductDetails: (item: FoodItem) => void;
  addToCart: (item: FoodItem) => void;
  averageRating?: number;
  reviewCount?: number;
  index?: number;
}

export const PremiumProductCard: React.FC<PremiumProductCardProps> = ({
  item,
  config,
  onViewProductDetails,
  addToCart,
  averageRating = 0,
  reviewCount = 0,
  index = 0,
}) => {
  const { toggleFavorite, isFavorite } = useApp();
  const [isAnimatingHeart, setIsAnimatingHeart] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const isAgotado = item.stock <= 0;
  const themeColor = config.theme_color || '#E31837';
  const isLowStock = item.stock > 0 && item.stock < (config.stock_alert_threshold || 5);
  const isFav = isFavorite(item.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAgotado) return;
    addToCart(item);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 1500);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimatingHeart(true);
    toggleFavorite(item.id);
    setTimeout(() => setIsAnimatingHeart(false), 600);
  };

  return (
    <div
      className="shrink-0 w-[170px] sm:w-[215px] flex flex-col bg-white rounded-2xl overflow-hidden group relative border border-zinc-100 hover:border-zinc-200 cursor-pointer premium-hover"
      style={{
        opacity: 0,
        animation: `fadeInScale 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms forwards`,
      }}
      onClick={() => onViewProductDetails(item)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-50">
        <img
          src={item.imagen_urls[0]}
          alt={item.nombre}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isAgotado ? 'grayscale opacity-50' : ''}`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Heart button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isFav
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-zinc-600 hover:bg-white hover:text-red-500'
          } ${isAnimatingHeart ? 'animate-heart-beat' : ''}`}
        >
          <Heart size={14} fill={isFav ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        {/* Top badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {item.es_promo && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-sm bg-black/60"
              style={{ backgroundColor: `${themeColor}ee` }}
            >
              <Flame size={9} className="inline mr-0.5" /> PROMO
            </span>
          )}
          {item.es_nuevo && !item.es_promo && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/90 text-white shadow-md backdrop-blur-sm">
              NUEVO
            </span>
          )}
          {item.es_mas_vendido && !item.es_promo && !item.es_nuevo && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-500/90 text-white shadow-md backdrop-blur-sm flex items-center gap-0.5">
              <TrendingUp size={9} /> TOP
            </span>
          )}
          {isAgotado && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-zinc-800/90 text-white shadow-md backdrop-blur-sm">
              AGOTADO
            </span>
          )}
          {isLowStock && !isAgotado && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-sm animate-pulse" style={{ backgroundColor: themeColor }}>
              Solo quedan {item.stock}
            </span>
          )}
        </div>

        {/* Prep time badge */}
        {item.estimated_prep_time && (
          <div className="absolute bottom-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
            <Clock size={10} />
            <span className="text-[10px] font-bold">~{item.estimated_prep_time} min</span>
          </div>
        )}

        {/* Quick add button */}
        <RippleButton
          onClick={handleAddToCart}
          disabled={isAgotado}
          className="absolute bottom-2 right-2 z-10 w-10 h-10 rounded-xl flex items-center justify-center shadow-xl transition-all duration-200 active:scale-90 hover:scale-110 hover:shadow-2xl disabled:opacity-50"
          style={{ backgroundColor: themeColor }}
        >
          <Plus size={18} className="text-white" strokeWidth={2.5} />
        </RippleButton>

        {/* Added toast */}
        {showAddedToast && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-fade-in-scale flex items-center gap-1.5">
              <span className="text-base">✓</span> ¡Agregado!
            </div>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h4 className="text-[13px] font-bold text-zinc-900 line-clamp-2 leading-tight min-h-[2rem] group-hover:text-zinc-700 transition-colors">
          {item.nombre}
        </h4>
        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
          {item.descripcion}
        </p>

        {/* Social proof */}
        <div className="flex items-center gap-2 flex-wrap">
          {averageRating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
              <Star size={10} fill="currentColor" strokeWidth={0} />
              {averageRating.toFixed(1)}
              {reviewCount > 0 && <span className="text-zinc-400 font-normal">({reviewCount})</span>}
            </span>
          )}
          {item.order_count !== undefined && item.order_count > 0 && (
            <span className="flex items-center gap-0.5 text-[9px] text-zinc-400">
              <Users size={8} />
              {item.order_count} vendidos
            </span>
          )}
        </div>

        {/* Delivery gratis badge */}
        {item.delivery_gratis && (
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
            🚚 Delivery Gratis
          </span>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-zinc-100">
          <div className="flex flex-col">
            {item.es_promo && item.precio_anterior_usd && item.precio_anterior_usd > item.precio_usd && (
              <span className="text-[10px] text-zinc-400 line-through font-medium">
                ${item.precio_anterior_usd.toFixed(2)}
              </span>
            )}
            <span className="text-base font-black" style={{ color: themeColor }}>
              ${item.precio_usd.toFixed(2)}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onViewProductDetails(item); }}
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md hover:bg-zinc-50 transition-colors cursor-pointer flex items-center gap-1"
            style={{ color: themeColor }}
          >
            Ordenar
          </button>
        </div>
      </div>
    </div>
  );
};
