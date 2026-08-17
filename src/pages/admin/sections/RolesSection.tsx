import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/AppContext';
import { supabase } from '../../../store/supabaseClient';
import { Shield, Plus, Trash2, Edit2, Key, User, Mail, X, Eye, EyeOff, MapPin } from 'lucide-react';

interface OperatorRecord {
  id: string;
  email: string;
  nombre: string;
  role: 'admin' | 'operator' | 'customer';
  created_at: string;
  active: boolean;
  sede_id?: string;
}

const RolesSection: React.FC = () => {
  const { config } = useApp();
  const themeColor = config.theme_color || '#007AFF';
  const activeSedes = config.sedes?.filter(s => s.activa) || [];

  const [operators, setOperators] = useState<OperatorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', nombre: '', password: '', sede_id: '', role: 'operator' as 'admin' | 'operator' | 'customer' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setOperators(data as OperatorRecord[]);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.email || !formData.nombre || (!editingId && !formData.password)) {
      alert('Todos los campos son obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update existing operator/customer
        const { error } = await supabase
          .from('admin_users')
          .update({ email: formData.email, nombre: formData.nombre, sede_id: formData.sede_id, role: formData.role })
          .eq('id', editingId);

        if (error) throw error;
        alert('Usuario actualizado exitosamente');
      } else {
        // Create new user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: formData.password.trim(),
          options: {
            data: { nombre: formData.nombre.trim(), role: formData.role, sede_id: formData.sede_id }
          }
        });

        if (authError) throw authError;

        // Insert into admin_users table
        if (authData.user) {
          const { error: dbError } = await supabase
            .from('admin_users')
            .insert({
              id: authData.user.id,
              email: formData.email.trim().toLowerCase(),
              nombre: formData.nombre.trim(),
              role: formData.role,
              active: true,
              sede_id: formData.sede_id
            });

          if (dbError) throw dbError;
        }

        alert('Usuario creado exitosamente');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ email: '', nombre: '', password: '', sede_id: '', role: 'operator' });
      await loadOperators();
    } catch (err: unknown) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (op: OperatorRecord) => {
    setEditingId(op.id);
    setFormData({ email: op.email, nombre: op.nombre, password: '', sede_id: op.sede_id || '', role: op.role });
    setShowForm(true);
  };

  const handleResetPassword = async (op: OperatorRecord) => {
    const newPass = prompt(`Nueva contraseña para ${op.nombre}:`);
    if (!newPass || newPass.length < 6) {
      if (newPass !== null) alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      // Note: Password reset for other users requires admin API
      // This is a placeholder - in production, use a Cloudflare Worker with service role key
      alert('Para cambiar contraseñas de otros usuarios, use el panel de Supabase Auth directamente.');
    } catch (err: unknown) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleToggleActive = async (op: OperatorRecord) => {
    const newActive = !op.active;
    const action = newActive ? 'activar' : 'desactivar';
    if (!confirm(`¿Deseas ${action} a ${op.nombre}?`)) return;

    const { error } = await supabase
      .from('admin_users')
      .update({ active: newActive })
      .eq('id', op.id);

    if (!error) await loadOperators();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Shield size={18} /> Administrador de Roles
        </h4>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ email: '', nombre: '', password: '', sede_id: '', role: 'operator' }); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer"
          style={{ background: themeColor }}
        >
          <Plus size={14} /> Nuevo Usuario
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Gestiona los usuarios que tienen acceso al panel de administración. Los operadores gestionan pedidos, productos y clientes. Los customers tienen acceso limitado sin configuración técnica.
      </p>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-bold text-slate-800">
              {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h5>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 rounded-lg hover:bg-slate-100">
              <X size={16} className="text-slate-400" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1"><Mail size={12} /> Correo Electrónico *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="operador@ejemplo.com"
                disabled={!!editingId}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1"><User size={12} /> Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre del usuario"
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1"><Shield size={12} /> Rol *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'operator' | 'customer' }))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="operator">Operador</option>
                <option value="customer">Customer (Panel limitado)</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="text-[10px] text-slate-400">
                {formData.role === 'customer' && 'Customer: puede ver reportes, pedidos, productos, promociones, notificaciones. No puede configurar la tienda ni gestionar roles.'}
                {formData.role === 'operator' && 'Operador: acceso completo excepto configuración de tienda, roles y marketing.'}
                {formData.role === 'admin' && 'Administrador: acceso total a todas las secciones del panel.'}
              </p>
            </div>
            {!editingId && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1"><Key size={12} /> Contraseña *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:border-blue-500 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1"><MapPin size={12} /> Panel de Sucursal</label>
              <select
                value={formData.sede_id}
                onChange={(e) => setFormData(prev => ({ ...prev, sede_id: e.target.value }))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Todas las sedes (operador global)</option>
                {activeSedes.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">Si eliges una sucursal, este operador solo verá los pedidos y métricas de esa tienda.</p>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg text-slate-700 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 text-white py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                style={{ background: themeColor }}
              >
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operators List */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: themeColor, borderTopColor: 'transparent' }} />
        </div>
      ) : operators.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <Shield size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay usuarios registrados</p>
          <p className="text-xs mt-1">Crea el primer usuario para comenzar</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {operators.map(op => (
            <div
              key={op.id}
              className={`p-4 bg-white border rounded-xl shadow-sm flex flex-col gap-2 transition-colors ${
                op.active ? 'border-slate-200 hover:border-indigo-200' : 'border-red-200 bg-red-50/30 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: op.role === 'admin' ? '#7c3aed' : op.role === 'customer' ? '#059669' : themeColor }}
                  >
                    {op.role === 'admin' ? '🔑' : op.role === 'customer' ? '👤' : '👤'}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{op.nombre}</h5>
                    <p className="text-xs text-slate-500 font-mono">{op.email}</p>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      op.role === 'admin' ? 'bg-purple-100 text-purple-700' : op.role === 'customer' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {op.role === 'admin' ? 'Administrador' : op.role === 'customer' ? 'Customer' : 'Operador'}
                    </span>
                    {!op.active && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700 ml-1">
                        Inactivo
                      </span>
                    )}
                    {op.sede_id && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 ml-1 flex items-center gap-1">
                        <MapPin size={10} /> {activeSedes.find(s => s.id === op.sede_id)?.nombre || 'Sucursal'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleEdit(op)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleResetPassword(op)}
                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
                    title="Resetear contraseña"
                  >
                    <Key size={14} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(op)}
                    className={`p-2 rounded-lg transition-colors ${
                      op.active
                        ? 'bg-red-50 hover:bg-red-100 text-red-600'
                        : 'bg-green-50 hover:bg-green-100 text-green-600'
                    }`}
                    title={op.active ? 'Desactivar' : 'Activar'}
                  >
                    {op.active ? <Trash2 size={14} /> : <Shield size={14} />}
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-2">
                Creado: {op.created_at ? new Date(op.created_at).toLocaleDateString('es-VE') : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolesSection;
