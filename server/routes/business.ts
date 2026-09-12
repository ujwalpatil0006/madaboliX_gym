import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const businessRouter = Router();

// Overview / Summary KPIs
businessRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const summary = await db.getBusinessSummary();
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Leads CRM
businessRouter.get('/leads', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const leads = await db.getLeads({
      status: status as string,
      search: search as string,
    });
    res.json({ success: true, data: leads });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

businessRouter.post('/leads', async (req: Request, res: Response) => {
  try {
    const newLead = await db.createLead(req.body);
    res.status(201).json({ success: true, data: newLead });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

businessRouter.patch('/leads/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateLead(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

businessRouter.post('/leads/:id/convert', async (req: Request, res: Response) => {
  try {
    const result = await db.convertLeadToMember(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    res.json({
      success: true,
      message: `Lead converted to active member ${result.member.name}`,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Staff & Trainers
businessRouter.get('/trainers', async (req: Request, res: Response) => {
  try {
    const trainers = await db.getTrainers();
    res.json({ success: true, data: trainers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

businessRouter.patch('/trainers/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await db.updateTrainerStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Trainer not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

businessRouter.post('/trainers/:id/session', async (req: Request, res: Response) => {
  try {
    const updated = await db.logTrainerSession(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Trainer not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Equipment & AMC
businessRouter.get('/equipment', async (req: Request, res: Response) => {
  try {
    const equipment = await db.getEquipment();
    res.json({ success: true, data: equipment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

businessRouter.post('/equipment', async (req: Request, res: Response) => {
  try {
    const newEq = await db.createEquipment(req.body);
    res.status(201).json({ success: true, data: newEq });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

businessRouter.patch('/equipment/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateEquipment(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Equipment not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Expenses
businessRouter.get('/expenses', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const expenses = await db.getExpenses(category as string);
    res.json({ success: true, data: expenses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

businessRouter.post('/expenses', async (req: Request, res: Response) => {
  try {
    const newExp = await db.createExpense(req.body);
    res.status(201).json({ success: true, data: newExp });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POS Supplement & Gear Counter
businessRouter.get('/pos/products', async (req: Request, res: Response) => {
  try {
    const prods = await db.getPosProducts();
    res.json({ success: true, data: prods });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

businessRouter.get('/pos/sales', async (req: Request, res: Response) => {
  try {
    const sales = await db.getPosSales();
    res.json({ success: true, data: sales });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

businessRouter.post('/pos/sale', async (req: Request, res: Response) => {
  try {
    const sale = await db.recordPosSale(req.body);
    if (!sale) {
      return res.status(400).json({ success: false, error: 'Product not found or invalid' });
    }
    res.status(201).json({ success: true, data: sale });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});