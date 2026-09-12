import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  Calendar,
  AlertTriangle,
  Send,
  Receipt,
  MessageSquare,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { BillingItem } from '../types';

interface BillingScreenProps {
  billingItems: BillingItem[];
  onOpenQuickPay: () => void;
  onOpenRenewModal: (memberId?: string, amount?: number, plan?: string) => void;
  onOpenWhatsAppNudge: (phone: string, name: string, amount: number, plan: string) => void;
  onMarkPaid: (itemId: string) => void;
  onSendUPI: (item: BillingItem) => void;
}

type Tab = '7days' | '30days' | 'paid';

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

const badgeFor = (dueType: BillingItem['dueType'], dueLabel: string) => {
  if (dueType === 'overdue')
    return { cls: 'bg-[#fff5f5] text-[#ba1a1a] border-[#ffdad6]', Icon: AlertTriangle };
  if (dueType === 'paid') return { cls: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]', Icon: Receipt };
  if (dueType === 'tomorrow') return { cls: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]', Icon: Calendar };
  return { cls: 'bg-[#eff6ff] text-[#006194] border-[#bae6fd]', Icon: Calendar };
};

export const BillingScreen: React.FC<BillingScreenProps> = ({
  billingItems,
  onOpenQuickPay,
  onOpenRenewModal,
  onOpenWhatsAppNudge,
  onMarkPaid,
  onSendUPI,
}) => {
  const [filterTab, setFilterTab] = useState<Tab>('7days');

  const pendingItems = billingItems.filter((i) => i.dueType !== 'paid');
  const totalToCollect = pendingItems.reduce((a, i) => a + i.amount, 0);

  const tabItems = (tab: Tab) =>
    tab === '7days'
      ? billingItems.filter((i) => i.dueType === 'tomorrow' || i.dueType === 'overdue')
      : tab === '30days'
        ? billingItems
        : billingItems.filter((i) => i.dueType === 'paid');

  const shown = tabItems(filterTab);

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Top Live Telemetry Cycle Close Card */}
      <div className="p-4.5 rounded-2xl bg-white border border-[#bae6fd] shadow-xs space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
            LIVE TELEMETRY <span className="text-slate-300">•</span> CYCLE CLOSE
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#006194] text-[10px] font-mono font-semibold border border-[#bae6fd]">
            {pendingItems.length} Pending
          </span>
        </div>

        <div>
          <span className="text-xs text-[#64748b] font-medium font-sans">
            Total Expected to Collect
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-bold font-display text-[#0b1c30]">
              ₹{totalToCollect.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-mono text-[#64748b]">
              across {pendingItems.length} accounts
            </span>
          </div>
        </div>

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
            {tabItems('7days').length}
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
            {tabItems('30days').length}
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
          <span className={`text-[10px] font-mono px-1.5 rounded-full ${filterTab === 'paid' ? 'bg-white/20' : 'bg-slate-100'}`}>
            {tabItems('paid').length}
          </span>
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

      {/* Billing Action Cards (live from selected branch) */}
      <div className="space-y-3">
        {shown.length === 0 && (
          <div className="p-6 rounded-2xl bg-white border border-dashed border-[#bae6fd] text-center space-y-1.5">
            <div className="mx-auto w-10 h-10 rounded-xl bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#0b1c30]">
              No {filterTab === 'paid' ? 'paid' : 'pending'} billing for this location
            </p>
            <p className="text-[10px] text-[#64748b]">
              Switch branch or record a new payment
            </p>
          </div>
        )}

        {shown.map((item) => {
          const { cls, Icon } = badgeFor(item.dueType, item.dueLabel);
          const isPaid = item.dueType === 'paid';
          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 hover:border-[#bae6fd] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.memberName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#eff6ff] text-[#006194] text-sm font-bold font-display flex items-center justify-center ring-2 ring-slate-100">
                      {initials(item.memberName)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold font-display text-[#0b1c30]">
                      {item.memberName}
                    </h4>
                    <p className="text-xs text-[#64748b]">
                      {item.plan} • <span className="font-mono font-semibold text-[#0b1c30]">₹{item.amount.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${cls}`}>
                  <Icon className="w-3 h-3" />
                  {item.dueLabel}
                </span>
              </div>

              {isPaid ? (
                <div className="pt-1 flex items-center gap-2 text-[11px] font-mono font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3 py-2.5">
                  <Receipt className="w-3.5 h-3.5" />
                  Settled & invoiced
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenRenewModal(item.memberId, item.amount, item.plan)}
                      className="py-2 px-2 rounded-xl bg-[#eff6ff] text-[#006194] border border-[#bae6fd] hover:bg-[#dbeafe] font-semibold text-xs transition-all flex flex-col items-center justify-center leading-tight"
                    >
                      <span>+1 Mo</span>
                      <span className="text-[10px] font-mono opacity-80">₹{(item.amount / 1000).toFixed(1)}k</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSendUPI(item)}
                      className="py-2 px-2 rounded-xl bg-[#f0f9ff] text-[#0284c7] border border-[#bae6fd] hover:bg-[#e0f2fe] font-semibold text-xs transition-all flex flex-col items-center justify-center leading-tight"
                    >
                      <Send className="w-3.5 h-3.5 mb-0.5" />
                      <span>Send UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onMarkPaid(item.id)}
                      className="py-2 px-2 rounded-xl bg-[#004d6a] text-white hover:bg-[#00384d] font-semibold text-xs transition-all flex flex-col items-center justify-center leading-tight shadow-xs"
                    >
                      <Receipt className="w-3.5 h-3.5 mb-0.5" />
                      <span>Mark Paid</span>
                    </button>
                  </div>

                  {item.dueType === 'overdue' && (
                    <button
                      type="button"
                      onClick={() => onOpenWhatsAppNudge(item.phone, item.memberName, item.amount, item.plan)}
                      className="w-full py-2 px-3 rounded-xl bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] hover:bg-[#dcfce7] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Nudge (₹{item.amount.toLocaleString('en-IN')})</span>
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
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