import React, { useMemo, useState } from 'react';
import {
  QrCode,
  LogIn,
  LogOut,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Wallet,
  UserCheck,
} from 'lucide-react';
import { Trainer, TrainerAttendance, BranchLocation } from '../types';

interface TrainersScreenProps {
  currentBranch: BranchLocation;
  trainers: Trainer[];
  attendance: TrainerAttendance[];
  onLogGatePunch: (trainerId: string, type: 'in' | 'out') => void;
  onLogSession: (trainerId: string) => void;
  onSetStatus: (trainerId: string, status: Trainer['status']) => void;
  onOpenQRTerminal: () => void;
}

const STATUS_META: Record<Trainer['status'], { label: string; dot: string; chip: string }> = {
  on_floor: { label: 'ON FLOOR', dot: '#16a34a', chip: 'bg-emerald-50 text-emerald-700' },
  in_session: { label: 'IN PT SESSION', dot: '#0284c7', chip: 'bg-sky-50 text-sky-700' },
  break: { label: 'ON BREAK', dot: '#f59e0b', chip: 'bg-amber-50 text-amber-700' },
  off_duty: { label: 'OFF DUTY', dot: '#94a3b8', chip: 'bg-slate-100 text-slate-500' },
};

const BRANCH_QR: Record<
  Exclude<BranchLocation, 'All Locations'>,
  { checkIn: string; checkOut: string }
> = {
  'Jatra Hotel': { checkIn: '/qr/attendance-jatra.png', checkOut: '/qr/checkout-jatra.png' },
  Adgaon: { checkIn: '/qr/attendance-adgaon.png', checkOut: '/qr/checkout-adgaon.png' },
};

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const sameDay = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

