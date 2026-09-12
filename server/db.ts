import { MongoClient, Db, Collection, Filter } from 'mongodb';
import dotenv from 'dotenv';
import { whatsapp, SendResult, AutomationTrigger } from './whatsapp.js';
import {
  PersistableDB,
  Member,
  BillingItem,
  GymLead,
  AutomationLog,
  AutomationConfig,
  GSTInvoice,
  GymTrainer,
  EquipmentItem,
  GymExpense,
  PosSale,
  PosProduct,
  BranchAnalytics,
  OverviewAnalytics,
  ForecastDay,
  BusinessSummary,
} from './types.js';

dotenv.config();

const GSTIN = '27AAECM5541L1Z9';
const SAC_CODE = '999723';

const DEFAULT_URI = 'mongodb+srv://democomp001_db_user:fvKatAmuobKRJ8rU@gymcrm.ehqdnik.mongodb.net';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'gymcrm';

const C = {
  members: 'members',
  billingItems: 'billingItems',
  branchAnalytics: 'branchAnalytics',
  gstInvoices: 'gstInvoices',
  automationLogs: 'automationLogs',
  automationConfig: 'automationConfig',
  leads: 'leads',
  trainers: 'trainers',
  equipment: 'equipment',
  expenses: 'expenses',
  posProducts: 'posProducts',
  posSales: 'posSales',
} as const;

let client: MongoClient | null = null;
let mongoDb: Db | null = null;

function col<T = any>(name: string): Collection<T> {
  if (!mongoDb) throw new Error('Database not connected. Call connectDB() first.');
  return mongoDb.collection<T>(name);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

let invoiceSeq = 2401;
let logSeq = 500;
let saleSeq = 300;
let leadSeq = 100;

const DEFAULT_AUTOMATION_CONFIG: AutomationConfig = {
  enabled7Days: true,
  enabled3Days: true,
  enabled1Day: true,
  autoDispatchTime: '09:00',
  template7Days:
    'Hi {name}! 👋 Your {plan} at MADABOLICX renews in {days} days. Lock your rates & skip the queue — pay ₹{amount} here: {upiLink}',
  template3Days:
    'Hey {name} ⚡ {days} days left on your {plan}. No breaks allowed — renew in one tap: ₹{amount} → {upiLink}',
  template1Day:
    '{name}, your {plan} EXPIREs TOMORROW! ⏳ Keep your streak going. Instant renew: ₹{amount} → {upiLink}',
};

function clean<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: any = {};
  for (const k of Object.keys(obj)) {
    if (obj[k] !== undefined && obj[k] !== null) out[k] = obj[k];
  }
  return out;
}

async function countDocs(name: string): Promise<number> {
  return col(name).countDocuments({});
}

// ---------- Mongo lifecycle ----------

export async function connectDB(): Promise<void> {
  if (client) return;
  client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
  });
  await client.connect();
  mongoDb = client.db(MONGODB_DB);
  await ping();
  await ensureSeed();
  await initCounters();
}

async function ping(): Promise<void> {
  await mongoDb!.collection('members').findOne({});
}

async function disconnectDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    mongoDb = null;
  }
}

async function ensureSeed(): Promise<void> {
  const seed = seedDB();
  const entries: [string, string][] = Object.entries(C) as [string, string][];
  for (const [key, collectionName] of entries) {
    const existing = await countDocs(collectionName);
    if (existing > 0) continue;
    const value = (seed as any)[key];
    if (key === 'automationConfig') {
      await col(collectionName).insertOne(value);
    } else if (Array.isArray(value) && value.length > 0) {
      await col(collectionName).insertMany(value.map((d: any) => ({ ...d })));
    }
  }
}

async function initCounters(): Promise<void> {
  invoiceSeq = 2400 + (await countDocs(C.gstInvoices));
  logSeq = 500 + (await countDocs(C.automationLogs));
  saleSeq = 300 + (await countDocs(C.posSales));
  leadSeq = 100 + (await countDocs(C.leads));
}

// ---------- helpers ----------

