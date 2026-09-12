import { Router, Request, Response } from 'express';
import { db } from '../db';

export const analyticsRouter = Router();

// GET /api/analytics/overview - Executive operations overview
analyticsRouter.get('/overview', async (req: Request, res: Response) => {
  try {
    const { branch } = req.query;
    const overview = await db.getOverviewAnalytics(branch as string);
    res.json({ success: true, data: overview });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/branches - Multi-facility telemetry & performance
analyticsRouter.get('/branches', async (req: Request, res: Response) => {
  try {
    const branches = await db.getBranchAnalytics();
    res.json({
      success: true,
      leader: 'Adgaon Branch (+35% MRR)',
      portfolioAlpha: '+35% MRR Adgaon',
      data: branches,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/forecast - 30-Day Liquidity Forecast & Churn Intercepts
analyticsRouter.get('/forecast', async (req: Request, res: Response) => {
  try {
    const forecast = await db.getLiquidityForecast();
    res.json({ success: true, data: forecast });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/gst - GST Summary & Audit Records (SAC 999723)
analyticsRouter.get('/gst', async (req: Request, res: Response) => {
  try {
    const invoices = await db.getGSTInvoices();
    const totalTaxable = invoices.reduce((acc, i) => acc + i.taxableAmount, 0);
    const totalCGST = invoices.reduce((acc, i) => acc + i.cgst, 0);
    const totalSGST = invoices.reduce((acc, i) => acc + i.sgst, 0);
    const grandTotal = invoices.reduce((acc, i) => acc + i.totalAmount, 0);

    res.json({
      success: true,
      complianceCode: 'GSTR-1 READY',
      gstin: '27AAECM5541L1Z9',
      sacCode: '999723',
      sacDescription: 'Gymnasium and Physical Fitness Services',
      summary: {
        totalTaxable,
        totalCGST,
        totalSGST,
        grandTotal,
        totalInvoices: invoices.length,
      },
      invoices,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});