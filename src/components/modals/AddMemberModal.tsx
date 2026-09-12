import React, { useMemo, useState } from 'react';
import { X, UserPlus, Check, Building2, Shield, Lock } from 'lucide-react';
import { Member } from '../../types';

const PLAN_DURATIONS: Record<string, number> = {
  Monthly: 1,
  Quarterly: 3,
  'Half-Yearly': 6,
  Yearly: 12,
  'PT + Monthly': 1,
};

const PLAN_OPTIONS = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'PT + Monthly'];

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
  defaultBranch = 'Jatra Hotel',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState('Monthly');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [branch, setBranch] = useState(
    defaultBranch === 'Adgaon' ? 'Adgaon' : 'Jatra Hotel'
  );

  const computedEndDate = useMemo(() => {
    if (!startDate) return '';
    const months = PLAN_DURATIONS[plan] ?? 1;
    const d = new Date(`${startDate}T00:00:00`);
    d.setMonth(d.getMonth() + months);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, [startDate, plan]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError(true);
      return;
    }

    onAddMember({
      name,
      phone: `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      plan,
      amountDue: 0,
      branch,
      status: 'active',
      lastActive: 'Just enrolled',
      isCheckedIn: false,
      ltv: Number(amount) || 0,
      membershipStartDate: startDate || undefined,
      membershipEndDate: computedEndDate || undefined,
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
              FULL NAME *
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

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
              MOBILE NUMBER (+91) *
            </label>
            <div
              className={`flex items-center rounded-xl border overflow-hidden bg-white transition-colors ${
                phoneError
                  ? 'border-[#ba1a1a] focus-within:ring-2 focus-within:ring-[#fecaca]'
                  : 'border-slate-200 focus-within:border-[#0284c7] focus-within:ring-2 focus-within:ring-[#bae6fd]'
              }`}
            >
              <span className="px-3 py-2.5 text-sm font-mono font-semibold text-slate-500 bg-slate-50 border-r border-slate-200 shrink-0">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setPhoneError(false);
                }}
                placeholder="98201 44521"
                className="w-full px-3 py-2.5 text-sm tracking-wide focus:outline-hidden"
              />
            </div>
            {phoneError && (
              <p className="text-[10px] font-mono font-semibold text-[#ba1a1a] mt-1">
                Please enter a valid 10-digit mobile number
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@mail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#bae6fd]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
              ADDRESS
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, area, city..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-hidden focus:border-[#0284c7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
                MEMBERSHIP PLAN
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-[#0284c7] bg-white"
              >
                {PLAN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
                PLAN AMOUNT (₹) *
              </label>
<input
                type="number"
                min={0}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0284c7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
                START DATE
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-[#0284c7] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
                END DATE
              </label>
              <input
                type="date"
                readOnly
                value={computedEndDate}
                placeholder="Auto: start + plan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 text-slate-500 focus:outline-hidden"
              />
            </div>
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
              <option value="Jatra Hotel">Jatra Hotel</option>
              <option value="Adgaon">Adgaon</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] flex items-center justify-between text-xs">
            <span className="font-mono text-[#006194]">Total Invoiced</span>
            <span className="font-display font-bold text-[#0b1c30] text-base">₹{Number(amount || 0).toLocaleString()}</span>
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
