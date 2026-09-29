import { ArrondissementInfo, ActivityCategoryRate, AppUser, PtaObjective } from '../types';

export const REPUBLIQUE_CONGO = {
  nom: 'République du Congo',
  devise: 'Unité • Travail • Progrès',
  ministere: 'Ministère de la Culture, des Arts, du Tourisme et des Loisirs',
  ministere_abreviation: 'MCAPNIT',
  direction_centrale: 'Direction Générale des Loisirs (DGL - Brazzaville)',
  direction_departementale: 'Direction Départementale des Loisirs de Pointe-Noire (DDL-PN)',
  departement: 'Pointe-Noire',
  siege: 'Avenue de Gaulle, Face Hôtel de Ville, B.P. 1288 Pointe-Noire',
  contact: '+242 06 600 00 01 / contact@ddl-pointenoire.cg',
  annee_pta: '2026'
};

export const TERRITORIAL_REFERENTIAL: ArrondissementInfo[] = [
  {
    number: 1,
    code: '1_LUMUMBA',
    name: 'Arrondissement 1 Lumumba',
    official_name: 'Arrondissement 1 Patrice Émery Lumumba',
    quartiers: [
      'Centre-Ville',
      'Mpita',
      'Côte Sauvage',
      'Saint-Pierre',
      'Tchicapika',
      'KM 4',
      'Quartier du Port',
      'Zone Industrielle OCH',
      'Grand Marché'
    ],
    sig_coordinates: [-4.7938, 11.8569]
  },
  {
    number: 2,
    code: '2_MVOUMVOU',
    name: 'Arrondissement 2 Mvou-Mvou',
    official_name: 'Arrondissement 2 Mvou-Mvou',
    quartiers: [
      'Mvou-Mvou Centre',
      'Tchiniambi',
      'Makayabou',
      'Matendé',
      'Kilomètre 5',
      'Plateau',
      'Dolisie-Gare'
    ],
    sig_coordinates: [-4.7781, 11.8712]
  },
  {
    number: 3,
    code: '3_TIETIE',
    name: 'Arrondissement 3 Tié-Tié',
    official_name: 'Arrondissement 3 Tié-Tié',
    quartiers: [
      'Tié-Tié Centre',
      'Marché Tié-Tié',
      'Fond Tié-Tié',
      'Och Tié-Tié',
      'Mboukou',
      'Jean Félix Tchicaya',
      'Avenue de la Liberté'
    ],
    sig_coordinates: [-4.7645, 11.9056]
  },
  {
    number: 4,
    code: '4_LOANDJILI',
    name: 'Arrondissement 4 Louandjili',
    official_name: 'Arrondissement 4 Loandjili',
    quartiers: [
      'Loandjili Centre',
      'Faubourg',
      'Siafoumou',
      'Songolo',
      'Quartier Hôpital Général',
      'Zone Résidentielle Nord'
    ],
    sig_coordinates: [-4.7389, 11.8847]
  },
  {
    number: 5,
    code: '5_MONGO_MPOUKOU',
    name: 'Arrondissement 5 Mongo-Mpoukou',
    official_name: 'Arrondissement 5 Mongo-Mpoukou',
    quartiers: [
      'Mongo-Mpoukou Centre',
      'Vindoulou',
      'Ngoyo-Rails',
      'Rocade Est',
      'Zone Artisanale',
      'Koufoli'
    ],
    sig_coordinates: [-4.7521, 11.9324]
  },
  {
    number: 6,
    code: '6_NGOYO',
    name: 'Arrondissement 6 Ngoyo',
    official_name: 'Arrondissement 6 Ngoyo',
    quartiers: [
      'Ngoyo Centre',
      'Mpaka',
      'Matombi',
      'Plage Ngoyo',
      'Coraf / Djeno Carrefour',
      'Zone Aéroportuaire'
    ],
    sig_coordinates: [-4.8312, 11.9125]
  }
];

export const ACTIVITY_CATEGORIES: ActivityCategoryRate[] = [
  {
    code: 'A1.1',
    label: 'Discothèque / Boîte de Nuit',
    category: 'Loisirs Nocturnes & Festifs',
    rate_per_sqm_fcfa: 1500,
    base_fixed_fee_fcfa: 150000
  },
  {
    code: 'A1.2',
    label: 'VIP Lounge & Salons Privés',
    category: 'Loisirs Nocturnes & Festifs',
    rate_per_sqm_fcfa: 1200,
    base_fixed_fee_fcfa: 120000
  },
  {
    code: 'A1.3',
    label: 'Bar Dancing / Cabaret Live',
    category: 'Loisirs Nocturnes & Festifs',
    rate_per_sqm_fcfa: 1000,
    base_fixed_fee_fcfa: 100000
  },
  {
    code: 'A2.1',
    label: 'Snack-Bar / Débit de Boissons',
    category: 'Débits de Boissons & Convivialité',
    rate_per_sqm_fcfa: 800,
    base_fixed_fee_fcfa: 80000
  },
  {
    code: 'A2.2',
    label: 'Terrasse Plein Air & Espace Festif',
    category: 'Débits de Boissons & Convivialité',
    rate_per_sqm_fcfa: 800,
    base_fixed_fee_fcfa: 80000
  },
  {
    code: 'A3.1',
    label: 'Bowling & Salle de Jeux Récréatifs',
    category: 'Loisirs Sains & Attractions',
    rate_per_sqm_fcfa: 700,
    base_fixed_fee_fcfa: 100000
  },
  {
    code: 'A3.2',
    label: 'Complexe Récréatif & Détente Familiale',
    category: 'Loisirs Sains & Attractions',
    rate_per_sqm_fcfa: 600,
    base_fixed_fee_fcfa: 120000
  },
  {
    code: 'A4.1',
    label: 'Centre Culturel & Salle Polyvalente',
    category: 'Culture & Réception',
    rate_per_sqm_fcfa: 500,
    base_fixed_fee_fcfa: 80000
  }
];

