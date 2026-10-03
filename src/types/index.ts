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

export interface AttachedDocument {
  id: string;
  name: string;
  category: 'BAIL_COMMERCIAL' | 'RCCM' | 'PIECE_IDENTITE' | 'PHOTO_FACADE' | 'AUTRE';
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
  size_kb?: number;
}

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
  documents?: AttachedDocument[];
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
  matricule?: string;
  zone?: string;
  datePriseService?: string;
  sermentDate?: string;
  photoUrl?: string;
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

export interface JointInspectionRecord {
  id: string;
  pv_number: string;
  establishment_id: string;
  establishment_name: string;
  promoter_name: string;
  arrondissement: ArrondissementCode;
  quartier: string;
  address: string;
  inspection_date: string;
  // Acoustic / Sonometer
  noise_level_db: number;
  noise_compliant: boolean; // <= 85dB indoor or <= 55dB outdoor day / 45dB night
  noise_notes?: string;
  // Fire safety (Sécurité Civile / Pompiers)
  extinguishers_count: number;
  extinguishers_valid: boolean;
  emergency_exits_clear: boolean;
  evacuation_plan_displayed: boolean;
  fire_safety_compliant: boolean;
  // Hygiene & Sanitation (Mairie)
  sanitary_facilities_ok: boolean;
  ventilation_ok: boolean;
  waste_management_ok: boolean;
  hygiene_compliant: boolean;
  // Administrative (DDL-PN & Police)
  administrative_compliant: boolean;
  police_order_compliant: boolean;
  // Global Verdict
  global_verdict: 'FAVORABLE' | 'FAVORABLE_AVEC_RESERVES' | 'DEFAVORABLE';
  prescriptions: string[];
  inspectors: {
    ddl_officer: string;
    fire_safety_officer: string;
    hygiene_officer: string;
    police_officer: string;
  };
  created_at: string;
}

export interface MobileMoneyPaymentSession {
  id: string;
  transaction_ref: string;
  operator: 'MTN Mobile Money' | 'Airtel Money';
  establishment_id: string;
  establishment_name: string;
  promoter_name: string;
  phone_number: string;
  amount_fcfa: number;
  treasury_share_70: number;
  regie_share_30: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  receipt_number: string;
  created_at: string;
}

export interface PromoterOnlineSubmission {
  id: string;
  tracking_code: string;
  establishment_name: string;
  promoter_name: string;
  phone: string;
  email?: string;
  arrondissement: ArrondissementCode;
  quartier: string;
  address: string;
  activity_code: string;
  regime_type: RegimeType;
  surface_m2: number;
  estimated_fee: number;
  status: 'EN_ATTENTE_INSTRUCTION' | 'CONVOQUE_VISITE' | 'APPROUVE' | 'REJETE';
  submission_date: string;
  notes?: string;
  uploaded_documents?: {
    identity_card?: string;
    bail_commercial?: string;
    rccm?: string;
    plan_masse?: string;
  };
}

export interface BankReconciliationRecord {
  id: string;
  reference_bordereau: string;
  date_reconciliation: string;
  bank_name: 'Trésor Public' | 'Banque des États de l’Afrique Centrale (BEAC)' | 'Banque Commerciale Internationale (BCA)' | 'La Congolaise de Banque (LCB)';
  bank_account_number: string;
  treasury_deposit_amount_fcfa: number;
  regie_deposit_amount_fcfa: number;
  total_reconciled_fcfa: number;
  matching_receipts_count: number;
  reconciliation_status: 'RAPPROCHE' | 'EN_COURS' | 'ECART_DETECTE';
  variance_fcfa: number;
  agent_approbateur: string;
  notes?: string;
}

export interface AcousticInfractionPv {
  id: string;
  pv_number: string;
  establishment_id: string;
  establishment_name: string;
  promoter_name: string;
  arrondissement: ArrondissementCode;
  address: string;
  inspection_datetime: string;
  measured_db: number;
  threshold_legal_db: number;
  excess_db: number;
  measurement_location: 'TERRASSE' | 'SALLE_INTERIEURE' | 'VOIE_PUBLIQUE_RIVERAINS';
  time_period: 'DIURNE_06H_22H' | 'NOCTURNE_22H_06H';
  sanction_immediate: 'MISE_EN_DEMEURE_48H' | 'SAISIE_AMPLIFICATEURS' | 'FERMETURE_ADMINISTRATIVE_IMMEDIATE';
  officers: {
    ddl_officer: string;
    police_officer: string;
    hygiene_officer: string;
  };
  notes: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_badge: string;
  user_name: string;
  user_role: string;
  action_type:
    | 'ENCAISSEMENT_MOMO'
    | 'ENCAISSEMENT_ESPECES'
    | 'EMISSION_ACTE_JURIDIQUE'
    | 'SIGNATURE_ELECTRONIQUE_DIRECTEUR'
    | 'CONTROLE_COMMISSION_MIXTE'
    | 'PV_INFRACTION_ACOUSTIQUE'
    | 'REPORT_DELAI'
    | 'VALIDATION_TELEDECLARATION'
    | 'RAPPROCHEMENT_BANCAIRE'
    | 'MODIFICATION_DOSSIER';
  target_id: string;
  target_label: string;
  details: string;
  terminal_ip: string;
  sha256_hash: string;
}

export interface StateDigitalSignature {
  signatory_name: string;
  signatory_title: string;
  signatory_matricule: string;
  certificate_serial: string;
  sha256_fingerprint: string;
  timestamp_rfc3161: string;
  validity: string;
  status: 'VALIDE_ETAT_CONGO';
}

export interface SmsNotificationGatewayItem {
  id: string;
  recipient_phone: string;
  recipient_name: string;
  establishment_name: string;
  notification_type: 'RAPPEL_J_MOINS_5' | 'ALERTE_J_MOINS_1' | 'CONVOCATION_72H' | 'SOLDE_RESTANT';
  message_content: string;
  channel: 'SMS_OFFICIEL' | 'WHATSAPP_GOUV';
  status: 'ENVOYE' | 'EN_ATTENTE' | 'ECHEC';
  dispatched_at: string;
  operator_gateway: string;
}


