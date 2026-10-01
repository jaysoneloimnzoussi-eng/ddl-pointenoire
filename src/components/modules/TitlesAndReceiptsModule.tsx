import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Printer,
  Search,
  Building2,
  FileCheck2,
  Smartphone,
  CheckCircle2,
  Plus,
  Coins,
  CreditCard,
  User,
  Calendar,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Landmark,
  UserCheck
} from 'lucide-react';
import { storageService, calculateEstablishmentFee } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { TerrainPaymentRecord, Establishment, ArrondissementCode, RegimeType } from '../../types';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';
import { TERRITORIAL_REFERENTIAL, ACTIVITY_CATEGORIES, APP_USERS } from '../../constants/referential';

export const TitlesAndReceiptsModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'GUICHET' | 'MOBILE' | 'CONVOQUES'>('ALL');

  const [payments, setPayments] = useState<TerrainPaymentRecord[]>(() => storageService.getPayments());
  const [establishments, setEstablishments] = useState<Establishment[]>(() => storageService.getEstablishments());
  const [acts, setActs] = useState(() => storageService.getActs());

  const reloadAll = () => {
    setPayments(storageService.getPayments());
    setEstablishments(storageService.getEstablishments());
    setActs(storageService.getActs());
  };

  // Modals state
  const [isDeskPaymentModalOpen, setIsDeskPaymentModalOpen] = useState(false);
  const [isNewEstModalOpen, setIsNewEstModalOpen] = useState(false);

  // Desk Payment Form State
  const [deskPaymentForm, setDeskPaymentForm] = useState({
    establishmentId: '',
    promoterName: '',
    establishmentName: '',
    arrondissement: '1_LUMUMBA' as ArrondissementCode,
    amountToPay: 50000,
    paymentMethod: 'Espèces (Régie)' as TerrainPaymentRecord['payment_method'],
    agentNotificateur: 'ADMIN-MATOKO',
    notes: 'Règlement au Guichet Bureau DDL-PN suite à convocation'
  });

  // New Establishment Form State
  const [newEstForm, setNewEstForm] = useState({
    name: '',
    promoter_name: '',
    phone: '+242 06 ',
    arrondissement: '1_LUMUMBA' as ArrondissementCode,
    quartier: 'Centre-Ville',
    address: '',
    activity_code: 'A2.1',
    regime_type: 'INFORMEL' as RegimeType,
    surface_m2: 80,
    has_acoustic_limiter: false,
    initialDeposit: 30000,
    paymentMethod: 'Espèces (Régie)' as TerrainPaymentRecord['payment_method']
  });

  // Print modal
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: PrintDocumentType;
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'ATTESTATION_A4',
    title: '',
    data: null
  });

  // Convoques list
  const convoquesList = useMemo(() => {
    return establishments.filter(
      e => e.status === 'convoque' || e.status === 'mise_en_demeure' || (e.balance_due > 0 && e.amount_paid === 0)
    );
  }, [establishments]);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchSearch =
        p.receipt_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.establishment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.promoter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.collected_by.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterType === 'GUICHET') return p.payment_method === 'Espèces (Régie)';
      if (filterType === 'MOBILE') return p.payment_method.includes('Money');
      return true;
    });
  }, [payments, searchTerm, filterType]);

  // Handle Desk Payment Submission
  const handleDeskPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const est = establishments.find(e => e.id === deskPaymentForm.establishmentId);
    if (!est) {
      triggerNotification('Veuillez sélectionner un établissement valide.', 'warning');
      return;
    }

    const assignedAgent = APP_USERS.find(u => u.id === deskPaymentForm.agentNotificateur || u.badge === deskPaymentForm.agentNotificateur) || currentUser;

    const paymentResult = storageService.recordPayment({
      establishment_id: est.id,
      amount: Number(deskPaymentForm.amountToPay),
      payment_method: deskPaymentForm.paymentMethod,
      collected_by: `${assignedAgent.name} (Guichet SAF)`,
      agent_badge: assignedAgent.badge,
      notes: deskPaymentForm.notes
    });

    const paymentRecord = paymentResult.payment;

    reloadAll();
    setIsDeskPaymentModalOpen(false);
    triggerNotification(`Paiement de ${deskPaymentForm.amountToPay.toLocaleString('fr-FR')} FCFA enregistré au Guichet avec succès !`, 'success');

    // Open print modal with Attestation de Dépôt A4
    setPrintDoc({
      isOpen: true,
      type: 'ATTESTATION_A4',
      title: `Attestation de Dépôt - ${est.name}`,
      data: {
        ...est,
        ...paymentRecord,
        receipt_reference: paymentRecord.receipt_reference,
        amount_paid: (est.amount_paid || 0) + Number(deskPaymentForm.amountToPay),
        date_emission: new Date().toISOString().split('T')[0]
      }
    });
  };

  // Handle New Establishment Registration at Desk
  const handleNewEstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { filingFee, ratePerSqm, totalDue } = calculateEstablishmentFee(
      newEstForm.activity_code,
      newEstForm.surface_m2,
      newEstForm.regime_type
    );

    const initialPay = Number(newEstForm.initialDeposit);

    const newEst = storageService.addEstablishment({
      name: newEstForm.name,
      promoter_name: newEstForm.promoter_name,
      phone: newEstForm.phone,
      arrondissement: newEstForm.arrondissement,
      quartier: newEstForm.quartier,
      address: newEstForm.address || `${newEstForm.quartier}, Pointe-Noire`,
      activity_type: ACTIVITY_CATEGORIES.find(c => c.code === newEstForm.activity_code)?.label || 'Établissement de loisirs',
      activity_code: newEstForm.activity_code,
      regime_type: newEstForm.regime_type,
      surface_m2: Number(newEstForm.surface_m2),
      filing_fee: filingFee,
      rate_per_sqm: ratePerSqm,
      total_due: totalDue,
      amount_paid: initialPay,
      balance_due: Math.max(0, totalDue - initialPay),
      status: initialPay > 0 ? 'attestation_depot' : 'en_instruction',
      identified_by: `${currentUser.name} (Guichet Bureau SAA)`,
      identified_date: new Date().toISOString().split('T')[0],
      coordinates: [-4.795, 11.855],
      installments_chosen: 2
    });

    let receiptRef = `REC-GUICHET-PN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    if (initialPay > 0) {
      const payRes = storageService.recordPayment({
        establishment_id: newEst.id,
        amount: initialPay,
        payment_method: newEstForm.paymentMethod,
        collected_by: `${currentUser.name} (Guichet Bureau)`,
        agent_badge: currentUser.badge,
        notes: 'Dépôt initial & enregistrement direct au Guichet Bureau DDL-PN'
      });
      receiptRef = payRes.payment.receipt_reference;
    }

    reloadAll();
    setIsNewEstModalOpen(false);
    triggerNotification(`Établissement « ${newEst.name} » enregistré avec succès au Guichet !`, 'success');

    // Propose immediate print of Attestation de Dépôt
    setPrintDoc({
      isOpen: true,
      type: 'ATTESTATION_A4',
      title: `Attestation de Dépôt - ${newEst.name}`,
      data: {
        ...newEst,
        receipt_reference: receiptRef,
        amount_paid: initialPay,
        date_emission: new Date().toISOString().split('T')[0]
      }
    });
  };

  const handlePrintReceipt = (record: TerrainPaymentRecord, format: 'A4' | '58MM') => {
    const est = establishments.find(e => e.id === record.establishment_id);
    const docType: PrintDocumentType = format === 'A4' ? 'ATTESTATION_A4' : 'TICKET_58MM';

    setPrintDoc({
      isOpen: true,
      type: docType,
      title: format === 'A4' ? `Attestation de Dépôt A4 - ${record.establishment_name}` : `Ticket 58mm - ${record.receipt_reference}`,
      data: {
        ...record,
        ...est,
        receipt_reference: record.receipt_reference,
        amount_paid: record.amount_paid,
        total_fee: record.total_fee,
        balance_remaining: record.balance_remaining,
        date_emission: record.record_date
      }
    });
  };

  return (
    <div className="space-y-5 select-none">
      {/* Top Banner with Action Buttons */}
      <div className="bg-gradient-to-r from-[#022448] via-[#023b75] to-[#006d2f] text-white p-5 rounded-2xl border border-[#033468] shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full font-mono-ref uppercase">
              GUICHET UNIQUE D'ACCUEIL & ENCAISSEMENT
            </span>
            <span className="text-xs text-emerald-200 font-semibold">Direction Départementale DDL-PN</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight mt-1 flex items-center gap-2 font-republic">
            <Receipt className="w-5 h-5 text-amber-300" />
            <span>Guichet d'Encaissement au Bureau, Enregistrement & Attestations de Dépôt</span>
          </h2>
          <p className="text-xs text-slate-200 mt-0.5 max-w-2xl">
            Accueil des promoteurs convoqués par la Brigade SAA, encaissement au guichet, enregistrement direct de dossiers et délivrance immédiate des Attestations de Dépôt A4 et Tickets 58mm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Button 1: Encaissement d'un convoqué au guichet */}
          <button
            onClick={() => {
              if (convoquesList.length > 0) {
                const first = convoquesList[0];
                setDeskPaymentForm({
                  establishmentId: first.id,
                  promoterName: first.promoter_name,
                  establishmentName: first.name,
                  arrondissement: first.arrondissement,
                  amountToPay: first.balance_due > 0 ? Math.min(50000, first.balance_due) : 30000,
                  paymentMethod: 'Espèces (Régie)',
                  agentNotificateur: first.assigned_agent_id || 'ADMIN-MATOKO',
                  notes: 'Paiement au Guichet Bureau suite à convocation SAA'
                });
              }
              setIsDeskPaymentModalOpen(true);
            }}
            className="flex-1 sm:flex-initial bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
          >
            <Coins className="w-4 h-4 text-slate-950" />
            <span>Encaisser un Convoqué au Guichet</span>
          </button>

          {/* Button 2: Enregistrer un nouvel établissement */}
          <button
            onClick={() => setIsNewEstModalOpen(true)}
            className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Enregistrer un Établissement au Bureau</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Total Quittances Délivrées</span>
          <p className="font-mono-ref font-black text-xl text-[#022448] mt-1">{payments.length} Reçus</p>
          <p className="text-slate-500 mt-0.5">Enregistrés au Grand-Livre SAF</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Recettes Guichet & Mobile</span>
          <p className="font-mono-ref font-black text-xl text-emerald-800 mt-1">
            {payments.reduce((acc, p) => acc + (p.amount_paid || 0), 0).toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-slate-500 mt-0.5">70% Trésor / 30% Régie DDL-PN</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Tenanciers Convoqués en Attente</span>
          <p className="font-mono-ref font-black text-xl text-amber-700 mt-1">{convoquesList.length} Locaux</p>
          <p className="text-slate-500 mt-0.5">Attente de passage au bureau</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Attestations de Dépôt Actives</span>
          <p className="font-mono-ref font-black text-xl text-blue-900 mt-1">
            {establishments.filter(e => e.status === 'attestation_depot').length} Titres
          </p>
          <p className="text-slate-500 mt-0.5">Autorisation provisoire en règle</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'ALL' ? 'bg-[#022448] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous les Reçus ({payments.length})
          </button>
          <button
            onClick={() => setFilterType('GUICHET')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'GUICHET' ? 'bg-[#006d2f] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Espèces Guichet
          </button>
          <button
            onClick={() => setFilterType('MOBILE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'MOBILE' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paiements Mobile Money
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher quittance, établissement, promoteur..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006d2f]"
          />
        </div>
      </div>

      {/* Cards of Receipts and Desk Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPayments.map(record => {
          const isCash = record.payment_method === 'Espèces (Régie)';
          return (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <span className="font-mono-ref font-bold text-xs text-[#022448]">
                    {record.receipt_reference}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono-ref">
                    {record.record_date}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                  {record.establishment_name}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Promoteur : <span className="font-semibold">{record.promoter_name}</span>
                </p>
                <p className="text-[11px] text-slate-500">{record.arrondissement}</p>

                <div className="bg-slate-50 p-3 rounded-xl border my-3 space-y-1.5 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-600">Montant Encaissé :</span>
                    <span className="font-mono-ref font-black text-emerald-800 text-sm">
                      {record.amount_paid.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Canal :</span>
                    <span className={`px-1.5 py-0.2 rounded font-semibold ${isCash ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                      {record.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Agent / Guichetier :</span>
                    <span className="font-medium text-slate-800">{record.collected_by}</span>
                  </div>
                </div>
              </div>

              {/* Actions: Double print format */}
              <div className="pt-2 border-t flex items-center justify-between gap-2">
                <button
                  onClick={() => handlePrintReceipt(record, '58MM')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Ticket 58mm</span>
                </button>

                <button
                  onClick={() => handlePrintReceipt(record, 'A4')}
                  className="flex-1 bg-[#006d2f] hover:bg-[#005a26] text-white text-xs font-bold py-2 px-2 rounded-xl flex items-center justify-center gap-1 shadow transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Attestation A4</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: ENCAISSEMENT AU GUICHET (CONVOCATION) */}
      {isDeskPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-300">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-[#022448]">Règlement au Guichet Bureau (Convocation SAA)</h3>
                <p className="text-xs text-slate-500">Encaissement physique et mise à jour du dossier</p>
              </div>
              <button onClick={() => setIsDeskPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleDeskPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sélectionner l'Établissement convoqué / en base *</label>
                <select
                  value={deskPaymentForm.establishmentId}
                  onChange={e => {
                    const found = establishments.find(est => est.id === e.target.value);
                    if (found) {
                      setDeskPaymentForm({
                        ...deskPaymentForm,
                        establishmentId: found.id,
                        establishmentName: found.name,
                        promoterName: found.promoter_name,
                        arrondissement: found.arrondissement,
                        amountToPay: found.balance_due > 0 ? Math.min(50000, found.balance_due) : 30000,
                        agentNotificateur: found.assigned_agent_id || 'ADMIN-MATOKO'
                      });
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#022448]"
                  required
                >
                  <option value="">-- Choisir l'établissement --</option>
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} — {est.promoter_name} ({est.arrondissement}) [Reste: {est.balance_due.toLocaleString('fr-FR')} F]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Montant Encaissé (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min={5000}
                    step={5000}
                    value={deskPaymentForm.amountToPay}
                    onChange={e => setDeskPaymentForm({ ...deskPaymentForm, amountToPay: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref font-bold text-emerald-900 text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mode de Paiement *</label>
                  <select
                    value={deskPaymentForm.paymentMethod}
                    onChange={e => setDeskPaymentForm({ ...deskPaymentForm, paymentMethod: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Espèces (Régie)">Espèces (Guichet Régie)</option>
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Virement Trésor Public">Virement Trésor Public</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Agent SAA Notificateur (Attribution du recouvrement) *</label>
                <select
                  value={deskPaymentForm.agentNotificateur}
                  onChange={e => setDeskPaymentForm({ ...deskPaymentForm, agentNotificateur: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  {APP_USERS.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.badge}) — {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observations & Réf. Quittance</label>
                <input
                  type="text"
                  value={deskPaymentForm.notes}
                  onChange={e => setDeskPaymentForm({ ...deskPaymentForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950 space-y-1 text-[11px]">
                <p className="font-bold">✓ Répartition légale automatique :</p>
                <p>• Trésorier Payeur Général (70%) : <strong>{Math.round(deskPaymentForm.amountToPay * 0.7).toLocaleString('fr-FR')} FCFA</strong></p>
                <p>• Compte Régie DDL-PN (30%) : <strong>{Math.round(deskPaymentForm.amountToPay * 0.3).toLocaleString('fr-FR')} FCFA</strong></p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsDeskPaymentModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#006d2f] hover:bg-emerald-800 text-white font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>Valider & Générer l'Attestation A4</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ENREGISTREMENT D'UN NOUVEL ETABLISSEMENT AU BUREAU */}
      {isNewEstModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 border border-slate-300">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-[#022448]">Enregistrement d'un Nouvel Établissement au Bureau</h3>
                <p className="text-xs text-slate-500">Création de dossier, calcul de redevance et délivrance d'Attestation de Dépôt</p>
              </div>
              <button onClick={() => setIsNewEstModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleNewEstSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom de l'Établissement *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Le Safari VIP Lounge"
                    value={newEstForm.name}
                    onChange={e => setNewEstForm({ ...newEstForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom du Promoteur / Gérant *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Christian BITEMO"
                    value={newEstForm.promoter_name}
                    onChange={e => setNewEstForm({ ...newEstForm, promoter_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Téléphone *</label>
                  <input
                    type="text"
                    required
                    value={newEstForm.phone}
                    onChange={e => setNewEstForm({ ...newEstForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Arrondissement *</label>
                  <select
                    value={newEstForm.arrondissement}
                    onChange={e => setNewEstForm({ ...newEstForm, arrondissement: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {TERRITORIAL_REFERENTIAL.map(arr => (
                      <option key={arr.code} value={arr.code}>
                        {arr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quartier *</label>
                  <input
                    type="text"
                    required
                    value={newEstForm.quartier}
                    onChange={e => setNewEstForm({ ...newEstForm, quartier: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Régime d'Exploitation *</label>
                  <select
                    value={newEstForm.regime_type}
                    onChange={e => setNewEstForm({ ...newEstForm, regime_type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-blue-900"
                  >
                    <option value="INFORMEL">Secteur Informel (Forfait annuel d'accompagnement)</option>
                    <option value="FORMEL">Secteur Formel (RCCM • Tarification au m²)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie d'Activité *</label>
                  <select
                    value={newEstForm.activity_code}
                    onChange={e => setNewEstForm({ ...newEstForm, activity_code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {ACTIVITY_CATEGORIES.map(cat => (
                      <option key={cat.code} value={cat.code}>
                        {cat.code} - {cat.label} ({cat.rate_per_sqm_fcfa} F/m²)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Superficie Déclarée (m²)</label>
                  <input
                    type="number"
                    min={10}
                    value={newEstForm.surface_m2}
                    onChange={e => setNewEstForm({ ...newEstForm, surface_m2: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Versement Initial au Guichet (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={newEstForm.initialDeposit}
                    onChange={e => setNewEstForm({ ...newEstForm, initialDeposit: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref font-bold text-emerald-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewEstModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#006d2f] hover:bg-emerald-800 text-white font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Enregistrer & Délivrer l'Attestation A4</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Print Modal */}
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
