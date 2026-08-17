import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../store/AppContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';

type DateRange = 'today' | '7days' | '30days' | 'custom';

const VentasReportSection: React.FC = () => {
  const { orders, config } = useApp();
  const [sedeFilter, setSedeFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const activeSedes = config.sedes?.filter(s => s.activa) || [];
  const principalSedeId = activeSedes.find(s => s.es_principal)?.id || activeSedes[0]?.id || '';

  const filteredOrders = useMemo(() => {
    let result = sedeFilter
      ? orders.filter(o => (o.sede_id || principalSedeId) === sedeFilter)
      : [...orders];

    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (dateRange === 'today') {
      result = result.filter(o => new Date(o.fecha).getTime() >= cutoff);
    } else if (dateRange === '7days') {
      const start = cutoff - 7 * 24 * 60 * 60 * 1000;
      result = result.filter(o => new Date(o.fecha).getTime() >= start);
    } else if (dateRange === '30days') {
      const start = cutoff - 30 * 24 * 60 * 60 * 1000;
      result = result.filter(o => new Date(o.fecha).getTime() >= start);
    } else if (dateRange === 'custom' && customStart && customEnd) {
      const s = new Date(customStart).getTime();
      const e = new Date(customEnd).getTime() + 86400000;
      result = result.filter(o => { const t = new Date(o.fecha).getTime(); return t >= s && t <= e; });
    }

    return result;
  }, [orders, sedeFilter, principalSedeId, dateRange, customStart, customEnd]);

  const dailySalesData = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredOrders.forEach(o => {
      try {
        const key = new Date(o.fecha).toLocaleDateString([], { month: 'short', day: 'numeric' });
        map[key] = (map[key] || 0) + (Number(o.total_usd) || 0);
      } catch { /* skip */ }
    });
    return Object.entries(map).map(([fecha, total]) => ({ fecha, Ventas: parseFloat(total.toFixed(2)) }));
  }, [filteredOrders]);

  const weeklySalesData = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredOrders.forEach(o => {
      try {
        const d = new Date(o.fecha);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' });
        map[key] = (map[key] || 0) + (Number(o.total_usd) || 0);
      } catch { /* skip */ }
    });
    return Object.entries(map).map(([semana, total]) => ({ semana, Ventas: parseFloat(total.toFixed(2)) }));
  }, [filteredOrders]);

  const monthlySalesData = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredOrders.forEach(o => {
      try {
        const key = new Date(o.fecha).toLocaleDateString([], { month: 'short', year: 'numeric' });
        map[key] = (map[key] || 0) + (Number(o.total_usd) || 0);
      } catch { /* skip */ }
    });
    return Object.entries(map).map(([mes, total]) => ({ mes, Ventas: parseFloat(total.toFixed(2)) }));
  }, [filteredOrders]);

  const ordersByDay = useMemo(() => {
    const map: { [key: string]: { count: number; total: number } } = {};
    filteredOrders.forEach(o => {
      try {
        const key = new Date(o.fecha).toLocaleDateString([], { month: 'short', day: 'numeric' });
        if (!map[key]) map[key] = { count: 0, total: 0 };
        map[key].count += 1;
        map[key].total += Number(o.total_usd) || 0;
      } catch { /* skip */ }
    });
    return Object.entries(map)
      .map(([dia, data]) => ({ dia, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [filteredOrders]);

  const totalRevenue = useMemo(() => filteredOrders.reduce((s, o) => s + (Number(o.total_usd) || 0), 0), [filteredOrders]);

  const exportCSV = () => {
    const header = 'Día,Pedidos,Total USD\n';
    const rows = ordersByDay.map(r => `${r.dia},${r.count},${r.total.toFixed(2)}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        {activeSedes.length > 1 && (
          <select
            value={sedeFilter}
            onChange={(e) => setSedeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-700"
          >
            <option value="">Todas las sedes</option>
            {activeSedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        )}
        {(['today', '7days', '30days', 'custom'] as DateRange[]).map(r => (
          <button
            key={r}
            onClick={() => setDateRange(r)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
              dateRange === r ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {r === 'today' ? 'Hoy' : r === '7days' ? '7 Días' : r === '30days' ? '30 Días' : 'Personalizado'}
          </button>
        ))}
        {dateRange === 'custom' && (
          <>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 text-[11px]" />
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 text-[11px]" />
          </>
        )}
        <button onClick={exportCSV} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
          <Download size={13} /> Exportar CSV
        </button>
      </div>

      <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Total Período</p>
        <p className="text-2xl font-black font-mono text-slate-900">${totalRevenue.toFixed(2)}</p>
        <p className="text-[10px] text-slate-400 mt-1">{filteredOrders.length} pedidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Ventas Diarias</h4>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailySalesData}>
                <XAxis dataKey="fecha" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="Ventas" stroke="#7c3aed" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Ventas Semanales</h4>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklySalesData}>
                <XAxis dataKey="semana" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, 'Ventas']} />
                <Bar dataKey="Ventas" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm md:col-span-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Ventas Mensuales</h4>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlySalesData}>
                <XAxis dataKey="mes" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, 'Ventas']} />
                <Bar dataKey="Ventas" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Detalle por Día</h4>
        </div>
        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-bold text-slate-600">Día</th>
                <th className="px-4 py-2 text-right font-bold text-slate-600">Pedidos</th>
                <th className="px-4 py-2 text-right font-bold text-slate-600">Total (USD)</th>
              </tr>
            </thead>
            <tbody>
              {ordersByDay.map(r => (
                <tr key={r.dia} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-700">{r.dia}</td>
                  <td className="px-4 py-2 text-right text-slate-600">{r.count}</td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-slate-900">${r.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VentasReportSection;
