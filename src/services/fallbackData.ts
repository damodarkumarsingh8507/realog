import { DashboardResponse } from './api';
import { Building } from '../types';

export const fallbackBuildings: Building[] = [
  {
    id: 'comp_lab',
    name: 'Computer Laboratory',
    type: 'Laboratory & High Compute',
    category: 'labs',
    area_sqm: 3200,
    student_capacity: 650,
    ac_units: 48,
    lighting_fixtures: 320,
    base_load_kwh: 85,
    peak_load_kwh: 420,
    operating_start: 8,
    operating_end: 20,
    active_alerts: 2,
    today_kwh: 1738
  },
  {
    id: 'acad_a',
    name: 'Academic Block A',
    type: 'Classrooms & Faculty Offices',
    category: 'academic',
    area_sqm: 4500,
    student_capacity: 1200,
    ac_units: 36,
    lighting_fixtures: 410,
    base_load_kwh: 45,
    peak_load_kwh: 260,
    operating_start: 8,
    operating_end: 18,
    active_alerts: 1,
    today_kwh: 794
  },
  {
    id: 'acad_b',
    name: 'Academic Block B',
    type: 'Lecture Theatres & Studios',
    category: 'academic',
    area_sqm: 5200,
    student_capacity: 1400,
    ac_units: 42,
    lighting_fixtures: 480,
    base_load_kwh: 52,
    peak_load_kwh: 290,
    operating_start: 8,
    operating_end: 18,
    active_alerts: 0,
    today_kwh: 912
  },
  {
    id: 'central_lib',
    name: 'Central Library',
    type: 'Study Halls & Archives',
    category: 'library',
    area_sqm: 3800,
    student_capacity: 800,
    ac_units: 28,
    lighting_fixtures: 360,
    base_load_kwh: 38,
    peak_load_kwh: 210,
    operating_start: 8,
    operating_end: 22,
    active_alerts: 1,
    today_kwh: 975
  },
  {
    id: 'hostel_block',
    name: 'Hostel Block',
    type: 'Residential Complex',
    category: 'hostel',
    area_sqm: 6800,
    student_capacity: 900,
    ac_units: 18,
    lighting_fixtures: 520,
    base_load_kwh: 60,
    peak_load_kwh: 250,
    operating_start: 0,
    operating_end: 24,
    active_alerts: 1,
    today_kwh: 1077
  }
];