export const TAXATION_RULES = {
  filing_fee_formal_fcfa: 50000,
  filing_fee_informal_fcfa: 30000,
  revenue_split: {
    tresor_public_percent: 70,
    regie_fonctionnement_ddl_percent: 30
  },
  allowed_installments: [1, 2, 3, 4]
};

export const APP_USERS: AppUser[] = [
  {
    id: 'DIR-01',
    badge: 'DDL-DIR-001',
    name: 'Jacques Alphonse MATOKO',
    role: 'DIRECTEUR',
    title: 'Directeur Départemental des Loisirs de Pointe-Noire',
    phone: '+242 06 600 00 01',
    service: 'Cabinet de Direction',
    email: 'directeur@ddl-pointenoire.cg'
  },
  {
    id: 'SAA-CHEF',
    badge: 'SAA-PN-001',
    name: 'Chef Brigade SAA',
    role: 'CHEF_SAA',
    title: 'Chef de Brigade - Service Agrément & Assainissement',
    phone: '+242 06 620 11 22',
    service: 'Brigade SAA',
    email: 'saa.commandement@ddl-pointenoire.cg'
  },
  {
    id: 'SAA-008',
    badge: 'SAA-PN-008',
    name: 'Agent SAA Loubaki',
    role: 'AGENT_SAA',
    title: 'Agent Enquêteur Assermenté (Badge N° 08)',
    phone: '+242 06 654 32 10',
    service: 'Brigade SAA - Terrain',
    email: 'loubaki.saa@ddl-pointenoire.cg'
  },
  {
    id: 'SAA-005',
    badge: 'SAA-PN-005',
    name: 'Agent SAA Tchicaya',
    role: 'AGENT_SAA',
    title: 'Agent Enquêteur Assermenté (Badge N° 05)',
    phone: '+242 05 522 33 44',
    service: 'Brigade SAA - Terrain',
    email: 'tchicaya.saa@ddl-pointenoire.cg'
  },
  {
    id: 'SAA-012',
    badge: 'SAA-PN-012',
    name: 'Agent SAA Makosso',
    role: 'AGENT_SAA',
    title: 'Agent Enquêteur Assermenté (Badge N° 12)',
    phone: '+242 06 911 22 33',
    service: 'Brigade SAA - Terrain',
    email: 'makosso.saa@ddl-pointenoire.cg'
  },
  {
    id: 'SAF-REGIE',
    badge: 'SAF-REG-01',
    name: 'Régisseur DDL-PN',
    role: 'REGISSEUR',
    title: 'Régisseur des Recettes & Versements Trésor',
    phone: '+242 06 800 12 34',
    service: 'Service Administratif & Financier (SAF)',
    email: 'regie.saf@ddl-pointenoire.cg'
  },
  {
    id: 'SPA-CHEF',
    badge: 'SPA-PN-01',
    name: 'Chef Service SPA',
    role: 'CHEF_SPA',
    title: 'Chef de Service Promotion & Animation des Loisirs',
    phone: '+242 06 700 45 67',
    service: 'Service Promotion, Animation & Loisirs Sains',
    email: 'promotion.spa@ddl-pointenoire.cg'
  }
];

