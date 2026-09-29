import { Establishment, TerrainPaymentRecord, OfficialLegalAct, SpaMerchantSubscription, SpaHonorDiploma, ArrondissementCode, RegimeType, EstablishmentStatus, AgentTourneeEvent, AppUser } from '../types';
import { TERRITORIAL_REFERENTIAL, ACTIVITY_CATEGORIES, TAXATION_RULES } from '../constants/referential';

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

// Generate realistic seed of 118 establishments across Pointe-Noire
function generateSeedEstablishments(): Establishment[] {
  const establishments: Establishment[] = [];

  const rawEstablishmentData = [
    // Arrondissement 1 - Lumumba (Prestigious, Coast, Center)
    { name: 'Le Grand Baobab VIP Lounge', prom: 'Christian BITEMO', phone: '+242 06 612 88 90', quart: 'Mpita', act: 'A1.2', reg: 'FORMEL', surf: 220, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-089', coord: [-4.7982, 11.8512] },
    { name: 'Club 77 Discothèque', prom: 'Jean-Pierre TCHICAYA', phone: '+242 06 630 14 52', quart: 'Centre-Ville', act: 'A1.1', reg: 'FORMEL', surf: 310, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-044', coord: [-4.7915, 11.8598] },
    { name: 'La Brise de l\'Atlantique Bar-Plage', prom: 'Solange MOUNTOU', phone: '+242 05 510 40 33', quart: 'Côte Sauvage', act: 'A2.2', reg: 'FORMEL', surf: 450, stat: 'transmis_brazzaville', coord: [-4.8105, 11.8420] },
    { name: 'Le Havana Club & Cigar Lounge', prom: 'Alain MPOUELE', phone: '+242 06 940 77 12', quart: 'Centre-Ville', act: 'A1.2', reg: 'FORMEL', surf: 180, stat: 'attestation_depot', coord: [-4.7930, 11.8620] },
    { name: 'Bowling Club Ponton d\'Or', prom: 'Frédéric MOUKOKO', phone: '+242 06 655 22 99', quart: 'Mpita', act: 'A3.1', reg: 'FORMEL', surf: 520, stat: 'en_instruction', coord: [-4.8010, 11.8540] },
    { name: 'Snack-Bar Le Saint-Pierre', prom: 'Henriette PACKA', phone: '+242 05 522 18 70', quart: 'Saint-Pierre', act: 'A2.1', reg: 'INFORMEL', surf: 75, stat: 'identifie', coord: [-4.7890, 11.8680] },
    { name: 'Le Bateau Ivre Cabaret Live', prom: 'Auguste LOUNDOU', phone: '+242 06 680 34 11', quart: 'Quartier du Port', act: 'A1.3', reg: 'FORMEL', surf: 190, stat: 'attestation_depot', coord: [-4.7850, 11.8530] },
    { name: 'Espace Récréatif Les Bambins', prom: 'Marie-Reine NZIKOU', phone: '+242 05 580 90 22', quart: 'Mpita', act: 'A3.2', reg: 'FORMEL', surf: 380, stat: 'transmis_brazzaville', coord: [-4.8040, 11.8490] },
    { name: 'Le Refuge de KM 4', prom: 'Bruno BOUANGA', phone: '+242 06 820 15 44', quart: 'KM 4', act: 'A2.1', reg: 'INFORMEL', surf: 60, stat: 'convoque', coord: [-4.7995, 11.8720] },
    { name: 'Terrasse OCH Lounge', prom: 'Sylvie MAVOUNGOU', phone: '+242 06 677 33 21', quart: 'Zone Industrielle OCH', act: 'A2.2', reg: 'FORMEL', surf: 240, stat: 'mise_en_demeure', coord: [-4.7870, 11.8790] },
    { name: 'Le Palmier Royal Cabaret', prom: 'Édouard KOUMBA', phone: '+242 05 540 66 11', quart: 'Côte Sauvage', act: 'A1.3', reg: 'FORMEL', surf: 160, stat: 'en_instruction', coord: [-4.8150, 11.8390] },
    { name: 'Snack Le Nautique Plage', prom: 'Astride GAMBOMI', phone: '+242 06 912 45 78', quart: 'Côte Sauvage', act: 'A2.1', reg: 'INFORMEL', surf: 85, stat: 'identifie', coord: [-4.8210, 11.8370] },
    { name: 'Bar Le Point Zéro', prom: 'Gaspard TSONDE', phone: '+242 06 601 29 44', quart: 'Grand Marché', act: 'A2.1', reg: 'INFORMEL', surf: 70, stat: 'convoque', coord: [-4.7920, 11.8640] },
    { name: 'Le Saphir Night Club', prom: 'Diane BASSOUAMINA', phone: '+242 05 599 00 12', quart: 'Centre-Ville', act: 'A1.1', reg: 'FORMEL', surf: 280, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-112', coord: [-4.7945, 11.8580] },
    { name: 'Centre Culturel Jean-Baptiste Tati', prom: 'Direction Association Arts', phone: '+242 06 650 99 88', quart: 'Mpita', act: 'A4.1', reg: 'FORMEL', surf: 420, stat: 'autorise_dgl', dgl: 'AGR-DGL-2024-003', coord: [-4.8020, 11.8560] },
    { name: 'Bar Dancing Tchicapika Sun', prom: 'Romuald NGOUABI', phone: '+242 06 874 12 30', quart: 'Tchicapika', act: 'A1.3', reg: 'INFORMEL', surf: 110, stat: 'identifie', coord: [-4.7960, 11.8710] },
    { name: 'VIP Garden Mpita', prom: 'Bertin MASSAMBA', phone: '+242 05 530 81 22', quart: 'Mpita', act: 'A2.2', reg: 'FORMEL', surf: 195, stat: 'attestation_depot', coord: [-4.8060, 11.8480] },
    { name: 'Snack Bar L\'Étoile Noire', prom: 'Chantal LOUBAKI', phone: '+242 06 690 44 55', quart: 'KM 4', act: 'A2.1', reg: 'INFORMEL', surf: 50, stat: 'fermeture_administrative', coord: [-4.8010, 11.8750] },
    { name: 'Le Patio Gourmand & Loisirs', prom: 'Antoine DE SOUZA', phone: '+242 06 662 33 00', quart: 'Centre-Ville', act: 'A3.2', reg: 'FORMEL', surf: 310, stat: 'en_instruction', coord: [-4.7900, 11.8605] },
    { name: 'Bar Dancing Chez Mère Jolie', prom: 'Jolie KOUKA', phone: '+242 05 512 77 99', quart: 'Saint-Pierre', act: 'A1.3', reg: 'INFORMEL', surf: 90, stat: 'convoque', coord: [-4.7875, 11.8660] },

    // Arrondissement 2 - Mvou-Mvou (Historic, dense, popular musical ambiance)
    { name: 'Le Temple de la Rumba', prom: 'Paulin KIMBEMBE', phone: '+242 06 644 11 20', quart: 'Makayabou', act: 'A1.3', reg: 'FORMEL', surf: 260, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-067', coord: [-4.7750, 11.8730] },
    { name: 'Snack Bar Matendé Ambiance', prom: 'Gervais MALONGA', phone: '+242 05 544 32 10', quart: 'Matendé', act: 'A2.1', reg: 'INFORMEL', surf: 80, stat: 'attestation_depot', coord: [-4.7790, 11.8690] },
    { name: 'Night Club Le Métro Mvou-Mvou', prom: 'Bonaventure NGANGA', phone: '+242 06 910 88 55', quart: 'Mvou-Mvou Centre', act: 'A1.1', reg: 'FORMEL', surf: 210, stat: 'transmis_brazzaville', coord: [-4.7780, 11.8715] },
    { name: 'Terrasse Festive Tchiniambi', prom: 'Nathalie BIKINDOU', phone: '+242 06 612 00 33', quart: 'Tchiniambi', act: 'A2.2', reg: 'FORMEL', surf: 170, stat: 'en_instruction', coord: [-4.7720, 11.8660] },
    { name: 'Bar Chez Papa Wemba Rive Gauche', prom: 'Séraphin DOSSOU', phone: '+242 05 561 22 90', quart: 'Kilomètre 5', act: 'A1.3', reg: 'INFORMEL', surf: 120, stat: 'mise_en_demeure', coord: [-4.7810, 11.8780] },
    { name: 'Snack-Bar Le Plateau Vivant', prom: 'Yvette MATONDO', phone: '+242 06 833 45 12', quart: 'Plateau', act: 'A2.1', reg: 'INFORMEL', surf: 65, stat: 'identifie', coord: [-4.7760, 11.8760] },
    { name: 'Cabaret Jazz & Afro Dolisie-Gare', prom: 'Justin MBEMBA', phone: '+242 06 677 88 99', quart: 'Dolisie-Gare', act: 'A1.3', reg: 'FORMEL', surf: 150, stat: 'attestation_depot', coord: [-4.7840, 11.8695] },
    { name: 'Complexe Récréatif Mvou-Mvou Star', prom: 'Aimé MAKITA', phone: '+242 05 519 33 00', quart: 'Mvou-Mvou Centre', act: 'A3.2', reg: 'FORMEL', surf: 320, stat: 'transmis_brazzaville', coord: [-4.7770, 11.8700] },
    { name: 'VIP Salons Les Connaisseurs', prom: 'Clément MOUKOKO', phone: '+242 06 945 12 78', quart: 'Makayabou', act: 'A1.2', reg: 'FORMEL', surf: 140, stat: 'en_instruction', coord: [-4.7735, 11.8750] },
    { name: 'Bar Dansant La Paillote de Tchiniambi', prom: 'Léontine NGOMA', phone: '+242 06 618 90 45', quart: 'Tchiniambi', act: 'A1.3', reg: 'INFORMEL', surf: 95, stat: 'convoque', coord: [-4.7700, 11.8640] },
    { name: 'Snack Bar Le Relais du KM 5', prom: 'Pascal MILANDOU', phone: '+242 05 533 11 88', quart: 'Kilomètre 5', act: 'A2.1', reg: 'INFORMEL', surf: 75, stat: 'identifie', coord: [-4.7825, 11.8800] },
    { name: 'Terrasse Le Jardin Secret de Matendé', prom: 'Francine BOKO', phone: '+242 06 890 22 14', quart: 'Matendé', act: 'A2.2', reg: 'INFORMEL', surf: 130, stat: 'identifie', coord: [-4.7805, 11.8670] },
    { name: 'Salle Polyvalente La Fraternité', prom: 'Association Solidarité Mvou-Mvou', phone: '+242 06 602 11 44', quart: 'Plateau', act: 'A4.1', reg: 'FORMEL', surf: 350, stat: 'autorise_dgl', dgl: 'AGR-DGL-2024-041', coord: [-4.7745, 11.8770] },
    { name: 'Bar Le Rythme Makayabou', prom: 'Ferdinand NZABA', phone: '+242 05 570 44 22', quart: 'Makayabou', act: 'A1.3', reg: 'INFORMEL', surf: 105, stat: 'convoque', coord: [-4.7765, 11.8720] },
    { name: 'Discothèque Black and White', prom: 'Désiré LOUSSOUKOU', phone: '+242 06 912 33 00', quart: 'Mvou-Mvou Centre', act: 'A1.1', reg: 'FORMEL', surf: 190, stat: 'fermeture_administrative', coord: [-4.7795, 11.8705] },
    { name: 'Snack La Palmeraie', prom: 'Béatrice MOUKILA', phone: '+242 06 655 88 12', quart: 'Dolisie-Gare', act: 'A2.1', reg: 'INFORMEL', surf: 55, stat: 'identifie', coord: [-4.7855, 11.8680] },
    { name: 'Bar Dancing Les Palmes d\'Or', prom: 'Jacques SITA', phone: '+242 05 540 99 77', quart: 'Tchiniambi', act: 'A1.3', reg: 'FORMEL', surf: 145, stat: 'attestation_depot', coord: [-4.7710, 11.8655] },
    { name: 'Espace Jeux Vidéo & Récréatif', prom: 'Ghislain MAMPOUYA', phone: '+242 06 811 77 44', quart: 'Matendé', act: 'A3.1', reg: 'INFORMEL', surf: 80, stat: 'en_instruction', coord: [-4.7785, 11.8685] },
    { name: 'Terrasse Bar Ponton Soir', prom: 'Odette BAZOLO', phone: '+242 06 623 99 00', quart: 'Kilomètre 5', act: 'A2.2', reg: 'INFORMEL', surf: 110, stat: 'mise_en_demeure', coord: [-4.7830, 11.8790] },

    // Arrondissement 3 - Tié-Tié (Major commercial hub, popular nightlife)
    { name: 'Complexe La Paillote Tié-Tié', prom: 'Stanislas MASSAMBA', phone: '+242 06 632 88 11', quart: 'Tié-Tié Centre', act: 'A3.2', reg: 'FORMEL', surf: 480, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-019', coord: [-4.7640, 11.9050] },
    { name: 'Discothèque Le Pharaon VIP', prom: 'Gilbert MALONDA', phone: '+242 06 950 44 20', quart: 'Marché Tié-Tié', act: 'A1.1', reg: 'FORMEL', surf: 290, stat: 'transmis_brazzaville', coord: [-4.7610, 11.9080] },
    { name: 'Bar Dancing La Renaissance Mboukou', prom: 'Thérèse NZAHOU', phone: '+242 05 520 18 33', quart: 'Mboukou', act: 'A1.3', reg: 'FORMEL', surf: 160, stat: 'attestation_depot', coord: [-4.7680, 11.8990] },
    { name: 'Snack Bar Le Fond Tié-Tié Ambiance', prom: 'Wilfrid GAMBOU', phone: '+242 06 671 22 55', quart: 'Fond Tié-Tié', act: 'A2.1', reg: 'INFORMEL', surf: 75, stat: 'convoque', coord: [-4.7580, 11.9120] },
    { name: 'Terrasse Espace Liberté', prom: 'Serge BOKETSU', phone: '+242 05 588 44 00', quart: 'Avenue de la Liberté', act: 'A2.2', reg: 'FORMEL', surf: 220, stat: 'attestation_depot', coord: [-4.7650, 11.9020] },
    { name: 'VIP Lounge Félix Tchicaya', prom: 'Honoré GOUAMBA', phone: '+242 06 840 99 11', quart: 'Jean Félix Tchicaya', act: 'A1.2', reg: 'FORMEL', surf: 150, stat: 'en_instruction', coord: [-4.7630, 11.9010] },
    { name: 'Bowling & Jeux OCH Tié-Tié', prom: 'Célestin NKOUNKOU', phone: '+242 06 612 77 33', quart: 'Och Tié-Tié', act: 'A3.1', reg: 'FORMEL', surf: 390, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-078', coord: [-4.7665, 11.9090] },
    { name: 'Bar Dancing Le Carrefour des As', prom: 'Paul MABIALA', phone: '+242 05 533 80 19', quart: 'Fond Tié-Tié', act: 'A1.3', reg: 'INFORMEL', surf: 115, stat: 'mise_en_demeure', coord: [-4.7570, 11.9140] },
    { name: 'Snack Bar Chez Maman Pauline', prom: 'Pauline MIKOLO', phone: '+242 06 920 11 88', quart: 'Marché Tié-Tié', act: 'A2.1', reg: 'INFORMEL', surf: 60, stat: 'identifie', coord: [-4.7600, 11.9070] },
    { name: 'Terrasse Bar Les Flots Bleus Tié-Tié', prom: 'Gaston MAKAYA', phone: '+242 06 645 33 22', quart: 'Mboukou', act: 'A2.2', reg: 'INFORMEL', surf: 135, stat: 'en_instruction', coord: [-4.7690, 11.8970] },
    { name: 'Salle des Fêtes L\'Espérance', prom: 'Élisabeth NGATSE', phone: '+242 05 550 22 11', quart: 'Tié-Tié Centre', act: 'A4.1', reg: 'FORMEL', surf: 290, stat: 'transmis_brazzaville', coord: [-4.7648, 11.9065] },
    { name: 'Bar Dancing Sun City', prom: 'Basile LOUAMBA', phone: '+242 06 877 44 99', quart: 'Avenue de la Liberté', act: 'A1.3', reg: 'INFORMEL', surf: 100, stat: 'convoque', coord: [-4.7660, 11.9035] },
    { name: 'Snack Bar Le Bambou Tié-Tié', prom: 'Patrick LOUVOUANDOU', phone: '+242 06 988 77 66', quart: 'Fond Tié-Tié', act: 'A2.1', reg: 'INFORMEL', surf: 65, stat: 'fermeture_administrative', coord: [-4.7560, 11.9150] },
    { name: 'VIP Bar L\'Écrin Doré', prom: 'Valérie BIKOUTA', phone: '+242 06 601 55 88', quart: 'Jean Félix Tchicaya', act: 'A1.2', reg: 'FORMEL', surf: 135, stat: 'attestation_depot', coord: [-4.7620, 11.9025] },
    { name: 'Discothèque Club Tropicana', prom: 'Mathieu NGATSONGO', phone: '+242 05 518 77 33', quart: 'Och Tié-Tié', act: 'A1.1', reg: 'FORMEL', surf: 240, stat: 'autorise_dgl', dgl: 'AGR-DGL-2024-099', coord: [-4.7675, 11.9110] },
    { name: 'Bar Chez Papa Bonheur', prom: 'Arsène MPASSI', phone: '+242 06 629 11 44', quart: 'Mboukou', act: 'A2.1', reg: 'INFORMEL', surf: 70, stat: 'identifie', coord: [-4.7700, 11.8950] },
    { name: 'Terrasse Le Palmier Tié-Tié', prom: 'Chantal NKODIA', phone: '+242 05 572 66 11', quart: 'Fond Tié-Tié', act: 'A2.2', reg: 'INFORMEL', surf: 90, stat: 'identifie', coord: [-4.7550, 11.9160] },
    { name: 'Complexe Détente Jeunesse Tié-Tié', prom: 'Alphonse NDINGA', phone: '+242 06 933 22 55', quart: 'Tié-Tié Centre', act: 'A3.2', reg: 'FORMEL', surf: 310, stat: 'en_instruction', coord: [-4.7635, 11.9040] },
    { name: 'Bar Dancing Rumba Star 2026', prom: 'Fabrice TSIBA', phone: '+242 06 680 77 11', quart: 'Avenue de la Liberté', act: 'A1.3', reg: 'INFORMEL', surf: 110, stat: 'attestation_depot', coord: [-4.7670, 11.9015] },
    { name: 'Snack Bar L\'Aurore', prom: 'Mireille KINZONZI', phone: '+242 05 544 99 22', quart: 'Marché Tié-Tié', act: 'A2.1', reg: 'INFORMEL', surf: 50, stat: 'convoque', coord: [-4.7595, 11.9085] },

    // Arrondissement 4 - Loandjili (North zone, hospitals, Siafoumou, residential)
    { name: 'Complexe Touristique Siafoumou Park', prom: 'Guy-Roger MABIKA', phone: '+242 06 620 99 44', quart: 'Siafoumou', act: 'A3.2', reg: 'FORMEL', surf: 600, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-032', coord: [-4.7320, 11.8890] },
    { name: 'Discothèque Le Mirage de Songolo', prom: 'Armand BIANGO', phone: '+242 06 915 22 30', quart: 'Songolo', act: 'A1.1', reg: 'FORMEL', surf: 230, stat: 'transmis_brazzaville', coord: [-4.7290, 11.8790] },
    { name: 'VIP Lounge Loandjili Prestige', prom: 'Julienne ONDONGO', phone: '+242 05 531 44 88', quart: 'Loandjili Centre', act: 'A1.2', reg: 'FORMEL', surf: 160, stat: 'attestation_depot', coord: [-4.7380, 11.8840] },
    { name: 'Snack-Bar Hôpital Oasis', prom: 'Fidèle MOUSSOKI', phone: '+242 06 684 11 00', quart: 'Quartier Hôpital Général', act: 'A2.1', reg: 'INFORMEL', surf: 70, stat: 'identifie', coord: [-4.7410, 11.8820] },
    { name: 'Bar Dancing Faubourg Express', prom: 'Simon MATINGOU', phone: '+242 05 580 33 22', quart: 'Faubourg', act: 'A1.3', reg: 'INFORMEL', surf: 130, stat: 'convoque', coord: [-4.7430, 11.8860] },
    { name: 'Terrasse Plein Air Les Manguiers', prom: 'Blandine TSONA', phone: '+242 06 822 55 99', quart: 'Zone Résidentielle Nord', act: 'A2.2', reg: 'FORMEL', surf: 210, stat: 'en_instruction', coord: [-4.7250, 11.8870] },
    { name: 'Bowling Club Nord Loandjili', prom: 'Rodrigue BANTSIMBA', phone: '+242 06 611 44 77', quart: 'Loandjili Centre', act: 'A3.1', reg: 'FORMEL', surf: 410, stat: 'attestation_depot', coord: [-4.7370, 11.8855] },
    { name: 'Bar Dansant Chez Tonton Songolo', prom: 'Lucien NTOUMI', phone: '+242 05 560 11 77', quart: 'Songolo', act: 'A1.3', reg: 'INFORMEL', surf: 105, stat: 'mise_en_demeure', coord: [-4.7300, 11.8770] },
    { name: 'Salle Réception La Sérénité', prom: 'Colette NGOUOLALI', phone: '+242 06 940 88 12', quart: 'Siafoumou', act: 'A4.1', reg: 'FORMEL', surf: 330, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-055', coord: [-4.7330, 11.8910] },
    { name: 'Snack Bar Le Repos de Siafoumou', prom: 'Denis BAMBI', phone: '+242 06 673 22 11', quart: 'Siafoumou', act: 'A2.1', reg: 'INFORMEL', surf: 80, stat: 'identifie', coord: [-4.7345, 11.8880] },
    { name: 'Terrasse Bar L\'Olivier', prom: 'Sylvestre GAKOSSO', phone: '+242 05 512 88 44', quart: 'Quartier Hôpital Général', act: 'A2.2', reg: 'INFORMEL', surf: 115, stat: 'en_instruction', coord: [-4.7420, 11.8810] },
    { name: 'Cabaret Live Loandjili Mélodie', prom: 'Clarisse LOEMBA', phone: '+242 06 880 33 55', quart: 'Loandjili Centre', act: 'A1.3', reg: 'FORMEL', surf: 175, stat: 'transmis_brazzaville', coord: [-4.7395, 11.8835] },
    { name: 'Snack Le Mistral', prom: 'Dieudonné PEMBA', phone: '+242 06 630 77 99', quart: 'Faubourg', act: 'A2.1', reg: 'INFORMEL', surf: 60, stat: 'convoque', coord: [-4.7445, 11.8875] },
    { name: 'VIP Espace Nord Détente', prom: 'Hervé MVILA', phone: '+242 05 590 12 34', quart: 'Zone Résidentielle Nord', act: 'A1.2', reg: 'FORMEL', surf: 140, stat: 'attestation_depot', coord: [-4.7265, 11.8860] },
    { name: 'Discothèque Club La Nuit Loandjili', prom: 'Brice MOUELE', phone: '+242 06 919 44 22', quart: 'Songolo', act: 'A1.1', reg: 'FORMEL', surf: 220, stat: 'fermeture_administrative', coord: [-4.7280, 11.8805] },
    { name: 'Snack Bar La Douceur', prom: 'Agnès KIBA', phone: '+242 06 617 88 00', quart: 'Loandjili Centre', act: 'A2.1', reg: 'INFORMEL', surf: 55, stat: 'identifie', coord: [-4.7360, 11.8865] },
    { name: 'Bar Dansant Siafoumou Express', prom: 'Jérôme BIKOUMOU', phone: '+242 05 533 77 11', quart: 'Siafoumou', act: 'A1.3', reg: 'INFORMEL', surf: 95, stat: 'identifie', coord: [-4.7310, 11.8930] },
    { name: 'Complexe Familial Les Étoiles', prom: 'Suzanne TCHIBINDA', phone: '+242 06 844 11 99', quart: 'Zone Résidentielle Nord', act: 'A3.2', reg: 'FORMEL', surf: 350, stat: 'en_instruction', coord: [-4.7240, 11.8885] },
    { name: 'Terrasse Chez Maman Chantal', prom: 'Chantal LOUBANGOU', phone: '+242 06 651 90 22', quart: 'Faubourg', act: 'A2.2', reg: 'INFORMEL', surf: 85, stat: 'convoque', coord: [-4.7455, 11.8850] },

    // Arrondissement 5 - Mongo-Mpoukou (Growing peri-urban, craft & crossroads)
    { name: 'Complexe Récréatif Vindoulou Eden', prom: 'Maxime MOUZITA', phone: '+242 06 625 77 33', quart: 'Vindoulou', act: 'A3.2', reg: 'FORMEL', surf: 490, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-071', coord: [-4.7490, 11.9360] },
    { name: 'Discothèque Le Safari Mongo-Mpoukou', prom: 'Bertrand MOUNDANGA', phone: '+242 06 930 11 55', quart: 'Mongo-Mpoukou Centre', act: 'A1.1', reg: 'FORMEL', surf: 260, stat: 'transmis_brazzaville', coord: [-4.7515, 11.9310] },
    { name: 'Bar Dancing Carrefour Rocade Est', prom: 'Clotilde NZIENGUI', phone: '+242 05 522 66 80', quart: 'Rocade Est', act: 'A1.3', reg: 'INFORMEL', surf: 125, stat: 'attestation_depot', coord: [-4.7550, 11.9380] },
    { name: 'Snack Bar Ngoyo-Rails Express', prom: 'Florent KOUBEMBA', phone: '+242 06 688 22 99', quart: 'Ngoyo-Rails', act: 'A2.1', reg: 'INFORMEL', surf: 70, stat: 'identifie', coord: [-4.7600, 11.9280] },
    { name: 'Terrasse Espace Koufoli', prom: 'Martine NGOUBILI', phone: '+242 05 581 44 22', quart: 'Koufoli', act: 'A2.2', reg: 'FORMEL', surf: 190, stat: 'en_instruction', coord: [-4.7460, 11.9400] },
    { name: 'VIP Club Salon Des Nobles', prom: 'Anatole MAYINGA', phone: '+242 06 812 99 44', quart: 'Mongo-Mpoukou Centre', act: 'A1.2', reg: 'FORMEL', surf: 150, stat: 'attestation_depot', coord: [-4.7530, 11.9330] },
    { name: 'Bar Dansant Chez Vieux Bob', prom: 'Robert MILONGO', phone: '+242 06 601 44 88', quart: 'Zone Artisanale', act: 'A1.3', reg: 'INFORMEL', surf: 110, stat: 'mise_en_demeure', coord: [-4.7570, 11.9350] },
    { name: 'Snack-Bar Le Bon Coin de Vindoulou', prom: 'Geneviève PEMBE', phone: '+242 05 540 77 12', quart: 'Vindoulou', act: 'A2.1', reg: 'INFORMEL', surf: 65, stat: 'convoque', coord: [-4.7505, 11.9375] },
    { name: 'Centre Culturel Polyvalent Koufoli', prom: 'Fondation Loisirs Est', phone: '+242 06 911 33 77', quart: 'Koufoli', act: 'A4.1', reg: 'FORMEL', surf: 340, stat: 'autorise_dgl', dgl: 'AGR-DGL-2024-082', coord: [-4.7445, 11.9420] },
    { name: 'Bowling & Billard Vindoulou', prom: 'Serge MALONGO', phone: '+242 06 634 55 11', quart: 'Vindoulou', act: 'A3.1', reg: 'FORMEL', surf: 380, stat: 'attestation_depot', coord: [-4.7475, 11.9345] },
    { name: 'Terrasse Bar Rocade Plein Ciel', prom: 'Pauline BOUANGA', phone: '+242 05 577 12 90', quart: 'Rocade Est', act: 'A2.2', reg: 'INFORMEL', surf: 140, stat: 'identifie', coord: [-4.7565, 11.9395] },
    { name: 'Bar Dancing La Colombe', prom: 'Joseph KIBANGOU', phone: '+242 06 877 88 22', quart: 'Zone Artisanale', act: 'A1.3', reg: 'INFORMEL', surf: 95, stat: 'convoque', coord: [-4.7585, 11.9335] },
    { name: 'Snack Bar Ngoyo-Rails Soir', prom: 'Véronique TSATY', phone: '+242 06 690 11 66', quart: 'Ngoyo-Rails', act: 'A2.1', reg: 'INFORMEL', surf: 60, stat: 'identifie', coord: [-4.7615, 11.9265] },
    { name: 'Discothèque Club La Boussole', prom: 'Roger GOMAT', phone: '+242 05 519 88 44', quart: 'Mongo-Mpoukou Centre', act: 'A1.1', reg: 'FORMEL', surf: 200, stat: 'en_instruction', coord: [-4.7500, 11.9300] },
    { name: 'VIP Lounge Vindoulou Élégance', prom: 'Judith MBONGO', phone: '+242 06 944 66 11', quart: 'Vindoulou', act: 'A1.2', reg: 'FORMEL', surf: 135, stat: 'transmis_brazzaville', coord: [-4.7485, 11.9385] },
    { name: 'Bar Chez Mère Nicole', prom: 'Nicole MPOUNGA', phone: '+242 06 618 33 00', quart: 'Koufoli', act: 'A2.1', reg: 'INFORMEL', surf: 50, stat: 'fermeture_administrative', coord: [-4.7430, 11.9440] },
    { name: 'Terrasse Espace Fraternité', prom: 'Théodore BANDOULA', phone: '+242 05 533 45 78', quart: 'Mongo-Mpoukou Centre', act: 'A2.2', reg: 'INFORMEL', surf: 115, stat: 'attestation_depot', coord: [-4.7525, 11.9340] },
    { name: 'Complexe Loisirs Enfants Vindoulou', prom: 'Colette MATOKO', phone: '+242 06 820 44 11', quart: 'Vindoulou', act: 'A3.2', reg: 'FORMEL', surf: 300, stat: 'en_instruction', coord: [-4.7510, 11.9355] },
    { name: 'Bar Dancing L\'Escapade', prom: 'Zacharie TSONDE', phone: '+242 06 670 99 22', quart: 'Rocade Est', act: 'A1.3', reg: 'INFORMEL', surf: 100, stat: 'identifie', coord: [-4.7540, 11.9410] },

    // Arrondissement 6 - Ngoyo (Industrial corridor, airport, Plage Ngoyo, Mpaka)
    { name: 'Complexe Balnéaire Plage Ngoyo Beach', prom: 'Félicien TCHIBINDA', phone: '+242 06 610 22 99', quart: 'Plage Ngoyo', act: 'A3.2', reg: 'FORMEL', surf: 750, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-011', coord: [-4.8450, 11.9050] },
    { name: 'Discothèque Tropicana Mpaka', prom: 'Honoré GOUAMBA', phone: '+242 06 912 88 44', quart: 'Mpaka', act: 'A1.1', reg: 'FORMEL', surf: 270, stat: 'transmis_brazzaville', coord: [-4.8250, 11.9160] },
    { name: 'VIP Lounge Aérogare Ngoyo', prom: 'Clarisse MOUZITA', phone: '+242 05 530 11 22', quart: 'Zone Aéroportuaire', act: 'A1.2', reg: 'FORMEL', surf: 170, stat: 'attestation_depot', coord: [-4.8180, 11.9210] },
    { name: 'Snack-Bar Coraf Pétrole Ambiance', prom: 'Guillaume MASSENGO', phone: '+242 06 677 44 12', quart: 'Coraf / Djeno Carrefour', act: 'A2.1', reg: 'INFORMEL', surf: 85, stat: 'en_instruction', coord: [-4.8380, 11.9180] },
    { name: 'Bar Dancing Matombi Village', prom: 'Béatrice BIKOUTA', phone: '+242 05 566 99 00', quart: 'Matombi', act: 'A1.3', reg: 'INFORMEL', surf: 140, stat: 'convoque', coord: [-4.8490, 11.9250] },
    { name: 'Terrasse Plage du Sud', prom: 'Christian NGANGA', phone: '+242 06 890 12 34', quart: 'Plage Ngoyo', act: 'A2.2', reg: 'FORMEL', surf: 320, stat: 'autorise_dgl', dgl: 'AGR-DGL-2025-095', coord: [-4.8410, 11.9080] },
    { name: 'Bowling & Sports Bar Mpaka', prom: 'Jean-Paul KOUKA', phone: '+242 06 615 33 77', quart: 'Mpaka', act: 'A3.1', reg: 'FORMEL', surf: 440, stat: 'attestation_depot', coord: [-4.8280, 11.9140] },
    { name: 'Bar Chez Papa Clément Ngoyo', prom: 'Clément LOUVOUEZO', phone: '+242 05 512 34 56', quart: 'Ngoyo Centre', act: 'A1.3', reg: 'INFORMEL', surf: 110, stat: 'mise_en_demeure', coord: [-4.8320, 11.9110] },
    { name: 'Snack Bar L\'Aviation', prom: 'Danielle MAKOSSO', phone: '+242 06 940 55 12', quart: 'Zone Aéroportuaire', act: 'A2.1', reg: 'INFORMEL', surf: 70, stat: 'identifie', coord: [-4.8195, 11.9190] },
    { name: 'Salle Événements Plage Dorée', prom: 'Société Loisirs Littoral', phone: '+242 06 652 88 00', quart: 'Plage Ngoyo', act: 'A4.1', reg: 'FORMEL', surf: 410, stat: 'transmis_brazzaville', coord: [-4.8430, 11.9065] },
    { name: 'Bar Dancing Le Djeno Carrefour', prom: 'Gaston BASSISSA', phone: '+242 05 588 77 33', quart: 'Coraf / Djeno Carrefour', act: 'A1.3', reg: 'INFORMEL', surf: 115, stat: 'convoque', coord: [-4.8365, 11.9195] },
    { name: 'Terrasse Bar Mpaka Détente', prom: 'Rachel MAVOUNGOU', phone: '+242 06 833 11 88', quart: 'Mpaka', act: 'A2.2', reg: 'INFORMEL', surf: 130, stat: 'identifie', coord: [-4.8265, 11.9175] },
    { name: 'Snack Bar Le Matombi Calme', prom: 'Sébastien LOUNDOU', phone: '+242 06 601 77 22', quart: 'Matombi', act: 'A2.1', reg: 'INFORMEL', surf: 65, stat: 'identifie', coord: [-4.8470, 11.9230] },
    { name: 'Discothèque Le Cristal Ngoyo', prom: 'Victorine MPOUO', phone: '+242 05 540 22 99', quart: 'Ngoyo Centre', act: 'A1.1', reg: 'FORMEL', surf: 250, stat: 'autorise_dgl', dgl: 'AGR-DGL-2024-061', coord: [-4.8305, 11.9135] },
    { name: 'VIP Club Le Coraf VIP', prom: 'Martial NGOULOU', phone: '+242 06 918 33 44', quart: 'Coraf / Djeno Carrefour', act: 'A1.2', reg: 'FORMEL', surf: 160, stat: 'attestation_depot', coord: [-4.8350, 11.9210] },
    { name: 'Bar Dancing Le Balcon de Ngoyo', prom: 'Philomène NZABA', phone: '+242 06 644 88 55', quart: 'Ngoyo Centre', act: 'A1.3', reg: 'INFORMEL', surf: 105, stat: 'fermeture_administrative', coord: [-4.8335, 11.9100] },
    { name: 'Snack Bar Chez Maman Solange', prom: 'Solange BISSILA', phone: '+242 05 570 11 44', quart: 'Mpaka', act: 'A2.1', reg: 'INFORMEL', surf: 60, stat: 'identifie', coord: [-4.8290, 11.9125] },
    { name: 'Complexe Touristique Les Vagues Bleues', prom: 'Edgar MALONGA', phone: '+242 06 870 44 00', quart: 'Plage Ngoyo', act: 'A3.2', reg: 'FORMEL', surf: 510, stat: 'en_instruction', coord: [-4.8400, 11.9095] },
    { name: 'Terrasse Bar Matombi Night', prom: 'Hélène SITA', phone: '+242 06 622 99 77', quart: 'Matombi', act: 'A2.2', reg: 'INFORMEL', surf: 95, stat: 'convoque', coord: [-4.8510, 11.9270] },
    { name: 'Bar Dansant L\'Éscale Aéroport', prom: 'Thierry MAMBI', phone: '+242 05 531 88 66', quart: 'Zone Aéroportuaire', act: 'A1.3', reg: 'INFORMEL', surf: 120, stat: 'identifie', coord: [-4.8205, 11.9225] }
  ];

  // Map and generate full 118 items
  rawEstablishmentData.forEach((item, index) => {
    const arrCode: ArrondissementCode =
      index < 20 ? '1_LUMUMBA' :
      index < 39 ? '2_MVOUMVOU' :
      index < 59 ? '3_TIETIE' :
      index < 78 ? '4_LOANDJILI' :
      index < 97 ? '5_MONGO_MPOUKOU' : '6_NGOYO';

    const regime = item.reg as RegimeType;
    const { filingFee, ratePerSqm, totalDue } = calculateEstablishmentFee(item.act, item.surf, regime);

    // Realistic payment calculations according to status
    let amountPaid = 0;
    const stat = item.stat as EstablishmentStatus;
    if (stat === 'autorise_dgl' || stat === 'transmis_brazzaville') {
      amountPaid = totalDue;
    } else if (stat === 'attestation_depot') {
      // 50% to 75% paid
      amountPaid = Math.round(totalDue * 0.6);
    } else if (stat === 'en_instruction') {
      // filing fee or 1st installment
      amountPaid = filingFee;
    } else {
      amountPaid = 0;
    }

    const agents = ['Agent SAA Loubaki (Badge N° 08)', 'Agent SAA Tchicaya (Badge N° 05)', 'Agent SAA Makosso (Badge N° 12)'];
    const assignedAgent = agents[index % agents.length];

    establishments.push({
      id: `EST-PN-${String(index + 1).padStart(3, '0')}`,
      name: item.name,
      promoter_name: item.prom,
      phone: item.phone,
      arrondissement: arrCode,
      quartier: item.quart,
      address: `${item.quart}, Rue des Palmiers N° ${20 + (index * 3) % 150}`,
      activity_type: ACTIVITY_CATEGORIES.find(c => c.code === item.act)?.label || 'Débit de Boissons',
      activity_code: item.act,
      regime_type: regime,
      rccm: regime === 'FORMEL' ? `CG-PN-2022-B-${1000 + index * 17}` : undefined,
      surface_m2: item.surf,
      filing_fee: filingFee,
      rate_per_sqm: ratePerSqm,
      total_due: totalDue,
      amount_paid: amountPaid,
      balance_due: totalDue - amountPaid,
      status: stat,
      identified_by: assignedAgent,
      identified_date: `2026-0${1 + (index % 8)}-${10 + (index % 18)}`,
      last_inspection_date: `2026-08-${10 + (index % 19)}`,
      has_acoustic_limiter: item.act.startsWith('A1') ? (index % 2 === 0) : undefined,
      decibel_level: item.act.startsWith('A1') ? 78 + (index % 18) : undefined,
      coordinates: [item.coord[0], item.coord[1]],
      notes: `Recensé dans le cadre du PTA 2026. Contrôle brigade SAA Pointe-Noire.`,
      dgl_transmission_batch: stat === 'transmis_brazzaville' ? 'BORD-DGL-PN-2026-03' : undefined,
      dgl_transmission_date: stat === 'transmis_brazzaville' ? '2026-08-20' : undefined,
      dgl_approval_ref: item.dgl,
      installments_chosen: 2,
      created_at: `2026-02-15T08:00:00Z`,
      updated_at: `2026-09-15T12:00:00Z`
    });
  });

  return establishments;
}

// Generate seed payment records
function generateSeedPayments(establishments: Establishment[]): TerrainPaymentRecord[] {
  const records: TerrainPaymentRecord[] = [];
  let receiptCounter = 1001;

  establishments.forEach(est => {
    if (est.amount_paid > 0) {
      records.push({
        id: `REC-${est.id}-01`,
        establishment_id: est.id,
        establishment_name: est.name,
        promoter_name: est.promoter_name,
        arrondissement: est.arrondissement,
        amount_paid: est.amount_paid,
        total_fee: est.total_due,
        balance_remaining: est.balance_due,
        installment_number: 1,
        payment_method: est.regime_type === 'FORMEL' ? 'Virement Trésor Public' : 'MTN Mobile Money',
        transaction_ref: `MTN-CG-${894000 + receiptCounter}`,
        receipt_reference: `REC-DDL-PN-2026-${receiptCounter++}`,
        next_due_date: est.balance_due > 0 ? '2026-10-31' : undefined,
        record_date: est.last_inspection_date || '2026-08-15',
        collected_by: est.identified_by,
        agent_badge: est.identified_by.includes('08') ? 'SAA-PN-008' : (est.identified_by.includes('05') ? 'SAA-PN-005' : 'SAA-PN-012'),
        notes: `Acompte régularisation redevance loisirs PTA 2026.`
      });
    }
  });

  return records;
}

// Generate seed official acts
function generateSeedActs(): OfficialLegalAct[] {
  return [
    {
      id: 'ACT-2026-001',
      type: 'MISE_EN_DEMEURE',
      reference_number: 'MD-088/MCAPNIT/DGL/DDL-PN-2026',
      establishment_id: 'EST-PN-010',
      establishment_name: 'Terrasse OCH Lounge',
      promoter_name: 'Sylvie MAVOUNGOU',
      arrondissement: 'Arrondissement 1 Lumumba',
      address: 'Zone Industrielle OCH, Avenue des Pionniers',
      date_emission: '2026-09-20',
      delai_huitaine_date: '2026-09-27',
      motif: 'Exploitation sans agrément d’ouverture et émission de nuisances sonores constatées de nuit (92 dB mesurés par sonomètre SAA).',
      signataire_nom: 'Jacques Alphonse MATOKO',
      signataire_titre: 'Directeur Départemental des Loisirs de Pointe-Noire',
      agent_notificateur: 'Agent SAA Loubaki (Badge N° 08)',
      visa_lois: [
        'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des activités de loisirs',
        'Décret N° 2021-412 du 28 octobre 2021 portant organisation de la DGL',
        'Arrêté Départemental N° 018/DDL-PN-2026 sur les seuils acoustiques nocturnes'
      ]
    },
    {
      id: 'ACT-2026-002',
      type: 'CONVOCATION',
      reference_number: 'CONV-142/DDL-PN/SAA-2026',
      establishment_id: 'EST-PN-009',
      establishment_name: 'Le Refuge de KM 4',
      promoter_name: 'Bruno BOUANGA',
      arrondissement: 'Arrondissement 1 Lumumba',
      address: 'KM 4, Route de l\'Aéroport',
      date_emission: '2026-09-22',
      delai_huitaine_date: '2026-09-29',
      motif: 'Comparution contradictoire au bureau de la Brigade SAA pour régularisation de la fiche contradictoire et versement des frais de dossier.',
      signataire_nom: 'Chef Brigade SAA',
      signataire_titre: 'Chef de Brigade du Service Agrément et Assainissement',
      agent_notificateur: 'Agent SAA Tchicaya (Badge N° 05)',
      visa_lois: [
        'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs',
        'Instruction Générale DGL N° 004/2026 relative à la formalisation du secteur informel'
      ]
    },
    {
      id: 'ACT-2026-003',
      type: 'ARRETE_FERMETURE',
      reference_number: 'ARR-FERM-014/DDL-PN-2026',
      establishment_id: 'EST-PN-018',
      establishment_name: 'Snack Bar L\'Étoile Noire',
      promoter_name: 'Chantal LOUBAKI',
      arrondissement: 'Arrondissement 1 Lumumba',
      address: 'KM 4, Face Station X',
      date_emission: '2026-09-18',
      delai_huitaine_date: 'Exécution immédiate',
      motif: 'Récidive de tapage nocturne avéré, absence totale de dossier d’agrément après expiration du délai de mise en demeure N° 072.',
      signataire_nom: 'Jacques Alphonse MATOKO',
      signataire_titre: 'Directeur Départemental des Loisirs de Pointe-Noire',
      agent_notificateur: 'Brigade Conjointe SAA & Force Publique',
      visa_lois: [
        'Loi N° 21-2019 du 12 juillet 2019, article 27',
        'Décret N° 2021-412 du 28 octobre 2021, article 9',
        'Procès-verbal de constatation d’infraction N° 039/SAA/2026'
      ]
    }
  ];
}

// Generate seed SPA subscriptions
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
        'Relais bi-mensuel des événements sur la page officielle Facebook & WhatsApp',
        'Mention d’honneur au Journal Officiel des Loisirs (Flux RSS)',
        'Accompagnement acoustique annuel gratuit par la brigade SAA'
      ]
    },
    {
      id: 'SUB-2026-002',
      establishment_id: 'EST-PN-003',
      establishment_name: 'La Brise de l\'Atlantique Bar-Plage',
      plan: 'SILVER',
      monthly_fee_fcfa: 50000,
      start_date: '2026-02-01',
      end_date: '2026-12-31',
      status: 'ACTIF',
      benefits: [
        'Inclusion au Catalogue officiel des Loisirs Éco-Responsables',
        'Relais mensuel sur les canaux d’information municipaux',
        'Support signalétique "Établissement Recommandé DDL-PN"'
      ]
    },
    {
      id: 'SUB-2026-003',
      establishment_id: 'EST-PN-020',
      establishment_name: 'Le Temple de la Rumba',
      plan: 'BRONZE',
      monthly_fee_fcfa: 25000,
      start_date: '2026-03-01',
      end_date: '2026-12-31',
      status: 'ACTIF',
      benefits: [
        'Référencement au Répertoire Départemental du Tourisme & des Loisirs',
        'Kit de sensibilisation aux gestes barrières et prévention sonore'
      ]
    }
  ];
}

// Generate seed SPA Diplômes d'Honneur
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
      reasons: [
        'Respect exemplaire des normes acoustiques (<80 dB) certifié par la Brigade SAA',
        'Installation d’un sas phonique et isolation phonique intégrale',
        'Participation active aux campagnes de salubrité de la Côte Sauvage'
      ]
    },
    {
      id: 'DIP-2026-002',
      establishment_id: 'EST-PN-014',
      establishment_name: 'Centre Culturel Jean-Baptiste Tati',
      promoter_name: 'Direction Association Arts',
      arrondissement: 'Arrondissement 1 Patrice Émery Lumumba',
      label: 'Grand Prix Départemental de la Culture et des Loisirs Récréatifs',
      award_date: '2026-08-15',
      reference_number: 'DIP-HONNEUR-DDLPN-2026-002',
      reasons: [
        'Diffusion du patrimoine culturel et artistique congolais',
        'Ateliers d’éveil théâtral et musical pour la jeunesse de Pointe-Noire'
      ]
    }
  ];
}

// Generate seed Tournée events for Agent Google Calendar
function generateSeedTourneeEvents(establishments: Establishment[]): AgentTourneeEvent[] {
  const events: AgentTourneeEvent[] = [];
  const now = new Date();
  const todayStr = '2026-09-29';

  const sampleTournees = [
    {
      estIndex: 0,
      agentBadge: 'SAA-PN-008',
      agentName: 'Agent SAA Loubaki',
      date: '2026-09-29',
      timeStart: '08:30',
      timeEnd: '10:00',
      type: 'CONTROLE_ACOUSTIQUE' as const,
      status: 'EFFECTUE' as const,
      priority: 'HAUTE' as const,
      notes: 'Contrôle du limiteur sonore scellé. Relevé acoustique : 79 dB (conforme).',
      decibel: 79
    },
    {
      estIndex: 9,
      agentBadge: 'SAA-PN-008',
      agentName: 'Agent SAA Loubaki',
      date: '2026-09-29',
      timeStart: '10:30',
      timeEnd: '11:45',
      type: 'NOTIFICATION_MISE_EN_DEMEURE' as const,
      status: 'EN_COURS' as const,
      priority: 'URGENTE' as const,
      notes: 'Remise en mains propres de la mise en demeure N° MD-088 (délai 72h).',
      amountDue: 242000
    },
    {
      estIndex: 21,
      agentBadge: 'SAA-PN-008',
      agentName: 'Agent SAA Loubaki',
      date: '2026-09-29',
      timeStart: '13:00',
      timeEnd: '14:30',
      type: 'ENCAISSEMENT_ACOMPTE' as const,
      status: 'A_FAIRE' as const,
      priority: 'NORMALE' as const,
      notes: 'Perception du 2ème acompte prévu par MTN Mobile Money. Délivrance ticket 58mm.',
      amountDue: 45000
    },
    {
      estIndex: 38,
      agentBadge: 'SAA-PN-008',
      agentName: 'Agent SAA Loubaki',
      date: '2026-09-29',
      timeStart: '15:00',
      timeEnd: '16:30',
      type: 'CONVOCATION' as const,
      status: 'A_FAIRE' as const,
      priority: 'HAUTE' as const,
      notes: 'Convocation contradictoire au bureau de brigade suite à défaut de déclaration.',
      amountDue: 140000
    },
    {
      estIndex: 5,
      agentBadge: 'SAA-PN-005',
      agentName: 'Agent SAA Tchicaya',
      date: '2026-09-29',
      timeStart: '09:00',
      timeEnd: '10:30',
      type: 'RECENSEMENT_IN_SITU' as const,
      status: 'EFFECTUE' as const,
      priority: 'NORMALE' as const,
      notes: 'Mesure de superficie au décamètre et fiche contradictoire établie.',
      amountDue: 90000
    },
    {
      estIndex: 8,
      agentBadge: 'SAA-PN-005',
      agentName: 'Agent SAA Tchicaya',
      date: '2026-09-29',
      timeStart: '11:00',
      timeEnd: '12:30',
      type: 'CONVOCATION' as const,
      status: 'A_FAIRE' as const,
      priority: 'URGENTE' as const,
      notes: 'Remise convocation contradictoire N° CONV-142.',
      amountDue: 78000
    },
    {
      estIndex: 43,
      agentBadge: 'SAA-PN-012',
      agentName: 'Agent SAA Makosso',
      date: '2026-09-29',
      timeStart: '10:00',
      timeEnd: '11:30',
      type: 'CONTROLE_ACOUSTIQUE' as const,
      status: 'A_FAIRE' as const,
      priority: 'HAUTE' as const,
      notes: 'Plaintes récurrentes du voisinage pour tapage nocturne. Mesure inopinée.',
      decibel: 88
    },
    {
      estIndex: 1,
      agentBadge: 'SAA-PN-008',
      agentName: 'Agent SAA Loubaki',
      date: '2026-09-30',
      timeStart: '09:00',
      timeEnd: '11:00',
      type: 'CONTROLE_ACOUSTIQUE' as const,
      status: 'A_FAIRE' as const,
      priority: 'HAUTE' as const,
      notes: 'Vérification conformité acoustique et enregistreur de décibels.'
    },
    {
      estIndex: 2,
      agentBadge: 'SAA-PN-008',
      agentName: 'Agent SAA Loubaki',
      date: '2026-09-30',
      timeStart: '14:00',
      timeEnd: '15:30',
      type: 'ENCAISSEMENT_ACOMPTE' as const,
      status: 'A_FAIRE' as const,
      priority: 'NORMALE' as const,
      notes: 'Régularisation tranche finale et transmission Brazzaville.',
      amountDue: 180000
    },
    {
      estIndex: 17,
      agentBadge: 'SAA-PN-001',
      agentName: 'Chef Brigade SAA',
      date: '2026-10-01',
      timeStart: '10:00',
      timeEnd: '11:30',
      type: 'NOTIFICATION_MISE_EN_DEMEURE' as const,
      status: 'A_FAIRE' as const,
      priority: 'URGENTE' as const,
      notes: 'Constat de fermeture administrative et apposition des scellés.'
    }
  ];

  sampleTournees.forEach((st, idx) => {
    const est = establishments[st.estIndex] || establishments[0];
    events.push({
      id: `EVT-TOUR-2026-${String(idx + 1).padStart(3, '0')}`,
      agentId: st.agentBadge,
      agentName: st.agentName,
      agentBadge: st.agentBadge,
      establishmentId: est.id,
      establishmentName: est.name,
      promoterName: est.promoter_name,
      phone: est.phone,
      arrondissement: est.arrondissement,
      quartier: est.quartier,
      address: est.address,
      date: st.date,
      timeStart: st.timeStart,
      timeEnd: st.timeEnd,
      type: st.type,
      status: st.status,
      priority: st.priority,
      amountDue: st.amountDue || est.balance_due,
      decibelMeasure: st.decibel || est.decibel_level,
      notes: st.notes,
      isSynced: true,
      createdAt: '2026-09-20T08:00:00Z',
      updatedAt: '2026-09-29T08:00:00Z'
    });
  });

  // Annual renewal events N+1 for fully paid establishments (Business Rule test cases)
  const paidEsts = establishments.filter(e => e.status === 'autorise_dgl' || e.balance_due === 0).slice(0, 5);
  paidEsts.forEach((pe, pIdx) => {
    // First installment date was in early 2026 (e.g. 2026-02-15, 2026-03-10, etc.)
    const firstDate = pe.identified_date || '2026-03-15';
    const [y, m, d] = firstDate.split('-');
    const renewalYear = parseInt(y, 10) + 1;
    const renewalDate = `${renewalYear}-${m}-${d}`;

    pe.first_payment_date = firstDate;
    pe.annual_renewal_date = renewalDate;

    events.push({
      id: `EVT-RENEW-N1-${String(pIdx + 1).padStart(3, '0')}`,
      agentId: pe.identified_by.includes('08') ? 'SAA-PN-008' : (pe.identified_by.includes('05') ? 'SAA-PN-005' : 'SAA-PN-012'),
      agentName: pe.identified_by,
      agentBadge: pe.identified_by.includes('08') ? 'SAA-PN-008' : (pe.identified_by.includes('05') ? 'SAA-PN-005' : 'SAA-PN-012'),
      establishmentId: pe.id,
      establishmentName: pe.name,
      promoterName: pe.promoter_name,
      phone: pe.phone,
      arrondissement: pe.arrondissement,
      quartier: pe.quartier,
      address: pe.address,
      date: renewalDate,
      timeStart: '09:00',
      timeEnd: '10:30',
      type: 'RENOUVELLEMENT_ANNUEL',
      status: 'A_FAIRE',
      priority: 'NORMALE',
      amountDue: pe.total_due,
      notes: `Échéance annuelle N+1 fixée au jour du premier acompte (${firstDate}) suite au paiement intégral des redevances d'exploitation.`,
      isSynced: true,
      createdAt: '2026-08-01T08:00:00Z',
      updatedAt: '2026-09-29T08:00:00Z'
    });
  });

  return events;
}

// Storage Service Singleton
class StorageService {
  private establishments: Establishment[] = [];
  private payments: TerrainPaymentRecord[] = [];
  private acts: OfficialLegalAct[] = [];
  private subscriptions: SpaMerchantSubscription[] = [];
  private diplomas: SpaHonorDiploma[] = [];
  private tourneeEvents: AgentTourneeEvent[] = [];
  private offlineQueue: Array<{ action: string; payload: unknown; timestamp: string }> = [];
  private isOnline = true;
  private supabaseUrl = DEFAULT_SUPABASE_URL;

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      this.isOnline = navigator.onLine;
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

    // Load or seed establishments
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

    // Load or seed payments
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

    // Load or seed legal acts
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

    // Load or seed subscriptions
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

    // Load or seed diplomas
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

    // Load or seed tournee events
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

    // Load offline queue
    const storedQueue = localStorage.getItem(LOCAL_STORAGE_KEYS.OFFLINE_QUEUE);
    if (storedQueue) {
      try {
        this.offlineQueue = JSON.parse(storedQueue);
      } catch {
        this.offlineQueue = [];
      }
    }

    // Supabase URL
    const savedUrl = localStorage.getItem(LOCAL_STORAGE_KEYS.SUPABASE_URL);
    if (savedUrl) {
      this.supabaseUrl = savedUrl;
    }
  }

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

  public flushOfflineQueue() {
    if (this.offlineQueue.length === 0) return;
    console.log(`[DDL-PN Sync] Flushing ${this.offlineQueue.length} offline actions to Supabase: ${this.supabaseUrl}`);
    // Simulate instantaneous sync to central database
    this.offlineQueue = [];
    this.saveQueue();
  }

  // --- Establishments CRUD ---
  public getEstablishments(): Establishment[] {
    return [...this.establishments];
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
    this.enqueueOfflineAction('CREATE_ESTABLISHMENT', newEstablishment);
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
    this.enqueueOfflineAction('UPDATE_ESTABLISHMENT', { id, updates });
    return updated;
  }

  public deleteEstablishment(id: string): boolean {
    const initialLen = this.establishments.length;
    this.establishments = this.establishments.filter(e => e.id !== id);
    if (this.establishments.length !== initialLen) {
      this.saveEstablishments();
      this.enqueueOfflineAction('DELETE_ESTABLISHMENT', { id });
      return true;
    }
    return false;
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

    // Track first installment date (first time any money was paid)
    const firstPaymentDate = est.first_payment_date || (est.amount_paid > 0 ? (est.identified_date || todayStr) : todayStr);

    // Business Rule: "si un tenancier paie la totalité le renouvelement de paiement des frais d'exploitation se fera le jours ou il a donner son premier acompte mais l'année suivante."
    let annualRenewalDate: string | undefined = est.annual_renewal_date;
    let scheduledRenewalEvent: AgentTourneeEvent | undefined = undefined;

    if (newBalance === 0) {
      const [y, m, d] = firstPaymentDate.split('-');
      const renewalYear = parseInt(y, 10) + 1;
      annualRenewalDate = `${renewalYear}-${m}-${d}`;
    }

    // Update status if fully paid or first installment
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
    this.enqueueOfflineAction('RECORD_PAYMENT', newPayment);

    // If fully paid, automatically schedule the annual renewal milestone in the agent's Google Calendar!
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

  // --- Agent Google Calendar Tournées Operations ---
  public getAgentEvents(agentId?: string): AgentTourneeEvent[] {
    if (!agentId || agentId === 'ALL' || agentId === 'DIR-01' || agentId === 'SAA-CHEF') {
      return [...this.tourneeEvents];
    }
    return this.tourneeEvents.filter(
      e => e.agentId === agentId || e.agentBadge === agentId || e.agentName.includes(agentId)
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
    this.enqueueOfflineAction('CREATE_AGENT_EVENT', newEvent);
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
    this.enqueueOfflineAction('UPDATE_AGENT_EVENT', { id, updates });
    return updated;
  }

  public deleteAgentEvent(id: string): boolean {
    const initialLen = this.tourneeEvents.length;
    this.tourneeEvents = this.tourneeEvents.filter(e => e.id !== id);
    if (this.tourneeEvents.length !== initialLen) {
      this.saveTournees();
      this.enqueueOfflineAction('DELETE_AGENT_EVENT', { id });
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

    // 1. Update establishment status
    this.updateEstablishment(est.id, { status: 'convoque' });

    // 2. Issue official Convocation Act
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
      signataire_nom: params.agent.role === 'DIRECTEUR' ? params.agent.name : 'Chef Brigade SAA',
      signataire_titre: params.agent.role === 'DIRECTEUR' ? params.agent.title : 'Chef de Brigade du Service Agrément & Assainissement',
      agent_notificateur: `${params.agent.name} (${params.agent.badge})`,
      visa_lois: [
        'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs',
        'Instruction Générale DGL relative à la police des débits de boissons et terrasses'
      ]
    });

    // 3. Add to agent Google Calendar
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

    // Auto update status on establishment if mise en demeure or fermeture
    if (act.type === 'MISE_EN_DEMEURE') {
      this.updateEstablishment(act.establishment_id, { status: 'mise_en_demeure' });
    } else if (act.type === 'ARRETE_FERMETURE') {
      this.updateEstablishment(act.establishment_id, { status: 'fermeture_administrative' });
    } else if (act.type === 'CONVOCATION') {
      this.updateEstablishment(act.establishment_id, { status: 'convoque' });
    }

    this.enqueueOfflineAction('CREATE_LEGAL_ACT', newAct);
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
    this.enqueueOfflineAction('CREATE_SUBSCRIPTION', newSub);
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
    this.enqueueOfflineAction('CREATE_DIPLOMA', newDip);
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

    // Splits
    const shareTresor = Math.round(totalPaid * (TAXATION_RULES.revenue_split.tresor_public_percent / 100));
    const shareRegie = totalPaid - shareTresor;

    // Arrondissement breakdown
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
  }
}

export const storageService = new StorageService();
