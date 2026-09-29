import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showMotto?: boolean;
  className?: string;
}

export const OfficialRepublicLogo: React.FC<LogoProps> = ({
  size = 'md',
  showMotto = false,
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-11 h-11',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    '2xl': 'w-44 h-44'
  };

  return (
    <div className={`inline-flex flex-col items-center text-center ${className}`}>
      <img
        src="/logo_congo.svg"
        onError={(e) => {
          // Fallback to PNG if SVG fails
          const target = e.currentTarget;
          if (!target.src.endsWith('/logo_congo.png')) {
            target.src = '/logo_congo.png';
          }
        }}
        alt="Armoiries de la République du Congo"
        className={`${sizeMap[size]} object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105 select-none`}
        loading="eager"
      />
      {showMotto && (
        <div className="mt-1 text-center">
          <p className="text-[10px] font-extrabold tracking-widest text-[#006d2f] uppercase font-republic">
            République du Congo
          </p>
          <p className="text-[8px] font-bold tracking-wider text-amber-700 italic">
            Unité • Travail • Progrès
          </p>
        </div>
      )}
    </div>
  );
};

// Aliases replacing all previous seals with this exact official logo
export const RepublicCoatOfArms = OfficialRepublicLogo;
export const DdlPnInstitutionalSeal = OfficialRepublicLogo;

export const RepublicTricolorBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full h-1.5 flex ${className}`}>
      <div className="w-1/3 bg-[#006d2f]" />
      <div className="w-1/3 bg-[#ffd700]" />
      <div className="w-1/3 bg-[#dc2626]" />
    </div>
  );
};
