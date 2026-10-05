import React, { useEffect, useState, useMemo } from 'react';
import { buildVerificationUrl, generateQrSvgDataUrl, getCachedQrUrl } from '../../utils/qrUtils';

interface OfficialVerifiableQrCodeProps {
  data: {
    ref?: string;
    type?: string;
    establishment_name?: string;
    promoter_name?: string;
    date?: string;
    amount?: number;
    arrondissement?: string;
  };
  size?: number;
  showDetails?: boolean;
  className?: string;
}

export const OfficialVerifiableQrCode: React.FC<OfficialVerifiableQrCodeProps> = ({
  data,
  size = 90,
  showDetails = true,
  className = ''
}) => {
  // Construct stable verification URL
  const verifyUrl = useMemo(() => {
    return buildVerificationUrl({
      ref: data.ref,
      type: data.type,
      etab: data.establishment_name,
      nom: data.promoter_name,
      date: data.date,
      amount: data.amount
    });
  }, [
    data.ref,
    data.type,
    data.establishment_name,
    data.promoter_name,
    data.date,
    data.amount
  ]);

  // Initialize with cached QR if available for 0ms flicker-free render
  const [qrDataUrl, setQrDataUrl] = useState<string>(() => getCachedQrUrl(verifyUrl, size) || '');

  useEffect(() => {
    let isMounted = true;

    // Generate crisp cross-platform vector SVG QR Code
    generateQrSvgDataUrl(verifyUrl, size)
      .then(url => {
        if (isMounted && url) {
          setQrDataUrl(url);
        }
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [verifyUrl, size]);

  return (
    <div className={`inline-flex flex-col items-center text-center ${className}`}>
      <a
        href={verifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Scanner ou cliquer pour vérifier l'authenticité officielle de ce document"
        className="block group cursor-pointer transition-transform hover:scale-105"
        style={{ textDecoration: 'none' }}
      >
        <div
          className="p-1 bg-white border border-slate-400 shadow-xs rounded flex items-center justify-center overflow-hidden"
          style={{
            width: size + 8,
            height: size + 8,
            minWidth: size + 8,
            minHeight: size + 8,
            backgroundColor: '#ffffff',
            boxSizing: 'border-box'
          }}
        >
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code Vérifiable - ${data.ref || 'DDL-PN'}`}
              className="w-full h-full object-contain select-none"
              style={{
                imageRendering: 'pixelated',
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center text-[8px] font-bold text-slate-500 bg-white"
              style={{ backgroundColor: '#ffffff' }}
            >
              <span>QR</span>
              <span className="text-[6px] text-slate-400">OFFICIEL</span>
            </div>
          )}
        </div>
      </a>

      {showDetails && (
        <div className="mt-1 font-mono-ref leading-tight">
          <p className="text-[7.5px] font-black uppercase text-slate-900 tracking-wider">
            QR CODE VÉRIFIABLE
          </p>
          <p className="text-[6.5px] text-slate-600">
            Réf: {data.ref || 'DDL-PN-2026'}
          </p>
          <p className="text-[6px] text-emerald-800 font-bold uppercase">
            ✓ Certifié MCAPNIT / DDL-PN
          </p>
        </div>
      )}
    </div>
  );
};
