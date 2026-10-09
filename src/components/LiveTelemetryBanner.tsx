import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Sun,
  Gauge,
  Radio,
  Building2,
  ChevronRight,
  Pause,
  Play,
  RotateCw,
  Cpu,
  BookOpen,
  Home,
  CheckCircle2,
  Users,
  CreditCard
} from 'lucide-react';
import { LiveSimulationSnapshot, LiveZoneTelemetry } from '../types';
import { api } from '../services/api';

interface LiveTelemetryBannerProps {
  onSelectBuilding?: (buildingId: string) => void;
}

export const LiveTelemetryBanner: React.FC<LiveTelemetryBannerProps> = ({
  onSelectBuilding
}) => {
  const [snapshot, setSnapshot] = useState<LiveSimulationSnapshot | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [tickCount, setTickCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchLiveTelemetry = async () => {
    try {
      const data = await api.getLiveSimulation();
      setSnapshot(data);
      setLastUpdated(new Date());
      setTickCount((prev) => prev + 1);
    } catch (err) {
      console.warn('Live simulation telemetry fetch note:', err);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
  }, []);

  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      fetchLiveTelemetry();
    }, 3200);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  if (!snapshot) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'labs':
        return <Cpu className="w-3.5 h-3.5 text-blue-400" />;
      case 'library':
        return <BookOpen className="w-3.5 h-3.5 text-amber-400" />;
      case 'hostel':
        return <Home className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Building2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getCategoryBadgeLabel = (category: string) => {
    switch (category) {
      case 'labs':
        return 'Labs';
      case 'library':
        return 'Library';
      case 'hostel':
        return 'Hostel';
      default:
        return 'Block';
    }
  };

  return (
    <div className="mb-6 rounded-3xl bg-[#090f1e] text-slate-100 border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Top Banner Bar */}
      <div className="p-4 sm:px-6 sm:py-3.5 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="relative flex h-2 w-2">
              {isLiveStreaming && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">
              {isLiveStreaming ? 'LIVE TELEMETRY STREAMING' : 'STREAM PAUSED'}
            </span>
          </div>

          <span className="hidden md:inline-block text-xs text-slate-400">
            Smart Grid Sampling 1 Hz • Continuous Campus Ingestion
          </span>
        </div>

        {/* Live Controls & Frequency */}
        <div className="flex items-center gap-3 text-xs">
          {/* RFID Campus Headcount Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-800/80 text-purple-200 font-mono text-[11px]">
            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
            <span>RFID Headcount: <strong className="text-white">{snapshot.totalStudentsOnCampusRfid?.toLocaleString('en-IN') ?? '--'}</strong> Students</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-teal-400" />
            <span>Freq: <strong className="text-white">{snapshot.gridFrequencyHz.toFixed(2)} Hz</strong></span>
            <span className="text-slate-600">|</span>
            <span>PF: <strong className="text-white">{snapshot.powerFactor.toFixed(2)}</strong></span>
          </div>

          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={fetchLiveTelemetry}
            title="Poll latest reading immediately"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Instantaneous Load */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Instantaneous Campus Load
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              kW
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {snapshot.instantaneousTotalPowerKw.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs text-slate-400 font-medium">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Baseline: {snapshot.instantaneousBaselineKw} kW</span>
            <span className={snapshot.instantaneousTotalPowerKw > snapshot.instantaneousBaselineKw ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
              {snapshot.instantaneousTotalPowerKw > snapshot.instantaneousBaselineKw
                ? `+${Math.round(((snapshot.instantaneousTotalPowerKw - snapshot.instantaneousBaselineKw) / snapshot.instantaneousBaselineKw) * 100)}%`
                : 'Optimal'}
            </span>
          </div>
        </div>

        {/* Metric 2: Rooftop Solar Generation */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              Rooftop Solar PV Output
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-bold">
              Green
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
              {snapshot.solarContributionKw.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-medium">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Net Grid Draw: <strong className="text-slate-200 font-mono">{snapshot.netGridDrawKw.toFixed(1)} kW</strong>
          </div>
        </div>

        {/* Metric 3: Real-Time Grid Cost Rate */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Instantaneous Burn Rate
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
              Cost
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              ₹{snapshot.instantaneousHourlyCostInr.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ hr</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Emission: <strong className="text-slate-200 font-mono">{snapshot.instantaneousEmissionsKgPerHour.toFixed(1)} kg CO₂/hr</strong>
          </div>
        </div>

        {/* Metric 4: IoT Smart Meter Mesh Status */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Connected Campus Grid
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              Mesh
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
              {snapshot.activeMetersOnline} / {snapshot.totalMeters}
            </span>
            <span className="text-xs text-slate-400 font-medium">Zones</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Meters Telemetry Online</span>
          </div>
        </div>
      </div>

      {/* Campus Blocks Quick Telemetry Ticker */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-5">
        <div className="text-[11px] font-semibold text-slate-400 mb-2.5 uppercase tracking-wider flex items-center justify-between">
          <span>Campus Blocks Real-Time Telemetry Feed (5 Zones Monitored)</span>
          <span className="text-[10px] text-slate-400 font-normal">
            Updated {lastUpdated.toLocaleTimeString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {snapshot.zones.map((zone) => {
            const isHigh = zone.status === 'High Demand';
            const isAnomaly = zone.status === 'Anomaly';

            return (
              <button
                key={zone.id}
                onClick={() => onSelectBuilding && onSelectBuilding(zone.id)}
                className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(zone.category)}
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-800 text-slate-300">
                      {getCategoryBadgeLabel(zone.category)}
                    </span>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAnomaly ? 'bg-rose-500 animate-ping' : isHigh ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                </div>

                <div className="font-bold text-xs text-white truncate group-hover:text-emerald-300 transition-colors">
                  {zone.name}
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-mono text-sm font-black text-slate-100">
                    {zone.currentKw} <span className="text-[10px] font-normal text-slate-400">kW</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      zone.loadPct > 80 ? 'text-rose-400' : zone.loadPct > 65 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {zone.loadPct}%
                  </span>
                </div>

                {/* Mini load bar */}
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      zone.loadPct > 80
                        ? 'bg-rose-500'
                        : zone.loadPct > 65
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, zone.loadPct)}%` }}
                  />
                </div>

                {/* RFID Turnstile live occupant count */}
                <div className="flex items-center justify-between text-[10px] text-purple-300 mt-2 font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <CreditCard className="w-2.5 h-2.5 text-purple-400" />
                    <strong>{zone.occupancyCount}</strong> inside
                  </span>
                  <span className="text-[9px] text-slate-400 truncate max-w-[90px]" title={zone.rfidGateInfo}>
                    RFID Gates
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
