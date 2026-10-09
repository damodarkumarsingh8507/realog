import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  IndianRupee,
  Building2,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  Sliders,
  Check,
  XCircle
} from 'lucide-react';
import { AnomalyAlert, Building } from '../types';
import { api } from '../services/api';

interface AnomalyDetectionProps {
  buildings: Building[];
  onOpenAlertModal: (alert: AnomalyAlert) => void;
  onAlertUpdated: (updated: AnomalyAlert) => void;
  lastUpdatedAlert?: AnomalyAlert | null;
}

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  buildings,
  onOpenAlertModal,
  onAlertUpdated,
  lastUpdatedAlert
}) => {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'RED' | 'YELLOW' | 'GREEN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Open' | 'Acknowledged' | 'Resolved'>('ALL');
  const [buildingFilter, setBuildingFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAlerts({
        severity: severityFilter !== 'ALL' ? severityFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        building_id: buildingFilter !== 'ALL' ? buildingFilter : undefined
      });
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter, buildingFilter]);

  // Synchronize status immediately whenever an alert is updated via the modal
  useEffect(() => {
    if (lastUpdatedAlert) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === lastUpdatedAlert.id ? { ...a, ...lastUpdatedAlert } : a))
      );
    }
  }, [lastUpdatedAlert]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setFeedback(null);
    try {
      const result = await api.analyzeAnomalies();
      setFeedback(`Anomaly scan completed across ${result.analyzedReadings.toLocaleString('en-IN')} campus readings. Flagged ${result.newAlertsCreated} active events into the operations register.`);
      await loadAlerts();
    } catch (err: any) {
      setFeedback(`Analysis error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAcknowledge = async (targetAlert: AnomalyAlert) => {
    try {
      const updated = await api.updateAlert(targetAlert.id, {
        status: 'Acknowledged',
        resolution_notes: 'Acknowledged from Anomaly Center. Facility team inspecting.'
      });
      onAlertUpdated(updated);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err: any) {
      setFeedback('Error updating alert: ' + err.message);
    }
  };

  // Filter by search
  const filteredAlerts = alerts.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.id.toLowerCase().includes(term) ||
      (a.building_name || '').toLowerCase().includes(term) ||
      a.likely_explanation.toLowerCase().includes(term) ||
      a.recommended_action.toLowerCase().includes(term)
    );
  });

  // KPI calculations
  const totalExcessKwh = Math.round(
    alerts.reduce((acc, a) => acc + (a.status !== 'Resolved' ? a.excess_kwh : 0), 0)
  );
  const totalExcessCost = Math.round(
    alerts.reduce((acc, a) => acc + (a.status !== 'Resolved' ? a.excess_cost_inr : 0), 0)
  );
  const redAlertsCount = alerts.filter((a) => a.severity === 'RED' && a.status !== 'Resolved').length;
  const yellowAlertsCount = alerts.filter((a) => a.severity === 'YELLOW' && a.status !== 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Anomaly Detection &amp; Wastage Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Continuous energy anomaly detection cross-referenced with building timetables and occupancy schedules.
          </p>
        </div>

        {/* Action Controls */}
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-emerald-400' : ''}`} />
          {isAnalyzing ? 'Scanning Campus Grid...' : 'Run Anomaly Scan'}
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Severity Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Critical (RED)
            </span>
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs">
              !
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 font-mono">
              {redAlertsCount}
            </span>
            <span className="text-xs text-rose-500 font-medium">Spikes &gt; 45% / Off-Hours</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Wastage (YELLOW)
            </span>
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 font-bold flex items-center justify-center text-xs">
              ▲
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {yellowAlertsCount}
            </span>
            <span className="text-xs text-amber-600 font-medium">Unoccupied Lighting / AC</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Excess Energy
            </span>
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">
              ⚡
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {totalExcessKwh.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kWh</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Financial Leak
            </span>
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-xs">
              ₹
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-600 font-mono">
              ₹{totalExcessCost.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Alert ID, building, or cause..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 text-xs outline-hidden"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="RED">Red (Critical Spike)</option>
            <option value="YELLOW">Yellow (Wastage Warning)</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Building */}
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-hidden"
          >
            <option value="ALL">All Campus Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deduplication & Integrity Indicator */}
      <div className="px-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Relational Deduplication Active: Events with matching (building_id, timestamp) are idempotent across re-runs.
          </span>
        </div>
        <span className="font-mono text-slate-500 font-medium">
          Showing {filteredAlerts.length} incidents
        </span>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-xs text-slate-500">
            <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
            No anomaly alerts match your selected filters. All systems within standard baselines.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isResolved = alert.status === 'Resolved';
            const isAcknowledged = alert.status === 'Acknowledged';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isResolved
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : alert.severity === 'RED'
                    ? 'bg-white border-rose-200 shadow-sm hover:border-rose-300 ring-1 ring-rose-500/10'
                    : 'bg-white border-amber-200 shadow-sm hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        alert.severity === 'RED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {alert.severity === 'RED' ? '!' : '▲'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {alert.id}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-sm text-slate-900">
                          {alert.building_name || alert.building_id}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            alert.severity === 'RED'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {alert.severity} SEVERITY
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Detected: {new Date(alert.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-auto">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isAcknowledged
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {alert.status}
                    </span>

                    {!isResolved && !isAcknowledged && (
                      <button
                        onClick={() => handleQuickAcknowledge(alert)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}

                    <button
                      onClick={() => onOpenAlertModal(alert)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                    >
                      {isResolved ? 'View Resolution' : 'Resolve Incident'}
                    </button>
                  </div>
                </div>

                {/* Body: Calculations & 3 Explainability Questions */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  {/* Energy Math Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Consumption Metrics
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Actual:</span>
                      <span className="font-mono font-bold text-slate-900">{alert.actual_kwh} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expected:</span>
                      <span className="font-mono text-slate-600">{alert.baseline_kwh} kWh</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-rose-600">
                      <span>Excess:</span>
                      <span className="font-mono">+{alert.excess_kwh} kWh (+{alert.deviation_pct}%)</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                      <span>Est. Cost:</span>
                      <span className="font-mono text-rose-600">₹{alert.excess_cost_inr.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* 3 Explainability Answers */}
                  <div className="md:col-span-3 space-y-2.5">
                    <div>
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        1. What happened? &amp; Why was it flagged?
                      </span>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        {alert.likely_explanation}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        2. What should the facility manager do next?
                      </span>
                      <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                        {alert.recommended_action}
                      </p>
                    </div>

                    {alert.resolution_notes && (
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-700">
                        <span className="font-bold text-slate-900">3. Resolution Log: </span>
                        <span>{alert.resolution_notes}</span>
                        {alert.resolved_at && (
                          <span className="text-slate-400 text-[10px] block mt-0.5">
                            Resolved on {new Date(alert.resolved_at).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
