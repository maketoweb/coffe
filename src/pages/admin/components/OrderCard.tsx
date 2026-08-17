import React from 'react';
import { Order } from '../../../types/store';
import { Clock, ChevronDown, ChevronUp, Printer, MessageSquare, ArrowRight } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAdvanceStatus: (order: Order) => void;
  onPrint: (order: Order) => void;
  onWhatsApp: (order: Order) => void;
  themeColor: string;
}

// Mapeo de status real a status simplificado de comanda
export type ComandaStatus = 'Nuevo' | 'En Preparación' | 'Enviado';

export const COMANDA_STATUSES: ComandaStatus[] = ['Nuevo', 'En Preparación', 'Enviado'];

export function getComandaStatus(status: Order['status']): ComandaStatus {
  switch (status) {
    case 'Pendiente':
    case 'Procesando':
      return 'Nuevo';
    case 'En preparación':
      return 'En Preparación';
    case 'Listo':
    case 'En camino':
    case 'Entregado':
      return 'Enviado';
    case 'Cancelado':
      return 'Enviado';
    default:
      return 'Nuevo';
  }
}

// Orden de prioridad para sorting dentro de cada columna (menor = más arriba)
function getPriority(status: Order['status']): number {
  switch (status) {
    case 'Pendiente': return 0;
    case 'Procesando': return 1;
    case 'En preparación': return 2;
    case 'Listo': return 3;
    case 'En camino': return 4;
    case 'Entregado': return 5;
    case 'Cancelado': return 6;
    default: return 0;
  }
}

export function sortOrdersByPriority(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const pa = getPriority(a.status);
    const pb = getPriority(b.status);
    if (pa !== pb) return pa - pb;
    // Dentro del mismo status, más reciente primero
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });
}

const comandaStatusConfig: Record<ComandaStatus, { color: string; bg: string; border: string; glow: string; nextLabel: string; nextStatus: Order['status'] | null }> = {
  'Nuevo': {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    glow: 'shadow-amber-100',
    nextLabel: 'Preparar',
    nextStatus: 'En preparación',
  },
  'En Preparación': {
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-300',
    glow: 'shadow-violet-100',
    nextLabel: 'Listo',
    nextStatus: 'Listo',
  },
  'Enviado': {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    glow: 'shadow-emerald-100',
    nextLabel: 'Completado',
    nextStatus: null,
  },
};

const detailStatusConfig: Record<string, { color: string; bg: string }> = {
  'Pendiente':      { color: 'text-amber-600',  bg: 'bg-amber-100' },
  'Procesando':     { color: 'text-blue-600',   bg: 'bg-blue-100' },
  'En preparación': { color: 'text-violet-600', bg: 'bg-violet-100' },
  'Listo':          { color: 'text-green-600',  bg: 'bg-green-100' },
  'En camino':      { color: 'text-cyan-600',   bg: 'bg-cyan-100' },
  'Entregado':      { color: 'text-emerald-600',bg: 'bg-emerald-100' },
  'Cancelado':      { color: 'text-red-600',    bg: 'bg-red-100' },
};

