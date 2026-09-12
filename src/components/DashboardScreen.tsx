import React, { useState } from 'react';
import {
  Calendar,
  TrendingUp,
  ChevronRight,
  UserPlus,
  Zap,
  QrCode,
  IndianRupee,
  RefreshCw,
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
  onViewAllMembers: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currentBranch,
  members,
  overview,
  branchAnalytics,
  onOpenAddMember,
  onOpenRenewModal,
  onOpenQRTerminal,
  onOpenCollectFee,
  onViewAllMembers,
}) => {
  const [selectedDate, setSelectedDate] = useState('Today, Oct 24');

  // Urgent attention members (branch already filtered upstream)
  const needsAttentionMembers = members.filter(
    (m) => m.status === 'expiring' || m.status === 'expired'
  );
  const renewalPipeline = needsAttentionMembers.reduce((acc, m) => acc + (m.amountDue || 0), 0);

  // Monthly revenue run-rate (branch-aware overview)
  const mrr = overview?.monthlyRevenueRunRate;
  const mrrText = mrr ? `₹${mrr.toLocaleString('en-IN')}` : '₹1,48,500';
  const arrText = mrr ? `ARR: ₹${((mrr * 12) / 100000).toFixed(1)}L run rate` : 'ARR: ₹17.8L run rate';

  // Revenue distribution rows (only selected branch, or combined for All Locations)
  const branchRows = branchAnalytics
    ? branchAnalytics.filter((b) => currentBranch === 'All Locations' || b.name === currentBranch)
    : [];
  const branchTotal = branchRows.reduce((acc, b) => acc + b.mrrRunRate, 0);
  const rowColor: Record<string, string> = { 'Jatra Hotel': '#0284c7', Adgaon: '#38bdf8' };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Sub-header & Title */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] inline-block animate-pulse" />
            TELEMETRY CORE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#0b1c30] tracking-tight mt-0.5">
            Executive Control
          </h1>
        </div>

        {/* Date Selector Pill */}
        <button
          type="button"
          onClick={() => {
            const next = selectedDate === 'Today, Oct 24' ? 'Live Telemetry' : 'Today, Oct 24';
            setSelectedDate(next);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] shadow-xs text-xs font-semibold text-[#0b1c30] hover:border-[#0284c7] transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-[#0284c7]" />
          <span>{selectedDate}</span>
        </button>
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
              ₹{(renewalPipeline || 38200).toLocaleString('en-IN')} pipeline
            </div>
          </div>
        </div>
      </div>

      {/* Quick Dispatch Grid */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase">
          QUICK DISPATCH
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
              Check-in turnstile
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
            REVENUE DISTRIBUTION
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
              14-DAY VELOCITY
            </span>
            <span className="text-[11px] font-mono font-bold text-[#0284c7]">
              +18.2% vs target
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
                d="M 0 45 C 50 48, 80 32, 120 40 C 160 48, 200 15, 240 22 C 270 28, 290 12, 300 15 L 300 60 L 0 60 Z"
                fill="url(#velocityGrad)"
              />
              <path
                d="M 0 45 C 50 48, 80 32, 120 40 C 160 48, 200 15, 240 22 C 270 28, 290 12, 300 15"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Needs Attention Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-display text-[#0b1c30]">
              Needs Attention
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-[#ba1a1a] border border-[#ffdad6] bg-[#fff5f5]">
              {needsAttentionMembers.length > 0 ? `${needsAttentionMembers.length} Expiring` : 'All Clear'}
            </span>
          </div>

          <button
            type="button"
            onClick={onViewAllMembers}
            className="text-xs font-mono font-semibold text-[#0284c7] hover:underline"
          >
            View All
          </button>
        </div>

        {/* Attention Member Cards */}
        {needsAttentionMembers.map((member) => (
          <div
            key={member.id}
            className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 hover:border-[#bae6fd] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold font-display text-[#0b1c30]">
                    {member.name}
                  </h4>
                  <p className="text-xs text-[#64748b]">
                    {member.plan} • <span className="text-[#ba1a1a] font-medium">{member.lastActive}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm sm:text-base font-bold font-mono text-[#0b1c30]">
                  ₹{member.amountDue?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onOpenRenewModal(member)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0284c7] text-white hover:bg-[#0369a1] font-semibold text-xs transition-all shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Renew Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
