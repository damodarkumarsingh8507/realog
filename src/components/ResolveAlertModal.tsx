import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  IndianRupee,
  FileText,
  Send,
  Loader2
} from 'lucide-react';
import { AnomalyAlert } from '../types';
import { api } from '../services/api';

interface ResolveAlertModalProps {
  alert: AnomalyAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onAlertUpdated: (updated: AnomalyAlert) => void;
}

export const ResolveAlertModal: React.FC<ResolveAlertModalProps> = ({
  alert,
  isOpen,
  onClose,
  onAlertUpdated
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [status, setStatus] = useState<'Acknowledged' | 'Resolved'>('Resolved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !alert) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await api.updateAlert(alert.id, {
        status,
        resolution_notes: resolutionNotes.trim() || undefined
      });
      onAlertUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await api.updateAlert(alert.id, {
        status: 'Acknowledged',
        resolution_notes: alert.resolution_notes || 'Triage in progress by facility engineering team.'
      });
      onAlertUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to acknowledge alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                alert.severity === 'RED'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Alert Triage &amp; Resolution
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                  {alert.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {alert.building_name || alert.building_id} • Detected at{' '}
                {new Date(alert.timestamp).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Metrics summary card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Actual Load</span>
              <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                {alert.actual_kwh} kWh
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Expected Baseline</span>
              <div className="text-sm font-bold text-slate-600 font-mono mt-0.5">
                {alert.baseline_kwh} kWh
              </div>
            </div>
            <div>
              <span className="text-[10px] text-rose-600 font-semibold">Excess Cost</span>
              <div className="text-sm font-bold text-rose-600 font-mono mt-0.5">
                ₹{alert.excess_cost_inr.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Explanation & Action */}
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Root Cause Explanation:</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                  RFID Access Log Verified
                </span>
              </div>
              <p className="text-slate-600 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl text-xs mt-1">
                {alert.likely_explanation}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700">Recommended Action:</span>
              <p className="text-slate-600 bg-emerald-50/70 border border-emerald-200/60 p-2.5 rounded-xl text-xs mt-1">
                {alert.recommended_action}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Update Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Acknowledged')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    status === 'Acknowledged'
                      ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Acknowledged (In Progress)
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('Resolved')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    status === 'Resolved'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as Resolved
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Resolution &amp; Corrective Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                placeholder="E.g., Dispatched electrical technician. Switched off split AC unit in Room 304 and reprogrammed BMS automated shutoff at 19:00."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs outline-hidden resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Save &amp; Update Alert
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