function normalizeSearch(term: string): string {
  return (term || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildInvoice(athleteName: string, totalAmount: number, paymentMethod: string): GSTInvoice {
  const taxable = Math.round((totalAmount / 1.18) * 100) / 100;
  const gst = Math.round((taxable * 0.09) * 100) / 100;
  invoiceSeq += 1;
  return {
    invoiceNumber: `GT26-${String(invoiceSeq).padStart(4, '0')}`,
    date: today(),
    athleteName,
    gstin: GSTIN,
    sacCode: SAC_CODE,
    taxableAmount: taxable,
    cgst: gst,
    sgst: gst,
    totalAmount,
    paymentMethod,
  };
}

function upiLinkFor(amount: number, plan: string): string {
  return `upi://pay?pa=madabolicx.fitness@icici&pn=Madabolicx%20Fitness&am=${amount}&cu=INR&tn=Renewal%20${encodeURIComponent(plan)}`;
}

// ---------- Members ----------

async function getMembers(filters: { branch?: string; status?: string; search?: string } = {}): Promise<Member[]> {
  const query: Filter<Member> = {};
  if (filters.branch && filters.branch !== 'All Locations') query.branch = filters.branch as any;
  if (filters.status) query.status = filters.status as any;
  if (filters.search) {
    const safe = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { phone: { $regex: safe, $options: 'i' } },
      { plan: { $regex: safe, $options: 'i' } },
      { id: { $regex: safe, $options: 'i' } },
    ];
  }
  return col<Member>(C.members).find(query).toArray();
}

async function getMemberById(id: string): Promise<Member | null> {
  return col<Member>(C.members).findOne({ id });
}

async function createMember(input: Partial<Member>): Promise<Member> {
  const member: Member = {
    id: `mem-${Date.now()}`,
    name: input.name || 'New Athlete',
    avatar:
      input.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    plan: input.plan || 'Monthly',
    branch: input.branch || 'Jatra Branch',
    status: 'active',
    lastActive: 'Enrolled today',
    phone: input.phone || '+91 98000 00000',
    locker: input.locker,
    isCheckedIn: false,
    ltv: typeof input.ltv === 'number' ? input.ltv : 24000,
    attendanceCount: 0,
    joinedDate: today(),
    daysRemaining: 30,
    ...(input.email ? { email: input.email } : {}),
    ...(input.address ? { address: input.address } : {}),
    ...(input.membershipStartDate ? { membershipStartDate: input.membershipStartDate } : {}),
    ...(input.membershipEndDate ? { membershipEndDate: input.membershipEndDate } : {}),
    ...(input.initials ? { initials: input.initials } : {}),
  };
  await col<Member>(C.members).insertOne({ ...member });
  return member;
}

async function updateMember(id: string, patch: Partial<Member>): Promise<Member | null> {
  const safe = clean(patch);
  await col<Member>(C.members).updateOne({ id }, { $set: safe });
  return col<Member>(C.members).findOne({ id });
}

async function toggleCheckIn(id: string): Promise<{ member?: Member; event?: string }> {
  const member = await col<Member>(C.members).findOne({ id });
  if (!member) return {};
  const next = !member.isCheckedIn;
  await col<Member>(C.members).updateOne(
    { id },
    {
      $set: {
        isCheckedIn: next,
        lastActive: next ? 'Just now' : member.lastActive,
        attendanceCount: (member.attendanceCount || 0) + 1,
      },
    }
  );
  const updated = await col<Member>(C.members).findOne({ id });
  if (!updated) return {};
  return {
    member: updated,
    event: next ? 'CHECKED_IN' : 'CHECKED_OUT',
  };
}

async function renewMember(
  id: string,
  amount: number,
  duration: string,
  paymentMethod: string
): Promise<{ member?: Member; invoice?: GSTInvoice; message?: string }> {
  const member = await col<Member>(C.members).findOne({ id });
  if (!member) return {};
  const months = duration === '1y' ? 12 : duration === '3m' ? 3 : 1;
  const endDate = new Date(Date.now() + months * 30 * 86400000).toISOString().slice(0, 10);

  await col<Member>(C.members).updateOne(
    { id },
    {
      $set: {
        status: 'active',
        amountDue: 0,
        daysRemaining: months * 30,
        membershipEndDate: endDate,
        ltv: (member.ltv || 0) + amount,
      },
      $unset: { statusLabel: '' },
    }
  );
  await col<BillingItem>(C.billingItems).deleteMany({ memberId: id });

  const invoice = buildInvoice(member.name, amount, paymentMethod || 'UPI');
  await col<GSTInvoice>(C.gstInvoices).insertOne({ ...invoice });
  const updated = await col<Member>(C.members).findOne({ id });
  return { member: updated, invoice, message: `Membership extended (${duration})` };
}

// ---------- Billing ----------

async function getBillingItems(): Promise<BillingItem[]> {
  return col<BillingItem>(C.billingItems).find({}).toArray();
}

async function settleBillingForMember(memberId?: string): Promise<BillingItem[]> {
  if (!memberId) return [];
  const pending = await col<BillingItem>(C.billingItems)
    .find({ memberId, status: 'pending' })
    .toArray();
  if (pending.length > 0) {
    await col<BillingItem>(C.billingItems).updateMany(
      { memberId, status: 'pending' },
      { $set: { status: 'settled', paidAt: nowIso() } }
    );
    await col<BillingItem>(C.billingItems).deleteMany({ memberId, status: 'settled' });
  }
  return pending.map((b) => ({ ...b, status: 'settled', paidAt: nowIso() }));
}

async function recordPayment(
  amount: number,
  method: string,
  memberId?: string,
  note?: string
): Promise<GSTInvoice> {
  if (memberId) {
    const member = await col<Member>(C.members).findOne({ id: memberId });
    if (member) {
      const remaining = Math.max(0, (member.amountDue || amount) - amount);
      const set: Record<string, any> = { amountDue: remaining, status: 'active' };
      if (remaining === 0) {
        await col<Member>(C.members).updateOne(
          { id: memberId },
          { $set: set, $unset: { statusLabel: '' } }
        );
      } else {
        await col<Member>(C.members).updateOne({ id: memberId }, { $set: set });
      }
    }
    await settleBillingForMember(memberId);
  }
  const invoice = buildInvoice(note || 'Membership Renewal', amount, method || 'UPI');
  await col<GSTInvoice>(C.gstInvoices).insertOne({ ...invoice });
  return invoice;
}

// ---------- Analytics ----------

async function getOverviewAnalytics(branch?: string): Promise<OverviewAnalytics> {
  const filter: Filter<Member> = {};
  if (branch && branch !== 'All Locations') filter.branch = branch as any;
  const members = await col<Member>(C.members).find(filter).toArray();
  const pendingItems = await col<BillingItem>(C.billingItems)
    .find({ status: 'pending' })
    .toArray();
  const branches = await col<BranchAnalytics>(C.branchAnalytics)
    .find(branch && branch !== 'All Locations' ? { name: branch as any } : {})
    .toArray();

  const pending = pendingItems.reduce((acc, b) => acc + b.amount, 0);
  const mrr = branches.reduce((acc, b) => acc + b.mrrRunRate, 0);
  const totalCapacity = branches.reduce((acc, b) => acc + b.maxCapacity, 0);
  const activeMembers = branches.reduce((acc, b) => acc + b.activeCount, 0);

  return {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === 'active').length,
    expiringCount: members.filter((m) => m.status === 'expiring').length,
    overdueCount: members.filter((m) => m.status === 'expired').length,
    checkedInNow: members.filter((m) => m.isCheckedIn).length,
    todayCheckins: members.filter((m) => m.lastActive && m.lastActive.toLowerCase().includes('today')).length,
    pendingCollection: pending,
    velocityRate: 24400,
    settlementSplit: [
      { method: 'UPI', percent: 64, amount: Math.round(pending * 0.64) },
      { method: 'Cash', percent: 24, amount: Math.round(pending * 0.24) },
      { method: 'POS Card', percent: 12, amount: Math.round(pending * 0.12) },
    ],
    monthlyRevenueRunRate: mrr,
    capacityUtilization: totalCapacity > 0 ? Math.round((activeMembers / totalCapacity) * 100) : 0,
  };
}

async function getBranchAnalytics(): Promise<BranchAnalytics[]> {
  return col<BranchAnalytics>(C.branchAnalytics).find({}).toArray();
}

async function getLiquidityForecast(): Promise<ForecastDay[]> {
  const branches = await col<BranchAnalytics>(C.branchAnalytics).find({}).toArray();
  const expenses = await col<GymExpense>(C.expenses).find({}).toArray();
  const monthlyInflow = branches.reduce((acc, b) => acc + b.mrrRunRate, 0);
  const monthlyOutflow = expenses.reduce((acc, e) => acc + e.amount, 0);
  const riskCycle = ['low', 'medium', 'high', 'medium'] as const;
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() + i * 86400000);
    const dip = i % 7 === 6;
    const inflow = Math.round((monthlyInflow / 30) * (dip ? 0.72 : 1));
    const outflow = Math.round((monthlyOutflow / 30) * (i % 5 === 4 ? 1.4 : 1));
    return {
      date: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      expectedInflow: inflow,
      expectedOutflow: outflow,
      netLiquidity: inflow - outflow,
      churnRisk: riskCycle[i % riskCycle.length],
    };
  });
}

async function getGSTInvoices(): Promise<GSTInvoice[]> {
  return col<GSTInvoice>(C.gstInvoices).find({}).sort({ date: -1 }).toArray();
}

