import type { Request, Response } from 'express';
import { createApp } from '../server/app.js';
import { connectDB } from '../server/db.js';

const app = createApp();

export default async function handler(req: Request, res: Response) {
  try {
    await connectDB();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Database connection failed',
    });
    return;
  }
  return app(req, res);
}