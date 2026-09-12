import React, { useState } from 'react';
import { Logo } from './Logo';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { BranchLocation } from '../types';

interface HeaderProps {
  currentBranch: BranchLocation;
  onSelectBranch: (branch: BranchLocation) => void;
  syncActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentBranch,
  onSelectBranch,
  syncActive = true,
}) => {
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  const branches: { name: BranchLocation; label: string }[] = [
    { name: 'Jatra Hotel', label: 'Jatra Hotel' },
    { name: 'Adgaon', label: 'Adgaon' },
    { name: 'All Locations', label: 'All Branches' },
  ];

  const currentLabel = branches.find((b) => b.name === currentBranch)?.label ?? currentBranch;

  return (
    <header className="relative z-30 w-full px-4 pt-4 pb-2">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* Left: Branded Logo (hotlinking 1000350290.webp with fallback) */}
        <div className="flex items-center">
          <Logo variant="nav" size="md" />
        </div>

        {/* Center: Branch Selector Pill */}
        <div className="relative flex-1 max-w-[260px]">
          <button
            type="button"
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#bae6fd]/80 shadow-[0_2px_8px_rgba(2,132,199,0.06)] hover:border-[#0284c7] hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
              <span className="text-xs font-semibold text-[#0b1c30] truncate font-display">
                {currentLabel}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${showBranchMenu ? 'rotate-180' : ''}`} />
            </div>

            {/* Sync Active Badge */}
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#f0f9ff] border border-[#bae6fd] shrink-0">
              <span className="relative flex h-1.5 w-1.5">
                {syncActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0284c7] opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0284c7]"></span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-tight text-[#006194]">
                LIVE
              </span>
            </div>
          </button>

          {/* Branch Dropdown Menu */}
          {showBranchMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowBranchMenu(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-[#bae6fd] shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 mb-1 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Studio Locations
                  </span>
                </div>
                {branches.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => {
                      onSelectBranch(b.name);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      currentBranch === b.name
                        ? 'bg-[#f0f9ff] text-[#006194] font-semibold border border-[#bae6fd]'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-display">{b.label}</span>
                    {currentBranch === b.name && (
                      <Check className="w-4 h-4 text-[#0284c7]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
