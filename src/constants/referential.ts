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
      'Plateau',
      'Côte Sauvage',
      'Quartier du Port',
      'Mpita',
      'Tchicapika',
      'KM 4 Lumumba',
      'Losange',
      'Zone Industrielle OCH',
      'Grand Marché',
      'Saint-Pierre',
      'Mbota Lumumba',
      'Quartier Chic',
      'Nkouikou Lumumba'
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
      'Tchiniambi 1',
      'Tchiniambi 2',
      'Makayabou',
      'Matendé',
      'Mboukou',
      'Ravin',
      'Mpita Mvou-Mvou',
      'Kilomètre 5',
      'Quartier 201',
      'Quartier 202',
      'Quartier 203',
      'Quartier 204',
      'Dolisie-Gare',
      'Grand Marché Mvou-Mvou'
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
      'Fond Tié-Tié',
      'Grand Marché Tié-Tié',
      'OCH Tié-Tié',
      'Voungou 1',
      'Voungou 2',
      'Mbota Tié-Tié',
      'Jean Félix Tchicaya',
      'Tchinouka',
      'Avenue de la Liberté',
      'Quartier 301',
      'Quartier 302',
      'Quartier 303',
      'Quartier 304',
      'Saint-Antoine'
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
      'Siafoumou',
      'Vindoulou',
      'Songolo',
      'Quartier Hôpital Général',
      'Faubourg Loandjili',
      'Mbota Raffinerie',
      'Quartier 401',
      'Quartier 402',
      'Quartier 403',
      'Quartier 404',
      'Quartier 405',
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
      'Côte Matève',
      'Ngoyo-Rails',
      'Patra',
      'Mabindou',
      'Koufoli',
      'Rocade Est',
      'Zone Artisanale',
      'Tchimbamba Ouest',
      'Quartier 501',
      'Quartier 502',
      'Quartier 503',
      'Quartier 504'
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
      'Mpaka 120',
      'Matombi',
      'Djeno (Zone Pétrolière)',
      'Plage de Ngoyo',
      'Tchimba',
      'Quartier Aéroport Agostinho Neto',
      'Quartier 601',
      'Quartier 602',
      'Quartier 603',
      'Pointe-Indienne Bordure',
      'Mbota Sud'
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
    id: 'ADMIN-MATOKO',
    badge: 'ADM-PN-001',
    name: 'Jacques MATOKO',
    role: 'ADMIN',
    title: 'Administrateur Application & Resp. Service Assistance et Autorisation (SAA)',
    phone: '053028383',
    service: 'Service Assistance & Autorisation (SAA) / Contrôle Qualités & Conformité',
    email: 'Jacks.matoko@gmail.com'
  },
  {
    id: 'DIR-01',
    badge: 'DDL-DIR-001',
    name: 'Jean Richard NTSEKE NGOUAKA',
    role: 'DIRECTEUR',
    title: 'Directeur Départemental des Loisirs de Pointe-Noire (DDL-PN)',
    phone: '+242 06 600 00 01',
    service: 'Cabinet de Direction Départementale',
    email: 'directeur@ddl-pointenoire.cg'
  },
  {
    id: '0594a697-48ba-4fb7-b4cb-a979ad46f37c',
    badge: 'SAA-PN-315',
    name: 'Loic Anaclet Brell AMBETOS',
    role: 'AGENT_SAA',
    title: 'Contrôleur Qualité et Conformité (Matricule : 315713H)',
    phone: '06 425 0604',
    service: 'Brigade SAA - Terrain',
    email: 'ambetos.saa@ddl-pointenoire.cg'
  },
  {
    id: 'f42ad6b1-701a-4d8c-81df-504be9b607af',
    badge: 'SAA-PN-249',
    name: 'Yvette Lucette OBOMBA',
    role: 'AGENT_SAA',
    title: 'Statistiques et Documentation (Matricule : 249 500F)',
    phone: '065531376 / 05 627 2029',
    service: 'Brigade SAA - Terrain',
    email: 'obomba.saa@ddl-pointenoire.cg'
  },
  {
    id: 'd016ff2d-7544-466e-98c7-3cc83dbc1203',
    badge: 'SAA-PN-002',
    name: 'Rhonel KIOUNGA',
    role: 'AGENT_SAA',
    title: 'Agent de Terrain DDL',
    phone: '+242 06 933 8110',
    service: 'Brigade SAA - Terrain',
    email: 'kiounga.saa@ddl-pointenoire.cg'
  },
  {
    id: '9dfdf0dd-0177-4126-89db-335cfaf7c0dc',
    badge: 'SAA-PN-003',
    name: 'Éloge MAHOUA-WAWA',
    role: 'AGENT_SAA',
    title: 'Agent de Terrain DDL',
    phone: '06 955 8937',
    service: 'Brigade SAA - Terrain',
    email: 'wawaeloge@gmail.com'
  },
  {
    id: '9b6f4a6e-9557-4e5e-bd4b-9590ec256bca',
    badge: 'SAA-PN-004',
    name: 'Franck MPIKA',
    role: 'AGENT_SAA',
    title: 'Contrôleur Qualité et Conformité',
    phone: '+242 06 6536116 / 05 749 4748',
    service: 'Brigade SAA - Terrain',
    email: 'franckmpika555@gmail.com'
  },
  {
    id: '8f0c52a7-7ab4-498c-b67d-273e98583fe4',
    badge: 'SAA-PN-005',
    name: 'Anicet NGOMA',
    role: 'AGENT_SAA',
    title: 'Agent de Terrain DDL',
    phone: '06 902 3655',
    service: 'Brigade SAA - Terrain',
    email: 'ngoma.saa@ddl-pointenoire.cg'
  },
  {
    id: '2136e93e-5733-44f9-b9ce-a61bb2538f58',
    badge: 'SAA-PN-006',
    name: 'Jude ELENGA LAURGAEL',
    role: 'AGENT_SAA',
    title: 'Contrôleur Qualité & Conformité',
    phone: '05 087 6707',
    service: 'Brigade SAA - Terrain',
    email: 'elenga.saa@ddl-pointenoire.cg'
  },
  {
    id: '60588776-5ed5-424c-8579-9fb599ce1896',
    badge: 'SAA-PN-007',
    name: 'Fredy IBARA LABIRA',
    role: 'AGENT_SAA',
    title: 'Contrôleur Qualité et Conformité',
    phone: '06 000 00 07',
    service: 'Brigade SAA - Terrain',
    email: 'ibara.saa@ddl-pointenoire.cg'
  },
  {
    id: 'b9fb7b59-a262-4751-a25a-e6c10e6472ea',
    badge: 'SAA-PN-008',
    name: 'Hugues GALOUM OCKOUO',
    role: 'AGENT_SAA',
    title: 'Contrôleur Qualité et Conformité',
    phone: '06 675 73 87 / 06 125 8401',
    service: 'Brigade SAA - Terrain',
    email: 'galoum.saa@ddl-pointenoire.cg'
  },
  {
    id: '268281cd-3b0c-476f-a99a-0e7f8c41a9e0',
    badge: 'SAA-PN-009',
    name: 'Juveldi MPEMBA',
    role: 'AGENT_SAA',
    title: 'Responsable Qualité',
    phone: '068817104',
    service: 'Brigade SAA - Terrain',
    email: 'jacquesmatoko.emploi@gmail.com'
  },
  {
    id: '4aa6cbd4-7b8d-48cf-adc9-736e8295c9d0',
    badge: 'SPA-PN-010',
    name: 'Ulriche Pergella KITSAKOU',
    role: 'CHEF_SPA',
    title: 'Promotion & Animation des Loisirs',
    phone: '06 000 00 10',
    service: 'Service Promotion, Animation & Loisirs Sains',
    email: 'kitsakou.spa@ddl-pointenoire.cg'
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
