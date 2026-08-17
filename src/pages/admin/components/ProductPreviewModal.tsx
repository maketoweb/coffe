import React from 'react';
import { FoodItem } from '../../../types/store';
import { X, Clock, Users, TrendingUp, Flame, Package, Eye } from 'lucide-react';

interface ProductPreviewModalProps {
  product: FoodItem;
  onClose: () => void;
  onEdit: (product: FoodItem) => void;
  themeColor: string;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  product,
  onClose,
  onEdit,
  themeColor,
}) => {
  const isAgotado = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-violet-600" />
            <h3 className="text-base font-bold text-slate-900">Vista Previa del Producto</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Product Image */}
        <div className="relative w-full h-56 sm:h-64 bg-slate-100 overflow-hidden">
          {product.imagen_urls?.[0] ? (
            <img
              src={product.imagen_urls[0]}
              alt={product.nombre}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.es_promo && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1" style={{ backgroundColor: themeColor }}>
                <Flame size={10} /> PROMO
              </span>
            )}
            {product.es_nuevo && !product.es_promo && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md">
                NUEVO
              </span>
            )}
            {product.es_mas_vendido && !product.es_promo && !product.es_nuevo && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-md flex items-center gap-1">
                <TrendingUp size={10} /> TOP VENDIDO
              </span>
            )}
            {isAgotado && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-zinc-800 text-white shadow-md">
                AGOTADO
              </span>
            )}
            {isLowStock && !isAgotado && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-md animate-pulse" style={{ backgroundColor: themeColor }}>
                Solo quedan {product.stock}
              </span>
            )}
          </div>

          {/* Image count */}
          {product.imagen_urls && product.imagen_urls.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
              1/{product.imagen_urls.length} fotos
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5 flex flex-col gap-4">
          {/* Name and Price */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-slate-900 leading-tight">{product.nombre}</h2>
              <p className="text-xs text-slate-500 mt-1 capitalize">{product.categoria}</p>
            </div>
            <div className="text-right shrink-0">
              {product.es_promo && product.precio_anterior_usd && product.precio_anterior_usd > product.precio_usd && (
                <span className="text-xs text-slate-400 line-through font-medium block">
                  ${product.precio_anterior_usd.toFixed(2)}
                </span>
              )}
              <span className="text-xl font-black" style={{ color: themeColor }}>
                ${product.precio_usd.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Descripción</h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {product.descripcion || 'Sin descripción disponible.'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <Package size={16} className="text-slate-400 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900">{product.stock}</p>
              <p className="text-[10px] text-slate-500">Stock</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <Users size={16} className="text-slate-400 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900">{product.order_count || 0}</p>
              <p className="text-[10px] text-slate-500">Vendidos</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <Clock size={16} className="text-slate-400 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900">{product.estimated_prep_time || '—'}</p>
              <p className="text-[10px] text-slate-500">Min prep</p>
            </div>
          </div>

          {/* Badges/Flags */}
          <div className="flex flex-wrap gap-2">
            {product.activo !== false && (
              <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ Activo
              </span>
            )}
            {product.activo === false && (
              <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                ✗ Inactivo
              </span>
            )}
            {product.delivery_gratis && (
              <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                🚚 Delivery Gratis
              </span>
            )}
            {product.es_promo && (
              <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                🔥 En Promoción
              </span>
            )}
          </div>

          {/* Sizes if available */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tamaños disponibles</h4>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {size.name} — ${size.price_usd?.toFixed(2) || product.precio_usd.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Options if available */}
          {product.option_groups && product.option_groups.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Opciones / Extras</h4>
              <div className="flex flex-col gap-1.5">
                {product.option_groups.map((group, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-xs">
                    <span className="text-slate-700 font-medium">{group.nombre}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{group.options?.length || 0} opciones</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-3 flex justify-end gap-2 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={() => { onEdit(product); onClose(); }}
            className="px-4 py-2.5 text-xs font-semibold text-white rounded-xl hover:opacity-90 cursor-pointer flex items-center gap-2"
            style={{ backgroundColor: themeColor }}
          >
            ✏️ Editar Producto
          </button>
        </div>
      </div>
    </div>
  );
};
