export type ArrondissementCode =
  | '1_LUMUMBA'
  | '2_MVOUMVOU'
  | '3_TIETIE'
  | '4_LOANDJILI'
  | '5_MONGO_MPOUKOU'
  | '6_NGOYO';

export interface ArrondissementInfo {
  number: number;
  code: ArrondissementCode;
  name: string;
  official_name: string;
  quartiers: string[];
  sig_coordinates: [number, number];
}

export type EstablishmentStatus =
  | 'identifie'
  | 'convoque'
  | 'en_instruction'
  | 'attestation_depot'
  | 'transmis_brazzaville'
  | 'autorise_dgl'
  | 'mise_en_demeure'
  | 'fermeture_administrative';

export type RegimeType = 'FORMEL' | 'INFORMEL';

export interface Establishment {
  id: string;
  name: string;
  promoter_name: string;
  phone: string;
  arrondissement: ArrondissementCode;
  quartier: string;
  address: string;
  activity_type: string;
  activity_code: string;
  regime_type: RegimeType;
  rccm?: string;
  surface_m2: number;
  filing_fee: number;
  rate_per_sqm: number;
  total_due: number;
  amount_paid: number;
  balance_due: number;
  status: EstablishmentStatus;
  identified_by: string;
  identified_date: string;
  last_inspection_date?: string;
  has_acoustic_limiter?: boolean;
  decibel_level?: number;
  coordinates: [number, number]; // [lat, lng]
  notes?: string;
  dgl_transmission_batch?: string;
  dgl_transmission_date?: string;
  dgl_approval_ref?: string;
  installments_chosen: number;
  first_payment_date?: string;
  annual_renewal_date?: string;
  assigned_agent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TerrainPaymentRecord {
  id: string;
  establishment_id: string;
  establishment_name: string;
  promoter_name: string;
  arrondissement: ArrondissementCode;
  amount_paid: number;
  total_fee: number;
  balance_remaining: number;
  installment_number: number;
  payment_method: 'MTN Mobile Money' | 'Airtel Money' | 'Espèces (Régie)' | 'Virement Trésor Public';
  transaction_ref: string;
  receipt_reference: string;
  next_due_date?: string;
  annual_renewal_scheduled_date?: string;
  record_date: string;
  collected_by: string;
  agent_badge: string;
  notes?: string;
}

export interface AgentTourneeEvent {
  id: string;
  agentId: string;
  agentName: string;
  agentBadge: string;
  establishmentId: string;
  establishmentName: string;
  promoterName: string;
  phone: string;
  arrondissement: ArrondissementCode;
  quartier: string;
  address: string;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  type:
    | 'CONVOCATION'
    | 'ENCAISSEMENT_ACOMPTE'
    | 'CONTROLE_ACOUSTIQUE'
    | 'RECENSEMENT_IN_SITU'
    | 'RENOUVELLEMENT_ANNUEL'
    | 'NOTIFICATION_MISE_EN_DEMEURE';
  status: 'A_FAIRE' | 'EFFECTUE' | 'EN_COURS' | 'REPORTE';
  priority: 'HAUTE' | 'NORMALE' | 'URGENTE';
  amountDue?: number;
  amountCollected?: number;
  receiptReference?: string;
  decibelMeasure?: number;
  notes?: string;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | 'ADMIN'
  | 'DIRECTEUR'
  | 'CHEF_SAA'
  | 'AGENT_SAA'
  | 'REGISSEUR'
  | 'CHEF_SPA';

export interface AppUser {
  id: string;
  badge: string;
  name: string;
  role: UserRole;
  title: string;
  phone: string;
  service: string;
  email: string;
}

export interface UserAccount extends AppUser {
  username: string;
  defaultPassword?: string;
  passwordHash?: string;
  lastLogin?: string;
  isActive?: boolean;
}

export interface ActivityCategoryRate {
  code: string;
  label: string;
  category: string;
  rate_per_sqm_fcfa: number;
  base_fixed_fee_fcfa: number;
}

export interface OfficialLegalAct {
  id: string;
  type: 'MISE_EN_DEMEURE' | 'CONVOCATION' | 'ARRETE_FERMETURE' | 'ORDRE_MISSION' | 'FICHE_ENQUETE';
  reference_number: string;
  establishment_id: string;
  establishment_name: string;
  promoter_name: string;
  arrondissement: string;
  address: string;
  date_emission: string;
  delai_huitaine_date?: string;
  motif: string;
  signataire_nom: string;
  signataire_titre: string;
  agent_notificateur?: string;
  visa_lois: string[];
}

export interface SpaMerchantSubscription {
  id: string;
  establishment_id: string;
  establishment_name: string;
  plan: 'BRONZE' | 'SILVER' | 'GOLD';
  monthly_fee_fcfa: number;
  start_date: string;
  end_date: string;
  status: 'ACTIF' | 'EXPIRE' | 'EN_ATTENTE';
  benefits: string[];
}

export interface SpaHonorDiploma {
  id: string;
  establishment_id: string;
  establishment_name: string;
  promoter_name: string;
  arrondissement: string;
  label: string;
  award_date: string;
  reference_number: string;
  reasons: string[];
}

export interface PtaObjective {
  id: string;
  axe_number: number;
  axe_title: string;
  objective_title: string;
  target_value: number;
  current_value: number;
  unit: string;
  progress_percent: number;
  deadline: string;
  lead_service: string;
}
