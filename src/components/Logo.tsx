import React, { useState } from 'react';

interface LogoProps {
  variant?: 'nav' | 'full' | 'compact' | 'badge';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'nav',
  className = '',
  size = 'md',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Size mappings
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  // If full variant requested
  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative w-11 h-11 rounded-xl bg-[#090d16] border border-[#1e293b] flex items-center justify-center overflow-hidden shadow-sm shrink-0">
          {!imageFailed ? (
            <img
              src="1000350290.webp"
              alt="Madabolicx Logo"
              className="w-full h-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <MadabolicxSvgLogo className="w-8 h-8" />
          )}
        </div>
        <div className="flex flex-col text-left">
          <span className="font-display font-black text-sm tracking-wider text-[#0b1c30] uppercase leading-none">
            MADABOLIC<span className="text-[#0284c7]">X</span>
          </span>
          <span className="text-[9px] font-mono tracking-widest text-[#006194] font-semibold uppercase mt-0.5">
            FITNESS STUDIO
          </span>
        </div>
      </div>
    );
  }

  // Navigation badge variant (shown in screenshot 1: [MX] blue-bordered badge, or logo badge)
  return (
    <div
      className={`relative ${dimensions} rounded-xl overflow-hidden flex items-center justify-center transition-transform active:scale-95 shadow-sm border border-[#bae6fd] bg-[#f0f9ff] hover:border-[#0284c7] cursor-pointer group ${className}`}
      title="Madabolicx Fitness Studio"
    >
      {!imageFailed ? (
        <img
          src="1000350290.webp"
          alt="Madabolicx Logo"
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        /* Fallback: Stylized MX athletic emblem with neon accent */
        <div className="w-full h-full bg-[#070e17] flex flex-col items-center justify-center p-1">
          <div className="flex items-center justify-center">
            <span className="font-display font-black text-xs tracking-tight text-[#d4ff00]">M</span>
            <span className="font-display font-black text-xs tracking-tight text-[#38bdf8]">X</span>
          </div>
          <span className="text-[6px] font-mono tracking-tighter text-slate-400 font-bold leading-none">STUDIO</span>
        </div>
      )}
    </div>
  );
};

// Precise Vector SVG representation of the Madabolicx logo
export const MadabolicxSvgLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="16" fill="#090d16" />
      {/* Upper torso and flexed arms silhouette in signature neon lime #d4ff00 */}
      <path
        d="M50 31C52.5 31 54.5 29 54.5 26.5C54.5 24 52.5 22 50 22C47.5 22 45.5 24 45.5 26.5C45.5 29 47.5 31 50 31Z"
        fill="#d4ff00"
      />
      <path
        d="M37 28C35.5 24.5 31 23 27 24C24 25 22 28 23 31.5C24 35 27 37 31 38L33 44C33 44 26 42 22 46C18 50 20 56 24 56C28 56 35 52 38 48L42 50C43 55 45 61 46 68L50 72L54 68C55 61 57 55 58 50L62 48C65 52 72 56 76 56C80 56 82 50 78 46C74 42 67 44 67 44L69 38C73 37 76 35 77 31.5C78 28 76 25 73 24C69 23 64.5 24.5 63 28L57 32C54.5 33.5 45.5 33.5 43 32L37 28Z"
        fill="#d4ff00"
      />
      {/* Spine & muscular anatomical line accents */}
      <path d="M50 42V56" stroke="#090d16" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M46 39C46 44 44 48 41 51" stroke="#090d16" strokeWidth="2" strokeLinecap="round" />
      <path d="M54 39C54 44 56 48 59 51" stroke="#090d16" strokeWidth="2" strokeLinecap="round" />
      {/* Brand text */}
      <text
        x="50"
        y="83"
        fill="#ffffff"
        fontSize="9"
        fontWeight="900"
        letterSpacing="0.8"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        MADABOLICX
      </text>
      <text
        x="50"
        y="93"
        fill="#d4ff00"
        fontSize="6"
        fontWeight="700"
        letterSpacing="1.2"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        FITNESS STUDIO
      </text>
    </svg>
  );
};
