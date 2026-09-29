import React from 'react';
import { MapPin, Sparkles, Compass } from 'lucide-react';

interface CongoMapIllustrationProps {
  className?: string;
  selectedDept?: string;
  onSelectDept?: (dept: string) => void;
}

export const CongoMapIllustration: React.FC<CongoMapIllustrationProps> = ({
  className = '',
  selectedDept = 'Pointe-Noire',
  onSelectDept,
}) => {
  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 select-none text-white ${className}`}>
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none rounded-2xl" />

      {/* Header Info */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-300 animate-spin-slow" />
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 font-mono-ref">
            Territoire National • 342 000 km²
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm border border-amber-400/30 px-2.5 py-1 rounded-full text-[10px] text-amber-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Hub Régional DDL-PN</span>
        </div>
      </div>

      {/* Stylized Republic of the Congo SVG Map */}
      <div className="relative z-10 my-auto w-full max-w-[340px] aspect-[4/5] flex items-center justify-center">
        <svg
          viewBox="0 0 400 500"
          className="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Grid / Coordinates lines */}
          <line x1="50" y1="250" x2="350" y2="250" stroke="#fcd116" strokeOpacity="0.15" strokeDasharray="4 4" />
          <line x1="200" y1="50" x2="200" y2="450" stroke="#fcd116" strokeOpacity="0.15" strokeDasharray="4 4" />
          <text x="55" y="244" fill="#fcd116" fillOpacity="0.4" fontSize="9" fontFamily="monospace">EQUATEUR 0°</text>

          {/* Congo River Flow Graphic */}
          <path
            d="M 330 110 Q 300 200 270 290 T 210 390 T 150 430"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeOpacity="0.45"
            strokeLinecap="round"
            strokeDasharray="6 3"
          />
          <text x="245" y="320" fill="#38bdf8" fillOpacity="0.7" fontSize="9" fontWeight="bold" transform="rotate(-40 245 320)">Fleuve Congo</text>

          {/* Stylized Geographic Silhouette of Republic of Congo */}
          {/* North (Likouala, Sangha) */}
          <path
            d="M 210 40 
               C 270 50, 310 90, 325 150 
               C 335 190, 315 240, 290 280 
               C 280 295, 275 320, 270 340 
               C 255 375, 240 395, 215 410 
               C 190 425, 160 435, 140 430 
               C 115 425, 95 440, 80 435 
               C 70 430, 85 410, 100 395 
               C 120 375, 135 345, 140 310 
               C 145 270, 130 230, 140 190 
               C 150 150, 175 100, 195 60 
               Z"
            fill="url(#congoGradient)"
            stroke="#fcd116"
            strokeWidth="2.5"
            className="transition-all duration-300 hover:brightness-110"
          />

          {/* Department Boundaries Lines (stylized internal administrative sectors) */}
          <path d="M 195 130 Q 250 150 315 150" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 160 210 Q 220 220 295 240" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 140 290 Q 200 300 270 320" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 130 360 Q 180 370 235 390" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 105 400 Q 130 405 160 415" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* Department Labels */}
          <text x="240" y="95" fill="#ffffff" fillOpacity="0.7" fontSize="10" fontWeight="bold">LIKOUALA</text>
          <text x="175" y="145" fill="#ffffff" fillOpacity="0.7" fontSize="10" fontWeight="bold">SANGHA</text>
          <text x="210" y="210" fill="#ffffff" fillOpacity="0.7" fontSize="10" fontWeight="bold">CUVETTE</text>
          <text x="170" y="270" fill="#ffffff" fillOpacity="0.7" fontSize="10" fontWeight="bold">PLATEAUX</text>
          <text x="180" y="340" fill="#ffffff" fillOpacity="0.7" fontSize="10" fontWeight="bold">POOL</text>
          <text x="120" y="375" fill="#ffffff" fillOpacity="0.7" fontSize="9" fontWeight="bold">BOUENZA</text>
          <text x="90" y="410" fill="#ffffff" fillOpacity="0.7" fontSize="8" fontWeight="bold">KOUILOU</text>

          {/* Brazzaville Capital Marker */}
          <circle cx="218" cy="392" r="5" fill="#fcd116" stroke="#000" strokeWidth="1.5" />
          <text x="228" y="396" fill="#fcd116" fontSize="11" fontWeight="900">Brazzaville</text>
          <text x="228" y="407" fill="#ffffff" fillOpacity="0.8" fontSize="8">Siège MCAPNIT</text>

          {/* POINTE-NOIRE SPECIAL HIGHLIGHT (DDL-PN TARGET) */}
          <g className="cursor-pointer" onClick={() => onSelectDept?.('Pointe-Noire')}>
            {/* Pulsing ring */}
            <circle cx="82" cy="432" r="18" fill="#fcd116" fillOpacity="0.25" className="animate-ping" />
            <circle cx="82" cy="432" r="10" fill="#006d2f" stroke="#fcd116" strokeWidth="2.5" />
            <circle cx="82" cy="432" r="4" fill="#ffffff" />
            
            {/* Glow banner */}
            <rect x="25" y="448" width="125" height="24" rx="12" fill="#022448" stroke="#fcd116" strokeWidth="1.5" />
            <text x="87" y="464" fill="#fcd116" fontSize="11" fontWeight="900" textAnchor="middle">POINTE-NOIRE</text>
          </g>

          {/* Atlantic Ocean */}
          <text x="40" y="475" fill="#38bdf8" fillOpacity="0.5" fontSize="10" fontWeight="extrabold" transform="rotate(-25 40 475)">OCÉAN ATLANTIQUE</text>

          {/* Gradients */}
          <defs>
            <linearGradient id="congoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#006d2f" />
              <stop offset="50%" stopColor="#005224" />
              <stop offset="85%" stopColor="#022448" />
              <stop offset="100%" stopColor="#011830" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Footer Info Box */}
      <div className="relative z-10 w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <p className="font-bold text-white text-[11px] leading-tight">Département de Pointe-Noire</p>
            <p className="text-[10px] text-amber-200/80">6 Arrondissements • 117 Établissements en régulation</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono-ref bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded">
            PTA 2026
          </span>
        </div>
      </div>
    </div>
  );
};
