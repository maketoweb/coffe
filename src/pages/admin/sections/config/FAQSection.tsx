import React, { useState } from 'react';
import { useApp } from '../../../../store/AppContext';
import { FAQItem } from '../../../../types/store';
import { HelpCircle, Plus, Trash2, Edit, GripVertical } from 'lucide-react';

const FAQSection: React.FC = () => {
  const { config, updateConfig } = useApp();
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddFaq = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    const newFaq: FAQItem = { id: `faq-${crypto.randomUUID()}`, question: faqQuestion.trim(), answer: faqAnswer.trim() };
    updateConfig({ faq_items: [...(config.faq_items || []), newFaq] });
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const handleEditFaq = (faq: FAQItem) => {
    setEditingFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
  };

  const handleSaveEditFaq = () => {
    if (!editingFaqId || !faqQuestion.trim() || !faqAnswer.trim()) return;
    const updatedFaqs = (config.faq_items || []).map(f =>
      f.id === editingFaqId ? { ...f, question: faqQuestion.trim(), answer: faqAnswer.trim() } : f
    );
    updateConfig({ faq_items: updatedFaqs });
    setEditingFaqId(null);
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const handleDeleteFaq = (id: string) => {
    updateConfig({ faq_items: (config.faq_items || []).filter(f => f.id !== id) });
    setDeleteConfirm(null);
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    const items = [...(config.faq_items || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    updateConfig({ faq_items: items });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="admin-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><HelpCircle size={20} /></div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Gestion de Preguntas Frecuentes</h4>
            <p className="text-[11px] text-slate-500">Administra las preguntas frecuentes que veran los clientes.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h5 className="text-xs font-bold text-slate-800">{editingFaqId ? 'Editar Pregunta' : 'Nueva Pregunta'}</h5>
          <div className="flex flex-col gap-2">
            <input type="text" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)}
              placeholder="Pregunta (ej: Cuales son los horarios?)" className="admin-input" />
            <textarea value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)}
              placeholder="Respuesta..." className="admin-input min-h-[80px]" style={{ resize: 'none' }} />
            <div className="flex gap-2">
              <button onClick={editingFaqId ? handleSaveEditFaq : handleAddFaq}
                disabled={!faqQuestion.trim() || !faqAnswer.trim()}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer">
                {editingFaqId ? 'Guardar Cambios' : 'Agregar'}
              </button>
              {editingFaqId && (
                <button onClick={() => { setEditingFaqId(null); setFaqQuestion(''); setFaqAnswer(''); }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors cursor-pointer">Cancelar</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card p-4">
        <div className="flex flex-col gap-2">
          {(config.faq_items || []).length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-4">No hay preguntas frecuentes configuradas.</p>
          )}
          {(config.faq_items || []).map((faq, index) => (
            <div key={faq.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
              <GripVertical size={14} className="text-slate-300 mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => handleMoveFaq(index, 'up')} disabled={index === 0}
                  className="text-[10px] text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer">&#9650;</button>
                <button onClick={() => handleMoveFaq(index, 'down')} disabled={index === (config.faq_items?.length || 0) - 1}
                  className="text-[10px] text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer">&#9660;</button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">{faq.question}</p>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEditFaq(faq)} className="p-1.5 rounded-md hover:bg-violet-50 text-violet-600 transition-colors cursor-pointer" title="Editar">
                  <Edit size={14} />
                </button>
                {deleteConfirm === faq.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDeleteFaq(faq.id)} className="px-2 py-1 bg-red-500 text-white text-[10px] rounded cursor-pointer font-bold">Si</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] rounded cursor-pointer font-bold">No</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(faq.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors cursor-pointer" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
