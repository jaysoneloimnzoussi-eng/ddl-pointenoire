import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Award,
  CreditCard,
  Share2,
  Rss,
  Printer,
  Plus,
  CheckCircle,
  Copy,
  Calendar,
  ExternalLink,
  MessageCircle,
  Megaphone,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Building2,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck2,
  HelpCircle,
  Flame,
  Send,
  Sliders,
  DollarSign,
  Eye,
  X
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { SpaMerchantSubscription, SpaHonorDiploma, Establishment } from '../../types';
import { PrintModal } from '../print/PrintModal';
import { OfficialRepublicLogo } from '../common/OfficialSeal';

// Editorial Pillars for DDL-PN Facebook Page
export interface EditorialPillar {
  id: string;
  dayOfWeek: string;
  pillarTitle: string;
  badgeColor: string;
  description: string;
  sampleHook: string;
  recommendedVisual: string;
}

export interface FacebookScheduledPost {
  id: string;
  pillarId: string;
  scheduledDate: string;
  scheduledTime: string;
  targetEstablishment?: string;
  content: string;
  status: 'PROGRAMME' | 'PUBLIE' | 'BROUILLON';
  hashtags: string[];
  estimatedReach: number;
}

export interface AccompanimentRecord {
  id: string;
  establishmentId: string;
  establishmentName: string;
  promoterName: string;
  arrondissement: string;
  stage: 'CANDIDATURE' | 'AUDIT_IN_SITU' | 'PLAN_MISE_AUX_NORMES' | 'LABEL_ATTRIBUE';
  scoreAcoustique: number; // /30
  scoreSecurite: number; // /30
  scoreAccueilEthique: number; // /20
  scoreHygieneConfort: number; // /20
  totalScore: number; // /100
  selectedPlan: 'BRONZE' | 'SILVER' | 'GOLD' | 'AUCUN';
  dateEnrollment: string;
  notes: string;
}

