import React, { useState } from 'react';
import {
  BellRing,
  Zap,
  Loader2,
  Phone,
  Mail,
  UserX,
  CalendarX2,
} from 'lucide-react';
import { Member } from '../types';

export type AlertKind = 'expiry' | 'overdue' | 'churn';

interface GymPassAlertScreenProps {
  members: Member[];
  onRunAutonomous: (kind: AlertKind, members: Member[]) => Promise<void>;
}

interface AlertGroup {
  title: string;
  icon: React.ReactNode;
  accent: string;
  members: Member[];
  kind: AlertKind;
  badgeLabel: (member: Member) => string;
  badgeClass: string;
}

const daysLabel = (member: Member) => {
  const d = member.daysRemaining;
  if (typeof d !== 'number') return 'EXPIRING SOON';
  if (d <= 0) return 'EXPIRES TODAY';
  if (d === 1) return 'EXPIRES TOMORROW';
  return `EXPIRES IN ${d}D`;
};

export const GymPassAlertScreen: React.FC<GymPassAlertScreenProps> = ({
  members,
  onRunAutonomous,
}) => {
  const [runningGroup, setRunningGroup] = useState<AlertKind | null>(null);

  const expiring = members
    .filter((m) => m.status === 'expiring')
    .sort((a, b) => (a.daysRemaining ?? 99) - (b.daysRemaining ?? 99));
  const expired = members.filter((m) => m.status === 'expired');
  const atRisk = members.filter((m) => m.status === 'dormant');

  const groups: AlertGroup[] = [
    {
      title: 'EXPIRING SOON',
      icon: <BellRing className="w-4 h-4" />,
      accent: '#b45309',
      members: expiring,
      kind: 'expiry',
      badgeLabel: daysLabel,
      badgeClass: 'bg-[#fffbeb] border-[#fde68a] text-[#b45309]',
    },
    {
      title: 'EXPIRED PASSES',
      icon: <CalendarX2 className="w-4 h-4" />,
      accent: '#b91c1c',
      members: expired,
      kind: 'overdue',
      badgeLabel: () => 'PASS EXPIRED',
      badgeClass: 'bg-[#fff1f1] border-[#ffd6d1] text-[#b91c1c]',
    },
    {
      title: 'AT RISK (NO CHECK-IN)',
      icon: <UserX className="w-4 h-4" />,
      accent: '#6d28d9',
      members: atRisk,
      kind: 'churn',
      badgeLabel: () => 'AT RISK',
      badgeClass: 'bg-[#f5f3ff] border-[#ddd6fe] text-[#6d28d9]',
    },
  ];

  const totalAlerts = expiring.length + expired.length + atRisk.length;

  const runAutonomous = async (group: AlertGroup) => {
    if (runningGroup != null || group.members.length === 0) return;
    setRunningGroup(group.kind);
    try {
      await onRunAutonomous(group.kind, group.members);
    } finally {
      setRunningGroup(null);
    }
  };

  const actionButton = (group: AlertGroup, label: string) => (
    <button
      type="button"
      onClick={() => runAutonomous(group)}
      disabled={runningGroup != null || group.members.length === 0}
      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl border font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs ${
        group.members.length === 0
          ? 'bg-white border-[#e2e8f0] text-slate-300'
          : group.kind === 'expiry'
            ? 'bg-[#fffbeb] border-[#fde68a] text-[#b45309] hover:bg-[#fef3c7]'
            : group.kind === 'overdue'
              ? 'bg-[#fff1f1] border-[#ffd6d1] text-[#b91c1c] hover:bg-[#fee2e2]'
              : 'bg-[#f5f3ff] border-[#ddd6fe] text-[#6d28d9] hover:bg-[#ede9fe]'
      }`}
    >
      <span className="flex items-center gap-1.5">
        {runningGroup === group.kind ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Zap className="w-3.5 h-3.5" />
        )}
        <span className="text-[10px] font-bold">{label}</span>
      </span>
      <span className="text-[9px] font-semibold opacity-70">
        {group.members.length > 0
          ? `Send to all · ${group.members.length}`
          : 'No one here'}
      </span>
    </button>
  );

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
            GYM PASS ALERT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#0b1c30] tracking-tight mt-0.5">
            Pass Alerts
          </h1>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-[#fff5f5] border border-[#ffd6d1] text-[#b91c1c] text-xs font-mono font-bold shadow-xs">
          {totalAlerts} Alerts
        </span>
      </div>

      {/* Autonomous actions — one tap sends a message to everyone in the group */}
      {totalAlerts > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {actionButton(groups[0], 'RENEW NUDGE')}
          {actionButton(groups[1], 'FOLLOW-UP')}
          {actionButton(groups[2], 'WIN-BACK')}
        </div>
      )}

      {/* Alert Groups */}
      {groups.map((group) =>
        group.members.length === 0 ? null : (
          <div key={group.title} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5"
                style={{ color: group.accent }}
              >
                {group.icon}
                {group.title}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border"
                style={{ color: group.accent, borderColor: group.accent, opacity: 0.6 }}
              >
                {group.members.length}
              </span>
            </div>

            {group.members.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#bae6fd] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#e0f2fe] text-[#0284c7] font-display font-bold text-sm flex items-center justify-center ring-1 ring-slate-200 shrink-0">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold font-display text-[#0b1c30] truncate">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-[#64748b] truncate">
                        {member.plan} • {member.branch}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {member.lastActive}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider border shrink-0 ${group.badgeClass}`}
                  >
                    {group.badgeLabel(member)}
                  </span>
                </div>

                {/* Contact details */}
                <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-500 mt-1">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#64748b] shrink-0" />
                    {member.phone}
                  </span>
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3 h-3 text-[#64748b] shrink-0" />
                    <span className="truncate">{member.email || 'No email on file'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {totalAlerts === 0 && (
        <div className="p-8 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#dcfce7] text-[#15803d] flex items-center justify-center mx-auto">
            <BellRing className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold font-display text-[#0b1c30]">All clear</p>
          <p className="text-xs text-[#64748b]">No expiring or at-risk passes right now.</p>
        </div>
      )}
    </div>
  );
};