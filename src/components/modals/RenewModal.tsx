import React, { useState } from 'react';
import { X, Zap, Check, IndianRupee, Send, Smartphone, CreditCard, Building } from 'lucide-react';
import { Member } from '../../types';

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
  onSuccess: (amount: number, duration: string) => void;
}

export const RenewModal: React.FC<RenewModalProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess,
}) => {
  const [duration, setDuration] = useState<'1m' | '3m' | '12m'>('1m');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash' | 'pos'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const baseRates = {
    '1m': member?.amountDue || 2500,
    '3m': (member?.amountDue || 2500) * 2.7,
    '12m': (member?.amountDue || 2500) * 9.5,
  };

  const total = Math.round(baseRates[duration]);
  const baseBeforeGST = Math.round(total / 1.18);
  const gstAmount = total - baseBeforeGST;

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
            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-2">
                SELECT EXTENSION DURATION
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDuration('1m')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    duration === '1m'
                      ? 'border-[#0284c7] bg-[#f0f9ff] text-[#006194] font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-display">+1 Month</div>
                  <div className="text-xs font-mono mt-0.5">₹{Math.round(baseRates['1m']).toLocaleString()}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDuration('3m')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    duration === '3m'
                      ? 'border-[#0284c7] bg-[#f0f9ff] text-[#006194] font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-display">+3 Months</div>
                  <div className="text-xs font-mono mt-0.5">₹{Math.round(baseRates['3m']).toLocaleString()}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDuration('12m')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    duration === '12m'
                      ? 'border-[#0284c7] bg-[#f0f9ff] text-[#006194] font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-display">+1 Year</div>
                  <div className="text-xs font-mono mt-0.5">₹{Math.round(baseRates['12m']).toLocaleString()}</div>
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 mb-2">
                COLLECTION CHANNEL
              </label>
              <div className="grid grid-cols-3 gap-2">
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
                  onClick={() => setPaymentMode('pos')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'pos'
                      ? 'border-[#0284c7] bg-[#eff6ff] text-[#0284c7]'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>POS Card</span>
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

            {/* GST Itemized Breakdown */}
            <div className="p-3 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Base Membership Fee</span>
                <span className="font-mono">₹{baseBeforeGST.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST (18% SAC: 999723)</span>
                <span className="font-mono">₹{gstAmount.toLocaleString()}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-sm text-[#0b1c30]">
                <span>Total Due Now</span>
                <span className="font-mono text-[#0284c7]">₹{total.toLocaleString()}</span>
              </div>
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
