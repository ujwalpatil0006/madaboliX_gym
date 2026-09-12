import React from 'react';
import { LayoutGrid, Users, Dumbbell, CreditCard, BarChart3, BellRing } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  badgeCounts?: {
    members?: number;
    trainers?: number;
    billing?: number;
    reports?: number;
    alerts?: number;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  badgeCounts,
}) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: 'members',
      label: 'Members',
      icon: <Users className="w-5 h-5" />,
      badge: badgeCounts?.members,
    },
    {
      id: 'trainers',
      label: 'Trainers',
      icon: <Dumbbell className="w-5 h-5" />,
      badge: badgeCounts?.trainers,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: <BellRing className="w-5 h-5" />,
      badge: badgeCounts?.alerts,
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <CreditCard className="w-5 h-5" />,
      badge: badgeCounts?.billing,
    },
    {
      id: 'reports',
      label: 'Revenue',
      icon: <BarChart3 className="w-5 h-5" />,
      badge: badgeCounts?.reports,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#e2e8f0] pb-safe shadow-[0_-4px_20px_rgba(2,132,199,0.05)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 relative ${
                isActive
                  ? 'text-[#0284c7] font-semibold'
                  : 'text-[#64748b] hover:text-[#0b1c30]'
              }`}
            >
              {/* Active Tab Accent Bar */}
              {isActive && (
                <div className="absolute -top-2 w-8 h-1 bg-[#0284c7] rounded-full" />
              )}

              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#ba1a1a] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>

              <span className="text-[11px] font-medium tracking-tight mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
