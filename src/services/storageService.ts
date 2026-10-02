import { Establishment, TerrainPaymentRecord, OfficialLegalAct, SpaMerchantSubscription, SpaHonorDiploma, ArrondissementCode, RegimeType, EstablishmentStatus, AgentTourneeEvent, AppUser, AttachedDocument } from '../types';
import { TERRITORIAL_REFERENTIAL, ACTIVITY_CATEGORIES, TAXATION_RULES, APP_USERS } from '../constants/referential';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEYS = {
  ESTABLISHMENTS: 'ddl_pn_establishments_v2',
  PAYMENTS: 'ddl_pn_payments_v2',
  ACTS: 'ddl_pn_legal_acts_v2',
  SUBSCRIPTIONS: 'ddl_pn_subscriptions_v2',
  DIPLOMAS: 'ddl_pn_diplomas_v2',
  TOURNEES_EVENTS: 'ddl_pn_agent_tournees_v2',
  OFFLINE_QUEUE: 'ddl_pn_offline_queue_v2',
  SUPABASE_URL: 'ddl_pn_supabase_url'
};

export const DEFAULT_SUPABASE_URL = 'https://nbpcecsnivfggyitpxdn.supabase.co';

// Helper to parse arrondissement from text / address
export function parseArrondissement(raw: string | null | undefined, address: string = ''): ArrondissementCode {
  const combined = (String(raw || '') + ' ' + String(address || '')).toLowerCase();
  if (combined.includes('lumumba') || combined.includes('1 –') || combined.includes('1 -') || combined.includes('1_')) return '1_LUMUMBA';
  if (combined.includes('mvou') || combined.includes('2 –') || combined.includes('2 -') || combined.includes('2_')) return '2_MVOUMVOU';
  if (combined.includes('tié') || combined.includes('tie') || combined.includes('3 –') || combined.includes('3 -') || combined.includes('3_')) return '3_TIETIE';
  if (combined.includes('louandjili') || combined.includes('loandjili') || combined.includes('4 –') || combined.includes('4 -') || combined.includes('4_')) return '4_LOANDJILI';
  if (combined.includes('mongo') || combined.includes('mpoukou') || combined.includes('5 –') || combined.includes('5 -') || combined.includes('5_')) return '5_MONGO_MPOUKOU';
  if (combined.includes('ngoyo') || combined.includes('6 –') || combined.includes('6 -') || combined.includes('6_')) return '6_NGOYO';
  return '1_LUMUMBA';
}

// Helper to determine coordinates per arrondissement
export function getCoordinatesForArrondissement(arr: ArrondissementCode, idSeed: string): [number, number] {
  const ref = TERRITORIAL_REFERENTIAL.find(a => a.code === arr);
  const baseCoord = ref ? ref.sig_coordinates : [-4.795, 11.855];
  let hash = 0;
  for (let i = 0; i < idSeed.length; i++) {
    hash = (hash << 5) - hash + idSeed.charCodeAt(i);
    hash |= 0;
  }
  const jitterLat = ((Math.abs(hash) % 100) - 50) * 0.0003;
  const jitterLng = ((Math.abs(hash * 7) % 100) - 50) * 0.0003;
  return [Number((baseCoord[0] + jitterLat).toFixed(5)), Number((baseCoord[1] + jitterLng).toFixed(5))];
}

// Helper to calculate total fee
export function calculateEstablishmentFee(activityCode: string, surfaceM2: number, regime: RegimeType) {
  const category = ACTIVITY_CATEGORIES.find(c => c.code === activityCode) || ACTIVITY_CATEGORIES[3];
  const filingFee = regime === 'FORMEL' ? TAXATION_RULES.filing_fee_formal_fcfa : TAXATION_RULES.filing_fee_informal_fcfa;
  const ratePerSqm = category.rate_per_sqm_fcfa;
  const total = filingFee + (surfaceM2 * ratePerSqm);
  return {
    filingFee,
    ratePerSqm,
    totalDue: Math.round(total)
  };
}

