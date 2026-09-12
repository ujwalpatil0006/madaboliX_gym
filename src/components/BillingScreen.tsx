import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  Send,
  Calendar,
  AlertTriangle,
  QrCode,
  Check,
  Percent,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { BillingItem, Member } from '../types';

interface BillingScreenProps {
  billingItems: BillingItem[];
  onOpenQuickPay: () => void;
  onOpenRenewModal: (memberId?: string, amount?: number, plan?: string) => void;
  onOpenWhatsAppNudge: (phone: string, name: string, amount: number, plan: string) => void;
  onMarkPaid: (itemId: string) => void;
  onSendUPI: (item: BillingItem) => void;
}

export const BillingScreen: React.FC<BillingScreenProps> = ({
  billingItems,
  onOpenQuickPay,
  onOpenRenewModal,
  onOpenWhatsAppNudge,
  onMarkPaid,
  onSendUPI,
}) => {
  const [filterTab, setFilterTab] = useState<'7days' | '30days' | 'paid'>('7days');

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Top Live Telemetry Cycle Close Card */}
      <div className="p-4.5 rounded-2xl bg-white border border-[#bae6fd] shadow-xs space-y-3 relative overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
            LIVE TELEMETRY <span className="text-slate-300">•</span> CYCLE CLOSE
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#006194] text-[10px] font-mono font-semibold border border-[#bae6fd]">
            16 Pending
          </span>
        </div>

        {/* Expected to Collect Metric */}
        <div>
          <span className="text-xs text-[#64748b] font-medium font-sans">
            Total Expected to Collect
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-bold font-display text-[#0b1c30]">
              ₹46,450
            </span>
            <span className="text-xs font-mono text-[#64748b]">
              across 16 accounts
            </span>
          </div>
        </div>

        {/* Collection Velocity Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono font-semibold text-[#0b1c30]">
              Collection Velocity
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#0284c7] font-mono font-bold text-[11px] border border-[#bae6fd]">
              89.2% Paid-Up
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#eff4ff] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#38bdf8] to-[#0284c7] rounded-full w-[89.2%]" />
          </div>

          <p className="text-[10px] text-[#64748b]">
            89.2% of expected revenue collected this cycle
          </p>
        </div>

        {/* Settlement Split Glass Box */}
        <div className="p-3 rounded-xl bg-[#f8faff] border border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#bae6fd] text-[#0284c7] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#64748b] font-semibold block">
                SETTLEMENT SPLIT
              </span>
              <span className="text-xs font-bold font-display text-[#0b1c30]">
                UPI 68% <span className="text-slate-300">•</span> Cash 32%
              </span>
            </div>
          </div>

          {/* Dual Segment Progress Bar */}
          <div className="w-24 h-2 rounded-full bg-[#e2e8f0] overflow-hidden flex">
            <div className="h-full bg-[#0284c7] w-[68%]" />
            <div className="h-full bg-[#38bdf8] w-[32%]" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setFilterTab('7days')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            filterTab === '7days'
              ? 'bg-[#004d6a] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#e2e8f0] hover:border-slate-300'
          }`}
        >
          <span>Due in 7 Days</span>
          <span className={`text-[10px] font-mono px-1.5 rounded-full ${filterTab === '7days' ? 'bg-white/20' : 'bg-slate-100'}`}>
            6
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('30days')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            filterTab === '30days'
              ? 'bg-[#004d6a] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#e2e8f0] hover:border-slate-300'
          }`}
        >
          <span>Due in 30 Days</span>
          <span className={`text-[10px] font-mono px-1.5 rounded-full ${filterTab === '30days' ? 'bg-white/20' : 'bg-slate-100'}`}>
            10
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('paid')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            filterTab === 'paid'
              ? 'bg-[#004d6a] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#e2e8f0] hover:border-slate-300'
          }`}
        >
          <span>Recent / Paid</span>
        </button>
      </div>

      {/* Priority Action Queue Header */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase">
          PRIORITY ACTION QUEUE
        </span>
        <span className="text-xs font-mono font-semibold text-[#0284c7] flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          Quick Dispatch
        </span>
      </div>

      {/* Billing Action Cards */}
      <div className="space-y-3">
        {/* Card 1: Vikram Malhotra */}
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 hover:border-[#bae6fd] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80"
                alt="Vikram Malhotra"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold font-display text-[#0b1c30]">
                    Vikram Malhotra
                  </h4>
                  <CheckCircle className="w-3.5 h-3.5 text-[#0284c7] fill-[#0284c7]/20" />
                </div>
                <p className="text-xs text-[#64748b]">
                  Monthly Pro Pass • <span className="font-mono font-semibold text-[#0b1c30]">₹2,500</span>
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#fffbeb] text-[#b45309] border border-[#fde68a] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Tomorrow
            </span>
          </div>

          {/* 3 Interactive Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenRenewModal('mem-8', 2500, 'Monthly Pro Pass')}
              className="py-2 px-2 rounded-xl bg-[#eff6ff] text-[#006194] border border-[#bae6fd] hover:bg-[#dbeafe] font-semibold text-xs transition-all flex flex-col items-center justify-center leading-tight"
            >
              <span>+1 Mo</span>
              <span className="text-[10px] font-mono opacity-80">₹2.5k</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenRenewModal('mem-8', 6800, 'Quarterly Pro Pass')}
              className="py-2 px-2 rounded-xl bg-[#eff6ff] text-[#006194] border border-[#bae6fd] hover:bg-[#dbeafe] font-semibold text-xs transition-all flex flex-col items-center justify-center leading-tight"
            >
              <span>+3 Mo</span>
              <span className="text-[10px] font-mono opacity-80">₹6.8k</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onSendUPI({
                  id: 'bill-1',
                  memberId: 'mem-8',
                  memberName: 'Vikram Malhotra',
                  amount: 2500,
                  plan: 'Monthly Pro Pass',
                  dueLabel: 'Tomorrow',
                  dueType: 'tomorrow',
                  phone: '+91 98900 12345',
                })
              }
              className="py-2 px-2 rounded-xl bg-[#0284c7] text-white hover:bg-[#0369a1] font-semibold text-xs transition-all flex flex-col items-center justify-center leading-tight shadow-xs"
            >
              <Send className="w-3.5 h-3.5 mb-0.5" />
              <span>Send UPI</span>
            </button>
          </div>
        </div>

        {/* Card 2: Ananya Deshmukh */}
        <div className="p-4 rounded-2xl bg-white border-l-4 border-l-[#ba1a1a] border-[#e2e8f0] shadow-xs space-y-3 hover:border-[#bae6fd] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                alt="Ananya Deshmukh"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div>
                <h4 className="text-sm font-bold font-display text-[#0b1c30]">
                  Ananya Deshmukh
                </h4>
                <p className="text-xs text-[#64748b]">
                  Quarterly Elite • <span className="font-mono font-semibold text-[#0b1c30]">₹4,800</span>
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#fff5f5] text-[#ba1a1a] border border-[#ffdad6] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Overdue 2d
            </span>
          </div>

          {/* 2 Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                onOpenWhatsAppNudge('+91 97654 32109', 'Ananya Deshmukh', 4800, 'Quarterly Elite')
              }
              className="py-2 px-3 rounded-xl bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] hover:bg-[#dcfce7] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Nudge</span>
            </button>

            <button
              type="button"
              onClick={() => onMarkPaid('bill-2')}
              className="py-2 px-3 rounded-xl bg-[#004d6a] text-white hover:bg-[#00384d] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Mark Paid</span>
            </button>
          </div>
        </div>

        {/* Card 3: Devendra Patel */}
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 hover:border-[#bae6fd] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                alt="Devendra Patel"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div>
                <h4 className="text-sm font-bold font-display text-[#0b1c30]">
                  Devendra Patel
                </h4>
                <p className="text-xs text-[#64748b]">
                  Student Pass • <span className="font-mono font-semibold text-[#0b1c30]">₹1,500</span>
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#eff6ff] text-[#006194] border border-[#bae6fd] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              In 5 days
            </span>
          </div>

          {/* 1 Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onOpenRenewModal('mem-10', 1500, 'Student Pass')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#f0f9ff] text-[#0284c7] border border-[#bae6fd] hover:bg-[#e0f2fe] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Tap Renew Student Pass (₹1,500)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Quick Action Bar */}
      <div className="fixed bottom-18 left-0 right-0 z-30 px-4 max-w-md mx-auto">
        <div
          onClick={onOpenQuickPay}
          className="w-full p-3 rounded-2xl bg-[#004d6a] text-white shadow-xl flex items-center justify-between cursor-pointer hover:bg-[#00384d] transition-all border border-[#00668a]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold font-display">
                Record New Payment
              </div>
              <div className="text-[10px] font-mono text-[#7bd0ff]">
                Cash • Dynamic QR • POS Card
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold font-display hover:bg-[#0369a1] transition-colors shrink-0">
            <span>+ Quick Pay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
