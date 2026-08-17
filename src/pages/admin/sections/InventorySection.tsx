import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../../store/AppContext';
import { FoodItem } from '../../../types/store';
import { StoreConfig } from '../../../types/store';
import { Plus, Edit, Trash2, Search, Upload, FileSpreadsheet, Mic, Pause, PackageX, CheckCircle, Eye } from 'lucide-react';
import { ProductPreviewModal } from '../components/ProductPreviewModal';

interface InventorySectionProps {
  openEditor: (part: FoodItem | null) => void;
  config: StoreConfig;
}

const InventorySection: React.FC<InventorySectionProps> = ({ openEditor, config }) => {
  const { foodItems, addFoodItem, updateFoodItem, deleteFoodItem, searchItems } = useApp();
  const [crudSearch, setCrudSearch] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<FoodItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeColor = config.theme_color || '#7c3aed';

  const crudSearchParts = useMemo(() => {
    return searchItems(crudSearch, true);
  }, [crudSearch, searchItems]);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Lo siento, su navegador no soporta búsqueda por voz. Pruebe con Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-VE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCrudSearch(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const downloadCSVTemplate = () => {
    const headers = ["nombre", "descripcion", "categoria", "precio_usd", "stock", "imagen_urls", "es_promo", "es_nuevo", "es_mas_vendido", "delivery_gratis"];
    const exampleRow = [
      "Smash Clásica", "Hamburguesa doble smash de res con queso cheddar", "Hamburguesas", "7.50", "60", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500", "false", "false", "true", "false"
    ];
    
    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `plantilla_importacion_${config.site_nombre?.toLowerCase().replace(/\s/g, '_') || 'tienda'}.csv`);
    link.click();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const parseCSV = (str: string) => {
        const rows: string[][] = [];
        let row: string[] = [];
        let col = '';
        let inQuotes = false;
        for (let i = 0; i < str.length; i++) {
          const char = str[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) { row.push(col.trim()); col = ''; }
          else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (col || row.length) {
              row.push(col.trim());
              rows.push(row);
              row = [];
              col = '';
            }
            if (char === '\r' && str[i+1] === '\n') i++;
          } else col += char;
        }
        if (col || row.length) { row.push(col.trim()); rows.push(row); }
        return rows;
      };

      const rows = parseCSV(text);
      if (rows.length < 2) {
        alert("El archivo está vacío o no tiene el formato correcto.");
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase());
      const importedProducts = rows.slice(1).map(row => {
        const p: any = {};
        headers.forEach((h, i) => {
          let val: any = row[i]?.replace(/^"|"$/g, '').replace(/""/g, '"');
          if (['precio_usd', 'stock', 'anio_inicio', 'anio_fin'].includes(h)) val = parseFloat(val) || 0;
          else if (h.startsWith('es_') || h === 'delivery_gratis') val = val?.toLowerCase() === 'true';
          else if (h === 'imagen_urls') val = val ? val.split(';') : [];
          p[h] = val;
        });
        
        if (!p.categoria) p.categoria = config.categories?.[0] || 'Hamburguesas';
        return p;
      }).filter(p => p.nombre);

      let addedCount = 0;
      let updatedCount = 0;

      importedProducts.forEach(p => {
        const existingPart = foodItems.find(ep => ep.nombre === p.nombre);
        
        if (existingPart) {
          updateFoodItem(existingPart.id, p);
          updatedCount++;
        } else {
          addFoodItem(p);
          addedCount++;
        }
      });

      alert(`¡Importación finalizada!\n\nSe han agregado ${addedCount} productos nuevos.\nSe han actualizado ${updatedCount} productos existentes.`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-100 p-4 rounded-xl border border-slate-200 gap-3">
        <span className="text-xs font-bold font-display text-slate-800">Editar o Cargar Productos</span>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            accept=".csv" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={downloadCSVTemplate}
            className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet size={13} /> Plantilla CSV
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Upload size={13} /> Importar CSV/Excel
          </button>
          <button
            type="button"
            onClick={() => openEditor(null)}
            className="flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus size={13} /> Agregar Articulo
          </button>
        </div>
      </div>

      {/* CRUD Search field */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-gray-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={crudSearch}
            onChange={(e) => setCrudSearch(e.target.value)}
            placeholder="Filtrar por nombre o categoría..."
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2.5 pl-9 pr-12 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all shadow-inner"
          />
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`absolute right-3 top-2.5 p-1 rounded-md transition-all cursor-pointer ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-violet-400 hover:bg-white/5'}`}
            title={isListening ? "Escuchando..." : "Búsqueda por voz"}
          >
            <Mic size={16} />
          </button>
        </div>
      </div>

      {/* List display */}
      <div className="flex flex-col gap-3">
        {crudSearchParts.map(part => (
          <div 
            key={part.id} 
            className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {/* Product Info Row */}
            <div className="flex items-center gap-4 p-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                <img src={part.imagen_urls[0]} alt={part.nombre} className="w-full h-full object-cover" />
                {part.imagen_urls && part.imagen_urls.length > 1 && (
                  <span className="absolute bottom-0 right-0 bg-violet-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-tl" title={`${part.imagen_urls.length} imágenes`}>
                    {part.imagen_urls.length}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <h5 className="text-sm font-bold text-slate-900 line-clamp-1">{part.nombre}</h5>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                    part.disponibilidad === 'Agotado' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                    part.disponibilidad === 'En Reposición' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    part.activo === false ? 'bg-slate-100 text-slate-500 border-slate-200' :
                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {part.disponibilidad || (part.activo ? 'Disponible' : 'Inactivo')}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm font-bold" style={{ color: themeColor }}>${part.precio_usd.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[11px] text-slate-500 capitalize">{part.categoria}</span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[11px] text-slate-500">
                    Stock: <strong className={part.stock <= 3 ? 'text-red-500 font-bold' : 'text-slate-700 font-bold'}>{part.stock}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row — Grandes y con labels */}
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex flex-wrap gap-2">
              {/* Botón Ver */}
              <button 
                type="button"
                onClick={() => setPreviewProduct(part)}
                className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
              >
                <Eye size={15} />
                Ver
              </button>

              {/* Botón Estado (Disponible/Agotado) */}
              <button 
                type="button"
                onClick={() => {
                  const newDisponibilidad = part.disponibilidad === 'Disponible' || !part.disponibilidad ? 'Agotado' : 'Disponible';
                  updateFoodItem(part.id, { disponibilidad: newDisponibilidad });
                }}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 text-[11px] font-bold rounded-xl transition-all cursor-pointer border ${
                  part.disponibilidad === 'Agotado' 
                    ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100' 
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {part.activo === false ? <PackageX size={15} /> : part.disponibilidad === 'Agotado' ? <Pause size={15} /> : <CheckCircle size={15} />}
                {part.disponibilidad === 'Agotado' ? 'Reponer' : 'Disponible'}
              </button>

              {/* Botón Editar */}
              <button 
                type="button"
                onClick={() => openEditor(part)}
                className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-all cursor-pointer"
              >
                <Edit size={15} />
                Editar
              </button>

              {/* Botón Eliminar */}
              <button 
                type="button"
                onClick={() => {
                  if (confirm(`¿Seguro que desea eliminar '${part.nombre}' del inventario?`)) {
                    deleteFoodItem(part.id);
                  }
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
              >
                <Trash2 size={15} />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Vista Previa */}
      {previewProduct && (
        <ProductPreviewModal
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
          onEdit={(p) => { openEditor(p); setPreviewProduct(null); }}
          themeColor={themeColor}
        />
      )}
    </div>
  );
};

export default InventorySection;
