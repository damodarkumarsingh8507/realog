import React, { useState } from 'react';
import {
  Zap,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Leaf,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Clock,
  ChevronRight,
  ShieldAlert,
  Flame,
  Info
} from 'lucide-react';
import { LineChart, BarChart } from '../components/charts/Charts';
import { CampusSummary, DailyTrend, BuildingDistribution, HourlyReading, AnomalyAlert } from '../types';

interface ExecutiveOverviewProps {
  summary: CampusSummary;
  dailyTrends: DailyTrend[];
  buildingDistribution: BuildingDistribution[];
  hourly24: HourlyReading[];
  recentAlerts: AnomalyAlert[];
  onSelectBuilding: (buildingId: string) => void;
  onNavigateToAlerts: () => void;
  onOpenAlertModal: (alert: AnomalyAlert) => void;
  onNavigateToRecommendations: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  summary,
  dailyTrends,
  buildingDistribution,
  hourly24,
  recentAlerts,
  onSelectBuilding,
  onNavigateToAlerts,
  onOpenAlertModal,
  onNavigateToRecommendations
}) => {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'custom'>('7d');

  // Filter daily trends based on dateRange
  const displayedDaily = dateRange === 'today'
    ? dailyTrends.slice(-1)
    : dateRange === '7d'
    ? dailyTrends.slice(-7)
    : dailyTrends;

  // Chart 1: Daily Actual vs Expected Baseline
  const lineChartData = {
    labels: displayedDaily.map((d) => {
      const parts = d.date.split('-');
      return `${parts[2]}/${parts[1]}`;
    }),
    datasets: [
      {
        label: 'Actual Consumption (kWh)',
        data: displayedDaily.map((d) => d.actualKwh),
        borderColor: '#2563eb', // Blue
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: 'Expected Baseline (kWh)',
        data: displayedDaily.map((d) => d.expectedKwh),
        borderColor: '#10b981', // Emerald green
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5
      }
    ]
  };

  // Chart 2: Building-Wise Consumption Distribution
  const barChartData = {
    labels: buildingDistribution.map((b) => b.name.replace('Academic Block ', 'Block ')),
    datasets: [
      {
        label: "Today's Consumption (kWh)",
        data: buildingDistribution.map((b) => b.total_kwh),
        backgroundColor: [
          '#3b82f6',
          '#60a5fa',
          '#f59e0b',
          '#10b981',
          '#8b5cf6'
        ],
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  // Chart 3: 24-Hour Campus Hourly Load Profile
  const hourly24Data = {
    labels: hourly24.map((h) => `${h.hour.toString().padStart(2, '0')}:00`),
    datasets: [
      {
        label: 'Campus Load (kWh)',
        data: hourly24.map((h) => h.kwh),
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
        fill: true,
        tension: 0.4,
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Insight & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Campus Energy Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time energy consumption telemetry, demand baselining, and automated wastage auditing.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300/70 text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setDateRange('today')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('7d')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === '30d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange('custom')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === 'custom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Custom Range
          </button>
        </div>
      </div>

      {/* AI Energy Intelligence Headline Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
          summary.aiInsight.urgency === 'high'
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : summary.aiInsight.urgency === 'medium'
            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            summary.aiInsight.urgency === 'high'
              ? 'bg-rose-200/80 text-rose-700'
              : summary.aiInsight.urgency === 'medium'
              ? 'bg-amber-200/80 text-amber-700'
              : 'bg-emerald-200/80 text-emerald-700'
          }`}
        >
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              AI Campus Intelligence Insight
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                summary.aiInsight.urgency === 'high'
                  ? 'bg-rose-600 text-white'
                  : summary.aiInsight.urgency === 'medium'
                  ? 'bg-amber-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {summary.aiInsight.urgency.toUpperCase()} PRIORITY
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mt-1">
            {summary.aiInsight.headline}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {summary.aiInsight.detail}
          </p>
        </div>
      </div>

      {/* 6 Key Performance Indicator (KPI) Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Today's Consumption */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Today's Energy
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {summary.todayConsumptionKwh.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kWh</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Recorded over 24h</span>
          </p>
        </div>

        {/* KPI 2: Today's Estimated Cost */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Electricity Cost
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              ₹{summary.todayCostInr.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Tariff @ ₹{summary.tariff.toFixed(1)}/kWh
          </p>
        </div>

        {/* KPI 3: Tomorrow's Predicted Consumption */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Predicted Tomorrow
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-950 font-mono tracking-tight">
              {summary.tomorrowPredictedKwh.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">kWh</span>
          </div>
          <p className="text-[11px] text-indigo-700 font-medium mt-1">
            Projected Cost: ₹{summary.tomorrowPredictedCostInr.toLocaleString('en-IN')}
          </p>
        </div>

        {/* KPI 4: Active Anomalies / Wastage Alerts */}
        <div
          onClick={onNavigateToAlerts}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Alerts
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600 font-mono tracking-tight">
              {summary.activeAlertsCount}
            </span>
            <span className="text-xs text-rose-500 font-semibold">Unresolved</span>
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
            <span>Requires triage</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* KPI 5: Estimated Excess Cost Detected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Excess Cost Leak
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-600 font-mono tracking-tight">
              ₹{summary.excessCostDetectedInr.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Wasted from baseline deviations
          </p>
        </div>

        {/* KPI 6: Estimated CO2 Emissions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              CO₂ Emissions
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {(summary.todayCo2EmissionsKg / 1000).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Tonnes</span>
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">
            Grid factor @ {summary.emissionFactor} kg/kWh
          </p>
        </div>
      </div>

      {/* Row 2: Top Wastage & Savings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Wastage Source Card */}
        {summary.topWastageSource && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Top Campus Wastage Source
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  Critical Focus
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">
                {summary.topWastageSource.buildingName}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {summary.topWastageSource.reason}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Detected Excess
                </span>
                <div className="text-sm font-bold text-rose-600 font-mono">
                  +{summary.topWastageSource.excessKwh} kWh (₹{summary.topWastageSource.excessCostInr.toLocaleString('en-IN')})
                </div>
              </div>
              <button
                onClick={() => onSelectBuilding(summary.topWastageSource!.buildingId)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                Inspect Zone &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Potential Savings This Month Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-4 h-4" /> Potential Monthly Savings
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Actionable ROI
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700 font-mono">
                ₹{summary.potentialMonthlySavingsInr.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ month</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Estimated university budget recovered by implementing recommended thermostat setpoint optimizations and corridor lighting automation.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-emerald-700 font-semibold">
              5 Actionable Recommendations Ready
            </span>
            <button
              onClick={onNavigateToRecommendations}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Review Actions &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Actual vs Expected Baseline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daily Electricity Consumption vs Expected Baseline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Baseline calculated dynamically using temperature, schedule and normal occupancy.
              </p>
            </div>
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Actual
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2" /> Baseline
            </div>
          </div>
          <LineChart data={lineChartData} height={260} />
        </div>

        {/* Chart 2: Building-Wise Load Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Campus Building Electricity Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total recorded kWh per building for the latest operational day.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
              5 Facilities
            </span>
          </div>
          <BarChart data={barChartData} height={260} />
        </div>
      </div>

      {/* Row 4: 24-Hour Profile & Energy Intensity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Electricity Profile */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                24-Hour Campus Electricity Consumption Profile
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Campus-wide hourly demand showing diurnal curves, class peak and night standby base load.
              </p>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 00:00 - 23:00
            </span>
          </div>
          <LineChart data={hourly24Data} height={230} />
        </div>

        {/* Building Energy Intensity Ranking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Energy Intensity Ranking
              </h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                kWh / m²
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Normalizes building energy usage by usable carpet area to highlight true efficiency.
            </p>

            <div className="space-y-3">
              {buildingDistribution.map((b, idx) => {
                const maxIntensity = Math.max(...buildingDistribution.map((x) => x.energyIntensity), 1);
                const pct = Math.round((b.energyIntensity / maxIntensity) * 100);

                return (
                  <div
                    key={b.id}
                    onClick={() => onSelectBuilding(b.id)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-900 truncate max-w-[120px]">
                          {b.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono">
                          {b.energyIntensity}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400">kWh/m²</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0
                            ? 'bg-rose-500'
                            : idx === 1
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Click any building to inspect in-depth hourly analytics
            </span>
          </div>
        </div>
      </div>

      {/* Row 5: Recent Alerts Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Anomaly &amp; Wastage Detections
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified by multidimensional load scoring cross-referenced with facility operating hours.
            </p>
          </div>
          <button
            onClick={onNavigateToAlerts}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All Alerts &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2.5">Alert ID</th>
                <th className="pb-2.5">Building</th>
                <th className="pb-2.5">Detected Time</th>
                <th className="pb-2.5">Actual vs Base</th>
                <th className="pb-2.5">Excess Cost</th>
                <th className="pb-2.5">Severity</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAlerts.slice(0, 5).map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-800">{a.id}</td>
                  <td className="py-3 font-semibold text-slate-900">{a.building_name || a.building_id}</td>
                  <td className="py-3 text-slate-500">
                    {new Date(a.timestamp).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 font-mono">
                    <span className="text-slate-900 font-bold">{a.actual_kwh}</span> /{' '}
                    <span className="text-slate-400">{a.baseline_kwh} kWh</span>{' '}
                    <span className="text-rose-600 font-semibold text-[11px]">
                      (+{a.deviation_pct}%)
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-rose-600">
                    ₹{a.excess_cost_inr.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.severity === 'RED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        a.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'Acknowledged'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onOpenAlertModal(a)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                    >
                      Triage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