// Seed generation for offline fallback
function generateSeedEstablishments(): Establishment[] {
  const establishments: Establishment[] = [];
  const rawEstablishmentData = [
    { name: 'Le Grand Baobab VIP Lounge', prom: 'Christian BITEMO', phone: '+242 06 612 88 90', quart: 'Mpita', act: 'A1.2', reg: 'FORMEL', surf: 220, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-089', coord: [-4.7982, 11.8512] },
    { name: 'Club 77 Discothèque', prom: 'Jean-Pierre TCHICAYA', phone: '+242 06 630 14 52', quart: 'Centre-Ville', act: 'A1.1', reg: 'FORMEL', surf: 310, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-044', coord: [-4.7915, 11.8598] },
    { name: 'La Brise de l\'Atlantique Bar-Plage', prom: 'Solange MOUNTOU', phone: '+242 05 510 40 33', quart: 'Côte Sauvage', act: 'A2.2', reg: 'FORMEL', surf: 450, stat: 'transmis_brazzaville', coord: [-4.8105, 11.8420] },
    { name: 'Le Havana Club & Cigar Lounge', prom: 'Alain MPOUELE', phone: '+242 06 940 77 12', quart: 'Centre-Ville', act: 'A1.2', reg: 'FORMEL', surf: 180, stat: 'attestation_depot', coord: [-4.7930, 11.8620] },
    { name: 'Espace Loisirs Ponton', prom: 'Frédéric MOUKOKO', phone: '+242 06 655 22 99', quart: 'Mpita', act: 'A3.1', reg: 'FORMEL', surf: 520, stat: 'en_instruction', coord: [-4.8010, 11.8540] }
  ];

  rawEstablishmentData.forEach((item, index) => {
    const arrCode: ArrondissementCode = '1_LUMUMBA';
    const regime = item.reg as RegimeType;
    const { filingFee, ratePerSqm, totalDue } = calculateEstablishmentFee(item.act, item.surf, regime);
    const amountPaid = item.stat === 'autorise_dgl' ? totalDue : (item.stat === 'attestation_depot' ? Math.round(totalDue * 0.5) : filingFee);

    establishments.push({
      id: `EST-PN-${String(index + 1).padStart(3, '0')}`,
      name: item.name,
      promoter_name: item.prom,
      phone: item.phone,
      arrondissement: arrCode,
      quartier: item.quart,
      address: `${item.quart}, Pointe-Noire`,
      activity_type: ACTIVITY_CATEGORIES.find(c => c.code === item.act)?.label || 'Débit de Boissons',
      activity_code: item.act,
      regime_type: regime,
      surface_m2: item.surf,
      filing_fee: filingFee,
      rate_per_sqm: ratePerSqm,
      total_due: totalDue,
      amount_paid: amountPaid,
      balance_due: totalDue - amountPaid,
      status: item.stat as EstablishmentStatus,
      identified_by: 'Agent SAA Loubaki (Badge N° 08)',
      identified_date: '2026-09-01',
      coordinates: [item.coord[0], item.coord[1]],
      installments_chosen: 2,
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-09-01T08:00:00Z'
    });
  });

  return establishments;
}

function generateSeedPayments(establishments: Establishment[]): TerrainPaymentRecord[] {
  return establishments.filter(e => e.amount_paid > 0).map((est, i) => ({
    id: `REC-${est.id}-01`,
    establishment_id: est.id,
    establishment_name: est.name,
    promoter_name: est.promoter_name,
    arrondissement: est.arrondissement,
    amount_paid: est.amount_paid,
    total_fee: est.total_due,
    balance_remaining: est.balance_due,
    installment_number: 1,
    payment_method: 'MTN Mobile Money',
    transaction_ref: `MTN-CG-${894000 + i}`,
    receipt_reference: `REC-DDL-PN-2026-${1000 + i}`,
    record_date: '2026-09-07',
    collected_by: est.identified_by,
    agent_badge: 'SAA-PN-008'
  }));
}

function generateSeedActs(): OfficialLegalAct[] {
  return [
    {
      id: 'ACT-2026-001',
      type: 'MISE_EN_DEMEURE',
      reference_number: 'MD-088/MCAPNIT/DGL/DDL-PN-2026',
      establishment_id: 'EST-PN-001',
      establishment_name: 'Le Grand Baobab VIP Lounge',
      promoter_name: 'Christian BITEMO',
      arrondissement: 'Arrondissement 1 Lumumba',
      address: 'Zone Industrielle OCH, Avenue des Pionniers',
      date_emission: '2026-09-20',
      delai_huitaine_date: '2026-09-27',
      motif: 'Exploitation sans agrément d’ouverture et émission de nuisances sonores constatées de nuit.',
      signataire_nom: 'Jean Richard NTSEKE NGOUAKA',
      signataire_titre: 'Directeur Départemental des Loisirs de Pointe-Noire',
      agent_notificateur: 'Agent SAA Loubaki (Badge N° 08)',
      visa_lois: [
        'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des activités de loisirs',
        'Décret N° 2021-412 du 28 octobre 2021 portant organisation de la DGL'
      ]
    }
  ];
}

function generateSeedSubscriptions(): SpaMerchantSubscription[] {
  return [
    {
      id: 'SUB-2026-001',
      establishment_id: 'EST-PN-001',
      establishment_name: 'Le Grand Baobab VIP Lounge',
      plan: 'GOLD',
      monthly_fee_fcfa: 100000,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      status: 'ACTIF',
      benefits: [
        'En-tête prioritaire sur le portail Loisirs Sains DDL-PN',
        'Relais bi-mensuel des événements sur la page officielle'
      ]
    }
  ];
}

function generateSeedDiplomas(): SpaHonorDiploma[] {
  return [
    {
      id: 'DIP-2026-001',
      establishment_id: 'EST-PN-001',
      establishment_name: 'Le Grand Baobab VIP Lounge',
      promoter_name: 'Christian BITEMO',
      arrondissement: 'Arrondissement 1 Patrice Émery Lumumba',
      label: 'Diplôme d’Honneur des Loisirs Sains & d’Excellence Acoustique',
      award_date: '2026-06-30',
      reference_number: 'DIP-HONNEUR-DDLPN-2026-001',
      reasons: ['Respect exemplaire des normes d\'exploitation certifié par le Service SAA']
    }
  ];
}

export function getAgentForEstablishment(est: Establishment, usersList: AppUser[] = APP_USERS): AppUser {
  const fieldAgents = usersList.filter(u => u.role === 'AGENT_SAA' || u.role === 'CHEF_SPA');
  if (fieldAgents.length === 0) return usersList[0];

  // Explicit match by assigned_agent_id
  if (est.assigned_agent_id) {
    const match = fieldAgents.find(a => a.id === est.assigned_agent_id);
    if (match) return match;
  }
  // Explicit match by identified_by
  if (est.identified_by) {
    const match = fieldAgents.find(a =>
      est.identified_by.toLowerCase().includes(a.name.toLowerCase().split(' ')[0]) ||
      est.identified_by.toLowerCase().includes(a.badge.toLowerCase())
    );
    if (match) return match;
  }

  // Stable deterministic hash partition by establishment ID
  let hash = 0;
  for (let i = 0; i < est.id.length; i++) {
    hash = (hash * 31 + est.id.charCodeAt(i)) >>> 0;
  }
  return fieldAgents[hash % fieldAgents.length];
}

function generateSeedTourneeEvents(establishments: Establishment[]): AgentTourneeEvent[] {
  const fieldAgents = APP_USERS.filter(u => u.role === 'AGENT_SAA' || u.role === 'CHEF_SPA');
  const events: AgentTourneeEvent[] = [];

  const types: AgentTourneeEvent['type'][] = [
    'CONVOCATION',
    'ENCAISSEMENT_ACOMPTE',
    'CONTROLE_ACOUSTIQUE',
    'RECENSEMENT_IN_SITU',
    'RENOUVELLEMENT_ANNUEL',
    'NOTIFICATION_MISE_EN_DEMEURE'
  ];

  establishments.forEach((est, idx) => {
    const assignedAgent = getAgentForEstablishment(est, APP_USERS);
    const dayOffset = (idx % 7);
    const eventDate = new Date(2026, 8, 25 + dayOffset).toISOString().split('T')[0];
    const type = types[idx % types.length];
    const hour = 8 + (idx % 8);
    const timeStart = `${String(hour).padStart(2, '0')}:00`;
    const timeEnd = `${String(hour + 1).padStart(2, '0')}:00`;

    events.push({
      id: `EVT-AUTO-${est.id}-${idx}`,
      agentId: assignedAgent.id,
      agentName: assignedAgent.name,
      agentBadge: assignedAgent.badge,
      establishmentId: est.id,
      establishmentName: est.name,
      promoterName: est.promoter_name,
      phone: est.phone,
      arrondissement: est.arrondissement,
      quartier: est.quartier,
      address: est.address,
      date: eventDate,
      timeStart,
      timeEnd,
      type,
      status: idx % 3 === 0 ? 'EFFECTUE' : (idx % 3 === 1 ? 'A_FAIRE' : 'EN_COURS'),
      priority: idx % 4 === 0 ? 'URGENTE' : 'NORMALE',
      amountDue: est.balance_due || est.total_due,
      notes: type === 'CONVOCATION'
        ? 'Convocation pour régularisation administrative et paiement des droits régie DDL.'
        : (type === 'ENCAISSEMENT_ACOMPTE' ? 'Rendez-vous convenu avec la tenancière pour recouvrement de l\'acompte.' : 'Visite de contrôle de conformité Service SAA.'),
      isSynced: true,
      createdAt: '2026-09-20T08:00:00Z',
      updatedAt: '2026-09-29T08:00:00Z'
    });
  });

  return events;
}

// Storage Service Singleton with Real Supabase Synchronization
class StorageService {
  private establishments: Establishment[] = [];
  private payments: TerrainPaymentRecord[] = [];
  private acts: OfficialLegalAct[] = [];
  private subscriptions: SpaMerchantSubscription[] = [];
  private diplomas: SpaHonorDiploma[] = [];
  private tourneeEvents: AgentTourneeEvent[] = [];
  private offlineQueue: Array<{ action: string; payload: unknown; timestamp: string }> = [];
  private isOnline = true;
  private isSyncing = false;
  private supabaseUrl = DEFAULT_SUPABASE_URL;

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      this.isOnline = navigator.onLine;

      // Automatically trigger sync with Supabase in background
      setTimeout(() => {
        this.syncWithSupabase().catch(err => console.warn('[DDL-PN] Background sync error:', err));
      }, 500);
    }
  }

  private handleNetworkChange(online: boolean) {
    this.isOnline = online;
    if (online) {
      this.flushOfflineQueue();
    }
  }

  public init() {
    if (typeof window === 'undefined') return;

    // 1. Establishments cache
    const storedEsts = localStorage.getItem(LOCAL_STORAGE_KEYS.ESTABLISHMENTS);
    if (storedEsts) {
      try {
        this.establishments = JSON.parse(storedEsts);
      } catch {
        this.establishments = generateSeedEstablishments();
        this.saveEstablishments();
      }
    } else {
      this.establishments = generateSeedEstablishments();
      this.saveEstablishments();
    }

    // 2. Payments cache
    const storedPayments = localStorage.getItem(LOCAL_STORAGE_KEYS.PAYMENTS);
    if (storedPayments) {
      try {
        this.payments = JSON.parse(storedPayments);
      } catch {
        this.payments = generateSeedPayments(this.establishments);
        this.savePayments();
      }
    } else {
      this.payments = generateSeedPayments(this.establishments);
      this.savePayments();
    }

    // 3. Legal acts cache
    const storedActs = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTS);
    if (storedActs) {
      try {
        this.acts = JSON.parse(storedActs);
      } catch {
        this.acts = generateSeedActs();
        this.saveActs();
      }
    } else {
      this.acts = generateSeedActs();
      this.saveActs();
    }

    // 4. Subscriptions
    const storedSubs = localStorage.getItem(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS);
    if (storedSubs) {
      try {
        this.subscriptions = JSON.parse(storedSubs);
      } catch {
        this.subscriptions = generateSeedSubscriptions();
        this.saveSubscriptions();
      }
    } else {
      this.subscriptions = generateSeedSubscriptions();
      this.saveSubscriptions();
    }

    // 5. Diplomas
    const storedDips = localStorage.getItem(LOCAL_STORAGE_KEYS.DIPLOMAS);
    if (storedDips) {
      try {
        this.diplomas = JSON.parse(storedDips);
      } catch {
        this.diplomas = generateSeedDiplomas();
        this.saveDiplomas();
      }
    } else {
      this.diplomas = generateSeedDiplomas();
      this.saveDiplomas();
    }

    // 6. Tournées events
    const storedTournees = localStorage.getItem(LOCAL_STORAGE_KEYS.TOURNEES_EVENTS);
    if (storedTournees) {
      try {
        this.tourneeEvents = JSON.parse(storedTournees);
      } catch {
        this.tourneeEvents = generateSeedTourneeEvents(this.establishments);
        this.saveTournees();
      }
    } else {
      this.tourneeEvents = generateSeedTourneeEvents(this.establishments);
      this.saveTournees();
    }

    // 7. Offline queue
    const storedQueue = localStorage.getItem(LOCAL_STORAGE_KEYS.OFFLINE_QUEUE);
    if (storedQueue) {
      try {
        this.offlineQueue = JSON.parse(storedQueue);
      } catch {
        this.offlineQueue = [];
      }
    }

    // 8. Supabase URL
    const savedUrl = localStorage.getItem(LOCAL_STORAGE_KEYS.SUPABASE_URL);
    if (savedUrl) {
      this.supabaseUrl = savedUrl;
    }
  }

  // Save methods to cache
  private saveEstablishments() {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ESTABLISHMENTS, JSON.stringify(this.establishments));
  }
  private savePayments() {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENTS, JSON.stringify(this.payments));
  }
  private saveActs() {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTS, JSON.stringify(this.acts));
  }
  private saveSubscriptions() {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(this.subscriptions));
  }
  private saveDiplomas() {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DIPLOMAS, JSON.stringify(this.diplomas));
  }
  private saveTournees() {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOURNEES_EVENTS, JSON.stringify(this.tourneeEvents));
  }
  private saveQueue() {
    localStorage.setItem(LOCAL_STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(this.offlineQueue));
  }

  private notifyDataUpdated() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ddl_pn_data_updated'));
    }
  }

  // --- Real Supabase Synchronizer ---
  public async syncWithSupabase(): Promise<{ establishmentsCount: number; recordsCount: number }> {
    if (this.isSyncing) return { establishmentsCount: this.establishments.length, recordsCount: this.payments.length };
    
    // When Supabase URL is not configured by user in .env, rely smoothly on local persistent storage
    if (!isSupabaseConfigured) {
      this.notifyDataUpdated();
      return { establishmentsCount: this.establishments.length, recordsCount: this.payments.length };
    }

    this.isSyncing = true;

    try {
      console.log('[DDL-PN Supabase] Starting full bidirectional synchronisation...');

      // 1. Fetch Agents safely
      const agentMap: Record<string, string> = {};
      try {
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select('*');

        if (!agentsError && agentsData) {
          agentsData.forEach((a: any) => {
            agentMap[a.id] = a.nom_complet || `${a.prenom || ''} ${a.nom}`.trim() || 'Agent SAA';
          });
        }
      } catch {
        // Quiet fallback to referential
      }

      // 2. Fetch Terrain Records safely
      let recordsData: any[] | null = null;
      try {
        const { data: recs, error: recordsError } = await supabase
          .from('terrain_records')
          .select('*')
          .order('record_date', { ascending: false });

        if (!recordsError) {
          recordsData = recs;
        }
      } catch {
        // Quiet fallback to local store
      }

      // 3. Fetch Establishments
      let estsData: any[] | null = null;
      try {
        const { data: ests, error: estsError } = await supabase
          .from('establishments')
          .select('*')
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        if (estsError) {
          console.info('[DDL-PN Supabase] Cloud database unavailable, using local persistent cache:', estsError.message || 'Offline');
          return {
            establishmentsCount: this.establishments.length,
            recordsCount: this.payments.length
          };
        }
        estsData = ests;
      } catch (e: any) {
        console.info('[DDL-PN Supabase] Cloud database offline, active in local persistent mode:', e?.message || 'Offline');
        return {
          establishmentsCount: this.establishments.length,
          recordsCount: this.payments.length
        };
      }

      if (estsData && estsData.length > 0) {
        // Group payments by establishment
        const recordMap: Record<string, any[]> = {};
        const paymentsList: TerrainPaymentRecord[] = [];

        if (recordsData) {
          recordsData.forEach((rec: any, idx: number) => {
            if (!recordMap[rec.establishment_id]) recordMap[rec.establishment_id] = [];
            recordMap[rec.establishment_id].push(rec);

            const estMatch = estsData.find((e: any) => e.id === rec.establishment_id);
            const estName = estMatch ? estMatch.name : 'Établissement DDL-PN';
            const promoterName = estMatch ? (estMatch.owner_name || 'Exploitant') : 'Exploitant';
            const arrCode = parseArrondissement(estMatch?.arrondissement, estMatch?.address);

            paymentsList.push({
              id: rec.id,
              establishment_id: rec.establishment_id,
              establishment_name: estName,
              promoter_name: promoterName,
              arrondissement: arrCode,
              amount_paid: Number(rec.amount_paid) || 0,
              total_fee: Number(rec.total_fee) || 0,
              balance_remaining: Number(rec.remaining_balance) || 0,
              installment_number: idx + 1,
              payment_method: 'Espèces (Régie)',
              transaction_ref: `REC-${rec.id.slice(0, 8).toUpperCase()}`,
              receipt_reference: `REC-DDL-PN-2026-${rec.id.slice(0, 6).toUpperCase()}`,
              record_date: rec.record_date || (rec.created_at ? rec.created_at.split('T')[0] : '2026-09-07'),
              collected_by: (rec.agent_id && agentMap[rec.agent_id]) || 'Agent SAA Loubaki',
              agent_badge: 'SAA-PN-008',
              notes: rec.notes || 'Enregistrement de conformité et encaissement Service SAA.'
            });
          });
        }

        // Map establishments
        const mappedEstablishments: Establishment[] = estsData.map((e: any) => {
          const arrCode = parseArrondissement(e.arrondissement, e.address);
          const coords: [number, number] = (e.latitude && e.longitude)
            ? [Number(e.latitude), Number(e.longitude)]
            : getCoordinatesForArrondissement(arrCode, e.id);

          const estRecords = recordMap[e.id] || [];
          let totalDue = 0;
          let amountPaid = 0;

          if (estRecords.length > 0) {
            totalDue = estRecords.reduce((sum: number, r: any) => sum + (Number(r.total_fee) || 0), 0);
            amountPaid = estRecords.reduce((sum: number, r: any) => sum + (Number(r.amount_paid) || 0), 0);
          } else {
            const feeCalc = calculateEstablishmentFee('A2.1', 80, (e.regime_type as RegimeType) || 'INFORMEL');
            totalDue = feeCalc.totalDue;
            amountPaid = 0;
          }

          const balance = Math.max(0, totalDue - amountPaid);
          let status: EstablishmentStatus = 'identifie';
          if (balance === 0 && amountPaid > 0) {
            status = 'autorise_dgl';
          } else if (amountPaid > 0) {
            status = 'attestation_depot';
          }

          // Extract quartier from address
          let quartier = e.quartier || '';
          if (!quartier && e.address) {
            const parts = e.address.split(',');
            if (parts.length > 0) quartier = parts[0].trim();
          }
          if (!quartier) quartier = 'Centre';

          return {
            id: e.id,
            name: e.name,
            promoter_name: e.owner_name || 'Exploitant non renseigné',
            phone: e.phone || '',
            arrondissement: arrCode,
            quartier,
            address: e.address || `${quartier}, Pointe-Noire`,
            activity_type: e.activity_type || 'Débit de Boissons',
            activity_code: 'A2.1',
            regime_type: (e.regime_type as RegimeType) || 'INFORMEL',
            surface_m2: 80,
            filing_fee: 15000,
            rate_per_sqm: 450,
            total_due: totalDue,
            amount_paid: amountPaid,
            balance_due: balance,
            status,
            identified_by: (e.assigned_agent_id && agentMap[e.assigned_agent_id]) || 'Agent Service SAA',
            identified_date: e.created_at ? e.created_at.split('T')[0] : '2026-09-07',
            last_inspection_date: e.updated_at ? e.updated_at.split('T')[0] : '2026-09-07',
            coordinates: coords,
            notes: 'Établissement recensé dans la base centrale DDL-PN Supabase.',
            installments_chosen: 2,
            assigned_agent_id: e.assigned_agent_id || undefined,
            created_at: e.created_at,
            updated_at: e.updated_at
          };
        });

        this.establishments = mappedEstablishments;
        this.saveEstablishments();

        if (paymentsList.length > 0) {
          this.payments = paymentsList;
          this.savePayments();
        }

        console.log(`[DDL-PN Supabase] Successfully loaded ${mappedEstablishments.length} establishments and ${paymentsList.length} payments.`);
      }

      this.notifyDataUpdated();
      return {
        establishmentsCount: this.establishments.length,
        recordsCount: this.payments.length
      };
    } catch (err: any) {
      console.info('[DDL-PN] Synchronization completed in local storage mode:', err?.message || 'ready');
      return {
        establishmentsCount: this.establishments.length,
        recordsCount: this.payments.length
      };
    } finally {
      this.isSyncing = false;
    }
  }

  public getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.offlineQueue.length,
      supabaseUrl: this.supabaseUrl
    };
  }

  public setSupabaseUrl(url: string) {
    this.supabaseUrl = url;
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUPABASE_URL, url);
  }

  public enqueueOfflineAction(action: string, payload: unknown) {
    this.offlineQueue.push({
      action,
      payload,
      timestamp: new Date().toISOString()
    });
    this.saveQueue();
  }

  public getOfflineQueue(): Array<{ action: string; payload: any; timestamp: string }> {
    return [...this.offlineQueue];
  }

  public async flushOfflineQueue() {
    if (!isSupabaseConfigured) {
      return;
    }

    if (this.offlineQueue.length === 0) {
      await this.syncWithSupabase();
      return;
    }

    console.log(`[DDL-PN Sync] Processing ${this.offlineQueue.length} offline actions to Supabase...`);
    const remainingQueue: typeof this.offlineQueue = [];

    for (const item of this.offlineQueue) {
      try {
        if (item.action === 'CREATE_ESTABLISHMENT') {
          const e = item.payload as Establishment;
          await supabase.from('establishments').insert({
            id: e.id.startsWith('EST-PN-') ? undefined : e.id,
            name: e.name,
            owner_name: e.promoter_name,
            phone: e.phone,
            address: e.address,
            arrondissement: e.arrondissement,
            quartier: e.quartier,
            activity_type: e.activity_type,
            regime_type: e.regime_type,
            latitude: e.coordinates[0],
            longitude: e.coordinates[1],
            is_archived: false
          });
        } else if (item.action === 'RECORD_PAYMENT') {
          const p = item.payload as TerrainPaymentRecord;
          await supabase.from('terrain_records').insert({
            establishment_id: p.establishment_id,
            total_fee: p.total_fee,
            amount_paid: p.amount_paid,
            remaining_balance: p.balance_remaining,
            record_date: p.record_date,
            notes: p.notes,
            status: 'SOUMIS'
          });
        } else if (item.action === 'UPDATE_ESTABLISHMENT') {
          const { id, updates } = item.payload as { id: string; updates: Partial<Establishment> };
          await supabase.from('establishments').update({
            name: updates.name,
            owner_name: updates.promoter_name,
            phone: updates.phone,
            address: updates.address,
            arrondissement: updates.arrondissement,
            quartier: updates.quartier,
            activity_type: updates.activity_type,
            regime_type: updates.regime_type,
            latitude: updates.coordinates?.[0],
            longitude: updates.coordinates?.[1],
            updated_at: new Date().toISOString()
          }).eq('id', id);
        }
      } catch (err) {
        console.warn('[DDL-PN Sync] Action queued for cloud sync:', item);
        remainingQueue.push(item);
      }
    }

    this.offlineQueue = remainingQueue;
    this.saveQueue();
    await this.syncWithSupabase();
  }

  // --- Establishments CRUD ---
  public getEstablishments(): Establishment[] {
    return [...this.establishments];
  }

  public getEstablishmentsForUser(user: AppUser): Establishment[] {
    if (user.role === 'ADMIN' || user.role === 'DIRECTEUR') {
      return [...this.establishments];
    }
    return this.establishments.filter(est => {
      const assigned = getAgentForEstablishment(est, APP_USERS);
      return (
        assigned.id === user.id ||
        assigned.badge === user.badge ||
        (est.assigned_agent_id && est.assigned_agent_id === user.id) ||
        (est.identified_by && est.identified_by.toLowerCase().includes(user.name.toLowerCase().split(' ')[0]))
      );
    });
  }

  public getEstablishmentById(id: string): Establishment | undefined {
    return this.establishments.find(e => e.id === id);
  }

  public addEstablishment(est: Omit<Establishment, 'id' | 'created_at' | 'updated_at'>): Establishment {
    const newId = `EST-PN-${String(this.establishments.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const newEstablishment: Establishment = {
      ...est,
      id: newId,
      created_at: now,
      updated_at: now
    };
    this.establishments.unshift(newEstablishment);
    this.saveEstablishments();
    this.notifyDataUpdated();

    // Direct push to Supabase if configured
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase.from('establishments').insert({
          name: newEstablishment.name,
          owner_name: newEstablishment.promoter_name,
          phone: newEstablishment.phone,
          address: newEstablishment.address,
          arrondissement: newEstablishment.arrondissement,
          quartier: newEstablishment.quartier,
          activity_type: newEstablishment.activity_type,
          regime_type: newEstablishment.regime_type,
          latitude: newEstablishment.coordinates[0],
          longitude: newEstablishment.coordinates[1],
          is_archived: false
        })
      ).then(({ data, error }) => {
        if (error) {
          this.enqueueOfflineAction('CREATE_ESTABLISHMENT', newEstablishment);
        } else {
          console.log('[DDL-PN Supabase] Establishment pushed successfully to cloud:', data);
        }
      }).catch(() => {
        this.enqueueOfflineAction('CREATE_ESTABLISHMENT', newEstablishment);
      });
    }

    return newEstablishment;
  }

  public updateEstablishment(id: string, updates: Partial<Establishment>): Establishment | null {
    const index = this.establishments.findIndex(e => e.id === id);
    if (index === -1) return null;

    const updated: Establishment = {
      ...this.establishments[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.establishments[index] = updated;
    this.saveEstablishments();
    this.notifyDataUpdated();

    // Push update to Supabase if configured
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase.from('establishments').update({
          name: updates.name,
          owner_name: updates.promoter_name,
          phone: updates.phone,
          address: updates.address,
          arrondissement: updates.arrondissement,
          quartier: updates.quartier,
          activity_type: updates.activity_type,
          regime_type: updates.regime_type,
          latitude: updates.coordinates?.[0],
          longitude: updates.coordinates?.[1],
          updated_at: new Date().toISOString()
        }).eq('id', id)
      ).then(({ error }) => {
        if (error) {
          this.enqueueOfflineAction('UPDATE_ESTABLISHMENT', { id, updates });
        }
      }).catch(() => {
        this.enqueueOfflineAction('UPDATE_ESTABLISHMENT', { id, updates });
      });
    }

    return updated;
  }

  public deleteEstablishment(id: string): boolean {
    const initialLen = this.establishments.length;
    this.establishments = this.establishments.filter(e => e.id !== id);
    if (this.establishments.length !== initialLen) {
      this.saveEstablishments();
      this.notifyDataUpdated();

      if (isSupabaseConfigured) {
        // Soft delete in Supabase
        Promise.resolve(
          supabase.from('establishments').update({
            is_archived: true,
            deleted_at: new Date().toISOString()
          }).eq('id', id)
        ).then(({ error }) => {
          if (error) {
            this.enqueueOfflineAction('DELETE_ESTABLISHMENT', { id });
          }
        }).catch(() => {
          this.enqueueOfflineAction('DELETE_ESTABLISHMENT', { id });
        });
      }
      return true;
    }
    return false;
  }

  public attachDocumentToEstablishment(estId: string, doc: Omit<AttachedDocument, 'id' | 'uploaded_at'>): AttachedDocument {
    const est = this.getEstablishmentById(estId);
    if (!est) throw new Error('Établissement introuvable');

    const newDoc: AttachedDocument = {
      ...doc,
      id: `DOC-${Date.now()}`,
      uploaded_at: new Date().toISOString()
    };

    const currentDocs = est.documents || [];
    this.updateEstablishment(estId, {
      documents: [...currentDocs, newDoc]
    });

    return newDoc;
  }

  // --- Payments / Receipts ---
  public getPayments(): TerrainPaymentRecord[] {
    return [...this.payments];
  }

  public recordPayment(params: {
    establishment_id: string;
    amount: number;
    payment_method: TerrainPaymentRecord['payment_method'];
    collected_by: string;
    agent_badge: string;
    notes?: string;
  }): { payment: TerrainPaymentRecord; establishment: Establishment; renewalEvent?: AgentTourneeEvent } {
    const est = this.getEstablishmentById(params.establishment_id);
    if (!est) throw new Error('Établissement introuvable');

    const todayStr = new Date().toISOString().split('T')[0];
    const newAmountPaid = est.amount_paid + params.amount;
    const newBalance = Math.max(0, est.total_due - newAmountPaid);
    const firstPaymentDate = est.first_payment_date || (est.amount_paid > 0 ? (est.identified_date || todayStr) : todayStr);

    let annualRenewalDate: string | undefined = est.annual_renewal_date;
    let scheduledRenewalEvent: AgentTourneeEvent | undefined = undefined;

    if (newBalance === 0) {
      const [y, m, d] = firstPaymentDate.split('-');
      const renewalYear = parseInt(y, 10) + 1;
      annualRenewalDate = `${renewalYear}-${m}-${d}`;
    }

    let newStatus = est.status;
    if (newBalance === 0) {
      if (est.status === 'identifie' || est.status === 'convoque' || est.status === 'mise_en_demeure') {
        newStatus = 'attestation_depot';
      }
    } else if (newAmountPaid >= est.filing_fee && (est.status === 'identifie' || est.status === 'convoque')) {
      newStatus = 'en_instruction';
    }

    const updatedEst = this.updateEstablishment(est.id, {
      amount_paid: newAmountPaid,
      balance_due: newBalance,
      status: newStatus,
      first_payment_date: firstPaymentDate,
      annual_renewal_date: annualRenewalDate,
      last_inspection_date: todayStr
    })!;

    const receiptRef = `REC-DDL-PN-2026-${String(this.payments.length + 1001)}`;
    const newPayment: TerrainPaymentRecord = {
      id: `PAY-${Date.now()}`,
      establishment_id: est.id,
      establishment_name: est.name,
      promoter_name: est.promoter_name,
      arrondissement: est.arrondissement,
      amount_paid: params.amount,
      total_fee: est.total_due,
      balance_remaining: newBalance,
      installment_number: (this.payments.filter(p => p.establishment_id === est.id).length || 0) + 1,
      payment_method: params.payment_method,
      transaction_ref: `TX-${Date.now().toString().slice(-8)}`,
      receipt_reference: receiptRef,
      record_date: todayStr,
      collected_by: params.collected_by,
      agent_badge: params.agent_badge,
      notes: params.notes,
      next_due_date: newBalance > 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      annual_renewal_scheduled_date: annualRenewalDate
    };

    this.payments.unshift(newPayment);
    this.savePayments();
    this.notifyDataUpdated();

    // Push payment to Supabase if configured
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase.from('terrain_records').insert({
          establishment_id: est.id,
          total_fee: est.total_due,
          amount_paid: params.amount,
          remaining_balance: newBalance,
          record_date: todayStr,
          notes: params.notes || `Paiement ${params.payment_method} réf ${receiptRef}`,
          status: 'SOUMIS'
        })
      ).then(({ error }) => {
        if (error) {
          this.enqueueOfflineAction('RECORD_PAYMENT', newPayment);
        }
      }).catch(() => {
        this.enqueueOfflineAction('RECORD_PAYMENT', newPayment);
      });
    }

    if (annualRenewalDate) {
      scheduledRenewalEvent = this.addAgentEvent({
        agentId: params.agent_badge || 'SAA-PN-008',
        agentName: params.collected_by,
        agentBadge: params.agent_badge,
        establishmentId: est.id,
        establishmentName: est.name,
        promoterName: est.promoter_name,
        phone: est.phone,
        arrondissement: est.arrondissement,
        quartier: est.quartier,
        address: est.address,
        date: annualRenewalDate,
        timeStart: '09:00',
        timeEnd: '10:30',
        type: 'RENOUVELLEMENT_ANNUEL',
        status: 'A_FAIRE',
        priority: 'NORMALE',
        amountDue: est.total_due,
        notes: `Renouvellement annuel obligatoire N+1 fixé au jour du premier acompte (${firstPaymentDate}) suite au paiement intégral des frais d'exploitation.`,
        isSynced: this.isOnline
      });
    }

    return { payment: newPayment, establishment: updatedEst, renewalEvent: scheduledRenewalEvent };
  }

  // --- Agent Tournées Operations ---
  public getAgentEvents(agentId?: string): AgentTourneeEvent[] {
    if (!agentId || agentId === 'ALL' || agentId === 'DIR-01' || agentId === 'SAA-CHEF') {
      return [...this.tourneeEvents];
    }
    return this.tourneeEvents.filter(
      e => e.agentId === agentId || e.agentBadge === agentId || e.agentName.includes(agentId)
    );
  }

  public getAgentEventsForUser(user: AppUser): AgentTourneeEvent[] {
    if (user.role === 'ADMIN' || user.role === 'DIRECTEUR') {
      return [...this.tourneeEvents];
    }
    return this.tourneeEvents.filter(
      e =>
        e.agentId === user.id ||
        e.agentBadge === user.badge ||
        e.agentName.toLowerCase().includes(user.name.toLowerCase().split(' ')[0])
    );
  }

  public addAgentEvent(event: Omit<AgentTourneeEvent, 'id' | 'createdAt' | 'updatedAt'>): AgentTourneeEvent {
    const now = new Date().toISOString();
    const newEvent: AgentTourneeEvent = {
      ...event,
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now
    };
    this.tourneeEvents.unshift(newEvent);
    this.saveTournees();
    this.notifyDataUpdated();
    return newEvent;
  }

  public updateAgentEvent(id: string, updates: Partial<AgentTourneeEvent>): AgentTourneeEvent | null {
    const idx = this.tourneeEvents.findIndex(e => e.id === id);
    if (idx === -1) return null;

    const updated: AgentTourneeEvent = {
      ...this.tourneeEvents[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.tourneeEvents[idx] = updated;
    this.saveTournees();
    this.notifyDataUpdated();
    return updated;
  }

  public deleteAgentEvent(id: string): boolean {
    const initialLen = this.tourneeEvents.length;
    this.tourneeEvents = this.tourneeEvents.filter(e => e.id !== id);
    if (this.tourneeEvents.length !== initialLen) {
      this.saveTournees();
      this.notifyDataUpdated();
      return true;
    }
    return false;
  }

  public convoquerEstablishment(params: {
    establishment_id: string;
    date: string;
    timeStart?: string;
    motif: string;
    agent: AppUser;
  }): { event: AgentTourneeEvent; act: OfficialLegalAct } {
    const est = this.getEstablishmentById(params.establishment_id);
    if (!est) throw new Error('Établissement introuvable');

    this.updateEstablishment(est.id, { status: 'convoque' });

    const refNum = `CONV-${String(this.acts.length + 140).padStart(3, '0')}/DDL-PN/SAA-2026`;
    const newAct = this.addAct({
      type: 'CONVOCATION',
      reference_number: refNum,
      establishment_id: est.id,
      establishment_name: est.name,
      promoter_name: est.promoter_name,
      arrondissement: est.arrondissement,
      address: est.address,
      date_emission: new Date().toISOString().split('T')[0],
      delai_huitaine_date: params.date,
      motif: params.motif,
      signataire_nom: params.agent.role === 'DIRECTEUR' ? params.agent.name : 'Chef du Service SAA',
      signataire_titre: params.agent.role === 'DIRECTEUR' ? params.agent.title : 'Chef du Service Agrément et Assainissement',
      agent_notificateur: `${params.agent.name} (${params.agent.badge})`,
      visa_lois: [
        'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs',
        'Instruction Générale DGL relative à la police des débits de boissons et terrasses'
      ]
    });

    const event = this.addAgentEvent({
      agentId: params.agent.badge,
      agentName: params.agent.name,
      agentBadge: params.agent.badge,
      establishmentId: est.id,
      establishmentName: est.name,
      promoterName: est.promoter_name,
      phone: est.phone,
      arrondissement: est.arrondissement,
      quartier: est.quartier,
      address: est.address,
      date: params.date,
      timeStart: params.timeStart || '10:00',
      timeEnd: '11:00',
      type: 'CONVOCATION',
      status: 'A_FAIRE',
      priority: 'HAUTE',
      amountDue: est.balance_due,
      notes: `Convocation officielle N° ${refNum} : ${params.motif}`,
      isSynced: this.isOnline
    });

    return { event, act: newAct };
  }

  public miseEnDemeureEstablishment(params: {
    establishment_id: string;
    delaiJours: number;
    motif: string;
    agent: AppUser;
  }): { event: AgentTourneeEvent; act: OfficialLegalAct } {
    const est = this.getEstablishmentById(params.establishment_id);
    if (!est) throw new Error('Établissement introuvable');

    this.updateEstablishment(est.id, { status: 'mise_en_demeure' });

    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + params.delaiJours);
    const expiryDateStr = expiryDate.toISOString().split('T')[0];

    const refNum = `MED-${String(this.acts.length + 80).padStart(3, '0')}/DDL-PN/SAA-2026`;
    const newAct = this.addAct({
      type: 'MISE_EN_DEMEURE',
      reference_number: refNum,
      establishment_id: est.id,
      establishment_name: est.name,
      promoter_name: est.promoter_name,
      arrondissement: est.arrondissement,
      address: est.address,
      date_emission: today.toISOString().split('T')[0],
      delai_huitaine_date: expiryDateStr,
      motif: params.motif,
      signataire_nom: 'Jean Richard NTSEKE NGOUAKA',
      signataire_titre: 'Directeur Départemental des Loisirs de Pointe-Noire',
      agent_notificateur: `${params.agent.name} (${params.agent.badge})`,
      visa_lois: [
        'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs',
        'Loi N° 13-2011 du 17 mai 2011 portant organisation administrative de la République du Congo',
        `Délai d'exécution impératif de ${params.delaiJours === 3 ? '72 heures' : 'huitaine'} sous peine de scellement et fermeture immédiate`
      ]
    });

    const event = this.addAgentEvent({
      agentId: params.agent.badge,
      agentName: params.agent.name,
      agentBadge: params.agent.badge,
      establishmentId: est.id,
      establishmentName: est.name,
      promoterName: est.promoter_name,
      phone: est.phone,
      arrondissement: est.arrondissement,
      quartier: est.quartier,
      address: est.address,
      date: expiryDateStr,
      timeStart: '09:00',
      timeEnd: '10:00',
      type: 'NOTIFICATION_MISE_EN_DEMEURE',
      status: 'A_FAIRE',
      priority: 'URGENTE',
      amountDue: est.balance_due,
      notes: `Échéance Mise en Demeure N° ${refNum} (${params.delaiJours === 3 ? '72h' : 'Huitaine'}). Vérification paiement ou fermeture administrative.`,
      isSynced: this.isOnline
    });

    return { event, act: newAct };
  }

  // --- Legal Acts ---
  public getActs(): OfficialLegalAct[] {
    return [...this.acts];
  }

  public addAct(act: Omit<OfficialLegalAct, 'id'>): OfficialLegalAct {
    const newAct: OfficialLegalAct = {
      ...act,
      id: `ACT-${Date.now()}`
    };
    this.acts.unshift(newAct);
    this.saveActs();
    this.notifyDataUpdated();

    if (act.type === 'MISE_EN_DEMEURE') {
      this.updateEstablishment(act.establishment_id, { status: 'mise_en_demeure' });
    } else if (act.type === 'ARRETE_FERMETURE') {
      this.updateEstablishment(act.establishment_id, { status: 'fermeture_administrative' });
    } else if (act.type === 'CONVOCATION') {
      this.updateEstablishment(act.establishment_id, { status: 'convoque' });
    }

    return newAct;
  }

  // --- SPA Subscriptions & Diplomas ---
  public getSubscriptions(): SpaMerchantSubscription[] {
    return [...this.subscriptions];
  }

  public addSubscription(sub: Omit<SpaMerchantSubscription, 'id'>): SpaMerchantSubscription {
    const newSub: SpaMerchantSubscription = {
      ...sub,
      id: `SUB-${Date.now()}`
    };
    this.subscriptions.unshift(newSub);
    this.saveSubscriptions();
    this.notifyDataUpdated();
    return newSub;
  }

  public getDiplomas(): SpaHonorDiploma[] {
    return [...this.diplomas];
  }

  public addDiploma(dip: Omit<SpaHonorDiploma, 'id'>): SpaHonorDiploma {
    const newDip: SpaHonorDiploma = {
      ...dip,
      id: `DIP-${Date.now()}`
    };
    this.diplomas.unshift(newDip);
    this.saveDiplomas();
    this.notifyDataUpdated();
    return newDip;
  }

  // Statistics helper
  public getSystemStats() {
    const totalEst = this.establishments.length;
    const totalPaid = this.establishments.reduce((sum, e) => sum + e.amount_paid, 0);
    const totalDue = this.establishments.reduce((sum, e) => sum + e.total_due, 0);
    const balanceRemaining = Math.max(0, totalDue - totalPaid);
    const recoveryRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

    const transmittedDgl = this.establishments.filter(e => e.status === 'transmis_brazzaville' || e.status === 'autorise_dgl').length;
    const authorizedDgl = this.establishments.filter(e => e.status === 'autorise_dgl').length;
    const inInstruction = this.establishments.filter(e => e.status === 'en_instruction' || e.status === 'attestation_depot').length;
    const underSanction = this.establishments.filter(e => e.status === 'mise_en_demeure' || e.status === 'fermeture_administrative').length;
    const formalCount = this.establishments.filter(e => e.regime_type === 'FORMEL').length;
    const informalCount = totalEst - formalCount;

    const shareTresor = Math.round(totalPaid * (TAXATION_RULES.revenue_split.tresor_public_percent / 100));
    const shareRegie = totalPaid - shareTresor;

    const byArrondissement = TERRITORIAL_REFERENTIAL.map(arr => {
      const arrEsts = this.establishments.filter(e => e.arrondissement === arr.code);
      const count = arrEsts.length;
      const paid = arrEsts.reduce((s, e) => s + e.amount_paid, 0);
      const due = arrEsts.reduce((s, e) => s + e.total_due, 0);
      const enRegle = arrEsts.filter(e => e.status === 'autorise_dgl' || e.balance_due === 0).length;
      return {
        arrondissement: arr.name,
        code: arr.code,
        count,
        paid,
        due,
        enRegle,
        percentRecouvrement: due > 0 ? Math.round((paid / due) * 100) : 0
      };
    });

    return {
      totalEst,
      totalPaid,
      totalDue,
      balanceRemaining,
      recoveryRate: Number(recoveryRate.toFixed(1)),
      transmittedDgl,
      authorizedDgl,
      inInstruction,
      underSanction,
      formalCount,
      informalCount,
      shareTresor,
      shareRegie,
      byArrondissement
    };
  }

  public resetToFactorySeed() {
    this.establishments = generateSeedEstablishments();
    this.payments = generateSeedPayments(this.establishments);
    this.acts = generateSeedActs();
    this.subscriptions = generateSeedSubscriptions();
    this.diplomas = generateSeedDiplomas();
    this.offlineQueue = [];
    this.saveEstablishments();
    this.savePayments();
    this.saveActs();
    this.saveSubscriptions();
    this.saveDiplomas();
    this.saveQueue();
    this.notifyDataUpdated();
  }
}

export const storageService = new StorageService();
