import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../store/supabaseClient';
import { Send, Clock, CheckCircle, Users } from 'lucide-react';
import type { Campaign } from '../../../../types/store';

const SEGMENT_OPTIONS = [
  { value: 'all', label: 'Todos los usuarios' },
  { value: 'vip', label: 'VIP Clients' },
  { value: 'returning', label: 'Recurrentes' },
  { value: 'new_user', label: 'Nuevos usuarios' },
  { value: 'at_risk', label: 'En riesgo' },
  { value: 'inactive_30d', label: 'Inactivos 30+ dias' },
  { value: 'high_value', label: 'Alto valor' },
];

export const CampaignCreator: React.FC = () => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState('all');
  const [linkUrl, setLinkUrl] = useState('/?tab=catalog');
  const [scheduleAt, setScheduleAt] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState<Campaign[]>([]);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false }).limit(20);
    setHistory((data || []) as Campaign[]);
  };

  const handleSend = async (sendNow: boolean) => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);

    const campaign = {
      name: name.trim() || title.trim(),
      title: title.trim(),
      body: body.trim(),
      segment_filter: segment,
      link_url: linkUrl,
      status: 'scheduled' as const,
      schedule_at: sendNow ? new Date().toISOString() : new Date(scheduleAt).toISOString(),
      created_by: 'admin',
    };

    await supabase.from('campaigns').insert([campaign]);
    setSending(false);
    setSent(true);
    setName(''); setTitle(''); setBody(''); setSegment('all'); setScheduleAt('');
    await loadHistory();
    setTimeout(() => setSent(false), 2000);
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-600',
    scheduled: 'bg-blue-100 text-blue-600',
    sending: 'bg-yellow-100 text-yellow-600',
    sent: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-bold text-zinc-900 uppercase">Crear Campana</h3>

      <div className="bg-white p-4 rounded-2xl border border-zinc-100 space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre (opcional)"
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400" />

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titulo del push *"
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400" />

        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Mensaje del push *" rows={3}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 resize-none" />

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase">Segmento objetivo</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {SEGMENT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setSegment(opt.value)}
                className={`px-3 py-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                  segment === opt.value ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="URL destino"
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400" />

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase">Programar envio</label>
          <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 mt-1" />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => handleSend(true)} disabled={!title.trim() || !body.trim() || sending}
          className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-300 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm">
          {sending ? 'Enviando...' : sent ? <><CheckCircle size={16} /> Enviado!</> : <><Send size={16} /> Enviar Ahora</>}
        </button>
        <button onClick={() => handleSend(false)} disabled={!title.trim() || !body.trim() || !scheduleAt || sending}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-violet-200 text-violet-600 font-bold py-3 rounded-xl transition-all cursor-pointer text-sm disabled:opacity-50">
          <Clock size={16} /> Programar
        </button>
      </div>

      {history.length > 0 && (
        <>
          <h3 className="text-sm font-bold text-zinc-900 uppercase mt-4">Historial de Campanas</h3>
          <div className="space-y-2">
            {history.map(camp => (
              <div key={camp.id} className="bg-white p-3 rounded-xl border border-zinc-100 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 truncate">{camp.name || camp.title}</p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-0.5">
                    <span className="flex items-center gap-1"><Users size={10} /> {camp.total_sent || 0} enviados</span>
                    <span className="flex items-center gap-1"><Send size={10} /> {camp.total_clicked || 0} clics</span>
                    <span>{new Date(camp.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[camp.status] || 'bg-zinc-100 text-zinc-600'}`}>
                  {camp.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
