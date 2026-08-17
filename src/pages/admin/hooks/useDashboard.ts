import { useMemo } from 'react';
import { useApp } from '../../../store/AppContext';

export function useDashboard(sedeId?: string) {
  const { orders, foodItems, config, coupons } = useApp();
  const principalSedeId = (config.sedes || []).find(s => s.es_principal)?.id || (config.sedes || [])[0]?.id || '';

  const filteredOrders = useMemo(() => {
    if (!sedeId) return orders;
    return orders.filter(o => (o.sede_id || principalSedeId) === sedeId);
  }, [orders, sedeId, principalSedeId]);

  const today = new Date().toISOString().slice(0, 10);

  const todayOrders = useMemo(() => filteredOrders.filter(o => o.fecha?.startsWith(today)), [filteredOrders, today]);
  const todayRevenue = useMemo(() =>
    todayOrders.filter(o => o.status === 'Entregado').reduce((sum, o) => sum + (Number(o.total_usd) || 0), 0),
    [todayOrders]
  );

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const weekOrders = useMemo(() => filteredOrders.filter(o => o.fecha && o.fecha >= weekAgo), [filteredOrders, weekAgo]);
  const weekRevenue = useMemo(() =>
    weekOrders.filter(o => o.status === 'Entregado').reduce((sum, o) => sum + (Number(o.total_usd) || 0), 0),
    [weekOrders]
  );

  const monthStart = new Date().toISOString().slice(0, 7);
  const monthOrders = useMemo(() => filteredOrders.filter(o => o.fecha?.startsWith(monthStart)), [filteredOrders, monthStart]);
  const monthRevenue = useMemo(() =>
    monthOrders.filter(o => o.status === 'Entregado').reduce((sum, o) => sum + (Number(o.total_usd) || 0), 0),
    [monthOrders]
  );

  const pendingOrders = useMemo(() => filteredOrders.filter(o => o.status === 'Pendiente'), [filteredOrders]);
  const activeOrders = useMemo(() =>
    filteredOrders.filter(o => !['Entregado', 'Cancelado'].includes(o.status)),
    [filteredOrders]
  );

  const topProducts = useMemo(() => {
    return [...foodItems]
      .sort((a, b) => (b.order_count || 0) - (a.order_count || 0))
      .slice(0, 5);
  }, [foodItems]);

  const avgTicket = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === 'Entregado');
    if (delivered.length === 0) return 0;
    return delivered.reduce((sum, o) => sum + (Number(o.total_usd) || 0), 0) / delivered.length;
  }, [filteredOrders]);

  const usedCoupons = useMemo(() =>
    coupons.filter(c => c.usage_count > 0).length,
    [coupons]
  );

  const dailySalesData = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of filteredOrders) {
      if (o.status === 'Entregado' && o.fecha) {
        const date = o.fecha.slice(0, 10);
        map.set(date, (map.get(date) || 0) + (Number(o.total_usd) || 0));
      }
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, total]) => ({ date: date.slice(5), total: Math.round(total * 100) / 100 }));
  }, [filteredOrders]);

  const monthlyComparisonData = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of filteredOrders) {
      if (o.status === 'Entregado' && o.fecha) {
        const month = o.fecha.slice(0, 7);
        map.set(month, (map.get(month) || 0) + (Number(o.total_usd) || 0));
      }
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, total]) => ({ period, total: Math.round(total * 100) / 100 }));
  }, [filteredOrders]);

  return {
    todayOrders,
    todayRevenue,
    weekOrders,
    weekRevenue,
    monthOrders,
    monthRevenue,
    pendingOrders,
    activeOrders,
    topProducts,
    avgTicket,
    usedCoupons,
    dailySalesData,
    monthlyComparisonData,
    totalOrders: filteredOrders.length,
    totalProducts: foodItems.length,
  };
}
