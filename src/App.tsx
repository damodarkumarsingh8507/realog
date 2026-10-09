import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LiveTelemetryBanner } from './components/LiveTelemetryBanner';
import { WorkflowModal } from './components/WorkflowModal';
import { ResolveAlertModal } from './components/ResolveAlertModal';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { BuildingAnalytics } from './pages/BuildingAnalytics';
import { DemandPrediction } from './pages/DemandPrediction';
import { AnomalyDetection } from './pages/AnomalyDetection';
import { RecommendationsSustainability } from './pages/RecommendationsSustainability';
import { DataManagementSettings } from './pages/DataManagementSettings';
import { api, DashboardResponse } from './services/api';
import { Building, AnomalyAlert } from './types';
import { Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { fallbackBuildings, fallbackDashboard } from './services/fallbackData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const campusName = 'Apex University Central Campus';
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('comp_lab');

  // Modals
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState<boolean>(false);
  const [activeAlertForModal, setActiveAlertForModal] = useState<AnomalyAlert | null>(null);

  // Global Data
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  const fetchGlobalData = async (attempt = 1) => {
    try {
      setRetryCount(attempt);
      const [dash, blds] = await Promise.all([
        api.getDashboardSummary(),
        api.getBuildings()
      ]);
      setDashboardData(dash);
      setBuildings(blds);
      setIsFallbackMode(false);
      if (blds.length > 0 && !blds.some((b) => b.id === selectedBuildingId)) {
        setSelectedBuildingId(blds[0].id);
      }
      setIsLoading(false);
      setIsRefreshing(false);
    } catch (err) {
      console.warn(`Connection attempt ${attempt} failed:`, err);
      // Auto-retry up to 3 times with 1.2s delay to accommodate cold starts
      if (attempt < 3) {
        setTimeout(() => {
          fetchGlobalData(attempt + 1);
        }, 1200);
      } else {
        // Fallback gracefully to default campus telemetry so the user is never stuck
        console.log('Activating resilient campus fallback telemetry state.');
        setDashboardData(fallbackDashboard);
        setBuildings(fallbackBuildings);
        setIsFallbackMode(true);
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchGlobalData();

    // Safety timeout: Never let the screen remain stuck on loader for more than 4 seconds
    const safetyTimer = setTimeout(() => {
      setDashboardData((prev) => {
        if (!prev) {
          setIsFallbackMode(true);
          setBuildings(fallbackBuildings);
          setIsLoading(false);
          return fallbackDashboard;
        }
        return prev;
      });
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(safetyTimer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchGlobalData(1);
  };

  const handleSelectBuildingFromOverview = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setCurrentTab('analytics');
  };

  const handleAlertUpdated = (_updated: AnomalyAlert) => {
    handleRefresh();
  };

  const loadFallbackImmediately = () => {
    setDashboardData(fallbackDashboard);
    setBuildings(fallbackBuildings);
    setIsFallbackMode(true);
    setIsLoading(false);
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#090f1e] flex flex-col items-center justify-center text-white px-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          
          <h2 className="text-lg font-black tracking-tight text-white">SmartEnergy AI</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Connecting to campus IoT telemetry grid &amp; initializing energy models...
          </p>

          {retryCount > 1 && (
            <div className="mt-3 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-mono text-emerald-400 border border-slate-700">
              Initializing cold container (Attempt {retryCount}/3)...
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 w-full">
            <button
              onClick={() => fetchGlobalData(1)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
            <button
              onClick={loadFallbackImmediately}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
            >
              Open Campus Grid &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased flex">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeAlertCount={dashboardData.summary.activeAlertsCount}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Header */}
        <TopBar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onRunWorkflow={() => setIsWorkflowModalOpen(true)}
          isWorkflowRunning={isWorkflowRunning}
          activeAlerts={dashboardData.recentAlerts.filter((a) => a.status !== 'Resolved')}
          onSelectAlert={(a) => setActiveAlertForModal(a)}
          campusName={campusName}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isFallbackMode && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 animate-in fade-in">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong className="font-semibold">Cached Campus Telemetry Mode:</strong> Displaying calibrated baseline telemetry while live IoT grid connects.
                </span>
              </div>
              <button
                onClick={() => fetchGlobalData(1)}
                className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] self-start sm:self-auto shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Sync Live Grid
              </button>
            </div>
          )}

          {/* Always-Simulating Live Telemetry Stream Banner */}
          <LiveTelemetryBanner
            onSelectBuilding={handleSelectBuildingFromOverview}
          />

          {currentTab === 'overview' && (
            <ExecutiveOverview
              summary={dashboardData.summary}
              dailyTrends={dashboardData.dailyTrends}
              buildingDistribution={dashboardData.buildingDistribution}
              hourly24={dashboardData.hourly24}
              recentAlerts={dashboardData.recentAlerts}
              onSelectBuilding={handleSelectBuildingFromOverview}
              onNavigateToAlerts={() => setCurrentTab('anomalies')}
              onOpenAlertModal={(a) => setActiveAlertForModal(a)}
              onNavigateToRecommendations={() => setCurrentTab('recommendations')}
            />
          )}

          {currentTab === 'analytics' && (
            <BuildingAnalytics
              buildings={buildings}
              selectedBuildingId={selectedBuildingId}
              onSelectBuildingId={setSelectedBuildingId}
              onOpenAlertModal={(a) => setActiveAlertForModal(a)}
            />
          )}

          {currentTab === 'prediction' && <DemandPrediction />}

          {currentTab === 'anomalies' && (
            <AnomalyDetection
              buildings={buildings}
              onOpenAlertModal={(a) => setActiveAlertForModal(a)}
              onAlertUpdated={handleAlertUpdated}
            />
          )}

          {currentTab === 'recommendations' && (
            <RecommendationsSustainability buildings={buildings} />
          )}

          {currentTab === 'data' && (
            <DataManagementSettings
              buildings={buildings}
              onRefreshAll={handleRefresh}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <WorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        onComplete={handleRefresh}
      />

      <ResolveAlertModal
        alert={activeAlertForModal}
        isOpen={Boolean(activeAlertForModal)}
        onClose={() => setActiveAlertForModal(null)}
        onAlertUpdated={handleAlertUpdated}
      />
    </div>
  );
}
