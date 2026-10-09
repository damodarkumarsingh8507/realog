export interface Building {
  id: string;
  name: string;
  type: string;
  category?: 'academic' | 'labs' | 'library' | 'hostel';
  area_sqm: number;
  student_capacity: number;
  ac_units: number;
  lighting_fixtures: number;
  base_load_kwh: number;
  peak_load_kwh: number;
  operating_start: number;
  operating_end: number;
  active_alerts?: number;
  today_kwh?: number;
}

export interface LiveZoneTelemetry {
  id: string;
  name: string;
  type: string;
  category: 'academic' | 'labs' | 'library' | 'hostel';
  currentKw: number;
  baseLoadKw: number;
  peakLoadKw: number;
  loadPct: number;
  temperatureC: number;
  occupancyCount: number;
  capacity: number;
  acUsagePct: number;
  lightingUsagePct: number;
  rfidGateInfo?: string;
  status: 'Normal' | 'High Demand' | 'Anomaly';
}

export interface TurnstileGate {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Passing' | 'Calibrating';
  readerFrequency: string;
}

export interface BuildingTurnstileData {
  buildingId: string;
  buildingName: string;
  buildingType: string;
  studentCapacity: number;
  netHeadcount: number;
  cumulativeTapIns: number;
  cumulativeTapOuts: number;
  gatesOnline: number;
  totalGates: number;
  gates: TurnstileGate[];
}

export interface RfidSwipeEvent {
  id: string;
  studentBadgeId: string;
  role: string;
  department: string;
  gateId: string;
  buildingName: string;
  direction: string;
  timestamp: string;
  authStatus: string;
  rfidStandard: string;
}

export interface RfidTurnstilesResponse {
  systemName: string;
  operationalStatus: string;
  detectionMethodology: string;
  totalStudentsOnCampus: number;
  totalTurnstilesActive: number;
  monitoredBlocks: number;
  turnstilesByBuilding: BuildingTurnstileData[];
  recentSwipes: RfidSwipeEvent[];
}

export interface LiveSimulationSnapshot {
  campusName: string;
  instantaneousTotalPowerKw: number;
  instantaneousBaselineKw: number;
  powerFactor: number;
  gridFrequencyHz: number;
  solarContributionKw: number;
  netGridDrawKw: number;
  instantaneousHourlyCostInr: number;
  instantaneousEmissionsKgPerHour: number;
  activeMetersOnline: number;
  totalMeters: number;
  totalStudentsOnCampusRfid: number;
  simulationTime: string;
  isSimulating: boolean;
  zones: LiveZoneTelemetry[];
}

export interface CampusSummary {
  todayConsumptionKwh: number;
  todayCostInr: number;
  tomorrowPredictedKwh: number;
  tomorrowPredictedCostInr: number;
  activeAlertsCount: number;
  excessCostDetectedInr: number;
  todayCo2EmissionsKg: number;
  potentialMonthlySavingsInr: number;
  topWastageSource: {
    buildingId: string;
    buildingName: string;
    excessKwh: number;
    excessCostInr: number;
    reason: string;
  } | null;
  aiInsight: {
    headline: string;
    detail: string;
    urgency: 'high' | 'medium' | 'low';
  };
  tariff: number;
  emissionFactor: number;
}

export interface DailyTrend {
  date: string;
  actualKwh: number;
  expectedKwh: number;
  excessKwh: number;
}

export interface BuildingDistribution {
  id: string;
  name: string;
  area_sqm: number;
  total_kwh: number;
  energyIntensity: number;
}

export interface HourlyReading {
  hour: number;
  kwh: number;
  temp: number;
}

export interface AnomalyAlert {
  id: string;
  building_id: string;
  building_name?: string;
  reading_id?: number;
  timestamp: string;
  actual_kwh: number;
  baseline_kwh: number;
  excess_kwh: number;
  deviation_pct: number;
  excess_cost_inr: number;
  severity: 'GREEN' | 'YELLOW' | 'RED';
  likely_explanation: string;
  recommended_action: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface Recommendation {
  id: string;
  building_id: string;
  building_name?: string;
  issue: string;
  evidence: string;
  action: string;
  est_savings_kwh: number;
  est_savings_inr: number;
  est_co2_reduction_kg: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'Open' | 'Planned' | 'In Progress' | 'Completed';
  completed_at?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Prediction {
  id: number;
  forecast_date: string;
  forecast_hour: number;
  building_id: string;
  building_name?: string;
  predicted_kwh: number;
  actual_kwh?: number | null;
  model_version: string;
  created_at: string;
}

export interface ModelMetadata {
  id: string;
  model_type: string;
  trained_at: string;
  training_samples: number;
  date_range_start: string;
  date_range_end: string;
  mae: number;
  rmse: number;
  r2_score: number;
  features_used: string;
  status: string;
}

export interface EnergyReading {
  id: number;
  timestamp: string;
  building_id: string;
  building_name?: string;
  consumption_kwh: number;
  temperature_c: number;
  occupancy_count: number;
  ac_usage_pct: number;
  lighting_usage_pct: number;
  data_source: string;
  data_quality: string;
}

export interface SystemSettings {
  [key: string]: {
    value: string;
    description: string;
    updated_at: string;
  };
}

export interface SystemHealth {
  status: string;
  system: string;
  timestamp: string;
  database: string;
  recordCounts: {
    buildings: number;
    readings: number;
    predictions: number;
    alerts: number;
    recommendations: number;
  };
  modelStatus: ModelMetadata;
  recentLogs: Array<{
    id: number;
    action_type: string;
    entity_type: string;
    entity_id: string;
    details: string;
    timestamp: string;
  }>;
}
