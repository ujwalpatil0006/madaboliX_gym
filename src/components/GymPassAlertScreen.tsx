import React from 'react';
import {
  BellRing,
  MessageSquare,
  Mail,
  RefreshCw,
  Phone,
  UserX,
  CalendarX2,
} from 'lucide-react';
import { Member } from '../types';

interface GymPassAlertScreenProps {
  members: Member[];
  onSendWhatsApp: (member: Member, kind: 'expiry' | 'overdue' | 'churn') => void;
  onSendEmail: (member: Member) => void;
  onOpenRenew: (member: Member) => void;
}

type AlertKind = 'expiry' | 'overdue' | 'churn';

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
  onSendWhatsApp,
  onSendEmail,
  onOpenRenew,
}) => {
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

      {/* Master action strip */}
      {totalAlerts > 0 && (
        <div className="p-3 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#fff5f5] text-[#b91c1c] flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-mono text-slate-500">
              {expiring.length} passes expiring in the next 7 days
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              Reminders land on the member&apos;s registered WhatsApp + email
            </p>
          </div>
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
                className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 hover:border-[#bae6fd] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
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
                <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#64748b] shrink-0" />
                    {member.phone}
                  </span>
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3 h-3 text-[#64748b] shrink-0" />
                    <span className="truncate">{member.email || 'No email on file'}</span>
                  </span>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onSendWhatsApp(member, group.kind)}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-[10px] font-bold transition-all shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    disabled={!member.email}
                    onClick={() => onSendEmail(member)}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-[#0284c7] text-[#006194] hover:bg-[#e0f2fe] text-[10px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenRenew(member)}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#0b1c30] hover:bg-[#1e293b] text-white text-[10px] font-bold transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renew
                  </button>
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