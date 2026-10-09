import React, { useState, useEffect } from 'react';
import {
  Building2,
  Zap,
  Users,
  Thermometer,
  AirVent,
  Lightbulb,
  Clock,
  AlertTriangle,
  IndianRupee,
  Layers,
  Calendar,
  Sparkles,
  TrendingUp,
  Loader2,
  Cpu,
  BookOpen,
  Home,
  CreditCard
} from 'lucide-react';
import { LineChart, BarChart } from '../components/charts/Charts';
import { Building, AnomalyAlert } from '../types';
import { api, BuildingAnalyticsResponse } from '../services/api';

interface BuildingAnalyticsProps {
  buildings: Building[];
  selectedBuildingId: string;
  onSelectBuildingId: (id: string) => void;
  onOpenAlertModal: (alert: AnomalyAlert) => void;
}

export const BuildingAnalytics: React.FC<BuildingAnalyticsProps> = ({
  buildings,
  selectedBuildingId,
  onSelectBuildingId,
  onOpenAlertModal
}) => {
  const [data, setData] = useState<BuildingAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeView, setTimeView] = useState<'24h' | '30d'>('24h');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    api
      .getBuildingAnalytics(selectedBuildingId)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load building analytics');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBuildingId]);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold">Loading building telemetry &amp; baselines...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
        {error || 'Unable to retrieve building data'}
      </div>
    );
  }

  const {
    building,
    latestReading,
    normalExpectedKwh,
    totalKwh,
    estCostInr,
    avgHourlyKwh,
    peakRecordedKwh,
    hourlyComparison,
    dailyTrend,
    anomalies
  } = data;

  // Hourly Expected vs Actual Chart
  const hourlyChartData = {
    labels: hourlyComparison.map((h) => `${h.hour.toString().padStart(2, '0')}:00`),
    datasets: [
      {
        label: 'Actual Consumption (kWh)',
        data: hourlyComparison.map((h) => h.actualKwh),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5
      },
      {
        label: 'Expected Baseline (kWh)',
        data: hourlyComparison.map((h) => h.expectedKwh),
        borderColor: '#10b981',
        borderDash: [5, 5],
        tension: 0.35,
        borderWidth: 2
      }
    ]
  };

  // Occupancy & Temperature Profile Chart
  const occTempChartData = {
    labels: hourlyComparison.map((h) => `${h.hour.toString().padStart(2, '0')}:00`),
    datasets: [
      {
        type: 'line' as const,
        label: 'RFID Turnstile Net Headcount (Students)',
        data: hourlyComparison.map((h) => h.occupancy),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        yAxisID: 'yOcc',
        tension: 0.3,
        borderWidth: 2.5
      },
      {
        type: 'line' as const,
        label: 'Ambient Temp (°C)',
        data: hourlyComparison.map((h) => h.temperature),
        borderColor: '#f59e0b',
        yAxisID: 'yTemp',
        tension: 0.3,
        borderWidth: 2,
        borderDash: [4, 4]
      }
    ]
  };

  const occTempOptions: any = {
    scales: {
      yOcc: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Students (RFID Swipes)', font: { size: 10 } }
      },
      yTemp: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Temp (°C)', font: { size: 10 } }
      }
    }
  };

  // 30-Day Total Daily Trend
  const dailyChartData = {
    labels: dailyTrend.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: 'Daily Total (kWh)',
        data: dailyTrend.map((d) => d.totalKwh),
        backgroundColor: '#0284c7',
        borderRadius: 4
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Building-Level Energy Analytics &amp; Inspection
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Select campus infrastructure to inspect asset inventories, thermal correlation, and historical anomalies.
        </p>
      </div>

      {/* Category Pills & Building Selector */}
      <div className="space-y-3">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Facilities (5)' },
            { id: 'academic', label: 'Academic Blocks (2)' },
            { id: 'labs', label: 'Computing Labs (1)' },
            { id: 'library', label: 'Central Library (1)' },
            { id: 'hostel', label: 'Student Hostels (1)' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeCategoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Building Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {buildings
            .filter((b) => {
              if (activeCategoryFilter === 'all') return true;
              return b.category === activeCategoryFilter;
            })
            .map((b) => {
              const isSelected = b.id === selectedBuildingId;
              const Icon =
                b.category === 'labs'
                  ? Cpu
                  : b.category === 'library'
                  ? BookOpen
                  : b.category === 'hostel'
                  ? Home
                  : Building2;

              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBuildingId(b.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20 ring-2 ring-emerald-500/30'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    {b.active_alerts && b.active_alerts > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                        {b.active_alerts} alerts
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600">
                        Normal
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5">
                    <h4 className="font-bold text-xs truncate leading-snug">{b.name}</h4>
                    <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {b.type}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Selected Building Details Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Operating Schedule: {building.operating_start}:00 – {building.operating_end}:00
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                {building.area_sqm} m² Carpet Area
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">{building.name}</h2>
            <p className="text-xs text-slate-500">{building.type}</p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Latest Load
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {latestReading?.consumption_kwh || '--'} kWh
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Expected Base
              </span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {normalExpectedKwh} kWh
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Recorded Peak
              </span>
              <span className="font-mono font-bold text-indigo-700 text-sm">
                {peakRecordedKwh} kWh
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Total Est. Cost
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                ₹{estCostInr.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Building Asset & Telemetry Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-2.5">
            <Users className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Capacity</span>
              <span className="font-bold text-slate-800">{building.student_capacity} Students</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-2.5">
            <AirVent className="w-4 h-4 text-cyan-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">AC Units</span>
              <span className="font-bold text-slate-800">{building.ac_units} Active</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Fixtures</span>
              <span className="font-bold text-slate-800">{building.lighting_fixtures} Lights</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-2.5">
            <Thermometer className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Current Temp</span>
              <span className="font-bold text-slate-800">{latestReading?.temperature_c || 28}°C</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Standby Base</span>
              <span className="font-bold text-slate-800">{building.base_load_kwh} kWh/h</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="text-[10px] text-purple-700 block font-bold">RFID Turnstiles</span>
              <span className="font-bold text-purple-950 font-mono">
                {latestReading?.occupancy_count ?? 0} Inside
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RFID Smart Card Turnstile Ingress/Egress Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white border border-purple-800/60 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">
                RFID Smart Card Turnstiles &amp; Access Control Telemetry
              </h4>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                Live Turnstile Logs
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Automated badge swipes at entry gates log net headcount inside {building.name}. When the turnstile headcount is negligible while HVAC or lighting loads are high, the AI flags energy wastage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
          <div className="text-right">
            <span className="text-[10px] text-purple-300 uppercase font-semibold block">Turnstile Net Headcount</span>
            <span className="font-mono text-lg font-black text-white">{latestReading?.occupancy_count ?? 0} Students</span>
          </div>
        </div>
      </div>

      {/* Charts Section: Actual vs Expected Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Actual vs Expected 24h Hourly Profile */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Expected vs Actual Hourly Consumption
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Highlights excess off-peak deviations and scheduled class surges.
              </p>
            </div>
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Actual
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2" /> Baseline
            </div>
          </div>
          <LineChart data={hourlyChartData} height={250} />
        </div>

        {/* Chart 2: Occupancy & Temperature Profile */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                RFID Turnstile Net Headcount vs Ambient Temp
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated badge swipes at entry gates log net headcount inside the facility in real time.
              </p>
            </div>
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> RFID Swipes
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" /> Temp (°C)
            </div>
          </div>
          <LineChart data={occTempChartData} options={occTempOptions} height={250} />
        </div>
      </div>

      {/* Row 3: 30-Day Aggregated Daily Trends */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              30-Day Consumption Trend for {building.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated daily kilowatt-hours revealing weekend dropoffs and midterm spikes.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium">
            Avg: {Math.round(totalKwh / Math.max(1, dailyTrend.length))} kWh/day
          </span>
        </div>
        <BarChart data={dailyChartData} height={220} />
      </div>

      {/* Row 4: Historical Anomalies for this Building */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Historical Anomalies &amp; Wastage Events for {building.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Isolated by the ML pipeline for this specific campus zone.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
            {anomalies.length} Flagged Incidents
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No historical anomalies recorded for this building!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2.5">Alert ID</th>
                  <th className="pb-2.5">Date &amp; Time</th>
                  <th className="pb-2.5">Excess Energy</th>
                  <th className="pb-2.5">Excess Cost</th>
                  <th className="pb-2.5">Severity</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Likely Cause</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {anomalies.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-slate-800">{a.id}</td>
                    <td className="py-2.5 text-slate-600">
                      {new Date(a.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2.5 font-mono font-bold text-rose-600">
                      +{a.excess_kwh} kWh
                    </td>
                    <td className="py-2.5 font-mono text-slate-900">
                      ₹{a.excess_cost_inr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5">
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
                    <td className="py-2.5">
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
                    <td className="py-2.5 text-slate-600 max-w-xs truncate">
                      {a.likely_explanation}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onOpenAlertModal(a)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
