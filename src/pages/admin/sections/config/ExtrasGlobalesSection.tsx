import React, { useState } from 'react';
import { useApp } from '../../../../store/AppContext';
import { FoodOptionGroup, FoodOption } from '../../../../types/store';
import { Plus, Trash2, X, Check, SlidersHorizontal } from 'lucide-react';

const ExtrasGlobalesSection: React.FC = () => {
  const { foodItems, updateFoodItem } = useApp();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [editingGroupName, setEditingGroupName] = useState('');
  const [editingOptionName, setEditingOptionName] = useState('');
  const [editingOptionPrice, setEditingOptionPrice] = useState(0);
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const selectedProduct = foodItems.find(p => p.id === selectedProductId);
  const optionGroups: FoodOptionGroup[] = selectedProduct?.option_groups || [];

  const saveGroups = (groups: FoodOptionGroup[]) => {
    if (selectedProduct) updateFoodItem(selectedProduct.id, { option_groups: groups });
  };

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup: FoodOptionGroup = { id: `og-${crypto.randomUUID()}`, nombre: newGroupName.trim(), min_select: 0, max_select: 1, options: [] };
    saveGroups([...optionGroups, newGroup]);
    setNewGroupName('');
    setShowNewGroupInput(false);
  };

  const deleteGroup = (groupId: string) => {
    saveGroups(optionGroups.filter(g => g.id !== groupId));
    setDeleteConfirm(null);
  };

  const addOption = (groupId: string) => {
    setEditingGroupName(groupId);
    setEditingOptionName('');
    setEditingOptionPrice(0);
  };

  const saveOption = (groupId: string) => {
    if (!editingOptionName.trim()) return;
    const newOption: FoodOption = { id: `opt-${crypto.randomUUID()}`, nombre: editingOptionName.trim(), precio_usd: editingOptionPrice, activo: true };
    const updated = optionGroups.map(g => g.id === groupId ? { ...g, options: [...g.options, newOption] } : g);
    saveGroups(updated);
    setEditingGroupName('');
    setEditingOptionName('');
    setEditingOptionPrice(0);
  };

  const deleteOption = (groupId: string, optionId: string) => {
    const updated = optionGroups.map(g => g.id === groupId ? { ...g, options: g.options.filter(o => o.id !== optionId) } : g);
    saveGroups(updated);
  };

  const updateGroupLimits = (groupId: string, field: 'min_select' | 'max_select', value: number) => {
    const updated = optionGroups.map(g => g.id === groupId ? { ...g, [field]: value } : g);
    saveGroups(updated);
  };

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="admin-label mb-3">{children}</p>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="admin-card p-4">
        <SectionTitle>Gestion de Extras / Opciones</SectionTitle>
        <p className="text-[11px] text-slate-500 mb-3">Configura los grupos de opciones (extras) para cada producto del catalogo.</p>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Seleccionar Producto</span>
          <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
            className="admin-input">
            <option value="">-- Selecciona un producto --</option>
            {foodItems.map(p => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
          </select>
        </div>

        {selectedProduct && (
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Grupos de Opciones de "{selectedProduct.nombre}"</span>
              {showNewGroupInput ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Nombre del grupo" className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px]" autoFocus />
                  <button onClick={addGroup} className="bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"><Check size={12} /></button>
                  <button onClick={() => { setShowNewGroupInput(false); setNewGroupName(''); }} className="text-slate-400 px-1 cursor-pointer"><X size={12} /></button>
                </div>
              ) : (
                <button onClick={() => setShowNewGroupInput(true)} className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer">
                  <Plus size={12} /> Agregar Grupo
                </button>
              )}
            </div>

            {optionGroups.length === 0 && (
              <p className="text-[11px] text-slate-400 italic text-center py-4">Este producto no tiene grupos de opciones configurados.</p>
            )}

            {optionGroups.map(group => (
              <div key={group.id} className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{group.nombre}</span>
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                      <span>Min:</span>
                      <input type="number" min="0" max={group.max_select} value={group.min_select}
                        onChange={(e) => updateGroupLimits(group.id, 'min_select', parseInt(e.target.value) || 0)}
                        className="w-10 border border-slate-300 rounded px-1 py-0.5 text-center text-[10px]" />
                      <span>Max:</span>
                      <input type="number" min={group.min_select} value={group.max_select}
                        onChange={(e) => updateGroupLimits(group.id, 'max_select', parseInt(e.target.value) || 1)}
                        className="w-10 border border-slate-300 rounded px-1 py-0.5 text-center text-[10px]" />
                    </div>
                    {deleteConfirm === group.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteGroup(group.id)} className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded cursor-pointer font-bold">Si</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] rounded cursor-pointer font-bold">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(group.id)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer"><Trash2 size={12} /></button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {group.options.map(opt => (
                    <div key={opt.id} className="flex items-center justify-between bg-slate-50 p-2 rounded text-[11px]">
                      <span>{opt.nombre} <strong className="text-violet-600 font-mono">{opt.precio_usd > 0 ? `+$${opt.precio_usd}` : 'Gratis'}</strong></span>
                      <button onClick={() => deleteOption(group.id, opt.id)} className="text-rose-400 hover:text-rose-600"><X size={12} /></button>
                    </div>
                  ))}
                </div>

                {editingGroupName === group.id ? (
                  <div className="flex gap-2 items-end mt-1">
                    <input type="text" value={editingOptionName} onChange={(e) => setEditingOptionName(e.target.value)}
                      placeholder="Nombre" className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]" autoFocus />
                    <input type="number" value={editingOptionPrice} onChange={(e) => setEditingOptionPrice(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]" />
                    <button onClick={() => saveOption(group.id)} className="bg-emerald-500 text-white px-3 py-1 rounded text-[10px] font-bold cursor-pointer"><Check size={12} /></button>
                    <button onClick={() => setEditingGroupName('')} className="text-slate-400 px-2 py-1 cursor-pointer"><X size={12} /></button>
                  </div>
                ) : (
                  <button onClick={() => addOption(group.id)} className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded p-1.5 text-[10px] font-bold transition-colors mt-1 cursor-pointer">
                    <Plus size={12} /> Agregar Opcion
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtrasGlobalesSection;
