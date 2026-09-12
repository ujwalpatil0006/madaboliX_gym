import React, { useEffect, useState } from 'react';
import { X, Zap, Check, IndianRupee, Send, Smartphone } from 'lucide-react';
import { Member } from '../../types';

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
  onSuccess: (amount: number, duration: string) => void;
}

const DURATION_OPTIONS: { key: string; label: string }[] = [
  { key: '1m', label: '+1 Month' },
  { key: '3m', label: '+3 Months' },
  { key: '6m', label: '+6 Months' },
  { key: '12m', label: '+1 Year' },
];

export const RenewModal: React.FC<RenewModalProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess,
}) => {
  const [duration, setDuration] = useState('1m');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash'>('upi');
  const [amountInput, setAmountInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmountInput(member?.amountDue ? String(member.amountDue) : '');
      setDuration('1m');
      setPaymentMode('upi');
    }
  }, [isOpen, member]);

  if (!isOpen) return null;

  const base = Number(amountInput) || 0;
  const total = base;

  const handleRenew = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess(total, duration);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#bae6fd]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#0b1c30]">
                1-Tap Renew Invoice
              </h3>
              <p className="text-xs text-[#64748b]">
                {member ? `Renewal for ${member.name}` : 'Instant Invoice Push'}
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

        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#dcfce7] text-[#15803d] mx-auto flex items-center justify-center animate-bounce">
              <Check className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold font-display text-[#0b1c30]">
              Invoice Pushed & Settled!
            </h4>
            <p className="text-xs font-mono text-slate-500">
              Receipt WhatsApped to {member?.phone || 'athlete'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Manual Amount Entry */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-2">
                RENEWAL AMOUNT (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                step={1}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-bold font-mono text-[#0b1c30] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#bae6fd]"
              />
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-2">
                SELECT EXTENSION DURATION
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setDuration(opt.key)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      duration === opt.key
                        ? 'border-[#0284c7] bg-[#f0f9ff] text-[#006194] font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-display font-semibold">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-2">
                COLLECTION CHANNEL
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('upi')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'upi'
                      ? 'border-[#0284c7] bg-[#eff6ff] text-[#0284c7]'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'cash'
                      ? 'border-[#0284c7] bg-[#eff6ff] text-[#0284c7]'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Cash</span>
                </button>
              </div>
            </div>

            {/* Amount Summary */}
            <div className="p-3 rounded-2xl bg-[#f8fafc] border border-slate-200 flex justify-between items-center text-sm">
              <span className="font-medium text-slate-600">Total Due Now</span>
              <span className="font-mono font-bold text-[#0284c7]">₹{total.toLocaleString()}</span>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleRenew}
              className="w-full py-3 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-display font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Generating Invoice & Push...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm & Push ₹{total.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};