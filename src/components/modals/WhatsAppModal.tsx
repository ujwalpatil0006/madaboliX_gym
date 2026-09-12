import React, { useState } from 'react';
import { X, MessageSquare, Send, Copy, Check, ExternalLink } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  phone: string;
  amount?: number;
  plan?: string;
  type?: 'expiry' | 'overdue' | 'churn';
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  phone,
  amount,
  plan,
  type = 'expiry',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanPhone = phone.replace(/[^0-9]/g, '');

  let defaultMessage = `Hey ${recipientName}! 💪 This is Madabolicx Fitness Studio. Your ${plan || 'membership'} is ending soon. Renew today to keep your floor locker and uninterrupted biometric training access! Instant 1-tap link: https://madabolicx.in/pay/${cleanPhone}`;

  if (type === 'overdue' || (amount && amount > 0)) {
    defaultMessage = `Hi ${recipientName}, reminder from Madabolicx Fitness Studio. Your renewal balance of ₹${amount?.toLocaleString()} for ${plan || 'membership'} is due. Please settle via UPI or visit the front desk: https://madabolicx.in/pay/${cleanPhone}`;
  } else if (type === 'churn') {
    defaultMessage = `Hey ${recipientName}! We missed you at the Downtown Hub turnstile this week! 🏋️ Your coach has set up a custom metabolic re-entry session. Drop in anytime today!`;
  }

  const [message, setMessage] = useState(defaultMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#bae6fd]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#22c55e] text-white flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#0b1c30]">
                WhatsApp Nudge
              </h3>
              <p className="text-xs text-[#64748b]">
                Push to {recipientName} ({phone})
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

        <div className="space-y-3 mt-4">
          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-600 mb-1">
              MESSAGE TEMPLATE (EDITABLE)
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-hidden focus:border-[#22c55e]"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs text-[#15803d] flex items-center justify-between">
            <span>Status: Verified Indian (+91) WhatsApp Number</span>
            <span className="font-bold font-mono">ONLINE</span>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-display font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
