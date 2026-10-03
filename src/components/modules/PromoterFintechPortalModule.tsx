import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Download,
  Building2,
  Calendar,
  Sparkles,
  Phone,
  Landmark,
  ShieldCheck,
  Search,
  Plus,
  Printer,
  Award,
  ArrowRight,
  FileCheck2,
  Check
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { Establishment, MobileMoneyPaymentSession, PromoterOnlineSubmission, ArrondissementCode, RegimeType } from '../../types';
import { PrintModal } from '../print/PrintModal';
import { OfficialRepublicLogo, RepublicTricolorBar, RepublicQrCode } from '../common/OfficialSeal';
import { formatDateFR } from '../../utils/dateUtils';
import { TERRITORIAL_REFERENTIAL, ACTIVITY_CATEGORIES } from '../../constants/referential';

export const PromoterFintechPortalModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [activeTab, setActiveTab] = useState<'TELEPAIEMENT' | 'TELEDECLARATION' | 'MACARONS'>('TELEPAIEMENT');

  const [establishments, setEstablishments] = useState<Establishment[]>(() => storageService.getEstablishments());
  const [momoSessions, setMomoSessions] = useState<MobileMoneyPaymentSession[]>(() => storageService.getMomoSessions());
  const [submissions, setSubmissions] = useState<PromoterOnlineSubmission[]>(() => storageService.getOnlineSubmissions());

  // --- Payment State ---
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string>(() => establishments[0]?.id || '');
  const [momoOperator, setMomoOperator] = useState<'MTN Mobile Money' | 'Airtel Money'>('MTN Mobile Money');
  const [momoPhoneNumber, setMomoPhoneNumber] = useState<string>('+242 06 654 32 10');
  const selectedEst = useMemo(() => establishments.find(e => e.id === selectedEstablishmentId), [establishments, selectedEstablishmentId]);
  const [payAmount, setPayAmount] = useState<number>(() => (selectedEst?.balance_due || 50000));
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    session: MobileMoneyPaymentSession;
    payment: any;
  } | null>(null);

  // --- Submission State ---
  const [subEstName, setSubEstName] = useState('');
  const [subPromoterName, setSubPromoterName] = useState('');
  const [subPhone, setSubPhone] = useState('+242 06 ');
  const [subEmail, setSubEmail] = useState('');
  const [subArrondissement, setSubArrondissement] = useState<ArrondissementCode>('1_LUMUMBA');
  const [subQuartier, setSubQuartier] = useState('Centre-Ville');
  const [subAddress, setSubAddress] = useState('');
  const [subActivity, setSubActivity] = useState('BAR_DANCING');
  const [subRegime, setSubRegime] = useState<RegimeType>('INFORMEL');
  const [subSurface, setSubSurface] = useState<number>(50);

  // Print modal
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: 'RECU_TELEPAIEMENT_MOMO_A4' | 'MACARON_OFFICIEL_VITRINE_A4' | 'ATTESTATION_A4';
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

  // Handle Mobile Money Payment Trigger
  const handleTriggerMomo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEst || payAmount <= 0) {
      triggerNotification('Veuillez sélectionner un établissement et un montant valide.', 'error');
      return;
    }

    setIsProcessingPayment(true);

    // Simulate instant telecom USSD prompt
    setTimeout(() => {
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
    }, 2000);
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
      notes: `Télédéclaration en ligne soumise le ${formatDateFR(new Date())}`
    });

    setSubmissions(storageService.getOnlineSubmissions());
    triggerNotification(`Dossier ${sub.tracking_code} enregistré avec succès.`, 'success');

    // Reset form
    setSubEstName('');
    setSubPromoterName('');
    setSubAddress('');
  };

  // Fully compliant establishments for Macarons
  const regularizedEstablishments = useMemo(() => {
    return establishments.filter(e => e.amount_paid > 0 && e.balance_due === 0);
  }, [establishments]);

  // Statistics
  const totalMomoCollected = momoSessions.reduce((acc, curr) => acc + (curr.amount_fcfa || 0), 0);
  const treasuryShare = Math.round(totalMomoCollected * 0.7);
  const regieShare = Math.round(totalMomoCollected * 0.3);

  return (
    <div className="space-y-6">
      {/* Official Header Banner */}
      <div className="bg-gradient-to-r from-[#022448] via-[#003870] to-[#006d2f] text-white p-5 sm:p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <RepublicTricolorBar className="absolute top-0 left-0 right-0 h-1.5" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono-ref">
                PASSERELLE FINTECH D'ÉTAT & TÉLÉSERVICES
              </span>
              <span className="text-xs text-amber-200 font-mono-ref">PTA 2026 - MOD-17</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-republic flex items-center gap-2.5">
              <Smartphone className="w-6 h-6 text-amber-300" />
              <span>Guichet Télépaiement Mobile Money & Espace Promoteur</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Encaissement dématérialisé instantané via <strong>MTN MoMo</strong> et <strong>Airtel Money Congo</strong>, répartition légale 70/30, télédéclaration d'agrément et délivrance des macarons officiels.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 rounded-xl text-right font-mono-ref shrink-0">
            <span className="text-[10px] uppercase text-amber-300 font-bold block">Télécollecte Validée MoMo</span>
            <span className="text-xl font-black text-white">{totalMomoCollected.toLocaleString('fr-FR')} FCFA</span>
            <span className="text-[9px] text-emerald-300 block">70% Trésor : {treasuryShare.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('TELEPAIEMENT')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'TELEPAIEMENT'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Télépaiement Mobile Money Express</span>
          <span className="bg-amber-100 text-amber-950 font-mono-ref px-1.5 py-0.2 rounded text-[9px] font-bold">
            {momoSessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TELEDECLARATION')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'TELEDECLARATION'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Télédéclaration & Nouveaux Établissements</span>
          <span className="bg-blue-100 text-blue-900 font-mono-ref px-1.5 py-0.2 rounded text-[9px] font-bold">
            {submissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('MACARONS')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'MACARONS'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Macarons Républicains de Conformité ({regularizedEstablishments.length})</span>
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
              <span className="text-[10px] font-black uppercase text-[#006d2f] font-mono-ref">TERMINAL DE PAIEMENT SÉCURISÉ</span>
              <h3 className="text-base font-black text-[#022448] dark:text-white uppercase font-republic">
                Paiement Dématérialisé in situ
              </h3>
            </div>

            <form onSubmit={handleTriggerMomo} className="space-y-4 text-xs">
              {/* Select Operator */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  1. Sélectionner l'Opérateur Télécom
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
                    <span className="text-[9px] text-slate-500">Préfixe 06</span>
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
                    <span>Airtel Money (*126#)</span>
                    <span className="text-[9px] text-slate-500">Préfixe 05 / 04</span>
                  </button>
                </div>
              </div>

              {/* Select Establishment */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  2. Établissement Débiteur
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
                  className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  required
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} — Reste : {est.balance_due.toLocaleString('fr-FR')} FCFA ({est.promoter_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone number */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  3. N° Téléphone du Promoteur ({momoOperator})
                </label>
                <input
                  type="text"
                  value={momoPhoneNumber}
                  onChange={e => setMomoPhoneNumber(e.target.value)}
                  className="w-full border p-2 rounded-xl font-mono-ref font-bold text-sm bg-slate-50 dark:bg-slate-800"
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
                  <span>Notification USSD envoyée sur le mobile...</span>
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
                  QR Code Dynamique pour le Tenancier
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Le tenancier peut directement scanner ce code avec son application <strong>MTN MoMo</strong> ou <strong>Airtel Money</strong> pour régler sans saisie.
                </p>
                <div className="pt-1 text-xs font-mono-ref font-bold text-[#006d2f]">
                  Montant encodé : {Number(payAmount).toLocaleString('fr-FR')} FCFA
                </div>
              </div>

              <div className="p-3 bg-white border-2 border-dashed border-[#006d2f] rounded-2xl shadow-sm shrink-0 text-center">
                <RepublicQrCode
                  payload={{
                    type: 'MOMO_DIRECT_PAY',
                    operator: momoOperator,
                    establishment: selectedEst?.name,
                    amount: payAmount,
                    phone: momoPhoneNumber
                  }}
                  size={100}
                  showDetails={false}
                />
                <span className="text-[9px] font-mono-ref font-bold text-slate-500 mt-1 block">
                  {momoOperator === 'MTN Mobile Money' ? 'MoMo Pay' : 'Airtel Pay'}
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
                      title: `Attestation Télépaiement - ${paymentSuccessData.session.establishment_name}`,
                      data: paymentSuccessData.session
                    });
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer Attestation A4</span>
                </button>
              </div>
            )}

            {/* Recent MoMo Sessions Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-[#022448] dark:text-white uppercase font-republic">
                  Journal des Transactions Mobile Money ({momoSessions.length})
                </h4>
                <span className="text-xs text-slate-500 font-mono-ref">Télécollecte DDL-PN 2026</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b">
                    <tr>
                      <th className="p-3">Réf Transaction</th>
                      <th className="p-3">Opérateur & Tél</th>
                      <th className="p-3">Établissement</th>
                      <th className="p-3 text-right">Montant Payé</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {momoSessions.map(sess => (
                      <tr key={sess.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono-ref">
                          <span className="font-bold text-[#022448] dark:text-white block">{sess.transaction_ref}</span>
                          <span className="text-[10px] text-slate-400">{formatDateFR(sess.created_at)}</span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-1.5 py-0.2 rounded font-bold text-[10px] ${
                            sess.operator === 'MTN Mobile Money' ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-900'
                          }`}>
                            {sess.operator}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono-ref block">{sess.phone_number}</span>
                        </td>
                        <td className="p-3 font-semibold uppercase text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                          {sess.establishment_name}
                        </td>
                        <td className="p-3 text-right font-mono-ref font-black text-emerald-600">
                          {sess.amount_fcfa.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setPrintDoc({
                                isOpen: true,
                                type: 'RECU_TELEPAIEMENT_MOMO_A4',
                                title: `Quittance Télépaiement - ${sess.establishment_name}`,
                                data: sess
                              });
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#022448] dark:text-white rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                            title="Imprimer l'Attestation A4"
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
          TAB 2: TÉLÉDÉCLARATION & ENRÔLEMENT
         ============================================================== */}
      {activeTab === 'TELEDECLARATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-black uppercase text-blue-600 font-mono-ref">GUICHET UNIQUE DU PROMOTEUR</span>
              <h3 className="text-base font-black text-[#022448] dark:text-white uppercase font-republic">
                Déclaration d'un Nouvel Établissement
              </h3>
            </div>

            <form onSubmit={handleCreateSubmission} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Nom Commercial</label>
                <input
                  type="text"
                  placeholder="Ex: Le Safari Lounge Bar"
                  value={subEstName}
                  onChange={e => setSubEstName(e.target.value)}
                  className="w-full border p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Nom & Prénom du Promoteur</label>
                <input
                  type="text"
                  placeholder="Ex: M. Jean-Claude LOUVOUEMBO"
                  value={subPromoterName}
                  onChange={e => setSubPromoterName(e.target.value)}
                  className="w-full border p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Tél Contact (MoMo)</label>
                  <input
                    type="text"
                    value={subPhone}
                    onChange={e => setSubPhone(e.target.value)}
                    className="w-full border p-2 rounded-xl text-xs font-mono-ref bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Email (Facultatif)</label>
                  <input
                    type="email"
                    value={subEmail}
                    onChange={e => setSubEmail(e.target.value)}
                    className="w-full border p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="contact@etab.cg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Arrondissement</label>
                  <select
                    value={subArrondissement}
                    onChange={e => setSubArrondissement(e.target.value as any)}
                    className="w-full border p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                  >
                    {TERRITORIAL_REFERENTIAL.map(arr => (
                      <option key={arr.code} value={arr.code}>{arr.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Quartier</label>
                  <input
                    type="text"
                    value={subQuartier}
                    onChange={e => setSubQuartier(e.target.value)}
                    className="w-full border p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Adresse / Point de Repère</label>
                <input
                  type="text"
                  placeholder="Ex: Face Clinique Guénin, Avenue Moe Pratt"
                  value={subAddress}
                  onChange={e => setSubAddress(e.target.value)}
                  className="w-full border p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Activité Prévue</label>
                  <select
                    value={subActivity}
                    onChange={e => setSubActivity(e.target.value)}
                    className="w-full border p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                  >
                    {ACTIVITY_CATEGORIES.map(cat => (
                      <option key={cat.code} value={cat.code}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Régime Fiscal</label>
                  <select
                    value={subRegime}
                    onChange={e => setSubRegime(e.target.value as any)}
                    className="w-full border p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="INFORMEL">INFORMEL (Forfait 50 000 FCFA)</option>
                    <option value="FORMEL">FORMEL (Barème Surface m²)</option>
                  </select>
                </div>
              </div>

              {subRegime === 'FORMEL' && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Superficie d'exploitation (m²)</label>
                  <input
                    type="number"
                    min={10}
                    value={subSurface}
                    onChange={e => setSubSurface(Number(e.target.value))}
                    className="w-full border p-2 rounded-xl text-xs font-mono-ref bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              )}

              {/* Estimation */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex justify-between items-center">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">Droits Estimés à Acquitter :</span>
                <span className="font-black text-sm text-[#006d2f] font-mono-ref">
                  {estimatedSubmissionFee.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#006d2f] hover:bg-[#005a26] text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Soumettre la Télédéclaration d'Agrément
              </button>
            </form>
          </div>

          {/* Submissions List */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h4 className="font-extrabold text-sm text-[#022448] dark:text-white uppercase font-republic">
                Dossiers en Télédéclaration ({submissions.length})
              </h4>
              <span className="text-xs text-slate-500 font-mono-ref">Instruction SAA</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b">
                  <tr>
                    <th className="p-3">Code Suivi</th>
                    <th className="p-3">Établissement & Promoteur</th>
                    <th className="p-3">Localisation</th>
                    <th className="p-3">Droits Prévus</th>
                    <th className="p-3">Statut Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {submissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono-ref">
                        <span className="font-black text-[#022448] dark:text-white block">{sub.tracking_code}</span>
                        <span className="text-[10px] text-slate-400">{formatDateFR(sub.submission_date)}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold uppercase text-slate-900 dark:text-slate-100 block">{sub.establishment_name}</span>
                        <span className="text-[11px] text-slate-500">{sub.promoter_name} ({sub.phone})</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        <span>{sub.arrondissement}</span>
                        <span className="text-[10px] text-slate-400 block">{sub.quartier}</span>
                      </td>
                      <td className="p-3 font-mono-ref font-bold text-slate-800 dark:text-slate-200">
                        {sub.estimated_fee.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          sub.status === 'APPROUVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sub.status.replace(/_/g, ' ')}
                        </span>
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
          TAB 3: MACARONS OFFICIELS DE CONFORMITÉ
         ============================================================== */}
      {activeTab === 'MACARONS' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-black text-emerald-950 dark:text-emerald-200 font-republic uppercase">
                Établissements Homologués avec Macaron Officiel 2026
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Seuls les établissements ayant <strong>100% de leurs droits de régularisation acquittés</strong> sont éligibles à l'édition du Macaron Officiel de Conformité avec QR Code républicain.
              </p>
            </div>
            <span className="bg-[#006d2f] text-white px-3.5 py-1.5 rounded-xl font-black text-xs font-mono-ref shrink-0">
              {regularizedEstablishments.length} Établissements Régularisés
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

                <button
                  onClick={() => {
                    setPrintDoc({
                      isOpen: true,
                      type: 'MACARON_OFFICIEL_VITRINE_A4',
                      title: `Macaron Officiel - ${est.name}`,
                      data: est
                    });
                  }}
                  className="w-full py-2 bg-[#006d2f] hover:bg-[#005a26] text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le Macaron Officiel A4</span>
                </button>
              </div>
            ))}
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
    </div>
  );
};
