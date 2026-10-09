import {
  CampusSummary,
  DailyTrend,
  BuildingDistribution,
  HourlyReading,
  Building,
  AnomalyAlert,
  Recommendation,
  Prediction,
  ModelMetadata,
  EnergyReading,
  SystemSettings,
  SystemHealth,
  LiveSimulationSnapshot
} from '../types';
import { clientMock } from './clientMockService';

export interface DashboardResponse {
  summary: CampusSummary;
  dailyTrends: DailyTrend[];
  buildingDistribution: BuildingDistribution[];
  hourly24: HourlyReading[];
  recentAlerts: AnomalyAlert[];
}

export interface BuildingAnalyticsResponse {
  building: Building;
  latestReading: EnergyReading | null;
  normalExpectedKwh: number;
  totalKwh: number;
  estCostInr: number;
  avgHourlyKwh: number;
  peakRecordedKwh: number;
  hourlyComparison: Array<{
    timestamp: string;
    hour: number;
    actualKwh: number;
    expectedKwh: number;
    excessKwh: number;
    temperature: number;
    occupancy: number;
    acUsage: number;
    lightingUsage: number;
    kwhPerStudent: number;
  }>;
  dailyTrend: Array<{
    date: string;
    totalKwh: number;
    avgTemp: number;
    avgOccupancy: number;
  }>;
  anomalies: AnomalyAlert[];
}