function getElapsed(fecha: string): string {
  if (!fecha) return '';
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, isExpanded, onToggleExpand, onAdvanceStatus, onPrint, onWhatsApp, themeColor }) => {
  const comandaStatus = getComandaStatus(order.status);
  const config = comandaStatusConfig[comandaStatus];
  const isFinal = order.status === 'Entregado' || order.status === 'Cancelado';
  const isCancelled = order.status === 'Cancelado';
  const detailConfig = detailStatusConfig[order.status] || detailStatusConfig['Pendiente'];

  // Calcular siguiente status real
  const getNextRealStatus = (): Order['status'] | null => {
    const flow: Order['status'][] = ['Pendiente', 'Procesando', 'En preparación', 'Listo', 'En camino', 'Entregado'];
    const idx = flow.indexOf(order.status);
    if (idx >= 0 && idx < flow.length - 1) return flow[idx + 1];
    return null;
  };

  const handleAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFinal) return;
    // Avanzar al siguiente status real
    const next = getNextRealStatus();
    if (next) {
      onAdvanceStatus(order);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        isCancelled
          ? 'border-red-200 opacity-60'
          : `${config.border} shadow-md hover:shadow-lg`
      } ${isExpanded ? 'ring-2 ring-offset-1' : ''}`}
      style={isExpanded ? { ['--tw-ring-color' as string]: themeColor } : {}}
    >
      {/* Header de comanda */}
      <div className="p-3 cursor-pointer" onClick={onToggleExpand}>
        {/* Primera línea: #ID y badge de status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900">#{order.id.slice(-4).toUpperCase()}</span>
            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${config.bg} ${config.color}`}>
              {isCancelled ? '✕ Cancelado' : comandaStatus}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock size={11} />
            <span className="text-[10px] font-mono font-bold">{getElapsed(order.fecha)}</span>
          </div>
        </div>

        {/* Cliente */}
        <p className="text-xs font-bold text-slate-800 truncate">{order.cliente_nombre}</p>
        <p className="text-[10px] text-slate-400 truncate">{order.cliente_telefono}</p>

        {/* Items preview */}
        <div className="mt-2 space-y-0.5">
          {order.items?.slice(0, isExpanded ? undefined : 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600 truncate">
                <span className="font-bold text-slate-800">{item.cantidad}x</span> {item.nombre}
              </span>
              <span className="text-[10px] font-mono text-slate-400 ml-1 whitespace-nowrap">
                ${(item.precio_usd * item.cantidad).toFixed(2)}
              </span>
            </div>
          ))}
          {!isExpanded && (order.items?.length || 0) > 3 && (
            <p className="text-[9px] text-slate-400 italic">+{(order.items?.length || 0) - 3} más...</p>
          )}
        </div>

        {/* Footer: total, items count, expand */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">{order.items?.length || 0} items</span>
            <span className="text-[10px] text-slate-300">·</span>
            <span className="text-[10px] text-slate-400">{order.metodo_pago}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black" style={{ color: themeColor }}>
              ${order.total_usd?.toFixed(2)}
            </span>
            {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </div>
        </div>
      </div>

      {/* Expanded: detalle completo */}
      {isExpanded && (
        <div className="border-t-2 border-dashed border-slate-200 p-3 bg-slate-50/50">
          {/* Status real detallado */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Estado:</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${detailConfig.bg} ${detailConfig.color}`}>
              {order.status}
            </span>
          </div>

          {/* Items completos */}
          <div className="space-y-1 mb-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] py-0.5">
                <span className="text-slate-700">
                  <span className="font-bold">{item.cantidad}x</span> {item.nombre}
                  {item.selected_options && item.selected_options.length > 0 && (
                    <span className="text-slate-400 ml-1">
                      ({item.selected_options.map(o => o.option_name).join(', ')})
                    </span>
                  )}
                </span>
                <span className="font-mono text-slate-500">${(item.precio_usd * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Dirección y tipo */}
          <div className="text-[10px] text-slate-400 mb-3 flex items-center gap-1">
            <span>📍</span>
            <span className="truncate">{order.direccion_envio || 'Sin dirección'}</span>
            <span className="text-slate-300">·</span>
            <span className="capitalize">{order.tipo_entrega}</span>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            {!isFinal && (
              <button
                onClick={handleAdvance}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-black text-white rounded-xl cursor-pointer transition-all active:scale-95"
                style={{ backgroundColor: themeColor }}
              >
                <ArrowRight size={14} />
                {config.nextLabel}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onPrint(order); }}
              className="p-2.5 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer transition-all active:scale-95"
            >
              <Printer size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onWhatsApp(order); }}
              className="p-2.5 text-green-600 bg-white border border-green-200 rounded-xl hover:bg-green-50 cursor-pointer transition-all active:scale-95"
            >
              <MessageSquare size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
