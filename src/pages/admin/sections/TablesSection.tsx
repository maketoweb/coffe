import React from 'react';
import { useApp } from '../../../store/AppContext';

interface TablesSectionProps {
  openOrderDetailIds: string[];
  toggleOrderDetail: (orderId: string) => void;
}

const TablesSection: React.FC<TablesSectionProps> = ({ openOrderDetailIds, toggleOrderDetail }) => {
  const { orders, config, updateOrderStatus } = useApp();

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Gestión de Mesas</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: config.total_mesas || 20 }, (_, i) => i + 1).map(num => {
          const activeOrder = orders.find(o => o.numero_mesa === num && o.tipo_entrega === 'mesa' && o.status !== 'Entregado' && o.status !== 'Cancelado');
          const isOccupied = !!activeOrder;
          return (
            <div
              key={num}
              className={`p-4 rounded-xl border-2 shadow-sm flex flex-col items-center gap-2 cursor-pointer transition-all hover:shadow-md ${
                isOccupied ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'
              }`}
              onClick={() => {
                if (activeOrder) toggleOrderDetail(activeOrder.id);
              }}
            >
              <span className="text-2xl font-black font-mono text-slate-800">{num}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOccupied ? 'bg-rose-200 text-rose-700' : 'bg-emerald-200 text-emerald-700'}`}>
                {isOccupied ? 'Ocupada' : 'Disponible'}
              </span>
              {activeOrder && (
                <div className="text-[9px] text-slate-500 text-center mt-1">
                  <div className="font-bold text-slate-700 truncate max-w-[80px]">{activeOrder.cliente_nombre}</div>
                  <div>${activeOrder.total_usd.toFixed(2)}</div>
                </div>
              )}
              {isOccupied && (
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm(`¿Marcar mesa ${num} como disponible?`)) updateOrderStatus(activeOrder.id, 'Entregado'); }}
                  className="text-[9px] bg-rose-600 text-white px-2 py-1 rounded-lg hover:bg-rose-700 transition-colors mt-1 cursor-pointer"
                >
                  Liberar
                </button>
              )}
            </div>
          );
        })}
      </div>
      {openOrderDetailIds.map(orderId => {
        const order = orders.find(o => o.id === orderId);
        if (!order || order.tipo_entrega !== 'mesa') return null;
        return (
          <div key={orderId} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-bold font-mono text-slate-800">Mesa {order.numero_mesa} • {order.cliente_nombre}</span>
                <span className="ml-2 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-100 text-amber-700">{order.status}</span>
              </div>
              <span className="text-xs font-bold text-violet-600 font-mono">${order.total_usd.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-600">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.cantidad}x {it.nombre}</span>
                  <span>${(it.precio_usd * it.cantidad).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-1 mt-1 flex justify-between font-bold text-slate-800">
                <span>Total</span>
                <span>${order.total_usd.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TablesSection;