// ---------- Business ----------

async function getBusinessSummary(): Promise<BusinessSummary> {
  const branches = await col<BranchAnalytics>(C.branchAnalytics).find({}).toArray();
  const trainers = await col<GymTrainer>(C.trainers).find({}).toArray();
  const sales = await col<PosSale>(C.posSales).find({}).toArray();
  const expenses = await col<GymExpense>(C.expenses).find({}).toArray();
  const leads = await col<GymLead>(C.leads).find({}).toArray();
  const equipment = await col<EquipmentItem>(C.equipment).find({}).toArray();

  const membershipRevenue = branches.reduce((acc, b) => acc + b.mrrRunRate, 0);
  const ptRevenue = trainers.reduce((acc, t) => acc + t.ptRevenue, 0);
  const posRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalRevenue = membershipRevenue + ptRevenue + posRevenue;
  const netProfit = totalRevenue - totalExpenses;
  const totalLeads = leads.length;
  const activeLeads = leads.filter((l) => l.status !== 'converted' && l.status !== 'lost').length;
  const converted = leads.filter((l) => l.status === 'converted').length;
  const equipmentTotal = equipment.length;
  const equipmentOperational = equipment.filter((e) => e.status === 'operational').length;

  return {
    totalRevenue,
    membershipRevenue,
    ptRevenue,
    posRevenue,
    totalExpenses,
    netProfit,
    operatingMarginPercent: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0,
    totalLeads,
    activeLeads,
    leadConversionRate: totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0,
    activeTrainersCount: trainers.length,
    trainersOnFloorCount: trainers.filter((t) => t.status === 'on_floor' || t.status === 'in_session').length,
    equipmentTotal,
    equipmentOperationalCount: equipmentOperational,
    equipmentIssueCount: equipmentTotal - equipmentOperational,
  };
}

async function getLeads(filters: { status?: string; search?: string } = {}): Promise<GymLead[]> {
  const query: Filter<GymLead> = {};
  if (filters.status) query.status = filters.status as any;
  if (filters.search) {
    const safe = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { phone: { $regex: safe, $options: 'i' } },
      { fitnessGoal: { $regex: safe, $options: 'i' } },
    ];
  }
  return col<GymLead>(C.leads).find(query).sort({ createdAt: -1 }).toArray();
}

async function createLead(input: Partial<GymLead>): Promise<GymLead> {
  leadSeq += 1;
  const lead: GymLead = {
    id: `lead-${leadSeq}`,
    name: input.name || 'New Lead',
    phone: input.phone || '',
    fitnessGoal: input.fitnessGoal || 'General fitness',
    source: input.source || 'Walk-in',
    status: input.status || 'new',
    trialDate: input.trialDate,
    assignedTrainer: input.assignedTrainer,
    budget: input.budget,
    notes: input.notes,
    createdAt: today(),
  };
  await col<GymLead>(C.leads).insertOne({ ...lead });
  return lead;
}

async function updateLead(id: string, patch: Partial<GymLead>): Promise<GymLead | null> {
  await col<GymLead>(C.leads).updateOne({ id }, { $set: clean(patch) });
  return col<GymLead>(C.leads).findOne({ id });
}

async function convertLeadToMember(id: string, body: Partial<Member> = {}) {
  const lead = await col<GymLead>(C.leads).findOne({ id });
  if (!lead) return null;
  await col<GymLead>(C.leads).updateOne({ id }, { $set: { status: 'converted' } });
  const member = await createMember({
    name: body.name || lead.name,
    phone: body.phone || lead.phone,
    plan: body.plan || 'Monthly',
    branch: body.branch || 'Jatra Branch',
    locker: body.locker,
    ltv: body.ltv || (lead.budget || 2500) * 6,
  });
  return { lead: { ...lead, status: 'converted' as const }, member };
}

// ---------- Trainers ----------

async function getTrainers(): Promise<GymTrainer[]> {
  return col<GymTrainer>(C.trainers).find({}).toArray();
}

async function updateTrainerStatus(id: string, status: string): Promise<GymTrainer | null> {
  await col<GymTrainer>(C.trainers).updateOne(
    { id },
    { $set: { status: status as GymTrainer['status'] } }
  );
  return col<GymTrainer>(C.trainers).findOne({ id });
}

async function logTrainerSession(id: string): Promise<GymTrainer | null> {
  const trainer = await col<GymTrainer>(C.trainers).findOne({ id });
  if (!trainer) return null;
  await col<GymTrainer>(C.trainers).updateOne(
    { id },
    { $set: { monthlySessionsCompleted: trainer.monthlySessionsCompleted + 1, status: 'on_floor' } }
  );
  return col<GymTrainer>(C.trainers).findOne({ id });
}

// ---------- Equipment ----------

async function getEquipment(): Promise<EquipmentItem[]> {
  return col<EquipmentItem>(C.equipment).find({}).toArray();
}

async function createEquipment(input: Partial<EquipmentItem>): Promise<EquipmentItem> {
  const item: EquipmentItem = {
    id: `eq-${Date.now()}`,
    name: input.name || 'Equipment',
    category: input.category || 'Strength',
    brand: input.brand || 'Unknown',
    status: input.status || 'operational',
    location: input.location || 'Adgaon Branch',
    lastServiceDate: input.lastServiceDate || today(),
    nextServiceDate: input.nextServiceDate || today(),
    vendorName: input.vendorName || 'Internal',
    vendorPhone: input.vendorPhone || '',
    issueNotes: input.issueNotes,
  };
  await col<EquipmentItem>(C.equipment).insertOne({ ...item });
  return item;
}

async function updateEquipment(id: string, patch: Partial<EquipmentItem>): Promise<EquipmentItem | null> {
  await col<EquipmentItem>(C.equipment).updateOne({ id }, { $set: clean(patch) });
  return col<EquipmentItem>(C.equipment).findOne({ id });
}

// ---------- Expenses ----------

async function getExpenses(category?: string): Promise<GymExpense[]> {
  const query: Filter<GymExpense> = {};
  if (category) query.category = category as any;
  return col<GymExpense>(C.expenses).find(query).sort({ date: -1 }).toArray();
}

async function createExpense(input: Partial<GymExpense>): Promise<GymExpense> {
  const expense: GymExpense = {
    id: `exp-${Date.now()}`,
    title: input.title || 'Expense',
    category: input.category || 'Miscellaneous',
    amount: Number(input.amount) || 0,
    date: input.date || today(),
    paymentMode: input.paymentMode || 'UPI',
    paidTo: input.paidTo || '',
    invoiceRef: input.invoiceRef,
    status: input.status || 'paid',
  };
  await col<GymExpense>(C.expenses).insertOne({ ...expense });
  return expense;
}

// ---------- POS ----------

