import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../store/supabaseClient';
import { Zap, Clock, Hash } from 'lucide-react';
import type { AutomationRule } from '../../../../types/store';

export const AutomationsManager: React.FC = () => {
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

  if (loading) return <p className="text-xs text-zinc-400">Cargando automatizaciones...</p>;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-bold text-zinc-900 uppercase">Reglas de Automatizacion</h3>

      {rules.map(rule => (
        <div key={rule.id} className="bg-white p-4 rounded-2xl border border-zinc-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap size={18} className={rule.enabled ? 'text-amber-500' : 'text-zinc-300'} />
              <div>
                <p className="text-sm font-bold text-zinc-900">{rule.name}</p>
                <p className="text-[10px] text-zinc-500 max-w-xs">{rule.description}</p>
              </div>
            </div>
            <button onClick={() => toggleRule(rule.id, !rule.enabled)}
              className="relative w-14 h-8 rounded-full transition-colors cursor-pointer"
              style={{ background: rule.enabled ? '#34C759' : '#d4d4d8' }}>
              <div className="absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform"
                style={{ left: rule.enabled ? 30 : 4 }} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1"><Hash size={10} /> Disparado: {rule.total_fired}x</span>
            <span className="flex items-center gap-1"><Clock size={10} /> Cooldown: {rule.cooldown_hours}h</span>
            <span className="flex items-center gap-1">Max/User: {rule.max_sends_per_user}</span>
            <span className="flex items-center gap-1">Tipo: {rule.trigger_type}</span>
            {rule.last_run_at && (
              <span>Ultima ejecucion: {new Date(rule.last_run_at).toLocaleString()}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
