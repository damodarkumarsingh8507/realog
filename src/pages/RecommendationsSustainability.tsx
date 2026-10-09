import React, { useState, useEffect } from 'react';
import {
  Leaf,
  IndianRupee,
  TrendingDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building2,
  Sparkles,
  Sliders,
  TreePine,
  Check,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { BarChart, LineChart } from '../components/charts/Charts';
import { Recommendation, Building } from '../types';
import { api } from '../services/api';

interface RecommendationsProps {
  buildings: Building[];
}

export const RecommendationsSustainability: React.FC<RecommendationsProps> = ({
  buildings
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tariff, setTariff] = useState<number>(8.0);
  const [emissionFactor, setEmissionFactor] = useState<number>(0.82);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Simulated Scenario State (Before vs After)
  const [simulatedReductionPct, setSimulatedReductionPct] = useState<number>(25);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const recs = await api.getRecommendations();
      setRecommendations(recs);
      const settings = await api.getSettings();
      if (settings.electricity_tariff) setTariff(parseFloat(settings.electricity_tariff.value));
      if (settings.grid_emission_factor) setEmissionFactor(parseFloat(settings.grid_emission_factor.value));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    rec: Recommendation,
    newStatus: 'Open' | 'Planned' | 'In Progress' | 'Completed'
  ) => {
    try {
      const updated = await api.updateRecommendation(rec.id, {
        status: newStatus,
        notes: `Status shifted to ${newStatus} on ${new Date().toLocaleDateString('en-IN')}`
      });
      setRecommendations((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setFeedback(`Updated ${rec.id} to '${newStatus}'. Simulated campus mitigation model adjusted.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback('Error updating recommendation: ' + err.message);
    }
  };

  const handleUpdateTariff = async (newVal: number) => {
    setTariff(newVal);
    try {
      await api.updateSettings({ electricity_tariff: newVal.toString() });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Aggregated totals
  const totalSavingsKwh = recommendations.reduce((acc, r) => acc + r.est_savings_kwh, 0);
  const totalSavingsInr = Math.round(totalSavingsKwh * tariff);
  const totalCo2Kg = Math.round(totalSavingsKwh * emissionFactor);
  const treesEquivalent = Math.round(totalCo2Kg / 21); // ~21 kg CO2 absorbed per tree per year

  // Completed items savings
  const completedSavingsKwh = recommendations
    .filter((r) => r.status === 'Completed')
    .reduce((acc, r) => acc + r.est_savings_kwh, 0);
  const completionProgressPct = totalSavingsKwh > 0 ? Math.round((completedSavingsKwh / totalSavingsKwh) * 100) : 0;

  // Before & After Interactive Chart
  const baselineMonthlyCampusKwh = 185000;
  const currentCostMonthly = Math.round(baselineMonthlyCampusKwh * tariff);
  const projectedSavedKwh = Math.round(baselineMonthlyCampusKwh * (simulatedReductionPct / 100));
  const projectedMonthlyKwh = baselineMonthlyCampusKwh - projectedSavedKwh;
  const projectedCostMonthly = Math.round(projectedMonthlyKwh * tariff);
  const monthlyRupeeSavings = currentCostMonthly - projectedCostMonthly;

  const comparisonChartData = {
    labels: ['Current Campus Baseline', 'Projected Post-Action Scenario'],
    datasets: [
      {
        label: 'Monthly Consumption (kWh)',
        data: [baselineMonthlyCampusKwh, projectedMonthlyKwh],
        backgroundColor: ['#f43f5e', '#10b981'],
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Recommendations, Financial Savings &amp; Sustainability
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Convert model-detected anomalies into concrete energy-saving actions with verified ROI and carbon metrics.
          </p>
        </div>

        {/* Tariff Config Pill */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs">
          <span className="font-semibold text-slate-600 flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Utility Tariff:
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.5"
              min="2"
              max="20"
              value={tariff}
              onChange={(e) => handleUpdateTariff(parseFloat(e.target.value) || 8.0)}
              className="w-16 px-2 py-1 rounded-lg border border-slate-200 font-mono font-bold text-slate-900 text-xs text-center"
            />
            <span className="text-slate-400 font-medium">₹/kWh</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Sustainability Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Potential Cost Savings
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-emerald-700 font-mono">
              ₹{totalSavingsInr.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            Across 5 prioritized facility initiatives
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Energy Reduction
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {totalSavingsKwh.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kWh / mo</span>
          </div>
          <p className="text-xs text-blue-600 font-medium mt-1">
            Recoverable university electricity
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              CO₂ Abatement
            </span>
            <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-teal-800 font-mono">
              {(totalCo2Kg / 1000).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Tonnes / mo</span>
          </div>
          <p className="text-xs text-teal-700 font-medium mt-1">
            Based on {emissionFactor} kg CO2/kWh factor
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Offset Equivalence
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TreePine className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-700 font-mono">
              {treesEquivalent}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Trees</span>
          </div>
          <p className="text-xs text-amber-700 font-medium mt-1">
            Urban tree carbon absorption eq.
          </p>
        </div>
      </div>

      {/* Progress towards completion */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-900">
            Implementation Progress of Energy Conservation Measures
          </span>
          <span className="font-mono font-bold text-emerald-700">
            {completionProgressPct}% Implemented ({completedSavingsKwh} kWh realized)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${completionProgressPct}%` }}
          />
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Prioritized Action Recommendations (Facility Manager Triage)
          </h3>
          <span className="text-xs text-slate-500">
            Click status button to update workflow stage
          </span>
        </div>

        {recommendations.map((rec) => {
          const isCompleted = rec.status === 'Completed';
          const isInProgress = rec.status === 'In Progress';
          const isPlanned = rec.status === 'Planned';

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-3xl border transition-all ${
                isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : rec.priority === 'HIGH'
                  ? 'bg-white border-slate-200/90 shadow-sm ring-1 ring-amber-500/10'
                  : 'bg-white border-slate-200/90 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : rec.priority === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {rec.priority} PRIORITY
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{rec.issue}</h4>
                    <span className="text-xs text-slate-500">
                      {rec.building_name || rec.building_id} • {rec.id}
                    </span>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 self-end lg:self-auto text-xs">
                  {(['Open', 'Planned', 'In Progress', 'Completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(rec, st)}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        rec.status === st
                          ? st === 'Completed'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : st === 'In Progress'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : st === 'Planned'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Evidence & Action */}
                <div className="md:col-span-2 space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Telemetry Evidence:
                    </span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mt-0.5">
                      {rec.evidence}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase">
                      Recommended Corrective Action:
                    </span>
                    <p className="text-slate-800 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60 mt-0.5 font-medium leading-relaxed">
                      {rec.action}
                    </p>
                  </div>
                </div>

                {/* ROI Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Estimated Monthly Impact
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Electricity Saved:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {rec.est_savings_kwh} kWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Financial ROI:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ₹{rec.est_savings_inr.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CO₂ Avoided:</span>
                      <span className="font-mono font-bold text-teal-700">
                        {rec.est_co2_reduction_kg} kg
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                    Human verification required before mechanical intervention.
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Before & After Savings Visualizer */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Interactive Before-and-After Savings Visualizer
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                Simulated Scenario
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust the simulated campus efficiency improvement slider to evaluate potential monthly budgetary savings.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <span className="text-xs font-bold text-slate-700">
              Target Reduction: {simulatedReductionPct}%
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="5"
            max="40"
            step="1"
            value={simulatedReductionPct}
            onChange={(e) => setSimulatedReductionPct(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>5% (Minor Setbacks)</span>
            <span>20% (Recommended Target)</span>
            <span>40% (Aggressive Deep Retrofit)</span>
          </div>
        </div>

        {/* Comparison Chart & KPI Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          <div className="lg:col-span-2">
            <BarChart data={comparisonChartData} height={220} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs flex flex-col justify-center">
            <div>
              <span className="text-slate-500 block text-[11px]">Current Monthly Billing:</span>
              <span className="text-lg font-black text-rose-600 font-mono">
                ₹{currentCostMonthly.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Projected Post-Action Billing:</span>
              <span className="text-lg font-black text-emerald-700 font-mono">
                ₹{projectedCostMonthly.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-600 block text-[11px] font-bold">
                Projected Monthly Savings:
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                ₹{monthlyRupeeSavings.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-600 block mt-0.5">
                ({projectedSavedKwh.toLocaleString('en-IN')} kWh avoided / mo)
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Evaluation Grounding:</strong> These post-action values represent simulated scenarios based on mathematical projections. Savings must be verified by subsequent smart meter readings after corrective actions are physically commissioned.
          </span>
        </div>
      </div>
    </div>
  );
};
