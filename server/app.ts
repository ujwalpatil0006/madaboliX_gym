import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { apiRouter } from './routes/index.js';
import { db } from './db.js';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

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

  const DIST_DIR = path.join(process.cwd(), 'dist');
  const hasFrontendBuild = fs.existsSync(path.join(DIST_DIR, 'index.html'));

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
      frontend: hasFrontendBuild
        ? { status: 'served', path: DIST_DIR }
        : { status: 'not-built', hint: 'run `npm run build` to host the UI here too' },
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

  app.post('/api/health/reset-data', async (_req: Request, res: Response) => {
    try {
      const fresh = await db.resetDB();
      res.json({ success: true, message: 'Seed data restored', members: fresh.members.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[api] unhandled error:', err?.message || err);
    res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  });

  return app;
}
