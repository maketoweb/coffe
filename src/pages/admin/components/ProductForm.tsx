import React, { useState } from 'react';
import { FoodItem } from '../../../types/store';
import { X, Save } from 'lucide-react';

interface ProductFormProps {
  product?: FoodItem | null;
  categories: string[];
  subcategories?: Record<string, string[]>;
  onSave: (product: Partial<FoodItem>) => Promise<void>;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, categories, subcategories, onSave, onClose }) => {
  const [nombre, setNombre] = useState(product?.nombre || '');
  const [descripcion, setDescripcion] = useState(product?.descripcion || '');
  const [categoria, setCategoria] = useState(product?.categoria || categories[0] || '');
  const [subcategoria, setSubcategoria] = useState(product?.subcategoria || '');
  const [precio, setPrecio] = useState(product?.precio_usd || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [esPromo, setEsPromo] = useState<boolean>(product?.es_promo || false);
  const [esNuevo, setEsNuevo] = useState<boolean>(product?.es_nuevo ?? true);
  const [esMasVendido, setEsMasVendido] = useState<boolean>(product?.es_mas_vendido || false);
  const [deliveryGratis, setDeliveryGratis] = useState<boolean>(product?.delivery_gratis || false);
  const [activo, setActivo] = useState<boolean>(product?.activo !== false);
  const [saving, setSaving] = useState(false);

  const availableSubcategories = subcategories?.[categoria] || [];

  const handleSave = async () => {
    if (!nombre.trim()) { alert('El nombre es obligatorio'); return; }
    if (precio <= 0) { alert('El precio debe ser mayor a 0'); return; }
    setSaving(true);
    try {
      await onSave({
        nombre: nombre.trim(),
        descripcion,
        categoria,
        subcategoria: subcategoria || undefined,
        precio_usd: precio,
        stock,
        es_promo: esPromo,
        es_nuevo: esNuevo,
        es_mas_vendido: esMasVendido,
        delivery_gratis: deliveryGratis,
        activo,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-base font-bold text-slate-900">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre *</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Categoría</label>
              <select value={categoria} onChange={e => { setCategoria(e.target.value); setSubcategoria(''); }} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Subcategoría</label>
              <select value={subcategoria} onChange={e => setSubcategoria(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" disabled={availableSubcategories.length === 0}>
                <option value="">Sin subcategoría</option>
                {availableSubcategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Precio ($)</label>
              <input type="number" min="0" step="0.10" value={precio} onChange={e => setPrecio(Number(e.target.value))} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Stock</label>
              <input type="number" min="0" value={stock} onChange={e => setStock(Number(e.target.value))} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px]">
            {[
              { label: 'Promo', checked: esPromo, onChange: (v: boolean) => setEsPromo(v) },
              { label: 'Nuevo', checked: esNuevo, onChange: (v: boolean) => setEsNuevo(v) },
              { label: 'Más vendido', checked: esMasVendido, onChange: (v: boolean) => setEsMasVendido(v) },
              { label: 'Envío gratis', checked: deliveryGratis, onChange: (v: boolean) => setDeliveryGratis(v) },
              { label: 'Activo', checked: activo, onChange: (v: boolean) => setActivo(v) },
            ].map(opt => (
              <label key={opt.label} className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={opt.checked} onChange={e => opt.onChange(e.target.checked)} className="accent-violet-600 h-3.5 w-3.5 rounded" />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-3 flex justify-end gap-2 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer">
            <Save size={14} />{saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};
