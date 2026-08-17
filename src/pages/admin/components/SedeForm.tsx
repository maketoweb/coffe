import React, { useState } from 'react';
import { Sede, SedeHorario } from '../../../types/store';
import { Save, Trash2, Clock } from 'lucide-react';

interface SedeFormProps {
  sede?: Sede | null;
  onSave: (sede: Sede) => void;
  onDelete?: (id: string) => void;
}

const DAYS = [
  { key: 'lunes', label: 'Lun' },
  { key: 'martes', label: 'Mar' },
  { key: 'miercoles', label: 'Mié' },
  { key: 'jueves', label: 'Jue' },
  { key: 'viernes', label: 'Vie' },
  { key: 'sabado', label: 'Sáb' },
  { key: 'domingo', label: 'Dom' },
];

export const SedeForm: React.FC<SedeFormProps> = ({ sede, onSave, onDelete }) => {
  const [nombre, setNombre] = useState(sede?.nombre || '');
  const [direccion, setDireccion] = useState(sede?.direccion || '');
  const [telefono, setTelefono] = useState(sede?.telefono || '');
  const [whatsappNumero, setWhatsappNumero] = useState(sede?.whatsapp_numero || '');
  const [lat, setLat] = useState(sede?.coordenadas?.lat || 10.48);
  const [lng, setLng] = useState(sede?.coordenadas?.lng || -66.9);
  const [horario, setHorario] = useState(sede?.horario || '');
  const [horarioDetallado, setHorarioDetallado] = useState<SedeHorario>(sede?.horario_detallado || {});
  const [esPrincipal, setEsPrincipal] = useState(sede?.es_principal || false);
  const [activa, setActiva] = useState(sede?.activa !== false);
  const [imagenUrl, setImagenUrl] = useState(sede?.imagen_url || '');
  const [showSchedule, setShowSchedule] = useState(false);

  const handleSave = () => {
    if (!nombre.trim()) { alert('El nombre es obligatorio'); return; }
    onSave({
      id: sede?.id || `sede-${Date.now()}`,
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      whatsapp_numero: whatsappNumero.trim() || undefined,
      coordenadas: { lat, lng },
      horario: horario.trim(),
      horario_detallado: Object.keys(horarioDetallado).length > 0 ? horarioDetallado : undefined,
      es_principal: esPrincipal,
      activa,
      imagen_url: imagenUrl.trim() || undefined,
    });
  };

  const handleScheduleChange = (day: string, field: 'open' | 'close', value: string) => {
    setHorarioDetallado(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof SedeHorario], [field]: value } as { open: string; close: string }
    }));
  };

  const copyScheduleToAll = () => {
    const firstDay = horarioDetallado.lunes;
    if (!firstDay) return;
    const newSchedule: SedeHorario = {};
    for (const day of DAYS) {
      newSchedule[day.key as keyof SedeHorario] = { ...firstDay };
    }
    setHorarioDetallado(newSchedule);
  };

  return (
    <div className="admin-card p-4 flex flex-col gap-4">
      <p className="admin-label">{sede ? 'Editar Sede' : 'Nueva Sede'}</p>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>Nombre *</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Sede Principal"
            className="admin-input mt-1" />
        </div>

        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>Dirección</label>
          <input value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Av. Principal, Local #12"
            className="admin-input mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>Teléfono</label>
            <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+58412..."
              className="admin-input mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>WhatsApp</label>
            <input value={whatsappNumero} onChange={e => setWhatsappNumero(e.target.value)} placeholder="Separado si difiere"
              className="admin-input mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>Latitud</label>
            <input type="number" step="0.0001" value={lat} onChange={e => setLat(Number(e.target.value))}
              className="admin-input mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>Longitud</label>
            <input type="number" step="0.0001" value={lng} onChange={e => setLng(Number(e.target.value))}
              className="admin-input mt-1" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>Horario General</label>
          <input value={horario} onChange={e => setHorario(e.target.value)} placeholder="Ej: Lun-Sab 10am-10pm"
            className="admin-input mt-1" />
        </div>

        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--ios-text-secondary)' }}>URL de Imagen</label>
          <input value={imagenUrl} onChange={e => setImagenUrl(e.target.value)} placeholder="Foto de la sede (opcional)"
            className="admin-input mt-1" />
        </div>
      </div>

      {/* Horario Detallado */}
      <button onClick={() => setShowSchedule(!showSchedule)}
        className="flex items-center gap-2 text-sm font-semibold cursor-pointer py-2"
        style={{ color: 'var(--ios-text-secondary)' }}>
        <Clock size={16} /> Horario por Día {showSchedule ? '▲' : '▼'}
      </button>

      {showSchedule && (
        <div className="flex flex-col gap-2">
          <button onClick={copyScheduleToAll} className="text-xs font-semibold py-2 cursor-pointer"
            style={{ color: 'var(--theme-color, #007AFF)' }}>
            Copiar lunes a todos los días
          </button>
          {DAYS.map(day => {
            const schedule = horarioDetallado[day.key as keyof SedeHorario];
            return (
              <div key={day.key} className="flex items-center gap-2">
                <span className="text-sm font-semibold w-8" style={{ color: 'var(--ios-text)' }}>{day.label}</span>
                <input type="time" value={schedule?.open || ''} onChange={e => handleScheduleChange(day.key, 'open', e.target.value)}
                  className="admin-input flex-1" style={{ padding: '8px', fontSize: '13px' }} />
                <span className="text-sm" style={{ color: 'var(--ios-text-secondary)' }}>a</span>
                <input type="time" value={schedule?.close || ''} onChange={e => handleScheduleChange(day.key, 'close', e.target.value)}
                  className="admin-input flex-1" style={{ padding: '8px', fontSize: '13px' }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Checkboxes */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--ios-text)' }}>
          <input type="checkbox" checked={esPrincipal} onChange={e => setEsPrincipal(e.target.checked)}
            className="w-4 h-4 rounded" style={{ accentColor: 'var(--theme-color, #007AFF)' }} />
          Principal
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--ios-text)' }}>
          <input type="checkbox" checked={activa} onChange={e => setActiva(e.target.checked)}
            className="w-4 h-4 rounded" style={{ accentColor: 'var(--theme-color, #007AFF)' }} />
          Activa
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleSave} className="admin-btn flex-1 flex items-center justify-center gap-2">
          <Save size={16} /> Guardar
        </button>
        {sede && onDelete && (
          <button onClick={() => onDelete(sede.id)}
            className="admin-btn flex items-center justify-center gap-2" style={{ background: '#FF3B30', flex: '0 0 auto', width: 'auto', padding: '14px 20px' }}>
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
