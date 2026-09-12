import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, UserCheck, ShieldCheck, Zap } from 'lucide-react';

interface QRTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAthleteCheckedIn: (name: string, locker: string) => void;
}

export const QRTerminalModal: React.FC<QRTerminalModalProps> = ({
  isOpen,
  onClose,
  onAthleteCheckedIn,
}) => {
  const [scanState, setScanState] = useState<'scanning' | 'granted' | 'idle'>('scanning');
  const [scannedAthlete, setScannedAthlete] = useState<string | null>(null);
  const [assignedLocker, setAssignedLocker] = useState<string>('Locker #42');

  if (!isOpen) return null;

  const handleSimulateScan = (name: string, plan: string, lockerNum: string) => {
    setScannedAthlete(name);
    setAssignedLocker(lockerNum);
    setScanState('granted');
    onAthleteCheckedIn(name, lockerNum);

    setTimeout(() => {
      setScanState('scanning');
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#090d16] text-white rounded-3xl p-6 shadow-2xl border border-cyan-500/40">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
            <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
              TURNSTILE GATE #01 • ONLINE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {scanState === 'granted' ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                ACCESS GRANTED • TURNSTILE UNLOCKED
              </div>
              <h4 className="text-xl font-bold font-display text-white mt-1">
                {scannedAthlete}
              </h4>
              <p className="text-xs font-mono text-cyan-300 mt-0.5">
                {assignedLocker} UNLOCKED
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
              Biometric telemetry sync active. Heart zone connected.
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-4">
            {/* Camera Viewfinder Mock */}
            <div className="relative h-56 rounded-2xl bg-black border-2 border-cyan-500/50 overflow-hidden flex flex-col items-center justify-center">
              {/* Corner targeting brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              {/* Laser scanning line animation */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-[0_0_12px_#38bdf8]" />

              <QrCode className="w-20 h-20 text-cyan-500/40 animate-pulse" />
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                Align Athlete Pass or NFC Band
              </p>
            </div>

            {/* Instant Test Triggers */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                Tap Athlete to Simulate Check-in:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateScan('Rohit Sharma', 'Annual Gold', 'Locker #42')}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-left text-xs font-semibold hover:bg-slate-850 transition-all"
                >
                  <div className="text-white truncate">Rohit Sharma</div>
                  <div className="text-[10px] font-mono text-cyan-400">Locker #42</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateScan('Aman Verma', 'Quarterly Pro', 'Locker #19')}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-left text-xs font-semibold hover:bg-slate-850 transition-all"
                >
                  <div className="text-white truncate">Aman Verma</div>
                  <div className="text-[10px] font-mono text-cyan-400">Locker #19</div>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-500">
            Madabolicx Turnstile System v3.4 • 0.12s latency
          </span>
        </div>
      </div>
    </div>
  );
};
