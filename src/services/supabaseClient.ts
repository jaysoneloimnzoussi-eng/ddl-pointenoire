import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nbpcecsnivfggyitpxdn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icGNlY3NuaXZmZ2d5aXRweGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyODkyNjYsImV4cCI6MjEwMzg2NTI2Nn0.xuDFvvtfic-LHo9iBLtDSgbmNfAVXyxby8iQw9ivGqA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

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
