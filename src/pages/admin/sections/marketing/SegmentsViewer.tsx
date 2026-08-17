import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../store/supabaseClient';
import { CustomerSegment } from '../../../../types/store';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const SEGMENT_META: Record<string, { label: string; description: string; color: string }> = {
  vip: { label: 'VIP Client', description: 'Lifetime points >= 500 o 20+ pedidos', color: '#F59E0B' },
  high_value: { label: 'Alto Valor', description: 'Ticket promedio > $15', color: '#10B981' },
  new_user: { label: 'Usuario Nuevo', description: 'Registro en ultimos 7 dias', color: '#3B82F6' },
  returning: { label: 'Recurrente', description: '3+ pedidos completados', color: '#8B5CF6' },
  at_risk: { label: 'En Riesgo', description: 'Ultimo pedido hace 14-30 dias', color: '#F97316' },
  inactive_30d: { label: 'Inactivo 30+', description: 'Sin pedidos en 30+ dias', color: '#EF4444' },
  inactive_60d: { label: 'Inactivo 60+', description: 'Sin pedidos en 60+ dias', color: '#DC2626' },
  churned: { label: 'Perdido', description: 'Sin pedidos en 90+ dias', color: '#991B1B' },
};

export const SegmentsViewer: React.FC = () => {
  const [segments, setSegments] = useState<Record<string, number>>({});
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const [segmentUsers, setSegmentUsers] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [recomputing, setRecomputing] = useState(false);

  useEffect(() => { loadSegments(); }, []);

  const loadSegments = async () => {
    setLoading(true);
    const { data } = await supabase.from('customer_segments').select('segment_key');
    const counts: Record<string, number> = {};
    for (const row of data || []) {
      counts[row.segment_key] = (counts[row.segment_key] || 0) + 1;
    }
    setSegments(counts);
    setLoading(false);
  };

  const loadUsers = async (segmentKey: string) => {
    if (expandedSegment === segmentKey) {
      setExpandedSegment(null);
      return;
    }
    setExpandedSegment(segmentKey);
    const { data } = await supabase
      .from('customer_segments')
      .select('user_id, metadata, computed_at')
      .eq('segment_key', segmentKey)
      .limit(20);
    setSegmentUsers((data || []) as unknown as CustomerSegment[]);
  };

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      await supabase.rpc('evaluate_all_segments');
      await loadSegments();
    } catch (e) {
      console.warn('Recompute failed:', e);
    }
    setRecomputing(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900 uppercase">Segmentos de Clientes</h3>
        <button onClick={handleRecompute} disabled={recomputing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-violet-600 text-white rounded-lg disabled:opacity-50 cursor-pointer">
          <RefreshCw size={12} className={recomputing ? 'animate-spin' : ''} />
          {recomputing ? 'Calculando...' : 'Recalcular'}
        </button>
      </div>

      {loading && <p className="text-xs text-zinc-400">Cargando segmentos...</p>}

      {Object.entries(segments).sort((a, b) => b[1] - a[1]).map(([key, count]) => {
        const meta = SEGMENT_META[key] || { label: key, description: '', color: '#71717a' };
        const isExpanded = expandedSegment === key;
        return (
          <div key={key} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <button onClick={() => loadUsers(key)}
              className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900">{meta.label}</p>
                  <p className="text-[10px] text-zinc-400">{meta.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black" style={{ color: meta.color }}>{count}</span>
                {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
              </div>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-zinc-50">
                {segmentUsers.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-3 text-center">No hay usuarios en este segmento</p>
                ) : (
                  <div className="space-y-2 pt-3">
                    {segmentUsers.map((su, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-50 last:border-0">
                        <span className="text-xs text-zinc-600">{su.user_id.slice(0, 8)}...</span>
                        <span className="text-[10px] text-zinc-400">{new Date(su.computed_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
