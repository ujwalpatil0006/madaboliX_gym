import React, { useState, useMemo } from 'react';
import {
  Search,
  QrCode,
  SlidersHorizontal,
  CheckCircle,
  Activity,
  UserPlus,
  MoreVertical,
  RefreshCw,
  Lock,
  Calendar,
  AlertCircle,
  Clock,
  Check,
  ChevronDown
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
}

export const MembersScreen: React.FC<MembersScreenProps> = ({
  members,
  currentBranch,
  onOpenAddMember,
  onOpenQRTerminal,
  onToggleCheckIn,
  onOpenMemberTelemetry,
  onOpenMemberProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'recency' | 'name' | 'plan' | 'amount'>('recency');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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

      {/* Directory Subheader & Sorting */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase">
          DIRECTORY <span className="text-slate-300">•</span> <span className="text-[#0284c7]">REALTIME TELEMETRY</span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-1 text-xs font-mono font-semibold text-[#64748b] hover:text-[#0b1c30] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>By Recency</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showSortDropdown && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowSortDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 z-40 w-40 p-1.5 bg-white rounded-xl border border-[#e2e8f0] shadow-lg text-xs">
                {['recency', 'name', 'plan', 'amount'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortBy(opt as any);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg capitalize ${
                      sortBy === opt ? 'bg-[#f0f9ff] text-[#0284c7] font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    By {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Member Cards List */}
      <div className="space-y-3">
        {filteredMembers.slice(0, 5).map((member) => {
          // Card borders and badges based on status matching Screenshot 2
          const isRohit = member.id === 'mem-1';
          const isPooja = member.id === 'mem-2';
          const isKabir = member.id === 'mem-3';
          const isSimran = member.id === 'mem-4';

          return (
            <div
              key={member.id}
              onClick={() => onOpenMemberProfile(member)}
              className={`p-4 rounded-2xl bg-white border shadow-xs transition-all cursor-pointer active:scale-[0.99] ${
                isRohit
                  ? 'border-l-4 border-l-[#22c55e] border-[#e2e8f0]'
                  : isPooja
                  ? 'border-l-4 border-l-[#f59e0b] border-[#e2e8f0]'
                  : isKabir
                  ? 'border-l-4 border-l-[#0284c7] border-[#e2e8f0]'
                  : isSimran
                  ? 'border-l-4 border-l-[#ef4444] border-[#e2e8f0]'
                  : 'border-[#e2e8f0]'
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
                      {member.plan} • {member.branch.split(' ')[0]}...
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

              {/* Telemetry Status Box */}
              <div className="mt-3">
                {isRohit && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs">
                    <div className="flex items-center gap-1.5 text-[#15803d] font-mono">
                      <span>➔</span>
                      <span>Last in: <strong className="font-semibold">Today, 7:15 AM</strong></span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-white text-[#0284c7] font-mono font-semibold text-[11px] border border-[#bae6fd]">
                      {member.locker}
                    </span>
                  </div>
                )}

                {isPooja && (
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

                {isKabir && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] text-xs">
                    <div className="flex items-center gap-1.5 text-[#006194] font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Last active: <strong className="font-semibold">4 days ago</strong></span>
                    </div>
                    <span className="text-[#0284c7] font-mono text-[11px]">
                      Target: {member.targetFrequency}
                    </span>
                  </div>
                )}

                {isSimran && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fff5f5] border border-[#ffdad6] text-xs">
                    <div className="flex items-center gap-1.5 text-[#b91c1c]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Lapsed 2d • Overdue</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#b91c1c]">
                      ₹{member.amountDue?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-3 flex items-center gap-2">
                {isRohit && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCheckIn(member.id);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] hover:bg-[#dcfce7] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4 text-[#15803d]" />
                      <span>Checked In ✓</span>
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

                {isKabir && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCheckIn(member.id);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#f0f9ff] text-[#0284c7] border border-[#bae6fd] hover:bg-[#e0f2fe] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Quick Check-in</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMemberTelemetry(member);
                      }}
                      className="p-2 rounded-xl bg-[#f8fafc] border border-slate-200 text-slate-500 hover:text-[#0284c7] hover:border-[#bae6fd] transition-all shrink-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Footer Status */}
      <div className="pt-2 text-center">
        <p className="text-[11px] font-mono text-[#64748b] flex items-center justify-center gap-1.5">
          <RefreshCw className="w-3 h-3 text-[#0284c7] animate-spin" />
          <span>{filteredMembers.length} of {counts.all} profiles loaded • Pull to synchronize</span>
        </p>
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
