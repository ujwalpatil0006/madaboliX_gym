export type NavigationTab = 'dashboard' | 'members' | 'billing' | 'reports';

export type BranchLocation = 'Downtown Branch' | 'Westside Studio' | 'All Locations';

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  isVerified?: boolean;
  tier?: string; // e.g. 'PRO TIER', 'L1 LEADER'
  plan: string; // e.g. 'Annual Gold', 'Monthly Strength', 'CrossFit Pro', 'Quarterly Pass'
  branch: string;
  status: 'active' | 'expiring' | 'expired' | 'dormant';
  statusLabel?: string; // e.g. '3D LEFT', '-2D', 'TOMORROW'
  lastActive: string; // e.g. 'Today, 7:15 AM', '4 days ago', 'Expired 4h ago'
  locker?: string;
  amountDue?: number;
  phone: string;
  isCheckedIn?: boolean;
  targetFrequency?: string; // e.g. '3x/wk'
  ltv?: number;
  daysRemaining?: number;
  overdueDays?: number;
  membershipEndDate?: string;
}

export interface BillingItem {
  id: string;
  memberId: string;
  memberName: string;
  avatar?: string;
  isVerified?: boolean;
  plan: string;
  amount: number;
  dueLabel: string; // e.g. 'Tomorrow', 'Overdue 2d', 'In 5 days'
  dueType: 'tomorrow' | 'overdue' | 'upcoming' | 'paid';
  options?: {
    months: number;
    amount: number;
    label: string;
  }[];
  phone: string;
}

export interface BranchStat {
  name: string;
  code: string;
  badge: string;
  activeCount: number;
  mrrRunRate: string;
  mrrValue: number;
  footfallDaily: number;
  capacityUtilization: number;
  floorCapacity: number;
  statusBand: string;
  sharePercent: number;
}
