import React, { useState } from 'react';
import { X, UserPlus, Check, Building2, Shield, Lock } from 'lucide-react';
import { Member } from '../../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Partial<Member>) => void;
  defaultBranch?: string;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  defaultBranch = 'Downtown Branch',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [plan, setPlan] = useState('Annual Gold');
  const [amount, setAmount] = useState('24000');
  const [locker, setLocker] = useState('Locker #');
  const [branch, setBranch] = useState(defaultBranch);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      name,
      phone,
      plan,
      amountDue: 0,
      branch,
      status: 'active',
      lastActive: 'Just enrolled',
      locker: locker.length > 8 ? locker : undefined,
      isCheckedIn: false,
      ltv: Number(amount) || 15000,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#bae6fd]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#0b1c30]">
                Enroll Athlete
              </h3>
              <p className="text-xs text-[#64748b]">
                New Madabolicx membership intake
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
              ATHLETE FULL NAME *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aryan Sehgal"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#bae6fd]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
                PHONE (+91) *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0284c7]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
                LOCKER ASSIGNMENT
              </label>
              <input
                type="text"
                value={locker}
                onChange={(e) => setLocker(e.target.value)}
                placeholder="Locker #56"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0284c7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
                MEMBERSHIP PLAN
              </label>
              <select
                value={plan}
                onChange={(e) => {
                  setPlan(e.target.value);
                  if (e.target.value.includes('Annual')) setAmount('24000');
                  else if (e.target.value.includes('Quarterly')) setAmount('6800');
                  else setAmount('2500');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-[#0284c7] bg-white"
              >
                <option value="Annual Gold">Annual Gold (₹24k)</option>
                <option value="Quarterly Pro Plan">Quarterly Pro (₹6.8k)</option>
                <option value="Monthly Strength">Monthly Strength (₹2.5k)</option>
                <option value="CrossFit Pro">CrossFit Pro (₹3.5k)</option>
                <option value="Student Pass">Student Pass (₹1.5k)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
                FACILITY BRANCH
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-[#0284c7] bg-white"
              >
                <option value="Downtown Branch">Downtown Hub</option>
                <option value="Westside Studio">Westside Branch</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] flex items-center justify-between text-xs">
            <span className="font-mono text-[#006194]">Total Invoiced (incl. 18% GST)</span>
            <span className="font-display font-bold text-[#0b1c30] text-base">₹{Number(amount).toLocaleString()}</span>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold font-display shadow-md transition-all"
            >
              Confirm Enrollment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
