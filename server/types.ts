export type BranchLocation = 'Adgaon Branch' | 'Jatra Branch';

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  email?: string;
  address?: string;
  plan: string;
  branch: BranchLocation | string;
  status: 'active' | 'expiring' | 'expired';
  statusLabel?: string;
  lastActive: string;
  phone: string;
  amountDue?: number;
  locker?: string;
  isCheckedIn: boolean;
  ltv: number;
  attendanceCount?: number;
  lastHeartRate?: number;
  avgKcal?: number;
  joinedDate?: string;
  daysRemaining?: number;
  membershipStartDate?: string;
  membershipEndDate?: string;
  overdueDays?: number;
  targetFrequency?: string;
}

export interface BillingItem {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  plan: string;
  dueLabel: string;
  dueType: 'tomorrow' | 'overdue' | 'upcoming';
  phone: string;
  avatar?: string;
  paymentMethod?: 'UPI' | 'Cash' | 'POS Card';
  paidAt?: string;
  status: 'pending' | 'settled';
}

export interface BranchAnalytics {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  activeCount: number;
  mrrRunRate: number;
  footfallPerDay: number;
  capacityUtilization: number;
  maxCapacity: number;
  capacityBand: 'Peak' | 'Near Peak' | 'Optimal';
}

export interface GSTInvoice {
  invoiceNumber: string;
  date: string;
  athleteName: string;
  gstin: string;
  sacCode: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  paymentMethod: string;
}

export interface AutomationLog {
  id: string;
  athleteId: string;
  athleteName: string;
  phone: string;
  avatar?: string;
  triggerType: '7_DAYS_BEFORE' | '3_DAYS_BEFORE' | '1_DAY_BEFORE' | 'MANUAL_DISPATCH';
  triggerLabel: string;
  daysRemaining: number;
  channel: 'WhatsApp Cloud API';
  message: string;
  status: 'delivered' | 'read' | 'sent' | 'failed';
  timestamp: string;
  metadata?: {
    plan: string;
    amount: number;
    upiLinkGenerated?: boolean;
    lockerNumber?: string;
  };
}

export interface AutomationConfig {
  enabled7Days: boolean;
  enabled3Days: boolean;
  enabled1Day: boolean;
  autoDispatchTime: string;
  template7Days: string;
  template3Days: string;
  template1Day: string;
}

export type LeadStatus = 'new' | 'trial_booked' | 'follow_up' | 'converted' | 'lost';
export type LeadSource = 'Walk-in' | 'Instagram' | 'Referral' | 'Google Maps' | 'Flyer / Event';

export interface GymLead {
  id: string;
  name: string;
  phone: string;
  fitnessGoal: string;
  source: LeadSource;
  status: LeadStatus;
  trialDate?: string;
  assignedTrainer?: string;
  budget?: number;
  notes?: string;
  createdAt: string;
}

export type TrainerStatus = 'on_floor' | 'in_session' | 'break' | 'off_duty';

export interface GymTrainer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  status: TrainerStatus;
  ptClientsCount: number;
  monthlySessionsCompleted: number;
  monthlyTarget: number;
  ptRevenue: number;
  commissionRate: number;
  commissionEarned: number;
  specialization: string[];
  shiftHours: string;
}

export type EquipmentStatus = 'operational' | 'maintenance_due' | 'out_of_order';
export type EquipmentCategory = 'Cardio' | 'Strength' | 'Free Weights' | 'Facility & HVAC';

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  status: EquipmentStatus;
  location: string;
  lastServiceDate: string;
  nextServiceDate: string;
  vendorName: string;
  vendorPhone: string;
  issueNotes?: string;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity & HVAC'
  | 'Trainer Payroll'
  | 'Equipment AMC & Repairs'
  | 'Sanitization & Towels'
  | 'Supplements Restock'
  | 'Marketing & Ads'
  | 'Miscellaneous';

export interface GymExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMode: 'Bank NEFT' | 'UPI' | 'Cash' | 'Corporate Card';
  paidTo: string;
  invoiceRef?: string;
  status: 'paid' | 'pending';
}

export interface PosProduct {
  id: string;
  name: string;
  category: 'Protein Shake' | 'Pre-Workout & Energy' | 'Supplements' | 'Gym Gear';
  price: number;
  stock: number;
  unit: string;
  image?: string;
}

export interface PosSale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Cash';
  customerName?: string;
  timestamp: string;
}

export interface BusinessSummary {
  totalRevenue: number;
  membershipRevenue: number;
  ptRevenue: number;
  posRevenue: number;
  totalExpenses: number;
  netProfit: number;
  operatingMarginPercent: number;
  totalLeads: number;
  activeLeads: number;
  leadConversionRate: number;
  activeTrainersCount: number;
  trainersOnFloorCount: number;
  equipmentTotal: number;
  equipmentOperationalCount: number;
  equipmentIssueCount: number;
}

export interface OverviewAnalytics {
  totalMembers: number;
  activeMembers: number;
  expiringCount: number;
  overdueCount: number;
  checkedInNow: number;
  todayCheckins: number;
  pendingCollection: number;
  velocityRate: number;
  settlementSplit: { method: string; percent: number; amount: number }[];
  monthlyRevenueRunRate: number;
  capacityUtilization: number;
}

export interface ForecastDay {
  date: string;
  day: string;
  expectedInflow: number;
  expectedOutflow: number;
  netLiquidity: number;
  churnRisk: 'low' | 'medium' | 'high';
}

export interface PersistableDB {
  members: Member[];
  billingItems: BillingItem[];
  branchAnalytics: BranchAnalytics[];
  gstInvoices: GSTInvoice[];
  automationLogs: AutomationLog[];
  automationConfig: AutomationConfig;
  leads: GymLead[];
  trainers: GymTrainer[];
  equipment: EquipmentItem[];
  expenses: GymExpense[];
  posProducts: PosProduct[];
  posSales: PosSale[];
}