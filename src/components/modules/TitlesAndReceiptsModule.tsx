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
  UserCheck,
  Clock,
  MapPin,
  Phone,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Send
} from 'lucide-react';
import { storageService, calculateEstablishmentFee } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { TerrainPaymentRecord, Establishment, ArrondissementCode, RegimeType, AgentTourneeEvent } from '../../types';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';
import { TERRITORIAL_REFERENTIAL, ACTIVITY_CATEGORIES, APP_USERS } from '../../constants/referential';

export const TitlesAndReceiptsModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();

  const [payments, setPayments] = useState<TerrainPaymentRecord[]>(() => storageService.getPayments());
  const [establishments, setEstablishments] = useState<Establishment[]>(() => storageService.getEstablishments());
  const [tourneeEvents, setTourneeEvents] = useState<AgentTourneeEvent[]>(() => storageService.getAgentEvents());

  const reloadAll = () => {
    setPayments(storageService.getPayments());
    setEstablishments(storageService.getEstablishments());
    setTourneeEvents(storageService.getAgentEvents());
  };

  // Active Desk Workflow Mode: 'EXACT_DESK_ACTION'
  const [selectedEstId, setSelectedEstId] = useState<string>('');
  const [estSearchInput, setEstSearchInput] = useState<string>('');
  const [isCreatingNewEst, setIsCreatingNewEst] = useState<boolean>(false);
  const [deskActionType, setDeskActionType] = useState<'PAY_NOW' | 'SCHEDULE_FIELD_VISIT'>('PAY_NOW');

  // Payment fields
  const [depositAmount, setDepositAmount] = useState<number>(30000);
  const [paymentMethod, setPaymentMethod] = useState<TerrainPaymentRecord['payment_method']>('Espèces (Régie)');
  const [cashierNotes, setCashierNotes] = useState<string>('Paiement au Guichet Bureau DDL-PN');

  // Field Appointment fields (when promoter chooses to pay on-site)
  const [appointmentDate, setAppointmentDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00');
  const [assignedAgentId, setAssignedAgentId] = useState<string>('0594a697-48ba-4fb7-b4cb-a979ad46f37c'); // Default Ambetos

  // New Establishment Form state (if not registered yet)
  const [newEst, setNewEst] = useState({
    name: '',
    promoter_name: '',
    phone: '+242 06 ',
    arrondissement: '1_LUMUMBA' as ArrondissementCode,
    quartier: 'Centre-Ville',
    address: '',
    activity_code: 'A2.1',
    regime_type: 'INFORMEL' as RegimeType,
    surface_m2: 80,
    custom_total_due: 50000,
    assigned_agent_id: '0594a697-48ba-4fb7-b4cb-a979ad46f37c'
  });

  // State to edit fee for currently selected existing establishment
  const [isEditingCurrentEstFee, setIsEditingCurrentEstFee] = useState<boolean>(false);
  const [editedCurrentEstFee, setEditedCurrentEstFee] = useState<number>(50000);

  // Table history active tab
  const [historyTab, setHistoryTab] = useState<'RECEIPTS' | 'SCHEDULED_VISITS'>('RECEIPTS');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Selected establishment object
  const currentEst = useMemo(() => {
    return establishments.find(e => e.id === selectedEstId);
  }, [establishments, selectedEstId]);

  // Filtered establishments for search dropdown
  const searchResults = useMemo(() => {
    if (!estSearchInput.trim()) return [];
    const q = estSearchInput.toLowerCase();
    return establishments.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.promoter_name.toLowerCase().includes(q) ||
      e.phone.includes(q) ||
      e.arrondissement.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [establishments, estSearchInput]);

  // When selecting an existing establishment from search
  const handleSelectEst = (est: Establishment) => {
    setSelectedEstId(est.id);
    setEstSearchInput(`${est.name} — ${est.promoter_name} (${est.arrondissement})`);
    setIsCreatingNewEst(false);

    // Suggest remaining due or 30k
    setDepositAmount(est.balance_due > 0 ? Math.min(50000, est.balance_due) : 30000);

    // Identify linked agent
    if (est.assigned_agent_id) {
      setAssignedAgentId(est.assigned_agent_id);
    }
  };

  // Execution: Submit Desk Payment
  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();

    let targetEst: Establishment | undefined = currentEst;

    // If new establishment, create it first
    if (isCreatingNewEst) {
      const manualAmount = Number(newEst.custom_total_due) >= 0 ? Number(newEst.custom_total_due) : undefined;
      const { filingFee, ratePerSqm, totalDue } = calculateEstablishmentFee(
        newEst.activity_code,
        newEst.surface_m2,
        newEst.regime_type,
        manualAmount
      );

      const assignedAgent = APP_USERS.find(u => u.id === newEst.assigned_agent_id) || APP_USERS[2];

      targetEst = storageService.addEstablishment({
        name: newEst.name,
        promoter_name: newEst.promoter_name,
        phone: newEst.phone,
        arrondissement: newEst.arrondissement,
        quartier: newEst.quartier,
        address: newEst.address || `${newEst.quartier}, Pointe-Noire`,
        activity_type: ACTIVITY_CATEGORIES.find(c => c.code === newEst.activity_code)?.label || 'Établissement de loisirs',
        activity_code: newEst.activity_code,
        regime_type: newEst.regime_type,
        surface_m2: Number(newEst.surface_m2),
        filing_fee: filingFee,
        rate_per_sqm: ratePerSqm,
        total_due: totalDue,
        amount_paid: Number(depositAmount),
        balance_due: Math.max(0, totalDue - Number(depositAmount)),
        status: Number(depositAmount) > 0 ? 'attestation_depot' : 'en_instruction',
        identified_by: `${assignedAgent.name} (${assignedAgent.badge})`,
        identified_date: new Date().toISOString().split('T')[0],
        coordinates: [-4.795, 11.855],
        installments_chosen: 2,
        assigned_agent_id: assignedAgent.id
      });
    }

    if (!targetEst) {
      triggerNotification('Veuillez sélectionner ou enregistrer un établissement valide.', 'warning');
      return;
    }

    const assignedAgent = APP_USERS.find(u => u.id === assignedAgentId || u.id === targetEst?.assigned_agent_id) || currentUser;

    const paymentResult = storageService.recordPayment({
      establishment_id: targetEst.id,
      amount: Number(depositAmount),
      payment_method: paymentMethod,
      collected_by: `${currentUser.name} (Guichet SAF - DDL-PN)`,
      agent_badge: assignedAgent.badge,
      notes: cashierNotes
    });

    reloadAll();
    triggerNotification(`Paiement de ${Number(depositAmount).toLocaleString('fr-FR')} FCFA encaissé avec succès pour « ${targetEst.name} » !`, 'success');

    // Automatically open Attestation A4 for printing
    setPrintDoc({
      isOpen: true,
      type: 'ATTESTATION_A4',
      title: `Attestation de Dépôt - ${targetEst.name}`,
      data: {
        ...targetEst,
        ...paymentResult.payment,
        receipt_reference: paymentResult.payment.receipt_reference,
        amount_paid: (targetEst.amount_paid || 0) + Number(depositAmount),
        date_emission: new Date().toISOString().split('T')[0]
      }
    });

    // Reset form
    setSelectedEstId('');
    setEstSearchInput('');
    setIsCreatingNewEst(false);
  };

  // Execution: Schedule Field Recovery Appointment (Agent Visit)
  const handleScheduleFieldVisit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetEst: Establishment | undefined = currentEst;

    if (isCreatingNewEst) {
      const manualAmount = Number(newEst.custom_total_due) >= 0 ? Number(newEst.custom_total_due) : undefined;
      const { filingFee, ratePerSqm, totalDue } = calculateEstablishmentFee(
        newEst.activity_code,
        newEst.surface_m2,
        newEst.regime_type,
        manualAmount
      );

      const assignedAgent = APP_USERS.find(u => u.id === newEst.assigned_agent_id) || APP_USERS[2];

      targetEst = storageService.addEstablishment({
        name: newEst.name,
        promoter_name: newEst.promoter_name,
        phone: newEst.phone,
        arrondissement: newEst.arrondissement,
        quartier: newEst.quartier,
        address: newEst.address || `${newEst.quartier}, Pointe-Noire`,
        activity_type: ACTIVITY_CATEGORIES.find(c => c.code === newEst.activity_code)?.label || 'Établissement de loisirs',
        activity_code: newEst.activity_code,
        regime_type: newEst.regime_type,
        surface_m2: Number(newEst.surface_m2),
        filing_fee: filingFee,
        rate_per_sqm: ratePerSqm,
        total_due: totalDue,
        amount_paid: 0,
        balance_due: totalDue,
        status: 'convoque',
        identified_by: `${assignedAgent.name} (${assignedAgent.badge})`,
        identified_date: new Date().toISOString().split('T')[0],
        coordinates: [-4.795, 11.855],
        installments_chosen: 2,
        assigned_agent_id: assignedAgent.id
      });
    }

    if (!targetEst) {
      triggerNotification('Veuillez sélectionner ou enregistrer un établissement.', 'warning');
      return;
    }

    const assignedAgent = APP_USERS.find(u => u.id === assignedAgentId) || APP_USERS[2];

    const hourNum = parseInt(appointmentTime.split(':')[0], 10) || 10;
    const timeEnd = `${String(hourNum + 1).padStart(2, '0')}:00`;

    // Add event directly to Agent's Calendar
    storageService.addAgentEvent({
      agentId: assignedAgent.id,
      agentName: assignedAgent.name,
      agentBadge: assignedAgent.badge,
      establishmentId: targetEst.id,
      establishmentName: targetEst.name,
      promoterName: targetEst.promoter_name,
      phone: targetEst.phone,
      arrondissement: targetEst.arrondissement,
      quartier: targetEst.quartier,
      address: targetEst.address,
      date: appointmentDate,
      timeStart: appointmentTime,
      timeEnd,
      type: 'ENCAISSEMENT_ACOMPTE',
      status: 'A_FAIRE',
      priority: 'HAUTE',
      amountDue: Number(depositAmount) || targetEst.balance_due,
      notes: `Rendez-vous convenu au Guichet Bureau DDL-PN. L'exploitant ${targetEst.promoter_name} demande le passage de l'agent ${assignedAgent.name} sur place pour recouvrement de ${Number(depositAmount).toLocaleString('fr-FR')} FCFA.`,
      isSynced: true
    });

    reloadAll();
    triggerNotification(`Rendez-vous de recouvrement sur place programmé pour l'Agent ${assignedAgent.name} le ${appointmentDate} à ${appointmentTime} !`, 'success');

    // Reset form
    setSelectedEstId('');
    setEstSearchInput('');
    setIsCreatingNewEst(false);
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
    <div className="space-y-6 select-none">
      {/* Guichet Bureau Main Header */}
      <div className="bg-gradient-to-r from-[#022448] via-[#023b75] to-[#006d2f] text-white p-5 rounded-2xl shadow-md border border-[#033468] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full font-mono-ref uppercase tracking-wide">
              GUICHET UNIQUE DE PAIEMENT & ACCUEIL
            </span>
            <span className="text-xs text-emerald-200 font-semibold">Direction Départementale des Loisirs (DDL-PN)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-republic tracking-tight">
            Guichet de Règlement, Enregistrement & Planification Terrain
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-3xl">
            Saisie de l'établissement (enregistré ou nouveau), encaissement immédiat au guichet avec délivrance d'Attestation de Dépôt A4 ou programmation de passage sur place avec l'agent SAA affilié.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white/10 border border-white/20 px-3 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-300 uppercase block font-bold">Total Encaissé Guichet</span>
            <span className="font-mono-ref font-black text-amber-300 text-sm">
              {payments.reduce((acc, p) => acc + (p.amount_paid || 0), 0).toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PANNEAU PRINCIPAL DE TRAITEMENT AU GUICHET (RECHERCHE / PAIEMENT / RDV)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-[#022448]/20 shadow-md p-5 sm:p-6 space-y-5">
        <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-[#022448] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#006d2f]" />
              <span>1. Recherche & Identification de l'Établissement</span>
            </h3>
            <p className="text-xs text-slate-500">
              Vérifiez si l'établissement est déjà répertorié ou créez son dossier en direct au guichet.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCreatingNewEst(false);
                setSelectedEstId('');
                setEstSearchInput('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                !isCreatingNewEst ? 'bg-[#022448] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Établissement Déjà Enregistré ({establishments.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreatingNewEst(true);
                setSelectedEstId('');
                setEstSearchInput('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                isCreatingNewEst ? 'bg-[#006d2f] text-white shadow-xs' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nouvel Établissement (Non Enregistré)</span>
            </button>
          </div>
        </div>

        {/* --- CASE A: ÉTABLISSEMENT EXISTANT (SEARCH & AUTO-FILL) --- */}
        {!isCreatingNewEst ? (
          <div className="space-y-4">
            <div className="relative">
              <label className="font-bold text-slate-700 text-xs block mb-1">
                Saisir le Nom de l'Établissement ou du Promoteur :
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Tapez pour filtrer parmi les 117 établissements (ex: Mexx House, Baobab, Christian Bitemo...)"
                  value={estSearchInput}
                  onChange={e => {
                    setEstSearchInput(e.target.value);
                    if (selectedEstId) setSelectedEstId('');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#006d2f] focus:outline-none"
                />
              </div>

              {/* Suggestions dropdown */}
              {searchResults.length > 0 && !selectedEstId && (
                <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {searchResults.map(est => (
                    <div
                      key={est.id}
                      onClick={() => handleSelectEst(est)}
                      className="p-3 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900 uppercase flex items-center gap-2">
                          <span>{est.name}</span>
                          <span className="text-[10px] bg-slate-100 font-mono-ref px-1.5 py-0.2 rounded font-bold text-slate-600">
                            {est.arrondissement}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Promoteur : <strong>{est.promoter_name}</strong> • Tél: {est.phone} • {est.activity_type}
                        </div>
                      </div>
                      <div className="text-right font-mono-ref">
                        <span className="font-bold text-[#006d2f] text-xs">Solde: {est.balance_due.toLocaleString('fr-FR')} F</span>
                        <span className="block text-[10px] text-slate-400">Total: {est.total_due.toLocaleString('fr-FR')} F</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Establishment Summary Card */}
            {currentEst && (
              <div className="p-4 bg-slate-50 border-2 border-[#006d2f]/30 rounded-2xl text-xs space-y-3 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#006d2f] uppercase tracking-wider">Fiche Établissement Identifiée</span>
                    <h4 className="text-base font-black text-[#022448] uppercase">{currentEst.name}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-mono-ref font-bold text-[10px] uppercase ${
                    currentEst.status === 'attestation_depot' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    Statut : {currentEst.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Promoteur & Contact</span>
                    <span className="font-bold text-slate-800">{currentEst.promoter_name}</span>
                    <span className="block text-slate-500 font-mono-ref text-[11px]">{currentEst.phone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Localisation & Régime</span>
                    <span className="font-semibold text-slate-800">{currentEst.quartier}, {currentEst.arrondissement}</span>
                    <span className="block font-bold text-blue-900 font-mono-ref text-[10px]">
                      {currentEst.regime_type === 'FORMEL' ? 'Formel (au m²)' : 'Informel (Forfait annuel)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Situation Financière</span>
                    {!isEditingCurrentEstFee ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">Total Dû : {currentEst.total_due.toLocaleString('fr-FR')} F</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditedCurrentEstFee(currentEst.total_due);
                              setIsEditingCurrentEstFee(true);
                            }}
                            className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                          >
                            Modifier
                          </button>
                        </div>
                        <span className="block text-emerald-800 font-mono-ref font-black">
                          Déjà Versé : {currentEst.amount_paid.toLocaleString('fr-FR')} F (Reste: {currentEst.balance_due.toLocaleString('fr-FR')} F)
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 p-2 bg-emerald-50 rounded-lg border border-emerald-300 mt-1">
                        <label className="text-[10px] font-bold text-emerald-950 block">Réviser la Redevance / Forfait (FCFA)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="5000"
                            min="0"
                            value={editedCurrentEstFee}
                            onChange={e => setEditedCurrentEstFee(Number(e.target.value))}
                            className="w-24 p-1 bg-white border border-emerald-500 rounded font-mono-ref text-xs font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newTotal = Math.max(0, Number(editedCurrentEstFee) || 50000);
                              const newBalance = Math.max(0, newTotal - currentEst.amount_paid);
                              storageService.updateEstablishment(currentEst.id, {
                                total_due: newTotal,
                                balance_due: newBalance
                              });
                              setEstablishments(storageService.getEstablishments());
                              setIsEditingCurrentEstFee(false);
                              triggerNotification(`Montant révisé à ${newTotal.toLocaleString('fr-FR')} FCFA pour ${currentEst.name}`, 'success');
                            }}
                            className="px-2 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingCurrentEstFee(false)}
                            className="px-1.5 py-1 bg-slate-200 text-slate-700 rounded text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex gap-1 text-[9px]">
                          <button
                            type="button"
                            onClick={() => setEditedCurrentEstFee(50000)}
                            className="bg-white border border-emerald-400 px-1 py-0.5 rounded text-emerald-800 font-bold"
                          >
                            50 000 F (Forfait DDL)
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditedCurrentEstFee(Math.max(0, editedCurrentEstFee - 10000))}
                            className="bg-white border border-slate-300 px-1 py-0.5 rounded text-slate-700"
                          >
                            -10k
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditedCurrentEstFee(editedCurrentEstFee + 10000)}
                            className="bg-white border border-slate-300 px-1 py-0.5 rounded text-slate-700"
                          >
                            +10k
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#006d2f]" />
                      <span>Agent SAA Lié :</span>
                    </span>
                    <span className="font-extrabold text-[#022448] text-xs block truncate mt-0.5">
                      {APP_USERS.find(u => u.id === currentEst.assigned_agent_id)?.name || currentEst.identified_by || 'Loic AMBETOS (SAA-PN-315)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- CASE B: NOUVEL ÉTABLISSEMENT (ENREGISTREMENT AU GUICHET) --- */
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-bold border-b border-emerald-200 pb-2">
              <Plus className="w-4 h-4 text-[#006d2f]" />
              <span>Saisie des Informations du Nouvel Établissement :</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom de l'Établissement *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Le Safari VIP Lounge"
                  value={newEst.name}
                  onChange={e => setNewEst({ ...newEst, name: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom du Promoteur / Gérant *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Christian BITEMO"
                  value={newEst.promoter_name}
                  onChange={e => setNewEst({ ...newEst, promoter_name: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Téléphone de Contact *</label>
                <input
                  type="text"
                  required
                  value={newEst.phone}
                  onChange={e => setNewEst({ ...newEst, phone: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono-ref"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Arrondissement *</label>
                <select
                  value={newEst.arrondissement}
                  onChange={e => {
                    const code = e.target.value as any;
                    const arrInfo = TERRITORIAL_REFERENTIAL.find(a => a.code === code);
                    const defQ = arrInfo?.quartiers[0] || 'Centre-Ville';
                    setNewEst({ ...newEst, arrondissement: code, quartier: defQ });
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  {TERRITORIAL_REFERENTIAL.map(arr => (
                    <option key={arr.code} value={arr.code}>
                      {arr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">Quartier *</label>
                  <span className="text-[10px] text-emerald-700 font-bold">Arr. lié</span>
                </div>
                <select
                  value={newEst.quartier}
                  onChange={e => setNewEst({ ...newEst, quartier: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {(TERRITORIAL_REFERENTIAL.find(a => a.code === newEst.arrondissement)?.quartiers || []).map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Régime Fiscal *</label>
                <select
                  value={newEst.regime_type}
                  onChange={e => {
                    const reg = e.target.value as RegimeType;
                    const nextFee = reg === 'INFORMEL' ? 50000 : calculateEstablishmentFee(newEst.activity_code, newEst.surface_m2, 'FORMEL').totalDue;
                    setNewEst({ ...newEst, regime_type: reg, custom_total_due: nextFee });
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-blue-900"
                >
                  <option value="INFORMEL">Secteur Informel (Forfait standard : 50 000 FCFA)</option>
                  <option value="FORMEL">Secteur Formel (Tarif au m²)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catégorie d'Activité *</label>
                <select
                  value={newEst.activity_code}
                  onChange={e => {
                    const code = e.target.value;
                    const nextFee = newEst.regime_type === 'INFORMEL' ? (newEst.custom_total_due || 50000) : calculateEstablishmentFee(code, newEst.surface_m2, 'FORMEL').totalDue;
                    setNewEst({ ...newEst, activity_code: code, custom_total_due: nextFee });
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
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
                  value={newEst.surface_m2}
                  onChange={e => {
                    const s = Number(e.target.value);
                    const nextFee = newEst.regime_type === 'INFORMEL' ? (newEst.custom_total_due || 50000) : calculateEstablishmentFee(newEst.activity_code, s, 'FORMEL').totalDue;
                    setNewEst({ ...newEst, surface_m2: s, custom_total_due: nextFee });
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono-ref"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Agent SAA Affilié à ce Local *</label>
                <select
                  value={newEst.assigned_agent_id}
                  onChange={e => {
                    setNewEst({ ...newEst, assigned_agent_id: e.target.value });
                    setAssignedAgentId(e.target.value);
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                >
                  {APP_USERS.filter(u => u.role === 'AGENT_SAA' || u.role === 'ADMIN').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.badge})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Champ Forfait DDL-PN / Redevance Totale Exigible (50 000 FCFA par défaut, révisable manuellement) */}
            <div className="p-3.5 bg-emerald-50/80 border-2 border-emerald-500 rounded-xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                  <span>Redevance Totale Exigible / Forfait DDL-PN (FCFA) *</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {newEst.regime_type === 'INFORMEL' ? 'Forfait informel standard : 50 000 FCFA' : 'Calcul secteur formel'}
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  step="5000"
                  value={newEst.custom_total_due}
                  onChange={e => setNewEst({ ...newEst, custom_total_due: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border-2 border-emerald-600 rounded-lg font-mono-ref font-black text-base text-[#022448] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">FCFA</span>
              </div>

              {/* Quick adjustment buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-500 font-medium text-[10px]">Ajustements rapides :</span>
                <button
                  type="button"
                  onClick={() => setNewEst({ ...newEst, custom_total_due: 50000 })}
                  className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 cursor-pointer text-xs"
                >
                  50 000 F (Forfait DDL)
                </button>
                <button
                  type="button"
                  onClick={() => setNewEst({ ...newEst, custom_total_due: Math.max(0, newEst.custom_total_due - 10000) })}
                  className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-100 cursor-pointer text-xs"
                >
                  -10 000 F (Baisse)
                </button>
                <button
                  type="button"
                  onClick={() => setNewEst({ ...newEst, custom_total_due: newEst.custom_total_due + 10000 })}
                  className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-100 cursor-pointer text-xs"
                >
                  +10 000 F (Hausse)
                </button>
              </div>
              <p className="text-[10px] text-emerald-900 italic">
                * Note administrative : Le forfait informel DDL-PN est de 50 000 FCFA par défaut. Il est librement modifiable manuellement à la baisse comme à la hausse selon les constatations.
              </p>
            </div>
          </div>
        )}

        {/* --- SECTION 2: DÉCISION DU TENANCIER (PAIEMENT IMMÉDIAT VS RDV SUR PLACE) --- */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-[#022448] flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              <span>2. Décision du Tenancier / Modalité d'Exécution</span>
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded font-mono-ref">
              Choix Opérationnel
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Action Option A */}
            <div
              onClick={() => setDeskActionType('PAY_NOW')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                deskActionType === 'PAY_NOW'
                  ? 'border-[#006d2f] bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${deskActionType === 'PAY_NOW' ? 'bg-[#006d2f] text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Option A : Paiement Immédiat au Guichet</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Le promoteur règle son acompte ou solde directement au bureau. Délivrance instantanée de l'Attestation de Dépôt A4 ou Quittance 58mm.
                </p>
              </div>
            </div>

            {/* Action Option B */}
            <div
              onClick={() => setDeskActionType('SCHEDULE_FIELD_VISIT')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                deskActionType === 'SCHEDULE_FIELD_VISIT'
                  ? 'border-[#022448] bg-blue-50/50 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${deskActionType === 'SCHEDULE_FIELD_VISIT' ? 'bg-[#022448] text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Option B : Recouvrement sur Place (Rendez-vous Terrain)</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Le tenancier préfère payer lors du passage de l'agent à son local. Programmation directe dans l'agenda de l'agent SAA affilié.
                </p>
              </div>
            </div>
          </div>

          {/* SUB-FORM FOR OPTION A: ENCAISSEMENT GUICHET */}
          {deskActionType === 'PAY_NOW' ? (
            <form onSubmit={handleExecutePayment} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4 text-xs">
              {/* Quick Choice: Solder vs Acompte */}
              {(() => {
                const effectiveTargetDue = isCreatingNewEst
                  ? (Number(newEst.custom_total_due) || 50000)
                  : (currentEst?.balance_due ?? currentEst?.total_due ?? 50000);

                return (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-800">Action rapide sur le paiement :</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDepositAmount(effectiveTargetDue)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          🟢 Solder tout ({effectiveTargetDue.toLocaleString('fr-FR')} F)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepositAmount(Math.round(effectiveTargetDue / 2))}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                        >
                          🟡 Acompte 50% ({Math.round(effectiveTargetDue / 2).toLocaleString('fr-FR')} F)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepositAmount(25000)}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                        >
                          Acompte 25 000 F
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Montant de l'Acompte / Solde (FCFA) *</label>
                        <input
                          type="number"
                          required
                          min={1000}
                          step={5000}
                          value={depositAmount}
                          onChange={e => setDepositAmount(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border-2 border-emerald-600 rounded-xl font-mono-ref font-black text-emerald-900 text-sm"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Canal de Paiement *</label>
                        <select
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value as any)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                        >
                          <option value="Espèces (Régie)">Espèces (Guichet Régie Bureau)</option>
                          <option value="MTN Mobile Money">MTN Mobile Money</option>
                          <option value="Airtel Money">Airtel Money</option>
                          <option value="Virement Trésor Public">Virement Trésor Public</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Agent SAA Affilié (Attribution) *</label>
                        <select
                          value={assignedAgentId}
                          onChange={e => setAssignedAgentId(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                        >
                          {APP_USERS.filter(u => u.role === 'AGENT_SAA' || u.role === 'ADMIN').map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.badge})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Live Deduction Box */}
                    <div className="p-3 bg-white rounded-xl border border-emerald-300 space-y-1 font-mono-ref text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Total dû :</span>
                        <span className="font-bold text-slate-800">{effectiveTargetDue.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-100 pt-1">
                        <span>Montant versé au guichet :</span>
                        <span>{depositAmount.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-black pt-1 border-t border-emerald-200">
                        <span className="font-sans text-xs uppercase text-slate-700">Reste après déduction :</span>
                        {Math.max(0, effectiveTargetDue - depositAmount) === 0 ? (
                          <span className="px-2 py-0.5 bg-emerald-700 text-white rounded text-xs font-sans">
                            🎉 100% SOLDÉ (Attestation Dépôt / Titre valide)
                          </span>
                        ) : (
                          <span className="text-amber-800 font-bold">
                            {Math.max(0, effectiveTargetDue - depositAmount).toLocaleString('fr-FR')} FCFA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Motif de Règlement</label>
                <input
                  type="text"
                  value={cashierNotes}
                  onChange={e => setCashierNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <div className="text-[11px] text-slate-600 font-mono-ref">
                  Répartition : <strong className="text-emerald-700">{Math.round(depositAmount * 0.7).toLocaleString('fr-FR')} F Trésor (70%)</strong> • <strong className="text-blue-900">{Math.round(depositAmount * 0.3).toLocaleString('fr-FR')} F Régie (30%)</strong>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 bg-[#006d2f] hover:bg-[#005a26] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer hover:scale-[1.01]"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Encaisser & Délivrer l'Attestation de Dépôt A4</span>
                </button>
              </div>
            </form>
          ) : (
            /* SUB-FORM FOR OPTION B: PRONDRE RENDEZ-VOUS SUR PLACE */
            <form onSubmit={handleScheduleFieldVisit} className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-blue-950 font-bold border-b border-blue-200 pb-2">
                <Clock className="w-4 h-4 text-[#022448]" />
                <span>Programmation de la Tournée de Recouvrement in Situ :</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date du Passage sur Place *</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono-ref font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Heure Convenue *</label>
                  <select
                    value={appointmentTime}
                    onChange={e => setAppointmentTime(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="08:30">08:30 (Matinée)</option>
                    <option value="10:00">10:00 (Matinée)</option>
                    <option value="11:30">11:30 (Midi)</option>
                    <option value="14:00">14:00 (Après-midi)</option>
                    <option value="15:30">15:30 (Après-midi)</option>
                    <option value="17:00">17:00 (Fin de journée)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Agent SAA Délégué sur Place *</label>
                  <select
                    value={assignedAgentId}
                    onChange={e => setAssignedAgentId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-[#022448]"
                  >
                    {APP_USERS.filter(u => u.role === 'AGENT_SAA').map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Montant Acompte Convenu (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min={5000}
                    step={5000}
                    value={depositAmount}
                    onChange={e => setDepositAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono-ref font-bold text-emerald-900"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-blue-200">
                <div className="text-[11px] text-blue-900">
                  📌 L'événement apparaîtra instantanément dans le <strong>Google Agenda de l'Agent (MOD-03)</strong> avec statut « À FAIRE ».
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 bg-[#022448] hover:bg-[#033468] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer hover:scale-[1.01]"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>Enregistrer le Rendez-vous & Assigner la Mission</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* =========================================================================
          JOURNAL DES OPÉRATIONS DU GUICHET (REÇUS DÉLIVRÉS & RDV PROGRAMMÉS)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryTab('RECEIPTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                historyTab === 'RECEIPTS' ? 'bg-[#006d2f] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Quittances & Attestations Délivrées ({payments.length})</span>
            </button>
            <button
              onClick={() => setHistoryTab('SCHEDULED_VISITS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                historyTab === 'SCHEDULED_VISITS' ? 'bg-[#022448] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Rendez-vous de Recouvrement Terrain ({tourneeEvents.filter(e => e.type === 'ENCAISSEMENT_ACOMPTE').length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher dans le journal..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006d2f]"
            />
          </div>
        </div>

        {/* Tab 1: Receipts Grid */}
        {historyTab === 'RECEIPTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payments
              .filter(p =>
                p.receipt_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.establishment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.promoter_name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(record => (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
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

                    <h4 className="font-extrabold text-sm text-slate-900 uppercase truncate">
                      {record.establishment_name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Promoteur : <span className="font-semibold">{record.promoter_name}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">{record.arrondissement}</p>

                    <div className="bg-slate-50 p-3 rounded-xl border my-3 space-y-1 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-600">Encaissé :</span>
                        <span className="font-mono-ref font-black text-emerald-800 text-sm">
                          {record.amount_paid.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Mode :</span>
                        <span>{record.payment_method}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Guichetier :</span>
                        <span className="truncate max-w-[150px]">{record.collected_by}</span>
                      </div>
                    </div>
                  </div>

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
              ))}
          </div>
        )}

        {/* Tab 2: Scheduled Field Recovery Visits */}
        {historyTab === 'SCHEDULED_VISITS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-[#022448] text-white text-[11px] font-bold">
                <tr>
                  <th className="p-3">Date & Heure</th>
                  <th className="p-3">Établissement & Promoteur</th>
                  <th className="p-3">Localisation</th>
                  <th className="p-3">Agent SAA Assigné</th>
                  <th className="p-3 text-right">Montant Convenu</th>
                  <th className="p-3 text-center">Statut Mission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tourneeEvents
                  .filter(e => e.type === 'ENCAISSEMENT_ACOMPTE')
                  .map(evt => (
                    <tr key={evt.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono-ref font-bold text-slate-800">
                        {evt.date} à {evt.timeStart}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 uppercase block">{evt.establishmentName}</span>
                        <span className="text-[11px] text-slate-500">{evt.promoterName} ({evt.phone})</span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {evt.quartier}, {evt.arrondissement}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-[#022448] flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#006d2f]" />
                          <span>{evt.agentName}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-ref">{evt.agentBadge}</span>
                      </td>
                      <td className="p-3 text-right font-mono-ref font-bold text-emerald-800">
                        {(evt.amountDue || 0).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-mono-ref font-bold text-[10px] ${
                          evt.status === 'EFFECTUE' ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {evt.status === 'EFFECTUE' ? '✓ Recouvert in situ' : '⏳ Tournée Programmée'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
