import React, { useState, useEffect } from 'react';
import {
  Sun,
  BatteryCharging,
  Zap,
  Building2,
  Thermometer,
  Users,
  Wind,
  FileText,
  Sliders,
  Compass,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Info,
  X,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Building } from '../types';
import { api } from '../services/api';

interface CampusDigitalTwinProps {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
}

export const CampusDigitalTwin: React.FC<CampusDigitalTwinProps> = ({
  buildings,
  onSelectBuilding
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('comp_lab');
  const [viewMode, setViewMode] = useState<'network' | 'heatmap' | 'anomalies'>('network');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // What-If Simulator State
  const [thermostatOffset, setThermostatOffset] = useState<number>(2); // +2°C setback
  const [solarExpansionKw, setSolarExpansionKw] = useState<number>(200); // +200 kWp expansion
  const [bessPeakShave, setBessPeakShave] = useState<boolean>(true);
  const [simulationApplied, setSimulationApplied] = useState<boolean>(false);

  // Live Microgrid Dynamics
  const [solarKw, setSolarKw] = useState<number>(145.4);
  const [batterySoc, setBatterySoc] = useState<number>(78); // %
  const [batteryPowerKw, setBatteryPowerKw] = useState<number>(42.5); // discharging kW
  const [gridFrequency, setGridFrequency] = useState<number>(50.02);

  // Live tick effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSolarKw((prev) => Math.max(80, Math.min(220, Math.round((prev + (Math.random() * 6 - 3)) * 10) / 10)));
      setGridFrequency((prev) => Math.round((50.0 + (Math.random() * 0.06 - 0.03)) * 100) / 100);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Building live snapshot values
  const zoneData: Record<
    string,
    {
      currentKw: number;
      baseKw: number;
      peakKw: number;
      tempC: number;
      occupancy: number;
      capacity: number;
      status: 'Normal' | 'High Demand' | 'Anomaly';
      coords: { x: number; y: number; w: number; h: number };
      color: string;
      label: string;
    }
  > = {
    comp_lab: {
      currentKw: 262.3,
      baseKw: 85,
      peakKw: 420,
      tempC: 22.8,
      occupancy: 420,
      capacity: 650,
      status: 'Anomaly',
      coords: { x: 50, y: 70, w: 180, h: 120 },
      color: '#f43f5e',
      label: 'Computer Laboratory'
    },
    acad_a: {
      currentKw: 98.4,
      baseKw: 45,
      peakKw: 260,
      tempC: 25.1,
      occupancy: 850,
      capacity: 1200,
      status: 'Normal',
      coords: { x: 300, y: 50, w: 190, h: 110 },
      color: '#10b981',
      label: 'Academic Block A'
    },
    acad_b: {
      currentKw: 114.2,
      baseKw: 52,
      peakKw: 290,
      tempC: 24.6,
      occupancy: 910,
      capacity: 1400,
      status: 'Normal',
      coords: { x: 540, y: 70, w: 180, h: 120 },
      color: '#10b981',
      label: 'Academic Block B'
    },
    central_lib: {
      currentKw: 122.5,
      baseKw: 38,
      peakKw: 210,
      tempC: 23.5,
      occupancy: 560,
      capacity: 800,
      status: 'High Demand',
      coords: { x: 140, y: 260, w: 180, h: 110 },
      color: '#f59e0b',
      label: 'Central Library'
    },
    hostel_block: {
      currentKw: 134.6,
      baseKw: 60,
      peakKw: 250,
      tempC: 26.2,
      occupancy: 680,
      capacity: 900,
      status: 'Normal',
      coords: { x: 440, y: 260, w: 200, h: 120 },
      color: '#3b82f6',
      label: 'Hostel Block'
    }
  };

  const selectedZone = zoneData[selectedZoneId] || zoneData.comp_lab;
  const totalCampusKw = Object.values(zoneData).reduce((sum, z) => sum + z.currentKw, 0);
  const netGridDrawKw = Math.max(0, Math.round((totalCampusKw - solarKw - (bessPeakShave ? batteryPowerKw : 0)) * 10) / 10);
  const greenEnergyPct = Math.min(100, Math.round(((solarKw + (bessPeakShave ? batteryPowerKw : 0)) / totalCampusKw) * 100));

  // What-If live calculated results
  const simulatedMonthlySavingsInr = Math.round(
    thermostatOffset * 48000 + (solarExpansionKw * 30 * 4.2 * 8) + (bessPeakShave ? 28000 : 0)
  );
  const simulatedAvoidedCo2Kg = Math.round(
    thermostatOffset * 4920 + (solarExpansionKw * 30 * 4.2 * 0.82) + (bessPeakShave ? 2870 : 0)
  );

  return (
    <div className="space-y-6">
      {/* Header & ESG Report Trigger */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Campus Digital Twin &amp; Microgrid Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Spatial IoT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time visual energy flows, rooftop solar PV telemetry, and BESS microgrid dispatch simulation.
          </p>
        </div>

        <button
          onClick={() => setIsReportOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Executive ESG Report</span>
        </button>
      </div>

      {/* Microgrid KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Solar Generation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Solar PV Generation
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {solarKw}
              </span>
              <span className="text-xs text-slate-500 font-bold">kW</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              850 kWp Rooftop Array
            </span>
          </div>
        </div>

        {/* Battery Storage */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
            <BatteryCharging className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              BESS Battery Storage
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {batterySoc}%
              </span>
              <span className="text-xs text-emerald-600 font-bold">SoC</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Discharging {batteryPowerKw} kW (Peak Shaving)
            </span>
          </div>
        </div>

        {/* Net Grid Draw */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Net Utility Draw
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {netGridDrawKw}
              </span>
              <span className="text-xs text-slate-500 font-bold">kW</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              Freq: {gridFrequency} Hz • PF: 0.96
            </span>
          </div>
        </div>

        {/* Renewable Offset */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Renewable Energy Mix
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-emerald-600 font-mono">
                {greenEnergyPct}%
              </span>
              <span className="text-xs text-emerald-600 font-bold">Green</span>
            </div>
            <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">
              Tier-1 Campus Microgrid
            </span>
          </div>
        </div>
      </div>

      {/* Main Digital Twin Spatial View & Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spatial Map Canvas (8 Columns) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[460px]">
          {/* Map View Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 z-10 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-white">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Central Campus Spatial Digital Twin</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                Scale 1:500
              </span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold">
              <button
                onClick={() => setViewMode('network')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'network' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Power Grid Network
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'heatmap' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Thermal Heatmap
              </button>
              <button
                onClick={() => setViewMode('anomalies')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'anomalies' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Wastage Hotspots
              </button>
            </div>
          </div>

          {/* Interactive SVG Digital Twin Map */}
          <div className="relative w-full my-4 flex-1 flex items-center justify-center">
            <svg
              viewBox="0 0 760 420"
              className="w-full h-auto max-h-[380px] select-none"
              style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Grid Pattern */}
                <pattern id="campus-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
                {/* Gradients */}
                <linearGradient id="solarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="bessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Background Campus Terrain */}
              <rect width="760" height="420" rx="24" fill="#0b1329" />
              <rect width="760" height="420" fill="url(#campus-grid)" />

              {/* Campus Roads & Pathways */}
              <path
                d="M 40 210 Q 380 210 720 210 M 240 40 L 240 380 M 520 40 L 520 380"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
              />

              {/* Central Quad Green Lawn */}
              <ellipse cx="380" cy="210" rx="80" ry="40" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
              <text x="380" y="214" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                CENTRAL UNIVERSITY QUAD
              </text>

              {/* Central Rooftop Solar Canopy Array */}
              <g transform="translate(320, 115)">
                <rect width="120" height="42" rx="8" fill="url(#solarGrad)" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="60" y="25" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  ☀️ SOLAR CANOPY ({solarKw} kW)
                </text>
              </g>

              {/* Main Substation & BESS Battery Park */}
              <g transform="translate(20, 340)">
                <rect width="105" height="45" rx="8" fill="url(#bessGrad)" stroke="#34d399" strokeWidth="1.5" />
                <text x="52" y="26" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  🔋 BESS ({batterySoc}%)
                </text>
              </g>

              {/* Animated Power Flow Lines (Connecting Substation/Solar to Buildings) */}
              {viewMode === 'network' && (
                <g stroke="#34d399" strokeWidth="2" strokeDasharray="6,6" fill="none" opacity="0.65">
                  <path d="M 380 157 L 140 130" className="animate-pulse" />
                  <path d="M 380 157 L 395 105" className="animate-pulse" />
                  <path d="M 380 157 L 630 130" className="animate-pulse" />
                  <path d="M 380 157 L 230 260" className="animate-pulse" />
                  <path d="M 380 157 L 540 260" className="animate-pulse" />
                </g>
              )}

              {/* 5 Interactive Campus Buildings */}
              {Object.entries(zoneData).map(([id, z]) => {
                const isSelected = selectedZoneId === id;
                const isAnomaly = z.status === 'Anomaly';

                // Determine display stroke/fill based on view mode
                let fillColor = 'rgba(30, 41, 59, 0.85)';
                let strokeColor = isSelected ? '#38bdf8' : 'rgba(255,255,255,0.15)';
                let glowColor = 'none';

                if (viewMode === 'heatmap') {
                  fillColor = isAnomaly ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.2)';
                  strokeColor = isAnomaly ? '#f43f5e' : '#10b981';
                } else if (viewMode === 'anomalies') {
                  fillColor = isAnomaly ? 'rgba(244, 63, 94, 0.35)' : 'rgba(30, 41, 59, 0.5)';
                  strokeColor = isAnomaly ? '#f43f5e' : 'rgba(255,255,255,0.1)';
                  glowColor = isAnomaly ? '#f43f5e' : 'none';
                }

                return (
                  <g
                    key={id}
                    onClick={() => setSelectedZoneId(id)}
                    className="cursor-pointer transition-transform hover:scale-[1.02] transform-gpu"
                  >
                    {/* Glow outline on selection or anomaly */}
                    {(isSelected || isAnomaly) && (
                      <rect
                        x={z.coords.x - 4}
                        y={z.coords.y - 4}
                        width={z.coords.w + 8}
                        height={z.coords.h + 8}
                        rx="16"
                        fill="none"
                        stroke={isAnomaly ? '#f43f5e' : '#38bdf8'}
                        strokeWidth="2"
                        opacity={isAnomaly ? '0.8' : '0.5'}
                        strokeDasharray={isAnomaly ? '4,4' : 'none'}
                      />
                    )}

                    {/* Building Block */}
                    <rect
                      x={z.coords.x}
                      y={z.coords.y}
                      width={z.coords.w}
                      height={z.coords.h}
                      rx="14"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Building Header Label */}
                    <text
                      x={z.coords.x + 14}
                      y={z.coords.y + 24}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {z.label}
                    </text>

                    {/* Live Load Badge */}
                    <rect
                      x={z.coords.x + 14}
                      y={z.coords.y + 36}
                      width="92"
                      height="22"
                      rx="6"
                      fill={isAnomaly ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.08)'}
                    />
                    <text
                      x={z.coords.x + 22}
                      y={z.coords.y + 51}
                      fill={isAnomaly ? '#fda4af' : '#e2e8f0'}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {z.currentKw} kW
                    </text>

                    {/* Status Pill */}
                    <circle
                      cx={z.coords.x + z.coords.w - 20}
                      cy={z.coords.y + 20}
                      r="5"
                      fill={isAnomaly ? '#f43f5e' : z.status === 'High Demand' ? '#f59e0b' : '#10b981'}
                    />

                    {/* Metric Mini-Icons */}
                    <text
                      x={z.coords.x + 14}
                      y={z.coords.y + 80}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      👥 {z.occupancy} students
                    </text>
                    <text
                      x={z.coords.x + 14}
                      y={z.coords.y + 98}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      🌡️ {z.tempC}°C • Baseline: {z.baseKw} kW
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Footer Note */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 z-10">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live IoT Breaker Telemetry Active • Click any facility to inspect
            </span>
            <span className="font-mono text-slate-300">
              Campus Net Load: <strong className="text-white">{totalCampusKw} kW</strong>
            </span>
          </div>
        </div>

        {/* Selected Building Live Telemetry Drawer (4 Columns) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {selectedZone.label}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Zone ID: {selectedZoneId}
                  </span>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  selectedZone.status === 'Anomaly'
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : selectedZone.status === 'High Demand'
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                {selectedZone.status}
              </span>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 my-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Active Demand
                </span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {selectedZone.currentKw} kW
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Peak Cap: {selectedZone.peakKw} kW
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Excess Variance
                </span>
                <span
                  className={`text-base font-black font-mono ${
                    selectedZone.currentKw > selectedZone.baseKw * 2 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {selectedZone.currentKw > selectedZone.baseKw * 1.5
                    ? `+${Math.round((selectedZone.currentKw - selectedZone.baseKw * 1.5) * 10) / 10} kW`
                    : 'Optimal'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Base: {selectedZone.baseKw} kW
                </span>
              </div>
            </div>

            {/* Environmental & Facility Telemetry */}
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/50">
                <span className="flex items-center gap-2">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  Indoor Thermal Index
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedZone.tempC}°C
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/50">
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  Student Occupancy
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedZone.occupancy} / {selectedZone.capacity}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/50">
                <span className="flex items-center gap-2">
                  <Wind className="w-3.5 h-3.5 text-cyan-500" />
                  Active HVAC Load
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedZone.status === 'Anomaly' ? '88% (High)' : '54% (Normal)'}
                </span>
              </div>
            </div>

            {/* Anomaly Note if applicable */}
            {selectedZone.status === 'Anomaly' && (
              <div className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Active Wastage Flag:</strong>
                  <span className="text-[11px] text-rose-700 leading-tight block mt-0.5">
                    Unscheduled server air conditioning draw detected outside standard timetable.
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onSelectBuilding(selectedZoneId)}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Open Building Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive "What-If" Energy & Cost Simulator */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Interactive "What-If" Campus Energy &amp; ROI Simulator
              </h2>
              <p className="text-xs text-slate-500">
                Simulate thermostat setbacks, solar rooftop capacity expansions, and battery peak shaving in real time.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSimulationApplied(true);
              setTimeout(() => setSimulationApplied(false), 3000);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulationApplied ? 'animate-spin' : ''}`} />
            {simulationApplied ? 'Setpoints Dispatched to BMS!' : 'Simulate BMS Setpoint Dispatch'}
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          {/* Slider 1: Thermostat Setback */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800">
                AC Thermostat Setback:
              </label>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                +{thermostatOffset}°C (Set: {21 + thermostatOffset}°C)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={thermostatOffset}
              onChange={(e) => setThermostatOffset(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-2">
              Raising campus thermostat from 21°C to {21 + thermostatOffset}°C yields ~6-8% HVAC compressor power drop.
            </p>
          </div>

          {/* Slider 2: Solar Rooftop Expansion */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800">
                Solar Rooftop Addition:
              </label>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                +{solarExpansionKw} kWp
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="50"
              value={solarExpansionKw}
              onChange={(e) => setSolarExpansionKw(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-2">
              Adds {solarExpansionKw} kWp on Academic Block A &amp; Library roofs to displace expensive daytime grid tariff.
            </p>
          </div>

          {/* Toggle 3: BESS Peak Shaving */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  BESS Peak-Hour Discharge:
                </label>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    bessPeakShave ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {bessPeakShave ? 'Active (18:00 - 21:00)' : 'Disabled'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Discharges 50 kW from stored solar reserves during maximum utility surcharge windows.
              </p>
            </div>
            <button
              onClick={() => setBessPeakShave(!bessPeakShave)}
              className={`mt-3 py-1.5 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                bessPeakShave ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {bessPeakShave ? '✓ Enabled on Microgrid' : 'Enable Peak Shaving'}
            </button>
          </div>
        </div>

        {/* Live Simulation Projected Impact Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Projected Monthly Financial ROI
              </span>
              <span className="text-xl font-black font-mono">
                ₹{simulatedMonthlySavingsInr.toLocaleString('en-IN')} / month
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-right">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Avoided Carbon Footprint
              </span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                -{simulatedAvoidedCo2Kg.toLocaleString('en-IN')} kg CO₂ / mo
              </span>
            </div>
            <div className="hidden md:block pl-6 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Annual Campus Net Savings
              </span>
              <span className="text-base font-bold text-white font-mono">
                ₹{(simulatedMonthlySavingsInr * 12).toLocaleString('en-IN')} / yr
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Executive ESG & Energy Audit Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">
                  Official Campus Energy &amp; ESG Compliance Audit
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="my-6 text-center border-b border-slate-100 pb-6">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                University Central Campus
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Department of Campus Infrastructure &amp; Smart Grid Energy Management
              </p>
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold">
                AUDIT PERIOD: Q3/Q4 • CERTIFICATE REF: UEC-2026-ESG-094
              </div>
            </div>

            {/* Core ESG Metrics Table */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Energy Performance Index (EPI)
                  </span>
                  <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
                    142 kWh/m²/yr
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Target: &lt;160 kWh/m² (BEE 5-Star)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Renewable Generation Ratio
                  </span>
                  <span className="text-lg font-black text-emerald-600 font-mono mt-1 block">
                    28.4%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    850 kWp Rooftop Solar
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Avoided Cost via AI Audit
                  </span>
                  <span className="text-lg font-black text-blue-600 font-mono mt-1 block">
                    ₹1,24,400 / mo
                  </span>
                  <span className="text-[10px] text-blue-700 font-semibold">
                    15.2 Tons CO₂ Avoided
                  </span>
                </div>
              </div>

              {/* Facility Breakdown */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mt-4">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Facility Block</th>
                      <th className="p-3">Area (m²)</th>
                      <th className="p-3">Daily Avg kWh</th>
                      <th className="p-3">Intensity (kWh/m²)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3 font-semibold">Computer Laboratory</td>
                      <td className="p-3 font-mono">3,200</td>
                      <td className="p-3 font-mono">1,738</td>
                      <td className="p-3 font-mono text-rose-600 font-bold">0.54</td>
                      <td className="p-3"><span className="text-rose-600 font-bold">Wastage Warning</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Academic Block A</td>
                      <td className="p-3 font-mono">4,500</td>
                      <td className="p-3 font-mono">794</td>
                      <td className="p-3 font-mono text-emerald-600">0.18</td>
                      <td className="p-3"><span className="text-emerald-600 font-bold">Compliant</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Academic Block B</td>
                      <td className="p-3 font-mono">5,200</td>
                      <td className="p-3 font-mono">912</td>
                      <td className="p-3 font-mono text-emerald-600">0.18</td>
                      <td className="p-3"><span className="text-emerald-600 font-bold">Compliant</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Central Library</td>
                      <td className="p-3 font-mono">3,800</td>
                      <td className="p-3 font-mono">975</td>
                      <td className="p-3 font-mono text-amber-600">0.26</td>
                      <td className="p-3"><span className="text-amber-600 font-bold">Elevated</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Hostel Block</td>
                      <td className="p-3 font-mono">6,800</td>
                      <td className="p-3 font-mono">1,077</td>
                      <td className="p-3 font-mono text-emerald-600">0.16</td>
                      <td className="p-3"><span className="text-emerald-600 font-bold">Compliant</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures Block */}
              <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-100 text-slate-500">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-300 mb-1" />
                  <span className="font-bold text-slate-800 block">Chief Campus Energy Officer</span>
                  <span className="text-[10px]">Division of Electrical Infrastructure &amp; Smart Grid</span>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-dashed border-slate-300 mb-1" />
                  <span className="font-bold text-slate-800 block">Dean of Administration &amp; Planning</span>
                  <span className="text-[10px]">University Central Campus Governance Council</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