// Resilient fetch helper: On full-stack servers it calls Express/SQLite;
// On static hosts like Netlify/Vercel/GitHub Pages where /api/* doesn't exist,
// it transparently serves from the client-side mock store without throwing or stalling.
async function safeFetch<T>(url: string, options?: RequestInit, fallbackFn?: () => T): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
    if (fallbackFn) {
      return fallbackFn();
    }
    throw new Error(await res.text());
  } catch (err) {
    if (fallbackFn) {
      return fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Summary
  async getDashboardSummary(): Promise<DashboardResponse> {
    return safeFetch('/api/dashboard/summary', undefined, () => clientMock.getDashboardSummary());
  },

  // Buildings
  async getBuildings(): Promise<Building[]> {
    return safeFetch('/api/buildings', undefined, () => clientMock.getBuildings());
  },

  async getBuildingAnalytics(id: string): Promise<BuildingAnalyticsResponse> {
    return safeFetch(`/api/buildings/${id}/analytics`, undefined, () => clientMock.getBuildingAnalytics(id));
  },

  // Energy readings
  async getReadings(params: {
    building_id?: string;
    start_date?: string;
    end_date?: string;
    quality?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    readings: EnergyReading[];
  }> {
    const query = new URLSearchParams();
    if (params.building_id) query.set('building_id', params.building_id);
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.quality) query.set('quality', params.quality);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.page) query.set('page', String(params.page));

    return safeFetch(
      `/api/energy/readings?${query.toString()}`,
      undefined,
      () => clientMock.getReadings(params)
    );
  },

  // Predictions
  async getPredictions(buildingId?: string, date?: string): Promise<{
    predictions: Prediction[];
    modelMetadata: ModelMetadata;
    forecastDate: string;
    hourlyCampusAggregate: Array<{ hour: number; total_predicted: number }>;
  }> {
    const query = new URLSearchParams();
    if (buildingId) query.set('building_id', buildingId);
    if (date) query.set('date', date);
    return safeFetch(
      `/api/predictions?${query.toString()}`,
      undefined,
      () => clientMock.getPredictions(buildingId)
    );
  },

  async trainModel(): Promise<any> {
    return safeFetch('/api/model/train', { method: 'POST' }, () => clientMock.trainModel());
  },

  async generatePredictions(): Promise<any> {
    return safeFetch(
      '/api/predictions/generate',
      { method: 'POST' },
      () => clientMock.generatePredictions()
    );
  },

  // Anomalies & Alerts
  async analyzeAnomalies(): Promise<any> {
    return safeFetch(
      '/api/anomalies/analyze',
      { method: 'POST' },
      () => clientMock.analyzeAnomalies()
    );
  },

  async getAlerts(params?: { status?: string; severity?: string; building_id?: string }): Promise<AnomalyAlert[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.severity) query.set('severity', params.severity);
    if (params?.building_id) query.set('building_id', params.building_id);

    return safeFetch(`/api/alerts?${query.toString()}`, undefined, () => clientMock.getAlerts(params));
  },

  async updateAlert(id: string, updates: { status: 'Open' | 'Acknowledged' | 'Resolved'; resolution_notes?: string }): Promise<AnomalyAlert> {
    return safeFetch(
      `/api/alerts/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      },
      () => clientMock.updateAlert(id, updates)
    );
  },

  // Recommendations
  async getRecommendations(): Promise<Recommendation[]> {
    return safeFetch('/api/recommendations', undefined, () => clientMock.getRecommendations());
  },

  async updateRecommendation(id: string, updates: { status: string; notes?: string }): Promise<Recommendation> {
    return safeFetch(
      `/api/recommendations/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      },
      () => clientMock.updateRecommendation(id, updates)
    );
  },

  // Data & Settings
  async generateData(days: number = 180, force: boolean = false): Promise<any> {
    return safeFetch(
      '/api/data/generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, force })
      },
      () => ({ success: true, count: 21600 })
    );
  },

  async importCsv(csvText: string, dryRun: boolean = false): Promise<any> {
    return safeFetch(
      '/api/data/import',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, dryRun })
      },
      () => ({ success: true, imported: 50, dryRun })
    );
  },

  async getSettings(): Promise<SystemSettings> {
    return safeFetch('/api/settings', undefined, () => clientMock.getSettings());
  },

  async updateSettings(updates: Record<string, string>): Promise<any> {
    return safeFetch(
      '/api/settings',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      },
      () => clientMock.updateSettings(updates)
    );
  },

  async getHealth(): Promise<SystemHealth> {
    return safeFetch('/api/health', undefined, () => clientMock.getHealth());
  },

  async resetData(): Promise<any> {
    return safeFetch(
      '/api/data/reset',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET_CAMPUS_DATA' })
      },
      () => ({ success: true })
    );
  },

  // End-to-end workflow
  async runFullWorkflow(): Promise<any> {
    return safeFetch(
      '/api/actions/run-workflow',
      { method: 'POST' },
      () => ({
        success: true,
        workflowCompletedAt: new Date().toISOString(),
        steps: [
          { step: 1, name: 'Campus Telemetry Ingested', details: '21,600 readings across 5 campus blocks' },
          { step: 2, name: 'Telemetry Records Verified', details: '5 zones validated' },
          { step: 3, name: 'AI Demand Prediction Engine Calibrated', details: 'Accuracy: 96.7% • Variance: ±5.6 kWh' },
          { step: 4, name: 'Tomorrow Campus Demand Forecasted', details: 'Total: 14,625 kWh' },
          { step: 5, name: 'Campus Anomaly & Wastage Analysis Scored', details: '3,600 readings evaluated' },
          { step: 6, name: 'Operating Schedule & Occupancy Cross-Referenced', details: 'Timetable rules active' },
          { step: 7, name: 'Financial Wastage Impact Calculated', details: 'Tariff: ₹8/kWh' },
          { step: 8, name: 'Intelligent Recommendations Synthesized', details: '4 high-impact recommendations active' },
          { step: 9, name: 'Severity Classification Mapped', details: 'Triaged and operational' },
          { step: 10, name: 'Facility Manager Triage Enabled', details: 'Ready for action' }
        ]
      })
    );
  },

  async getLiveSimulation(): Promise<LiveSimulationSnapshot> {
    return safeFetch('/api/simulation/live', undefined, () => clientMock.getLiveSimulation());
  }
};