export const SpaPromotionModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();

  const [activeTab, setActiveTab] = useState<
    'FACEBOOK_LIGNE_EDITO' | 'ACCOMPAGNEMENT_ETAB' | 'MODELE_ECO_PACKS' | 'DIPLOME_HONNEUR' | 'FLUX_RSS'
  >('FACEBOOK_LIGNE_EDITO');

  const establishments = storageService.getEstablishments();
  const [diplomas, setDiplomas] = useState<SpaHonorDiploma[]>(() => storageService.getDiplomas());
  const [subscriptions, setSubscriptions] = useState<SpaMerchantSubscription[]>(() => storageService.getSubscriptions());

  // Print modal state
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: 'DIPLOME_HONNEUR_A4';
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'DIPLOME_HONNEUR_A4',
    title: '',
    data: null
  });

  // =========================================================================
  // 1. EDITORIAL PILLARS FOR FACEBOOK
  // =========================================================================
  const EDITORIAL_PILLARS: EditorialPillar[] = [
    {
      id: 'LUNDI_REGULATION',
      dayOfWeek: 'Lundi (09h00)',
      pillarTitle: 'Lundi Réglementation & Police des Loisirs',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      description: 'Pédagogie de la Loi N° 21-2019, seuil des 85 décibels après 22h, lutte contre le tapage nocturne et démarches d’agrément.',
      sampleHook: '⚖️ Connaissez-vous vos droits et devoirs en tant qu\'exploitant de loisirs à Pointe-Noire ?',
      recommendedVisual: 'Infographie officielle DDL-PN ou photo de la brigade SAA en sensibilisation'
    },
    {
      id: 'MERCREDI_FAMILLE',
      dayOfWeek: 'Mercredi (14h00)',
      pillarTitle: 'Mercredi Découverte & Loisirs en Famille',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: 'Mise en avant d’établissements récréatifs sains, parcs de jeux pour enfants, salons de détente sans nuisances et activités de plein air.',
      sampleHook: '👨‍👩‍👧‍👦 Où emmener vos enfants ce mercredi pour un moment récréatif propre et sécurisé ?',
      recommendedVisual: 'Photo du cadre convivial d\'un établissement labellisé DDL-PN'
    },
    {
      id: 'VENDREDI_ACOUSTIQUE',
      dayOfWeek: 'Vendredi (17h00)',
      pillarTitle: 'Vendredi Nuit Saine & Civisme Nocturne',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'Sensibilisation aux tenanciers de débits de boissons, bars-dancing et cabarets sur la modération du volume sonore et le respect du voisinage.',
      sampleHook: '🎶 Faire la fête oui, mais dans le respect du sommeil des riverains !',
      recommendedVisual: 'Visuel officiel du Sonomètre DDL-PN « Moins de 85 dB pour un sommeil préservé »'
    },
    {
      id: 'SAMEDI_AGENDA',
      dayOfWeek: 'Samedi (10h30)',
      pillarTitle: 'Samedi Agenda des Sorties Labellisées DDL-PN',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      description: 'Sélection officielle et certifiée des événements et lieux détente du week-end ayant signé la Charte des Loisirs Sains DDL-PN.',
      sampleHook: '🌟 Votre guide certifié des loisirs pour ce week-end à Pointe-Noire !',
      recommendedVisual: 'Affiche de l\'événement labellisé avec sceau officiel DDL-PN'
    }
  ];

  // Scheduled posts mock stored in state/local
  const [scheduledPosts, setScheduledPosts] = useState<FacebookScheduledPost[]>([
    {
      id: 'POST-01',
      pillarId: 'LUNDI_REGULATION',
      scheduledDate: '2026-10-05',
      scheduledTime: '09:00',
      content: `🏛️ [DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE]\n\n⚖️ FOCUS RÉGLEMENTATION : Pourquoi limiter le niveau sonore après 22h ?\n\nChers exploitants et citoyens de Pointe-Noire, la Loi N° 21-2019 et le Décret N° 2010-804 fixent le seuil maximal à 85 décibels en limite de propriété.\n\nLe respect de cette norme protège la santé publique des riverains tout en garantissant la pérennité de votre exploitation. La brigade du Service Assistance et Autorisation (SAA) accompagne chaque établissement dans l'installation de limiteurs acoustiques agréés.\n\n📍 Pour toute assistance technique : Direction Départementale des Loisirs (Centre-Ville, face Port Autonome).\n\n#DDLPN #PointeNoire #LoisirsSains #ProtectionDesCitoyens #MCAPNIT`,
      status: 'PROGRAMME',
      hashtags: ['#DDLPN', '#PointeNoire', '#LoisirsSains', '#PoliceDesLoisirs'],
      estimatedReach: 4800
    },
    {
      id: 'POST-02',
      pillarId: 'MERCREDI_FAMILLE',
      scheduledDate: '2026-10-07',
      scheduledTime: '14:00',
      targetEstablishment: 'Espace Loisirs Ponton (Mpita)',
      content: `🌟 [COUP DE PROJECTEUR LOISIRS SAINS DDL-PN]\n\n👨‍👩‍👧‍👦 Cette semaine, la DDL-PN met à l'honneur « L'Espace Loisirs Ponton » sis à Mpita (Arrondissement 1 Lumumba) !\n\nCertifié conforme par le Service Promotion et Animation (SPA), cet établissement propose des jeux traditionnels (scrabble, dames, échecs), un cadre paysager sécurisé pour les enfants et une acoustique apaisée.\n\nBravo au promoteur pour son engagement dans la Charte des Loisirs Sains et Éco-Responsables !\n\n🔍 Vérifiez les agréments officiels via notre portail numérique DDL-PN.\n\n#PointeNoire #LoisirsEnFamille #EspacePonton #CongoBrazzaville`,
      status: 'PROGRAMME',
      hashtags: ['#PointeNoire', '#LoisirsEnFamille', '#EspacePonton'],
      estimatedReach: 6200
    },
    {
      id: 'POST-03',
      pillarId: 'VENDREDI_ACOUSTIQUE',
      scheduledDate: '2026-10-02',
      scheduledTime: '17:00',
      content: `🎶 [VENDREDI NOCTURNE & VIVRE-ENSEMBLE]\n\nPointe-Noire vibre au son de ses musiques et de ses terrasses, mais le véritable prestige d'un établissement se mesure à son élégance acoustique !\n\nAvant de monter le son ce soir :\n✅ Vérifiez votre limiteur sonore scellé par le SAA.\n✅ Veillez à orienter les baffles vers l'intérieur de votre salle.\n✅ Offrez à vos clients une ambiance raffinée où la conversation reste possible.\n\nBon week-end récréatif à tous dans le respect du voisinage !\n\n#DDLPN #NuitSaine #PointeNoireByNight #CivismeAcoustique`,
      status: 'PUBLIE',
      hashtags: ['#DDLPN', '#NuitSaine', '#PointeNoireByNight'],
      estimatedReach: 8900
    }
  ]);

  // Post generator state
  const [selectedPillarId, setSelectedPillarId] = useState<string>('MERCREDI_FAMILLE');
  const [selectedEstIdForPost, setSelectedEstIdForPost] = useState<string>(establishments[0]?.id || '');
  const [customPostContent, setCustomPostContent] = useState<string>('');

  // When changing pillar or establishment, auto-suggest realistic Facebook post
  const activePillar = EDITORIAL_PILLARS.find(p => p.id === selectedPillarId) || EDITORIAL_PILLARS[0];
  const targetEst = establishments.find(e => e.id === selectedEstIdForPost) || establishments[0];

  const generatedPostSuggestion = useMemo(() => {
    if (selectedPillarId === 'LUNDI_REGULATION') {
      return `🏛️ [RÉGLEMENTATION OFFICIELLE DDL-PN / MCAPNIT]\n\nExploitants de structures récréatives et débits de boissons de Pointe-Noire :\n\nLa Direction Départementale des Loisirs rappelle que l'exercice légal de toute activité de loisir est conditionné par l'obtention de l'agrément ministériel ou de l'Attestation de Dépôt Provisoire délivrée par nos guichets.\n\nNe vous exposez pas aux sanctions de fermeture administrative (72h) prévues par la Loi N° 21-2019.\n\nNos conseillers du Service Assistance et Autorisation (SAA) vous reçoivent du lundi au vendredi de 08h à 15h pour formaliser votre dossier.\n\n📍 Bureau N° 3, DDL-PN, Centre-Ville.\n#DDLPN #PointeNoire #Loi212019 #AgrementOfficiel #PoliceDesLoisirs`;
    }
    if (selectedPillarId === 'MERCREDI_FAMILLE') {
      return `🌈 [DÉCOUVERTE LOISIRS SAINS DU MERCREDI]\n\nLa Direction Départementale des Loisirs vous fait découvrir aujourd'hui : « ${targetEst?.name || 'Un espace labellisé'} » sis à ${targetEst?.arrondissement || 'Pointe-Noire'}.\n\nReconnu pour son ambiance familiale, son respect des normes d'hygiène et son niveau sonore maîtrisé, cet établissement illustre la vision des loisirs sains portée par Son Excellence Monsieur le Ministre.\n\nFélicitations au promoteur M. ${targetEst?.promoter_name || 'Exploitant'} pour sa labellisation !\n\n#DDLPN #LoisirsSains #PointeNoire #FamilleDord #CongoBrazzaville`;
    }
    if (selectedPillarId === 'VENDREDI_ACOUSTIQUE') {
      return `🔊 [CAMPAGNE CIVISME ACOUSTIQUE DU VENDREDI SOIR]\n\nCe week-end, la brigade du Service Assistance et Autorisation (SAA) sera déployée dans les 6 arrondissements de Pointe-Noire pour accompagner les promoteurs et contrôler les émissions sonores in situ.\n\nObjectif : Protéger le sommeil des enfants, des personnes âgées et des travailleurs sans entraver la vitalité économique de notre ville océane.\n\nChers exploitants, maintenez vos décibels sous les 85 dB et privilégiez les limiteurs acoustiques agréés.\n\n#DDLPN #Sonométrie #PointeNoire #AssainissementAcoustique #Congo`;
    }
    return `🌟 [AGENDA OFFICIEL DU WEEK-END LABELLISÉ DDL-PN]\n\nÀ la recherche de sorties saines et sans débordements ce week-end à Pointe-Noire ?\n\nConsultez notre sélection d'établissements certifiés ayant souscrit à la Charte des Loisirs Responsables :\n• ${targetEst?.name || 'Le Grand Baobab VIP'}\n• Espaces récréatifs de la Côte Sauvage\n• Salons de détente de Mpita et Centre-Ville\n\nExigez la qualité et la sécurité pour vos moments de détente !\n\n#DDLPN #PointeNoireWeekEnd #SortirAPointeNoire #LoisirsSains2026`;
  }, [selectedPillarId, targetEst]);

  // Sync initial post content
  React.useEffect(() => {
    setCustomPostContent(generatedPostSuggestion);
  }, [generatedPostSuggestion]);

  // =========================================================================
  // 2. ACCOMPANIMENT & LABELLING PROGRAM
  // =========================================================================
  const [accompaniments, setAccompaniments] = useState<AccompanimentRecord[]>([
    {
      id: 'ACC-001',
      establishmentId: 'EST-PN-001',
      establishmentName: 'Le Grand Baobab VIP Lounge',
      promoterName: 'Christian BITEMO',
      arrondissement: '1_LUMUMBA',
      stage: 'LABEL_ATTRIBUE',
      scoreAcoustique: 28,
      scoreSecurite: 27,
      scoreAccueilEthique: 19,
      scoreHygieneConfort: 18,
      totalScore: 92,
      selectedPlan: 'GOLD',
      dateEnrollment: '2026-03-10',
      notes: 'Limiteur acoustique calibré, extincteurs vérifiés, charte des loisirs sains signée et affichée en vitrine.'
    },
    {
      id: 'ACC-002',
      establishmentId: 'EST-PN-002',
      establishmentName: 'Club 77 Discothèque',
      promoterName: 'Jean-Pierre TCHICAYA',
      arrondissement: '1_LUMUMBA',
      stage: 'PLAN_MISE_AUX_NORMES',
      scoreAcoustique: 22,
      scoreSecurite: 26,
      scoreAccueilEthique: 17,
      scoreHygieneConfort: 16,
      totalScore: 81,
      selectedPlan: 'SILVER',
      dateEnrollment: '2026-06-15',
      notes: 'Double vitrage acoustique posé. En attente de l\'installation du caisson de basses découplé.'
    },
    {
      id: 'ACC-003',
      establishmentId: 'EST-PN-003',
      establishmentName: 'La Brise de l\'Atlantique Bar-Plage',
      promoterName: 'Solange MOUNTOU',
      arrondissement: '1_LUMUMBA',
      stage: 'AUDIT_IN_SITU',
      scoreAcoustique: 19,
      scoreSecurite: 21,
      scoreAccueilEthique: 18,
      scoreHygieneConfort: 15,
      totalScore: 73,
      selectedPlan: 'BRONZE',
      dateEnrollment: '2026-08-20',
      notes: 'Audit in situ réalisé le 12 septembre. Préconisation : renforcement des issues de secours côté plage.'
    }
  ]);

  // Modal new accompaniment
  const [isAddAccModalOpen, setIsAddAccModalOpen] = useState(false);
  const [accEstId, setAccEstId] = useState(establishments[0]?.id || '');
  const [accPlan, setAccPlan] = useState<'BRONZE' | 'SILVER' | 'GOLD'>('SILVER');
  const [accNotes, setAccNotes] = useState('');

  const handleEnrollEstablishment = (e: React.FormEvent) => {
    e.preventDefault();
    const est = establishments.find(x => x.id === accEstId);
    if (!est) return;

    const newAcc: AccompanimentRecord = {
      id: `ACC-${String(accompaniments.length + 1).padStart(3, '0')}`,
      establishmentId: est.id,
      establishmentName: est.name,
      promoterName: est.promoter_name,
      arrondissement: est.arrondissement,
      stage: 'AUDIT_IN_SITU',
      scoreAcoustique: 20,
      scoreSecurite: 22,
      scoreAccueilEthique: 16,
      scoreHygieneConfort: 17,
      totalScore: 75,
      selectedPlan: accPlan,
      dateEnrollment: new Date().toISOString().split('T')[0],
      notes: accNotes || 'Inscription au guichet d\'accompagnement SPA. Diagnostic in situ programmé.'
    };

    setAccompaniments(prev => [newAcc, ...prev]);
    setIsAddAccModalOpen(false);
    triggerNotification(`Établissement "${est.name}" inscrit au Programme d'Accompagnement & Labellisation !`, 'success');
  };

  // =========================================================================
  // 3. ECONOMIC MODEL SIMULATOR FOR DDL-PN REGIE
  // =========================================================================
  const [simBronzeCount, setSimBronzeCount] = useState<number>(15);
  const [simSilverCount, setSimSilverCount] = useState<number>(25);
  const [simGoldCount, setSimGoldCount] = useState<number>(8);

  const annualProjectedRevenue = useMemo(() => {
    const bronzeAnnual = simBronzeCount * 50000 * 4; // 50k / trimestre * 4
    const silverAnnual = simSilverCount * 100000 * 4; // 100k / trimestre * 4
    const goldAnnual = simGoldCount * 250000 * 2; // 250k / semestre * 2
    const total = bronzeAnnual + silverAnnual + goldAnnual;
    const partRegieDDL = Math.round(total * 0.3); // 30% Régie DDL
    const partTresor = total - partRegieDDL; // 70% Trésor

    return {
      bronzeAnnual,
      silverAnnual,
      goldAnnual,
      total,
      partRegieDDL,
      partTresor
    };
  }, [simBronzeCount, simSilverCount, simGoldCount]);

  // Modal new diploma
  const [isAddDipModal, setIsAddDipModal] = useState(false);
  const [dipEstId, setDipEstId] = useState(establishments[0]?.id || '');
  const [dipLabel, setDipLabel] = useState('Diplôme d’Honneur des Loisirs Sains & d’Excellence Acoustique');
  const [dipReasons, setDipReasons] = useState('Respect exemplaire des normes acoustiques (<80 dB) certifié par le Service SAA');

  const handleCreateDiploma = (e: React.FormEvent) => {
    e.preventDefault();
    const est = establishments.find(e => e.id === dipEstId);
    if (!est) return;

    const newDip = storageService.addDiploma({
      establishment_id: est.id,
      establishment_name: est.name,
      promoter_name: est.promoter_name,
      arrondissement: est.arrondissement,
      label: dipLabel,
      award_date: new Date().toISOString().split('T')[0],
      reference_number: `DIP-HONNEUR-DDLPN-2026-${String(diplomas.length + 1).padStart(3, '0')}`,
      reasons: [dipReasons, 'Environnement sain et convivialité exemplaire', 'Participation à la charte municipale des loisirs']
    });

    setDiplomas(storageService.getDiplomas());
    setIsAddDipModal(false);
    triggerNotification(`Diplôme d'Honneur décerné à ${est.name} !`, 'success');

    // Propose print
    setPrintDoc({
      isOpen: true,
      type: 'DIPLOME_HONNEUR_A4',
      title: `Diplôme d'Honneur - ${est.name}`,
      data: newDip
    });
  };

  const handleCopyRss = () => {
    navigator.clipboard.writeText(`${window.location.origin}/api/rss.xml`);
    triggerNotification('URL du flux officiel RSS 2.0 copiée dans le presse-papier !', 'success');
  };

  const handleSchedulePost = () => {
    const newPost: FacebookScheduledPost = {
      id: `POST-${Date.now().toString().slice(-4)}`,
      pillarId: selectedPillarId,
      scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      scheduledTime: '10:00',
      targetEstablishment: targetEst.name,
      content: customPostContent,
      status: 'PROGRAMME',
      hashtags: ['#DDLPN', '#PointeNoire', '#LoisirsSains'],
      estimatedReach: 5500
    };

    setScheduledPosts(prev => [newPost, ...prev]);
    triggerNotification('Publication enregistrée et programmée dans le calendrier éditorial Facebook !', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded font-mono-ref">
              SERVICE SPA • DIRECTION DÉPARTEMENTALE
            </span>
            <span className="text-xs text-slate-500">Promotion, Animation & Rayonnement Économique</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2 font-republic">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Service Promotion, Animation et Accompagnement des Établissements (SPA)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ligne éditoriale Facebook officielle, guichet d'accompagnement labellisé, modèle économique conventionné et valorisation des loisirs sains.
          </p>
        </div>

        {/* 5 Operational Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs gap-1">
          <button
            onClick={() => setActiveTab('FACEBOOK_LIGNE_EDITO')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'FACEBOOK_LIGNE_EDITO' ? 'bg-[#022448] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-300" />
            <span>Page Facebook & Ligne Éditoriale</span>
          </button>

          <button
            onClick={() => setActiveTab('ACCOMPAGNEMENT_ETAB')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ACCOMPAGNEMENT_ETAB' ? 'bg-[#006d2f] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Guichet Accompagnement & Labels</span>
          </button>

          <button
            onClick={() => setActiveTab('MODELE_ECO_PACKS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MODELE_ECO_PACKS' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-200" />
            <span>Modèle Économique & Packages</span>
          </button>

          <button
            onClick={() => setActiveTab('DIPLOME_HONNEUR')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'DIPLOME_HONNEUR' ? 'bg-[#022448] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Diplômes d'Honneur</span>
          </button>

          <button
            onClick={() => setActiveTab('FLUX_RSS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'FLUX_RSS' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Rss className="w-3.5 h-3.5 text-orange-400" />
            <span>Flux RSS 2.0</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: LIGNE ÉDITORIALE & PAGE FACEBOOK DDL-PN
         ========================================================================= */}
      {activeTab === 'FACEBOOK_LIGNE_EDITO' && (
        <div className="space-y-6">
          {/* Introduction Card */}
          <div className="bg-gradient-to-r from-[#022448] via-[#033468] to-[#006d2f] text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded font-mono-ref">
                  STRATÉGIE DIGITALE OFFICIELLE
                </span>
                <span className="text-xs text-slate-300">Page Facebook : « Direction Départementale des Loisirs de Pointe-Noire »</span>
              </div>
              <h3 className="text-base font-extrabold tracking-tight font-republic text-white">
                Ligne Éditoriale Stratégique & Production de Contenus d'Autorité
              </h3>
              <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
                Positionner la DDL-PN non pas comme une administration répressive, mais comme l'autorité bienveillante qui valorise les exploitants vertueux, protège le bien-être des familles et promeut la richesse festive et culturelle de Pointe-Noire.
              </p>
            </div>

            <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-center shrink-0">
              <span className="text-2xl font-black font-mono-ref text-amber-300 block">4 Piliers</span>
              <span className="text-[10px] text-slate-200 font-medium">Cadre Républicain Hebdomadaire</span>
            </div>
          </div>

          {/* The 4 Editorial Pillars */}
          <div>
            <h4 className="font-extrabold text-[#022448] text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Grille des 4 Piliers Éditoriaux Hebdomadaires</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {EDITORIAL_PILLARS.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPillarId(p.id)}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                    selectedPillarId === p.id
                      ? 'border-[#022448] bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500 font-mono-ref">{p.dayOfWeek}</span>
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                        Pilier Actif
                      </span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-xs leading-snug">{p.pillarTitle}</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10.5px]">
                    <span className="text-slate-400 block font-bold">Visuel recommandé :</span>
                    <span className="text-slate-700 italic">{p.recommendedVisual}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Generator & Realistic Facebook Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Generator Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#006d2f]" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Atelier de Rédaction : Post Facebook pour « {activePillar.pillarTitle} »
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-mono-ref">{activePillar.dayOfWeek}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Établissement ou Thématique Ciblée
                  </label>
                  <select
                    value={selectedEstIdForPost}
                    onChange={e => setSelectedEstIdForPost(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs cursor-pointer"
                  >
                    {establishments.slice(0, 15).map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} — {e.promoter_name} ({e.arrondissement})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Texte Complet du Post Facebook</label>
                    <span className="text-[10px] text-slate-400">{customPostContent.length} caractères</span>
                  </div>
                  <textarea
                    rows={8}
                    value={customPostContent}
                    onChange={e => setCustomPostContent(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref text-xs leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#022448]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(customPostContent);
                      triggerNotification('Texte copié ! Prêt à coller dans Meta Business Suite.', 'success');
                    }}
                    className="bg-[#022448] hover:bg-[#033468] text-white px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier pour Facebook</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(customPostContent);
                      triggerNotification('Texte copié pour diffusion WhatsApp !', 'success');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Partager sur WhatsApp</span>
                  </button>

                  <button
                    onClick={handleSchedulePost}
                    className="bg-[#006d2f] hover:bg-[#005a26] text-white px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Programmer au Calendrier</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Realistic Facebook Post Mockup (5 cols) */}
            <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b">
                <span className="font-bold flex items-center gap-1 text-slate-700">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Aperçu Réaliste Facebook</span>
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded">
                  Simulation Flux
                </span>
              </div>

              {/* Realistic Facebook Post Card */}
              <div className="bg-[#f0f2f5] p-3 rounded-xl">
                <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs">
                  {/* Post Header */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#022448] flex items-center justify-center text-white font-black text-xs ring-2 ring-amber-400">
                        <OfficialRepublicLogo size="xs" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900 text-xs">
                            Direction Départementale des Loisirs de Pointe-Noire
                          </span>
                          <span className="w-3.5 h-3.5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px]">
                            ✓
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span>Aujourd'hui à 09:30</span>
                          <span>•</span>
                          <span>🌐 Public</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-3 pb-3 text-slate-800 text-[11px] leading-relaxed whitespace-pre-line font-sans">
                    {customPostContent}
                  </div>

                  {/* Image Placeholder */}
                  <div className="bg-gradient-to-br from-[#022448] to-[#006d2f] text-white p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <OfficialRepublicLogo size="md" />
                    <p className="font-republic font-bold text-xs text-amber-300 uppercase tracking-wide">
                      République du Congo • MCAPNIT • DDL-PN
                    </p>
                    <p className="text-[10px] text-slate-200">
                      Campagne Officielle pour la Promotion des Loisirs Sains
                    </p>
                  </div>

                  {/* Reaction counts */}
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-[8px]">
                        👍
                      </span>
                      <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px]">
                        ❤️
                      </span>
                      <span className="ml-1 font-semibold text-slate-700">142 mentions</span>
                    </div>
                    <span>38 commentaires • 19 partages</span>
                  </div>

                  {/* Action buttons bar */}
                  <div className="grid grid-cols-3 text-center text-slate-600 text-xs py-1.5 font-semibold">
                    <button className="hover:bg-slate-100 py-1 rounded flex items-center justify-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>J'aime</span>
                    </button>
                    <button className="hover:bg-slate-100 py-1 rounded flex items-center justify-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Commenter</span>
                    </button>
                    <button className="hover:bg-slate-100 py-1 rounded flex items-center justify-center gap-1">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Partager</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Content Calendar Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Calendrier de Programmation Social Media
                </h4>
                <p className="text-slate-500 text-xs">Suivi des publications officielles programmées sur la Page Facebook DDL-PN</p>
              </div>
              <span className="font-mono-ref text-[11px] bg-purple-100 text-purple-900 px-2 py-1 rounded-lg font-bold">
                {scheduledPosts.length} posts au planning
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#022448] text-white uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Date & Heure</th>
                    <th className="py-2.5 px-3">Pilier Éditorial</th>
                    <th className="py-2.5 px-3">Extrait du Message</th>
                    <th className="py-2.5 px-3">Portée Estimée</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scheduledPosts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono-ref font-bold text-slate-800">
                        {p.scheduledDate} ({p.scheduledTime})
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded text-[10.5px]">
                          {p.pillarId.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-slate-600">
                        {p.content.slice(0, 75)}...
                      </td>
                      <td className="py-2.5 px-3 font-mono-ref font-bold text-[#006d2f]">
                        ~{p.estimatedReach.toLocaleString('fr-FR')} vues
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'PUBLIE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(p.content);
                            triggerNotification('Texte copié !', 'success');
                          }}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600"
                          title="Copier le texte"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GUICHET ACCOMPAGNEMENT & LABELLISATION
         ========================================================================= */}
      {activeTab === 'ACCOMPAGNEMENT_ETAB' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded font-mono-ref">
                  PROGRAMME OFFICIEL 2026
                </span>
                <span className="text-xs text-slate-500">Label Départemental « Loisirs Sains DDL-PN »</span>
              </div>
              <h3 className="text-base font-extrabold text-[#022448] tracking-tight mt-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#006d2f]" />
                <span>Accompagnement Personnalisé des Établissements & Labellisation</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit de conformité (acoustique, sécurité incendie, hygiène, éthique familiale), attribution de note /100 et délivrance du label de prestige.
              </p>
            </div>

            <button
              onClick={() => setIsAddAccModalOpen(true)}
              className="bg-[#006d2f] hover:bg-[#005a26] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inscrire un Nouvel Établissement</span>
            </button>
          </div>

          {/* 4 Steps Methodology */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-black text-blue-900 font-mono-ref block">ÉTAPE 1</span>
              <h5 className="font-bold text-slate-800">Candidature & Dépôt</h5>
              <p className="text-slate-500 text-[11px]">Enregistrement volontaire par l'exploitant désireux d'être accompagné et labellisé.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-black text-amber-700 font-mono-ref block">ÉTAPE 2</span>
              <h5 className="font-bold text-slate-800">Audit In Situ (4 Axes)</h5>
              <p className="text-slate-500 text-[11px]">Évaluation par les experts SPA & SAA : Acoustique, Sécurité, Hygiène, Accueil familial.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-black text-purple-700 font-mono-ref block">ÉTAPE 3</span>
              <h5 className="font-bold text-slate-800">Plan d'Amélioration</h5>
              <p className="text-slate-500 text-[11px]">Conseils techniques pour atteindre un score supérieur à 75/100 sans pénalité financière.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-black text-[#006d2f] font-mono-ref block">ÉTAPE 4</span>
              <h5 className="font-bold text-slate-800">Labellisation & Promotion</h5>
              <p className="text-slate-500 text-[11px]">Attribution du diplôme d'honneur et campagne de valorisation sur la Page Facebook officielle.</p>
            </div>
          </div>

          {/* Accompanied Establishments Registry Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">
                Registre des Établissements Engagés dans la Démarche Qualité
              </h4>
              <span className="text-[11px] font-mono-ref text-slate-500">
                {accompaniments.length} structures suivies
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#022448] text-white uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Réf Dossier</th>
                    <th className="py-2.5 px-3">Établissement & Promoteur</th>
                    <th className="py-2.5 px-3">Arrondissement</th>
                    <th className="py-2.5 px-3">Formule Choisi</th>
                    <th className="py-2.5 px-3">Score Global</th>
                    <th className="py-2.5 px-3">Étape du Processus</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accompaniments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono-ref font-bold text-[#022448]">{a.id}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{a.establishmentName}</span>
                        <span className="text-[10px] text-slate-500">{a.promoterName}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold">{a.arrondissement}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono-ref ${
                          a.selectedPlan === 'GOLD' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          a.selectedPlan === 'SILVER' ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-900'
                        }`}>
                          Pack {a.selectedPlan}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono-ref">
                        <span className={`font-black text-sm ${a.totalScore >= 80 ? 'text-[#006d2f]' : 'text-amber-700'}`}>
                          {a.totalScore}/100
                        </span>
                        <span className="text-[9.5px] text-slate-400 block">
                          Acoustique: {a.scoreAcoustique}/30
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.stage === 'LABEL_ATTRIBUE' ? 'bg-emerald-100 text-emerald-800' :
                          a.stage === 'PLAN_MISE_AUX_NORMES' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {a.stage.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            triggerNotification(`Fiche d'audit technique de ${a.establishmentName} consultée.`, 'info');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                        >
                          Détails Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MODÈLE ÉCONOMIQUE & PACKAGES DE PARTENARIAT RÉGIE
         ========================================================================= */}
      {activeTab === 'MODELE_ECO_PACKS' && (
        <div className="space-y-6">
          {/* Header Explanation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-mono-ref">
                RÉGIE DDL-PN • DÉCRET 2021-412
              </span>
              <span className="text-xs text-slate-500">Génération de Recettes Complémentaires Propres</span>
            </div>
            <h3 className="text-base font-extrabold text-[#022448] tracking-tight">
              Modèle Économique Conventionné de Visibilité & Partenariats Marchands
            </h3>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              En complément des redevances d'agrément SAA réglementaires, le Service SPA commercialise des <strong>conventions de valorisation et d'accompagnement de communication</strong>. Ce modèle permet de financer les animations citoyennes (scrabble scolaire, arbre de Noël des orphelins) tout en apportant aux exploitants une publicité officielle de premier ordre.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bronze Pack */}
            <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-orange-100 text-orange-900 font-bold px-2.5 py-0.5 rounded-full font-mono-ref">
                    PACK BRONZE DÉCOUVERTE
                  </span>
                  <span className="text-[10px] text-slate-400">Trimestriel</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-[#022448] font-mono-ref">50 000</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">FCFA / trimestre</span>
                </div>
                <p className="text-xs text-slate-600">Idéal pour les snacks, terrasses et bars de quartier désireux de se faire connaître.</p>
                <ul className="text-xs text-slate-700 space-y-2 pt-2 border-t">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>Fiche permanente sur le portail numérique DDL-PN</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>1 publication de mise en avant sur la Page Facebook DDL-PN</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>Macaron autocollant officiel vitrine « Référencé DDL-PN »</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  triggerNotification('Souscription Pack Bronze enregistrée !', 'success');
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Souscrire Pack Bronze
              </button>
            </div>

            {/* Silver Pack */}
            <div className="bg-white p-5 rounded-2xl border-2 border-blue-600 shadow-md flex flex-col justify-between space-y-4 relative">
              <div className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Recommandé
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2.5 py-0.5 rounded-full font-mono-ref">
                    PACK SILVER VALORISATION
                  </span>
                  <span className="text-[10px] text-slate-400">Trimestriel</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-blue-900 font-mono-ref">100 000</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">FCFA / trimestre</span>
                </div>
                <p className="text-xs text-slate-600">Pour les restaurants, complexes lounge et salles de réception établis.</p>
                <ul className="text-xs text-slate-700 space-y-2 pt-2 border-t">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>Tous les avantages du Pack Bronze</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>Audit acoustique annuel gratuit avec certificat d'étalonnage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>2 publications mensuelles sponsorisées sur la Page Facebook</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>Relais d'un événement festif par mois sur l'agenda officiel</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  triggerNotification('Souscription Pack Silver enregistrée !', 'success');
                }}
                className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Souscrire Pack Silver
              </button>
            </div>

            {/* Gold Pack */}
            <div className="bg-gradient-to-b from-amber-50 to-white p-5 rounded-2xl border-2 border-amber-400 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full font-mono-ref">
                    PACK GOLD EXCELLENCE
                  </span>
                  <span className="text-[10px] text-slate-500">Semestriel</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-[#022448] font-mono-ref">250 000</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">FCFA / semestre</span>
                </div>
                <p className="text-xs text-slate-600">Partenaire Institutionnel de premier plan pour les grands hôtels et discothèques VIP.</p>
                <ul className="text-xs text-slate-700 space-y-2 pt-2 border-t">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>Tous les avantages des Packs Bronze & Silver</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>Diplôme d'Honneur remis par M. le Directeur Départemental</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>4 publications Facebook/mois + bannière en-tête 1 mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f] shrink-0" />
                    <span>Reportage photo/vidéo officiel lors des soirées labellisées</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  triggerNotification('Souscription Pack Gold Excellence enregistrée !', 'success');
                }}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-[#006d2f] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
              >
                Souscrire Pack Gold
              </button>
            </div>
          </div>

          {/* Interactive Annual Revenue Simulator for DDL-PN */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-extrabold text-[#022448] text-sm flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Simulateur d'Autofinancement de la Régie DDL-PN via le SPA</span>
                </h4>
                <p className="text-slate-500 text-xs">Ajustez le nombre d'adhérents par formule pour visualiser le budget annuel généré</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex justify-between">
                  <span>Adhérents Pack Bronze (50k/T) :</span>
                  <span className="font-mono-ref text-blue-900">{simBronzeCount}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={simBronzeCount}
                  onChange={e => setSimBronzeCount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex justify-between">
                  <span>Adhérents Pack Silver (100k/T) :</span>
                  <span className="font-mono-ref text-blue-900">{simSilverCount}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={simSilverCount}
                  onChange={e => setSimSilverCount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex justify-between">
                  <span>Adhérents Pack Gold (250k/S) :</span>
                  <span className="font-mono-ref text-blue-900">{simGoldCount}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={simGoldCount}
                  onChange={e => setSimGoldCount(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Projection Summary Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Recettes Brutes Annuelles</span>
                <span className="text-xl font-black text-[#022448] font-mono-ref">
                  {annualProjectedRevenue.total.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Part Trésor Public (70%)</span>
                <span className="text-xl font-black text-[#006d2f] font-mono-ref">
                  {annualProjectedRevenue.partTresor.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                <span className="text-[10px] text-blue-900 font-bold uppercase block">Régie DDL-PN Autonome (30%)</span>
                <span className="text-xl font-black text-blue-950 font-mono-ref">
                  {annualProjectedRevenue.partRegieDDL.toLocaleString('fr-FR')} FCFA
                </span>
                <span className="text-[9.5px] text-blue-800 block mt-0.5">Budget d'animation socioculturelle</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DIPLÔMES D'HONNEUR & LABELS
         ========================================================================= */}
      {activeTab === 'DIPLOME_HONNEUR' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#022448] text-sm">
              Registre des Diplômes d’Honneur Décernés
            </h3>
            <button
              onClick={() => setIsAddDipModal(true)}
              className="bg-[#006d2f] hover:bg-[#005a26] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Décerner un Nouveau Diplôme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diplomas.map(dip => (
              <div key={dip.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{dip.establishment_name}</h4>
                      <p className="text-xs text-slate-500">{dip.promoter_name} • {dip.arrondissement}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-ref bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">
                    {dip.reference_number}
                  </span>
                </div>

                <p className="text-xs font-serif italic text-[#006d2f] border-l-2 border-[#006d2f] pl-2.5">
                  « {dip.label} »
                </p>

                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-[11px] text-slate-400 font-mono-ref">Décerné le {dip.award_date}</span>
                  <button
                    onClick={() => {
                      setPrintDoc({
                        isOpen: true,
                        type: 'DIPLOME_HONNEUR_A4',
                        title: `Diplôme d'Honneur - ${dip.establishment_name}`,
                        data: dip
                      });
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1.5 text-xs transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Imprimer A4</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: FLUX XML RSS 2.0
         ========================================================================= */}
      {activeTab === 'FLUX_RSS' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Rss className="w-4 h-4 text-amber-600" />
                  <span>Flux XML RSS 2.0 Officiel - Journal des Loisirs Sains</span>
                </h3>
                <p className="text-slate-500 text-xs">
                  Syndication média officielle pour la presse, les radios locales et les plateformes numériques de Pointe-Noire.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyRss}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier URL Flux RSS</span>
                </button>
                <a
                  href="/api/rss.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#022448] text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir XML</span>
                </a>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border font-mono-ref text-[11px] text-slate-600">
              <code>GET {typeof window !== 'undefined' ? window.location.origin : ''}/api/rss.xml</code>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Accompagnement */}
      {isAddAccModalOpen && (
        <div
          onClick={() => setIsAddAccModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 cursor-default"
          >
            <div className="bg-[#022448] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Inscrire une Structure au Programme d'Accompagnement</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAccModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollEstablishment} className="p-4 space-y-3 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sélectionner l'établissement recensé *</label>
                <select
                  value={accEstId}
                  onChange={e => setAccEstId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  {establishments.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.promoter_name} ({e.arrondissement})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Formule de Partenariat Choisie</label>
                <select
                  value={accPlan}
                  onChange={e => setAccPlan(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="BRONZE">Pack Bronze (50 000 FCFA / trimestre)</option>
                  <option value="SILVER">Pack Silver (100 000 FCFA / trimestre) - Recommandé</option>
                  <option value="GOLD">Pack Gold Excellence (250 000 FCFA / semestre)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes et Objectifs de l'Exploitant</label>
                <textarea
                  rows={3}
                  value={accNotes}
                  onChange={e => setAccNotes(e.target.value)}
                  placeholder="ex: L'exploitant souhaite faire vérifier son limiteur acoustique et valoriser ses soirées rumba familiales."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddAccModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded-lg cursor-pointer"
                >
                  Valider l'Inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Diploma */}
      {isAddDipModal && (
        <div
          onClick={() => setIsAddDipModal(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 cursor-default"
          >
            <div className="bg-[#022448] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Décerner un Diplôme d'Honneur Départemental</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDipModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiploma} className="p-4 space-y-3 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Établissement Lauréat *</label>
                <select
                  value={dipEstId}
                  onChange={e => setDipEstId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  {establishments.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.promoter_name} - {e.arrondissement})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Intitulé du Diplôme d'Honneur</label>
                <input
                  type="text"
                  value={dipLabel}
                  onChange={e => setDipLabel(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motif Principal & Mérites</label>
                <textarea
                  rows={3}
                  value={dipReasons}
                  onChange={e => setDipReasons(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddDipModal(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded-lg cursor-pointer"
                >
                  Émettre et Imprimer A4
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print Modal with Working Close Button */}
      <PrintModal
        isOpen={printDoc.isOpen}
        onClose={() => setPrintDoc(prev => ({ ...prev, isOpen: false }))}
        documentType={printDoc.type}
        title={printDoc.title}
        data={printDoc.data}
      />
    </div>
  );
};