async function getPosProducts(): Promise<PosProduct[]> {
  return col<PosProduct>(C.posProducts).find({}).toArray();
}

async function getPosSales(): Promise<PosSale[]> {
  return col<PosSale>(C.posSales).find({}).sort({ timestamp: -1 }).toArray();
}

async function recordPosSale(input: Partial<PosSale>): Promise<PosSale | undefined> {
  const product = await col<PosProduct>(C.posProducts).findOne({ id: input.productId });
  if (!product) return undefined;
  const qty = Number(input.quantity) || 1;
  if (product.stock < qty) return undefined;
  await col<PosProduct>(C.posProducts).updateOne({ id: product.id }, { $set: { stock: product.stock - qty } });
  saleSeq += 1;
  const sale: PosSale = {
    id: `sale-${saleSeq}`,
    productId: product.id,
    productName: product.name,
    quantity: qty,
    totalAmount: product.price * qty,
    paymentMethod: input.paymentMethod || 'UPI',
    customerName: input.customerName,
    timestamp: nowIso(),
  };
  await col<PosSale>(C.posSales).insertOne({ ...sale });
  return sale;
}

// ---------- Automations ----------

async function getAutomationLogs(): Promise<AutomationLog[]> {
  return col<AutomationLog>(C.automationLogs).find({}).sort({ timestamp: -1 }).toArray();
}

async function getAutomationConfig(): Promise<AutomationConfig> {
  return col<AutomationConfig>(C.automationConfig).findOne({}) as Promise<AutomationConfig>;
}

async function updateAutomationConfig(patch: Partial<AutomationConfig>): Promise<AutomationConfig> {
  const existing = await col<AutomationConfig>(C.automationConfig).findOne({});
  const merged: AutomationConfig = { ...DEFAULT_AUTOMATION_CONFIG, ...existing, ...patch };
  await col<AutomationConfig>(C.automationConfig).replaceOne(
    existing ? { _id: (existing as any)._id } : {},
    merged,
    { upsert: true }
  );
  return merged;
}

async function addAutomationLog(input: Partial<AutomationLog>): Promise<AutomationLog> {
  logSeq += 1;
  const log: AutomationLog = {
    id: `log-${logSeq}`,
    athleteId: input.athleteId || '',
    athleteName: input.athleteName || 'Athlete',
    phone: input.phone || '',
    avatar: input.avatar,
    triggerType: input.triggerType || 'MANUAL_DISPATCH',
    triggerLabel: input.triggerLabel || 'Instant WhatsApp Dispatch',
    daysRemaining: input.daysRemaining ?? 3,
    channel: 'WhatsApp Cloud API',
    message: input.message || '',
    status: input.status || 'delivered',
    timestamp: input.timestamp || nowIso(),
    metadata: input.metadata,
  };
  await col<AutomationLog>(C.automationLogs).insertOne({ ...log });
  return log;
}

function composeMessage(tpl: string, member: Pick<Member, 'name' | 'plan' | 'daysRemaining' | 'amountDue'>, amount: number): string {
  return tpl
    .replace(/{name}/g, member.name)
    .replace(/{plan}/g, member.plan)
    .replace(/{days}/g, String(member.daysRemaining ?? 0))
    .replace(/{amount}/g, String(amount))
    .replace(/{upiLink}/g, upiLinkFor(amount, member.plan));
}

async function sendRenewalAndLog(
  member: Member,
  triggerType: AutomationTrigger,
  triggerLabel: string,
  tpl: string
): Promise<{ log: AutomationLog; result: SendResult }> {
  const amount = member.amountDue || 2500;
  const msg = composeMessage(tpl, member, amount);
  const templateName = whatsapp.templateNameForTrigger(triggerType);

  const result = await whatsapp.sendRenewal(member.phone, {
    name: member.name,
    plan: member.plan,
    amount,
    days: member.daysRemaining ?? 0,
  }, templateName);

  const status: AutomationLog['status'] =
    result.mode === 'live' ? (result.status === 'failed' ? 'failed' : 'delivered') : 'sent';
  const message = result.mode === 'simulated'
    ? `${msg}\n\n[Simulated — no WHATSAPP_ACCESS_TOKEN. Open: ${result.whatsappUrl}]`
    : `${msg}\n\n[Graph API → ${status === 'failed' ? 'FAILED: ' + result.error : 'delivered'}]`;

  const log = await addAutomationLog({
    athleteId: member.id,
    athleteName: member.name,
    phone: member.phone,
    avatar: member.avatar,
    triggerType,
    triggerLabel,
    daysRemaining: member.daysRemaining ?? 0,
    message,
    status,
    metadata: {
      plan: member.plan,
      amount,
      upiLinkGenerated: true,
      lockerNumber: member.locker,
      ...(result.messageId ? ({ whatsappMessageId: result.messageId } as any) : {}),
    },
  });
  return { log, result };
}

async function runAutomationCron(): Promise<{
  dispatched: number;
  logs: AutomationLog[];
  message: string;
  nextRun: string;
  mode: 'live' | 'simulated';
}> {
  const cfg = await getAutomationConfig();
  const rules = [
    { enabled: cfg.enabled7Days, days: 7, type: '7_DAYS_BEFORE', label: 'T-7 · Pass Expiry', tpl: cfg.template7Days },
    { enabled: cfg.enabled3Days, days: 3, type: '3_DAYS_BEFORE', label: 'T-3 · Pass Expiry', tpl: cfg.template3Days },
    { enabled: cfg.enabled1Day, days: 1, type: '1_DAY_BEFORE', label: 'T-1 · Pass Expiry', tpl: cfg.template1Day },
  ] as const;

  const logs: AutomationLog[] = [];
  for (const rule of rules) {
    if (!rule.enabled) continue;
    const targets = await col<Member>(C.members).find({ status: 'expiring' }).toArray();
    for (const member of targets) {
      if ((member.daysRemaining ?? 99) !== rule.days) continue;
      const already = await col<AutomationLog>(C.automationLogs).findOne({
        athleteId: member.id,
        triggerType: rule.type,
      });
      if (already) continue;
      const { log } = await sendRenewalAndLog(member, rule.type, rule.label, rule.tpl);
      logs.push(log);
    }
  }
  return {
    dispatched: logs.length,
    logs,
    message: logs.length
      ? `Dispatched ${logs.length} WhatsApp renewal reminder(s)`
      : 'No pending athlete matches current (7d / 3d / 1d) trigger rules',
    nextRun: `Next cycle @ ${cfg.autoDispatchTime} (or next scheduler tick)`,
    mode: whatsapp.status().mode,
  };
}

