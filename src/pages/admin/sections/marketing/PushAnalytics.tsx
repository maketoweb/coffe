import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../store/supabaseClient';
import { PushEvent } from '../../../../types/store';

export const PushAnalytics: React.FC = () => {
  const [, setEvents] = useState<PushEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState({ sent: 0, clicked: 0 });
  const [dailyStats, setDailyStats] = useState<{ date: string; sent: number; clicked: number }[]>([]);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    const { data } = await supabase.from('push_events')
      .select('event_type, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);

    const allEvents = data || [];
    setEvents(allEvents as unknown as PushEvent[]);

    const sent = allEvents.filter(e => e.event_type === 'sent').length;
    const clicked = allEvents.filter(e => e.event_type === 'clicked').length;
    setFunnel({ sent, clicked });

    const byDay: Record<string, { sent: number; clicked: number }> = {};
    for (const e of allEvents) {
      const day = e.created_at?.slice(0, 10) || 'unknown';
      if (!byDay[day]) byDay[day] = { sent: 0, clicked: 0 };
      if (e.event_type === 'sent') byDay[day].sent++;
      if (e.event_type === 'clicked') byDay[day].clicked++;
    }

    const daily = Object.entries(byDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, stats]) => ({ date, ...stats }));
    setDailyStats(daily);
    setLoading(false);
  };

  if (loading) return <p className="text-xs text-zinc-400">Cargando analytics...</p>;

  const maxVal = Math.max(...dailyStats.map(d => d.sent), 1);
  const clickRate = funnel.sent > 0 ? ((funnel.clicked / funnel.sent) * 100).toFixed(1) : '0';

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-bold text-zinc-900 uppercase">Push Analytics</h3>

      <div className="bg-white p-4 rounded-2xl border border-zinc-100">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3">Funnel de Delivery</h4>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <p className="text-[10px] text-zinc-400">Enviados</p>
            <p className="text-2xl font-black text-blue-600">{funnel.sent}</p>
          </div>
          <div className="text-2xl text-zinc-300">→</div>
          <div className="flex-1">
            <p className="text-[10px] text-zinc-400">Clicks</p>
            <p className="text-2xl font-black text-green-600">{funnel.clicked}</p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-[10px] text-zinc-400">Click Rate</p>
            <p className="text-2xl font-black" style={{ color: '#8B5CF6' }}>{clickRate}%</p>
          </div>
        </div>
      </div>

      {dailyStats.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-zinc-100">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3">Actividad Ultimos 14 Dias</h4>
          <div className="flex items-end gap-1 h-32">
            {dailyStats.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '100px' }}>
                  <div className="w-full rounded-t" style={{
                    height: `${(d.clicked / maxVal) * 80}px`,
                    backgroundColor: '#8B5CF6',
                    minHeight: d.clicked > 0 ? '4px' : '0'
                  }} />
                  <div className="w-full rounded-t" style={{
                    height: `${((d.sent - d.clicked) / maxVal) * 80}px`,
                    backgroundColor: '#C4B5FD',
                    minHeight: (d.sent - d.clicked) > 0 ? '4px' : '0'
                  }} />
                </div>
                <span className="text-[8px] text-zinc-400">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
              <div className="w-2 h-2 rounded" style={{ backgroundColor: '#C4B5FD' }} /> Enviados
            </span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
              <div className="w-2 h-2 rounded" style={{ backgroundColor: '#8B5CF6' }} /> Clicks
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
