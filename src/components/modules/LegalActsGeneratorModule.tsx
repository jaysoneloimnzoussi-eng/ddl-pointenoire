import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  ShieldAlert,
  Printer,
  Plus,
  Building2,
  Calendar,
  UserCheck,
  Scale,
  CheckCircle2,
  Lock,
  Key,
  ShieldCheck,
  Search,
  Check,
  Sparkles,
  FileText,
  BadgeCheck,
  RefreshCw,
  Hash,
  Download
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { OfficialLegalAct, Establishment, AuditLogEntry, StateDigitalSignature } from '../../types';
import { formatDateFR } from '../../utils/dateUtils';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { IndividualActEditorModal, IndividualActType } from './IndividualActEditorModal';

export const LegalActsGeneratorModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [activeTab, setActiveTab] = useState<'ATELIER_ACTES' | 'SIGNATURE_ELECTRONIQUE' | 'PISTE_AUDIT_IGE'>('ATELIER_ACTES');

  const [acts, setActs] = useState<OfficialLegalAct[]>(() => storageService.getActs());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => storageService.getAuditLogs());
  const establishments = storageService.getEstablishments();
  const signatories = useMemo(() => storageService.getOfficialSignatories(), []);

  // Individual Act Editor Modal State
  const [individualModal, setIndividualModal] = useState<{
    isOpen: boolean;
    actType: IndividualActType;
    preselectedEstId?: string;
  }>({
    isOpen: false,
    actType: 'MISE_EN_DEMEURE'
  });

  const openIndividualAct = (actType: IndividualActType, estId?: string) => {
    setIndividualModal({
      isOpen: true,
      actType,
      preselectedEstId: estId
    });
  };

  // Filter & Search Audit
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditVerificationStatus, setAuditVerificationStatus] = useState<{
    tested: boolean;
    valid: boolean;
    count: number;
  }>({
    tested: false,
    valid: true,
    count: 0
  });

  // Generator form modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [targetEstId, setTargetEstId] = useState<string>(establishments[0]?.id || '');
  const [actType, setActType] = useState<OfficialLegalAct['type']>('MISE_EN_DEMEURE');
  const [delai, setDelai] = useState<string>('72 heures ouvrées (sous huitaine)');
  const [motif, setMotif] = useState<string>(
    'Exploitation sans agrément officiel préalable, défaut de constitution du dossier administratif et non-versement des redevances d’État.'
  );

  // Digital Signature Action Modal
  const [signingModal, setSigningModal] = useState<{
    isOpen: boolean;
    act: OfficialLegalAct | null;
    selectedSignatory: StateDigitalSignature;
    isSigning: boolean;
    completed: boolean;
  }>({
    isOpen: false,
    act: null,
    selectedSignatory: signatories[0],
    isSigning: false,
    completed: false
  });

  const handleTypeChange = (newType: OfficialLegalAct['type']) => {
    setActType(newType);
    if (newType === 'MISE_EN_DEMEURE') {
      setDelai('72 heures ouvrées (sous huitaine)');
      setMotif('Exploitation sans agrément officiel préalable, défaut de constitution du dossier administratif et non-versement des redevances d’État.');
    } else if (newType === 'CONVOCATION') {
      setDelai('Mardi 6 octobre 2026 à 10h00');
      setMotif('Comparution contradictoire obligatoire en vue de l\'instruction du dossier d\'agrément et de la régularisation fiscale et administrative.');
    } else if (newType === 'ARRETE_FERMETURE') {
      setDelai('Exécution immédiate à notification');
      setMotif('Non-respect réitéré de la mise en demeure sous 72h, exercice illicite d\'activités de loisirs et défaut d\'agrément officiel.');
    } else if (newType === 'ORDRE_MISSION') {
      setDelai('Mission de contrôle du 2 au 5 octobre 2026');
      setMotif('Contrôle contradictoire in situ de la conformité administrative, vérification des quittances et régulation du secteur des loisirs.');
    }
  };

  // Print modal
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

  const handleCreateAct = (e: React.FormEvent) => {
    e.preventDefault();
    const est = establishments.find(e => e.id === targetEstId);
    if (!est) return;

    const refNumber =
      actType === 'MISE_EN_DEMEURE'
        ? `MD-${String(acts.length + 90).padStart(3, '0')}/MCAPNIT/DGL/DDL-PN-2026`
        : actType === 'CONVOCATION'
        ? `CONV-${String(acts.length + 150).padStart(3, '0')}/DDL-PN/SAA-2026`
        : actType === 'ARRETE_FERMETURE'
        ? `ARR-FERM-${String(acts.length + 15).padStart(3, '0')}/DDL-PN-2026`
        : `OM-${String(acts.length + 40).padStart(3, '0')}/DDL-PN-2026`;

    const newAct = storageService.addAct({
      type: actType,
      reference_number: refNumber,
      establishment_id: est.id,
      establishment_name: est.name,
      promoter_name: est.promoter_name,
      arrondissement: est.arrondissement,
      address: est.address,
      date_emission: new Date().toISOString().split('T')[0],
      delai_huitaine_date: delai,
      motif,
      signataire_nom: currentUser?.role === 'DIRECTEUR' ? currentUser.name : 'Jean Richard NTSEKE NGOUAKA',
      signataire_titre: currentUser?.role === 'DIRECTEUR' ? currentUser.title : 'Directeur Départemental des Loisirs de Pointe-Noire (DDL-PN)',
      agent_notificateur: `${currentUser?.name || 'Agent SAA'} (${currentUser?.badge || 'SAA-01'})`,
      visa_lois: [
        'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo',
        'Décret N° 2021-412 du 28 octobre 2021 portant organisation de la DGL',
        'Arrêté Départemental N° 018/DDL-PN-2026 relatif aux normes acoustiques nocturnes'
      ]
    });

    storageService.logAuditEvent(
      'EMISSION_ACTE_JURIDIQUE',
      newAct.reference_number,
      `${newAct.type} - ${newAct.establishment_name}`,
      `Acte juridique émis avec délai de notification fixé à : ${newAct.delai_huitaine_date}.`,
      currentUser ? { badge: currentUser.badge, name: currentUser.name, role: currentUser.role } : undefined
    );

    setActs(storageService.getActs());
    setAuditLogs(storageService.getAuditLogs());
    setIsCreateModalOpen(false);
    triggerNotification(`Acte officiel ${refNumber} généré avec succès.`, 'success');
  };

  // Perform State Digital Signature
  const handleExecuteDigitalSignature = () => {
    if (!signingModal.act) return;
    setSigningModal(prev => ({ ...prev, isSigning: true }));

    setTimeout(() => {
      storageService.logAuditEvent(
        'SIGNATURE_ELECTRONIQUE_DIRECTEUR',
        signingModal.act!.reference_number,
        signingModal.act!.establishment_name,
        `Signature électronique qualifiée de l'État apposée par ${signingModal.selectedSignatory.signatory_name} (${signingModal.selectedSignatory.signatory_title}). Empreinte SHA-256 : ${signingModal.selectedSignatory.sha256_fingerprint}.`,
        { badge: signingModal.selectedSignatory.signatory_matricule, name: signingModal.selectedSignatory.signatory_name, role: 'SIGNATAIRE QUALIFIÉ D\'ÉTAT' }
      );

      setAuditLogs(storageService.getAuditLogs());
      setSigningModal(prev => ({ ...prev, isSigning: false, completed: true }));
      triggerNotification(`Certificat d'État apposé sur ${signingModal.act!.reference_number}.`, 'success');
    }, 1500);
  };

  // Verify Audit Chain
  const handleVerifyAuditChain = () => {
    const res = storageService.verifyAuditChainIntegrity();
    setAuditVerificationStatus({
      tested: true,
      valid: res.isValid,
      count: res.verifiedCount
    });
    if (res.isValid) {
      triggerNotification(`Chaîne d'audit 100% intègre : ${res.verifiedCount} blocs vérifiés sans altération.`, 'success');
    } else {
      triggerNotification(`Alerte altération d'intégrité détectée au bloc #${res.brokenIndex}!`, 'error');
    }
  };

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch =
        log.target_label.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        log.user_name.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        log.target_id.toLowerCase().includes(auditSearchQuery.toLowerCase());
      const matchAction = auditActionFilter === 'ALL' || log.action_type === auditActionFilter;
      return matchSearch && matchAction;
    });
  }, [auditLogs, auditSearchQuery, auditActionFilter]);

  return (
    <div className="space-y-6">
      {/* Official Header Banner */}
      <div className="bg-gradient-to-r from-[#022448] via-[#003870] to-[#006d2f] text-white p-5 sm:p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <RepublicTricolorBar className="absolute top-0 left-0 right-0 h-1.5" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono-ref">
                SÉCURITÉ JURIDIQUE & SIGNATURE ÉLECTRONIQUE QUALIFIÉE D'ÉTAT
              </span>
              <span className="text-xs text-amber-200 font-mono-ref">PTA 2026 - AXE 4</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-republic flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-amber-300" />
              <span>Atelier des Actes, Signature Certifiée & Piste d'Audit IGE</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Génération des actes administratifs (Mises en demeure sous 72h, Arrêtés de fermeture, Convocations contradictoires), apposition du <strong>Certificat Numérique d'État SHA-256</strong> et journalisation inaltérable inviolable pour l'Inspection Générale d'État (IGE).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openIndividualAct('MISE_EN_DEMEURE')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs transition transform hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Rédiger un Acte Dédié</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('ATELIER_ACTES')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'ATELIER_ACTES'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>1. Atelier des Actes & Sanctions ({acts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SIGNATURE_ELECTRONIQUE')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'SIGNATURE_ELECTRONIQUE'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          <span>2. Signature Numérique Cryptographique (Certificats d'État)</span>
        </button>

        <button
          onClick={() => setActiveTab('PISTE_AUDIT_IGE')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'PISTE_AUDIT_IGE'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. Piste d'Audit Inaltérable & Journal IGE ({auditLogs.length})</span>
        </button>
      </div>

      {/* ==============================================================
          TAB 1: ATELIER DES ACTES RÉGLEMENTAIRES
         ============================================================== */}
      {activeTab === 'ATELIER_ACTES' && (
        <div className="space-y-6">
          {/* Executive Panel of Individual Dedicated Act Buttons */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono-ref font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                    RÉDACTION INDIVIDUELLE DES ACTES
                  </span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs text-slate-500 font-medium">Boutons Dédiés Pré-remplis</span>
                </div>
                <h3 className="font-extrabold text-base text-[#022448] dark:text-white uppercase font-republic flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-500" />
                  <span>Délivrance & Notification d'Actes Juridiques par Établissement</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chaque acte juridique est accessible individuellement. Sélectionnez l'établissement par menu déroulant pour un pré-remplissage immédiat et cohérent.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-3 py-1.5 rounded-xl font-mono-ref">
                  ✓ 100% Données Base Réelle ({establishments.length} Établissements)
                </span>
              </div>
            </div>

            {/* The 6 Individual Dedicated Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 1. Attestation de Dépôt */}
              <button
                type="button"
                onClick={() => openIndividualAct('ATTESTATION_DEPOT')}
                className="flex flex-col items-start p-3.5 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/40 dark:to-slate-900 hover:border-emerald-600 hover:shadow-md transition cursor-pointer group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-110 transition">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-tight">
                  Attestation de Dépôt
                </span>
                <span className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 leading-tight mt-1 font-medium">
                  Autorisation provisoire A4
                </span>
              </button>

              {/* 2. Mise en Demeure */}
              <button
                type="button"
                onClick={() => openIndividualAct('MISE_EN_DEMEURE')}
                className="flex flex-col items-start p-3.5 rounded-2xl border-2 border-red-500/50 bg-gradient-to-b from-red-50/80 to-white dark:from-red-950/40 dark:to-slate-900 hover:border-red-600 hover:shadow-md transition cursor-pointer group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-110 transition">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-red-950 dark:text-red-200 uppercase tracking-tight">
                  Mise en Demeure (72h)
                </span>
                <span className="text-[10px] text-red-800/80 dark:text-red-300/80 leading-tight mt-1 font-medium">
                  Sommation sous huitaine
                </span>
              </button>

              {/* 3. Arrêté de Fermeture */}
              <button
                type="button"
                onClick={() => openIndividualAct('ARRETE_FERMETURE')}
                className="flex flex-col items-start p-3.5 rounded-2xl border-2 border-rose-700/50 bg-gradient-to-b from-rose-50/80 to-white dark:from-rose-950/40 dark:to-slate-900 hover:border-rose-700 hover:shadow-md transition cursor-pointer group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-[#7f1d1d] text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-110 transition">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-rose-950 dark:text-rose-200 uppercase tracking-tight">
                  Arrêté Fermeture
                </span>
                <span className="text-[10px] text-rose-800/80 dark:text-rose-300/80 leading-tight mt-1 font-medium">
                  Fermeture d'office & scellés
                </span>
              </button>

              {/* 4. Convocation SAA */}
              <button
                type="button"
                onClick={() => openIndividualAct('CONVOCATION')}
                className="flex flex-col items-start p-3.5 rounded-2xl border-2 border-purple-500/50 bg-gradient-to-b from-purple-50/80 to-white dark:from-purple-950/40 dark:to-slate-900 hover:border-purple-600 hover:shadow-md transition cursor-pointer group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-110 transition">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-purple-950 dark:text-purple-200 uppercase tracking-tight">
                  Convocation SAA
                </span>
                <span className="text-[10px] text-purple-800/80 dark:text-purple-300/80 leading-tight mt-1 font-medium">
                  Audience contradictoire
                </span>
              </button>

              {/* 5. Ordre de Mission */}
              <button
                type="button"
                onClick={() => openIndividualAct('ORDRE_MISSION')}
                className="flex flex-col items-start p-3.5 rounded-2xl border-2 border-blue-500/50 bg-gradient-to-b from-blue-50/80 to-white dark:from-blue-950/40 dark:to-slate-900 hover:border-blue-600 hover:shadow-md transition cursor-pointer group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-[#022448] text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-110 transition">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-blue-950 dark:text-blue-200 uppercase tracking-tight">
                  Ordre de Mission
                </span>
                <span className="text-[10px] text-blue-800/80 dark:text-blue-300/80 leading-tight mt-1 font-medium">
                  Contrôle in situ brigade
                </span>
              </button>

              {/* 6. PV d'Infraction */}
              <button
                type="button"
                onClick={() => openIndividualAct('PV_CONSTAT')}
                className="flex flex-col items-start p-3.5 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/40 dark:to-slate-900 hover:border-amber-600 hover:shadow-md transition cursor-pointer group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-110 transition">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-tight">
                  PV d'Infraction
                </span>
                <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80 leading-tight mt-1 font-medium">
                  Constat sonomètre & normes
                </span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500">Mises en Demeure (72h)</span>
              <span className="text-xl font-black text-amber-600 block mt-1">
                {acts.filter(a => a.type === 'MISE_EN_DEMEURE').length}
              </span>
              <span className="text-[10px] text-slate-400">Délai sous huitaine</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500">Arrêtés de Fermeture</span>
              <span className="text-xl font-black text-red-600 block mt-1">
                {acts.filter(a => a.type === 'ARRETE_FERMETURE').length}
              </span>
              <span className="text-[10px] text-slate-400">Exécution immédiate</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500">Convocations Officielles</span>
              <span className="text-xl font-black text-blue-600 block mt-1">
                {acts.filter(a => a.type === 'CONVOCATION').length}
              </span>
              <span className="text-[10px] text-slate-400">Audience contradictoire</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500">Ordres de Mission Brigade</span>
              <span className="text-xl font-black text-[#006d2f] block mt-1">
                {acts.filter(a => a.type === 'ORDRE_MISSION').length}
              </span>
              <span className="text-[10px] text-slate-400">Contrôles in situ</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-[#022448] dark:text-white uppercase font-republic">
                Registre des Actes Juridiques Notifiés ({acts.length})
              </h3>
              <span className="text-xs text-slate-500 font-mono-ref">Validité ministérielle MCAPNIT</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-ref">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b">
                    <th className="p-3">Référence & Date</th>
                    <th className="p-3">Type d'Acte</th>
                    <th className="p-3">Établissement & Promoteur</th>
                    <th className="p-3">Délai Légal Notifié</th>
                    <th className="p-3">Signataire d'État</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {acts.map(act => (
                    <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3">
                        <strong className="text-[#022448] dark:text-amber-400 block">{act.reference_number}</strong>
                        <span className="text-[10px] text-slate-400 font-sans">{formatDateFR(act.date_emission)}</span>
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          act.type === 'ARRETE_FERMETURE'
                            ? 'bg-red-100 text-red-800'
                            : act.type === 'MISE_EN_DEMEURE'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {act.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-sans">
                        <strong className="text-slate-900 dark:text-white block uppercase">{act.establishment_name}</strong>
                        <span className="text-[11px] text-slate-500">{act.promoter_name} • {act.arrondissement}</span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-bold">
                        {act.delai_huitaine_date}
                      </td>
                      <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                        {act.signataire_nom}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSigningModal({
                                isOpen: true,
                                act,
                                selectedSignatory: signatories[0],
                                isSigning: false,
                                completed: false
                              });
                            }}
                            className="bg-purple-700 hover:bg-purple-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                            title="Apposer le certificat numérique d'État"
                          >
                            <Key className="w-3 h-3" />
                            <span>Signer</span>
                          </button>

                          <button
                            onClick={() => {
                              const docType: PrintDocumentType = act.type === 'ATTESTATION_DEPOT' ? 'ATTESTATION_A4' : 'ACTE_JURIDIQUE_A4';
                              setPrintDoc({
                                isOpen: true,
                                type: docType,
                                title: `${act.type} - ${act.establishment_name}`,
                                data: act
                              });
                            }}
                            className="bg-[#022448] hover:bg-[#033468] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Imprimer A4</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: SIGNATURE NUMÉRIQUE CRYPTOGRAPHIQUE (CERTIFICAT D'ÉTAT)
         ============================================================== */}
      {activeTab === 'SIGNATURE_ELECTRONIQUE' && (
        <div className="space-y-6">
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300">
              <BadgeCheck className="w-5 h-5 text-purple-700" />
              <h4 className="text-base font-black uppercase font-republic">
                Infrastructure à Clé Publique (PKI) • État de la République du Congo
              </h4>
            </div>
            <p className="text-xs text-purple-800 dark:text-purple-300 max-w-3xl">
              Les arrêtés de fermeture, convocations et attestations bénéficient d'un scellement cryptographique qualifié conforme à la norme RFC 3161 et à la législation congolaise sur les transactions électroniques. Toute modification ultérieure brise la signature et invalide le document.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {signatories.map((sig, idx) => (
              <div
                key={sig.signatory_matricule}
                className="bg-white dark:bg-slate-900 border-2 border-purple-300 dark:border-purple-800 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-mono-ref">
                      CERTIFICAT D'ÉTAT ACTIF
                    </span>
                    <h5 className="font-black text-sm text-[#022448] dark:text-white uppercase font-republic mt-2">
                      {sig.signatory_name}
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {sig.signatory_title}
                    </p>
                  </div>
                  <OfficialRepublicLogo size="xs" showMotto={false} />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 font-mono-ref text-[10.5px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Matricule & Série PKI</span>
                    <strong>{sig.signatory_matricule} • {sig.certificate_serial}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Empreinte Numérique SHA-256</span>
                    <strong className="text-purple-700 dark:text-purple-400 text-[9.5px] break-all block">
                      {sig.sha256_fingerprint}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[9.5px] pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Validité :</span>
                    <span className="text-emerald-700 font-bold">{sig.validity}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Clé RSA-4096 Bits Scellée</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px]">
                    CONFORME
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: PISTE D'AUDIT INALTÉRABLE (INSPECTION GÉNÉRALE D'ÉTAT)
         ============================================================== */}
      {activeTab === 'PISTE_AUDIT_IGE' && (
        <div className="space-y-6">
          {/* Integrity Status Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-[#006d2f] font-mono-ref">
                CONTRÔLE D'INTÉGRITÉ DE LA CHAÎNE D'ÉVÉNEMENTS
              </span>
              <h4 className="text-base font-black text-[#022448] dark:text-white uppercase font-republic">
                Journalisation Inviolable & Piste d'Audit IGE
              </h4>
              <p className="text-xs text-slate-500 max-w-2xl">
                Chaque enregistrement est chaîné cryptographiquement au bloc précédent : <code>H(n) = SHA256(H(n-1) + Données)</code>. Aucune suppression ni altération rétroactive n'est possible sans rompre la chaîne.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyAuditChain}
                className="bg-[#006d2f] hover:bg-[#005a26] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Vérifier l'Intégrité de la Chaîne</span>
              </button>
            </div>
          </div>

          {/* Audit Verification Result if tested */}
          {auditVerificationStatus.tested && (
            <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
              auditVerificationStatus.valid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-950 dark:text-red-200'
            }`}>
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h5 className="font-black text-sm">
                  {auditVerificationStatus.valid
                    ? '✓ Intégrité Cryptographique 100% Certifiée'
                    : 'Alerte Rupture de Chaîne d\'Audit'}
                </h5>
                <p className="text-xs">
                  {auditVerificationStatus.valid
                    ? `Les ${auditVerificationStatus.count} enregistrements d'audit consécutifs ont été vérifiés sans aucune altération de hash ni falsification.`
                    : 'Une anomalie de signature a été constatée. Examen requis par l\'Inspection Générale d\'État.'}
                </p>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par acteur, établissement, action, hash SHA-256..."
                value={auditSearchQuery}
                onChange={e => setAuditSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-800 focus:outline-hidden font-mono-ref"
              />
            </div>

            <select
              value={auditActionFilter}
              onChange={e => setAuditActionFilter(e.target.value)}
              className="border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 font-semibold cursor-pointer"
            >
              <option value="ALL">Toutes les actions</option>
              <option value="ENCAISSEMENT_MOMO">Encaissement Mobile Money</option>
              <option value="SIGNATURE_ELECTRONIQUE_DIRECTEUR">Signature Électronique Directeur</option>
              <option value="EMISSION_ACTE_JURIDIQUE">Émission Acte Juridique</option>
              <option value="CONTROLE_COMMISSION_MIXTE">Contrôle Commission Mixte</option>
              <option value="PV_INFRACTION_ACOUSTIQUE">PV Infraction Acoustique</option>
              <option value="RAPPROCHEMENT_BANCAIRE">Rapprochement Bancaire</option>
            </select>
          </div>

          {/* Ledger Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-ref">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b">
                  <tr>
                    <th className="p-3">Horodatage & ID</th>
                    <th className="p-3">Type d'Événement</th>
                    <th className="p-3">Acteur Responsable</th>
                    <th className="p-3">Cible & Détails</th>
                    <th className="p-3">Empreinte Cryptographique SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3">
                        <strong className="text-[#022448] dark:text-amber-400 block">{log.id}</strong>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {log.action_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-sans">
                        <strong className="text-slate-900 dark:text-white block">{log.user_name}</strong>
                        <span className="text-[10px] text-slate-500 font-mono-ref">{log.user_badge} • {log.user_role}</span>
                      </td>
                      <td className="p-3 font-sans max-w-sm">
                        <strong className="text-[#022448] dark:text-emerald-400 block">{log.target_label}</strong>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{log.details}</p>
                      </td>
                      <td className="p-3">
                        <span className="text-[9.5px] text-purple-700 dark:text-purple-400 font-black break-all block">
                          {log.sha256_hash}
                        </span>
                        <span className="text-[8px] text-slate-400 block mt-0.5">Terminal : {log.terminal_ip}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* State Signing Modal */}
      {signingModal.isOpen && signingModal.act && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 space-y-4 border border-purple-300 dark:border-purple-900 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2 text-purple-700">
                <Lock className="w-5 h-5" />
                <h3 className="font-black text-sm uppercase font-republic">
                  Apposition du Sceau & Signature Numérique d'État
                </h3>
              </div>
              <button
                onClick={() => setSigningModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl space-y-1 font-mono-ref text-xs">
              <p>Acte ciblé : <strong>{signingModal.act.reference_number}</strong></p>
              <p>Établissement : <strong>{signingModal.act.establishment_name}</strong></p>
              <p>Promoteur : <strong>{signingModal.act.promoter_name}</strong></p>
            </div>

            <div>
              <label className="font-bold text-xs block mb-1">Sélectionner l'Autorité Signataire d'État</label>
              <select
                value={signingModal.selectedSignatory.signatory_matricule}
                onChange={e => {
                  const match = signatories.find(s => s.signatory_matricule === e.target.value);
                  if (match) setSigningModal(prev => ({ ...prev, selectedSignatory: match }));
                }}
                className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                {signatories.map(s => (
                  <option key={s.signatory_matricule} value={s.signatory_matricule}>
                    {s.signatory_name} — {s.signatory_title}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 font-mono-ref text-[10.5px]">
              <p className="text-slate-500 uppercase text-[9px]">Empreinte SHA-256 du Certificat</p>
              <p className="font-bold text-purple-700 dark:text-purple-400 break-all">{signingModal.selectedSignatory.sha256_fingerprint}</p>
              <p className="text-[9px] text-slate-400 pt-1">Horodatage certifié RFC 3161 actif</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSigningModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border rounded-xl font-bold text-xs cursor-pointer"
              >
                Fermer
              </button>

              <button
                type="button"
                disabled={signingModal.isSigning || signingModal.completed}
                onClick={handleExecuteDigitalSignature}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {signingModal.isSigning ? (
                  <span>Signature cryptographique en cours...</span>
                ) : signingModal.completed ? (
                  <span>✓ Signé avec Succès</span>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Apposer le Certificat d'État</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Individual Act Editor Modal */}
      {individualModal.isOpen && (
        <IndividualActEditorModal
          isOpen={individualModal.isOpen}
          onClose={() => setIndividualModal(prev => ({ ...prev, isOpen: false }))}
          actType={individualModal.actType}
          preselectedEstId={individualModal.preselectedEstId}
          onActSaved={() => {
            setActs(storageService.getActs());
            setAuditLogs(storageService.getAuditLogs());
          }}
        />
      )}

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
    </div>
  );
};