export const TrainersScreen: React.FC<TrainersScreenProps> = ({
  currentBranch,
  trainers,
  attendance,
  onLogGatePunch,
  onLogSession,
  onSetStatus,
  onOpenQRTerminal,
}) => {
  const [gateMode, setGateMode] = useState<'in' | 'out'>('in');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleTrainers = useMemo(
    () =>
      currentBranch === 'All Locations'
        ? trainers
        : trainers.filter((t) => !t.branch || t.branch === currentBranch),
    [trainers, currentBranch]
  );

  // ---- Owner pulse (real values only) ----
  const onDuty = visibleTrainers.filter((t) => t.status !== 'off_duty');
  const ptToday = attendance.filter(
    (a) =>
      a.type === 'out' &&
      sameDay(a.at) &&
      (currentBranch === 'All Locations' || a.branch === currentBranch)
  ).length;
  const payoutDue = visibleTrainers.reduce((sum, t) => sum + (t.commissionEarned || 0), 0);
  const sessionsMtd = visibleTrainers.reduce((sum, t) => sum + (t.monthlySessionsCompleted || 0), 0);
  const targetMtd = visibleTrainers.reduce((sum, t) => sum + (t.monthlyTarget || 0), 0);
  const pctMtd = targetMtd > 0 ? Math.round((sessionsMtd / targetMtd) * 100) : 0;

  // ---- Gate QR (selected branch only) ----
  const gateBranch = currentBranch === 'All Locations' ? null : currentBranch;
  const gateQrs = gateBranch ? BRANCH_QR[gateBranch] : null;

  const todayPunches = useMemo(
    () =>
      attendance
        .filter((a) => gateBranch && a.branch === gateBranch && sameDay(a.at))
        .slice(-4)
        .reverse(),
    [attendance, gateBranch]
  );
  const firstIn = todayPunches.filter((a) => a.type === 'in')[0];
  const lastOut = todayPunches.find((a) => a.type === 'out');

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
          TRAINING OPS
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#0b1c30] tracking-tight mt-0.5">
          Trainer Control
        </h1>
      </div>

      {/* Owner Pulse KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase flex items-center gap-1.5">
            <UserCheck className="w-3 h-3 text-[#0284c7]" />
            ON DUTY NOW
          </span>
          <div className="mt-1.5 text-xl font-bold font-mono text-[#0b1c30]">
            {onDuty.length}/{visibleTrainers.length}
          </div>
          <div className="text-[10px] font-mono text-emerald-600 mt-0.5 font-semibold">
            {onDuty.filter((t) => t.status === 'in_session').length} in PT session
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase flex items-center gap-1.5">
            <LogOut className="w-3 h-3 text-[#0284c7]" />
            PT DONE TODAY
          </span>
          <div className="mt-1.5 text-xl font-bold font-mono text-[#0b1c30]">{ptToday}</div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">sessions closed</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase flex items-center gap-1.5">
            <Target className="w-3 h-3 text-[#0284c7]" />
            PT TARGET MTD
          </span>
          <div className="mt-1.5 text-xl font-bold font-mono text-[#0b1c30]">
            {sessionsMtd}
            <span className="text-sm text-slate-400 font-semibold">/{targetMtd}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0284c7]"
              style={{ width: `${Math.min(pctMtd, 100)}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase flex items-center gap-1.5">
            <Wallet className="w-3 h-3 text-[#0284c7]" />
            PAYOUT DUE
          </span>
          <div className="mt-1.5 text-xl font-bold font-mono text-[#0b1c30]">
            ₹{payoutDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">PT commission MTD</div>
        </div>
      </div>

      {/* Gate QR — trainers scan the printed static QR at the door */}
      {gateBranch && gateQrs && (
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
              <QrCode className="w-3.5 h-3.5" />
              GATE QR · {gateBranch.toUpperCase()}
            </div>
            <div className="flex items-center gap-1 bg-[#f1f5f9] p-0.5 rounded-full">
              {(['in', 'out'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setGateMode(m)}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-semibold transition-all ${
                    gateMode === m ? 'bg-[#0284c7] text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {m === 'in' ? 'IN' : 'OUT'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenQRTerminal}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f8faff] border border-slate-200 hover:border-[#0284c7] transition-all text-left"
          >
            <img
              src={gateMode === 'in' ? gateQrs.checkIn : gateQrs.checkOut}
              alt={`${gateBranch} trainer ${gateMode === 'in' ? 'check-in' : 'checkout'} QR`}
              className="w-16 h-16 rounded-lg bg-white border border-slate-100 p-1"
            />
            <div className="min-w-0">
              <div className="text-sm font-bold font-display text-[#0b1c30]">
                {gateMode === 'in' ? 'Trainer IN' : 'Trainer OUT'} · {gateBranch}
              </div>
              <div className="text-[11px] font-mono text-[#64748b] mt-0.5">
                {firstIn ? `First in ${timeOf(firstIn.at)}` : 'No scan yet'}
                {lastOut ? ` · Last out ${timeOf(lastOut.at)}` : ''}
              </div>
              <div className="text-[10px] font-mono text-[#006194] font-semibold mt-1">
                Open full QR terminal →
              </div>
            </div>
          </button>

          {/* Quick punch — tap trainer to record the gate event */}
          <div className="flex flex-wrap gap-1.5">
            {visibleTrainers.map((t) => {
              const meta = STATUS_META[t.status];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onLogGatePunch(t.id, gateMode)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-white border border-slate-200 hover:border-[#0284c7] transition-all"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: meta.dot }}
                  />
                  <span className="text-[11px] font-semibold text-[#0b1c30]">{t.name.split(' ')[0]}</span>
                  {gateMode === 'in' ? (
                    <LogIn className="w-3 h-3 text-[#0284c7]" />
                  ) : (
                    <LogOut className="w-3 h-3 text-[#be185d]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Today's gate log */}
          {todayPunches.length > 0 && (
            <div className="pt-1 space-y-1 border-t border-slate-100">
              {todayPunches.map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-[11px] font-mono pt-1">
                  {a.type === 'in' ? (
                    <LogIn className="w-3 h-3 text-[#0284c7] shrink-0" />
                  ) : (
                    <LogOut className="w-3 h-3 text-[#be185d] shrink-0" />
                  )}
                  <span className="font-semibold text-[#0b1c30]">{a.trainerName}</span>
                  <span className="text-slate-400">
                    {a.type === 'in' ? 'punched in' : 'punched out'} {timeOf(a.at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trainer Cards */}
      {visibleTrainers.map((t) => {
        const meta = STATUS_META[t.status];
        const pct =
          t.monthlyTarget > 0
            ? Math.round((t.monthlySessionsCompleted / t.monthlyTarget) * 100)
            : 0;
        const expanded = expandedId === t.id;
        return (
          <div
            key={t.id}
            className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {t.avatar ? (
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-100"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] text-[#006194] flex items-center justify-center text-xs font-bold font-display shrink-0">
                    {t.initials || initialsOf(t.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold font-display text-[#0b1c30] truncate">
                    {t.name}
                  </h3>
                  <p className="text-[10px] font-mono text-[#64748b] truncate">{t.role}</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold shrink-0 ${meta.chip}`}
              >
                {meta.label}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t.shiftHours}
              </span>
              <span className="text-[#0b1c30] font-semibold">
                {t.monthlySessionsCompleted}/{t.monthlyTarget} PT ({pct}%)
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0284c7]"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>

            {expanded && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-[#f8faff] border border-slate-200">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">
                    PT Clients
                  </span>
                  <div className="text-sm font-bold font-mono text-[#0b1c30] mt-0.5">
                    {t.ptClientsCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8faff] border border-slate-200">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">
                    PT Revenue
                  </span>
                  <div className="text-sm font-bold font-mono text-[#0b1c30] mt-0.5">
                    ₹{t.ptRevenue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8faff] border border-slate-200">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">
                    Commission
                  </span>
                  <div className="text-sm font-bold font-mono text-[#0b1c30] mt-0.5">
                    ₹{t.commissionEarned.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onLogSession(t.id)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0284c7] text-white text-[10px] font-mono font-bold hover:bg-[#0369a1] transition-colors"
              >
                + LOG PT
              </button>
              <button
                type="button"
                onClick={() => onSetStatus(t.id, 'in_session')}
                disabled={t.status === 'in_session'}
                className="px-2.5 py-1.5 rounded-lg bg-[#e0f2fe] text-[#006194] text-[10px] font-mono font-bold hover:bg-[#bae6fd] transition-colors disabled:opacity-40"
              >
                PT START
              </button>
              <button
                type="button"
                onClick={() => onSetStatus(t.id, 'break')}
                disabled={t.status === 'break'}
                className="px-2.5 py-1.5 rounded-lg bg-[#fef3c7] text-amber-700 text-[10px] font-mono font-bold hover:bg-[#fde68a] transition-colors disabled:opacity-40"
              >
                BREAK
              </button>
              <button
                type="button"
                onClick={() => onSetStatus(t.id, 'on_floor')}
                disabled={t.status === 'on_floor'}
                className="px-2.5 py-1.5 rounded-lg bg-[#dcfce7] text-emerald-700 text-[10px] font-mono font-bold hover:bg-[#bbf7d0] transition-colors disabled:opacity-40"
              >
                ON FLOOR
              </button>
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : t.id)}
                className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-[#0284c7] hover:bg-[#f0f9ff] transition-colors"
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        );
      })}

      {visibleTrainers.length === 0 && (
        <div className="p-4 rounded-2xl bg-white border border-dashed border-slate-200 text-center">
          <span className="text-xs text-[#64748b]">
            No trainers mapped to {currentBranch} yet
          </span>
        </div>
      )}
    </div>
  );
};
