import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../store/supabaseClient';
import type { AutomationRule } from '../../../../types/store';
import { Zap, Clock, Hash, Activity } from 'lucide-react';

const AutomatizacionSection: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRules(); }, []);

  const loadRules = async () => {
    const { data } = await supabase.from('automation_rules').select('*').order('created_at');
    setRules((data || []) as AutomationRule[]);
    setLoading(false);
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    await supabase.from('automation_rules').update({ enabled }).eq('id', ruleId);
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled } : r));
  };

  const triggerLabel: Record<string, string> = {
    order_status_change: 'Cambio de Estado',
    time_based: 'Basado en Tiempo',
    event_based: 'Basado en Evento',
    segment_entry: 'Entrada a Segmento',
  };

  const actionLabel: Record<string, string> = {
    push: 'Notificacion Push',
    coupon_generate: 'Generar Cupon',
    points_bonus: 'Bonus de Puntos',
  };

  if (loading) return <p className="text-xs text-slate-400">Cargando automatizaciones...</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Zap size={18} className="text-amber-500" />
        <h3 className="text-sm font-bold text-slate-900 uppercase">Automatizaciones</h3>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{rules.length}</span>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs">No hay reglas de automatizacion configuradas</div>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${rule.enabled ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Zap size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{rule.name}</p>
                    <p className="text-[10px] text-slate-500 max-w-xs">{rule.description}</p>
                  </div>
                </div>
                <button onClick={() => toggleRule(rule.id, !rule.enabled)}
                  className="relative w-12 h-7 rounded-full transition-colors cursor-pointer shrink-0"
                  style={{ background: rule.enabled ? '#34C759' : '#d4d4d8' }}>
                  <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform"
                    style={{ left: rule.enabled ? 24 : 2 }} />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                  <Activity size={9} /> {triggerLabel[rule.trigger_type] || rule.trigger_type}
                </span>
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                  <Zap size={9} /> {actionLabel[rule.action_type] || rule.action_type}
                </span>
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                  <Clock size={9} /> Cooldown: {rule.cooldown_hours}h
                </span>
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                  <Hash size={9} /> {rule.total_fired} ejecutado{rule.total_fired !== 1 ? 's' : ''}
                </span>
                {rule.last_run_at && (
                  <span className="text-slate-400">Ultima: {new Date(rule.last_run_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomatizacionSection;
