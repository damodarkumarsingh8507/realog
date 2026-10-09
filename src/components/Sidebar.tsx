import React from 'react';
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  AlertTriangle,
  Leaf,
  Settings2,
  Zap,
  ChevronRight,
  ShieldCheck,
  Radio,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertCount: number;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertCount,
  isOpen,
  onToggleOpen
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Executive Overview',
      subtitle: 'Campus KPIs & Baselining',
      icon: LayoutDashboard
    },
    {
      id: 'analytics',
      label: 'Building Analytics',
      subtitle: 'Blocks, Labs, Library & Hostels',
      icon: Building2
    },
    {
      id: 'prediction',
      label: 'AI Demand Prediction',
      subtitle: '24-Hour Predictive Forecasting',
      icon: TrendingUp,
      badge: 'AI'
    },
    {
      id: 'anomalies',
      label: 'Wastage & Anomalies',
      subtitle: 'Automated Leakage Detection',
      icon: AlertTriangle,
      alertBadge: activeAlertCount
    },
    {
      id: 'recommendations',
      label: 'Savings & Sustainability',
      subtitle: 'Financial ROI & Carbon Offsets',
      icon: Leaf,
      badge: 'ESG'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={onToggleOpen}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#090f1e] text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold ring-1 ring-emerald-400/30">
              <Zap className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                  SmartEnergy
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5 font-medium">
                Campus Energy Intelligence
              </p>
            </div>
          </div>

          {/* Unified Enterprise Campus Badge */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5 text-left">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] leading-tight text-slate-300">
              <span className="font-semibold text-white">Central University Campus</span>
              <div className="text-slate-400 text-[10px] flex items-center gap-1.5 mt-0.5">
                <span className="text-emerald-400 font-medium">5 Monitored Blocks</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Live IoT Grid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Ingestion Status Pill */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">Continuous Simulation</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-bold">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Campus Operations &amp; Intelligence
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (window.innerWidth < 1024) onToggleOpen();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-700/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="truncate leading-snug">{item.label}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-emerald-100' : 'text-slate-400 group-hover:text-slate-400'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.alertBadge !== undefined && item.alertBadge > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-xs animate-pulse">
                      {item.alertBadge}
                    </span>
                  )}
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Enterprise Operations Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-medium text-slate-200">Campus Grid Health</span>
            </div>
            <span className="font-bold text-emerald-400">99.8%</span>
          </div>

          <div className="px-2 pt-0.5 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Autonomous Grid Management v3.2</span>
          </div>
        </div>
      </aside>
    </>
  );
};
