import React, { useState } from 'react';
import { StoreConfig } from '../../../types/store';
import { Palette } from 'lucide-react';

interface BrandingEditorProps {
  config: StoreConfig;
  onUpdate: (updates: Partial<StoreConfig>) => void;
}

export const BrandingEditor: React.FC<BrandingEditorProps> = ({ config, onUpdate }) => {
  const [themeColor, setThemeColor] = useState(config.theme_color || '#FF2D95');
  const [secondaryColor, setSecondaryColor] = useState(config.secondary_color || '#FF6B35');
  const [accentColor, setAccentColor] = useState(config.accent_color || '#FFBE0B');
  const [siteNombre, setSiteNombre] = useState(config.site_nombre || '');
  const [mensajeBienvenida, setMensajeBienvenida] = useState(config.mensaje_bienvenida || '');

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border border-slate-200 rounded-xl">
      <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2"><Palette size={14} /> Identidad de Marca</h4>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre de la tienda</label>
        <input value={siteNombre} onChange={e => setSiteNombre(e.target.value)} onBlur={() => onUpdate({ site_nombre: siteNombre })} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Mensaje de bienvenida</label>
        <textarea value={mensajeBienvenida} onChange={e => setMensajeBienvenida(e.target.value)} onBlur={() => onUpdate({ mensaje_bienvenida: mensajeBienvenida })} rows={2} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500 resize-none" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Colores de marca</label>
        <div className="flex items-center gap-3">
          {[
            { label: 'Primario', value: themeColor, set: setThemeColor, field: 'theme_color' as const },
            { label: 'Secundario', value: secondaryColor, set: setSecondaryColor, field: 'secondary_color' as const },
            { label: 'Acento', value: accentColor, set: setAccentColor, field: 'accent_color' as const },
          ].map(c => (
            <div key={c.field} className="flex items-center gap-2">
              <input type="color" value={c.value} onChange={e => c.set(e.target.value)} onBlur={() => onUpdate({ [c.field]: c.value })} className="w-8 h-8 rounded-lg cursor-pointer border-0" />
              <div>
                <p className="text-[10px] font-medium text-slate-600">{c.label}</p>
                <p className="text-[9px] font-mono text-slate-400">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Logo URL</label>
        <input value={config.logo_url || ''} onChange={e => onUpdate({ logo_url: e.target.value })} placeholder="https://..." className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Favicon URL</label>
        <input value={config.favicon_url || ''} onChange={e => onUpdate({ favicon_url: e.target.value })} placeholder="https://..." className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet-500" />
      </div>
    </div>
  );
};
