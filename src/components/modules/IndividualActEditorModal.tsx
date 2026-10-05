import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  Scale,
  FileCheck2,
  X,
  Building2,
  User,
  MapPin,
  Clock,
  Printer,
  Save,
  CheckCircle2,
  Search,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Establishment, OfficialLegalAct, ArrondissementCode, RegimeType } from '../../types';
import { TERRITORIAL_REFERENTIAL, ACTIVITY_CATEGORIES, REPUBLIQUE_CONGO } from '../../constants/referential';
import { useSession } from '../../context/SessionContext';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';

export type IndividualActType =
  | 'ATTESTATION_DEPOT'
  | 'MISE_EN_DEMEURE'
  | 'ARRETE_FERMETURE'
  | 'CONVOCATION'
  | 'ORDRE_MISSION'
  | 'PV_CONSTAT';

export interface IndividualActEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  actType: IndividualActType;
  preselectedEstId?: string;
  onActSaved?: (act: OfficialLegalAct) => void;
}

interface ActMetaConfig {
  code: IndividualActType;
  title: string;
  badgeLabel: string;
  natureLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  headerGradient: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  printDocType: PrintDocumentType;
  defaultRefPrefix: string;
  defaultDelai: string;
  defaultMotif: string;
  visas: string[];
}

const ACTS_CONFIG: Record<IndividualActType, ActMetaConfig> = {
  ATTESTATION_DEPOT: {
    code: 'ATTESTATION_DEPOT',
    title: "Attestation de Dépôt de Dossier d'Agrément",
    badgeLabel: "ACTE D'AUTORISATION TRANSITOIRE",
    natureLabel: "Attestation officielle autorisant la poursuite des activités pendant l'instruction",
    icon: FileText,
    headerGradient: 'from-[#022448] via-[#023871] to-[#006d2f]',
    badgeBg: 'bg-emerald-500/30 border border-emerald-400/50',
    badgeText: 'text-emerald-200',
    accentBorder: 'border-emerald-600',
    printDocType: 'ATTESTATION_A4',
    defaultRefPrefix: 'ATT-DDL-PN-2026/',
    defaultDelai: 'Valable 3 mois (Pendant l’instruction du dossier d’agrément)',
    defaultMotif: "Dépôt régulier du dossier de demande d'agrément technique d'exploitation et acquittement des droits d'instruction de régie administrative.",
    visas: [
      'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo',
      'Décret N° 2021-412 du 28 octobre 2021 portant organisation de la Direction Générale des Loisirs'
    ]
  },
  MISE_EN_DEMEURE: {
    code: 'MISE_EN_DEMEURE',
    title: 'Mise en Demeure Formelle sous 72 Heures',
    badgeLabel: 'SOMMATION DE RÉGULARISATION SOUS HUITAINE',
    natureLabel: 'Mise en demeure avant fermeture administrative d’office et apposition des scellés',
    icon: AlertTriangle,
    headerGradient: 'from-[#2b0303] via-[#7a1212] to-[#b91c1c]',
    badgeBg: 'bg-red-500/30 border border-red-400/50',
    badgeText: 'text-red-200',
    accentBorder: 'border-red-600',
    printDocType: 'ACTE_JURIDIQUE_A4',
    defaultRefPrefix: 'MD-',
    defaultDelai: '72 heures ouvrées (sous huitaine)',
    defaultMotif: 'Exploitation sans agrément officiel préalable, défaut de constitution du dossier administratif et non-versement des redevances d’État.',
    visas: [
      'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo',
      'Décret N° 2021-412 du 28 octobre 2021 portant organisation de la Direction Générale des Loisirs',
      'Rapports de constatation in situ dressés par les agents du Service Assistance et Autorisation (SAA)'
    ]
  },
  ARRETE_FERMETURE: {
    code: 'ARRETE_FERMETURE',
    title: 'Arrêté Portant Fermeture Administrative Immédiate',
    badgeLabel: 'DÉCISION EXÉCUTOIRE D’AUTORITÉ',
    natureLabel: 'Fermeture d’office des locaux et apposition des scellés de la République',
    icon: ShieldAlert,
    headerGradient: 'from-[#1a0505] via-[#4d0707] to-[#7f1d1d]',
    badgeBg: 'bg-rose-500/30 border border-rose-400/50',
    badgeText: 'text-rose-200',
    accentBorder: 'border-rose-700',
    printDocType: 'ACTE_JURIDIQUE_A4',
    defaultRefPrefix: 'ARR-FERM-',
    defaultDelai: 'Exécution immédiate dès notification avec concours de la Force Publique',
    defaultMotif: 'Non-respect réitéré de la mise en demeure sous 72h, exercice illicite d’activités de loisirs et trouble avéré à l’ordre public.',
    visas: [
      'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo',
      'Décret N° 2021-412 du 28 octobre 2021 organisant les services de la DGL',
      'Mise en demeure préalable restée infructueuse dans le délai légal imparti'
    ]
  },
  CONVOCATION: {
    code: 'CONVOCATION',
    title: 'Convocation Administrative Officielle',
    badgeLabel: 'AUDIENCE CONTRADICTOIRE SAA',
    natureLabel: 'Comparution obligatoire au bureau du Service Assistance et Autorisation',
    icon: Calendar,
    headerGradient: 'from-[#1e1035] via-[#3b156b] to-[#6b21a8]',
    badgeBg: 'bg-purple-500/30 border border-purple-400/50',
    badgeText: 'text-purple-200',
    accentBorder: 'border-purple-600',
    printDocType: 'ACTE_JURIDIQUE_A4',
    defaultRefPrefix: 'CONV-',
    defaultDelai: 'Mardi 6 octobre 2026 à 10h00 au Bureau N° 3 (SAA)',
    defaultMotif: 'Comparution contradictoire obligatoire en vue de l’instruction du dossier d’agrément et de la régularisation administrative.',
    visas: [
      'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo',
      'Décret N° 2021-412 du 28 octobre 2021 portant organisation de la Direction Générale des Loisirs'
    ]
  },
  ORDRE_MISSION: {
    code: 'ORDRE_MISSION',
    title: 'Ordre de Mission de Contrôle Républicain In Situ',
    badgeLabel: 'MANDAT OFFICIEL D’INSPECTION',
    natureLabel: 'Opération de contrôle de conformité, sonométrie et vérification des quittances',
    icon: Scale,
    headerGradient: 'from-[#031d38] via-[#022b54] to-[#0284c7]',
    badgeBg: 'bg-blue-500/30 border border-blue-400/50',
    badgeText: 'text-blue-200',
    accentBorder: 'border-blue-600',
    printDocType: 'ACTE_JURIDIQUE_A4',
    defaultRefPrefix: 'OM-',
    defaultDelai: 'Mission d’inspection du 2 au 5 octobre 2026',
    defaultMotif: 'Contrôle contradictoire in situ de la conformité administrative, vérification des quittances et régulation du secteur des loisirs.',
    visas: [
      'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo',
      'Décret N° 2021-412 du 28 octobre 2021 organisant les services de la DGL'
    ]
  },
  PV_CONSTAT: {
    code: 'PV_CONSTAT',
    title: 'Procès-Verbal de Constat d’Infraction & Sonométrie',
    badgeLabel: 'CONSTAT D’INFRACTION RÉGLEMENTAIRE',
    natureLabel: 'Relevé contradictoire de non-conformité sonore et défaut d’autorisation',
    icon: FileCheck2,
    headerGradient: 'from-[#331c03] via-[#783e06] to-[#d97706]',
    badgeBg: 'bg-amber-500/30 border border-amber-400/50',
    badgeText: 'text-amber-200',
    accentBorder: 'border-amber-600',
    printDocType: 'ACTE_JURIDIQUE_A4',
    defaultRefPrefix: 'PV-INF-',
    defaultDelai: 'Transmission immédiate au Service SAA pour sanctions conservatoires',
    defaultMotif: 'Dépassement du seuil sonométrique légal (mesure supérieure à 85 dB sans limiteur agréé) et défaut d’agrément républicain.',
    visas: [
      'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo',
      'Arrêté Départemental N° 018/DDL-PN-2026 relatif aux normes acoustiques nocturnes'
    ]
  }
};

