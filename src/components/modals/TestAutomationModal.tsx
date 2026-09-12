import React, { useState } from 'react';
import { X, FlaskConical, Send, Smartphone, MessageSquare } from 'lucide-react';

interface TestAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatch: (phoneE164: string) => void;
}

export const TestAutomationModal: React.FC<TestAutomationModalProps> = ({ isOpen, onClose, onDispatch }) => {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(false);

  if (!isOpen) return null;

  const toE164 = (digits: string) => (digits.length === 10 ? `91${digits}` : digits);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError(true);
      return;
    }
    onDispatch(toE164(phone));
    setPhone('');
    setPhoneError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#bae6fd]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#006194] flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#0b1c30]">
                Sample Automation Test
              </h3>
              <p className="text-xs text-[#64748b]">
                Real-time renewal WhatsApp
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="p-3 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] text-xs text-[#006194] flex items-start gap-2">
            <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              A dummy athlete is created (id <span className="font-mono font-bold">mem-auto-test</span>)
              and a gym-pass renewal message is sent to the WhatsApp number you enter below.
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-600 mb-1">
              WHATSAPP NUMBER (+91) *
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
                autoFocus
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setPhoneError(false);
                }}
                placeholder="98765 43210"
                className="w-full px-3 py-2.5 text-sm tracking-wide focus:outline-none"
              />
            </div>
            {phoneError && (
              <p className="text-[10px] font-mono font-semibold text-[#ba1a1a] mt-1">
                Enter a valid 10-digit mobile number
              </p>
            )}
            <p className="text-[10px] font-mono text-slate-400 mt-1.5">
              LIVE mode sends via Graph API · otherwise a wa.me window opens for you to press send
            </p>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold font-display shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Send Test
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <Smartphone className="w-3 h-3" />
            Test recipient: {phone ? `+91 ${phone}` : '—'}
          </div>
        </form>
      </div>
    </div>
  );
};