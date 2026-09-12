import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDB, db } from './db.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const app = createApp();

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