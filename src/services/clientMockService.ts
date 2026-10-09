import {
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
import { DashboardResponse, BuildingAnalyticsResponse } from './api';
import { fallbackBuildings, fallbackDashboard } from './fallbackData';

// In-memory or localStorage-backed client state for static hosting (Netlify/Vercel/GitHub Pages)
class ClientMockStore {
  private buildings: Building[] = [...fallbackBuildings];
  private dashboard: DashboardResponse = JSON.parse(JSON.stringify(fallbackDashboard));
  private alerts: AnomalyAlert[] = JSON.parse(JSON.stringify(fallbackDashboard.recentAlerts));
  private recommendations: Recommendation[] = [
    {
      id: 'REC-001',
      building_id: 'comp_lab',
      building_name: 'Computer Laboratory',
      issue: 'Unscheduled Weekend Cooling Load',
      evidence: 'Lab servers drawing 262 kWh during off-peak hours with 0 student occupancy.',
      action: 'Implement automated thermostat setback to 24°C outside operating hours (20:00 - 08:00).',
      est_savings_kwh: 450,
      est_savings_inr: 3600,
      est_co2_reduction_kg: 369,
      priority: 'HIGH',
      status: 'Open',
      created_at: new Date().toISOString()
    },
    {
      id: 'REC-002',
      building_id: 'acad_a',
      building_name: 'Academic Block A',
      issue: 'Daylight Harvesting Inefficiency',
      evidence: 'Perimeter lighting circuits remaining on at 100% despite high ambient daylight (>800 lux).',
      action: 'Calibrate daylight harvesting photo-sensors in lecture wings.',
      est_savings_kwh: 180,
      est_savings_inr: 1440,
      est_co2_reduction_kg: 147,
      priority: 'MEDIUM',
      status: 'Open',
      created_at: new Date().toISOString()
    },
    {
      id: 'REC-003',
      building_id: 'central_lib',
      building_name: 'Central Library',
      issue: 'Chiller Stage 2 Over-Cycling',
      evidence: 'Rapid on/off compressor cycling observed between 14:00 and 17:00.',
      action: 'Schedule inspection of secondary chilled water valve actuator.',
      est_savings_kwh: 320,
      est_savings_inr: 2560,
      est_co2_reduction_kg: 262,
      priority: 'HIGH',
      status: 'Open',
      created_at: new Date().toISOString()
    },
    {
      id: 'REC-004',
      building_id: 'hostel_block',
      building_name: 'Hostel Block',
      issue: 'Water Heating Timing Shift Opportunity',
      evidence: 'Geyser load peaks coincide with evening tariff peak window (18:00 - 21:00).',
      action: 'Pre-heat storage water tanks during afternoon solar generation window (13:00 - 15:00).',
      est_savings_kwh: 240,
      est_savings_inr: 1920,
      est_co2_reduction_kg: 196,
      priority: 'LOW',
      status: 'Planned',
      created_at: new Date().toISOString()
    }
  ];

  private settings: SystemSettings = {
    electricity_tariff_inr: {
      value: '8.00',
      description: 'Commercial electricity tariff rate per kWh in Indian Rupees',
      updated_at: new Date().toISOString()
    },
    co2_emission_factor: {
      value: '0.82',
      description: 'Carbon emission intensity factor in kg CO2 per kWh (CEA Grid baseline)',
      updated_at: new Date().toISOString()
    },
    anomaly_sensitivity: {
      value: '0.08',
      description: 'Sensitivity threshold for energy anomaly flags (default 8% variance)',
      updated_at: new Date().toISOString()
    },
    operating_hours_start: {
      value: '8',
      description: 'Campus active operating window start hour',
      updated_at: new Date().toISOString()
    },
    operating_hours_end: {
      value: '18',
      description: 'Campus active operating window end hour',
      updated_at: new Date().toISOString()
    }
  };

  getDashboardSummary(): DashboardResponse {
    return this.dashboard;
  }

  getBuildings(): Building[] {
    return this.buildings;
  }

  getBuildingAnalytics(id: string): BuildingAnalyticsResponse {
    const building = this.buildings.find((b) => b.id === id) || this.buildings[0];
    const hours = Array.from({ length: 24 }, (_, i) => {
      const isDay = i >= 8 && i <= 18;
      const expected = isDay ? building.base_load_kwh * 2.2 : building.base_load_kwh * 1.1;
      const actual = expected * (0.95 + Math.random() * 0.15);
      const excess = Math.max(0, actual - expected);
      return {
        timestamp: `${i.toString().padStart(2, '0')}:00`,
        hour: i,
        actualKwh: Math.round(actual * 10) / 10,
        expectedKwh: Math.round(expected * 10) / 10,
        excessKwh: Math.round(excess * 10) / 10,
        temperature: Math.round((24 + Math.sin(i / 3) * 6) * 10) / 10,
        occupancy: isDay ? Math.round(building.student_capacity * 0.75) : Math.round(building.student_capacity * 0.05),
        acUsage: isDay ? 65 : 15,
        lightingUsage: isDay ? 80 : 10,
        kwhPerStudent: Math.round((actual / Math.max(1, isDay ? building.student_capacity * 0.75 : 10)) * 100) / 100
      };
    });

    const dailyTrend = Array.from({ length: 14 }, (_, d) => {
      const date = new Date(Date.now() - (13 - d) * 86400000).toISOString().split('T')[0];
      return {
        date,
        totalKwh: Math.round(building.base_load_kwh * 24 * (0.9 + Math.random() * 0.25)),
        avgTemp: 28,
        avgOccupancy: Math.round(building.student_capacity * 0.6)
      };
    });

    return {
      building,
      latestReading: {
        id: 101,
        timestamp: new Date().toISOString(),
        building_id: building.id,
        building_name: building.name,
        consumption_kwh: Math.round(building.base_load_kwh * 1.8),
        temperature_c: 28.5,
        occupancy_count: Math.round(building.student_capacity * 0.7),
        ac_usage_pct: 62,
        lighting_usage_pct: 75,
        data_source: 'smart_meter_live',
        data_quality: 'verified'
      },
      normalExpectedKwh: Math.round(building.base_load_kwh * 1.6),
      totalKwh: Math.round(building.base_load_kwh * 24 * 1.4),
      estCostInr: Math.round(building.base_load_kwh * 24 * 1.4 * 8),
      avgHourlyKwh: Math.round(building.base_load_kwh * 1.4),
      peakRecordedKwh: Math.round(building.peak_load_kwh * 0.95),
      hourlyComparison: hours,
      dailyTrend,
      anomalies: this.alerts.filter((a) => a.building_id === building.id)
    };
  }

  getReadings(params: any): { total: number; page: number; limit: number; totalPages: number; readings: EnergyReading[] } {
    const limit = params.limit || 50;
    const page = params.page || 1;
    const readings: EnergyReading[] = Array.from({ length: limit }, (_, i) => {
      const b = this.buildings[i % this.buildings.length];
      return {
        id: (page - 1) * limit + i + 1,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        building_id: b.id,
        building_name: b.name,
        consumption_kwh: Math.round((b.base_load_kwh + Math.random() * 80) * 10) / 10,
        temperature_c: 27 + Math.round(Math.random() * 5),
        occupancy_count: Math.round(b.student_capacity * (0.3 + Math.random() * 0.5)),
        ac_usage_pct: 55,
        lighting_usage_pct: 68,
        data_source: 'smart_meter',
        data_quality: 'clean'
      };
    });
    return {
      total: 21600,
      page,
      limit,
      totalPages: Math.ceil(21600 / limit),
      readings
    };
  }

  getPredictions(buildingId?: string): {
    predictions: Prediction[];
    modelMetadata: ModelMetadata;
    forecastDate: string;
    hourlyCampusAggregate: Array<{ hour: number; total_predicted: number }>;
  } {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const predictions: Prediction[] = [];
    const hourlyMap: Record<number, number> = {};

    for (let h = 0; h < 24; h++) {
      let hourlySum = 0;
      for (const b of this.buildings) {
        if (!buildingId || b.id === buildingId) {
          const isPeak = h >= 10 && h <= 17;
          const predKwh = Math.round((b.base_load_kwh * (isPeak ? 2.4 : 1.2)) * 10) / 10;
          predictions.push({
            id: predictions.length + 1,
            forecast_date: tomorrow,
            forecast_hour: h,
            building_id: b.id,
            building_name: b.name,
            predicted_kwh: predKwh,
            actual_kwh: null,
            model_version: 'Ensemble-v2.1',
            created_at: new Date().toISOString()
          });
          hourlySum += predKwh;
        }
      }
      hourlyMap[h] = Math.round(hourlySum * 10) / 10;
    }

    const hourlyCampusAggregate = Object.entries(hourlyMap).map(([h, total]) => ({
      hour: parseInt(h, 10),
      total_predicted: total
    }));

    const modelMetadata: ModelMetadata = {
      id: 'rf_latest',
      model_type: 'AI Campus Demand Forecast Engine',
      trained_at: new Date().toISOString(),
      training_samples: 17280,
      date_range_start: '2026-04-12',
      date_range_end: '2026-10-09',
      mae: 5.61,
      rmse: 14.26,
      r2_score: 0.967,
      features_used: 'weather, occupancy, class_schedule, hvac_loads, lighting, baselines',
      status: 'Active & Operational'
    };

    return {
      predictions,
      modelMetadata,
      forecastDate: tomorrow,
      hourlyCampusAggregate
    };
  }

  trainModel(): any {
    return {
      success: true,
      modelType: 'AI Campus Demand Forecast Engine',
      trainingSamples: 17280,
      metrics: { mae: 5.48, rmse: 13.92, r2Score: 0.971 },
      trainedAt: new Date().toISOString()
    };
  }

  generatePredictions(): any {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return {
      success: true,
      forecastDate: tomorrow,
      totalPredictedCampusKwh: 14625,
      peakPeriod: '13:00 - 16:00',
      status: 'Ready'
    };
  }

  analyzeAnomalies(): any {
    return {
      success: true,
      analyzedReadings: 3600,
      newAlertsCreated: 0,
      message: 'Grid scan complete. All facilities operating within expected operational bounds.'
    };
  }

  getAlerts(params?: any): AnomalyAlert[] {
    let list = [...this.alerts];
    if (params?.status && params.status !== 'all') {
      list = list.filter((a) => a.status.toLowerCase() === params.status.toLowerCase());
    }
    if (params?.severity && params.severity !== 'all') {
      list = list.filter((a) => a.severity.toLowerCase() === params.severity.toLowerCase());
    }
    if (params?.building_id && params.building_id !== 'all') {
      list = list.filter((a) => a.building_id === params.building_id);
    }
    return list;
  }

  updateAlert(id: string, updates: any): AnomalyAlert {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      Object.assign(alert, updates);
      if (updates.status === 'Resolved') {
        alert.resolved_at = new Date().toISOString();
      }
    }
    const dashAlert = this.dashboard.recentAlerts.find((a) => a.id === id);
    if (dashAlert) {
      Object.assign(dashAlert, updates);
      if (updates.status === 'Resolved') {
        dashAlert.resolved_at = new Date().toISOString();
      }
    }
    this.dashboard.summary.activeAlertsCount = this.alerts.filter((a) => a.status !== 'Resolved').length;
    if (alert) return alert;
    return {
      id,
      building_id: 'comp_lab',
      timestamp: new Date().toISOString(),
      actual_kwh: 150,
      baseline_kwh: 100,
      excess_kwh: 50,
      deviation_pct: 50,
      excess_cost_inr: 400,
      severity: 'YELLOW',
      likely_explanation: 'Updated alert',
      recommended_action: 'Reviewed by facility manager',
      status: updates.status || 'Resolved',
      created_at: new Date().toISOString()
    };
  }

  getRecommendations(): Recommendation[] {
    return this.recommendations;
  }

  updateRecommendation(id: string, updates: any): Recommendation {
    const rec = this.recommendations.find((r) => r.id === id);
    if (rec) {
      Object.assign(rec, updates);
      return rec;
    }
    return this.recommendations[0];
  }

  getSettings(): SystemSettings {
    return this.settings;
  }

  updateSettings(updates: Record<string, string>): any {
    for (const [key, val] of Object.entries(updates)) {
      if (this.settings[key]) {
        this.settings[key].value = String(val);
        this.settings[key].updated_at = new Date().toISOString();
      }
    }
    return { success: true, updated: Object.keys(updates).length };
  }

  getHealth(): SystemHealth {
    return {
      status: 'healthy',
      system: 'SmartEnergy AI Enterprise Campus Edition (Standalone Ready)',
      timestamp: new Date().toISOString(),
      database: 'Campus Telemetry In-Memory Relational Engine',
      recordCounts: {
        buildings: 5,
        readings: 21600,
        predictions: 120,
        alerts: this.alerts.length,
        recommendations: this.recommendations.length
      },
      modelStatus: {
        id: 'rf_latest',
        model_type: 'AI Campus Demand Forecast Engine',
        trained_at: new Date().toISOString(),
        training_samples: 17280,
        date_range_start: '2026-04-12',
        date_range_end: '2026-10-09',
        mae: 5.61,
        rmse: 14.26,
        r2_score: 0.967,
        features_used: 'weather, occupancy, class_schedule, hvac_loads, lighting, baselines',
        status: 'Active & Operational'
      },
      recentLogs: [
        {
          id: 1,
          action_type: 'TRAIN_MODEL',
          entity_type: 'model',
          entity_id: 'rf_latest',
          details: 'Calibrated AI Demand Forecast Engine on 17,280 campus readings.',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          action_type: 'ANOMALY_ANALYSIS',
          entity_type: 'anomaly_engine',
          entity_id: 'campus',
          details: 'Continuous anomaly sweep active across all 5 monitored buildings.',
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  getLiveSimulation(): LiveSimulationSnapshot {
    const now = new Date();
    const zones = this.buildings.map((b) => {
      const currentKw = Math.round((b.base_load_kwh * 1.4 + (Math.random() * 15 - 7)) * 10) / 10;
      const loadPct = Math.min(100, Math.round((currentKw / b.peak_load_kwh) * 100));
      return {
        id: b.id,
        name: b.name,
        type: b.type,
        category: b.category || ('academic' as const),
        currentKw,
        baseLoadKw: b.base_load_kwh,
        peakLoadKw: b.peak_load_kwh,
        loadPct,
        temperatureC: 28.2,
        occupancyCount: Math.round(b.student_capacity * 0.65),
        capacity: b.student_capacity,
        acUsagePct: 58,
        lightingUsagePct: 70,
        status: (loadPct > 85 ? 'Anomaly' : loadPct > 65 ? 'High Demand' : 'Normal') as 'Normal' | 'High Demand' | 'Anomaly'
      };
    });

    const totalKw = Math.round(zones.reduce((sum, z) => sum + z.currentKw, 0) * 10) / 10;
    const baseKw = Math.round(zones.reduce((sum, z) => sum + z.baseLoadKw, 0) * 10) / 10;

    return {
      campusName: 'University Central Campus',
      instantaneousTotalPowerKw: totalKw,
      instantaneousBaselineKw: baseKw,
      powerFactor: 0.96,
      gridFrequencyHz: 50.02,
      solarContributionKw: 120,
      netGridDrawKw: Math.max(0, totalKw - 120),
      instantaneousHourlyCostInr: Math.round(totalKw * 8),
      instantaneousEmissionsKgPerHour: Math.round(totalKw * 0.82 * 10) / 10,
      activeMetersOnline: 5,
      totalMeters: 5,
      simulationTime: now.toLocaleTimeString('en-IN'),
      isSimulating: true,
      zones
    };
  }
}

export const clientMock = new ClientMockStore();
