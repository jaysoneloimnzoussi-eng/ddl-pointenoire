import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { ArrondissementCode, RegimeType, Establishment, AgentTourneeEvent } from '../types';
import { parseArrondissement, getCoordinatesForArrondissement, calculateEstablishmentFee } from './storageService';
import { ACTIVITY_CATEGORIES } from '../constants/referential';

// Scopes required
export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events.readonly'
];

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({ prompt: 'select_account' });

// In-memory token storage (DO NOT store in localStorage per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface ExtractedCalendarEstablishment {
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventDate: string; // YYYY-MM-DD
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  name: string;
  promoter_name: string;
  phone: string;
  arrondissement: ArrondissementCode;
  quartier: string;
  activity_code: string;
  activity_type: string;
  surface_m2: number;
  regime_type: RegimeType;
  eventType: AgentTourneeEvent['type'];
  priority: AgentTourneeEvent['priority'];
  eventStatus: AgentTourneeEvent['status'];
  alreadyExists: boolean;
  statusRecommendation: 'en_instruction' | 'identifie' | 'attestation_depot';
}

/**
 * Initialize Auth State Listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google Popup and obtain access token
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Impossible d'obtenir le jeton d'accès Google Calendar.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('[Google Calendar Auth Error]', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Logout
 */
export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Intelligent parser to extract recreational establishment attributes from Google Calendar event
 */
