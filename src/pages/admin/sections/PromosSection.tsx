import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/AppContext';
import { Promotion, FoodItem } from '../../../types/store';
import { supabase } from '../../../store/supabaseClient';
import { Megaphone, Tag, Send, Search, Percent, Plus } from 'lucide-react';
import { PromotionForm } from '../components/PromotionForm';
import { PromotionCard } from '../components/PromotionCard';

const PromosSection: React.FC = () => {
  const { foodItems, updateFoodItem, addNotification, config } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  useEffect(() => {
    const loadPromotions = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
      if (data) setPromotions(data as Promotion[]);
    };
    loadPromotions();
  }, []);

  const categories = ['Todas', ...new Set(foodItems.map(p => p.categoria))];
  
  const filteredProducts = foodItems.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const promoProducts = filteredProducts.filter(p => p.es_promo);
  const regularProducts = filteredProducts.filter(p => !p.es_promo);

  const toggleProductPromo = (productId: string) => {
    const product = foodItems.find(p => p.id === productId);
    if (product) {
      updateFoodItem(productId, { es_promo: !product.es_promo });
    }
  };

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllPromoProducts = () => {
    setSelectedProducts(promoProducts.map(p => p.id));
  };

  const sendPromoNotification = async () => {
    if (!promoTitle.trim() || !promoMessage.trim()) {
      alert('Por favor completa el título y mensaje de la promoción');
      return;
    }

    const success = await addNotification(
      promoTitle.trim(), 
      promoMessage.trim(), 
      'todos', 
      undefined, 
      '', 
      ''
    );

    if (success) {
      alert('¡Notificación de promoción enviada a todos los clientes!');
      setPromoTitle('');
      setPromoMessage('');
      setShowSendModal(false);
      setSelectedProducts([]);
    } else {
      alert('Error al enviar la notificación');
    }
  };

  const handleSavePromotion = async (promoData: Omit<Promotion, 'id' | 'created_at'>) => {
    if (editingPromo) {
      if (supabase) {
        const { data } = await supabase.from('promotions').update(promoData).eq('id', editingPromo.id).select().single();
        if (data) setPromotions(prev => prev.map(p => p.id === editingPromo.id ? data as Promotion : p));
      }
    } else {
      if (supabase) {
        const { data } = await supabase.from('promotions').insert([promoData]).select().single();
        if (data) setPromotions(prev => [data as Promotion, ...prev]);
      }
    }
    setShowPromoForm(false);
    setEditingPromo(null);
  };

  const handleDeletePromotion = async (id: string) => {
    if (confirm('¿Eliminar esta promoción?')) {
      if (supabase) {
        await supabase.from('promotions').delete().eq('id', id);
      }
      setPromotions(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSendPromotion = async (id: string) => {
    const promo = promotions.find(p => p.id === id);
    if (!promo) return;
    if (supabase) {
      await supabase.from('promotions').update({ status: 'active', sent_at: new Date().toISOString() }).eq('id', id);
    }
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, status: 'active' as const, sent_at: new Date().toISOString() } : p));
    await addNotification(promo.title, promo.message, 'todos', undefined, promo.image_url || '', '');
  };

  const ProductCard: React.FC<{ product: FoodItem; isPromo: boolean }> = ({ product, isPromo }) => (
    <div className={`p-3 rounded-xl border transition-all ${isPromo ? 'bg-violet-50 border-violet-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
          <img src={product.imagen_urls[0]} alt={product.nombre} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h5 className="text-xs font-bold text-slate-900 truncate">{product.nombre}</h5>
            {isPromo && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-violet-100 text-violet-700 border border-violet-200">
                PROMO
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            <span className="font-mono">${product.precio_usd.toFixed(2)}</span>
            <span className="mx-1">•</span>
            <span>{product.categoria}</span>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => toggleSelectProduct(product.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedProducts.includes(product.id) 
                ? 'bg-violet-100 text-violet-600' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            title={selectedProducts.includes(product.id) ? 'Deseleccionar' : 'Seleccionar'}
          >
            <Tag size={13} />
          </button>
          <button
            onClick={() => toggleProductPromo(product.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              isPromo 
                ? 'bg-violet-600 text-white hover:bg-violet-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-600 border border-slate-200 hover:border-violet-200'
            }`}
          >
            {isPromo ? 'Quitar Promo' : 'Marcar Promo'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Promotions CRUD Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase">Promociones Activas</h3>
            <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">{promotions.length}</span>
          </div>
          <button
            onClick={() => { setEditingPromo(null); setShowPromoForm(true); }}
            className="px-3 py-1.5 text-[10px] font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-1"
          >
            <Plus size={12} /> Nueva Promoción
          </button>
        </div>

        {promotions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No hay promociones creadas. Crea la primera para empezar a captar clientes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {promotions.map(promo => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                themeColor={config.theme_color || '#0f5d34'}
                onEdit={(p) => { setEditingPromo(p); setShowPromoForm(true); }}
                onDelete={handleDeletePromotion}
                onSend={handleSendPromotion}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Promo Toggle Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase">Gestión de Promociones</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAllPromoProducts}
              className="px-3 py-1.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Seleccionar Todos ({promoProducts.length})
            </button>
            <button
              onClick={() => setShowSendModal(true)}
              disabled={selectedProducts.length === 0}
              className="px-3 py-1.5 text-[10px] font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Send size={12} /> Enviar a ({selectedProducts.length})
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o categoría..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:border-violet-500 transition-all"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3">
          {promoProducts.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Percent size={12} /> En Promoción ({promoProducts.length})
              </h4>
              <div className="flex flex-col gap-2">
                {promoProducts.map(product => (
                  <ProductCard key={product.id} product={product} isPromo={true} />
                ))}
              </div>
            </div>
          )}

          {regularProducts.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Disponibles ({regularProducts.length})
              </h4>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                {regularProducts.map(product => (
                  <ProductCard key={product.id} product={product} isPromo={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showSendModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Enviar Promoción</h4>
              <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
              <p className="text-xs font-bold text-violet-800">
                Enviando a {selectedProducts.length} producto(s) en promoción
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedProducts.map(id => {
                  const product = foodItems.find(p => p.id === id);
                  return product ? (
                    <span key={id} className="text-[9px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                      {product.nombre}
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Título de la Promoción</label>
              <input
                type="text"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                placeholder="Ej: ¡Oferta Especial en Productos Seleccionados!"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Mensaje</label>
              <textarea
                value={promoMessage}
                onChange={(e) => setPromoMessage(e.target.value)}
                placeholder="Escribe los detalles de la promoción..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs outline-none focus:border-violet-500 min-h-[100px]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={sendPromoNotification}
                className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors flex items-center justify-center gap-1"
              >
                <Send size={12} /> Enviar Notificación
              </button>
            </div>
          </div>
        </div>
      )}

      {showPromoForm && (
        <PromotionForm
          promotion={editingPromo}
          foodItems={foodItems}
          onSave={handleSavePromotion}
          onSendNotification={async (title, message, imageUrl) => {
            return await addNotification(title, message, 'todos', undefined, imageUrl || '', '');
          }}
          onClose={() => { setShowPromoForm(false); setEditingPromo(null); }}
        />
      )}
    </div>
  );
};

export default PromosSection;