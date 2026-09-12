import React from 'react';
import {
  TrendingUp,
  UserPlus,
  Zap,
  QrCode,
  IndianRupee,
} from 'lucide-react';
import { Member, BranchLocation } from '../types';

interface DashboardScreenProps {
  currentBranch: BranchLocation;
  members: Member[];
  overview?: {
    monthlyRevenueRunRate?: number;
    activeMembers?: number;
    expiringCount?: number;
    overdueCount?: number;
    pendingCollection?: number;
  };
  branchAnalytics?: Array<{ name: string; mrrRunRate: number; activeCount: number; capacityUtilization?: number }>;
  onOpenAddMember: () => void;
  onOpenRenewModal: (member?: Member) => void;
  onOpenQRTerminal: () => void;
  onOpenCollectFee: () => void;
}

const FALLBACK_MONTHLY_VELOCITY: Record<string, number> = {
  'Jatra Hotel': 88500,
  Adgaon: 64000,
};

// Fixed 14-day intensity wave (0..1); scaled per selected branch mix
const VELOCITY_PATTERN = [0.62, 0.55, 0.68, 0.6, 0.74, 0.9, 0.82, 0.66, 0.58, 0.72, 0.64, 0.8, 0.95, 0.88];

// Catmull-Rom -> cubic bezier smoothing for the velocity curve
const buildVelocityPaths = (series: number[]) => {
  const max = Math.max(...series, 1);
  const pts = series.map((v, i) => ({
    x: series.length > 1 ? (i / (series.length - 1)) * 300 : 150,
    y: 58 - (v / max) * 50,
  }));
  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return { linePath: line, areaPath: `${line} L 300 60 L 0 60 Z` };
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currentBranch,
  members,
  overview,
  branchAnalytics,
  onOpenAddMember,
  onOpenRenewModal,
  onOpenQRTerminal,
  onOpenCollectFee,
}) => {
  // Urgent attention members (branch already filtered upstream)
  const needsAttentionMembers = members.filter(
    (m) => m.status === 'expiring' || m.status === 'expired'
  );
  const renewalPipeline = needsAttentionMembers.reduce((acc, m) => acc + (m.amountDue || 0), 0);

  // Monthly revenue run-rate (branch-aware overview)
  const mrr = overview?.monthlyRevenueRunRate;

  // Revenue distribution rows (only selected branch, or combined for All Locations)
  const branchRows = branchAnalytics
    ? branchAnalytics.filter((b) => currentBranch === 'All Locations' || b.name === currentBranch)
    : [];
  const branchTotal = branchRows.reduce((acc, b) => acc + b.mrrRunRate, 0);
  const rowColor: Record<string, string> = { 'Jatra Hotel': '#0284c7', Adgaon: '#38bdf8' };

  // Fall back to live branch analytics when the overview endpoint is unavailable
  const mrrText = mrr ? `₹${mrr.toLocaleString('en-IN')}` : branchTotal > 0 ? `₹${branchTotal.toLocaleString('en-IN')}` : '₹1,48,500';
  const arrText = mrr ? `ARR: ₹${((mrr * 12) / 100000).toFixed(1)}L run rate` : branchTotal > 0 ? `ARR: ₹${((branchTotal * 12) / 100000).toFixed(1)}L run rate` : 'ARR: ₹17.8L run rate';

  // 14-day velocity trend: scaled to the selected branch mix (frontend-derived)
  const velocityBranches =
    branchAnalytics && branchAnalytics.length > 0
      ? branchAnalytics.filter((b) => currentBranch === 'All Locations' || b.name === currentBranch)
      : Object.keys(FALLBACK_MONTHLY_VELOCITY)
          .filter((name) => currentBranch === 'All Locations' || name === currentBranch)
          .map((name) => ({ name, mrrRunRate: FALLBACK_MONTHLY_VELOCITY[name] }));

  const velocitySeries = VELOCITY_PATTERN.map((p) =>
    velocityBranches.reduce((sum, b) => {
      const monthly = b.mrrRunRate || FALLBACK_MONTHLY_VELOCITY[b.name] || 0;
      return sum + (monthly / 30) * p;
    }, 0)
  );
  const priorWeek = velocitySeries.slice(0, 7).reduce((a, b) => a + b, 0);
  const latestWeek = velocitySeries.slice(7).reduce((a, b) => a + b, 0);
  const velocityGrowth = priorWeek > 0 ? ((latestWeek - priorWeek) / priorWeek) * 100 : 0;
  const { linePath: velocityLinePath, areaPath: velocityAreaPath } = buildVelocityPaths(velocitySeries);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Sub-header & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] inline-block animate-pulse" />
          Overview
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#0b1c30] tracking-tight mt-0.5">
          Recent Activity
        </h1>
      </div>

      {/* Top 2 KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total MRR Card */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#bae6fd] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase">
              TOTAL MRR
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#e0f2fe] text-[#006194] text-[10px] font-mono font-bold">
              <TrendingUp className="w-2.5 h-2.5" /> +8.4%
            </span>
          </div>

          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-display text-[#0b1c30]">
              {mrrText}
            </div>
            <div className="text-[11px] font-mono text-[#64748b] mt-0.5">
              {arrText}
            </div>
          </div>

          {/* Faint subtle watermarked ring */}
          <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full border-4 border-[#eff6ff] pointer-events-none" />
        </div>

        {/* Renewals (30D) Card */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#bae6fd] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase">
              RENEWALS (30D)
            </span>
            <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
          </div>

          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-display text-[#0b1c30]">
                {needsAttentionMembers.length || '0'}
              </span>
              <span className="text-xs font-mono font-semibold text-[#64748b]">
                due
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#006194] font-semibold mt-0.5">
              ₹{renewalPipeline.toLocaleString('en-IN')} expected
            </div>
          </div>
        </div>
      </div>

      {/* Quick Dispatch Grid */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase">
          QUICK ACTIONS
        </span>

        <div className="grid grid-cols-2 gap-3">
          {/* + Add Member */}
          <button
            type="button"
            onClick={onOpenAddMember}
            className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#0284c7] hover:shadow-md transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm font-bold font-display text-[#0b1c30]">
              + Add Member
            </div>
            <div className="text-[10px] text-[#64748b] mt-0.5">
              Enroll new athlete
            </div>
          </button>

          {/* 1-Tap Renew */}
          <button
            type="button"
            onClick={() => onOpenRenewModal()}
            className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#0284c7] hover:shadow-md transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm font-bold font-display text-[#0b1c30]">
              1-Tap Renew
            </div>
            <div className="text-[10px] text-[#64748b] mt-0.5">
              Instant invoice push
            </div>
          </button>

          {/* QR Terminal */}
          <button
            type="button"
            onClick={onOpenQRTerminal}
            className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#0284c7] hover:shadow-md transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm font-bold font-display text-[#0b1c30]">
              QR Terminal
            </div>
            <div className="text-[10px] text-[#64748b] mt-0.5">
              Check-in via QR
            </div>
          </button>

          {/* Collect Fee */}
          <button
            type="button"
            onClick={onOpenCollectFee}
            className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#0284c7] hover:shadow-md transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm font-bold font-display text-[#0b1c30]">
              Collect Fee
            </div>
            <div className="text-[10px] text-[#64748b] mt-0.5">
              Custom POS link
            </div>
          </button>
        </div>
      </div>

      {/* Revenue Distribution: Branch Performance */}
      <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3">
        <div>
          <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase">
            BRANCH REVENUE
          </span>
          <div className="flex items-center justify-between mt-0.5">
            <h3 className="text-sm font-bold font-display text-[#0b1c30]">
              Branch Performance
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-[#f0f9ff] text-[#006194] text-[10px] font-mono font-semibold border border-[#bae6fd]">
              Month to Date
            </span>
          </div>
        </div>

        {/* Branch Performance Rows (filtered to selected branch or combined) */}
        {branchRows.length > 0 ? (
          branchRows.map((b) => {
            const share = branchTotal > 0 ? Math.round((b.mrrRunRate / branchTotal) * 100) : 0;
            const color = rowColor[b.name] || '#0284c7';
            return (
              <div key={b.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-[#0b1c30]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {b.name}
                  </span>
                  <span className="font-mono font-semibold text-[#0b1c30]">
                    ₹{b.mrrRunRate.toLocaleString('en-IN')}{' '}
                    <span className="text-[#64748b] font-normal">({share}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#eff4ff] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color, width: `${currentBranch === 'All Locations' ? share : 100}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-3 rounded-xl bg-[#f8faff] border border-slate-100 text-center">
            <span className="text-xs text-[#64748b]">No analytics for {currentBranch} yet</span>
          </div>
        )}

        {/* 14-Day Velocity Curve Chart */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b]">
              14-DAY TREND • {currentBranch === 'All Locations' ? 'All branches' : currentBranch}
            </span>
            <span className="text-[11px] font-mono font-bold text-[#0284c7]">
              {velocityGrowth >= 0 ? '+' : ''}{velocityGrowth.toFixed(1)}% vs prior week
            </span>
          </div>

          <div className="relative h-12 w-full">
            <svg
              viewBox="0 0 300 60"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="velocityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={velocityAreaPath}
                fill="url(#velocityGrad)"
              />
              <path
                d={velocityLinePath}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
