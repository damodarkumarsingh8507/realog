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
import { api, DashboardResponse } from './services/api';
import { Building, AnomalyAlert } from './types';
import { Loader2 } from 'lucide-react';

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

  const fetchGlobalData = async () => {
    try {
      const [dash, blds] = await Promise.all([
        api.getDashboardSummary(),
        api.getBuildings()
      ]);
      setDashboardData(dash);
      setBuildings(blds);
      if (blds.length > 0 && !blds.some((b) => b.id === selectedBuildingId)) {
        setSelectedBuildingId(blds[0].id);
      }
    } catch (err) {
      console.error('Failed to load global data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchGlobalData();
  };

  const handleSelectBuildingFromOverview = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setCurrentTab('analytics');
  };

  const handleAlertUpdated = (_updated: AnomalyAlert) => {
    handleRefresh();
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#090f1e] flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-bold tracking-tight text-white">SmartEnergy AI</h2>
          <p className="text-xs text-slate-400 mt-1">
            Connecting to campus IoT telemetry grid &amp; initializing energy models...
          </p>
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
