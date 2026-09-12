import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { whatsapp } from '../whatsapp.js';

export const automationsRouter = Router();

// GET /api/automations/status - WhatsApp provider status, triggers & last dispatches
automationsRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const [config, logs] = await Promise.all([db.getAutomationConfig(), db.getAutomationLogs()]);
    res.json({
      success: true,
      provider: whatsapp.status(),
      rules: [
        { trigger: '7_DAYS_BEFORE', enabled: config.enabled7Days, template: whatsapp.templateNameForTrigger('7_DAYS_BEFORE') },
        { trigger: '3_DAYS_BEFORE', enabled: config.enabled3Days, template: whatsapp.templateNameForTrigger('3_DAYS_BEFORE') },
        { trigger: '1_DAY_BEFORE', enabled: config.enabled1Day, template: whatsapp.templateNameForTrigger('1_DAY_BEFORE') },
      ],
      autoDispatchTime: config.autoDispatchTime,
      recentLogs: logs.slice(0, 5),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/automations/history - Retrieve all dispatched WhatsApp automation records
automationsRouter.get('/history', async (req: Request, res: Response) => {
  try {
    const logs = await db.getAutomationLogs();
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/automations/config - Retrieve current WhatsApp trigger rules & templates (7d, 3d, 1d)
automationsRouter.get('/config', async (req: Request, res: Response) => {
  try {
    const config = await db.getAutomationConfig();
    res.json({
      success: true,
      data: config,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/automations/config - Update rules or message templates
automationsRouter.post('/config', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateAutomationConfig(req.body);
    res.json({
      success: true,
      message: 'WhatsApp Pass Expiry Automation settings updated',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/automations/run-cron - Run automatic pass-expiry scan & dispatch via WhatsApp
automationsRouter.post('/run-cron', async (req: Request, res: Response) => {
  try {
    const result = await db.runAutomationCron();
    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/automations/test-dispatch - Create a dummy athlete & send a real-time renewal WhatsApp
automationsRouter.post('/test-dispatch', async (req: Request, res: Response) => {
  try {
    const { name, phone, plan, amountDue } = req.body || {};
    const result = await db.dispatchTestRenewal({ name, phone, plan, amountDue });
    const verb = result.result.mode === 'live' ? 'WhatsApp delivered' : 'simulated (no access token)';
    res.status(201).json({
      success: true,
      message: `Sample renewal ${verb} to dummy member ${result.member.name} on ${result.member.phone}`,
      mode: result.result.mode,
      dispatch: result.result,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/automations/dispatch - Single manual WhatsApp dispatch (real time)
automationsRouter.post('/dispatch', async (req: Request, res: Response) => {
  try {
    const { athleteId, athleteName, phone, triggerType, triggerLabel, message, daysRemaining, plan, amount } = req.body;

    if (!athleteName || !phone) {
      return res.status(400).json({ error: 'Missing required dispatch parameters (athleteName, phone)' });
    }

    const { log, result } = await db.sendManualDispatch({
      athleteId,
      athleteName,
      phone,
      plan,
      amount,
      message,
      triggerType,
      triggerLabel,
      daysRemaining,
    });

    res.json({
      success: true,
      mode: result.mode,
      message: `WhatsApp ${result.mode === 'live' ? 'delivered' : 'simulated'} to ${athleteName} (${phone})`,
      dispatch: result,
      data: log,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});