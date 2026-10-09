import serverless from 'serverless-http';
import express from 'express';
import { apiRouter } from '../../server/routes.ts';
import { getDatabase } from '../../server/database.ts';
import { generateSyntheticData } from '../../server/seedData.ts';
import {
  trainPredictionModel,
  generateTomorrowPredictions,
  runAnomalyAnalysis,
  refreshRecommendations
} from '../../server/mlEngine.ts';

const app = express();
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

let isInitialized = false;

function ensureDatabaseReady() {
  if (isInitialized) return;
  try {
    const db = getDatabase();
    const count = (db.prepare('SELECT COUNT(*) as c FROM energy_readings').get() as any)?.c || 0;
    if (count === 0) {
      generateSyntheticData(180, false);
      try {
        trainPredictionModel();
        generateTomorrowPredictions();
        runAnomalyAnalysis();
        refreshRecommendations();
      } catch (e: any) {
        console.warn('Initial warmup:', e.message);
      }
    }
    isInitialized = true;
  } catch (err) {
    console.warn('Serverless database bootstrap error:', err);
  }
}

app.use((req, res, next) => {
  ensureDatabaseReady();
  next();
});

// Mount router at /api and at root (to handle path rewriting)
app.use('/api', apiRouter);
app.use(apiRouter);

export const handler = serverless(app);
