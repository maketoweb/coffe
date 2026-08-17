import React, { useState } from 'react';
import { DeliveryZone } from '../../../types/store';
import { Plus, Trash2, Save } from 'lucide-react';

interface ZoneEditorProps {
  zones: DeliveryZone[];
  onUpdate: (zones: DeliveryZone[]) => void;
}

export const ZoneEditor: React.FC<ZoneEditorProps> = ({ zones, onUpdate }) => {
  const [localZones, setLocalZones] = useState<DeliveryZone[]>(zones);

  const addZone = () => {
    setLocalZones([...localZones, { id: `z-${Date.now()}`, name: '', cost: 0, minKm: 0, maxKm: 5 }]);
  };

  const updateZone = (idx: number, field: keyof DeliveryZone, value: string | number) => {
    const updated = [...localZones];
    updated[idx] = { ...updated[idx], [field]: value };
    setLocalZones(updated);
  };

  const removeZone = (idx: number) => {
    setLocalZones(localZones.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 uppercase">Zonas de Delivery</h4>
        <button onClick={addZone} className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-800 cursor-pointer">
          <Plus size={12} /> Agregar zona
        </button>
      </div>
      {localZones.length === 0 && <p className="text-[11px] text-slate-400 italic">No hay zonas configuradas</p>}
      {localZones.map((zone, idx) => (
        <div key={zone.id} className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg">
          <input value={zone.name} onChange={e => updateZone(idx, 'name', e.target.value)} placeholder="Nombre" className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-[11px] outline-none focus:border-violet-500" />
          <input type="number" min="0" value={zone.minKm} onChange={e => updateZone(idx, 'minKm', Number(e.target.value))} className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-[11px] outline-none focus:border-violet-500 text-center" />
          <span className="text-[10px] text-slate-400">-</span>
          <input type="number" min="0" value={zone.maxKm} onChange={e => updateZone(idx, 'maxKm', Number(e.target.value))} className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-[11px] outline-none focus:border-violet-500 text-center" />
          <span className="text-[10px] text-slate-400">km · $</span>
          <input type="number" min="0" step="0.5" value={zone.cost} onChange={e => updateZone(idx, 'cost', Number(e.target.value))} className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-[11px] outline-none focus:border-violet-500 text-center" />
          <button onClick={() => removeZone(idx)} className="p-1 text-red-400 hover:text-red-600 cursor-pointer"><Trash2 size={12} /></button>
        </div>
      ))}
      <button onClick={() => onUpdate(localZones)} className="self-end flex items-center gap-1 text-[11px] font-semibold text-white bg-violet-600 rounded-lg px-3 py-2 hover:bg-violet-700 cursor-pointer">
        <Save size={12} /> Guardar zonas
      </button>
    </div>
  );
};
