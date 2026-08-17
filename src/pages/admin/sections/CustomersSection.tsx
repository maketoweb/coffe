import React, { useMemo } from 'react';
import { useApp } from '../../../store/AppContext';
import { AppUser } from '../../../types/store';
import { Mail } from 'lucide-react';

interface CustomersSectionProps {
  setSendMsgTitle: (title: string) => void;
  setSendMsgBody: (body: string) => void;
  setSendMsgModal: (modal: { user: AppUser } | null) => void;
}

const CustomersSection: React.FC<CustomersSectionProps> = ({ setSendMsgTitle, setSendMsgBody, setSendMsgModal }) => {
  const { users, orders, updateUserByAdmin } = useApp();

  // Guest orders with email (not linked to registered users)
  const guestEmails = useMemo(() => {
    if (!orders) return [];
    const map = new Map<string, { email: string; nombre: string; telefono: string; lastOrder: string; totalSpent: number; count: number }>();
    for (const o of orders) {
      const email = o.guest_email || o.cliente_email;
      if (!email) continue;
      const key = email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.count++;
        existing.totalSpent += Number(o.total_usd) || 0;
        if (o.fecha && o.fecha > existing.lastOrder) existing.lastOrder = o.fecha;
        if (!existing.telefono && o.cliente_telefono) existing.telefono = o.cliente_telefono;
      } else {
        map.set(key, {
          email,
          nombre: o.cliente_nombre,
          telefono: o.cliente_telefono || o.guest_phone || '',
          lastOrder: o.fecha || '',
          totalSpent: Number(o.total_usd) || 0,
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Gestión de Clientes</h4>
      <div className="flex flex-col gap-3">
        {users && Array.isArray(users) && users.length > 0 ? (
          users.map(user => (
            <div key={user.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col gap-3 hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-slate-900">{user.nombre || 'Cliente sin nombre'}</h5>
                  <p className="text-xs text-slate-500 font-mono">Telf: {user.telefono || 'Sin teléfono'}</p>
                  {user.email && (
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5"><Mail size={10} /> {user.email}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSendMsgTitle('Aviso de Su Pedido');
                      setSendMsgBody('');
                      setSendMsgModal({ user });
                    }}
                    className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200"
                  >
                    Enviar Mensaje
                  </button>
                  <button 
                    onClick={() => {
                      const nuevaClave = prompt(`Nueva clave para ${user.nombre || 'cliente'}:`, user.contrasena || '');
                      if (nuevaClave) updateUserByAdmin(user.id, { contrasena: nuevaClave });
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                  >
                    Resetear Clave
                  </button>
                </div>
              </div>
              {/* Orders for this user */}
              <div className="text-[10px] font-mono border-t border-slate-100 pt-3">
                <strong>Historial de Pedidos:</strong>
                {orders && orders.filter(o => o.cliente_telefono === (user.telefono || '') || o.cliente_uid === user.id || o.usuario_id === user.id).length > 0 ? (
                  <ul className="list-disc pl-4 mt-2 text-slate-600">
                    {orders.filter(o => o.cliente_telefono === (user.telefono || '') || o.cliente_uid === user.id || o.usuario_id === user.id).map(o => (
                      <li key={o.id}>{o.fecha} - {o.status} - ${(Number(o.total_usd) || 0).toFixed(2)}</li>
                    ))}
                  </ul>
                ) : <span className="text-slate-400 pl-2"> Sin pedidos todavía</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-10 text-slate-500 bg-white rounded-xl border border-dashed">No hay clientes registrados.</div>
        )}
      </div>

      {/* Guest customers with email */}
      {guestEmails.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Clientes sin cuenta (con correo)</h4>
          <div className="flex flex-col gap-2">
            {guestEmails.map(g => (
              <div key={g.email} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{g.nombre || 'Sin nombre'}</p>
                  <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1"><Mail size={9} /> {g.email}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Telf: {g.telefono}</p>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500">
                  <p>{g.count} pedido{g.count > 1 ? 's' : ''}</p>
                  <p className="font-bold text-slate-700">${g.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersSection;