export const fallbackDashboard: DashboardResponse = {
  summary: {
    todayConsumptionKwh: 5496.6,
    todayCostInr: 43973,
    tomorrowPredictedKwh: 14624.9,
    tomorrowPredictedCostInr: 116999,
    activeAlertsCount: 5,
    excessCostDetectedInr: 1099214,
    todayCo2EmissionsKg: 4507.2,
    potentialMonthlySavingsInr: 124400,
    topWastageSource: {
      buildingId: 'comp_lab',
      buildingName: 'Computer Laboratory',
      excessKwh: 49114.6,
      excessCostInr: 392910,
      reason: 'Server rack cooling and unscheduled high compute loads running outside class hours.'
    },
    aiInsight: {
      headline: 'Urgent: High Wastage Detected in Computer Laboratory & Academic Block A',
      detail: 'Active anomalies detected totalling ₹10,99,214 in excess utility billing. Unscheduled HVAC runtimes during non-class hours represent the primary driver. Immediate thermostat setback recommended.',
      urgency: 'high'
    },
    tariff: 8,
    emissionFactor: 0.82
  },
  dailyTrends: [
    { date: '2026-09-26', actualKwh: 13247.7, expectedKwh: 12062.1, excessKwh: 1185.6 },
    { date: '2026-09-27', actualKwh: 11060.8, expectedKwh: 10156.6, excessKwh: 904.2 },
    { date: '2026-09-28', actualKwh: 14693.3, expectedKwh: 13089.3, excessKwh: 1604 },
    { date: '2026-09-29', actualKwh: 16596.7, expectedKwh: 14164.5, excessKwh: 2432.2 },
    { date: '2026-09-30', actualKwh: 16475.1, expectedKwh: 13847, excessKwh: 2628.1 },
    { date: '2026-10-01', actualKwh: 16525.3, expectedKwh: 15098.5, excessKwh: 1426.8 },
    { date: '2026-10-02', actualKwh: 16365.3, expectedKwh: 14996.7, excessKwh: 1368.6 },
    { date: '2026-10-03', actualKwh: 12504.2, expectedKwh: 11074.3, excessKwh: 1429.9 },
    { date: '2026-10-04', actualKwh: 10687.3, expectedKwh: 9081.3, excessKwh: 1606 },
    { date: '2026-10-05', actualKwh: 14174.1, expectedKwh: 11929.5, excessKwh: 2244.6 },
    { date: '2026-10-06', actualKwh: 19335.1, expectedKwh: 16798.8, excessKwh: 2536.3 },
    { date: '2026-10-07', actualKwh: 17348.2, expectedKwh: 15722.3, excessKwh: 1625.9 },
    { date: '2026-10-08', actualKwh: 16985.2, expectedKwh: 15619.2, excessKwh: 1366 },
    { date: '2026-10-09', actualKwh: 5496.6, expectedKwh: 4927.6, excessKwh: 569 }
  ],
  buildingDistribution: [
    { id: 'comp_lab', name: 'Computer Laboratory', area_sqm: 3200, total_kwh: 1738.3, energyIntensity: 0.54 },
    { id: 'hostel_block', name: 'Hostel Block', area_sqm: 6800, total_kwh: 1077, energyIntensity: 0.16 },
    { id: 'central_lib', name: 'Central Library', area_sqm: 3800, total_kwh: 975.3, energyIntensity: 0.26 },
    { id: 'acad_b', name: 'Academic Block B', area_sqm: 5200, total_kwh: 911.9, energyIntensity: 0.18 },
    { id: 'acad_a', name: 'Academic Block A', area_sqm: 4500, total_kwh: 794.1, energyIntensity: 0.18 }
  ],
  hourly24: [
    { hour: 0, kwh: 869.3, temp: 27.3 },
    { hour: 1, kwh: 873.5, temp: 26.4 },
    { hour: 2, kwh: 927.7, temp: 26.6 },
    { hour: 3, kwh: 687, temp: 24.3 },
    { hour: 4, kwh: 687.3, temp: 23.3 },
    { hour: 5, kwh: 515.5, temp: 21.2 },
    { hour: 6, kwh: 524, temp: 18.9 },
    { hour: 7, kwh: 412.3, temp: 18.6 },
    { hour: 8, kwh: 680.1, temp: 22.4 },
    { hour: 9, kwh: 980.5, temp: 26.1 },
    { hour: 10, kwh: 1250.4, temp: 29.5 },
    { hour: 11, kwh: 1420.8, temp: 31.8 }
  ],
  recentAlerts: [
    {
      id: 'ALT-2026-4335',
      building_id: 'central_lib',
      building_name: 'Central Library',
      timestamp: new Date().toISOString(),
      actual_kwh: 132.4,
      baseline_kwh: 52.6,
      excess_kwh: 79.8,
      deviation_pct: 152,
      excess_cost_inr: 638,
      severity: 'RED',
      likely_explanation: 'Severe power surge detected (132.4 kWh vs 52.6 kWh baseline). Abnormal continuous load on main feeder.',
      recommended_action: 'Check main electrical distribution panel for phase imbalance or malfunctioning chiller pump.',
      status: 'Open',
      created_at: new Date().toISOString()
    },
    {
      id: 'ALT-2026-7316',
      building_id: 'hostel_block',
      building_name: 'Hostel Block',
      timestamp: new Date().toISOString(),
      actual_kwh: 149.7,
      baseline_kwh: 118.5,
      excess_kwh: 31.2,
      deviation_pct: 26,
      excess_cost_inr: 250,
      severity: 'YELLOW',
      likely_explanation: 'Moderate energy wastage flagged: Consumption is 26% higher than expected for current occupancy.',
      recommended_action: 'Adjust thermostat setpoints from 21°C to 24°C; optimize common area lighting.',
      status: 'Open',
      created_at: new Date().toISOString()
    },
    {
      id: 'ALT-2026-2524',
      building_id: 'comp_lab',
      building_name: 'Computer Laboratory',
      timestamp: new Date().toISOString(),
      actual_kwh: 262.3,
      baseline_kwh: 113.4,
      excess_kwh: 148.9,
      deviation_pct: 131,
      excess_cost_inr: 1191,
      severity: 'RED',
      likely_explanation: 'Computer lab server air conditioning running at 100% capacity during unoccupied weekend hours.',
      recommended_action: 'Activate smart setback schedule to raise temperature setpoint to 25°C outside laboratory hours.',
      status: 'Open',
      created_at: new Date().toISOString()
    }
  ]
};
