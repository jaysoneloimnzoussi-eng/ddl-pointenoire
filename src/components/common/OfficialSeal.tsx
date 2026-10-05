import React, { useEffect, useState, useMemo } from 'react';
import { buildVerificationUrl, generateQrSvgDataUrl, getCachedQrUrl } from '../../utils/qrUtils';

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

export interface RepublicQrCodeProps {
  payload?: any;
  data?: any;
  size?: number;
  showDetails?: boolean;
  className?: string;
}

export const RepublicQrCode: React.FC<RepublicQrCodeProps> = ({
  payload,
  data,
  size = 80,
  showDetails = false,
  className = ''
}) => {
  const targetData = payload ?? data;

  const content = useMemo(() => {
    if (typeof targetData === 'string' && targetData.startsWith('http')) {
      return targetData;
    } else if (targetData && typeof targetData === 'object') {
      const refCode = targetData.ref || targetData.pv_number || targetData.receipt || targetData.id || targetData.agent || 'DDL-PN-2026';
      const etabName = targetData.establishment_name || targetData.name || targetData.etab || '';
      const dateStr = targetData.date || '';
      const typeStr = targetData.type || '';
      const agentBadge = targetData.agent || targetData.badge || '';
      const nomStr = targetData.promoter_name || targetData.nom || '';

      return buildVerificationUrl({
        ref: refCode,
        etab: etabName,
        date: dateStr,
        type: typeStr,
        agent: agentBadge,
        nom: nomStr,
        amount: targetData.amount
      });
    }
    return buildVerificationUrl({ ref: 'DDL-PN-2026' });
  }, [
    typeof targetData === 'string' ? targetData : undefined,
    targetData?.ref,
    targetData?.pv_number,
    targetData?.receipt,
    targetData?.id,
    targetData?.agent,
    targetData?.establishment_name,
    targetData?.name,
    targetData?.etab,
    targetData?.date,
    targetData?.type,
    targetData?.promoter_name,
    targetData?.nom,
    targetData?.amount
  ]);

  const [qrDataUrl, setQrDataUrl] = useState<string>(() => getCachedQrUrl(content, size) || '');

  useEffect(() => {
    let isMounted = true;
    generateQrSvgDataUrl(content, size)
      .then(url => {
        if (isMounted && url) {
          setQrDataUrl(url);
        }
      })
      .catch(err => console.error('Erreur génération QR code:', err));

    return () => {
      isMounted = false;
    };
  }, [content, size]);

  return (
    <div className={`inline-flex flex-col items-center text-center ${className}`}>
      <a
        href={content}
        target="_blank"
        rel="noopener noreferrer"
        title="Scanner ou cliquer pour vérifier l'authenticité"
        className="block cursor-pointer transition-transform hover:scale-105"
        style={{ textDecoration: 'none' }}
      >
        <div
          className="p-1 bg-white border border-slate-300 shadow-xs rounded flex items-center justify-center overflow-hidden"
          style={{
            width: size + 6,
            height: size + 6,
            minWidth: size + 6,
            minHeight: size + 6,
            backgroundColor: '#ffffff',
            boxSizing: 'border-box'
          }}
        >
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code Officiel Républicain"
              className="w-full h-full object-contain select-none"
              style={{
                display: 'block',
                width: '100%',
                height: '100%'
              }}
            />
          ) : (
            <div
              className="w-full h-full bg-white flex flex-col items-center justify-center text-[8px] font-bold text-slate-500"
              style={{ backgroundColor: '#ffffff' }}
            >
              <span>QR</span>
            </div>
          )}
        </div>
      </a>
      {showDetails && (
        <div className="mt-1 font-mono-ref leading-tight">
          <p className="text-[7.5px] font-black uppercase text-slate-900 tracking-wider">
            QR CODE VÉRIFIABLE
          </p>
          <p className="text-[6px] text-emerald-800 font-bold uppercase">
            ✓ Certifié MCAPNIT / DDL-PN
          </p>
        </div>
      )}
    </div>
  );
};

