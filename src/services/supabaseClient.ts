import { createClient } from '@supabase/supabase-js';

// Support both standard Vite (VITE_SUPABASE_*) and Vercel Integration (SUPABASE_*) env vars
const rawUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta.env as any)?.SUPABASE_URL) ||
  '';

const rawKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta.env as any)?.SUPABASE_ANON_KEY) ||
  '';

const isPlaceholder = (val: string) =>
  !val ||
  val.trim() === '' ||
  val.includes('placeholder') ||
  val === 'https://placeholder.supabase.co' ||
  val === 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  !isPlaceholder(rawUrl) && !isPlaceholder(rawKey)
);

const supabaseUrl = isSupabaseConfigured ? rawUrl.trim() : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey.trim() : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Diagnostic helper to safely test if the Supabase connection and tables are ready
 */
export async function testSupabaseConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  message: string;
  tablesReady?: boolean;
}> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase n’est pas configuré. L’application fonctionne en mode local sécurisé autonome.'
    };
  }

  try {
    const { error } = await supabase.from('establishments').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          configured: true,
          connected: false,
          tablesReady: false,
          message: 'Base Supabase connectée, mais la table « establishments » n’est pas encore créée. Exécutez le script supabase_schema.sql.'
        };
      }
      return {
        configured: true,
        connected: false,
        message: `Erreur d’accès Supabase : ${error.message}`
      };
    }
    return {
      configured: true,
      connected: true,
      tablesReady: true,
      message: 'Connexion à la base de données centrale Supabase opérationnelle.'
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      message: `Erreur de connexion réseau Supabase : ${err?.message || 'Injoignable'}`
    };
  }
}

export interface SupabaseEstablishment {
  id: string;
  name: string;
  owner_name: string | null;
  activity_type: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  is_archived: boolean | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_agent_id: string | null;
  arrondissement: string | null;
  quartier: string | null;
  regime_type: string | null;
}

export interface SupabaseTerrainRecord {
  id: string;
  establishment_id: string;
  agent_id: string | null;
  created_by_user_id: string | null;
  record_date: string | null;
  total_fee: number | null;
  amount_paid: number | null;
  remaining_balance: number | null;
  notes: string | null;
  receipt_photo_url: string | null;
  status: string | null;
  is_deleted_by_agent: boolean | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  prochain_versement_date: string | null;
  first_payment_date: string | null;
}

export interface SupabaseAgent {
  id: string;
  badge_id: string | null;
  matricule: string | null;
  nom: string;
  prenom: string | null;
  nom_complet: string;
  photo_url: string | null;
  fonction: string | null;
  service: string | null;
  departement: string | null;
  telephone: string | null;
  email: string | null;
  statut: string | null;
  terrain_status: string | null;
  created_at: string;
  updated_at: string;
}
