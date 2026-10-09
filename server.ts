import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes.ts';
import { getDatabase } from './server/database.ts';
import { generateSyntheticData } from './server/seedData.ts';
import { trainPredictionModel, generateTomorrowPredictions, runAnomalyAnalysis, refreshRecommendations } from './server/mlEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Initialize SQLite database and bootstrap data if needed
  console.log('[SmartEnergy AI] Initializing database...');
  const db = getDatabase();
  const readingCount = (db.prepare('SELECT COUNT(*) as c FROM energy_readings').get() as any).c;
  if (readingCount === 0) {
    console.log('[SmartEnergy AI] Bootstrapping 180 days of realistic campus energy readings...');
    generateSyntheticData(180, false);
    try {
      console.log('[SmartEnergy AI] Training initial RandomForestRegressor model...');
      trainPredictionModel();
      console.log('[SmartEnergy AI] Generating next-day demand forecast...');
      generateTomorrowPredictions();
      console.log('[SmartEnergy AI] Running IsolationForest anomaly and wastage detection...');
      runAnomalyAnalysis();
      refreshRecommendations();
    } catch (e: any) {
      console.warn('[SmartEnergy AI] Initial ML warm-up warning:', e.message);
    }
  }

  // Mount API router
  app.use('/api', apiRouter);

  // Serve static files / Vite middleware
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    console.log('[SmartEnergy AI] Mounting Vite development middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[SmartEnergy AI] Serving production static files from dist...');
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SmartEnergy AI] System online and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SmartEnergy AI] Fatal error starting server:', err);
  process.exit(1);
});
