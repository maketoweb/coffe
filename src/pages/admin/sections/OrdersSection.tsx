import React, { useState, useMemo } from 'react';
import { useApp } from '../../../store/AppContext';
import { Order } from '../../../types/store';
import { Download, LayoutGrid, List } from 'lucide-react';
import { OrderCard, getComandaStatus, sortOrdersByPriority, COMANDA_STATUSES, ComandaStatus } from '../components/OrderCard';

interface OrdersSectionProps {
  openOrderDetailIds: string[];
  toggleOrderDetail: (orderId: string) => void;
  editingOrderItems: Order | null;
  setEditingOrderItems: (order: Order | null) => void;
  setPrintingOrder: (order: Order) => void;
  handleStatusAdvance: (order: Order) => void;
  scopeSedeId?: string;
}

const comandaColumnConfig: Record<ComandaStatus, { icon: string; color: string; bg: string; borderColor: string; countBg: string }> = {
  'Nuevo': {
    icon: '🆕',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    borderColor: 'border-amber-300',
    countBg: 'bg-amber-500',
  },
  'En Preparación': {
    icon: '👨‍🍳',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    borderColor: 'border-violet-300',
    countBg: 'bg-violet-500',
  },
  'Enviado': {
    icon: '✅',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    countBg: 'bg-emerald-500',
  },
};

const OrdersSection: React.FC<OrdersSectionProps> = ({
  openOrderDetailIds,
  toggleOrderDetail,
  setPrintingOrder,
  handleStatusAdvance,
  scopeSedeId,
}) => {
  const { orders, config } = useApp();
  const [sedeFilter, setSedeFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'comanda' | 'list'>('comanda');
  const activeSedes = config.sedes?.filter(s => s.activa) || [];
  const principalSedeId = activeSedes.find(s => s.es_principal)?.id || activeSedes[0]?.id || '';
  // En una sucursal (operador con scope) se bloquea el filtro a esa sede.
  const lockedSede = scopeSedeId || '';
  const effectiveSedeFilter = lockedSede || sedeFilter;
  const canFilterBySede = !lockedSede;

  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => o.status !== 'Entregado' && o.status !== 'Cancelado');
    if (effectiveSedeFilter) {
      result = result.filter(o => (o.sede_id || principalSedeId) === effectiveSedeFilter);
    }
    return sortOrdersByPriority(result);
  }, [orders, effectiveSedeFilter, principalSedeId]);

  // Agrupar por status de comanda
  const ordersByComandaStatus = useMemo(() => {
    const groups: Record<ComandaStatus, Order[]> = {
      'Nuevo': [],
      'En Preparación': [],
      'Enviado': [],
    };
    filteredOrders.forEach(order => {
      const cs = getComandaStatus(order.status);
      groups[cs].push(order);
    });
    return groups;
  }, [filteredOrders]);

  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      alert("No hay pedidos para exportar.");
      return;
    }
    const headers = ["ID", "Fecha", "Cliente", "Email", "Telefono", "Metodo Pago", "Total USD", "Total Bs", "Status", "Direccion"];
    const rows = orders.map(order => [
      order.id,
      `"${order.fecha}"`,
      `"${order.cliente_nombre.replace(/"/g, '""')}"`,
      order.cliente_email || "N/A",
      order.cliente_telefono,
      order.metodo_pago,
      order.total_usd.toFixed(2),
      order.total_bs.toFixed(2),
      order.status,
      `"${order.direccion_envio.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div>
          <h4 className="text-xs uppercase font-mono font-bold text-[#a1a1aa] tracking-wider">Cola de Pedidos</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">{filteredOrders.length} pedidos activos</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
          {/* Toggle vista */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('comanda')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                viewMode === 'comanda' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid size={12} /> Comanda
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List size={12} /> Lista
            </button>
          </div>

          <button
            onClick={exportOrdersToCSV}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download size={12} /> CSV
          </button>

          {activeSedes.length > 1 && canFilterBySede && (
            <select
              value={sedeFilter}
              onChange={(e) => setSedeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white border border-slate-200 text-slate-700 cursor-pointer"
            >
              <option value="">Todas las sedes</option>
              {activeSedes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Vista Comanda: Grid de columnas */}
      {viewMode === 'comanda' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COMANDA_STATUSES.map(cs => {
            const colConfig = comandaColumnConfig[cs];
            const columnOrders = ordersByComandaStatus[cs];

            return (
              <div key={cs} className="flex flex-col">
                {/* Header de columna */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl border-2 border-b-0 ${colConfig.borderColor} ${colConfig.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{colConfig.icon}</span>
                    <span className={`text-xs font-black uppercase tracking-wider ${colConfig.color}`}>{cs}</span>
                  </div>
                  <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${colConfig.countBg}`}>
                    {columnOrders.length}
                  </span>
                </div>

                {/* Cards de órdenes */}
                <div className={`flex flex-col gap-2 p-2 border-2 border-t-0 ${colConfig.borderColor} ${colConfig.bg} rounded-b-xl min-h-[120px] max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar`}>
                  {columnOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-[10px] text-slate-400 italic">
                      Sin pedidos
                    </div>
                  ) : (
                    columnOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isExpanded={openOrderDetailIds.includes(order.id)}
                        onToggleExpand={() => toggleOrderDetail(order.id)}
                        onAdvanceStatus={handleStatusAdvance}
                        onPrint={setPrintingOrder}
                        onWhatsApp={(o) => {
                          const phone = o.cliente_telefono?.replace(/\D/g, '');
                          if (phone) window.open(`https://wa.me/58${phone}?text=Tu pedido #${o.id.slice(-4)} está ${o.status}`, '_blank');
                        }}
                        themeColor={config.theme_color || '#0f5d34'}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista Lista: Una sola columna con todos los pedidos */
        <div className="flex flex-col gap-2">
          {filteredOrders.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400">
              No hay pedidos activos.
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isExpanded={openOrderDetailIds.includes(order.id)}
                onToggleExpand={() => toggleOrderDetail(order.id)}
                onAdvanceStatus={handleStatusAdvance}
                onPrint={setPrintingOrder}
                onWhatsApp={(o) => {
                  const phone = o.cliente_telefono?.replace(/\D/g, '');
                  if (phone) window.open(`https://wa.me/58${phone}?text=Tu pedido #${o.id.slice(-4)} está ${o.status}`, '_blank');
                }}
                themeColor={config.theme_color || '#0f5d34'}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
