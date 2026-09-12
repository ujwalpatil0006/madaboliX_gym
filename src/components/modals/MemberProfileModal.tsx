import React from 'react';
import { X, User, CheckCircle } from 'lucide-react';
import { Member } from '../../types';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
}

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="p-2.5 rounded-xl bg-[#f8faff] border border-slate-200 space-y-0.5">
    <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
      {label}
    </span>
    <span className="text-xs font-semibold text-[#0b1c30] break-words">
      {value || '—'}
    </span>
  </div>
);

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  if (!isOpen || !member) return null;

  const joinedDate = member.membershipStartDate
    ? new Date(`${member.membershipStartDate}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : undefined;

  const endDate = member.membershipEndDate
    ? new Date(`${member.membershipEndDate}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#bae6fd]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#0b1c30]">
                Member Profile
              </h3>
              <p className="text-xs text-[#64748b]">
                Registered information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity Header */}
        <div className="flex items-center gap-3 mt-4">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#bae6fd]"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#e0f2fe] text-[#0284c7] font-display font-bold text-lg flex items-center justify-center ring-2 ring-[#bae6fd]">
              {member.initials || member.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-base font-bold font-display text-[#0b1c30]">
                {member.name}
              </h4>
              {member.isVerified && (
                <CheckCircle className="w-4 h-4 text-[#0284c7] fill-[#0284c7]/20" />
              )}
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              {member.plan} • {member.branch}
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-[#dcfce7] text-[#15803d] capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              {member.status}
            </span>
          </div>
        </div>

        {/* Registered Information Grid */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <InfoRow label="Full Name" value={member.name} />
          <InfoRow label="Phone" value={member.phone} />
          <InfoRow label="Email" value={member.email} />
          <InfoRow label="Address" value={member.address} />
          <InfoRow label="Plan" value={member.plan} />
          <InfoRow label="Branch" value={member.branch} />
          <InfoRow label="Start Date" value={joinedDate} />
          <InfoRow label="End Date" value={endDate} />
          <InfoRow label="Amount Paid (LTV)" value={member.ltv ? `₹${member.ltv.toLocaleString()}` : undefined} />
          <InfoRow label="Last Active" value={member.lastActive} />
        </div>

        {/* Membership Validity Strip */}
        <div className="mt-4 p-3 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] flex items-center justify-between text-xs">
          <span className="font-mono text-[#006194]">Days remaining</span>
          <span className="font-display font-bold text-[#0b1c30]">
            {member.daysRemaining?.toLocaleString() ?? '—'}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-[#0284c7] text-white font-bold text-xs hover:bg-[#0369a1] transition-colors"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
};