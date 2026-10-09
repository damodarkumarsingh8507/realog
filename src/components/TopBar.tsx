import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Play,
  Calendar,
  Building,
  AlertTriangle,
  RefreshCw,
  Radio,
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { AnomalyAlert } from '../types';

interface TopBarProps {
  onToggleSidebar: () => void;
  onRunWorkflow: () => void;
  isWorkflowRunning: boolean;
  activeAlerts: AnomalyAlert[];
  onSelectAlert: (alert: AnomalyAlert) => void;
  campusName?: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  onRunWorkflow,
  isWorkflowRunning,
  activeAlerts,
  onSelectAlert,
  campusName = 'Apex University Central Campus',
  onRefresh,
  isRefreshing
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 transition-shadow">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Single Unified Campus Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Unified Single Campus Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/90 text-slate-900 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900">
                  {campusName}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Grid Online
                </span>
              </div>
              <div className="hidden xs:flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                <span>5 Monitored Blocks</span>
                <span>•</span>
                <span>Smart Energy Telemetry</span>
              </div>
            </div>
          </div>

          {/* Live Date Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 text-slate-600 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentDateFormatted}</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
              LIVE
            </span>
          </div>
        </div>

        {/* Right: Actions, Notifications & Workflow Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Data */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Live Metrics"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-20 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Active Wastage &amp; Anomalies
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {activeAlerts.length} active issues across campus blocks
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      Live Leakage
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {activeAlerts.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                        <span className="font-semibold text-slate-700">Campus Grid Optimal</span>
                        <p className="text-[11px] mt-0.5">No unresolved energy anomalies detected.</p>
                      </div>
                    ) : (
                      activeAlerts.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => {
                            onSelectAlert(a);
                            setShowNotifications(false);
                          }}
                          className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start gap-3"
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                              a.severity === 'RED'
                                ? 'bg-rose-500 ring-2 ring-rose-200'
                                : a.severity === 'YELLOW'
                                ? 'bg-amber-400 ring-2 ring-amber-200'
                                : 'bg-emerald-500 ring-2 ring-emerald-200'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-900 truncate">
                                {a.building_name || a.building_id}
                              </span>
                              <span className="text-[10px] font-mono text-rose-600 font-bold">
                                +{a.excess_kwh} kWh
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                              {a.likely_explanation}
                            </p>
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                              <span>₹{a.excess_cost_inr.toLocaleString('en-IN')} excess cost</span>
                              <span className="text-emerald-600 font-medium">Triage &rarr;</span>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* "Run Campus Energy Audit" Trigger */}
          <button
            onClick={onRunWorkflow}
            disabled={isWorkflowRunning}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/25 active:scale-98 transition-all disabled:opacity-70 group"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${isWorkflowRunning ? 'animate-spin' : 'group-hover:scale-110'} transition-transform`} />
            <span className="hidden sm:inline">Run Campus Audit</span>
            <span className="sm:hidden">Audit</span>
          </button>

          {/* User Profile Pill */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
              FM
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-semibold text-slate-800">Campus Operations</div>
              <div className="text-[10px] text-slate-500">Chief Energy Officer</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
