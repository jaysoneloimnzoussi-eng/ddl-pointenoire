import React from 'react';
import carteCongoSansFond from '../../assets/carte_congo_sans_fond.png';

interface CongoMapIllustrationProps {
  className?: string;
}

export const CongoMapIllustration: React.FC<CongoMapIllustrationProps> = ({
  className = ''
}) => {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-6 sm:p-8 select-none ${className}`}>
      <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-[3/4] flex items-center justify-center">
        <img
          src={carteCongoSansFond}
          alt="Carte Officielle de la République du Congo"
          className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-105"
        />
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-widest text-[#022448] font-republic text-center">
        République du Congo
      </p>
      <p className="text-[10px] text-slate-500 font-semibold tracking-wide text-center">
        Direction Départementale des Loisirs • Pointe-Noire
      </p>
    </div>
  );
};
