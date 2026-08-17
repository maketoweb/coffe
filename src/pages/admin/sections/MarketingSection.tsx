import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { BarChart3, Users, Zap, Send, TrendingUp } from 'lucide-react';
import { MarketingDashboard } from './marketing/MarketingDashboard';
import { SegmentsViewer } from './marketing/SegmentsViewer';
import { AutomationsManager } from './marketing/AutomationsManager';
import { CampaignCreator } from './marketing/CampaignCreator';
import { PushAnalytics } from './marketing/PushAnalytics';

type MarketingTab = 'dashboard' | 'segments' | 'automations' | 'campaigns' | 'analytics';

const MarketingSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MarketingTab>('dashboard');
  const { config } = useApp();
  const themeColor = config.theme_color || '#FF6B35';

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'segments' as const, label: 'Segmentos', icon: Users },
    { id: 'automations' as const, label: 'Automations', icon: Zap },
    { id: 'campaigns' as const, label: 'Campanas', icon: Send },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Marketing Automation
        </h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
            style={{
              background: activeTab === tab.id ? themeColor : 'white',
              color: activeTab === tab.id ? '#fff' : '#71717a',
              border: `1px solid ${activeTab === tab.id ? themeColor : '#e5e7eb'}`
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <MarketingDashboard />}
      {activeTab === 'segments' && <SegmentsViewer />}
      {activeTab === 'automations' && <AutomationsManager />}
      {activeTab === 'campaigns' && <CampaignCreator />}
      {activeTab === 'analytics' && <PushAnalytics />}
    </div>
  );
};

export default MarketingSection;
