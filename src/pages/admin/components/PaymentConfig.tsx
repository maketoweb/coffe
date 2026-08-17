import React, { useState } from 'react';
import { StoreConfig } from '../../../types/store';
import { CreditCard, Save } from 'lucide-react';

interface PaymentConfigProps {
  config: StoreConfig;
  onUpdate: (updates: Partial<StoreConfig>) => void;
}

export const PaymentConfig: React.FC<PaymentConfigProps> = ({ config, onUpdate }) => {
  const [localConfig, setLocalConfig] = useState({
    pagomovil_enabled: config.pagomovil_enabled ?? true,
    pagomovil_data: config.pagomovil_data || '',
    pagomovil_discount_percent: config.pagomovil_discount_percent || 0,
    zelle_enabled: config.zelle_enabled ?? true,
    zelle_data: config.zelle_data || '',
    zelle_discount_percent: config.zelle_discount_percent || 0,
    efectivo_enabled: config.efectivo_enabled ?? true,
    efectivo_data: config.efectivo_data || '',
    efectivo_discount_percent: config.efectivo_discount_percent || 0,
    transferencia_enabled: config.transferencia_enabled ?? true,
    transferencia_data: config.transferencia_data || '',
    transferencia_discount_percent: config.transferencia_discount_percent || 0,
    tasa_cambio: config.tasa_cambio || 0,
  });

  const handleChange = (field: string, value: string | number | boolean) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(localConfig);
  };

  const methods = [
    { key: 'pagomovil', label: 'Pago Móvil', dataField: 'pagomovil_data', enabledField: 'pagomovil_enabled', discountField: 'pagomovil_discount_percent' },
    { key: 'zelle', label: 'Zelle', dataField: 'zelle_data', enabledField: 'zelle_enabled', discountField: 'zelle_discount_percent' },
    { key: 'efectivo', label: 'Efectivo', dataField: 'efectivo_data', enabledField: 'efectivo_enabled', discountField: 'efectivo_discount_percent' },
    { key: 'transferencia', label: 'Transferencia', dataField: 'transferencia_data', enabledField: 'transferencia_enabled', discountField: 'transferencia_discount_percent' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2"><CreditCard size={14} /> Métodos de Pago</h4>
        <button onClick={handleSave} className="flex items-center gap-1 text-[11px] font-semibold text-white bg-violet-600 rounded-lg px-3 py-2 hover:bg-violet-700 cursor-pointer">
          <Save size={12} /> Guardar
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Tasa USD/BS</label>
        <input type="number" step="0.01" value={localConfig.tasa_cambio} onChange={e => handleChange('tasa_cambio', Number(e.target.value))} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500 w-40" />
      </div>

      <div className="flex flex-col gap-3">
        {methods.map(m => (
          <div key={m.key} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                <input type="checkbox" checked={localConfig[m.enabledField as keyof typeof localConfig] as boolean} onChange={e => handleChange(m.enabledField, e.target.checked)} className="accent-violet-600" />
                {m.label}
              </label>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span>Descuento</span>
                <input type="number" min="0" max="50" step="1" value={localConfig[m.discountField as keyof typeof localConfig] as number} onChange={e => handleChange(m.discountField, Number(e.target.value))} className="w-14 bg-white border border-slate-300 rounded px-2 py-1 text-[11px] outline-none text-center" />
                <span>%</span>
              </div>
            </div>
            <textarea value={localConfig[m.dataField as keyof typeof localConfig] as string} onChange={e => handleChange(m.dataField, e.target.value)} rows={2} placeholder="Datos de pago..." className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] outline-none focus:border-violet-500 resize-none" />
          </div>
        ))}
      </div>
    </div>
  );
};
