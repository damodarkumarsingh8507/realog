import { getDatabase } from './database.ts';

export function generateSyntheticData(days: number = 180, forceReset: boolean = false) {
  const db = getDatabase();

  const currentCount = (db.prepare('SELECT COUNT(*) as count FROM energy_readings').get() as { count: number }).count;
  if (currentCount > 0 && !forceReset) {
    return { count: currentCount, message: 'Data already populated', generated: false };
  }

  if (forceReset) {
    db.exec(`
      DELETE FROM anomaly_alerts;
      DELETE FROM predictions;
      DELETE FROM recommendations;
      DELETE FROM action_logs;
      DELETE FROM model_metadata;
      DELETE FROM energy_readings;
    `);
  }

  const buildings = [
    { id: 'acad_a', base: 45, peak: 260, cap: 1200, ac: 48, start: 8, end: 18, isHostel: false },
    { id: 'acad_b', base: 52, peak: 290, cap: 1400, ac: 56, start: 8, end: 18, isHostel: false },
    { id: 'comp_lab', base: 85, peak: 420, cap: 650, ac: 64, start: 8, end: 20, isLab: true, isHostel: false },
    { id: 'central_lib', base: 38, peak: 210, cap: 800, ac: 36, start: 8, end: 22, isHostel: false },
    { id: 'hostel_block', base: 60, peak: 250, cap: 900, ac: 24, start: 0, end: 24, isHostel: true }
  ];

  // Generate hourly data for the last `days` days up to now
  const now = new Date();
  // Round to latest completed hour
  now.setMinutes(0, 0, 0);

  const insertStmt = db.prepare(`
    INSERT INTO energy_readings (
      timestamp, building_id, consumption_kwh, temperature_c,
      occupancy_count, ac_usage_pct, lighting_usage_pct,
      data_source, data_quality
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION;');

  let totalInserted = 0;
  const startDate = new Date(now.getTime() - days * 24 * 3600 * 1000);

  for (let d = 0; d < days; d++) {
    const dayDate = new Date(startDate.getTime() + d * 24 * 3600 * 1000);
    const dayOfWeek = dayDate.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayOfYear = Math.floor((dayDate.getTime() - new Date(dayDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

    // Seasonal temperature cycle (Odisha: peaks in May/June ~ 38-42C, pleasant in Dec/Jan ~ 18-28C)
    const seasonalTempBase = 26 + 10 * Math.sin(((dayOfYear - 80) / 365) * 2 * Math.PI);

    for (let h = 0; h < 24; h++) {
      const currentReadingTime = new Date(dayDate.getTime() + h * 3600 * 1000);
      const isoTimestamp = currentReadingTime.toISOString();

      // Diurnal temperature curve (coldest at 4 AM, hottest at 2 PM)
      const diurnalOffset = 6 * Math.sin(((h - 8) / 24) * 2 * Math.PI);
      const randomJitter = (Math.random() - 0.5) * 2;
      const temperature = Math.round((seasonalTempBase + diurnalOffset + randomJitter) * 10) / 10;

      for (const b of buildings) {
        let occupancy = 0;
        let acPct = 0;
        let lightingPct = 0;
        let isAnomaly = false;

        if (b.isHostel) {
          // Hostel: high morning (6-8 AM) and evening/night (6-11 PM)
          if (h >= 6 && h <= 8) {
            occupancy = Math.round(b.cap * (0.65 + Math.random() * 0.25));
            lightingPct = 70 + Math.random() * 20;
          } else if (h >= 9 && h <= 17) {
            occupancy = isWeekend ? Math.round(b.cap * 0.7) : Math.round(b.cap * (0.2 + Math.random() * 0.15));
            lightingPct = 20 + Math.random() * 15;
          } else if (h >= 18 && h <= 23) {
            occupancy = Math.round(b.cap * (0.8 + Math.random() * 0.18));
            lightingPct = 85 + Math.random() * 15;
          } else {
            // Late night
            occupancy = Math.round(b.cap * 0.9);
            lightingPct = 15 + Math.random() * 10;
          }
          acPct = temperature > 30 ? (h >= 13 && h <= 23 ? 55 + Math.random() * 30 : 25) : 10;
        } else {
          // Academic & Labs: low at night/weekends
          if (isWeekend) {
            occupancy = b.id === 'central_lib' ? (h >= 10 && h <= 18 ? Math.round(b.cap * 0.35) : 0) : Math.round(b.cap * 0.05 * Math.random());
            lightingPct = occupancy > 0 ? 30 : 5;
            acPct = occupancy > 0 && temperature > 30 ? 25 : 5;
          } else {
            // Weekday
            if (h >= b.start && h <= b.end) {
              const peakFactor = (h >= 10 && h <= 15) ? 0.85 : 0.6;
              occupancy = Math.round(b.cap * (peakFactor + (Math.random() - 0.5) * 0.2));
              lightingPct = 65 + Math.random() * 30;
              // AC usage strongly correlates with outside temperature
              const tempDemand = Math.max(0, (temperature - 26) * 7);
              acPct = Math.min(100, Math.round(30 + tempDemand + Math.random() * 20));
            } else {
              // Outside operating hours
              occupancy = Math.round(b.cap * 0.02 * Math.random());
              lightingPct = (h >= 19 && h <= 22) ? 18 : 5;
              acPct = 5;
            }
          }
        }

        // Specific injected anomalies to make data rich and realistic:
        // Anomaly 1: Computer Lab ACs left ON over recent weekends (e.g., 3 days ago or 10 days ago)
        const daysFromNow = (now.getTime() - currentReadingTime.getTime()) / (24 * 3600 * 1000);
        
        // Incident 1: 2-3 days ago weekend in Comp Lab (Massive cooling wastage overnight)
        if (b.id === 'comp_lab' && daysFromNow >= 2.0 && daysFromNow <= 3.5 && (h >= 21 || h <= 6)) {
          isAnomaly = true;
          acPct = 95;
          occupancy = 4; // virtually empty
        }

        // Incident 2: Yesterday night Academic Block A lights and split ACs running at 1 AM - 4 AM
        if (b.id === 'acad_a' && daysFromNow >= 0.8 && daysFromNow <= 1.2 && (h >= 1 && h <= 4)) {
          isAnomaly = true;
          acPct = 85;
          lightingPct = 90;
          occupancy = 2;
        }

        // Incident 3: Library abnormal spike during holiday 14 days ago
        if (b.id === 'central_lib' && daysFromNow >= 13.8 && daysFromNow <= 14.5 && h >= 22) {
          isAnomaly = true;
          acPct = 80;
          occupancy = 5;
        }

        // Incident 4: Academic Block B high afternoon consumption despite low student attendance 7 days ago
        if (b.id === 'acad_b' && daysFromNow >= 6.8 && daysFromNow <= 7.2 && (h >= 12 && h <= 16)) {
          isAnomaly = true;
          acPct = 98;
          occupancy = 80; // only 5% occupancy, but full AC running
        }

        // Calculate expected consumption:
        // Base load + Occupancy load + AC load + Lighting load + Noise
        const occRatio = occupancy / Math.max(1, b.cap);
        const acContribution = (b.peak - b.base) * 0.55 * (acPct / 100);
        const lightContribution = (b.peak - b.base) * 0.25 * (lightingPct / 100);
        const plugAndPeopleLoad = (b.peak - b.base) * 0.20 * occRatio;

        let consumption = b.base + acContribution + lightContribution + plugAndPeopleLoad;

        if (isAnomaly) {
          // Extra wastage surcharge
          consumption += (b.peak - b.base) * 0.45;
        }

        // Add 3% natural random noise
        consumption += (Math.random() - 0.5) * 5;
        consumption = Math.max(b.base * 0.8, Math.round(consumption * 10) / 10);

        insertStmt.run(
          isoTimestamp,
          b.id,
          consumption,
          temperature,
          occupancy,
          acPct,
          lightingPct,
          'Simulated',
          isAnomaly ? 'Anomaly' : 'Valid'
        );
        totalInserted++;
      }
    }
  }

  db.exec('COMMIT;');

  // Log action
  db.prepare(`
    INSERT INTO action_logs (action_type, entity_type, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `).run('SEED_DATA', 'energy_readings', 'campus', `Generated ${totalInserted} synthetic readings for ${days} days`, now.toISOString());

  return { count: totalInserted, days, message: `Successfully generated ${totalInserted} readings`, generated: true };
}
