import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { buildVerificationUrl } from '../../utils/qrUtils';

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
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const targetData = payload ?? data;

  useEffect(() => {
    let content = '';
    if (typeof targetData === 'string' && targetData.startsWith('http')) {
      content = targetData;
    } else if (targetData && typeof targetData === 'object') {
      const refCode = targetData.ref || targetData.pv_number || targetData.receipt || targetData.id || targetData.agent || 'DDL-PN-2026';
      const etabName = targetData.establishment_name || targetData.name || targetData.etab || '';
      const dateStr = targetData.date || '';
      const typeStr = targetData.type || '';
      const agentBadge = targetData.agent || targetData.badge || '';
      const nomStr = targetData.promoter_name || targetData.nom || '';

      content = buildVerificationUrl({
        ref: refCode,
        etab: etabName,
        date: dateStr,
        type: typeStr,
        agent: agentBadge,
        nom: nomStr,
        amount: targetData.amount
      });
    } else {
      content = buildVerificationUrl({ ref: 'DDL-PN-2026' });
    }

    QRCode.toDataURL(content, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size * 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Erreur génération QR code:', err));
  }, [targetData, size]);

  return (
    <div className={`inline-flex flex-col items-center text-center ${className}`}>
      <div
        className="p-1 bg-white border border-slate-300 shadow-xs rounded flex items-center justify-center"
        style={{ width: size + 6, height: size + 6 }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR Code Officiel Républicain"
            className="w-full h-full object-contain select-none"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">
            QR
          </div>
        )}
      </div>
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

