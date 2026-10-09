import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Loader2,
  Play,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  X,
  TrendingDown,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [workflowData, setWorkflowData] = useState<any>(null);

  const stepsList = [
    { num: 1, title: 'Campus Smart Grid Telemetry Ingestion', desc: 'Syncing real-time meter readings across all 5 monitored campus zones.' },
    { num: 2, title: 'Database Schema & Relational Integrity Verified', desc: 'Verifying relational foreign keys, timestamps, and active indexes.' },
    { num: 3, title: 'AI Demand Prediction Model Calibration', desc: 'Executing chronological train-test split on seasonal and diurnal load vectors.' },
    { num: 4, title: 'Generate 24-Hour Campus Demand Forecast', desc: 'Forecasting tomorrow hourly loads and identifying campus peak period.' },
    { num: 5, title: 'Multidimensional Isolation Forest Anomaly Sweep', desc: 'Clustering multi-variable consumption patterns to isolate abnormal spikes.' },
    { num: 6, title: 'Facility Operating Hours & Occupancy Cross-Check', desc: 'Evaluating expected baselines against off-hours and low-occupancy periods.' },
    { num: 7, title: 'Quantify Financial Excess & Energy Losses', desc: 'Benchmarking excess kWh consumption against campus tariff structure.' },
    { num: 8, title: 'Synthesize Prioritized Energy Recommendations', desc: 'Generating corrective actions with projected financial ROI and carbon offsets.' },
    { num: 9, title: 'Severity Classification & Safety Triage', desc: 'Categorizing detected events into Normal (Green), Wastage Warning (Yellow), and Critical (Red).' },
    { num: 10, title: 'Facility Dispatch & Resolution Workflow Primed', desc: 'Enabling operator acknowledgement, corrective setpoints, and resolution logging.' },
    { num: 11, title: 'Maintain Auditable Campus Action Trail', desc: 'Recording permanent audit logs for governance, ESG reporting, and compliance.' },
    { num: 12, title: 'Campus Optimization & Mitigation Ready', desc: 'Verified potential savings unlocked across all university infrastructure.' }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsRunning(false);
      setIsDone(false);
      setWorkflowData(null);
    }
  }, [isOpen]);

  const handleStartWorkflow = async () => {
    setIsRunning(true);
    setIsDone(false);

    try {
      // Animate progress smoothly through steps
      for (let i = 0; i < stepsList.length - 1; i++) {
        setCurrentStepIndex(i);
        await new Promise((r) => setTimeout(r, 200));
      }

      // Execute backend API
      const result = await api.runFullWorkflow();
      setWorkflowData(result);
      setCurrentStepIndex(stepsList.length);
      setIsDone(true);
      setIsRunning(false);

      // Trigger Confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      onComplete();
    } catch (err: any) {
      console.error('Workflow error:', err);
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5 fill-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Campus Energy Audit &amp; Optimization Sweep
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                  Enterprise v3.2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Telemetry Ingestion &rarr; Forecast Calibration &rarr; Anomaly Isolation &rarr; ROI Actions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Steps Timeline */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">
                Autonomous Campus Energy Intelligence Sweep
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Executes an end-to-end grid analysis cycle: synchronizing live building telemetry, training predictive regression trees, scoring multi-variable isolation trees, calculating financial tariff losses, and formulating actionable facility recommendations.
              </p>
            </div>
          </div>

          {/* Stepper List */}
          <div className="space-y-2.5">
            {stepsList.map((step, idx) => {
              const isPassed = currentStepIndex > idx || isDone;
              const isCurrent = currentStepIndex === idx && isRunning;

              return (
                <div
                  key={step.num}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    isPassed
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : isCurrent
                      ? 'bg-blue-50/70 border-blue-300 text-blue-950 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200/80 text-slate-400'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {step.num}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold leading-tight ${isPassed || isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                        Step {step.num}: {step.title}
                      </span>
                      {isPassed && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          Complete
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 leading-relaxed ${isPassed || isCurrent ? 'text-slate-600' : 'text-slate-400'}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isDone ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                All 12 audit stages completed successfully!
              </span>
            ) : isRunning ? (
              <span className="text-blue-700 font-semibold flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                Executing stage {currentStepIndex + 1} of 12...
              </span>
            ) : (
              <span>Ready to trigger automated campus sweep</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isDone ? 'Close' : 'Cancel'}
            </button>

            {!isDone ? (
              <button
                onClick={handleStartWorkflow}
                disabled={isRunning}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-60"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Audit Sweep</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
