import React from 'react';
import { X, Activity, Flame, Heart, Zap, Clock, ShieldCheck, Check } from 'lucide-react';
import { Member } from '../../types';

interface MemberTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
}

export const MemberTelemetryModal: React.FC<MemberTelemetryModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#bae6fd]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#0b1c30]">
                Athlete Telemetry
              </h3>
              <p className="text-xs text-[#64748b]">
                {member.name} • {member.plan}
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

        <div className="space-y-3.5 mt-4">
          {/* Biometrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-[#eff6ff] border border-[#bae6fd]">
              <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <div className="text-base font-bold font-display text-[#0b1c30]">640</div>
              <div className="text-[9px] font-mono text-[#64748b] uppercase">AVG KCAL/SES</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#eff6ff] border border-[#bae6fd]">
              <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
              <div className="text-base font-bold font-display text-[#0b1c30]">168</div>
              <div className="text-[9px] font-mono text-[#64748b] uppercase">PEAK BPM (Z4)</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#eff6ff] border border-[#bae6fd]">
              <Zap className="w-4 h-4 text-[#0284c7] mx-auto mb-1" />
              <div className="text-base font-bold font-display text-[#0b1c30]">88%</div>
              <div className="text-[9px] font-mono text-[#64748b] uppercase">COMPLIANCE</div>
            </div>
          </div>

          {/* Biometric Intensity Zone Graph */}
          <div className="p-3 rounded-2xl bg-[#f8faff] border border-slate-200 space-y-2">
            <span className="text-[10px] font-mono font-semibold uppercase text-slate-500">
              Heart Rate Intensity Zones
            </span>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-600">Zone 5 (Peak Anaerobic)</span>
                <span className="font-bold text-rose-600">22%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-[22%]" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-600">Zone 4 (Threshold)</span>
                <span className="font-bold text-amber-600">45%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[45%]" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-600">Zone 3 (Aerobic Base)</span>
                <span className="font-bold text-emerald-600">33%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[33%]" />
              </div>
            </div>
          </div>

          {/* Access status */}
          <div className="p-3 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-between text-xs">
            <span className="text-[#15803d] font-mono">Locker Access Status:</span>
            <span className="font-mono font-bold text-[#15803d]">
              {member.locker || 'Unassigned'} • ACTIVE
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#0284c7] text-white font-bold text-xs hover:bg-[#0369a1] transition-colors"
          >
            Close Telemetry Card
          </button>
        </div>
      </div>
    </div>
  );
};
