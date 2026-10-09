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
  LiveSimulationSnapshot,
  RfidTurnstilesResponse
} from '../types';

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

export const api = {
  // Summary
  async getDashboardSummary(): Promise<DashboardResponse> {
    const res = await fetch('/api/dashboard/summary');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Buildings
  async getBuildings(): Promise<Building[]> {
    const res = await fetch('/api/buildings');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getBuildingAnalytics(id: string): Promise<BuildingAnalyticsResponse> {
    const res = await fetch(`/api/buildings/${id}/analytics`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
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

    const res = await fetch(`/api/energy/readings?${query.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
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
    const res = await fetch(`/api/predictions?${query.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async trainModel(): Promise<any> {
    const res = await fetch('/api/model/train', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to train' }));
      throw new Error(err.error || 'Failed to train');
    }
    return res.json();
  },

  async generatePredictions(): Promise<any> {
    const res = await fetch('/api/predictions/generate', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to generate' }));
      throw new Error(err.error || 'Failed to generate predictions');
    }
    return res.json();
  },

  // Anomalies & Alerts
  async analyzeAnomalies(): Promise<any> {
    const res = await fetch('/api/anomalies/analyze', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(err.error || 'Failed to run anomaly analysis');
    }
    return res.json();
  },

  async getAlerts(params?: { status?: string; severity?: string; building_id?: string }): Promise<AnomalyAlert[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.severity) query.set('severity', params.severity);
    if (params?.building_id) query.set('building_id', params.building_id);

    const res = await fetch(`/api/alerts?${query.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async updateAlert(id: string, updates: { status: 'Open' | 'Acknowledged' | 'Resolved'; resolution_notes?: string }): Promise<AnomalyAlert> {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Recommendations
  async getRecommendations(): Promise<Recommendation[]> {
    const res = await fetch('/api/recommendations');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async updateRecommendation(id: string, updates: { status: string; notes?: string }): Promise<Recommendation> {
    const res = await fetch(`/api/recommendations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Data & Settings
  async generateData(days: number = 180, force: boolean = false): Promise<any> {
    const res = await fetch('/api/data/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days, force })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async importCsv(csvText: string, dryRun: boolean = false): Promise<any> {
    const res = await fetch('/api/data/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText, dryRun })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Import failed');
    return data;
  },

  async getSettings(): Promise<SystemSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async updateSettings(updates: Record<string, string>): Promise<any> {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getHealth(): Promise<SystemHealth> {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async resetData(): Promise<any> {
    const res = await fetch('/api/data/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'RESET_CAMPUS_DATA' })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Reset failed' }));
      throw new Error(err.error || 'Failed to reset data');
    }
    return res.json();
  },

  // End-to-end audit workflow
  async runFullWorkflow(): Promise<any> {
    const res = await fetch('/api/actions/run-workflow', { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getLiveSimulation(): Promise<LiveSimulationSnapshot> {
    const res = await fetch('/api/simulation/live');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getRfidTurnstiles(): Promise<RfidTurnstilesResponse> {
    const res = await fetch('/api/rfid/turnstiles');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
