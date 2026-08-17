import React from 'react';
import { ShieldCheck, Truck, Clock, Sparkles, Award, Flame } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const BentoGrid: React.FC = () => {
  const { config } = useApp();
  const tc = config.theme_color || '#FF6B35';
  const tcLight = `${tc}12`;
  const tcBorder = `${tc}25`;

  return (
    <div id="quienes-somos" className="my-10 px-1 scroll-mt-20">
      <div className="flex flex-col mb-6">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider mb-1 flex items-center gap-1.5" style={{ color: tc }}>
          <Sparkles size={11} /> Cocina de Autor y Delivery Premium
        </span>
        <h3 className="text-lg font-bold font-display text-zinc-900 leading-tight">Restaurante de Cocina Gourmet</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-md">Descubre por qué somos el restaurante preferido para delivery de comida rápida y gourmet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Main Story */}
        <div className="md:col-span-2 md:row-span-2 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group min-h-[220px]" style={{ border: `1px solid ${tcBorder}`, background: `linear-gradient(135deg, #fff, ${tcLight}, #fef3c7)` }}>
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 text-9xl font-display font-extrabold select-none transition-transform duration-500 group-hover:scale-105" style={{ color: `${tc}08` }}>
            FOOD
          </div>
          <div className="z-10">
            <span className="border text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1.5 mb-3" style={{ background: tcLight, borderColor: tcBorder, color: tc }}>
              <Flame size={11} /> Sabor y Tradición
            </span>
            <h4 className="text-base font-bold font-display text-zinc-950 leading-snug">Cocina Gourmet con Ingredientes Frescos del Día</h4>
            <p className="text-xs text-zinc-600 mt-2.5 leading-relaxed max-w-md">
              Nacimos con el propósito de ofrecer la mejor experiencia de delivery. Preparamos cada plato con ingredientes frescos seleccionados, recetas originales y un toque de creatividad que hará que repitas.
            </p>
          </div>
          <div className="z-10 flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-4">
            <span>Delivery express en minutos</span>
            <span style={{ color: tc }}>•</span>
            <span>Ingredientes frescos del día</span>
          </div>
        </div>

        {/* Card 2: Delivery Speed */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between gap-3 min-h-[140px] group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: tc }}>Delivery Rápido</span>
            <Truck size={18} style={{ color: tc }} />
          </div>
          <div>
            <h5 className="text-xs font-bold font-display text-zinc-900 leading-tight">Llega en Minutos</h5>
            <p className="text-[11px] text-zinc-500 leading-snug mt-1 font-sans">
              Tu pedido caliente y fresco en la puerta de tu casa. Seguimiento en tiempo real de tu delivery.
            </p>
          </div>
        </div>

        {/* Card 3: Quality */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between gap-3 min-h-[140px] group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: tc }}>Calidad Total</span>
            <ShieldCheck size={18} className="font-semibold" style={{ color: tc }} />
          </div>
          <div>
            <h5 className="text-xs font-bold font-display text-zinc-900 leading-tight">Ingredientes Premium</h5>
            <p className="text-[11px] text-zinc-500 leading-snug mt-1 font-sans">
              Seleccionamos los mejores ingredientes para que cada bocado sea una experiencia increíble.
            </p>
          </div>
        </div>

        {/* Card 4: Fresh */}
        <div className="md:col-span-2 p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: tc }}>
              <Clock size={11} /> Preparación al Momento
            </span>
            <h5 className="text-xs font-bold font-display text-zinc-900 leading-tight">Cocinado Fresco para Ti</h5>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm font-sans leading-relaxed">
              Cada plato se prepara cuando lo pides. Nada de almacenamiento, todo fresco y caliente.
            </p>
          </div>
          <div className="p-2 sm:px-3.5 rounded-lg text-center shrink-0 w-full sm:w-auto" style={{ border: `1px solid ${tcBorder}`, background: tcLight }}>
            <div className="text-xs font-bold font-mono" style={{ color: tc }}>100% Fresco</div>
            <div className="text-[9px] text-zinc-500 font-mono font-semibold">Siempre</div>
          </div>
        </div>

        {/* Card 5: Original Recipes */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between gap-3 min-h-[140px] group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: tc }}>
              <Award size={12} /> Exclusividad
            </span>
            <Sparkles size={14} style={{ color: tc }} />
          </div>
          <div>
            <h5 className="text-xs font-bold font-display text-zinc-900 leading-tight">Recetas Originales</h5>
            <p className="text-[11px] text-zinc-500 leading-snug mt-1 font-sans">
              Creaciones únicas del chef que no encontrarás en otro lugar. Sabores que te sorprenderán.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
