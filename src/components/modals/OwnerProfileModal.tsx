import React from 'react';
import { X, User, Building2, ShieldCheck, Activity, Smartphone, Mail, Cloud } from 'lucide-react';
import { Logo } from '../Logo';

interface OwnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerProfileModal: React.FC<OwnerProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#bae6fd]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Logo variant="nav" size="md" />
            <div>
              <h3 className="text-base font-bold font-display text-[#0b1c30]">
                Executive Control Profile
              </h3>
              <p className="text-xs font-mono text-[#0284c7]">
                Master Administrator
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

        <div className="space-y-3 mt-4">
          <div className="p-3.5 rounded-2xl bg-[#090d16] text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0284c7] text-white flex items-center justify-center text-lg font-bold font-display shrink-0">
              BV
            </div>
            <div>
              <h4 className="text-sm font-bold font-display">
                Bhushan Vidhate
              </h4>
              <p className="text-[11px] text-slate-300">
                Franchise Director & Head Coach
              </p>
              <div className="flex items-center gap-1 text-[10px] font-mono text-[#d4ff00] mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>ROOT ACCESS GRANTED</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#f8faff] border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono">STUDIO CODE:</span>
              <span className="font-mono font-bold text-[#006194]">MADABOLICX-MUM-01</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono">CONNECTED BRANCHES:</span>
              <span className="font-bold text-[#0b1c30]">2 Facilities Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono">TURNSTILE GATEWAYS:</span>
              <span className="font-mono text-emerald-600 font-bold">● 4/4 Online (0.12s)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#eff6ff] border border-[#bae6fd] flex items-center justify-between text-[11px] font-mono text-[#006194]">
            <span className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-[#0284c7]" />
              Database Real-time Telemetry
            </span>
            <span className="font-bold">100% HEALTH</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#006194] text-white font-display font-bold text-xs hover:bg-[#004d6a] transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
