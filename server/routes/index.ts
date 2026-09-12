import { Router } from 'express';
import { membersRouter } from './members.js';
import { billingRouter } from './billing.js';
import { analyticsRouter } from './analytics.js';
import { automationsRouter } from './automations.js';
import { businessRouter } from './business.js';

export const apiRouter = Router();

apiRouter.use('/members', membersRouter);
apiRouter.use('/billing', billingRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/automations', automationsRouter);
apiRouter.use('/business', businessRouter);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Madabolicx Studio Operations System',
    version: '3.4.0',
    turnstileGateways: '4/4 Online',
    timestamp: new Date().toISOString(),
  });
});