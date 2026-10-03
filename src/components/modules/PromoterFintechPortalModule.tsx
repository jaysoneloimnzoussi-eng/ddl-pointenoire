import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  CreditCard,
  Building2,
  FileCheck2,
  Award,
  CheckCircle2,
  Printer,
  ExternalLink,
  ShieldCheck,
  Search,
  Upload,
  FileText,
  Clock,
  Landmark,
  Plus,
  RefreshCw,
  QrCode,
  Check,
  FileUp,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import {
  Establishment,
  MobileMoneyPaymentSession,
  PromoterOnlineSubmission,
  BankReconciliationRecord,
  ArrondissementCode,
  RegimeType
} from '../../types';
import { PrintModal } from '../print/PrintModal';
import { OfficialRepublicLogo, RepublicTricolorBar, RepublicQrCode } from '../common/OfficialSeal';
import { PublicVerificationView } from '../common/PublicVerificationView';
import { formatDateFR } from '../../utils/dateUtils';
import { ACTIVITY_CATEGORIES, TERRITORIAL_REFERENTIAL } from '../../constants/referential';

export const PromoterFintechPortalModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [activeTab, setActiveTab] = useState<'TELEPAIEMENT' | 'RAPPROCHEMENT' | 'TELEDECLARATION' | 'MACARONS'>('TELEPAIEMENT');

  const [establishments, setEstablishments] = useState<Establishment[]>(() => storageService.getEstablishments());
  const [momoSessions, setMomoSessions] = useState<MobileMoneyPaymentSession[]>(() => storageService.getMomoSessions());
  const [submissions, setSubmissions] = useState<PromoterOnlineSubmission[]>(() => storageService.getOnlineSubmissions());
  const [reconciliations, setReconciliations] = useState<BankReconciliationRecord[]>(() => storageService.getBankReconciliations());

  // --- Payment State ---
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string>(() => establishments[0]?.id || '');
  const [momoOperator, setMomoOperator] = useState<'MTN Mobile Money' | 'Airtel Money'>('MTN Mobile Money');
  const [momoPhoneNumber, setMomoPhoneNumber] = useState<string>('+242 06 654 32 10');
  const selectedEst = useMemo(() => establishments.find(e => e.id === selectedEstablishmentId), [establishments, selectedEstablishmentId]);
  const [payAmount, setPayAmount] = useState<number>(() => (selectedEst?.balance_due || 50000));
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [ussdCountdown, setUssdCountdown] = useState<number>(0);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    session: MobileMoneyPaymentSession;
    payment: any;
  } | null>(null);

  // --- Rapprochement Bancaire State ---
  const [isReconModalOpen, setIsReconModalOpen] = useState(false);
  const [reconBank, setReconBank] = useState<BankReconciliationRecord['bank_name']>('Banque des États de l’Afrique Centrale (BEAC)');
  const [reconAccount, setReconAccount] = useState('CG02-BEAC-10001-094821');
  const [reconAmount, setReconAmount] = useState<number>(1500000);
  const [reconNotes, setReconNotes] = useState('Pointage quotidien avec extrait de compte central du Trésor.');

  // --- Submission State (Guichet Unique) ---
  const [subEstName, setSubEstName] = useState('');
  const [subPromoterName, setSubPromoterName] = useState('');
  const [subPhone, setSubPhone] = useState('+242 06 ');
  const [subEmail, setSubEmail] = useState('');
  const [subArrondissement, setSubArrondissement] = useState<ArrondissementCode>('1_LUMUMBA');
  const [subQuartier, setSubQuartier] = useState('Centre-Ville');
  const [subAddress, setSubAddress] = useState('');
  const [subActivity, setSubActivity] = useState('BAR_DANCING');
  const [subRegime, setSubRegime] = useState<RegimeType>('INFORMEL');
  const [subSurface, setSubSurface] = useState<number>(60);
  const [uploadedFiles, setUploadedFiles] = useState<{
    cni: boolean;
    bail: boolean;
    rccm: boolean;
    plan: boolean;
  }>({
    cni: false,
    bail: false,
    rccm: false,
    plan: false
  });

  // Tracking search
  const [trackingSearchCode, setTrackingSearchCode] = useState<string>('');
  const [selectedTrackedSubmission, setSelectedTrackedSubmission] = useState<PromoterOnlineSubmission | null>(null);

  // Public Verification Modal
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    ref: string;
    etab: string;
    date: string;
  }>({
    isOpen: false,
    ref: '',
    etab: '',
    date: ''
  });

  // Print modal
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: 'RECU_TELEPAIEMENT_MOMO_A4' | 'MACARON_OFFICIEL_VITRINE_A4' | 'BORDEREAU_RAPPROCHEMENT_A4';
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'RECU_TELEPAIEMENT_MOMO_A4',
    title: '',
    data: null
  });

  // Calculate estimated fee for submission
  const estimatedSubmissionFee = useMemo(() => {
    if (subRegime === 'INFORMEL') return 50000;
    const cat = ACTIVITY_CATEGORIES.find(c => c.code === subActivity);
    const rate = cat?.rate_per_sqm_fcfa || 500;
    const base = cat?.base_fixed_fee_fcfa || 80000;
    return base + (rate * subSurface);
  }, [subRegime, subActivity, subSurface]);

  // Handle Mobile Money Payment Trigger with simulated Push USSD prompt
  const handleTriggerMomo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEst || payAmount <= 0) {
      triggerNotification('Veuillez sélectionner un établissement et un montant valide.', 'error');
      return;
    }

    setIsProcessingPayment(true);
    setUssdCountdown(3);

    const interval = setInterval(() => {
      setUssdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          try {
            const result = storageService.recordMomoPayment({
              establishment_id: selectedEst.id,
              operator: momoOperator,
              phone_number: momoPhoneNumber,
              amount_fcfa: Number(payAmount)
            });

            setEstablishments(storageService.getEstablishments());
            setMomoSessions(storageService.getMomoSessions());
            setIsProcessingPayment(false);
            setPaymentSuccessData(result);
            triggerNotification(`Paiement de ${Number(payAmount).toLocaleString('fr-FR')} FCFA validé via ${momoOperator}.`, 'success');
          } catch (err: any) {
            setIsProcessingPayment(false);
            triggerNotification(`Erreur lors du paiement : ${err.message}`, 'error');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle Bank Reconciliation Creation
  const handleCreateReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    const treasuryShare = Math.round(reconAmount * 0.7);
    const regieShare = Math.round(reconAmount * 0.3);
    const count = Math.max(1, Math.round(reconAmount / 50000));

    const newRecord = storageService.createBankReconciliation({
      reference_bordereau: `BORD-${Date.now().toString().slice(-6)}`,
      date_reconciliation: new Date().toISOString().split('T')[0],
      bank_name: reconBank,
      bank_account_number: reconAccount,
      treasury_deposit_amount_fcfa: treasuryShare,
      regie_deposit_amount_fcfa: regieShare,
      total_reconciled_fcfa: Number(reconAmount),
      matching_receipts_count: count,
      reconciliation_status: 'RAPPROCHE',
      variance_fcfa: 0,
      agent_approbateur: currentUser?.name || 'Patrick MBOUSSI (Régisseur SAF / Trésor)',
      notes: reconNotes
    });

    setReconciliations(storageService.getBankReconciliations());
    setIsReconModalOpen(false);
    triggerNotification(`Bordereau de rapprochement ${newRecord.reference_bordereau} validé sans écart.`, 'success');
  };

  // Handle Online Submission
  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEstName || !subPromoterName) {
      triggerNotification('Veuillez remplir les champs obligatoires.', 'error');
      return;
    }

    const sub = storageService.createOnlineSubmission({
      establishment_name: subEstName,
      promoter_name: subPromoterName,
      phone: subPhone,
      email: subEmail,
      arrondissement: subArrondissement,
      quartier: subQuartier,
      address: subAddress,
      activity_code: subActivity,
      regime_type: subRegime,
      surface_m2: subSurface,
      estimated_fee: estimatedSubmissionFee,
      notes: `Télédéclaration en ligne soumise le ${formatDateFR(new Date())}. Pièces justificatives téléversées : ${Object.values(uploadedFiles).filter(Boolean).length}/4.`,
      uploaded_documents: {
        identity_card: uploadedFiles.cni ? 'CNI_NIU_VALIDE.pdf' : undefined,
        bail_commercial: uploadedFiles.bail ? 'BAIL_COMMERCIAL_NOTARIE.pdf' : undefined,
        rccm: uploadedFiles.rccm ? 'RCCM_POINTE_NOIRE.pdf' : undefined,
        plan_masse: uploadedFiles.plan ? 'PLAN_MASSE_ACOUSTIQUE.pdf' : undefined
      }
    });

    setSubmissions(storageService.getOnlineSubmissions());
    setSelectedTrackedSubmission(sub);
    triggerNotification(`Dossier ${sub.tracking_code} enregistré au Guichet Unique avec succès.`, 'success');

    // Reset form
    setSubEstName('');
    setSubPromoterName('');
    setSubAddress('');
    setUploadedFiles({ cni: false, bail: false, rccm: false, plan: false });
  };

  // Search submission tracking
  const handleSearchTracking = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackingSearchCode.trim().toUpperCase();
    if (!query) return;
    const match = submissions.find(
      s => s.tracking_code.toUpperCase().includes(query) || s.establishment_name.toUpperCase().includes(query)
    );
    if (match) {
      setSelectedTrackedSubmission(match);
      triggerNotification(`Dossier trouvé : ${match.establishment_name}`, 'success');
    } else {
      triggerNotification('Aucun dossier trouvé avec ce code de suivi.', 'warning');
    }
  };

  // Fully compliant establishments for Macarons
  const regularizedEstablishments = useMemo(() => {
    return establishments.filter(e => e.amount_paid > 0 && e.balance_due === 0);
  }, [establishments]);

  // Statistics
  const totalMomoCollected = momoSessions.reduce((acc, curr) => acc + (curr.amount_fcfa || 0), 0);
  const totalTreasuryReconciled = reconciliations.reduce((acc, curr) => acc + (curr.treasury_deposit_amount_fcfa || 0), 0);
  const totalRegieReconciled = reconciliations.reduce((acc, curr) => acc + (curr.regie_deposit_amount_fcfa || 0), 0);

  return (
    <div className="space-y-6">
      {/* Official Header Banner */}
      <div className="bg-gradient-to-r from-[#022448] via-[#003870] to-[#006d2f] text-white p-5 sm:p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <RepublicTricolorBar className="absolute top-0 left-0 right-0 h-1.5" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono-ref">
                FINTECH D'ÉTAT & GUICHET UNIQUE GOUVERNEMENTAL
              </span>
              <span className="text-xs text-amber-200 font-mono-ref">PTA 2026 - AXES 1 & 2</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-republic flex items-center gap-2.5">
              <Smartphone className="w-6 h-6 text-amber-300" />
              <span>Fintech Mobile Money, Rapprochement Bancaire & Guichet Unique</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Modernisation financière de la Direction Départementale des Loisirs de Pointe-Noire : encaissements dématérialisés direct <strong>MTN MoMo & Airtel Money</strong>, répartition 70% Trésor / 30% Régie, pointage quotidien BEAC/BCA/LCB, télédéclaration d'agrément et macarons officiels vérifiables.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 rounded-xl text-right font-mono-ref shrink-0">
            <span className="text-[10px] uppercase text-amber-300 font-bold block">Télécollecte Validée MoMo</span>
            <span className="text-xl font-black text-white">{totalMomoCollected.toLocaleString('fr-FR')} FCFA</span>
            <span className="text-[9px] text-emerald-300 block">70% Trésor : {Math.round(totalMomoCollected * 0.7).toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('TELEPAIEMENT')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'TELEPAIEMENT'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>1. Télépaiement MoMo & QR Code</span>
          <span className="bg-amber-100 text-amber-950 font-mono-ref px-1.5 py-0.2 rounded text-[9px] font-bold">
            {momoSessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('RAPPROCHEMENT')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'RAPPROCHEMENT'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>2. Rapprochement Bancaire (BEAC/Trésor)</span>
          <span className="bg-emerald-100 text-emerald-950 font-mono-ref px-1.5 py-0.2 rounded text-[9px] font-bold">
            {reconciliations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TELEDECLARATION')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'TELEDECLARATION'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>3. Guichet Unique & Télédéclaration</span>
          <span className="bg-blue-100 text-blue-900 font-mono-ref px-1.5 py-0.2 rounded text-[9px] font-bold">
            {submissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('MACARONS')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'MACARONS'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>4. Macarons Républicains ({regularizedEstablishments.length})</span>
        </button>
      </div>

      {/* ==============================================================
          TAB 1: TÉLÉPAIEMENT MOBILE MONEY
         ============================================================== */}
      {activeTab === 'TELEPAIEMENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Payment Terminal Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-black uppercase text-[#006d2f] font-mono-ref">TERMINAL DE PAIEMENT SÉCURISÉ IN SITU</span>
              <h3 className="text-base font-black text-[#022448] dark:text-white uppercase font-republic">
                Zéro Manipulation d'Espèces sur le Terrain
              </h3>
            </div>

            <form onSubmit={handleTriggerMomo} className="space-y-4 text-xs">
              {/* Select Operator */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  1. Sélectionner l'Opérateur Télécom Congo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMomoOperator('MTN Mobile Money');
                      setMomoPhoneNumber('+242 06 654 32 10');
                    }}
                    className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      momoOperator === 'MTN Mobile Money'
                        ? 'border-amber-400 bg-amber-50 text-slate-950 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                      M
                    </div>
                    <span>MTN MoMo (*105#)</span>
                    <span className="text-[9px] text-slate-500">Marchand DDL-PN-TRESOR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMomoOperator('Airtel Money');
                      setMomoPhoneNumber('+242 05 512 88 44');
                    }}
                    className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      momoOperator === 'Airtel Money'
                        ? 'border-red-500 bg-red-50 text-red-950 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-xs">
                      A
                    </div>
                    <span>Airtel Money (*128#)</span>
                    <span className="text-[9px] text-slate-500">Marchand DDL-PN-TRESOR</span>
                  </button>
                </div>
              </div>

              {/* Select Establishment */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  2. Établissement Débiteur & Solde Restant
                </label>
                <select
                  value={selectedEstablishmentId}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedEstablishmentId(id);
                    const matched = establishments.find(x => x.id === id);
                    if (matched) {
                      setPayAmount(matched.balance_due > 0 ? matched.balance_due : 25000);
                      if (matched.phone) {
                        setMomoPhoneNumber(matched.phone);
                      }
                    }
                  }}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  required
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} — Solde restant : {est.balance_due.toLocaleString('fr-FR')} FCFA ({est.promoter_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone number */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  3. N° Mobile du Promoteur ({momoOperator})
                </label>
                <input
                  type="text"
                  value={momoPhoneNumber}
                  onChange={e => setMomoPhoneNumber(e.target.value)}
                  className="w-full border p-2.5 rounded-xl font-mono-ref font-bold text-sm bg-slate-50 dark:bg-slate-800"
                  placeholder="+242 06 123 45 67"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    4. Montant à Télé-encaisser (FCFA)
                  </label>
                  {selectedEst && (
                    <span className="text-[10px] text-slate-500 font-mono-ref">
                      Solde dû : {selectedEst.balance_due.toLocaleString('fr-FR')} FCFA
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full border p-2.5 rounded-xl font-mono-ref font-black text-base text-[#006d2f] bg-slate-50 dark:bg-slate-800"
                  required
                />

                {/* 70/30 Distribution Visualizer */}
                <div className="mt-2 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10.5px] space-y-1">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Part Trésor Public (70%) :</span>
                    <strong className="text-[#022448] dark:text-white font-mono-ref">
                      {Math.round(payAmount * 0.7).toLocaleString('fr-FR')} FCFA
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Part Régie DDL-PN (30%) :</span>
                    <strong className="text-[#006d2f] font-mono-ref">
                      {Math.round(payAmount * 0.3).toLocaleString('fr-FR')} FCFA
                    </strong>
                  </div>
                </div>
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={isProcessingPayment}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                  momoOperator === 'MTN Mobile Money'
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {isProcessingPayment ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Invite USSD Push envoyée sur le mobile ({ussdCountdown}s)...</span>
                  </span>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Lancer le Push USSD & Débiter le Téléphone</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Dynamic QR Code & Transaction History */}
          <div className="lg:col-span-7 space-y-5">
            {/* Dynamic QR Code Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006d2f] font-mono-ref">
                  SCAN DE PAIEMENT INSTANTANÉ IN SITU
                </span>
                <h4 className="text-base font-black text-[#022448] dark:text-white uppercase font-republic">
                  QR Code Dynamique de Paiement
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Le tenancier scanne ce code avec son application mobile <strong>MTN MoMo</strong> ou <strong>Airtel Money</strong> pour déclencher le virement sécurisé vers le compte Trésor.
                </p>
                <div className="pt-1 text-xs font-mono-ref font-bold text-[#006d2f]">
                  Montant encodé : {Number(payAmount).toLocaleString('fr-FR')} FCFA • Code : {momoOperator === 'MTN Mobile Money' ? '*105*1*066543210#' : '*128*1*055128844#'}
                </div>
              </div>

              <div className="p-3 bg-white border-2 border-dashed border-[#006d2f] rounded-2xl shadow-sm shrink-0 text-center">
                <RepublicQrCode
                  payload={{
                    type: 'MOMO_DIRECT_PAY',
                    operator: momoOperator,
                    establishment: selectedEst?.name,
                    amount: payAmount,
                    phone: momoPhoneNumber,
                    ussd: momoOperator === 'MTN Mobile Money' ? `*105*1*${payAmount}#` : `*128*1*${payAmount}#`
                  }}
                  size={105}
                  showDetails={false}
                />
                <span className="text-[9px] font-mono-ref font-bold text-slate-600 mt-1 block">
                  {momoOperator === 'MTN Mobile Money' ? 'MoMo Pay Congo' : 'Airtel Pay Congo'}
                </span>
              </div>
            </div>

            {/* Last Success Banner if any */}
            {paymentSuccessData && (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-black text-emerald-950 dark:text-emerald-200 text-sm">
                      Télécollecte Réussie : {paymentSuccessData.session.receipt_number}
                    </h5>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                      Réf : {paymentSuccessData.session.transaction_ref} • {paymentSuccessData.session.amount_fcfa.toLocaleString('fr-FR')} FCFA versés.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPrintDoc({
                      isOpen: true,
                      type: 'RECU_TELEPAIEMENT_MOMO_A4',
                      title: `Quittance Télépaiement - ${paymentSuccessData.session.receipt_number}`,
                      data: paymentSuccessData.session
                    });
                  }}
                  className="bg-[#006d2f] hover:bg-[#005a26] text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer Quittance A4</span>
                </button>
              </div>
            )}

            {/* Recent MoMo Sessions Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-black text-[#022448] dark:text-white uppercase font-republic">
                  Journal des Télécollectes Récentes
                </h4>
                <span className="text-[10px] text-slate-500 font-mono-ref">
                  {momoSessions.length} transactions enregistrées
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold">
                      <th className="pb-2">Quittance & Transaction</th>
                      <th className="pb-2">Établissement & Opérateur</th>
                      <th className="pb-2">Montant</th>
                      <th className="pb-2">Répartition (70/30)</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono-ref">
                    {momoSessions.map(session => (
                      <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5">
                          <span className="font-bold text-[#022448] dark:text-amber-400 block">{session.receipt_number}</span>
                          <span className="text-[10px] text-slate-400">{session.transaction_ref}</span>
                        </td>
                        <td className="py-2.5 font-sans">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{session.establishment_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono-ref">{session.operator} • {session.phone_number}</span>
                        </td>
                        <td className="py-2.5 font-bold text-emerald-700 dark:text-emerald-400">
                          {session.amount_fcfa.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="py-2.5 text-[10.5px]">
                          <span className="text-[#022448] dark:text-blue-300 block">Trésor : {session.treasury_share_70.toLocaleString('fr-FR')}</span>
                          <span className="text-[#006d2f] dark:text-emerald-300 block">Régie : {session.regie_share_30.toLocaleString('fr-FR')}</span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => {
                              setPrintDoc({
                                isOpen: true,
                                type: 'RECU_TELEPAIEMENT_MOMO_A4',
                                title: `Quittance Télépaiement - ${session.receipt_number}`,
                                data: session
                              });
                            }}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer transition"
                            title="Imprimer l'attestation officielle de paiement dématérialisé"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: RAPPROCHEMENT BANCAIRE (AXE 1)
         ============================================================== */}
      {activeTab === 'RAPPROCHEMENT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Rapproché Trésor / SAF</span>
              <span className="text-xl font-black text-[#022448] dark:text-amber-400 font-mono-ref">
                {(totalTreasuryReconciled + totalRegieReconciled).toLocaleString('fr-FR')} FCFA
              </span>
              <span className="text-[10px] text-emerald-600 block mt-1">100% rapproché sans écart</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Quote-Part Trésor Public (70%)</span>
              <span className="text-xl font-black text-blue-700 dark:text-blue-400 font-mono-ref">
                {totalTreasuryReconciled.toLocaleString('fr-FR')} FCFA
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Compte Central Trésor Brazzaville</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Quote-Part Régie DDL-PN (30%)</span>
              <span className="text-xl font-black text-[#006d2f] dark:text-emerald-400 font-mono-ref">
                {totalRegieReconciled.toLocaleString('fr-FR')} FCFA
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Frais d'équipement & brigades</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Écart d'Inventaire</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono-ref">0 FCFA</span>
                <span className="text-[10px] text-emerald-600 block mt-1">Conformité BEAC / LCB</span>
              </div>
              <button
                onClick={() => setIsReconModalOpen(true)}
                className="bg-[#006d2f] hover:bg-[#005a26] text-white p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Rapprochement</span>
              </button>
            </div>
          </div>

          {/* Reconciliations Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-[#022448] dark:text-white uppercase font-republic">
                  Bordereaux Quotidiens de Rapprochement Bancaire & Trésor
                </h4>
                <p className="text-xs text-slate-500">
                  Rapprochement contradictoire entre les avis de versement émis in situ et les relevés bancaires (BEAC, BCA, LCB, Trésor Public).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-ref">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold">
                    <th className="pb-2">Réf Bordereau & Date</th>
                    <th className="pb-2">Banque Partenaire & Compte</th>
                    <th className="pb-2">Quittances Pointées</th>
                    <th className="pb-2">Part Trésor (70%)</th>
                    <th className="pb-2">Part Régie (30%)</th>
                    <th className="pb-2">Total Reconcilié</th>
                    <th className="pb-2">Statut</th>
                    <th className="pb-2 text-right">Bordereau A4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reconciliations.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3">
                        <strong className="text-[#022448] dark:text-amber-400 block">{rec.reference_bordereau}</strong>
                        <span className="text-[10px] text-slate-400 font-sans">{formatDateFR(rec.date_reconciliation)}</span>
                      </td>
                      <td className="py-3 font-sans">
                        <strong className="text-slate-800 dark:text-slate-200 block">{rec.bank_name}</strong>
                        <span className="text-[10.5px] text-slate-500 font-mono-ref">{rec.bank_account_number}</span>
                      </td>
                      <td className="py-3 font-bold text-slate-700 dark:text-slate-300">
                        {rec.matching_receipts_count} quittances
                      </td>
                      <td className="py-3 font-bold text-blue-700 dark:text-blue-400">
                        {rec.treasury_deposit_amount_fcfa.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 font-bold text-emerald-700 dark:text-emerald-400">
                        {rec.regie_deposit_amount_fcfa.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 font-black text-slate-900 dark:text-white">
                        {rec.total_reconciled_fcfa.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 font-sans">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          ✓ RAPPROCHÉ SANS ÉCART
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setPrintDoc({
                              isOpen: true,
                              type: 'BORDEREAU_RAPPROCHEMENT_A4',
                              title: `Bordereau de Rapprochement - ${rec.reference_bordereau}`,
                              data: rec
                            });
                          }}
                          className="bg-[#022448] hover:bg-[#033468] text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimer A4</span>
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

      {/* ==============================================================
          TAB 3: GUICHET UNIQUE & TÉLÉDÉCLARATION (AXE 2)
         ============================================================== */}
      {activeTab === 'TELEDECLARATION' && (
        <div className="space-y-6">
          {/* Tracker Search Bar */}
          <div className="bg-gradient-to-r from-blue-900 via-[#022448] to-slate-900 text-white p-5 rounded-2xl shadow-md">
            <div className="max-w-2xl mx-auto space-y-2 text-center">
              <span className="text-[10px] font-black uppercase text-amber-300 font-mono-ref">
                SUIVI EN LIGNE DE DOSSIER D'AGRÉMENT DDL-PN
              </span>
              <h3 className="text-lg font-black uppercase font-republic">
                Suivre l'Avancement de votre Demande d'Ouverture
              </h3>
              <form onSubmit={handleSearchTracking} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={trackingSearchCode}
                  onChange={e => setTrackingSearchCode(e.target.value)}
                  placeholder="Entrez votre N° de dossier (ex: TELE-PN-2026-4891 ou nom de l'établissement)..."
                  className="flex-1 bg-white/10 border border-white/20 px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden font-mono-ref"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Consulter le Dossier</span>
                </button>
              </form>
            </div>
          </div>

          {/* Dossier Tracker Timeline if Selected */}
          {selectedTrackedSubmission && (
            <div className="bg-white dark:bg-slate-900 border-2 border-blue-400 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[9.5px] font-mono-ref font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded uppercase">
                    DOSSIER : {selectedTrackedSubmission.tracking_code}
                  </span>
                  <h4 className="text-lg font-black text-[#022448] dark:text-white uppercase font-republic mt-1">
                    « {selectedTrackedSubmission.establishment_name} »
                  </h4>
                  <p className="text-xs text-slate-500">
                    Promoteur : <strong>{selectedTrackedSubmission.promoter_name}</strong> • {selectedTrackedSubmission.arrondissement} ({selectedTrackedSubmission.quartier})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono-ref block">Redevance Estimée</span>
                  <span className="text-base font-black text-[#006d2f] font-mono-ref">
                    {selectedTrackedSubmission.estimated_fee.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* 4-Stage Progress Visualizer */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 py-2">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 rounded-xl p-3 text-center space-y-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-black">
                    ✓
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-950 dark:text-emerald-200 block font-republic">
                    1. Guichet Unique
                  </span>
                  <p className="text-[9.5px] text-slate-500 font-mono-ref">Dépôt & Enregistrement</p>
                  <span className="text-[8.5px] text-emerald-700 font-bold block">EFFECTUÉ</span>
                </div>

                <div className={`border rounded-xl p-3 text-center space-y-1 ${
                  selectedTrackedSubmission.status !== 'EN_ATTENTE_INSTRUCTION'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-black ${
                    selectedTrackedSubmission.status !== 'EN_ATTENTE_INSTRUCTION'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {selectedTrackedSubmission.status !== 'EN_ATTENTE_INSTRUCTION' ? '✓' : '2'}
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 block font-republic">
                    2. Instruction SAA
                  </span>
                  <p className="text-[9.5px] text-slate-500 font-mono-ref">Vérification juridique</p>
                  <span className="text-[8.5px] font-bold block text-blue-700">
                    {selectedTrackedSubmission.status === 'EN_ATTENTE_INSTRUCTION' ? 'EN COURS D\'EXAMEN' : 'VALIDÉ'}
                  </span>
                </div>

                <div className={`border rounded-xl p-3 text-center space-y-1 ${
                  selectedTrackedSubmission.status === 'CONVOQUE_VISITE' || selectedTrackedSubmission.status === 'APPROUVE'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 opacity-60'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-black ${
                    selectedTrackedSubmission.status === 'APPROUVE' ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'
                  }`}>
                    {selectedTrackedSubmission.status === 'APPROUVE' ? '✓' : '3'}
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 block font-republic">
                    3. Commission Mixte
                  </span>
                  <p className="text-[9.5px] text-slate-500 font-mono-ref">Visite in situ & Sonométrie</p>
                  <span className="text-[8.5px] font-bold block text-amber-700">
                    {selectedTrackedSubmission.status === 'CONVOQUE_VISITE' ? 'VISITE PROGRAMMÉE' : selectedTrackedSubmission.status === 'APPROUVE' ? 'CONFORME' : 'EN ATTENTE'}
                  </span>
                </div>

                <div className={`border rounded-xl p-3 text-center space-y-1 ${
                  selectedTrackedSubmission.status === 'APPROUVE'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 opacity-60'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-black ${
                    selectedTrackedSubmission.status === 'APPROUVE' ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'
                  }`}>
                    {selectedTrackedSubmission.status === 'APPROUVE' ? '✓' : '4'}
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 block font-republic">
                    4. Arrêté & Macaron
                  </span>
                  <p className="text-[9.5px] text-slate-500 font-mono-ref">Homologation DGL</p>
                  <span className="text-[8.5px] font-bold block text-emerald-700">
                    {selectedTrackedSubmission.status === 'APPROUVE' ? 'AGRÉMENT DÉLIVRÉ' : 'EN ATTENTE VISITE'}
                  </span>
                </div>
              </div>

              {/* Quick Actions for Administrative Officer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Action de régulation (SAA / Direction) :
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      storageService.updateOnlineSubmissionStatus(selectedTrackedSubmission.id, 'CONVOQUE_VISITE');
                      setSubmissions(storageService.getOnlineSubmissions());
                      setSelectedTrackedSubmission(prev => prev ? { ...prev, status: 'CONVOQUE_VISITE' } : null);
                      triggerNotification('Dossier convoqué pour visite de conformité in situ.', 'success');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition"
                  >
                    Programmer Visite Commission Mixte
                  </button>
                  <button
                    onClick={() => {
                      storageService.updateOnlineSubmissionStatus(selectedTrackedSubmission.id, 'APPROUVE');
                      setSubmissions(storageService.getOnlineSubmissions());
                      setSelectedTrackedSubmission(prev => prev ? { ...prev, status: 'APPROUVE' } : null);
                      triggerNotification('Dossier homologué avec succès. Macaron officiel débloqué.', 'success');
                    }}
                    className="bg-[#006d2f] hover:bg-[#005a26] text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition"
                  >
                    Valider & Homologuer l'Établissement
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Citizen Online Declaration Form & Document Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-black uppercase text-[#006d2f] font-mono-ref">FORMULAIRE CITOYEN DE TÉLÉDÉCLARATION</span>
                <h3 className="text-base font-black text-[#022448] dark:text-white uppercase font-republic">
                  Demande d'Autorisation d'Ouverture & Agrément
                </h3>
              </div>

              <form onSubmit={handleCreateSubmission} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nom de l'Établissement de Loisirs *
                    </label>
                    <input
                      type="text"
                      value={subEstName}
                      onChange={e => setSubEstName(e.target.value)}
                      placeholder="Ex: Le Lounge Bar Mpita VIP"
                      className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nom & Prénom du Promoteur / Gérant *
                    </label>
                    <input
                      type="text"
                      value={subPromoterName}
                      onChange={e => setSubPromoterName(e.target.value)}
                      placeholder="Ex: M. Jean-Claude TCHISSAMBOU"
                      className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Téléphone de Contact Mobile Money *
                    </label>
                    <input
                      type="text"
                      value={subPhone}
                      onChange={e => setSubPhone(e.target.value)}
                      className="w-full border p-2.5 rounded-xl font-mono-ref bg-slate-50 dark:bg-slate-800 font-bold"
                      placeholder="+242 06 123 45 67"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Courriel / Email (Notification automatique)
                    </label>
                    <input
                      type="email"
                      value={subEmail}
                      onChange={e => setSubEmail(e.target.value)}
                      placeholder="promoteur@domaine.cg"
                      className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Arrondissement *
                    </label>
                    <select
                      value={subArrondissement}
                      onChange={e => {
                        const arr = e.target.value as ArrondissementCode;
                        setSubArrondissement(arr);
                        const match = TERRITORIAL_REFERENTIAL.find(r => r.code === arr);
                        if (match && match.quartiers[0]) {
                          setSubQuartier(match.quartiers[0]);
                        }
                      }}
                      className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold"
                    >
                      {TERRITORIAL_REFERENTIAL.map(r => (
                        <option key={r.code} value={r.code}>{r.official_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Quartier
                    </label>
                    <input
                      type="text"
                      value={subQuartier}
                      onChange={e => setSubQuartier(e.target.value)}
                      className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Régime Fiscale
                    </label>
                    <select
                      value={subRegime}
                      onChange={e => setSubRegime(e.target.value as RegimeType)}
                      className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold"
                    >
                      <option value="INFORMEL">INFORMEL (Forfait 50 000 FCFA)</option>
                      <option value="FORMEL">FORMEL (Barème Surface + Taxe fixe)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Adresse Précise & Repère
                  </label>
                  <input
                    type="text"
                    value={subAddress}
                    onChange={e => setSubAddress(e.target.value)}
                    placeholder="Ex: Avenue de la Paix, face Pharmacie des Loisirs"
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                {/* 4 Required Documents Checklist & Upload */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <span className="font-bold text-xs text-[#022448] dark:text-white block uppercase font-republic">
                    Téléversement des Pièces Justificatives Obligatoires (4 Documents)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div
                      onClick={() => setUploadedFiles(prev => ({ ...prev, cni: !prev.cni }))}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                        uploadedFiles.cni ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-white border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>1. Pièce d'Identité / NIU</span>
                      </div>
                      <span className="font-bold font-mono-ref">{uploadedFiles.cni ? '✓ Prêt' : '+ Joindre'}</span>
                    </div>

                    <div
                      onClick={() => setUploadedFiles(prev => ({ ...prev, bail: !prev.bail }))}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                        uploadedFiles.bail ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-white border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>2. Bail Commercial Notarié</span>
                      </div>
                      <span className="font-bold font-mono-ref">{uploadedFiles.bail ? '✓ Prêt' : '+ Joindre'}</span>
                    </div>

                    <div
                      onClick={() => setUploadedFiles(prev => ({ ...prev, rccm: !prev.rccm }))}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                        uploadedFiles.rccm ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-white border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>3. Registre du Commerce (RCCM)</span>
                      </div>
                      <span className="font-bold font-mono-ref">{uploadedFiles.rccm ? '✓ Prêt' : '+ Joindre'}</span>
                    </div>

                    <div
                      onClick={() => setUploadedFiles(prev => ({ ...prev, plan: !prev.plan }))}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                        uploadedFiles.plan ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-white border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>4. Plan de Masse & Acoustique</span>
                      </div>
                      <span className="font-bold font-mono-ref">{uploadedFiles.plan ? '✓ Prêt' : '+ Joindre'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-300">
                  <div>
                    <span className="text-[10px] text-emerald-900 dark:text-emerald-300 block font-bold">Droits Réglementaires d'Instruction</span>
                    <strong className="text-base text-emerald-700 dark:text-emerald-400 font-mono-ref">
                      {estimatedSubmissionFee.toLocaleString('fr-FR')} FCFA
                    </strong>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#006d2f] hover:bg-[#005a26] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    Soumettre la Demande au Guichet Unique
                  </button>
                </div>
              </form>
            </div>

            {/* Submissions List */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h4 className="text-sm font-black text-[#022448] dark:text-white uppercase font-republic">
                  Dossiers en Cours d'Instruction
                </h4>
                <span className="text-[10px] font-mono-ref bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600">
                  {submissions.length} dossiers
                </span>
              </div>

              <div className="space-y-3">
                {submissions.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedTrackedSubmission(sub)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-xs transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono-ref font-black text-[10px] text-blue-700 dark:text-blue-400">
                          {sub.tracking_code}
                        </span>
                        <h5 className="font-black text-xs uppercase text-slate-900 dark:text-white">
                          {sub.establishment_name}
                        </h5>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        sub.status === 'APPROUVE' ? 'bg-emerald-100 text-emerald-800' :
                        sub.status === 'CONVOQUE_VISITE' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {sub.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 font-mono-ref">
                      <span>{sub.promoter_name}</span>
                      <strong className="text-slate-800 dark:text-slate-300">{sub.estimated_fee.toLocaleString('fr-FR')} FCFA</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 4: MACARONS OFFICIELS DE CONFORMITÉ (AXE 2)
         ============================================================== */}
      {activeTab === 'MACARONS' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-black text-emerald-950 dark:text-emerald-200 font-republic uppercase">
                Macarons Officiels Plastifiés & Vérification Universelle par QR Code
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Seuls les établissements ayant <strong>100% de leurs droits de régularisation acquittés</strong> disposent du Macaron Officiel de Conformité républicain à apposer obligatoirement à l'entrée.
              </p>
            </div>
            <span className="bg-[#006d2f] text-white px-3.5 py-1.5 rounded-xl font-black text-xs font-mono-ref shrink-0">
              {regularizedEstablishments.length} Homologués
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularizedEstablishments.map(est => (
              <div
                key={est.id}
                className="bg-white dark:bg-slate-900 border-2 border-emerald-400 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono-ref font-black px-1.5 py-0.5 rounded uppercase">
                      HOMOLOGUÉ 2026
                    </span>
                    <h5 className="font-black text-base uppercase text-[#022448] dark:text-white mt-1">
                      « {est.name} »
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Promoteur : <strong>{est.promoter_name}</strong>
                    </p>
                  </div>
                  <OfficialRepublicLogo size="xs" showMotto={false} />
                </div>

                <div className="text-[11px] text-slate-500 font-mono-ref pt-2 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                  <p>Quittance : <strong className="text-emerald-700">{est.amount_paid.toLocaleString('fr-FR')} FCFA</strong></p>
                  <p>Arrondissement : {est.arrondissement} ({est.quartier})</p>
                  <p>Homologation : MACARON-DDL-PN-2026-{est.id.slice(-6).toUpperCase()}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setVerificationModal({
                        isOpen: true,
                        ref: `MACARON-DDL-PN-2026-${est.id.slice(-6).toUpperCase()}`,
                        etab: est.name,
                        date: est.updated_at ? est.updated_at.split('T')[0] : '2026-10-02'
                      });
                    }}
                    className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Tester Scan QR</span>
                  </button>

                  <button
                    onClick={() => {
                      setPrintDoc({
                        isOpen: true,
                        type: 'MACARON_OFFICIEL_VITRINE_A4',
                        title: `Macaron Officiel - ${est.name}`,
                        data: est
                      });
                    }}
                    className="py-2 bg-[#006d2f] hover:bg-[#005a26] text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer A4</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Reconciliation Modal */}
      {isReconModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 space-y-4 border border-slate-300 dark:border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm uppercase text-[#022448] dark:text-white font-republic">
                Nouveau Rapprochement Bancaire Quotidien
              </h3>
              <button onClick={() => setIsReconModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReconciliation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Établissement Bancaire Partenaire</label>
                <select
                  value={reconBank}
                  onChange={e => {
                    const b = e.target.value as BankReconciliationRecord['bank_name'];
                    setReconBank(b);
                    if (b.includes('BEAC')) setReconAccount('CG02-BEAC-10001-094821');
                    else if (b.includes('LCB')) setReconAccount('CG05-LCB-20002-884102');
                    else if (b.includes('BCA')) setReconAccount('CG08-BCA-30003-441092');
                    else setReconAccount('CG01-TRESOR-CENTRAL-001');
                  }}
                  className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="Banque des États de l’Afrique Centrale (BEAC)">BEAC (Banque Centrale)</option>
                  <option value="La Congolaise de Banque (LCB)">LCB (La Congolaise de Banque)</option>
                  <option value="Banque Commerciale Internationale (BCA)">BCA (Banque Commerciale Internationale)</option>
                  <option value="Trésor Public">Trésor Public (Compte Central)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">N° de Compte</label>
                <input
                  type="text"
                  value={reconAccount}
                  onChange={e => setReconAccount(e.target.value)}
                  className="w-full border p-2 rounded-xl font-mono-ref font-bold bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Montant Relevé Bancaire (FCFA)</label>
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  value={reconAmount}
                  onChange={e => setReconAmount(Number(e.target.value))}
                  className="w-full border p-2 rounded-xl font-mono-ref font-black text-sm text-[#006d2f] bg-slate-50 dark:bg-slate-800"
                  required
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono-ref">
                  <span>70% Trésor : {Math.round(reconAmount * 0.7).toLocaleString('fr-FR')} FCFA</span>
                  <span>30% Régie : {Math.round(reconAmount * 0.3).toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Observations Comptables</label>
                <textarea
                  value={reconNotes}
                  onChange={e => setReconNotes(e.target.value)}
                  rows={2}
                  className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsReconModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006d2f] hover:bg-[#005a26] text-white rounded-xl font-bold cursor-pointer"
                >
                  Valider le Rapprochement
                </button>
              </div>
            </form>
          </div>
        </div>
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

      {/* Public Verification Modal */}
      {verificationModal.isOpen && (
        <PublicVerificationView
          refCode={verificationModal.ref}
          establishmentName={verificationModal.etab}
          date={verificationModal.date}
          onClose={() => setVerificationModal(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};
