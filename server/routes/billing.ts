import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const billingRouter = Router();

// GET /api/billing - Priority action queue & cycle telemetry
billingRouter.get('/', async (req: Request, res: Response) => {
  try {
    const items = await db.getBillingItems();
    const overview = await db.getOverviewAnalytics();
    res.json({
      success: true,
      pendingCount: items.length,
      expectedTotal: overview.pendingCollection || 46450,
      collectionVelocity: overview.velocityRate,
      settlementSplit: overview.settlementSplit,
      data: items,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/billing/pay - Record new payment (Dynamic QR, Cash, POS Card)
billingRouter.post('/pay', async (req: Request, res: Response) => {
  try {
    const { amount, method, memberId, note } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, error: 'Payment amount is required' });
    }
    const invoice = await db.recordPayment(Number(amount), method || 'UPI', memberId, note);
    res.status(201).json({
      success: true,
      message: `Payment of ₹${Number(amount).toLocaleString()} settled successfully via ${method || 'UPI'}`,
      invoice,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/billing/nudge - Trigger WhatsApp or UPI payment dispatch
billingRouter.post('/nudge', async (req: Request, res: Response) => {
  try {
    const { phone, athleteName, amount, plan, channel } = req.body;
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const upiLink = `upi://pay?pa=madabolicx.fitness@icici&pn=Madabolicx%20Fitness&am=${amount || 2500}&cu=INR&tn=Renewal%20${encodeURIComponent(plan || 'Fitness')}`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Hey ${athleteName || 'Athlete'}! 💪 Madabolicx renewal notice for ${plan || 'plan'} (₹${amount || 2500}). Pay instantly here: ${upiLink}`
    )}`;

    res.json({
      success: true,
      channel: channel || 'whatsapp',
      athleteName,
      phone: cleanPhone,
      upiLink,
      whatsappUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});