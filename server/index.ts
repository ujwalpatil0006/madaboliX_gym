import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './routes';
import { connectDB, db } from './db';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(express.json({ limit: '1mb' }));

// Manual CORS (open to local Vite dev server + any configured origin)
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowed = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((o) => o.trim());
  if (origin && (allowed.includes(origin) || allowed.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use('/api', apiRouter);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const hasFrontendBuild = fs.existsSync(path.join(DIST_DIR, 'index.html'));

// Production hosting: serve the built React frontend + SPA fallback
if (hasFrontendBuild) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/api|\/health).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.get('/', (_req: Request, res: Response) => {
  res.json({
    system: 'Madabolicx Studio Operations API',
    version: '3.4.0',
    db: { engine: 'MongoDB Atlas', database: process.env.MONGODB_DB || 'gymcrm' },
    frontend: hasFrontendBuild ? { status: 'served', path: DIST_DIR } : { status: 'not-built', hint: 'run `npm run build` to host the UI here too' },
    endpoints: [
      '/api/health',
      '/api/members',
      '/api/billing',
      '/api/analytics/{overview,branches,forecast,gst}',
      '/api/automations/{status,history,config,run-cron,dispatch,test-dispatch}',
      '/api/business/{summary,leads,trainers,equipment,expenses,pos}',
    ],
  });
});

// Reset helper (dev convenience): POST /api/health/reset-data
app.post('/api/health/reset-data', async (_req: Request, res: Response) => {
  try {
    const fresh = await db.resetDB();
    res.json({ success: true, message: 'Seed data restored', members: fresh.members.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 404 handler for unknown API routes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[api] unhandled error:', err?.message || err);
  res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log('⚡ Madabolicx API listening on http://localhost:' + PORT);
      console.log('   MongoDB Atlas  : connected ✅');
      console.log(`   Health check   : http://localhost:${PORT}/api/health`);
    });
    startAutomationScheduler();
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB Atlas:', err?.message || err);
    console.error('   Check MONGODB_URI / MONGODB_DB in .env and network access (IP allowlist).');
    process.exit(1);
  });

function startAutomationScheduler(): void {
  if (process.env.AUTOMATION_CRON_ENABLED === 'false') {
    console.log('   Automation scheduler: disabled (AUTOMATION_CRON_ENABLED=false)');
    return;
  }
  const minutes = Math.max(1, Number(process.env.AUTOMATION_CRON_INTERVAL_MINUTES) || 30);
  const tick = async () => {
    try {
      const result = await db.runAutomationCron();
      if (result.dispatched > 0) {
        console.log(`[scheduler] ${result.message} (${result.mode})`);
      }
    } catch (err: any) {
      console.error('[scheduler] tick failed:', err?.message || err);
    }
  };
  console.log(`   Automation scheduler: WhatsApp renewal scan every ${minutes} min ✅`);
  const first = setTimeout(tick, 30 * 1000);
  first.unref();
  setInterval(tick, minutes * 60 * 1000);
}