export const IndividualActEditorModal: React.FC<IndividualActEditorModalProps> = ({
  isOpen,
  onClose,
  actType,
  preselectedEstId,
  onActSaved
}) => {
  const { currentUser, triggerNotification } = useSession();
  const config = ACTS_CONFIG[actType] || ACTS_CONFIG.ATTESTATION_DEPOT;
  const IconComponent = config.icon;

  const [establishments, setEstablishments] = useState<Establishment[]>(() => storageService.getEstablishments());
  const [selectedEstId, setSelectedEstId] = useState<string>(preselectedEstId || '');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Form Fields
  const [establishmentName, setEstablishmentName] = useState<string>('');
  const [promoterName, setPromoterName] = useState<string>('');
  const [arrondissement, setArrondissement] = useState<ArrondissementCode>('1_LUMUMBA');
  const [quartier, setQuartier] = useState<string>('Centre-Ville');
  const [address, setAddress] = useState<string>('');
  const [activityType, setActivityType] = useState<string>('Établissement de loisirs');
  const [activityCode, setActivityCode] = useState<string>('A2.1');

  // Specific Act Legal Fields
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [delai, setDelai] = useState<string>(config.defaultDelai);
  const [motif, setMotif] = useState<string>(config.defaultMotif);
  const [agentNotificateur, setAgentNotificateur] = useState<string>('Agents Assermentés du Service SAA');
  const [signataireNom, setSignataireNom] = useState<string>('Jean Richard NTSEKE NGOUAKA');
  const [signataireTitre, setSignataireTitre] = useState<string>('Directeur Départemental des Loisirs de Pointe-Noire (DDL-PN)');
  const [amountPaid, setAmountPaid] = useState<number>(30000);

  // Print modal trigger
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: PrintDocumentType;
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'ACTE_JURIDIQUE_A4',
    title: '',
    data: null
  });

  // Reload establishments and initialize on modal open
  useEffect(() => {
    if (isOpen) {
      const all = storageService.getEstablishments();
      setEstablishments(all);
      setIsAddingNew(false);
      setFilterSearch('');

      const existingActs = storageService.getActs();
      const count = existingActs.length + 1;

      // Generate Reference Number
      let ref = '';
      if (actType === 'ATTESTATION_DEPOT') {
        ref = `ATT-DDL-PN-2026/${String(count + 40).padStart(3, '0')}`;
      } else if (actType === 'MISE_EN_DEMEURE') {
        ref = `MD-${String(count + 90).padStart(3, '0')}/MCAPNIT/DGL/DDL-PN-2026`;
      } else if (actType === 'ARRETE_FERMETURE') {
        ref = `ARR-FERM-${String(count + 15).padStart(3, '0')}/DDL-PN-2026`;
      } else if (actType === 'CONVOCATION') {
        ref = `CONV-${String(count + 150).padStart(3, '0')}/DDL-PN/SAA-2026`;
      } else if (actType === 'ORDRE_MISSION') {
        ref = `OM-${String(count + 40).padStart(3, '0')}/DDL-PN-2026`;
      } else if (actType === 'PV_CONSTAT') {
        ref = `PV-INF-${String(count + 20).padStart(3, '0')}/DDL-PN-2026`;
      }
      setReferenceNumber(ref);
      setDelai(config.defaultDelai);
      setMotif(config.defaultMotif);

      if (currentUser?.name) {
        setAgentNotificateur(`${currentUser.name} (${currentUser.badge || 'SAA-01'})`);
        if (currentUser.role === 'DIRECTEUR') {
          setSignataireNom(currentUser.name);
          setSignataireTitre(currentUser.title || 'Directeur Départemental des Loisirs de Pointe-Noire (DDL-PN)');
        }
      }

      const initialEstId = preselectedEstId || (all.length > 0 ? all[0].id : '');
      setSelectedEstId(initialEstId);
    }
  }, [isOpen, actType, preselectedEstId, config.defaultDelai, config.defaultMotif, currentUser]);

  // When selected establishment changes from dropdown
  useEffect(() => {
    if (isAddingNew || !selectedEstId) return;

    const est = establishments.find(e => e.id === selectedEstId);
    if (est) {
      setEstablishmentName(est.name);
      setPromoterName(est.promoter_name || 'Exploitant');
      setArrondissement(est.arrondissement);
      setQuartier(est.quartier || 'Centre-Ville');
      setAddress(est.address || '');
      setActivityCode(est.activity_code || 'A2.1');
      const foundAct = ACTIVITY_CATEGORIES.find(c => c.code === est.activity_code);
      setActivityType(foundAct?.label || est.activity_type || 'Établissement de loisirs');
      setAmountPaid(est.amount_paid > 0 ? est.amount_paid : 30000);
    }
  }, [selectedEstId, establishments, isAddingNew]);

  // Filter establishments list for the dropdown
  const filteredEstablishments = useMemo(() => {
    if (!filterSearch.trim()) return establishments;
    const q = filterSearch.toLowerCase();
    return establishments.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.promoter_name.toLowerCase().includes(q) ||
        e.arrondissement.toLowerCase().includes(q) ||
        (e.quartier && e.quartier.toLowerCase().includes(q))
    );
  }, [establishments, filterSearch]);

  const handleCreateNewToggle = () => {
    setIsAddingNew(prev => {
      const next = !prev;
      if (next) {
        setSelectedEstId('');
        setEstablishmentName('');
        setPromoterName('');
        setArrondissement('1_LUMUMBA');
        setQuartier('Centre-Ville');
        setAddress('');
        setActivityType('Bar Dancing / Débit de boissons');
        setActivityCode('A2.1');
        setAmountPaid(30000);
      } else if (establishments.length > 0) {
        setSelectedEstId(establishments[0].id);
      }
      return next;
    });
  };

  const saveActAndPrepareData = (): { act: OfficialLegalAct; est: Establishment } | null => {
    if (!establishmentName.trim()) {
      triggerNotification('Veuillez spécifier le nom de l’établissement.', 'error');
      return null;
    }

    let finalEst: Establishment | undefined;

    // If new establishment, save it first in DB without inventing fictional data
    if (isAddingNew) {
      const created = storageService.addEstablishment({
        name: establishmentName.trim(),
        promoter_name: promoterName.trim() || 'Exploitant',
        phone: '+242 06 000 00 00',
        arrondissement,
        quartier: quartier || 'Centre-Ville',
        address: address || `${quartier}, Pointe-Noire`,
        activity_type: activityType,
        activity_code: activityCode,
        regime_type: 'INFORMEL',
        surface_m2: 80,
        filing_fee: 50000,
        rate_per_sqm: 0,
        total_due: amountPaid || 50000,
        amount_paid: amountPaid || 30000,
        balance_due: Math.max(0, (amountPaid || 50000) - (amountPaid || 30000)),
        status: actType === 'ATTESTATION_DEPOT' ? 'attestation_depot' : 'en_instruction',
        identified_by: `${currentUser?.name || 'Agent SAA'} (${currentUser?.badge || 'SAA-01'})`,
        identified_date: new Date().toISOString().split('T')[0],
        installments_chosen: 1,
        coordinates: [-4.7938, 11.8569]
      });
      finalEst = created;
      setEstablishments(storageService.getEstablishments());
      setSelectedEstId(created.id);
      setIsAddingNew(false);
    } else {
      finalEst = establishments.find(e => e.id === selectedEstId);
    }

    if (!finalEst) {
      triggerNotification('Veuillez sélectionner un établissement valide dans la liste déroulante.', 'error');
      return null;
    }

    // Map internal act type to OfficialLegalAct type
    const mappedType: OfficialLegalAct['type'] =
      actType === 'ATTESTATION_DEPOT'
        ? 'ATTESTATION_DEPOT'
        : actType === 'MISE_EN_DEMEURE'
        ? 'MISE_EN_DEMEURE'
        : actType === 'ARRETE_FERMETURE'
        ? 'ARRETE_FERMETURE'
        : actType === 'CONVOCATION'
        ? 'CONVOCATION'
        : actType === 'ORDRE_MISSION'
        ? 'ORDRE_MISSION'
        : 'PV_CONSTAT';

    const savedAct = storageService.addAct({
      type: mappedType,
      reference_number: referenceNumber,
      establishment_id: finalEst.id,
      establishment_name: finalEst.name,
      promoter_name: finalEst.promoter_name,
      arrondissement: finalEst.arrondissement,
      address: finalEst.address,
      date_emission: new Date().toISOString().split('T')[0],
      delai_huitaine_date: delai,
      motif,
      signataire_nom: signataireNom,
      signataire_titre: signataireTitre,
      agent_notificateur: agentNotificateur,
      visa_lois: config.visas
    });

    // Record Audit Log for IGE
    storageService.logAuditEvent(
      'EMISSION_ACTE_JURIDIQUE',
      savedAct.reference_number,
      `${savedAct.type} - ${savedAct.establishment_name}`,
      `Acte officiel généré individuellement : ${config.title}. Délai : ${savedAct.delai_huitaine_date}.`,
      currentUser ? { badge: currentUser.badge, name: currentUser.name, role: currentUser.role } : undefined
    );

    if (onActSaved) {
      onActSaved(savedAct);
    }

    return { act: savedAct, est: finalEst };
  };

  // Action 1: Save directly to database
  const handleSaveToDb = (e: React.FormEvent) => {
    e.preventDefault();
    const result = saveActAndPrepareData();
    if (result) {
      triggerNotification(`L'acte officiel ${result.act.reference_number} a été enregistré dans la base de données.`, 'success');
      onClose();
    }
  };

  // Action 2: Save and Launch Print A4
  const handleSaveAndPrint = (e: React.FormEvent) => {
    e.preventDefault();
    const result = saveActAndPrepareData();
    if (result) {
      const { act, est } = result;
      triggerNotification(`Acte ${act.reference_number} validé. Lancement de l'impression officielle A4...`, 'success');

      // Prepare data for PrintModal
      const printPayload = {
        ...est,
        ...act,
        reference_number: act.reference_number,
        receipt_reference: act.reference_number,
        establishment_name: act.establishment_name,
        promoter_name: act.promoter_name,
        arrondissement: act.arrondissement,
        address: act.address,
        activity_type: activityType,
        activity_code: activityCode,
        amount_paid: amountPaid,
        date_emission: act.date_emission,
        delai_huitaine_date: act.delai_huitaine_date,
        motif: act.motif,
        signataire_nom: act.signataire_nom,
        signataire_titre: act.signataire_titre,
        agent_notificateur: act.agent_notificateur
      };

      setPrintDoc({
        isOpen: true,
        type: config.printDocType,
        title: `${config.title} - ${act.establishment_name}`,
        data: printPayload
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden my-auto">
          {/* Header Banner */}
          <div className={`bg-gradient-to-r ${config.headerGradient} text-white p-5 shrink-0 relative shadow-md`}>
            <RepublicTricolorBar className="absolute top-0 left-0 right-0 h-1.5" />
            <div className="flex items-start justify-between gap-4 mt-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-amber-300 flex items-center justify-center shadow-inner shrink-0 border border-white/20">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono-ref font-black uppercase text-amber-300 tracking-wider block">
                      RÉDACTION INDIVIDUELLE D'ACTE OFFICIEL
                    </span>
                    <span className={`text-[9px] font-mono-ref px-2 py-0.2 rounded-full font-bold uppercase ${config.badgeBg} ${config.badgeText}`}>
                      {config.badgeLabel}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-republic tracking-tight">
                    {config.title}
                  </h2>
                  <p className="text-xs text-slate-200 mt-0.5 max-w-2xl">
                    {config.natureLabel}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Form Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Guide d'utilisation rapide en 3 étapes faciles */}
            <div className="bg-gradient-to-r from-blue-50 via-emerald-50 to-blue-50 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-800 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-[#022448] dark:text-emerald-300">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">1</span>
                <span>Sélectionnez l'établissement ci-dessous</span>
              </div>
              <div className="hidden md:block text-slate-400 font-bold">➔</div>
              <div className="flex items-center gap-2 font-bold text-[#022448] dark:text-amber-300">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">2</span>
                <span>Les informations sont déjà pré-remplies</span>
              </div>
              <div className="hidden md:block text-slate-400 font-bold">➔</div>
              <div className="flex items-center gap-2 font-bold text-[#022448] dark:text-emerald-300">
                <span className="w-6 h-6 rounded-full bg-[#006d2f] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">3</span>
                <span>Cliquez sur « Enregistrer & Imprimer »</span>
              </div>
            </div>

            {/* 1. SELECTION ÉTABLISSEMENT PAR LISTE DÉROULANTE (Strictement depuis la DB) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-black uppercase text-[#022448] dark:text-amber-300 flex items-center gap-2 font-mono-ref">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>1. Sélectionner l'Établissement Destinataire dans la Base de Données :</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {establishments.some(e => /^EST-PN-0(0[1-9]|1[0-9]|2[0-5])$/.test(e.id)) && (
                    <button
                      type="button"
                      onClick={() => {
                        const count = storageService.clearDemoEstablishments();
                        setEstablishments(storageService.getEstablishments());
                        triggerNotification(`${count} exemples fictifs supprimés. Seuls vos vrais établissements sont conservés.`, 'info');
                      }}
                      className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:text-red-800 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                      title="Supprimer les 25 établissements fictifs de démonstration"
                    >
                      🗑️ Vider les 25 exemples fictifs
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCreateNewToggle}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
                      isAddingNew
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isAddingNew ? 'Revenir au menu déroulant' : '+ Saisie rapide d’un établissement'}</span>
                  </button>
                </div>
              </div>

              {!isAddingNew ? (
                <div className="space-y-2">
                  {/* Select Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedEstId}
                      onChange={e => setSelectedEstId(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border-2 border-emerald-600 dark:border-emerald-500 rounded-xl text-sm font-bold text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                    >
                      <option value="" disabled>
                        -- Choisissez un établissement dans la liste ({establishments.length} enregistrés) --
                      </option>
                      {filteredEstablishments.map(est => (
                        <option key={est.id} value={est.id}>
                          {est.name} — {est.promoter_name} ({est.arrondissement} • {est.quartier || 'Centre-Ville'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Search Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Rechercher par nom d'établissement, promoteur, arrondissement ou quartier..."
                        value={filterSearch}
                        onChange={e => setFilterSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    {filterSearch && (
                      <button
                        type="button"
                        onClick={() => setFilterSearch('')}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded cursor-pointer"
                      >
                        Effacer
                      </button>
                    )}
                    <span className="text-[11px] text-slate-500 font-mono-ref shrink-0">
                      {filteredEstablishments.length} / {establishments.length}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-amber-700" />
                    Enregistrement d'un nouvel établissement dans la base officielle :
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Renseignez les champs ci-dessous. Dès validation, l'établissement sera définitivement stocké dans la base de données officielle de la DDL Pointe-Noire (sans donnée fictive).
                  </p>
                </div>
              )}
            </div>

            {/* 2. INFORMATIONS PRÉ-REMPLIES DE L'ÉTABLISSEMENT */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase text-[#022448] dark:text-white flex items-center gap-2 font-mono-ref">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>2. Coordonnées Officielles de l'Établissement (Pré-remplies) :</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nom de l'Établissement *
                  </label>
                  <input
                    type="text"
                    value={establishmentName}
                    onChange={e => setEstablishmentName(e.target.value)}
                    required
                    placeholder="Ex: Le Kactus Club, Atlantic Palace..."
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Promoteur / Exploitant / Gérant *
                  </label>
                  <input
                    type="text"
                    value={promoterName}
                    onChange={e => setPromoterName(e.target.value)}
                    required
                    placeholder="Ex: Alain MPOUELE..."
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Arrondissement de Pointe-Noire
                  </label>
                  <select
                    value={arrondissement}
                    onChange={e => setArrondissement(e.target.value as ArrondissementCode)}
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    {TERRITORIAL_REFERENTIAL.map(arr => (
                      <option key={arr.code} value={arr.code}>
                        {arr.number} - {arr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Quartier / Repère
                  </label>
                  <input
                    type="text"
                    value={quartier}
                    onChange={e => setQuartier(e.target.value)}
                    placeholder="Ex: Centre-Ville, Côte Sauvage, Mpita..."
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Adresse Complète In Situ
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Ex: Avenue Charles de Gaulle, face Port Autonome..."
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Type d'Activité / Catégorie de Loisirs
                  </label>
                  <select
                    value={activityCode}
                    onChange={e => {
                      const match = ACTIVITY_CATEGORIES.find(c => c.code === e.target.value);
                      setActivityCode(e.target.value);
                      if (match) setActivityType(match.label);
                    }}
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    {ACTIVITY_CATEGORIES.map(cat => (
                      <option key={cat.code} value={cat.code}>
                        [{cat.code}] {cat.label} ({cat.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. PARAMÈTRES RÉGLEMENTAIRES DE L'ACTE (DÉJÀ BIEN PRÉ-REMPLIS) */}
            <div className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 ${config.accentBorder} space-y-3 shadow-xs`}>
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-black uppercase text-[#022448] dark:text-white flex items-center gap-2 font-mono-ref">
                  <IconComponent className="w-4 h-4 text-amber-500" />
                  <span>3. Dispositions Réglementaires & Motifs de l'Acte (Pré-remplis) :</span>
                </h4>
                <span className="text-[10px] font-mono-ref font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                  RÉF : {referenceNumber}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Numéro de Référence Officiel
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    required
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono-ref font-black text-[#022448] dark:text-amber-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Délai d'Exécution / Échéance Réglementaire
                  </label>
                  <input
                    type="text"
                    value={delai}
                    onChange={e => setDelai(e.target.value)}
                    required
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Motif Légal & Exposé des Faits (Conforme aux Lois de la République) *
                  </label>
                  <textarea
                    rows={3}
                    value={motif}
                    onChange={e => setMotif(e.target.value)}
                    required
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-sans text-xs text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Autorité Signataire
                  </label>
                  <input
                    type="text"
                    value={signataireNom}
                    onChange={e => setSignataireNom(e.target.value)}
                    required
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">{signataireTitre}</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Agent Notificateur Assermenté
                  </label>
                  <input
                    type="text"
                    value={agentNotificateur}
                    onChange={e => setAgentNotificateur(e.target.value)}
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Visas légaux affichés */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-1 font-mono-ref text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <span className="font-bold uppercase text-slate-800 dark:text-slate-200 block text-[9.5px]">
                  Textes Juridiques & Visas de la République Appliqués :
                </span>
                {config.visas.map((v, idx) => (
                  <p key={idx}>• {v}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
            >
              Fermer sans enregistrer
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveToDb}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Enregistrer dans la Base</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndPrint}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#006d2f] hover:bg-[#005a26] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md hover:shadow-lg"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Enregistrer & Imprimer A4</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Print Modal */}
      {printDoc.isOpen && (
        <PrintModal
          isOpen={printDoc.isOpen}
          onClose={() => setPrintDoc(prev => ({ ...prev, isOpen: false }))}
          documentType={printDoc.type}
          title={printDoc.title}
          data={printDoc.data}
        />
      )}
    </>
  );
};
