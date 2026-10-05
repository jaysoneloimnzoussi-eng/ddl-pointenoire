/**
 * Utility for generating authentic, clickable verification URLs for QR Codes
 * Ensuring mobile phone cameras, QR scanners, and web platforms instantly recognize
 * and display the payload as an actionable, reliable web URL across all devices.
 */
import QRCode from 'qrcode';

export interface VerificationPayload {
  ref?: string;
  etab?: string;
  date?: string;
  type?: string;
  agent?: string;
  nom?: string;
  role?: string;
  amount?: number;
  pv_number?: string;
  status?: string;
}

// In-memory cache for generated QR codes to prevent blank flashes and ensure instant rendering
const qrSvgCache = new Map<string, string>();
const qrDataUrlCache = new Map<string, string>();

export function buildVerificationUrl(data: VerificationPayload): string {
  // Public fallback for external mobile devices scanning from screens or paper
  const PUBLIC_APP_URL = 'https://ais-pre-eedzfutctb3pod5wchnxf4-423672129970.europe-west2.run.app';

  let origin = PUBLIC_APP_URL;
  if (typeof window !== 'undefined' && window.location.origin) {
    const currentOrigin = window.location.origin;
    // If not local loopback, use the real current domain so it adapts to any deployment
    if (!currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
      origin = currentOrigin;
    }
  }

  const refCode = data.ref || data.pv_number || data.agent || 'DDL-PN-2026';
  const searchParams = new URLSearchParams();
  searchParams.set('verify', '1');
  searchParams.set('ref', refCode);

  if (data.etab) searchParams.set('etab', data.etab);
  if (data.date) searchParams.set('date', data.date);
  if (data.type) searchParams.set('type', data.type);
  if (data.agent) searchParams.set('agent', data.agent);
  if (data.nom) searchParams.set('nom', data.nom);
  if (data.role) searchParams.set('role', data.role);
  if (data.amount !== undefined) searchParams.set('amount', String(data.amount));
  if (data.status) searchParams.set('status', data.status);

  // Return clean, pure HTTP/HTTPS URL
  return `${origin}/?${searchParams.toString()}`;
}

/**
 * Generate high-definition SVG data URL for crisp rendering on any screen,
 * retina display, print output, and across all mobile/desktop platforms without canvas dependencies.
 */
export async function generateQrSvgDataUrl(text: string, size = 160): Promise<string> {
  const cacheKey = `${text}_${size}`;
  if (qrSvgCache.has(cacheKey)) {
    return qrSvgCache.get(cacheKey)!;
  }

  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      margin: 1,
      width: Math.max(size * 3, 360),
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    qrSvgCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (err) {
    console.error('Erreur génération QR code SVG:', err);
    // Fallback to standard dataURL
    return generateQrPngDataUrl(text, size);
  }
}

export async function generateQrPngDataUrl(text: string, size = 160): Promise<string> {
  const cacheKey = `png_${text}_${size}`;
  if (qrDataUrlCache.has(cacheKey)) {
    return qrDataUrlCache.get(cacheKey)!;
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      margin: 1,
      width: Math.max(size * 4, 480),
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    qrDataUrlCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (err) {
    console.error('Erreur génération QR code PNG:', err);
    return '';
  }
}

export function getCachedQrUrl(text: string, size = 120): string | undefined {
  return qrSvgCache.get(`${text}_${size}`) || qrDataUrlCache.get(`png_${text}_${size}`);
}
