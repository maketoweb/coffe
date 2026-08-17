import React, { useState, useEffect } from 'react';
import { useApp } from '../../../../store/AppContext';
import { supabase } from '../../../../store/supabaseClient';
import { Bell, Users, UserPlus, Repeat, Activity } from 'lucide-react';

const AppReportSection: React.FC = () => {
  const { orders } = useApp();
  const [stats, setStats] = useState({
    pushSubscribers: 0,
    totalRegistered: 0,
    totalGuests: 0,
    newUsersWeek: 0,
    newUsersMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppStats();
  }, []);

  const loadAppStats = async () => {
    setLoading(true);
    try {
      const [
        subsRes,
        regRes,
        guestsRes,
        newWeekRes,
        newMonthRes,
      ] = await Promise.all([
        supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('usuario_id', { count: 'exact' }).not('usuario_id', 'is', null),
        supabase.from('orders').select('id', { count: 'exact' }).is('usuario_id', null),
        supabase.from('orders').select('usuario_id').gte('fecha', new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from('orders').select('usuario_id').gte('fecha', new Date(Date.now() - 30 * 86400000).toISOString()),
      ]);

      const uniqueRegistered = new Set((regRes.data || []).map(r => r.usuario_id).filter(Boolean)).size;

      const weekUsers = new Set((newWeekRes.data || []).map(r => r.usuario_id).filter(Boolean)).size;
      const monthUsers = new Set((newMonthRes.data || []).map(r => r.usuario_id).filter(Boolean)).size;

      setStats({
        pushSubscribers: subsRes.count || 0,
        totalRegistered: uniqueRegistered,
        totalGuests: guestsRes.count || 0,
        newUsersWeek: weekUsers,
        newUsersMonth: monthUsers,
      });
    } catch (e) {
      console.warn('Error loading app stats:', e);
    }
    setLoading(false);
  };

  const usersWithOrders = new Set(orders.filter(o => o.usuario_id).map(o => o.usuario_id)).size;
  const activeUsers30d = new Set(
    orders.filter(o => {
      if (!o.usuario_id) return false;
      const t = new Date(o.fecha).getTime();
      return t >= Date.now() - 30 * 86400000;
    }).map(o => o.usuario_id)
  ).size;

  const retentionRate = stats.totalRegistered > 0
    ? ((usersWithOrders / stats.totalRegistered) * 100).toFixed(1)
    : '0';

  const kpis = [
    { label: 'Suscriptores Push', value: stats.pushSubscribers, icon: Bell, color: '#3B82F6' },
    { label: 'Usuarios Registrados', value: stats.totalRegistered, icon: Users, color: '#8B5CF6' },
    { label: 'Invitados', value: stats.totalGuests, icon: Users, color: '#EC4899' },
    { label: 'Nuevos (7 días)', value: stats.newUsersWeek, icon: UserPlus, color: '#10B981' },
    { label: 'Nuevos (30 días)', value: stats.newUsersMonth, icon: UserPlus, color: '#06B6D4' },
    { label: 'Tasa Retención', value: `${retentionRate}%`, icon: Repeat, color: '#F59E0B' },
    { label: 'Activos (30 días)', value: activeUsers30d, icon: Activity, color: '#EF4444' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: kpi.color + '15' }}>
              <kpi.icon size={18} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">{kpi.label}</p>
              <p className="text-lg font-black text-slate-900">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Distribución de Usuarios</h4>
          <div className="space-y-3">
            {[
              { label: 'Registrados', count: stats.totalRegistered, total: stats.totalRegistered + stats.totalGuests, color: '#8B5CF6' },
              { label: 'Invitados', count: stats.totalGuests, total: stats.totalRegistered + stats.totalGuests, color: '#EC4899' },
            ].map(item => {
              const pct = item.total > 0 ? (item.count / item.total) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
                    <span className="text-[11px] font-bold text-slate-900">{item.count}</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Métricas de Retención</h4>
          <div className="space-y-4">
            {[
              { label: 'Usuarios con 2+ pedidos (retención)', value: usersWithOrders, sub: `de ${stats.totalRegistered} registrados` },
              { label: 'Usuarios activos (últimos 30 días)', value: activeUsers30d, sub: `${retentionRate}% de registrados` },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                  <span className="text-lg font-black text-violet-600">{m.value}</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-700">{m.label}</p>
                  <p className="text-[10px] text-slate-400">{m.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppReportSection;