export function parseEventToEstablishment(
  event: any,
  existingEstablishments: Establishment[]
): ExtractedCalendarEstablishment {
  const summary = (event.summary || '').trim();
  const description = (event.description || '').trim();
  const location = (event.location || '').trim();
  const rawDate = event.start?.dateTime || event.start?.date || new Date().toISOString();
  const eventDate = rawDate.split('T')[0];

  // 1. Clean and extract establishment name
  // Remove common administrative prefixes
  let cleanedName = summary
    .replace(/^(inspection|contrôle|controle|recensement|visite|rdv|rendez-vous|suivi|notification|audition)\s*(saa|ddl-pn|ddl)?\s*[:\-–]\s*/i, '')
    .replace(/^«|»|"|'/g, '')
    .trim();

  // If there's a parenthesis with location/quartier at the end, extract it
  let quartierCandidate = '';
  const parenMatch = cleanedName.match(/\(([^)]+)\)$/);
  if (parenMatch) {
    quartierCandidate = parenMatch[1].trim();
    cleanedName = cleanedName.replace(/\(([^)]+)\)$/, '').trim();
  }

  if (!cleanedName) {
    cleanedName = `Établissement du ${eventDate}`;
  }

  // 2. Parse phone number
  const fullText = `${summary} ${description} ${location}`;
  const phoneMatch = fullText.match(/(\+242\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}|\+242\s*[0-9]{9}|0[456]\s*[0-9]{2}\s*[0-9]{2}\s*[0-9]{2}\s*[0-9]{2}|0[456][0-9]{7})/);
  const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, ' ') : '';

  // 3. Parse promoter / contact name
  let promoter = '';
  const promoterMatch = description.match(/(?:promoteur|gérant|gerant|exploitant|responsable|contact|m\.|mme|monsieur|madame)\s*[:\-–]?\s*([A-Za-zÀ-ÿ\s\-]+?)(?:[\n,\.]|\+242|0[456]|$)/i);
  if (promoterMatch && promoterMatch[1].trim().length > 2) {
    promoter = promoterMatch[1].trim();
  } else {
    promoter = 'Promoteur à régulariser';
  }

  // 4. Parse arrondissement and quartier
  const arrCode = parseArrondissement(location, `${summary} ${description}`);
  let quartier = quartierCandidate || '';
  if (!quartier) {
    if (location) {
      quartier = location.split(',')[0].trim();
    } else {
      quartier = 'Centre';
    }
  }

  // 5. Activity categorization
  const lowerText = fullText.toLowerCase();
  let activityCode = 'A2.1'; // Default: Débit de boissons
  let activityLabel = 'Débit de Boissons / Bar';

  if (lowerText.includes('discothèque') || lowerText.includes('boîte de nuit') || lowerText.includes('night-club') || lowerText.includes('nightclub') || lowerText.includes('club')) {
    activityCode = 'A1.1';
    activityLabel = 'Discothèque / Boîte de Nuit';
  } else if (lowerText.includes('bar-dancing') || lowerText.includes('dancing') || lowerText.includes('cabaret')) {
    activityCode = 'A1.3';
    activityLabel = 'Bar-Dancing Traditionnel';
  } else if (lowerText.includes('hôtel') || lowerText.includes('hotel') || lowerText.includes('complexe') || lowerText.includes('lounge')) {
    activityCode = 'A1.2';
    activityLabel = 'Hôtel & Espace Loisirs Lounge';
  } else if (lowerText.includes('plage') || lowerText.includes('terrasse') || lowerText.includes('plein air')) {
    activityCode = 'A2.2';
    activityLabel = 'Terrasse / Espace Plein Air';
  } else if (lowerText.includes('culturel') || lowerText.includes('salle de jeux') || lowerText.includes('billard') || lowerText.includes('piscine') || lowerText.includes('loisirs')) {
    activityCode = 'A3.1';
    activityLabel = 'Espace Culturel & Salle de Jeux';
  }

  // 6. Surface (m2)
  let surface = 120;
  const surfaceMatch = fullText.match(/([0-9]{2,4})\s*(?:m2|m²|mètres\s*carrés)/i);
  if (surfaceMatch) {
    surface = parseInt(surfaceMatch[1], 10);
  } else {
    // Sensible defaults based on activity
    if (activityCode === 'A1.1') surface = 250;
    else if (activityCode === 'A1.2') surface = 300;
    else if (activityCode === 'A2.2') surface = 200;
    else surface = 110;
  }

  // 7. Regime
  let regime: RegimeType = 'INFORMEL';
  if (lowerText.includes('rccm') || lowerText.includes('sarl') || lowerText.includes('sa') || lowerText.includes('formel') || lowerText.includes('agréé') || lowerText.includes('agrée') || lowerText.includes('hôtel') || lowerText.includes('palace')) {
    regime = 'FORMEL';
  }

  // Check if establishment already exists in local database
  const alreadyExists = existingEstablishments.some(
    e => e.name.toLowerCase() === cleanedName.toLowerCase() ||
         e.name.toLowerCase().includes(cleanedName.toLowerCase()) ||
         cleanedName.toLowerCase().includes(e.name.toLowerCase())
  );

  // 8. Time start & end
  let timeStart = '09:00';
  let timeEnd = '10:30';
  if (event.start?.dateTime) {
    const d = new Date(event.start.dateTime);
    timeStart = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (event.end?.dateTime) {
    const d = new Date(event.end.dateTime);
    timeEnd = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // 9. Event Type
  let eventType: AgentTourneeEvent['type'] = 'RECENSEMENT_IN_SITU';
  if (lowerText.includes('convocation') || lowerText.includes('audition') || lowerText.includes('bureau')) {
    eventType = 'CONVOCATION';
  } else if (lowerText.includes('paiement') || lowerText.includes('acompte') || lowerText.includes('solde') || lowerText.includes('recouvrement') || lowerText.includes('quittance') || lowerText.includes('redevance')) {
    eventType = 'ENCAISSEMENT_ACOMPTE';
  } else if (lowerText.includes('acoustique') || lowerText.includes('décibel') || lowerText.includes('decibel') || lowerText.includes('son') || lowerText.includes('bruit') || lowerText.includes('limiteur')) {
    eventType = 'CONTROLE_ACOUSTIQUE';
  } else if (lowerText.includes('mise en demeure') || lowerText.includes('fermeture') || lowerText.includes('scellé') || lowerText.includes('72h')) {
    eventType = 'NOTIFICATION_MISE_EN_DEMEURE';
  } else if (lowerText.includes('renouvellement')) {
    eventType = 'RENOUVELLEMENT_ANNUEL';
  }

  // 10. Priority
  let priority: AgentTourneeEvent['priority'] = 'NORMALE';
  if (eventType === 'NOTIFICATION_MISE_EN_DEMEURE' || lowerText.includes('urgent')) {
    priority = 'URGENTE';
  } else if (eventType === 'CONVOCATION' || eventType === 'ENCAISSEMENT_ACOMPTE') {
    priority = 'HAUTE';
  }

  // 11. Status
  const todayStr = new Date().toISOString().split('T')[0];
  const eventStatus: AgentTourneeEvent['status'] = eventDate < todayStr ? 'EFFECTUE' : 'A_FAIRE';

  return {
    eventId: event.id,
    eventTitle: summary,
    eventDescription: description,
    eventLocation: location,
    eventDate,
    timeStart,
    timeEnd,
    name: cleanedName,
    promoter_name: promoter,
    phone,
    arrondissement: arrCode,
    quartier,
    activity_code: activityCode,
    activity_type: activityLabel,
    surface_m2: surface,
    regime_type: regime,
    eventType,
    priority,
    eventStatus,
    alreadyExists,
    statusRecommendation: regime === 'FORMEL' ? 'en_instruction' : 'identifie'
  };
}

/**
 * Fetch events from Google Calendar API starting from start of current year
 */
export async function fetchGoogleCalendarEvents(
  token: string,
  yearStart: string = '2026-01-01'
): Promise<any[]> {
  const timeMin = new Date(`${yearStart}T00:00:00Z`).toISOString();
  const timeMax = new Date().toISOString();

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.append('timeMin', timeMin);
  url.searchParams.append('timeMax', timeMax);
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');
  url.searchParams.append('maxResults', '250');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erreur API Google Calendar (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data.items || [];
}
