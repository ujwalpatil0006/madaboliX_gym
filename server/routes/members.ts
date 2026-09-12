import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const membersRouter = Router();

// GET /api/members - List members with filters
membersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { branch, status, search } = req.query;
    const members = await db.getMembers({
      branch: branch as string,
      status: status as string,
      search: search as string,
    });
    res.json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/members/:id - Get single member details
membersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const member = await db.getMemberById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, data: member });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/members - Enroll new athlete
membersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, plan, branch, locker, ltv } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Name and Phone are required' });
    }
    const newMember = await db.createMember({
      name,
      phone,
      plan,
      branch,
      locker,
      ltv: Number(ltv) || 24000,
    });
    res.status(201).json({
      success: true,
      message: 'Athlete enrolled successfully',
      data: newMember,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/members/:id - Update member record
membersRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateMember(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/members/:id/checkin - Toggle Turnstile gate check-in
membersRouter.post('/:id/checkin', async (req: Request, res: Response) => {
  try {
    const result = await db.toggleCheckIn(req.params.id);
    if (!result.member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({
      success: true,
      event: result.event,
      data: result.member,
      turnstileStatus: 'UNLOCKED_0.12S',
      lockerStatus: `${result.member.locker || 'Locker #14'} ACTIVE`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/members/:id/renew - 1-Tap Membership Renewal
membersRouter.post('/:id/renew', async (req: Request, res: Response) => {
  try {
    const { amount, duration, paymentMethod } = req.body;
    const renewAmount = Number(amount) || 2500;
    const result = await db.renewMember(req.params.id, renewAmount, duration || '1m', paymentMethod || 'UPI');
    if (!result.member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({
      success: true,
      message: `Membership extended (${duration || '1m'})`,
      data: result.member,
      invoice: result.invoice,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});