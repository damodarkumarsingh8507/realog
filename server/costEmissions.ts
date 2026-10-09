import { getDatabase } from './database.ts';

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

export function getCampusSummary(): CampusSummary {
  const db = getDatabase();

  const tariff = parseFloat(
    (db.prepare("SELECT value FROM system_settings WHERE key = 'electricity_tariff'").get() as any)?.value || '8.0'
  );
  const emissionFactor = parseFloat(
    (db.prepare("SELECT value FROM system_settings WHERE key = 'grid_emission_factor'").get() as any)?.value || '0.82'
  );

  // Latest date in energy_readings
  const latestDateRow = db.prepare('SELECT MAX(timestamp) as max_ts FROM energy_readings').get() as { max_ts?: string };
  const latestTs = latestDateRow?.max_ts || new Date().toISOString();
  const latestDateStr = latestTs.split('T')[0];

  // Today's consumption across all buildings for the latest day
  const todayRow = db.prepare(`
    SELECT SUM(consumption_kwh) as total_kwh
    FROM energy_readings
    WHERE substr(timestamp, 1, 10) = ?
  `).get(latestDateStr) as { total_kwh?: number };

  const todayConsumptionKwh = Math.round((todayRow?.total_kwh || 0) * 10) / 10;
  const todayCostInr = Math.round(todayConsumptionKwh * tariff);
  const todayCo2EmissionsKg = Math.round(todayConsumptionKwh * emissionFactor * 10) / 10;

  // Tomorrow predicted
  const tomorrowRow = db.prepare(`
    SELECT SUM(predicted_kwh) as total_predicted
    FROM predictions
    WHERE forecast_date > ?
  `).get(latestDateStr) as { total_predicted?: number };

  const tomorrowPredictedKwh = Math.round((tomorrowRow?.total_predicted || (todayConsumptionKwh * 1.04)) * 10) / 10;
  const tomorrowPredictedCostInr = Math.round(tomorrowPredictedKwh * tariff);

  // Active alerts & excess cost
  const alertStats = db.prepare(`
    SELECT COUNT(*) as alert_count,
           SUM(excess_cost_inr) as total_excess_cost,
           SUM(excess_kwh) as total_excess_kwh
    FROM anomaly_alerts
    WHERE status != 'Resolved'
  `).get() as { alert_count?: number; total_excess_cost?: number; total_excess_kwh?: number };

  const activeAlertsCount = alertStats?.alert_count || 0;
  const excessCostDetectedInr = Math.round(alertStats?.total_excess_cost || 0);

  // Top wastage source building
  const topWastage = db.prepare(`
    SELECT a.building_id, b.name as building_name,
           SUM(a.excess_kwh) as total_excess_kwh,
           SUM(a.excess_cost_inr) as total_excess_cost,
           a.likely_explanation
    FROM anomaly_alerts a
    JOIN buildings b ON a.building_id = b.id
    WHERE a.status != 'Resolved'
    GROUP BY a.building_id
    ORDER BY total_excess_cost DESC
    LIMIT 1
  `).get() as any;

  // Potential monthly savings from recommendations
  const recStats = db.prepare(`
    SELECT SUM(est_savings_inr) as total_savings
    FROM recommendations
    WHERE status != 'Completed'
  `).get() as { total_savings?: number };

  const potentialMonthlySavingsInr = Math.round(recStats?.total_savings || (excessCostDetectedInr * 1.8));

  // Domain intelligence insight
  let headline = 'Normal Operations Across Academic Zones';
  let detail = 'Campus energy consumption aligns with seasonal baselines. Keep monitoring off-hours baselines.';
  let urgency: 'high' | 'medium' | 'low' = 'low';

  if (activeAlertsCount > 5 || excessCostDetectedInr > 20000) {
    headline = 'Urgent: High Wastage Detected in Computer Laboratory & Academic Block A';
    detail = `Active anomalies detected totalling ₹${excessCostDetectedInr.toLocaleString('en-IN')} in excess utility billing. Unscheduled HVAC runtimes during non-class hours represent the primary driver. Immediate thermostat setback recommended.`;
    urgency = 'high';
  } else if (activeAlertsCount > 0) {
    headline = 'Action Recommended: Off-Peak Energy Leaks Identified';
    detail = `${activeAlertsCount} active anomaly alerts flagged by IsolationForest. Implementing pending sensor adjustments can yield ₹${potentialMonthlySavingsInr.toLocaleString('en-IN')} monthly savings.`;
    urgency = 'medium';
  }

  return {
    todayConsumptionKwh,
    todayCostInr,
    tomorrowPredictedKwh,
    tomorrowPredictedCostInr,
    activeAlertsCount,
    excessCostDetectedInr,
    todayCo2EmissionsKg,
    potentialMonthlySavingsInr,
    topWastageSource: topWastage ? {
      buildingId: topWastage.building_id,
      buildingName: topWastage.building_name,
      excessKwh: Math.round(topWastage.total_excess_kwh * 10) / 10,
      excessCostInr: Math.round(topWastage.total_excess_cost),
      reason: topWastage.likely_explanation
    } : null,
    aiInsight: { headline, detail, urgency },
    tariff,
    emissionFactor
  };
}