async function createDummyTestMember(input: Partial<Member> = {}): Promise<Member> {
  const TEST_ID = 'mem-auto-test';
  const base = {
    name: input.name || 'Test Athlete (Automation)',
    phone: input.phone || process.env.WHATSAPP_RECIPIENT_PHONE || '+91 98765 43210',
    plan: input.plan || 'Monthly Pro Pass',
    branch: input.branch || 'Adgaon Branch',
    status: 'expiring' as const,
    statusLabel: 'TEST · RENEWAL DUE',
    amountDue: Number(input.amountDue) || 2500,
    lastActive: 'Just now (auto-test)',
    isCheckedIn: false,
    ltv: 2500,
    attendanceCount: 1,
    joinedDate: today(),
    daysRemaining: 1,
    membershipEndDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  };
  const existing = await col<Member>(C.members).findOne({ id: TEST_ID });
  if (existing) {
    await col<Member>(C.members).updateOne(
      { id: TEST_ID },
      { $set: clean({ ...base } as any) }
    );
    return col<Member>(C.members).findOne({ id: TEST_ID }) as Promise<Member>;
  }
  const member: Member = { id: TEST_ID, ...base };
  await col<Member>(C.members).insertOne({ ...member });
  return member;
}

async function dispatchTestRenewal(input: Partial<Member> = {}) {
  const member = await createDummyTestMember(input);
  const cfg = await getAutomationConfig();
  const { log, result } = await sendRenewalAndLog(
    member,
    'MANUAL_DISPATCH',
    'Sample Test Dispatch · Real-Time',
    cfg.template1Day
  );
  return { member, log, result };
}

async function sendManualDispatch(input: {
  athleteId?: string;
  athleteName: string;
  phone: string;
  plan?: string;
  amount?: number;
  message?: string;
  triggerType?: AutomationTrigger;
  triggerLabel?: string;
  daysRemaining?: number;
}) {
  const memberLike: Member = {
    id: input.athleteId || `mem-${Date.now()}`,
    name: input.athleteName,
    phone: input.phone,
    plan: input.plan || 'Active Pass',
    branch: 'Jatra Branch',
    status: 'expiring',
    lastActive: 'Just now (manual dispatch)',
    amountDue: Number(input.amount) || 2500,
    daysRemaining: input.daysRemaining ?? 3,
    isCheckedIn: false,
    ltv: 0,
  };
  const cfg = await getAutomationConfig();
  const tpl = input.message || (input.triggerType === '1_DAY_BEFORE' ? cfg.template1Day : cfg.template7Days);
  return sendRenewalAndLog(
    memberLike,
    input.triggerType || 'MANUAL_DISPATCH',
    input.triggerLabel || 'Instant WhatsApp Dispatch',
    tpl
  );
}

// ---------- Reset ----------

async function resetDB(): Promise<PersistableDB> {
  await Promise.all(
    Object.values(C).map((name) =>
      col(name).drop().catch(() => null)
    )
  );
  await ensureSeed();
  await initCounters();
  return seedDB();
}

// ---------- Seed data ----------

