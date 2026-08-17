import React from 'react';
import { FoodOptionGroup, SelectedOption } from '../types/store';
import { Check, Circle } from 'lucide-react';

interface ProductOptionsEditorProps {
  optionGroups: FoodOptionGroup[];
  selectedOptions: SelectedOption[];
  onSelectionChange: (options: SelectedOption[], total: number) => void;
  themeColor?: string;
}

export const ProductOptionsEditor: React.FC<ProductOptionsEditorProps> = ({
  optionGroups,
  selectedOptions,
  onSelectionChange,
  themeColor = '#FF6B35'
}) => {

  const handleRadioSelect = (groupName: string, optionId: string, optionName: string, precioUsd: number) => {
    const newOptions = selectedOptions.filter(o => o.group_name !== groupName);
    newOptions.push({ group_name: groupName, option_name: optionName, precio_usd: precioUsd });
    const total = newOptions.reduce((acc, o) => acc + o.precio_usd, 0);
    onSelectionChange(newOptions, total);
  };

  const handleCheckboxToggle = (groupName: string, optionId: string, optionName: string, precioUsd: number, maxSelect: number) => {
    const groupOptions = selectedOptions.filter(o => o.group_name === groupName);
    const isSelected = groupOptions.some(o => o.option_name === optionName);

    let newGroupOptions: SelectedOption[];
    if (isSelected) {
      newGroupOptions = groupOptions.filter(o => o.option_name !== optionName);
    } else {
      if (groupOptions.length >= maxSelect) {
        newGroupOptions = [...groupOptions.slice(1), { group_name: groupName, option_name: optionName, precio_usd: precioUsd }];
      } else {
        newGroupOptions = [...groupOptions, { group_name: groupName, option_name: optionName, precio_usd: precioUsd }];
      }
    }

    const otherOptions = selectedOptions.filter(o => o.group_name !== groupName);
    const newOptions = [...otherOptions, ...newGroupOptions];
    const total = newOptions.reduce((acc, o) => acc + o.precio_usd, 0);
    onSelectionChange(newOptions, total);
  };

  const isOptionSelected = (groupName: string, optionName: string): boolean => {
    return selectedOptions.some(o => o.group_name === groupName && o.option_name === optionName);
  };

  const getGroupSelectionCount = (groupName: string): number => {
    return selectedOptions.filter(o => o.group_name === groupName).length;
  };

  return (
    <div className="flex flex-col gap-4">
      {optionGroups.map(group => {
        const isRadio = group.max_select === 1;
        const selectionCount = getGroupSelectionCount(group.nombre);
        const isRequired = group.min_select >= 1;

        return (
          <div key={group.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                {group.nombre}
                {isRequired && <span className="text-red-400 ml-1">*</span>}
              </h4>
              {!isRadio && (
                <span className="text-[10px] font-mono text-zinc-400">
                  {selectionCount}/{group.max_select}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {group.options.filter(o => o.activo !== false).map(option => {
                const selected = isOptionSelected(group.nombre, option.nombre);

                if (isRadio) {
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleRadioSelect(group.nombre, option.id, option.nombre, option.precio_usd)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border-2 cursor-pointer"
                      style={selected ? {
                        borderColor: themeColor,
                        backgroundColor: `${themeColor}15`,
                        color: themeColor
                      } : {
                        borderColor: '#E2E8F0',
                        backgroundColor: 'white',
                        color: '#475569'
                      }}
                    >
                      {selected ? (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                          <Check size={10} className="text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <Circle size={16} className="text-slate-300" />
                      )}
                      <span>{option.nombre}</span>
                      {option.precio_usd > 0 && (
                        <span className="text-[10px] font-mono opacity-70">+${option.precio_usd.toFixed(2)}</span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleCheckboxToggle(group.nombre, option.id, option.nombre, option.precio_usd, group.max_select)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border-2 cursor-pointer"
                    style={selected ? {
                      borderColor: themeColor,
                      backgroundColor: `${themeColor}15`,
                      color: themeColor
                    } : {
                      borderColor: '#E2E8F0',
                      backgroundColor: 'white',
                      color: '#475569'
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center transition-all"
                      style={selected ? { backgroundColor: themeColor } : { border: '2px solid #CBD5E1' }}
                    >
                      {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span>{option.nombre}</span>
                    {option.precio_usd > 0 && (
                      <span className="text-[10px] font-mono opacity-70">+${option.precio_usd.toFixed(2)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
