import React from 'react';
import { X, QrCode, ShieldCheck } from 'lucide-react';

interface QRTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRTerminalModal: React.FC<QRTerminalModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#bae6fd]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#0b1c30]">
                QR Attendance Terminal
              </h3>
              <p className="text-xs text-[#64748b]">
                Scan to check in · Trainer access
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

        {/* Static Attendance & Checkout QRs */}
        <div className="space-y-2 mt-4">
          <span className="text-[10px] font-mono uppercase text-[#64748b] font-semibold tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-[#0284c7]" />
            STATIC QR · TRAINER SCAN
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Adgaon */}
            <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-slate-100 space-y-2 hover:border-[#bae6fd] transition-all">
              <img
                src="/qr/attendance-adgaon.png"
                alt="Adgaon check-in QR"
                className="w-full aspect-square object-cover rounded-lg bg-white p-1 border border-slate-100"
              />
              <div className="text-center -mt-0.5">
                <span className="inline-block px-1.5 py-0.5 rounded-md bg-[#eff6ff] text-[#006194] text-[8px] font-mono font-bold">
                  CHECK-IN
                </span>
              </div>
              <img
                src="/qr/checkout-adgaon.png"
                alt="Adgaon checkout QR"
                className="w-full aspect-square object-cover rounded-lg bg-white p-1 border border-slate-100"
              />
              <div className="text-center -mt-0.5">
                <span className="inline-block px-1.5 py-0.5 rounded-md bg-[#fdf2f8] text-[#be185d] text-[8px] font-mono font-bold">
                  CHECKOUT
                </span>
              </div>
              <div className="text-center pt-0.5">
                <div className="text-[11px] font-bold text-[#0b1c30] font-display tracking-wide">
                  ADGAON
                </div>
                <div className="text-[9px] font-mono text-[#64748b]">GATE-01 · GYM</div>
              </div>
            </div>

            {/* Jatra */}
            <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-slate-100 space-y-2 hover:border-[#bae6fd] transition-all">
              <img
                src="/qr/attendance-jatra.png"
                alt="Jatra check-in QR"
                className="w-full aspect-square object-cover rounded-lg bg-white p-1 border border-slate-100"
              />
              <div className="text-center -mt-0.5">
                <span className="inline-block px-1.5 py-0.5 rounded-md bg-[#eff6ff] text-[#006194] text-[8px] font-mono font-bold">
                  CHECK-IN
                </span>
              </div>
              <img
                src="/qr/checkout-jatra.png"
                alt="Jatra checkout QR"
                className="w-full aspect-square object-cover rounded-lg bg-white p-1 border border-slate-100"
              />
              <div className="text-center -mt-0.5">
                <span className="inline-block px-1.5 py-0.5 rounded-md bg-[#fdf2f8] text-[#be185d] text-[8px] font-mono font-bold">
                  CHECKOUT
                </span>
              </div>
              <div className="text-center pt-0.5">
                <div className="text-[11px] font-bold text-[#0b1c30] font-display tracking-wide">
                  JATRA HOTEL
                </div>
                <div className="text-[9px] font-mono text-[#64748b]">GATE-01 · GYM</div>
              </div>
            </div>
          </div>
          <p className="text-[9px] font-mono text-slate-400 text-center px-1">
            Static &amp; offline · trainers scan to post attendance / checkout
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-slate-100 text-center">
          <span className="text-[10px] font-mono text-slate-400">
            Madabolicx Attendance Terminal v3.4
          </span>
        </div>
      </div>
    </div>
  );
};