import React, { useState, useEffect } from 'react';
import { useApp } from '../../../../store/AppContext';
import { supabase } from '../../../../store/supabaseClient';
import { AutomationLog } from '../../../../types/store';
import { Users, Zap, Send, MousePointerClick, Bell, TrendingUp } from 'lucide-react';

export const MarketingDashboard: React.FC = () => {
  const { config } = useApp();
  const themeColor = config.theme_color || '#FF6B35';
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    totalSent: 0,
    totalClicked: 0,
    activeAutomations: 0,
    campaignsSent: 0,
    totalSegments: 0,
  });
  const [segmentData, setSegmentData] = useState<Record<string, number>>({});
  const [recentLogs, setRecentLogs] = useState<AutomationLog[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [subsRes, eventsRes, autoRes, campRes, segRes, logsRes] = await Promise.all([
        supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }),
        supabase.from('push_events').select('event_type'),
        supabase.from('automation_rules').select('id', { count: 'exact', head: true }).eq('enabled', true),
        supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
        supabase.from('customer_segments').select('segment_key'),
        supabase.from('automation_log').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const events = eventsRes.data || [];
      const sent = events.filter(e => e.event_type === 'sent').length;
      const clicked = events.filter(e => e.event_type === 'clicked').length;

      const segments: Record<string, number> = {};
      for (const row of segRes.data || []) {
        segments[row.segment_key] = (segments[row.segment_key] || 0) + 1;
      }

      setStats({
        totalSubscriptions: subsRes.count || 0,
        totalSent: sent,
        totalClicked: clicked,
        activeAutomations: autoRes.count || 0,
        campaignsSent: campRes.count || 0,
        totalSegments: (segRes.data || []).length,
      });
      setSegmentData(segments);
      setRecentLogs(logsRes.data || []);
    } catch (e) {
      console.warn('Failed to load marketing stats:', e);
    }
  };

  const openRate = stats.totalSent > 0 ? ((stats.totalClicked / stats.totalSent) * 100).toFixed(1) : '0';

  const kpis = [
    { label: 'Suscripciones', value: stats.totalSubscriptions, icon: Bell, color: '#3B82F6' },
    { label: 'Push Enviados', value: stats.totalSent, icon: Send, color: '#8B5CF6' },
    { label: 'Click Rate', value: `${openRate}%`, icon: MousePointerClick, color: '#10B981' },
    { label: 'Automations', value: stats.activeAutomations, icon: Zap, color: '#F59E0B' },
    { label: 'Campanas', value: stats.campaignsSent, icon: TrendingUp, color: '#EC4899' },
    { label: 'Segmentos', value: stats.totalSegments, icon: Users, color: '#06B6D4' },
  ];

  const SEGMENT_COLORS: Record<string, string> = {
    vip: '#F59E0B', high_value: '#10B981', new_user: '#3B82F6',
    returning: '#8B5CF6', at_risk: '#F97316', inactive_30d: '#EF4444',
    inactive_60d: '#DC2626', churned: '#991B1B',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.color + '15' }}>
              <kpi.icon size={18} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-semibold">{kpi.label}</p>
              <p className="text-lg font-black text-zinc-900">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(segmentData).length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-zinc-100">
          <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Distribucion de Segmentos</h3>
          <div className="space-y-2">
            {Object.entries(segmentData).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-24 text-[10px] font-semibold text-zinc-600 truncate">{key}</div>
                <div className="flex-1 h-5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (count / Math.max(...Object.values(segmentData))) * 100)}%`,
                      backgroundColor: SEGMENT_COLORS[key] || themeColor
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-zinc-700 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentLogs.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-zinc-100">
          <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Actividad Reciente</h3>
          <div className="space-y-2">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-zinc-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${log.status === 'sent' ? 'bg-green-500' : log.status === 'rate_limited' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-zinc-600">{log.rule_slug}</span>
                </div>
                <span className="text-[10px] text-zinc-400">{new Date(log.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
