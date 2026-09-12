import React, { useState, useMemo } from 'react';
import {
  Search,
  QrCode,
  CheckCircle,
  Activity,
  UserPlus,
  RefreshCw,
  Calendar,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { Member, BranchLocation } from '../types';

interface MembersScreenProps {
  members: Member[];
  currentBranch: BranchLocation;
  onOpenAddMember: () => void;
  onOpenQRTerminal: () => void;
  onToggleCheckIn: (memberId: string) => void;
  onOpenMemberTelemetry: (member: Member) => void;
  onOpenMemberProfile: (member: Member) => void;
  onOpenRenewModal: (member: Member) => void;
}

export const MembersScreen: React.FC<MembersScreenProps> = ({
  members,
  currentBranch,
  onOpenAddMember,
  onOpenQRTerminal,
  onToggleCheckIn,
  onOpenMemberTelemetry,
  onOpenMemberProfile,
  onOpenRenewModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Branch filter if not all locations
      if (currentBranch !== 'All Locations' && m.branch !== currentBranch) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(query);
        const matchesPhone = m.phone.toLowerCase().includes(query);
        const matchesPlan = m.plan.toLowerCase().includes(query);
        const matchesLocker = m.locker?.toLowerCase().includes(query);
        return matchesName || matchesPhone || matchesPlan || matchesLocker;
      }

      return true;
    });
  }, [members, currentBranch, statusFilter, searchQuery]);

  // Counts for pills (derived from the currently selected branch)
  const branchMembers = useMemo(
    () => (currentBranch === 'All Locations' ? members : members.filter((m) => m.branch === currentBranch)),
    [members, currentBranch]
  );
  const counts = {
    all: branchMembers.length,
    active: branchMembers.filter((m) => m.status === 'active').length,
    expiring: branchMembers.filter((m) => m.status === 'expiring').length,
    expired: branchMembers.filter((m) => m.status === 'expired').length,
  };

  return (
    <div className="space-y-3 pb-24 animate-in fade-in duration-200">
      {/* Search Bar & QR Scanner Trigger */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member, phone (+91)..."
            className="w-full pl-9.5 pr-4 py-2.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs text-xs sm:text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#bae6fd]"
          />
        </div>
        <button
          type="button"
          onClick={onOpenQRTerminal}
          className="p-2.5 rounded-2xl bg-white border border-[#e2e8f0] text-[#0284c7] hover:bg-[#f0f9ff] hover:border-[#0284c7] transition-all shadow-xs shrink-0"
          title="Scan Athlete QR Code"
        >
          <QrCode className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'all'
              ? 'bg-[#0284c7] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#e2e8f0] hover:border-slate-300'
          }`}
        >
          <span>All</span>
          <span className={`text-[10px] font-mono px-1 rounded-full ${statusFilter === 'all' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'active'
              ? 'bg-[#0284c7] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#e2e8f0] hover:border-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span>Active</span>
          <span className={`text-[10px] font-mono px-1 rounded-full ${statusFilter === 'active' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
            {counts.active}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('expiring')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'expiring'
              ? 'bg-[#0284c7] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#e2e8f0] hover:border-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <span>Expiring Soon</span>
          <span className={`text-[10px] font-mono px-1 rounded-full ${statusFilter === 'expiring' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
            {counts.expiring}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('expired')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'expired'
              ? 'bg-[#0284c7] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#e2e8f0] hover:border-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span>Expired</span>
          <span className={`text-[10px] font-mono px-1 rounded-full ${statusFilter === 'expired' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
            {counts.expired}
          </span>
        </button>
      </div>

      {/* Directory Subheader */}
      <div className="pt-1">
        <div className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase">
          DIRECTORY <span className="text-slate-300">•</span> <span className="text-[#0284c7]">LIVE</span>
        </div>
      </div>

      {/* Member Cards List */}
      <div className="space-y-3">
        {filteredMembers.map((member) => {
          // Card styling derived from member status (works for any member)
          const isActive = member.status === 'active';
          const isExpiring = member.status === 'expiring';
          const isExpired = member.status === 'expired';

          return (
            <div
              key={member.id}
              onClick={() => onOpenMemberProfile(member)}
              className={`p-4 rounded-2xl bg-white border shadow-xs transition-all cursor-pointer active:scale-[0.99] ${
                isActive
                  ? 'border-l-4 border-l-[#22c55e] border-[#e2e8f0]'
                  : isExpiring
                  ? 'border-l-4 border-l-[#f59e0b] border-[#e2e8f0]'
                  : isExpired
                  ? 'border-l-4 border-l-[#ef4444] border-[#e2e8f0]'
                  : 'border-l-4 border-l-[#0284c7] border-[#e2e8f0]'
              }`}
            >
              {/* Member Profile Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#e0f2fe] text-[#0284c7] font-display font-bold text-sm flex items-center justify-center ring-2 ring-[#bae6fd]">
                      {member.initials || member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold font-display text-[#0b1c30]">
                        {member.name}
                      </h4>
                      {member.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-[#0284c7] fill-[#0284c7]/20" />
                      )}
                      {member.tier && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#e0f2fe] text-[#006194]">
                          {member.tier}
                        </span>
                      )}
                      {member.statusLabel && member.status === 'expiring' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                          {member.statusLabel}
                        </span>
                      )}
                      {member.statusLabel && member.status === 'expired' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]">
                          {member.statusLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748b] truncate mt-0.5">
                      {member.plan} • {member.branch}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {member.status === 'active' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-[#dcfce7] text-[#15803d] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                      ACTIVE
                    </span>
                  )}
                  {member.status === 'expiring' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-[#fef3c7] text-[#b45309] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                      EXPIRING
                    </span>
                  )}
                  {member.status === 'expired' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-[#fee2e2] text-[#b91c1c] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                      EXPIRED
                    </span>
                  )}
                </div>
              </div>

              {/* Telemetry Status Box (derived from member data) */}
              <div className="mt-3">
                {isActive && member.isCheckedIn && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs">
                    <div className="flex items-center gap-1.5 text-[#15803d] font-mono">
                      <span>➔</span>
                      <span>Last in: <strong className="font-semibold">{member.lastActive}</strong></span>
                    </div>
                    {member.locker && (
                      <span className="px-2 py-0.5 rounded-md bg-white text-[#0284c7] font-mono font-semibold text-[11px] border border-[#bae6fd]">
                        {member.locker}
                      </span>
                    )}
                  </div>
                )}

                {isActive && !member.isCheckedIn && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] text-xs">
                    <div className="flex items-center gap-1.5 text-[#006194] font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Last active: <strong className="font-semibold">{member.lastActive}</strong></span>
                    </div>
                    {member.targetFrequency && (
                      <span className="text-[#0284c7] font-mono text-[11px]">
                        Target: {member.targetFrequency}
                      </span>
                    )}
                  </div>
                )}

                {isExpiring && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-xs">
                    <div className="flex items-center gap-1.5 text-[#92400e]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Renewal balance due</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#92400e]">
                      ₹{member.amountDue?.toLocaleString()}
                    </span>
                  </div>
                )}

                {isExpired && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fff5f5] border border-[#ffdad6] text-xs">
                    <div className="flex items-center gap-1.5 text-[#b91c1c]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Lapsed {member.overdueDays ? `${member.overdueDays}d` : ''} • Overdue</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#b91c1c]">
                      ₹{member.amountDue?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row (derived from member status) */}
              <div className="mt-3 flex items-center gap-2">
                {isActive && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCheckIn(member.id);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        member.isCheckedIn
                          ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0] hover:bg-[#dcfce7]'
                          : 'bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd] hover:bg-[#e0f2fe]'
                      }`}
                    >
                      {member.isCheckedIn ? (
                        <Check className="w-4 h-4 text-[#15803d]" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      <span>{member.isCheckedIn ? 'Checked In ✓' : 'Quick Check-in'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMemberTelemetry(member);
                      }}
                      className="p-2 rounded-xl bg-[#f8fafc] border border-slate-200 text-slate-500 hover:text-[#0284c7] hover:border-[#bae6fd] transition-all shrink-0"
                      title="Telemetry Trends"
                    >
                      <Activity className="w-4 h-4" />
                    </button>
                  </>
                )}

                {!isActive && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRenewModal(member);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#004d6a] text-white hover:bg-[#00384d] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isExpiring ? 'Renew Now' : 'Collect & Renew'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMemberTelemetry(member);
                      }}
                      className="p-2 rounded-xl bg-[#f8fafc] border border-slate-200 text-slate-500 hover:text-[#0284c7] hover:border-[#bae6fd] transition-all shrink-0"
                      title="Telemetry Trends"
                    >
                      <Activity className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button: + New Member */}
      <div className="fixed bottom-20 right-4 z-30 sm:right-6">
        <button
          type="button"
          onClick={onOpenAddMember}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#090d16] text-white shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all font-display font-bold text-xs sm:text-sm border border-slate-700"
        >
          <UserPlus className="w-4 h-4 text-[#d4ff00]" />
          <span>+ New Member</span>
        </button>
      </div>
    </div>
  );
};
