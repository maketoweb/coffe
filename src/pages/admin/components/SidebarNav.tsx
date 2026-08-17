import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
  groupLabel?: string;
  adminOnly?: boolean;
}

interface SidebarNavProps {
  groupedSections: { group: string; groupLabel: string; sections: SectionItem[] }[];
  activeSection: string;
  themeColor: string;
  onSectionChange: (sectionId: string) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ groupedSections, activeSection, themeColor, onSectionChange }) => (
  <nav className="flex-1 overflow-y-auto p-3 space-y-3">
    {groupedSections.map(({ group, groupLabel, sections }) => (
      <div key={group}>
        <p className="text-[9px] font-bold uppercase tracking-widest px-3 mb-1" style={{ color: 'var(--ios-text-secondary)' }}>
          {groupLabel}
        </p>
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer touch-target"
              style={{
                background: isActive ? `${themeColor}15` : 'transparent',
                color: isActive ? themeColor : 'var(--ios-text-secondary)',
                borderLeft: isActive ? `3px solid ${themeColor}` : '3px solid transparent',
              }}
            >
              <Icon size={18} />
              {section.label}
            </button>
          );
        })}
      </div>
    ))}
  </nav>
);

export default SidebarNav;
