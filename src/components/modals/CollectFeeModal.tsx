import React, { useState } from 'react';
import { X, IndianRupee, QrCode, Copy, Check, CheckCircle2, ArrowRight } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const upiId = 'madabolicx.fitness@icici';
  const upiLink = `upi://pay?pa=${upiId}&pn=Madabolicx%20Fitness&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPaid = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onPaymentRecorded(Number(amount) || 2500, 'UPI QR');
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
                Collect Fee / POS
              </h3>
              <p className="text-xs text-[#64748b]">
                Dynamic UPI QR & Cash
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
              Payment ₹{Number(amount).toLocaleString()} Recorded!
            </h4>
            <p className="text-xs text-[#64748b] font-mono">
              Settlement logged in cycle revenue.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 mt-3">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-600 mb-1">
                AMOUNT TO COLLECT (₹)
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

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-white border border-[#bae6fd] shadow-inner flex flex-col items-center justify-center space-y-2">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-36 h-36">
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="26" height="26" fill="#004d6a" rx="4" />
                  <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="13" y="13" width="10" height="10" fill="#004d6a" rx="1" />

                  <rect x="69" y="5" width="26" height="26" fill="#004d6a" rx="4" />
                  <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="77" y="13" width="10" height="10" fill="#004d6a" rx="1" />

                  <rect x="5" y="69" width="26" height="26" fill="#004d6a" rx="4" />
                  <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="13" y="77" width="10" height="10" fill="#004d6a" rx="1" />

                  {/* Pixel matrix modules */}
                  <rect x="36" y="8" width="6" height="6" fill="#0284c7" />
                  <rect x="46" y="8" width="6" height="6" fill="#0b1c30" />
                  <rect x="56" y="14" width="6" height="6" fill="#0284c7" />
                  <rect x="36" y="24" width="6" height="6" fill="#0b1c30" />
                  <rect x="46" y="24" width="6" height="6" fill="#0284c7" />

                  <rect x="8" y="38" width="6" height="6" fill="#0b1c30" />
                  <rect x="20" y="38" width="6" height="6" fill="#0284c7" />
                  <rect x="38" y="38" width="8" height="8" fill="#0284c7" />
                  <rect x="52" y="38" width="6" height="6" fill="#0b1c30" />
                  <rect x="66" y="38" width="6" height="6" fill="#0284c7" />
                  <rect x="80" y="38" width="6" height="6" fill="#0b1c30" />

                  <rect x="38" y="52" width="6" height="6" fill="#0b1c30" />
                  <rect x="48" y="52" width="8" height="8" fill="#0284c7" />
                  <rect x="62" y="52" width="6" height="6" fill="#0b1c30" />
                  <rect x="78" y="52" width="6" height="6" fill="#0284c7" />

                  <rect x="38" y="68" width="6" height="6" fill="#0284c7" />
                  <rect x="50" y="68" width="6" height="6" fill="#0b1c30" />
                  <rect x="64" y="68" width="6" height="6" fill="#0284c7" />
                  <rect x="80" y="68" width="6" height="6" fill="#0b1c30" />

                  <rect x="38" y="82" width="8" height="8" fill="#0b1c30" />
                  <rect x="54" y="82" width="6" height="6" fill="#0284c7" />
                  <rect x="70" y="82" width="6" height="6" fill="#0b1c30" />
                  <rect x="84" y="82" width="6" height="6" fill="#0284c7" />

                  {/* Madabolicx center badge */}
                  <rect x="40" y="40" width="20" height="20" rx="4" fill="#070e17" />
                  <text x="50" y="54" fill="#d4ff00" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                    MX
                  </text>
                </svg>
              </div>

              <div className="text-center">
                <span className="text-xs font-mono font-bold text-[#0b1c30]">
                  Scan with GPay / PhonePe / Paytm
                </span>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  VPA: {upiId}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied UPI!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPaid}
                className="flex-1 py-2 px-3 rounded-xl bg-[#006194] hover:bg-[#004d6a] text-white text-xs font-bold font-display shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Settled</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
