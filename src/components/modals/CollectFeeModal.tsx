import React, { useState } from 'react';
import { X, IndianRupee, Banknote, CheckCircle2 } from 'lucide-react';

interface CollectFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentRecorded: (amount: number, method: string) => void;
}

export const CollectFeeModal: React.FC<CollectFeeModalProps> = ({
  isOpen,
  onClose,
  onPaymentRecorded,
}) => {
  const [amount, setAmount] = useState('2500');
  const [note, setNote] = useState('Personal Training & Supplement');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirmPaid = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onPaymentRecorded(Number(amount) || 2500, 'Cash');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#bae6fd]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#0b1c30]">
                Collect Fee
              </h3>
              <p className="text-xs text-[#64748b]">
                Cash collection
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

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#dcfce7] text-[#15803d] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold font-display text-[#0b1c30]">
              Cash ₹{Number(amount).toLocaleString()} Recorded!
            </h4>
            <p className="text-xs text-[#64748b] font-mono">
              Settlement logged in cycle revenue.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 mt-3">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-600 mb-1">
                CASH AMOUNT TO COLLECT (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-lg font-bold font-display text-[#0b1c30] focus:outline-hidden focus:border-[#0284c7]"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2">
              {['1500', '2500', '4800', '6800'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
                    amount === val
                      ? 'bg-[#eff6ff] text-[#006194] border-[#bae6fd]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-600 mb-1">
                NOTE
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold font-display text-[#0b1c30] focus:outline-hidden focus:border-[#0284c7]"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmPaid}
              className="w-full py-3 px-3 rounded-xl bg-[#006194] hover:bg-[#004d6a] text-white text-sm font-bold font-display shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Banknote className="w-4 h-4" />
              <span>Mark Cash Received</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
