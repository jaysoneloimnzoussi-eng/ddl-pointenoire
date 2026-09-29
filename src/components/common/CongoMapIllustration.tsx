import React from 'react';
import { MapPin, Compass } from 'lucide-react';
import carteCongoImg from '../../assets/carte_congo.png';

interface CongoMapIllustrationProps {
  className?: string;
}

export const CongoMapIllustration: React.FC<CongoMapIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 select-none text-white ${className}`}>
      {/* Background subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none rounded-2xl" />

      {/* Header Info */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-300 animate-spin-slow" />
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 font-mono-ref">
            Territoire National • 342 000 km²
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-amber-400/30 px-2.5 py-1 rounded-full text-[10px] text-amber-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DDL Pointe-Noire</span>
        </div>
      </div>

      {/* Official Map Image provided by the User */}
      <div className="relative z-10 my-auto w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] flex items-center justify-center p-2">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={carteCongoImg}
            alt="Carte Officielle de la République du Congo"
            className="max-h-full max-w-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:scale-105"
          />

          {/* Pointe-Noire Location Pin Overlay on the South-West Coast */}
          <div className="absolute bottom-[8%] left-[4%] flex items-center gap-1.5 bg-[#022448]/95 border-2 border-amber-400 px-2.5 py-1 rounded-full shadow-xl backdrop-blur-sm animate-bounce">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] font-black tracking-wide text-amber-300 uppercase font-republic">
              Pointe-Noire
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="relative z-10 w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <p className="font-bold text-white text-[11px] leading-tight">Direction Départementale des Loisirs</p>
            <p className="text-[10px] text-amber-200/80">Pointe-Noire • 6 Arrondissements • PTA 2026</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono-ref bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded">
            MCAPNIT
          </span>
        </div>
      </div>
    </div>
  );
};
