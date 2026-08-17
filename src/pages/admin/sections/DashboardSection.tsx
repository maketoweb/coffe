import React, { useMemo, useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import {
  Calendar, BarChart3, ShoppingBag, ShoppingCart, DollarSign, Landmark, Package, Ticket
} from 'lucide-react';

interface DashboardSectionProps {
  scopeSedeId?: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ scopeSedeId }) => {
  const { orders, config, foodItems } = useApp();
  const [sedeFilter, setSedeFilter] = useState<string>('');
  const activeSedes = config.sedes?.filter(s => s.activa) || [];
  const principalSedeId = activeSedes.find(s => s.es_principal)?.id || activeSedes[0]?.id || '';
  const lockedSede = scopeSedeId || '';
  const effectiveSedeFilter = lockedSede || sedeFilter;
  const canFilterBySede = !lockedSede;

  const filteredOrders = useMemo(() => {
    if (!effectiveSedeFilter) return orders;
    return orders.filter(o => (o.sede_id || principalSedeId) === effectiveSedeFilter);
  }, [orders, effectiveSedeFilter, principalSedeId]);

  const reportTotals = useMemo(() => {
    const totalVentasUsd = filteredOrders.reduce((acc, o) => acc + (Number(o.total_usd) || 0), 0);
    const totalAhorroCuponesUsd = filteredOrders.reduce((acc, o) => acc + (Number(o.descuento_cupon_usd) || 0), 0);
    const totalPedidosCount = filteredOrders.length;
    let partsSold = 0;
    
    filteredOrders.forEach(o => {
      o.items.forEach(it => {
        partsSold += (Number(it.cantidad) || 0);
      });
    });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = now.getTime() - (7 * 24 * 60 * 60 * 1000);
    const startOfMonth = now.getTime() - (30 * 24 * 60 * 60 * 1000);
    const startOfPrevMonth = now.getTime() - (60 * 24 * 60 * 60 * 1000);

    let dayTotal = 0, weekTotal = 0, monthTotal = 0, prevMonthTotal = 0;

    filteredOrders.forEach(o => {
      const orderTime = new Date(o.fecha).getTime();
      const amount = Number(o.total_usd) || 0;
      if (orderTime >= startOfDay) dayTotal += amount;
      if (orderTime >= startOfWeek) weekTotal += amount;
      if (orderTime >= startOfMonth) monthTotal += amount;
      else if (orderTime >= startOfPrevMonth) prevMonthTotal += amount;
    });

    return {
      salesUSD: totalVentasUsd,
      couponSavingsUSD: totalAhorroCuponesUsd,
      salesBs: totalVentasUsd * (Number(config.tasa_cambio) || 1),
      ordersCount: totalPedidosCount,
      partsSoldCount: partsSold,
      dayTotal,
      weekTotal,
      monthTotal,
      prevMonthTotal
    };
  }, [filteredOrders, config.tasa_cambio]);

  const salesChartData = useMemo(() => {
    const datesMap: { [date: string]: number } = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      datesMap[d.toLocaleDateString([], { month: 'short', day: 'numeric' })] = 0;
    }

    filteredOrders.forEach(o => {
      const orderUsd = Number(o.total_usd) || 0;
      try {
        const rawDate = new Date(o.fecha);
        const key = rawDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        if (datesMap[key] !== undefined) {
          datesMap[key] += orderUsd;
        } else {
          datesMap[key] = orderUsd;
        }
      } catch {
        const key = o.fecha.split(' ')[0] || 'Hoy';
        if (datesMap[key] !== undefined) datesMap[key] += orderUsd;
      }
    });

    return Object.keys(datesMap).map((k) => ({
      fecha: k,
      Ventas: parseFloat(Number(datesMap[k] || 0).toFixed(2)),
    }));
  }, [filteredOrders]);

  const couponUsageChartData = useMemo(() => {
    const datesMap: { [date: string]: number } = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      datesMap[d.toLocaleDateString([], { month: 'short', day: 'numeric' })] = 0;
    }

    filteredOrders.forEach(o => {
      if (o.cupon_codigo) {
        try {
          const rawDate = new Date(o.fecha);
          const key = rawDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
          if (datesMap[key] !== undefined) {
            datesMap[key] += 1;
          } else {
            datesMap[key] = 1;
          }
        } catch {
          const key = o.fecha.split(' ')[0] || 'Hoy';
          if (datesMap[key] !== undefined) datesMap[key] += 1;
        }
      }
    });

    return Object.keys(datesMap).map((k) => ({
      fecha: k,
      Usos: datesMap[k],
    }));
  }, [filteredOrders]);

  const topProductsChartData = useMemo(() => {
    const productsMap: { [name: string]: number } = {};
    foodItems.slice(0, 5).forEach(p => {
      productsMap[p.nombre.substring(0, 22)] = p.stock > 10 ? 4 : 2;
    });

    filteredOrders.forEach(o => {
      o.items.forEach(it => {
        const abbreviated = it.nombre.substring(0, 22);
        if (productsMap[abbreviated] !== undefined) {
          productsMap[abbreviated] += it.cantidad;
        } else {
          productsMap[abbreviated] = it.cantidad;
        }
      });
    });

    return Object.keys(productsMap).map(k => ({
      name: k,
      Unidades: productsMap[k]
    })).sort((a,b) => b.Unidades - a.Unidades).slice(0, 5);
  }, [filteredOrders, foodItems]);

  const monthlyComparisonData = useMemo(() => {
    return [
      { period: 'Anterior', total: reportTotals.prevMonthTotal },
      { period: 'Actual', total: reportTotals.monthTotal },
    ];
  }, [reportTotals]);

  return (
    <div className="flex flex-col gap-5">
      {/* Sede filter */}
      {activeSedes.length > 1 && canFilterBySede && (
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Filtrar por tienda:</span>
          <select
            value={sedeFilter}
            onChange={(e) => setSedeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-700 cursor-pointer"
          >
            <option value="">Todas las sedes</option>
            {activeSedes.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sales Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-200">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Ventas Hoy</span>
            <Calendar size={16} />
          </div>
          <p className="text-2xl font-black font-mono mt-2">${reportTotals.dayTotal.toFixed(2)}</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Esta Semana</span>
            <BarChart3 size={16} />
          </div>
          <p className="text-2xl font-black font-mono mt-2">${reportTotals.weekTotal.toFixed(2)}</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl text-white shadow-lg shadow-violet-200">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Últimos 30 Días</span>
            <ShoppingBag size={16} />
          </div>
          <p className="text-2xl font-black font-mono mt-2">${reportTotals.monthTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Quick Metrics Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-violet-300 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Pedidos Activos</span>
            <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600 transition-all">
              <ShoppingBag size={14} />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{filteredOrders.filter(o => o.status !== 'Entregado' && o.status !== 'Cancelado').length}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-violet-300 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Ingresos (USD)</span>
            <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600 transition-all">
              <DollarSign size={14} />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">${reportTotals.salesUSD.toFixed(1)}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-violet-300 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Ingresos (Bs)</span>
            <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600 transition-all">
              <Landmark size={14} />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{reportTotals.salesBs.toFixed(1)}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-slate-300 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Órdenes</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 transition-all">
              <ShoppingCart size={14} />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{reportTotals.ordersCount}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-indigo-300 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Unidades Sold</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 transition-all">
              <Package size={14} />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{reportTotals.partsSoldCount}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-pink-300 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Ahorro Cupones</span>
            <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600 transition-all">
              <Ticket size={14} />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">${reportTotals.couponSavingsUSD.toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Chart: Monthly Comparison */}
        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold font-display text-slate-900 uppercase tracking-wider">Crecimiento Mensual</h4>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${reportTotals.monthTotal >= reportTotals.prevMonthTotal ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {reportTotals.prevMonthTotal > 0 ? `${(((reportTotals.monthTotal - reportTotals.prevMonthTotal) / reportTotals.prevMonthTotal) * 100).toFixed(1)}%` : '+100%'}
            </span>
          </div>
          <div className="w-full h-[220px] text-[10px] font-mono mt-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyComparisonData}>
                <XAxis dataKey="period" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip formatter={(value: unknown) => [`$${Number(value).toFixed(2)}`, 'Ventas']} />
                <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 1: Revenue line chart */}
        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col gap-2">
          <h4 className="text-xs font-bold font-display text-slate-900 uppercase tracking-wider">Flujo Diario de Ventas (USD)</h4>
          <div className="w-full h-[220px] text-[10px] font-mono mt-3">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesChartData}>
                <XAxis dataKey="fecha" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }} />
                <Line type="monotone" dataKey="Ventas" stroke="#7c3aed" strokeWidth={2.5} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Products bar chart */}
        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col gap-2">
          <h4 className="text-xs font-bold font-display text-slate-900 uppercase tracking-wider">Productos Más Vendidos (Unidades)</h4>
          <div className="w-full h-[220px] text-[10px] font-mono mt-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProductsChartData}>
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }} />
                <Bar dataKey="Unidades" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Coupon Usage line chart */}
        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col gap-2">
          <h4 className="text-xs font-bold font-display text-slate-900 uppercase tracking-wider">Uso Diario de Cupones (Redenciones)</h4>
          <div className="w-full h-[220px] text-[10px] font-mono mt-3">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={couponUsageChartData}>
                <XAxis dataKey="fecha" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }} />
                <Line type="monotone" dataKey="Usos" stroke="#ec4899" strokeWidth={2.5} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
