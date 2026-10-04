/**
 * Utility for generating authentic, clickable verification URLs for QR Codes
 * Ensuring mobile phone cameras and QR scanners instantly recognize the payload
 * as an actionable web URL.
 */

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

export function buildVerificationUrl(data: VerificationPayload): string {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ais-dev-eedzfutctb3pod5wchnxf4-423672129970.europe-west2.run.app';

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

  // Return clean, pure HTTP/HTTPS URL with no extra newlines or plain text
  return `${origin}/?${searchParams.toString()}`;
}
