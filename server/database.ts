import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || (process.env.NETLIFY ? '/tmp/smartenergy.sqlite' : path.resolve(process.cwd(), 'smartenergy.sqlite'));

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS buildings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      area_sqm REAL NOT NULL,
      student_capacity INTEGER NOT NULL,
      ac_units INTEGER NOT NULL,
      lighting_fixtures INTEGER NOT NULL,
      base_load_kwh REAL NOT NULL,
      peak_load_kwh REAL NOT NULL,
      operating_start INTEGER NOT NULL DEFAULT 8,
      operating_end INTEGER NOT NULL DEFAULT 18
    );

    CREATE TABLE IF NOT EXISTS energy_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      building_id TEXT NOT NULL,
      consumption_kwh REAL NOT NULL,
      temperature_c REAL NOT NULL,
      occupancy_count INTEGER NOT NULL,
      ac_usage_pct REAL NOT NULL,
      lighting_usage_pct REAL NOT NULL,
      data_source TEXT NOT NULL DEFAULT 'Simulated',
      data_quality TEXT NOT NULL DEFAULT 'Valid',
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );

    CREATE INDEX IF NOT EXISTS idx_readings_building_ts ON energy_readings(building_id, timestamp);
    CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON energy_readings(timestamp);

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      forecast_date TEXT NOT NULL,
      forecast_hour INTEGER NOT NULL,
      building_id TEXT NOT NULL,
      predicted_kwh REAL NOT NULL,
      actual_kwh REAL,
      model_version TEXT NOT NULL DEFAULT 'RandomForest-v1.0',
      created_at TEXT NOT NULL,
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );

    CREATE INDEX IF NOT EXISTS idx_predictions_bld_date ON predictions(building_id, forecast_date);

    CREATE TABLE IF NOT EXISTS anomaly_alerts (
      id TEXT PRIMARY KEY,
      building_id TEXT NOT NULL,
      reading_id INTEGER,
      timestamp TEXT NOT NULL,
      actual_kwh REAL NOT NULL,
      baseline_kwh REAL NOT NULL,
      excess_kwh REAL NOT NULL,
      deviation_pct REAL NOT NULL,
      excess_cost_inr REAL NOT NULL,
      severity TEXT NOT NULL, -- GREEN, YELLOW, RED
      likely_explanation TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open', -- Open, Acknowledged, Resolved
      resolution_notes TEXT,
      resolved_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (building_id) REFERENCES buildings(id),
      FOREIGN KEY (reading_id) REFERENCES energy_readings(id)
    );

    CREATE INDEX IF NOT EXISTS idx_alerts_status ON anomaly_alerts(status);
    CREATE INDEX IF NOT EXISTS idx_alerts_ts ON anomaly_alerts(timestamp);

    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      building_id TEXT NOT NULL,
      issue TEXT NOT NULL,
      evidence TEXT NOT NULL,
      action TEXT NOT NULL,
      est_savings_kwh REAL NOT NULL,
      est_savings_inr REAL NOT NULL,
      est_co2_reduction_kg REAL NOT NULL,
      priority TEXT NOT NULL, -- HIGH, MEDIUM, LOW
      status TEXT NOT NULL DEFAULT 'Open', -- Open, Planned, In Progress, Completed
      completed_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS action_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS model_metadata (
      id TEXT PRIMARY KEY,
      model_type TEXT NOT NULL,
      trained_at TEXT NOT NULL,
      training_samples INTEGER NOT NULL,
      date_range_start TEXT NOT NULL,
      date_range_end TEXT NOT NULL,
      mae REAL NOT NULL,
      rmse REAL NOT NULL,
      r2_score REAL NOT NULL,
      features_used TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  // Initialize default system settings if not present
  const defaultSettings: Array<[string, string, string]> = [
    ['electricity_tariff', '8.0', 'Electricity cost in INR per kWh'],
    ['grid_emission_factor', '0.82', 'Grid CO2 emissions factor in kg CO2 per kWh (CEA India 2024 baseline)'],
    ['anomaly_contamination', '0.08', 'Expected anomaly proportion (Isolation Forest parameter)'],
    ['operating_hours_start', '8', 'Campus standard operating hours start (0-23)'],
    ['operating_hours_end', '18', 'Campus standard operating hours end (0-23)'],
    ['low_occupancy_threshold', '15', 'Percentage of student capacity considered low occupancy'],
    ['campus_name', 'University Central Campus', 'Active university campus name']
  ];

  const now = new Date().toISOString();
  for (const [key, val, desc] of defaultSettings) {
    const existing = db.prepare('SELECT key FROM system_settings WHERE key = ?').get(key);
    if (!existing) {
      db.prepare('INSERT INTO system_settings (key, value, description, updated_at) VALUES (?, ?, ?, ?)').run(key, val, desc, now);
    }
  }

  // Seed default buildings if empty
  const bldCount = (db.prepare('SELECT COUNT(*) as count FROM buildings').get() as { count: number }).count;
  if (bldCount === 0) {
    const buildings = [
      {
        id: 'acad_a',
        name: 'Academic Block A',
        type: 'Lecture Halls & Faculty Offices',
        area_sqm: 4500,
        student_capacity: 1200,
        ac_units: 48,
        lighting_fixtures: 320,
        base_load_kwh: 45.0,
        peak_load_kwh: 280.0,
        operating_start: 8,
        operating_end: 18
      },
      {
        id: 'acad_b',
        name: 'Academic Block B',
        type: 'Engineering Depts & Seminar Halls',
        area_sqm: 5200,
        student_capacity: 1400,
        ac_units: 56,
        lighting_fixtures: 380,
        base_load_kwh: 52.0,
        peak_load_kwh: 310.0,
        operating_start: 8,
        operating_end: 18
      },
      {
        id: 'comp_lab',
        name: 'Computer Laboratory',
        type: 'Computing Clusters & Server Rooms',
        area_sqm: 3200,
        student_capacity: 650,
        ac_units: 64,
        lighting_fixtures: 260,
        base_load_kwh: 85.0,
        peak_load_kwh: 440.0,
        operating_start: 8,
        operating_end: 20
      },
      {
        id: 'central_lib',
        name: 'Central Library',
        type: 'Reading Halls & Digital Archive',
        area_sqm: 3800,
        student_capacity: 800,
        ac_units: 36,
        lighting_fixtures: 290,
        base_load_kwh: 38.0,
        peak_load_kwh: 220.0,
        operating_start: 8,
        operating_end: 22
      },
      {
        id: 'hostel_block',
        name: 'Hostel Block',
        type: 'Student Residences & Common Rooms',
        area_sqm: 6800,
        student_capacity: 900,
        ac_units: 24,
        lighting_fixtures: 450,
        base_load_kwh: 60.0,
        peak_load_kwh: 260.0,
        operating_start: 0,
        operating_end: 24
      }
    ];

    const insertBld = db.prepare(`
      INSERT INTO buildings (id, name, type, area_sqm, student_capacity, ac_units, lighting_fixtures, base_load_kwh, peak_load_kwh, operating_start, operating_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const b of buildings) {
      insertBld.run(b.id, b.name, b.type, b.area_sqm, b.student_capacity, b.ac_units, b.lighting_fixtures, b.base_load_kwh, b.peak_load_kwh, b.operating_start, b.operating_end);
    }
  }
}
