import React, { useState } from 'react';
import {
  TrendingUp,
  Building2,
  Calendar,
  AlertTriangle,
  Phone,
  MessageSquare,
  History,
  BellOff,
  FileText,
  Share2,
  Download,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Clock
} from 'lucide-react';
import { BranchLocation } from '../types';

interface ReportsScreenProps {
  currentBranch: BranchLocation;
  onOpenGSTSummary: () => void;
  onOpenExecutiveSnapshot: () => void;
  onCallAthlete: (name: string, phone: string) => void;
  onWhatsAppAthlete: (name: string, phone: string, plan: string) => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  currentBranch,
  onOpenGSTSummary,
  onOpenExecutiveSnapshot,
  onCallAthlete,
  onWhatsAppAthlete,
}) => {
  const [deltaViewMode, setDeltaViewMode] = useState(false);
  const [timeRange, setTimeRange] = useState<'MTD' | 'QTD' | 'YTD'>('MTD');

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
            TELEMETRY & AUDIT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#0b1c30] tracking-tight mt-0.5">
            Owner Intelligence
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDeltaViewMode(!deltaViewMode)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              deltaViewMode
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'bg-[#eff6ff] text-[#006194] border border-[#bae6fd] hover:bg-[#dbeafe]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Delta View</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const modes: ('MTD' | 'QTD' | 'YTD')[] = ['MTD', 'QTD', 'YTD'];
              const next = modes[(modes.indexOf(timeRange) + 1) % modes.length];
              setTimeRange(next);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-xs font-mono font-semibold text-[#0b1c30] hover:border-[#0284c7]"
          >
            <Calendar className="w-3 h-3 text-[#0284c7]" />
            <span>{timeRange}</span>
          </button>
        </div>
      </div>

      {/* Portfolio Alpha Highlight Card */}
      <div className="p-4 rounded-2xl bg-[#006194] text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono tracking-wider uppercase text-[#cce5ff] font-semibold block">
                PORTFOLIO ALPHA
              </span>
              <h3 className="text-base sm:text-lg font-bold font-display">
                Downtown +35% MRR
              </h3>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-white/20 text-[#fdfcff] text-[10px] font-mono font-bold tracking-wider border border-white/20 shrink-0">
            BENCHMARK LEAD
          </span>
        </div>
      </div>

      {/* Facility Breakdown 1: Downtown Hub */}
      <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 hover:border-[#bae6fd] transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center border border-[#bae6fd]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-[#0b1c30]">
                Downtown Hub
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Flagship Facility
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#006194] text-[10px] font-mono font-bold border border-[#bae6fd]">
            L1 LEADER
          </span>
        </div>

        {/* 3-Col KPI Metrics */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
          <div>
            <div className="text-lg font-bold font-display text-[#0b1c30]">
              112
            </div>
            <div className="text-[9px] font-mono text-[#64748b] uppercase">
              ACTIVE
            </div>
          </div>
          <div>
            <div className="text-lg font-bold font-display text-[#0284c7]">
              ₹88.5k
            </div>
            <div className="text-[9px] font-mono text-[#64748b] uppercase">
              MRR RUN-RATE
            </div>
          </div>
          <div>
            <div className="text-lg font-bold font-display text-[#0b1c30]">
              94<span className="text-xs text-[#64748b] font-normal">/d</span>
            </div>
            <div className="text-[9px] font-mono text-[#64748b] uppercase">
              FOOTFALL
            </div>
          </div>
        </div>

        {/* Capacity Utilization Gauge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-[#64748b] flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#0284c7]" />
              Capacity Utilization
            </span>
            <span className="font-mono font-bold text-[#0284c7]">
              84%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#eff4ff] overflow-hidden">
            <div className="h-full bg-[#0284c7] rounded-full w-[84%]" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
            <span className="text-[#64748b]">
              Floor Cap: 135 pax
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#fff5f5] text-[#ba1a1a] font-semibold border border-[#ffdad6]">
              Near Peak Band (80-95%)
            </span>
          </div>
        </div>
      </div>

      {/* Facility Breakdown 2: Westside Branch */}
      <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 hover:border-[#bae6fd] transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center border border-[#bae6fd]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-[#0b1c30]">
                Westside Branch
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Growth Node
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold border border-slate-200">
            L2 STEADY
          </span>
        </div>

        {/* 3-Col KPI Metrics */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
          <div>
            <div className="text-lg font-bold font-display text-[#0b1c30]">
              72
            </div>
            <div className="text-[9px] font-mono text-[#64748b] uppercase">
              ACTIVE
            </div>
          </div>
          <div>
            <div className="text-lg font-bold font-display text-[#0284c7]">
              ₹60.0k
            </div>
            <div className="text-[9px] font-mono text-[#64748b] uppercase">
              MRR RUN-RATE
            </div>
          </div>
          <div>
            <div className="text-lg font-bold font-display text-[#0b1c30]">
              51<span className="text-xs text-[#64748b] font-normal">/d</span>
            </div>
            <div className="text-[9px] font-mono text-[#64748b] uppercase">
              FOOTFALL
            </div>
          </div>
        </div>

        {/* Capacity Utilization Gauge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-[#64748b] flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#0284c7]" />
              Capacity Utilization
            </span>
            <span className="font-mono font-bold text-[#0284c7]">
              62%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#eff4ff] overflow-hidden">
            <div className="h-full bg-[#38bdf8] rounded-full w-[62%]" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
            <span className="text-[#64748b]">
              Floor Cap: 115 pax
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#eff6ff] text-[#006194] font-semibold border border-[#bae6fd]">
              Optimal Margin Available
            </span>
          </div>
        </div>
      </div>

      {/* 30-Day Liquidity Forecast */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-display text-[#0b1c30]">
            30-Day Liquidity Forecast
          </h3>
          <span className="px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#006194] text-[10px] font-mono font-semibold border border-[#bae6fd]">
            CYCLE: APR-MAY
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Card A: Renewal Pipeline */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#eff6ff] text-[#0284c7] flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#eff6ff] text-[#006194]">
                14 Regs
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748b] block">
                Renewal Pipeline
              </span>
              <div className="text-lg font-bold font-display text-[#0b1c30]">
                ₹38,200
              </div>
              <span className="text-[10px] font-mono text-[#0284c7] font-semibold">
                Est. close <span className="font-bold">89%</span> prob
              </span>
            </div>
          </div>

          {/* Card B: Revenue at Risk */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#ffdad6] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#fee2e2] text-[#ba1a1a] flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#fee2e2] text-[#ba1a1a]">
                5 Dormant
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748b] block">
                Revenue at Risk
              </span>
              <div className="text-lg font-bold font-display text-[#ba1a1a]">
                ₹12,400
              </div>
              <span className="text-[10px] font-mono text-[#ba1a1a]">
                Inactivity <strong className="font-bold">&gt;14 days</strong> abs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Churn Intercepts */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
            <h3 className="text-sm font-bold font-display text-[#0b1c30]">
              Critical Churn Intercepts
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]">
            URGENT
          </span>
        </div>

        {/* Member 1: Karan Johar */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-2.5 hover:border-[#bae6fd] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#e0f2fe] text-[#0284c7] font-display font-bold text-xs flex items-center justify-center ring-2 ring-[#bae6fd]">
                KJ
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold font-display text-[#0b1c30]">
                    Karan Johar
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#eff6ff] text-[#006194]">
                    ANNUAL
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#ef4444] font-mono mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Last active 18 days ago</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold font-mono text-[#0b1c30]">
                ₹14,500
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                LTV Value
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCallAthlete('Karan Johar', '+91 98200 99881')}
              className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#0284c7] text-[#0b1c30] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Call / Re-engage</span>
            </button>

            <button
              type="button"
              onClick={() => alert('Activity history: Enrolled Jan 2024, 48 total workouts, last attended Upper Body Hypertrophy.')}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#0284c7] transition-all"
              title="Attendance History"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Member 2: Rhea Sen */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-2.5 hover:border-[#bae6fd] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#f0fdf4] text-[#15803d] font-display font-bold text-xs flex items-center justify-center ring-2 ring-[#bbf7d0]">
                RS
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold font-display text-[#0b1c30]">
                    Rhea Sen
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#f1f5f9] text-slate-700">
                    3-MONTH
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#ef4444] font-mono mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Last active 15 days ago</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold font-mono text-[#0b1c30]">
                ₹6,800
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                LTV Value
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onWhatsAppAthlete('Rhea Sen', '+91 98111 22334', 'Quarterly Conditioning')}
              className="flex-1 py-2 px-3 rounded-xl bg-[#0284c7] text-white hover:bg-[#0369a1] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Nudge</span>
            </button>

            <button
              type="button"
              onClick={() => alert('Notification muted for 7 days.')}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition-all"
              title="Snooze Nudge"
            >
              <BellOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Export & Compliance Audit */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-display text-[#0b1c30]">
            Export & Compliance Audit
          </h3>
          <span className="px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#006194] text-[10px] font-mono font-bold border border-[#bae6fd]">
            GST READY
          </span>
        </div>

        {/* GST Summary Item */}
        <div
          onClick={onOpenGSTSummary}
          className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center justify-between hover:border-[#0284c7] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#0284c7] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold font-display text-[#0b1c30]">
                Download GST Summary
              </h4>
              <p className="text-[11px] text-[#64748b]">
                B2B & B2C Breakdown • CSV/PDF Auto-archive
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-xl bg-[#f8fafc] group-hover:bg-[#0284c7] group-hover:text-white text-slate-600 flex items-center justify-center transition-colors shrink-0">
            <Download className="w-4 h-4" />
          </div>
        </div>

        {/* Daily Executive Snapshot Item */}
        <div
          onClick={onOpenExecutiveSnapshot}
          className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center justify-between hover:border-[#0284c7] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#0284c7] flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold font-display text-[#0b1c30]">
                Daily Executive Snapshot
              </h4>
              <p className="text-[11px] text-[#64748b]">
                Automate digest to WhatsApp & Stakeholder Group
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-xl bg-[#f8fafc] group-hover:bg-[#0284c7] group-hover:text-white text-slate-600 flex items-center justify-center transition-colors shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Cloud Sync Telemetry Footer */}
      <div className="pt-3 pb-2 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-[#0284c7]">
          <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
          <span>Cloud Sync: 2m ago</span>
        </div>
        <span className="font-bold text-[#006194]">
          100% HEALTH
        </span>
      </div>
    </div>
  );
};