export const PTA_2026_AXES: PtaObjective[] = [
  {
    id: 'PTA-AXE1-01',
    axe_number: 1,
    axe_title: 'Axe 1 : Recensement Exhaustif & Assainissement SAA',
    objective_title: 'Recensement et géoréférencement exhaustif des établissements de loisirs de Pointe-Noire',
    target_value: 150,
    current_value: 117,
    unit: 'Établissements',
    progress_percent: 78,
    deadline: '31 Décembre 2026',
    lead_service: 'Brigade SAA'
  },
  {
    id: 'PTA-AXE1-02',
    axe_number: 1,
    axe_title: 'Axe 1 : Recensement Exhaustif & Assainissement SAA',
    objective_title: 'Contrôles in situ des seuils acoustiques nocturnes (<85 dB après 22h)',
    target_value: 80,
    current_value: 58,
    unit: 'Inspections acoustiques',
    progress_percent: 72.5,
    deadline: '30 Novembre 2026',
    lead_service: 'Brigade SAA'
  },
  {
    id: 'PTA-AXE2-01',
    axe_number: 2,
    axe_title: 'Axe 2 : Digitalisation des Paiements & Régie SAF',
    objective_title: 'Recouvrement des redevances avec reversement Trésor Public (Objectif: 35 000 000 FCFA)',
    target_value: 35000000,
    current_value: 23640000,
    unit: 'FCFA',
    progress_percent: 67.5,
    deadline: '31 Décembre 2026',
    lead_service: 'SAF / Régie des Recettes'
  },
  {
    id: 'PTA-AXE2-02',
    axe_number: 2,
    axe_title: 'Axe 2 : Digitalisation des Paiements & Régie SAF',
    objective_title: 'Émission systématique de quittance thermique 58mm ou attestation sécurisée QR Code',
    target_value: 100,
    current_value: 94,
    unit: '% des encaissements',
    progress_percent: 94,
    deadline: 'En continu',
    lead_service: 'SAF / Brigade SAA'
  },
  {
    id: 'PTA-AXE3-01',
    axe_number: 3,
    axe_title: 'Axe 3 : Promotion des Loisirs Sains, Culture & Tourisme (SPA)',
    objective_title: 'Labellisation d’établissements exemplaires au Diplôme d’Honneur des Loisirs Sains',
    target_value: 25,
    current_value: 16,
    unit: 'Établissements labellisés',
    progress_percent: 64,
    deadline: '30 Octobre 2026',
    lead_service: 'Service SPA'
  },
  {
    id: 'PTA-AXE3-02',
    axe_number: 3,
    axe_title: 'Axe 3 : Promotion des Loisirs Sains, Culture & Tourisme (SPA)',
    objective_title: 'Souscription aux formules d’abonnement visibilité marchande (25k, 50k, 100k FCFA)',
    target_value: 30,
    current_value: 19,
    unit: 'Abonnements actifs',
    progress_percent: 63.3,
    deadline: '31 Décembre 2026',
    lead_service: 'Service SPA'
  },
  {
    id: 'PTA-AXE4-01',
    axe_number: 4,
    axe_title: 'Axe 4 : Transmission Centrale & Modernisation Administrative DGL',
    objective_title: 'Dossiers complets instruits transmis à la Direction Générale des Loisirs à Brazzaville',
    target_value: 75,
    current_value: 52,
    unit: 'Dossiers transmis',
    progress_percent: 69.3,
    deadline: '31 Décembre 2026',
    lead_service: 'Cabinet Direction DDL-PN'
  }
];

export const LEGAL_TEXTS = [
  {
    ref: 'Loi N° 21-2019 du 12 juillet 2019',
    title: 'Loi fixant le régime général des activités de loisirs en République du Congo',
    articles: [
      { num: 'Art. 4', text: 'Toute ouverture et exploitation d’un établissement de loisirs public ou privé est subordonnée à l’obtention préalable d’un agrément d’exploitation délivré par l’autorité de tutelle.' },
      { num: 'Art. 12', text: 'Les exploitants sont tenus de respecter les normes acoustiques, d’hygiène, de salubrité publique et de sécurité incendie prescrites par la réglementation nationale.' },
      { num: 'Art. 27', text: 'Les infractions aux dispositions de la présente loi sont constatées par les agents assermentés de la Direction Départementale des Loisirs et punies conformément aux textes en vigueur.' }
    ]
  },
  {
    ref: 'Décret N° 2021-412 du 28 octobre 2021',
    title: 'Décret portant attributions et organisation de la Direction Générale des Loisirs et de ses directions départementales',
    articles: [
      { num: 'Art. 9', text: 'La Direction Départementale des Loisirs est chargée dans son ressort territorial du recensement, de l’instruction des demandes d’agrément, du contrôle de conformité et du recouvrement des redevances réglementaires.' },
      { num: 'Art. 15', text: 'Les recettes collectées au titre des frais de dossier et redevances d’agrément sont réparties à hauteur de 70% pour le Trésor Public et 30% pour le compte de fonctionnement de la régie départementale.' }
    ]
  },
  {
    ref: 'Arrêté Départemental N° 018/MCAPNIT/DGL/DDL-PN-2026',
    title: 'Arrêté portant réglementation des horaires nocturnes et seuils sonores des débits de boissons et discothèques de Pointe-Noire',
    articles: [
      { num: 'Art. 1', text: 'L’émission sonore extérieure ne peut excéder 85 décibels mesurés en limite de propriété après 22h00. L’installation d’un limiteur-enregistreur acoustique scellé par la brigade SAA est obligatoire pour les boîtes de nuit et cabarets.' },
      { num: 'Art. 3', text: 'En cas de constat d’infraction flagrante ou d’absence d’agrément, une mise en demeure sous huitaine (72 heures ouvrées) est immédiatement notifiée à l’exploitant.' },
      { num: 'Art. 7', text: 'L’inobservation de la mise en demeure entraîne de plein droit la fermeture administrative immédiate des locaux avec apposition des scellés de la République.' }
    ]
  }
];
