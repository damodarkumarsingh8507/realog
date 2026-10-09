import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Upload,
  Download,
  RefreshCw,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  Activity,
  Layers,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Building2,
  Calendar,
  Info
} from 'lucide-react';
import { Building, SystemSettings, SystemHealth, EnergyReading } from '../types';
import { api } from '../services/api';

interface DataManagementProps {
  buildings: Building[];
  onRefreshAll: () => void;
}

export const DataManagementSettings: React.FC<DataManagementProps> = ({
  buildings,
  onRefreshAll
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'records' | 'import' | 'settings' | 'health'>('records');

  // Readings table state
  const [readings, setReadings] = useState<EnergyReading[]>([]);
  const [totalReadings, setTotalReadings] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState('');
  const [isLoadingReadings, setIsLoadingReadings] = useState(false);

  // Import state
  const [csvContent, setCsvContent] = useState('');
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Settings state
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [tariffInput, setTariffInput] = useState('8.0');
  const [emissionInput, setEmissionInput] = useState('0.82');
  const [contaminationInput, setContaminationInput] = useState('0.08');
  const [hoursStartInput, setHoursStartInput] = useState('8');
  const [hoursEndInput, setHoursEndInput] = useState('18');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Health state
  const [health, setHealth] = useState<SystemHealth | null>(null);

  // Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmResetText, setConfirmResetText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Synthetic Data generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(null);

  // Load readings
  const loadReadings = async (p = page, bId = selectedBuildingFilter) => {
    setIsLoadingReadings(true);
    try {
      const res = await api.getReadings({
        page: p,
        limit: 25,
        building_id: bId || undefined
      });
      setReadings(res.readings);
      setTotalReadings(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReadings(false);
    }
  };

  // Load settings & health
  const loadSettingsAndHealth = async () => {
    try {
      const [s, h] = await Promise.all([api.getSettings(), api.getHealth()]);
      setSettings(s);
      setHealth(h);
      if (s.electricity_tariff) setTariffInput(s.electricity_tariff.value);
      if (s.grid_emission_factor) setEmissionInput(s.grid_emission_factor.value);
      if (s.anomaly_contamination) setContaminationInput(s.anomaly_contamination.value);
      if (s.operating_hours_start) setHoursStartInput(s.operating_hours_start.value);
      if (s.operating_hours_end) setHoursEndInput(s.operating_hours_end.value);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReadings();
    loadSettingsAndHealth();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    loadReadings(newPage, selectedBuildingFilter);
  };

  const handleBuildingFilterChange = (bId: string) => {
    setSelectedBuildingFilter(bId);
    setPage(1);
    loadReadings(1, bId);
  };

  // File drop / select for CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      setCsvContent(text);
      try {
        const preview = await api.importCsv(text, true);
        setPreviewResult(preview);
      } catch (err: any) {
        setPreviewResult({ error: err.message });
      }
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (!csvContent) return;
    setIsImporting(true);
    setImportStatus(null);
    try {
      const result = await api.importCsv(csvContent, false);
      setImportStatus(result);
      setCsvContent('');
      setPreviewResult(null);
      await loadReadings(1, '');
      onRefreshAll();
    } catch (err: any) {
      setImportStatus({ error: err.message });
    } finally {
      setIsImporting(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsFeedback(null);
    try {
      await api.updateSettings({
        electricity_tariff: tariffInput,
        grid_emission_factor: emissionInput,
        anomaly_contamination: contaminationInput,
        operating_hours_start: hoursStartInput,
        operating_hours_end: hoursEndInput
      });
      setSettingsFeedback('System parameters successfully updated and saved in SQLite.');
      await loadSettingsAndHealth();
      onRefreshAll();
    } catch (err: any) {
      setSettingsFeedback('Error saving settings: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Generate 180 days synthetic data
  const handleGenerateData = async () => {
    setIsGenerating(true);
    setNotificationFeedback(null);
    try {
      await api.generateData(180, false);
      await loadReadings(1, '');
      await loadSettingsAndHealth();
      onRefreshAll();
      setNotificationFeedback('180 days of realistic campus readings generated and verified in SQLite!');
    } catch (err: any) {
      setNotificationFeedback('Generation error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset confirmation
  const handleConfirmReset = async () => {
    if (confirmResetText !== 'RESET_CAMPUS_DATA') return;
    setIsResetting(true);
    setNotificationFeedback(null);
    try {
      await api.resetData();
      setShowResetModal(false);
      setConfirmResetText('');
      await loadReadings(1, '');
      await loadSettingsAndHealth();
      onRefreshAll();
      setNotificationFeedback('Dataset and machine learning models completely re-initialized!');
    } catch (err: any) {
      setNotificationFeedback('Reset failed: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Campus Grid Telemetry &amp; System Parameters
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            IoT meter repository, CSV telemetry ingestion, utility tariff configurations, and operational audit trail.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`/api/data/export${selectedBuildingFilter ? `?building_id=${selectedBuildingFilter}` : ''}`}
            download
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Export Telemetry CSV
          </a>

          <button
            onClick={handleGenerateData}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-emerald-400' : ''}`} />
            {isGenerating ? 'Synthesizing...' : 'Re-Generate Baseline'}
          </button>
        </div>
      </div>

      {notificationFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{notificationFeedback}</span>
          </div>
          <button
            onClick={() => setNotificationFeedback(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('records')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'records'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          IoT Telemetry ({totalReadings.toLocaleString('en-IN')})
        </button>

        <button
          onClick={() => setActiveSubTab('import')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'import'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          CSV Telemetry Ingestion
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Tariffs &amp; Parameters
        </button>

        <button
          onClick={() => setActiveSubTab('health')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'health'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Operations &amp; Audit Log
        </button>
      </div>

      {/* SUBTAB 1: Stored Readings Table */}
      {activeSubTab === 'records' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            {/* Filter by Building */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Filter Zone:</span>
              <select
                value={selectedBuildingFilter}
                onChange={(e) => handleBuildingFilterChange(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-800 outline-hidden"
              >
                <option value="">All Buildings ({totalReadings})</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2 text-slate-600 self-end sm:self-auto">
              <span>
                Page <strong className="text-slate-900">{page}</strong> of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoadingReadings ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Querying SQLite records...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2.5">Timestamp (UTC)</th>
                    <th className="pb-2.5">Campus Building</th>
                    <th className="pb-2.5">Consumption (kWh)</th>
                    <th className="pb-2.5">Temp (°C)</th>
                    <th className="pb-2.5">Occupancy</th>
                    <th className="pb-2.5">AC Load</th>
                    <th className="pb-2.5">Lighting</th>
                    <th className="pb-2.5">Source</th>
                    <th className="pb-2.5 text-right">Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {readings.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 text-slate-600 text-[11px] font-sans">
                        {r.timestamp.replace('T', ' ').slice(0, 19)}
                      </td>
                      <td className="py-2.5 font-sans font-semibold text-slate-900">
                        {r.building_name || r.building_id}
                      </td>
                      <td className="py-2.5 font-bold text-slate-900">{r.consumption_kwh}</td>
                      <td className="py-2.5 text-slate-600">{r.temperature_c}°C</td>
                      <td className="py-2.5 text-slate-600">{r.occupancy_count}</td>
                      <td className="py-2.5 text-slate-600">{r.ac_usage_pct}%</td>
                      <td className="py-2.5 text-slate-600">{r.lighting_usage_pct}%</td>
                      <td className="py-2.5 font-sans text-slate-500 text-[11px]">
                        {r.data_source}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                            r.data_quality === 'Anomaly'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {r.data_quality}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: CSV Import & Validation */}
      {activeSubTab === 'import' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              CSV Energy Readings Ingestion &amp; Schema Validation
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Upload external sub-meter CSV logs. Validates column headers, timestamps, negative consumption values, and building keys before writing to SQLite.
            </p>
          </div>

          {/* Upload Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl bg-slate-50/60 hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <FileSpreadsheet className="w-10 h-10 text-slate-400 group-hover:text-emerald-600 transition-colors mb-2" />
            <span className="font-bold text-slate-800 text-sm">
              Click to select or drop CSV file here
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Expected headers: <code>timestamp, building_id, consumption_kwh, temperature_c, occupancy_count, ac_usage_pct, lighting_usage_pct</code>
            </span>
          </div>

          {/* Preview / Validation Results */}
          {previewResult && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  Validation Preview Results:
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold">
                  {previewResult.validCount} valid / {previewResult.errorCount} errors
                </span>
              </div>

              {previewResult.errors && previewResult.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] space-y-1">
                  <div className="font-bold text-rose-900">Import Validation Errors Detected:</div>
                  {previewResult.errors.map((e: any, idx: number) => (
                    <div key={idx}>
                      Line {e.line}: {e.error}
                    </div>
                  ))}
                </div>
              )}

              {previewResult.sampleValidRows && previewResult.sampleValidRows.length > 0 && (
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">
                    Sample Verified Rows (First 3):
                  </span>
                  <pre className="p-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-mono text-slate-700 overflow-x-auto">
                    {JSON.stringify(previewResult.sampleValidRows.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setCsvContent('');
                    setPreviewResult(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Discard
                </button>
                <button
                  onClick={handleCommitImport}
                  disabled={isImporting || previewResult.validCount === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 disabled:opacity-60 transition-colors"
                >
                  {isImporting ? 'Ingesting Telemetry...' : `Confirm Import (${previewResult.validCount} Rows)`}
                </button>
              </div>
            </div>
          )}

          {importStatus && (
            <div
              className={`p-4 rounded-2xl border text-xs ${
                importStatus.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {importStatus.success ? (
                <div>
                  <span className="font-bold">Import Successful!</span> Ingested {importStatus.insertedCount} new readings into campus telemetry repository.
                </div>
              ) : (
                <div>{importStatus.error || 'Import failed'}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: System Settings */}
      {activeSubTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs max-w-2xl space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Campus Utility &amp; Model Parameter Settings
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              These values dynamically drive excess cost calculations, CO2 abatement projections, and anomaly thresholds across all dashboards.
            </p>
          </div>

          {settingsFeedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{settingsFeedback}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Electricity Tariff (₹ per kWh)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="30"
                value={tariffInput}
                onChange={(e) => setTariffInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs font-mono font-bold outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard state utility rate (initially ₹8.0/kWh).
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Grid Carbon Emission Factor (kg CO₂ / kWh)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="2.0"
                value={emissionInput}
                onChange={(e) => setEmissionInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs font-mono font-bold outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Central Electricity Authority (CEA) India baseline: 0.82 kg CO₂/kWh.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Anomaly Detection Sensitivity Threshold
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.25"
                value={contaminationInput}
                onChange={(e) => setContaminationInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs font-mono font-bold outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Proportion of outlier variance expected in campus load data (default 0.08 = 8%).
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Operating Hours Start (0-23)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hoursStartInput}
                  onChange={(e) => setHoursStartInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs font-mono font-bold outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Operating Hours End (0-23)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hoursEndInput}
                  onChange={(e) => setHoursEndInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs font-mono font-bold outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/20 transition-all disabled:opacity-60"
              >
                {isSavingSettings ? 'Saving...' : 'Save Configuration Parameters'}
              </button>
            </div>
          </form>

          {/* Reset Zone */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
              Danger Zone: Recalibrate Campus Telemetry
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Recalibrates all building telemetry, forecasts, and anomaly records back to fresh baseline. Requires typing confirmation string.
            </p>
            <button
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Recalibrate Campus Baseline
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 4: System Health & Logs */}
      {activeSubTab === 'health' && health && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(health.recordCounts).map(([k, v]) => (
              <div key={k} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block capitalize">
                  {k === 'readings' ? 'Telemetry Readings' : k === 'buildings' ? 'Monitored Blocks' : k === 'predictions' ? 'Forecast Points' : k === 'alerts' ? 'Active Alerts' : 'Recommendations'}
                </span>
                <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
                  {v.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Campus Grid Operations &amp; Security Audit Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Action Type</th>
                    <th className="pb-2">Target Entity</th>
                    <th className="pb-2">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {health.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-2 text-slate-500 text-[11px] font-sans">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 font-bold text-blue-900 font-sans">{log.action_type}</td>
                      <td className="py-2 text-slate-600 font-sans">{log.entity_type}</td>
                      <td className="py-2 text-slate-800 font-sans max-w-md truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">
                Confirm Campus Telemetry Recalibration
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action will reset telemetry readings, clear predictions, and recalibrate anomaly baselines. Type <strong className="font-mono text-rose-600">RESET_CAMPUS_DATA</strong> to confirm.
            </p>

            <input
              type="text"
              placeholder="Type RESET_CAMPUS_DATA"
              value={confirmResetText}
              onChange={(e) => setConfirmResetText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs outline-hidden"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setConfirmResetText('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={confirmResetText !== 'RESET_CAMPUS_DATA' || isResetting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50 transition-colors"
              >
                {isResetting ? 'Resetting...' : 'Permanently Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