function seedDB(): PersistableDB {
  const members: Member[] = [
    {
      id: 'mem-1',
      name: 'Rohit Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      plan: 'Annual Gold',
      branch: 'Jatra Branch',
      status: 'active',
      lastActive: 'Today, 7:15 AM',
      locker: 'Locker #42',
      phone: '+91 98201 44521',
      isCheckedIn: true,
      ltv: 28000,
      attendanceCount: 24,
      lastHeartRate: 138,
      avgKcal: 486,
      joinedDate: '2025-03-14',
      daysRemaining: 184,
      membershipEndDate: '2027-03-13',
    },
    {
      id: 'mem-2',
      name: 'Pooja Hegde',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      statusLabel: '3D LEFT',
      plan: 'Monthly Strength',
      branch: 'Jatra Branch',
      status: 'expiring',
      amountDue: 1500,
      lastActive: 'Yesterday, 6:30 PM',
      phone: '+91 98112 33419',
      isCheckedIn: false,
      ltv: 9500,
      attendanceCount: 11,
      avgKcal: 412,
      joinedDate: '2025-01-06',
      daysRemaining: 3,
      membershipEndDate: '2026-09-15',
    },
    {
      id: 'mem-3',
      name: 'Kabir Mehta',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      plan: 'CrossFit Pro',
      branch: 'Adgaon Branch',
      status: 'active',
      lastActive: '4 days ago',
      phone: '+91 99304 88120',
      isCheckedIn: false,
      ltv: 18500,
      attendanceCount: 19,
      lastHeartRate: 154,
      avgKcal: 610,
      joinedDate: '2025-07-01',
      daysRemaining: 68,
      membershipEndDate: '2026-11-19',
    },
    {
      id: 'mem-4',
      name: 'Simran Kaur',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      statusLabel: '-2D',
      plan: 'Quarterly Pass',
      branch: 'Jatra Branch',
      status: 'expired',
      amountDue: 3950,
      lastActive: 'Lapsed 2d',
      phone: '+91 97110 55678',
      isCheckedIn: false,
      ltv: 11850,
      joinedDate: '2025-02-11',
      daysRemaining: 0,
      membershipEndDate: '2026-09-10',
    },
    {
      id: 'mem-5',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      plan: 'Annual Elite',
      branch: 'Jatra Branch',
      status: 'expired',
      amountDue: 24000,
      lastActive: 'Expired 4h ago',
      phone: '+91 98334 11290',
      isCheckedIn: false,
      ltv: 48000,
      joinedDate: '2024-09-18',
      daysRemaining: 0,
      membershipEndDate: '2026-09-11',
    },
    {
      id: 'mem-6',
      name: 'Rohan Mehta',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      plan: 'Monthly Hypertrophy',
      branch: 'Jatra Branch',
      status: 'expiring',
      amountDue: 4200,
      lastActive: 'Ends 11:59 PM',
      phone: '+91 98205 77612',
      isCheckedIn: false,
      ltv: 12600,
      attendanceCount: 8,
      joinedDate: '2025-05-22',
      daysRemaining: 1,
      membershipEndDate: '2026-09-13',
    },
    {
      id: 'mem-7',
      name: 'Aman Verma',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      plan: 'Quarterly Pro Plan',
      branch: 'Jatra Branch',
      status: 'active',
      lastActive: '2m ago',
      phone: '+91 98199 44321',
      isCheckedIn: true,
      ltv: 15000,
      attendanceCount: 31,
      avgKcal: 458,
      joinedDate: '2025-06-02',
      daysRemaining: 52,
      membershipEndDate: '2026-11-03',
    },
    {
      id: 'mem-8',
      name: 'Vikram Malhotra',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      statusLabel: 'Tomorrow',
      plan: 'Monthly Pro Pass',
      branch: 'Adgaon Branch',
      status: 'expiring',
      amountDue: 2500,
      lastActive: 'Today, 8:00 AM',
      phone: '+91 98900 12345',
      isCheckedIn: true,
      ltv: 17500,
      attendanceCount: 16,
      joinedDate: '2025-08-19',
      daysRemaining: 1,
      membershipEndDate: '2026-09-13',
    },
    {
      id: 'mem-9',
      name: 'Ananya Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      statusLabel: 'Overdue 2d',
      plan: 'Quarterly Elite',
      branch: 'Adgaon Branch',
      status: 'expired',
      amountDue: 4800,
      lastActive: '2 days ago',
      phone: '+91 97654 32109',
      isCheckedIn: false,
      ltv: 19200,
      joinedDate: '2025-04-10',
      daysRemaining: 0,
      membershipEndDate: '2026-09-10',
    },
    {
      id: 'mem-10',
      name: 'Devendra Patel',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      statusLabel: 'In 5 days',
      plan: 'Student Pass',
      branch: 'Adgaon Branch',
      status: 'expiring',
      amountDue: 1500,
      lastActive: 'Yesterday',
      phone: '+91 98450 67890',
      isCheckedIn: false,
      ltv: 6000,
      joinedDate: '2026-01-05',
      daysRemaining: 5,
      membershipEndDate: '2026-09-17',
    },
    {
      id: 'mem-11',
      name: 'Karan Johar',
      plan: 'Annual Executive',
      branch: 'Adgaon Branch',
      status: 'expiring',
      amountDue: 8500,
      lastActive: 'Today, 6:40 AM',
      phone: '+91 98200 99881',
      isCheckedIn: false,
      ltv: 14500,
      joinedDate: '2025-08-15',
      daysRemaining: 7,
      membershipEndDate: '2026-09-19',
    },
  ];

  const billingItems: BillingItem[] = [
    {
      id: 'bill-1',
      memberId: 'mem-8',
      memberName: 'Vikram Malhotra',
      amount: 2500,
      plan: 'Monthly Pro Pass',
      dueLabel: 'Tomorrow',
      dueType: 'tomorrow',
      phone: '+91 98900 12345',
      status: 'pending',
    },
    {
      id: 'bill-2',
      memberId: 'mem-6',
      memberName: 'Rohan Mehta',
      amount: 4200,
      plan: 'Monthly Hypertrophy',
      dueLabel: 'Overdue 1d',
      dueType: 'overdue',
      phone: '+91 98205 77612',
      status: 'pending',
    },
    {
      id: 'bill-3',
      memberId: 'mem-10',
      memberName: 'Devendra Patel',
      amount: 1500,
      plan: 'Student Pass',
      dueLabel: 'In 5 days',
      dueType: 'upcoming',
      phone: '+91 98450 67890',
      status: 'pending',
    },
    {
      id: 'bill-4',
      memberId: 'mem-2',
      memberName: 'Pooja Hegde',
      amount: 1500,
      plan: 'Monthly Strength',
      dueLabel: 'In 3 days',
      dueType: 'upcoming',
      phone: '+91 98112 33419',
      status: 'pending',
    },
    {
      id: 'bill-5',
      memberId: 'mem-4',
      memberName: 'Simran Kaur',
      amount: 3950,
      plan: 'Quarterly Pass',
      dueLabel: 'Overdue 2d',
      dueType: 'overdue',
      phone: '+91 97110 55678',
      status: 'pending',
    },
    {
      id: 'bill-6',
      memberId: 'mem-9',
      memberName: 'Ananya Deshmukh',
      amount: 4800,
      plan: 'Quarterly Elite',
      dueLabel: 'Overdue 2d',
      dueType: 'overdue',
      phone: '+91 97654 32109',
      status: 'pending',
    },
  ];

  const branchAnalytics: BranchAnalytics[] = [
    {
      id: 'br-adgaon',
      name: 'Adgaon Branch',
      tagline: 'Primary facility · strength & conditioning hub',
      badge: 'L1 LEADER',
      activeCount: 118,
      mrrRunRate: 88500,
      footfallPerDay: 76,
      capacityUtilization: 88,
      maxCapacity: 135,
      capacityBand: 'Peak',
    },
    {
      id: 'br-jatra',
      name: 'Jatra Branch',
      tagline: 'Secondary facility · boutique studio',
      badge: '+12% WoW',
      activeCount: 82,
      mrrRunRate: 64000,
      footfallPerDay: 54,
      capacityUtilization: 67,
      maxCapacity: 115,
      capacityBand: 'Near Peak',
    },
  ];

  const leads: GymLead[] = [
    {
      id: 'lead-1',
      name: 'Sahil Gupta',
      phone: '+91 98111 20200',
      fitnessGoal: 'Weight loss · 8kg',
      source: 'Instagram',
      status: 'trial_booked',
      trialDate: '2026-09-15',
      assignedTrainer: 'Arjun Khanna',
      budget: 2500,
      notes: 'Prefers morning batch',
      createdAt: '2026-09-08',
    },
    {
      id: 'lead-2',
      name: 'Neha Joshi',
      phone: '+91 98220 33455',
      fitnessGoal: 'Muscle gain',
      source: 'Referral',
      status: 'follow_up',
      assignedTrainer: 'Meera Nair',
      budget: 1500,
      notes: 'Ask about couple plan',
      createdAt: '2026-09-06',
    },
    {
      id: 'lead-3',
      name: 'Akash Bansal',
      phone: '+91 98204 55678',
      fitnessGoal: 'CrossFit prep',
      source: 'Google Maps',
      status: 'new',
      createdAt: '2026-09-11',
    },
    {
      id: 'lead-4',
      name: 'Tanvi Shah',
      phone: '+91 97100 88990',
      fitnessGoal: 'Rehab strength',
      source: 'Walk-in',
      status: 'trial_booked',
      trialDate: '2026-09-14',
      assignedTrainer: 'Meera Nair',
      budget: 3000,
      createdAt: '2026-09-10',
    },
    {
      id: 'lead-5',
      name: 'Ravi Patil',
      phone: '+91 97777 11223',
      fitnessGoal: 'General fitness',
      source: 'Flyer / Event',
      status: 'lost',
      notes: 'Budget mismatch',
      createdAt: '2026-09-01',
    },
  ];

  const trainers: GymTrainer[] = [
    {
      id: 'tr-1',
      name: 'Arjun Khanna',
      role: 'Head Coach · Strength & Conditioning',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      status: 'in_session',
      ptClientsCount: 14,
      monthlySessionsCompleted: 58,
      monthlyTarget: 80,
      ptRevenue: 64500,
      commissionRate: 20,
      commissionEarned: 12900,
      specialization: ['Powerlifting', 'CrossFit', 'Hypertrophy'],
      shiftHours: '6:30 AM – 2:30 PM',
    },
    {
      id: 'tr-2',
      name: 'Meera Nair',
      role: 'Senior Coach · Nutrition & Conditioning',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98100 22110',
      status: 'on_floor',
      ptClientsCount: 11,
      monthlySessionsCompleted: 44,
      monthlyTarget: 70,
      ptRevenue: 49750,
      commissionRate: 18,
      commissionEarned: 8955,
      specialization: ['Fat loss', 'Rehab', 'Nutrition'],
      shiftHours: '7:00 AM – 3:00 PM',
    },
    {
      id: 'tr-3',
      name: 'Farhan Ali',
      role: 'Coach · Boxing & HIIT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98665 44339',
      status: 'break',
      ptClientsCount: 8,
      monthlySessionsCompleted: 32,
      monthlyTarget: 60,
      ptRevenue: 31800,
      commissionRate: 15,
      commissionEarned: 4770,
      specialization: ['Boxing', 'HIIT', 'Mobility'],
      shiftHours: '10:00 AM – 6:00 PM',
    },
    {
      id: 'tr-4',
      name: 'Ritu Malhotra',
      role: 'Coach · Yoga & Recovery',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98554 77881',
      status: 'off_duty',
      ptClientsCount: 6,
      monthlySessionsCompleted: 27,
      monthlyTarget: 50,
      ptRevenue: 22100,
      commissionRate: 15,
      commissionEarned: 3315,
      specialization: ['Yoga', 'Recovery', 'Pilates'],
      shiftHours: '3:00 PM – 9:00 PM',
    },
  ];

  const equipment: EquipmentItem[] = [
    {
      id: 'eq-1',
      name: 'Treadmill (Matrix T7x)',
      category: 'Cardio',
      brand: 'Matrix',
      status: 'operational',
      location: 'Adgaon · Zone A',
      lastServiceDate: '2026-08-02',
      nextServiceDate: '2026-11-02',
      vendorName: 'FitnessWorld AMC',
      vendorPhone: '+91 98200 00011',
    },
    {
      id: 'eq-2',
      name: 'Squat Rack (Rogue)',
      category: 'Free Weights',
      brand: 'Rogue',
      status: 'operational',
      location: 'Adgaon · Zone C',
      lastServiceDate: '2026-07-18',
      nextServiceDate: '2026-10-18',
      vendorName: 'Rogue India',
      vendorPhone: '+91 90222 33445',
    },
    {
      id: 'eq-3',
      name: 'Dual Adjustable Pulley',
      category: 'Strength',
      brand: 'Technogym',
      status: 'maintenance_due',
      location: 'Jatra · Zone B',
      lastServiceDate: '2026-06-01',
      nextServiceDate: '2026-09-01',
      vendorName: 'Technogym Care',
      vendorPhone: '+91 98111 55667',
      issueNotes: 'Cable fraying, pulley noisy at high load',
    },
    {
      id: 'eq-4',
      name: 'Air Bike Assault',
      category: 'Cardio',
      brand: 'Assault',
      status: 'out_of_order',
      location: 'Adgaon · HIIT Bay',
      lastServiceDate: '2026-05-20',
      nextServiceDate: '2026-08-20',
      vendorName: 'FitnessWorld AMC',
      vendorPhone: '+91 98200 00011',
      issueNotes: 'Drive belt snapped, awaiting replacement unit',
    },
    {
      id: 'eq-5',
      name: 'HVAC Split Units (3x)',
      category: 'Facility & HVAC',
      brand: 'Voltas',
      status: 'operational',
      location: 'Both facilities',
      lastServiceDate: '2026-08-25',
      nextServiceDate: '2026-11-25',
      vendorName: 'CoolAir Services',
      vendorPhone: '+91 98333 66778',
    },
    {
      id: 'eq-6',
      name: 'Bench Press (Incline/Decline)',
      category: 'Strength',
      brand: 'Technogym',
      status: 'operational',
      location: 'Jatra · Zone B',
      lastServiceDate: '2026-07-30',
      nextServiceDate: '2026-10-30',
      vendorName: 'Technogym Care',
      vendorPhone: '+91 98111 55667',
    },
    {
      id: 'eq-7',
      name: 'Kettlebells Set (8–32kg)',
      category: 'Free Weights',
      brand: 'Kettlebell Kings',
      status: 'operational',
      location: 'Adgaon · Zone C',
      lastServiceDate: '2026-08-10',
      nextServiceDate: '2026-11-10',
      vendorName: 'Rogue India',
      vendorPhone: '+91 90222 33445',
    },
    {
      id: 'eq-8',
      name: 'Rower (Concept2)',
      category: 'Cardio',
      brand: 'Concept2',
      status: 'maintenance_due',
      location: 'Jatra · Zone A',
      lastServiceDate: '2026-06-15',
      nextServiceDate: '2026-09-15',
      vendorName: 'FitnessWorld AMC',
      vendorPhone: '+91 98200 00011',
      issueNotes: 'Chain lubrication + monitor battery',
    },
  ];

  const expenses: GymExpense[] = [
    {
      id: 'exp-1',
      title: 'Rent · Jatra Branch',
      category: 'Rent',
      amount: 18500,
      date: '2026-09-01',
      paymentMode: 'Bank NEFT',
      paidTo: 'Jatra Estate Pvt Ltd',
      status: 'paid',
    },
    {
      id: 'exp-2',
      title: 'Rent · Adgaon Branch',
      category: 'Rent',
      amount: 24000,
      date: '2026-09-01',
      paymentMode: 'Bank NEFT',
      paidTo: 'Adgaon Heights LLP',
      status: 'paid',
    },
    {
      id: 'exp-3',
      title: 'Trainer Payroll · Sep',
      category: 'Trainer Payroll',
      amount: 48000,
      date: '2026-09-05',
      paymentMode: 'Bank NEFT',
      paidTo: '4 Trainers',
      status: 'paid',
    },
    {
      id: 'exp-4',
      title: 'Electricity + HVAC',
      category: 'Electricity & HVAC',
      amount: 12600,
      date: '2026-09-08',
      paymentMode: 'UPI',
      paidTo: 'MSEDCL + CoolAir',
      status: 'paid',
    },
    {
      id: 'exp-5',
      title: 'Supplements Restock',
      category: 'Supplements Restock',
      amount: 8400,
      date: '2026-09-06',
      paymentMode: 'UPI',
      paidTo: 'MuscleBlaze Distributor',
      status: 'paid',
    },
    {
      id: 'exp-6',
      title: 'Equipment AMC Q3',
      category: 'Equipment AMC & Repairs',
      amount: 15000,
      date: '2026-09-10',
      paymentMode: 'Bank NEFT',
      paidTo: 'FitnessWorld AMC',
      invoiceRef: 'AMC-Q3-2026',
      status: 'pending',
    },
    {
      id: 'exp-7',
      title: 'Instagram Performance Ads',
      category: 'Marketing & Ads',
      amount: 6500,
      date: '2026-09-12',
      paymentMode: 'Corporate Card',
      paidTo: 'Meta Ads',
      status: 'paid',
    },
  ];

  const posProducts: PosProduct[] = [
    { id: 'prod-1', name: 'Chocolate Whey Shake', category: 'Protein Shake', price: 350, stock: 42, unit: '500ml' },
    { id: 'prod-2', name: 'Mango Protein Shake', category: 'Protein Shake', price: 320, stock: 28, unit: '500ml' },
    { id: 'prod-3', name: 'C4 Pre-Workout 30g', category: 'Pre-Workout & Energy', price: 90, stock: 15, unit: 'scoop' },
    { id: 'prod-4', name: 'EAA Intra-Workout', category: 'Supplements', price: 120, stock: 60, unit: 'scoop' },
    { id: 'prod-5', name: 'Madabolicx Gym Tee', category: 'Gym Gear', price: 799, stock: 20, unit: 'piece' },
    { id: 'prod-6', name: 'Gripper Lifting Straps', category: 'Gym Gear', price: 449, stock: 12, unit: 'pair' },
  ];

  const gstInvoices: GSTInvoice[] = [
    {
      invoiceNumber: 'GT26-0237',
      date: '2026-08-28',
      athleteName: 'Karan Johar',
      gstin: GSTIN,
      sacCode: SAC_CODE,
      taxableAmount: 3050.85,
      cgst: 274.58,
      sgst: 274.58,
      totalAmount: 3600,
      paymentMethod: 'UPI',
    },
    {
      invoiceNumber: 'GT26-0236',
      date: '2026-08-21',
      athleteName: 'Vikram Malhotra',
      gstin: GSTIN,
      sacCode: SAC_CODE,
      taxableAmount: 3810.17,
      cgst: 342.92,
      sgst: 342.92,
      totalAmount: 4496,
      paymentMethod: 'POS Card',
    },
    {
      invoiceNumber: 'GT26-0235',
      date: '2026-08-15',
      athleteName: 'Ananya Deshmukh',
      gstin: GSTIN,
      sacCode: SAC_CODE,
      taxableAmount: 4237.29,
      cgst: 381.36,
      sgst: 381.36,
      totalAmount: 5000,
      paymentMethod: 'Cash',
    },
    {
      invoiceNumber: 'GT26-0234',
      date: '2026-08-10',
      athleteName: 'Rohit Sharma',
      gstin: GSTIN,
      sacCode: SAC_CODE,
      taxableAmount: 6779.66,
      cgst: 610.17,
      sgst: 610.17,
      totalAmount: 8000,
      paymentMethod: 'UPI',
    },
  ];

  const posSales: PosSale[] = [
    {
      id: 'sale-1',
      productId: 'prod-1',
      productName: 'Chocolate Whey Shake',
      quantity: 2,
      totalAmount: 700,
      paymentMethod: 'UPI',
      customerName: 'Rohit Sharma',
      timestamp: '2026-09-12T07:20:00.000Z',
    },
    {
      id: 'sale-2',
      productId: 'prod-3',
      productName: 'C4 Pre-Workout 30g',
      quantity: 1,
      totalAmount: 90,
      paymentMethod: 'Cash',
      customerName: 'Aman Verma',
      timestamp: '2026-09-12T08:05:00.000Z',
    },
    {
      id: 'sale-3',
      productId: 'prod-5',
      productName: 'Madabolicx Gym Tee',
      quantity: 1,
      totalAmount: 799,
      paymentMethod: 'UPI',
      customerName: 'Pooja Hegde',
      timestamp: '2026-09-11T18:30:00.000Z',
    },
  ];

  const automationConfig: AutomationConfig = { ...DEFAULT_AUTOMATION_CONFIG };

  const automationLogs: AutomationLog[] = [
    {
      id: 'log-501',
      athleteId: 'mem-2',
      athleteName: 'Pooja Hegde',
      phone: '+91 98112 33419',
      triggerType: '3_DAYS_BEFORE',
      triggerLabel: 'T-3 · Pass Expiry',
      daysRemaining: 3,
      channel: 'WhatsApp Cloud API',
      message: 'Hey Pooja Hegde ⚡ 3 days left on your Monthly Strength.',
      status: 'delivered',
      timestamp: '2026-09-12T09:00:00.000Z',
      metadata: { plan: 'Monthly Strength', amount: 1500, upiLinkGenerated: true },
    },
    {
      id: 'log-502',
      athleteId: 'mem-8',
      athleteName: 'Vikram Malhotra',
      phone: '+91 98900 12345',
      triggerType: '1_DAY_BEFORE',
      triggerLabel: 'T-1 · Pass Expiry',
      daysRemaining: 1,
      channel: 'WhatsApp Cloud API',
      message: 'Vikram Malhotra, your Monthly Pro Pass EXPIREs TOMORROW!',
      status: 'read',
      timestamp: '2026-09-12T09:00:00.000Z',
      metadata: { plan: 'Monthly Pro Pass', amount: 2500, upiLinkGenerated: true },
    },
    {
      id: 'log-503',
      athleteId: 'mem-11',
      athleteName: 'Karan Johar',
      phone: '+91 98200 99881',
      triggerType: '7_DAYS_BEFORE',
      triggerLabel: 'T-7 · Pass Expiry',
      daysRemaining: 7,
      channel: 'WhatsApp Cloud API',
      message: 'Hi Karan Johar! 👋 Your Annual Executive at MADABOLICX renews in 7 days.',
      status: 'sent',
      timestamp: '2026-09-12T09:00:00.000Z',
      metadata: { plan: 'Annual Executive', amount: 8500, upiLinkGenerated: true },
    },
  ];

  return {
    members,
    billingItems,
    branchAnalytics,
    gstInvoices,
    automationLogs,
    automationConfig,
    leads,
    trainers,
    equipment,
    expenses,
    posProducts,
    posSales,
  };
}

export const db = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  toggleCheckIn,
  renewMember,
  getBillingItems,
  settleBillingForMember,
  recordPayment,
  getOverviewAnalytics,
  getBranchAnalytics,
  getLiquidityForecast,
  getGSTInvoices,
  getBusinessSummary,
  getLeads,
  createLead,
  updateLead,
  convertLeadToMember,
  getTrainers,
  updateTrainerStatus,
  logTrainerSession,
  getEquipment,
  createEquipment,
  updateEquipment,
  getExpenses,
  createExpense,
  getPosProducts,
  getPosSales,
  recordPosSale,
  getAutomationLogs,
  getAutomationConfig,
  updateAutomationConfig,
  addAutomationLog,
  runAutomationCron,
  createDummyTestMember,
  dispatchTestRenewal,
  sendManualDispatch,
  resetDB,
};

export { disconnectDB };