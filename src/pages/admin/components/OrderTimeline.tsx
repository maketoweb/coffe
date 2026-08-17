import React from 'react';
import { CheckCircle, Clock, Circle, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: string;
  themeColor: string;
}

const comandaSteps: { label: string; statuses: string[] }[] = [
  { label: 'Nuevo', statuses: ['Pendiente', 'Procesando'] },
  { label: 'En Preparación', statuses: ['En preparación'] },
  { label: 'Enviado', statuses: ['Listo', 'En camino', 'Entregado'] },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, themeColor }) => {
  const isCancelled = currentStatus === 'Cancelado';

  // Find which step is current
  const currentStepIdx = comandaSteps.findIndex(step =>
    step.statuses.includes(currentStatus)
  );

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
      {comandaSteps.map((step, i) => {
        const isCompleted = currentStepIdx > i;
        const isCurrent = currentStepIdx === i;

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                isCancelled ? 'bg-red-100 border-2 border-red-300' :
                isCompleted ? 'bg-green-100 border-2 border-green-300' :
                isCurrent ? 'bg-white border-2 shadow-sm' : 'bg-slate-100 border-2 border-slate-200'
              }`} style={isCurrent && !isCancelled ? { borderColor: themeColor } : {}}>
                {isCancelled ? <XCircle size={14} className="text-red-500" /> :
                 isCompleted ? <CheckCircle size={14} className="text-green-500" /> :
                 isCurrent ? <Clock size={14} style={{ color: themeColor }} /> :
                 <Circle size={14} className="text-slate-300" />}
              </div>
              <span className={`text-[9px] font-bold text-center leading-tight ${
                isCurrent ? '' : isCompleted ? 'text-green-600' : 'text-slate-400'
              }`} style={isCurrent && !isCancelled ? { color: themeColor } : {}}>
                {step.label}
              </span>
            </div>
            {i < comandaSteps.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-[20px] mt-[-14px] rounded-full ${
                isCancelled ? 'bg-red-200' :
                i < currentStepIdx ? 'bg-green-300' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
