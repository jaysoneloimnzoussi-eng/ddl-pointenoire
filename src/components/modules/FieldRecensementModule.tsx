import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Building2,
  Phone,
  MapPin,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Printer,
  ChevronRight,
  ShieldAlert,
  Volume2,
  Download,
  RefreshCw,
  Eye,
  CloudDownload
} from 'lucide-react';
import { storageService, calculateEstablishmentFee } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { Establishment, ArrondissementCode, RegimeType, EstablishmentStatus, TerrainPaymentRecord } from '../../types';
import { TERRITORIAL_REFERENTIAL, ACTIVITY_CATEGORIES } from '../../constants/referential';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';

export const FieldRecensementModule: React.FC = () => {
  const { currentUser, triggerNotification, setActiveModule } = useSession();
  const [establishments, setEstablishments] = useState<Establishment[]>(() => storageService.getEstablishmentsForUser(currentUser));

  useEffect(() => {
    setEstablishments(storageService.getEstablishmentsForUser(currentUser));
  }, [currentUser]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArrondissement, setSelectedArrondissement] = useState<string>('ALL');
  const [selectedRegime, setSelectedRegime] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Selected establishment for detail drawer
  const [selectedEst, setSelectedEst] = useState<Establishment | null>(null);

  // New identification modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomQuartier, setIsCustomQuartier] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    promoter_name: '',
    phone: '+242 06 ',
    arrondissement: '1_LUMUMBA' as ArrondissementCode,
    quartier: 'Mpita',
    address: '',
    activity_code: 'A2.1',
    regime_type: 'INFORMEL' as RegimeType,
    rccm: '',
    surface_m2: 80,
    has_acoustic_limiter: false,
    decibel_level: 82,
    lat: -4.7938,
    lng: 11.8569,
    notes: 'Recensement direct Service SAA Pointe-Noire'
  });

  // Direct payment modal
  const [paymentModalEst, setPaymentModalEst] = useState<Establishment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(30000);
  const [paymentMethod, setPaymentMethod] = useState<TerrainPaymentRecord['payment_method']>('MTN Mobile Money');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Print modal state
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: PrintDocumentType;
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'TICKET_58MM',
    title: '',
    data: null
  });

  // Filter logic
  const filteredList = useMemo(() => {
    return establishments.filter(e => {
      const matchSearch =
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.promoter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.quartier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.phone.includes(searchTerm);

      const matchArr = selectedArrondissement === 'ALL' || e.arrondissement === selectedArrondissement;
      const matchRegime = selectedRegime === 'ALL' || e.regime_type === selectedRegime;
      const matchStatus = selectedStatus === 'ALL' || e.status === selectedStatus;

      return matchSearch && matchArr && matchRegime && matchStatus;
    });
  }, [establishments, searchTerm, selectedArrondissement, selectedRegime, selectedStatus]);

  // Handle creation
  const handleCreateEstablishment = (e: React.FormEvent) => {
    e.preventDefault();
    const { filingFee, ratePerSqm, totalDue } = calculateEstablishmentFee(
      newForm.activity_code,
      newForm.surface_m2,
      newForm.regime_type
    );

    const actLabel = ACTIVITY_CATEGORIES.find(c => c.code === newForm.activity_code)?.label || 'Loisirs';

    const created = storageService.addEstablishment({
      name: newForm.name,
      promoter_name: newForm.promoter_name,
      phone: newForm.phone,
      arrondissement: newForm.arrondissement,
      quartier: newForm.quartier,
      address: newForm.address || `${newForm.quartier}, Pointe-Noire`,
      activity_type: actLabel,
      activity_code: newForm.activity_code,
      regime_type: newForm.regime_type,
      rccm: newForm.rccm || undefined,
      surface_m2: Number(newForm.surface_m2),
      filing_fee: filingFee,
      rate_per_sqm: ratePerSqm,
      total_due: totalDue,
      amount_paid: 0,
      balance_due: totalDue,
      status: 'identifie',
      identified_by: `${currentUser.name} (${currentUser.badge})`,
      identified_date: new Date().toISOString().split('T')[0],
      coordinates: [newForm.lat, newForm.lng],
      decibel_level: Number(newForm.decibel_level),
      has_acoustic_limiter: newForm.has_acoustic_limiter,
      installments_chosen: 2,
      notes: newForm.notes
    });

    setEstablishments(storageService.getEstablishmentsForUser(currentUser));
    setIsAddModalOpen(false);
    triggerNotification(`Établissement « ${created.name} » recensé avec succès (ID: ${created.id}).`, 'success');
  };

  // Handle payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalEst) return;

    const { payment, establishment } = storageService.recordPayment({
      establishment_id: paymentModalEst.id,
      amount: Number(paymentAmount),
      payment_method: paymentMethod,
      collected_by: currentUser.name,
      agent_badge: currentUser.badge,
      notes: paymentNotes
    });

    setEstablishments(storageService.getEstablishmentsForUser(currentUser));
    setPaymentModalEst(null);
    triggerNotification(`Encaissement de ${payment.amount_paid.toLocaleString('fr-FR')} FCFA validé (Réf: ${payment.receipt_reference})`, 'success');

    // Auto propose printing
    setPrintDoc({
      isOpen: true,
      type: 'TICKET_58MM',
      title: `Ticket Quittance - ${payment.receipt_reference}`,
      data: {
        ...payment,
        activity_type: establishment.activity_type,
        address: establishment.address
      }
    });
  };

  const getStatusBadge = (status: EstablishmentStatus) => {
    const badges: Record<EstablishmentStatus, { label: string; class: string }> = {
      identifie: { label: 'Identifié (In Situ)', class: 'bg-slate-100 text-slate-700 border-slate-300' },
      convoque: { label: 'Convoqué SAA', class: 'bg-amber-100 text-amber-800 border-amber-300' },
      en_instruction: { label: 'En Instruction', class: 'bg-blue-100 text-blue-800 border-blue-300' },
      attestation_depot: { label: 'Attestation & Acompte', class: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
      transmis_brazzaville: { label: 'Transmis Brazzaville', class: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
      autorise_dgl: { label: 'Autorisé DGL Décret', class: 'bg-[#006d2f] text-white border-emerald-600' },
      mise_en_demeure: { label: 'Mise en Demeure (72h)', class: 'bg-orange-100 text-orange-900 border-orange-400 font-bold' },
      fermeture_administrative: { label: 'Fermeture Administrative', class: 'bg-red-600 text-white border-red-700 font-bold' }
    };
    const b = badges[status] || { label: status, class: 'bg-slate-100 text-slate-700' };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold inline-block ${b.class}`}>
        {b.label}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#022448] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#006d2f]" />
            <span>Portefeuille du Recensement & Recouvrement SAA</span>
            <span className="text-xs bg-emerald-100 text-[#006d2f] font-mono-ref font-bold px-2 py-0.5 rounded">
              {filteredList.length} / {establishments.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Fichier contradictoire officiel des établissements de loisirs de Pointe-Noire (PTA 2026)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModule('MOD-04')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            title="Extraire les établissements depuis votre Google Agenda"
          >
            <CloudDownload className="w-4 h-4 text-blue-200" />
            <span>Importer Google Agenda</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#006d2f] hover:bg-[#005a26] text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Identifier un Établissement In Situ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher nom, promoteur, quartier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006d2f]"
          />
        </div>

        {/* Filter Arrondissement */}
        <div>
          <select
            value={selectedArrondissement}
            onChange={e => setSelectedArrondissement(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006d2f]"
          >
            <option value="ALL">Tous les 6 Arrondissements</option>
            {TERRITORIAL_REFERENTIAL.map(arr => (
              <option key={arr.code} value={arr.code}>
                {arr.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Regime */}
        <div>
          <select
            value={selectedRegime}
            onChange={e => setSelectedRegime(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006d2f]"
          >
            <option value="ALL">Tous régimes (Formel & Informel)</option>
            <option value="FORMEL">Secteur Formel (RCCM)</option>
            <option value="INFORMEL">Secteur Informel (À régulariser)</option>
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006d2f]"
          >
            <option value="ALL">Tous statuts réglementaires</option>
            <option value="identifie">Identifié</option>
            <option value="convoque">Convoqué</option>
            <option value="en_instruction">En instruction</option>
            <option value="attestation_depot">Attestation délivrée</option>
            <option value="transmis_brazzaville">Transmis Brazzaville</option>
            <option value="autorise_dgl">Autorisé DGL</option>
            <option value="mise_en_demeure">Mise en demeure (72h)</option>
            <option value="fermeture_administrative">Fermeture administrative</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#022448] text-white uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-3.5">ID / Nom de l'Établissement</th>
                <th className="py-3 px-3">Arrondissement & Quartier</th>
                <th className="py-3 px-3">Promoteur & Téléphone</th>
                <th className="py-3 px-3">Activité / m²</th>
                <th className="py-3 px-3">Statut SAA</th>
                <th className="py-3 px-3">Redevance / Payé</th>
                <th className="py-3 px-3 text-right">Actions Terrain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.slice(0, 30).map(est => {
                const isPaid = est.balance_due === 0;
                return (
                  <tr key={est.id} className="hover:bg-slate-50 transition group">
                    <td className="py-2.5 px-3.5">
                      <div className="font-extrabold text-slate-900 group-hover:text-[#006d2f]">
                        {est.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono-ref">
                        <span>{est.id}</span>
                        <span>•</span>
                        <span className={est.regime_type === 'FORMEL' ? 'text-blue-700 font-bold' : 'text-amber-700'}>
                          {est.regime_type}
                        </span>
                        {est.decibel_level && (
                          <span className={`px-1 rounded font-bold ${est.decibel_level > 85 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}>
                            {est.decibel_level} dB
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{est.quartier}</div>
                      <div className="text-[10px] text-slate-500">{est.arrondissement}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{est.promoter_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono-ref flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{est.phone}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-slate-800 font-medium">{est.activity_type}</div>
                      <div className="text-[10px] text-slate-500 font-mono-ref">
                        {est.surface_m2} m² • {est.rate_per_sqm} F/m²
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      {getStatusBadge(est.status)}
                    </td>

                    <td className="py-2.5 px-3 font-mono-ref">
                      <div className="font-bold text-slate-900">
                        {est.amount_paid.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Total : {est.total_due.toLocaleString('fr-FR')} FCFA
                      </div>
                      {est.balance_due > 0 ? (
                        <div className="text-[9.5px] text-amber-700 font-semibold">
                          Reste: {est.balance_due.toLocaleString('fr-FR')} F
                        </div>
                      ) : (
                        <div className="text-[9.5px] text-emerald-700 font-bold">Soldé (100%)</div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Detail button */}
                        <button
                          onClick={() => setSelectedEst(est)}
                          title="Voir la fiche contradictoire"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Encaissement Button */}
                        <button
                          onClick={() => {
                            setPaymentModalEst(est);
                            setPaymentAmount(est.balance_due > 0 ? Math.min(50000, est.balance_due) : 0);
                          }}
                          title="Encaisser un acompte"
                          className="bg-emerald-50 hover:bg-emerald-100 text-[#006d2f] border border-emerald-200 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Encaisser</span>
                        </button>

                        {/* Print Ticket / Attestation */}
                        <button
                          onClick={() => {
                            setPrintDoc({
                              isOpen: true,
                              type: est.amount_paid > 0 ? 'ATTESTATION_A4' : 'TICKET_58MM',
                              title: `Titre Officiel - ${est.name}`,
                              data: {
                                ...est,
                                receipt_reference: `REC-DDL-PN-2026-${est.id.slice(-3)}`
                              }
                            });
                          }}
                          title="Imprimer Attestation A4 ou Ticket"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredList.length > 30 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
            Affichage des 30 premiers résultats sur {filteredList.length} établissements trouvés. Utilisez la recherche pour cibler précisément.
          </div>
        )}
      </div>

      {/* Fiche Contradictoire Drawer / Modal */}
      {selectedEst && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200">
            <div className="flex items-start justify-between border-b pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono-ref bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                  {selectedEst.id}
                </span>
                <h3 className="text-xl font-black text-[#022448] uppercase mt-1">{selectedEst.name}</h3>
                <p className="text-xs text-slate-500">Fiche contradictoire officielle d'enquête Service SAA</p>
              </div>
              <button
                onClick={() => setSelectedEst(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Promoteur / Exploitant</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedEst.promoter_name}</p>
                <p className="text-slate-600 mt-1 font-mono-ref">{selectedEst.phone}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Localisation & Zone</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedEst.arrondissement}</p>
                <p className="text-slate-600 mt-1">{selectedEst.quartier} - {selectedEst.address}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Régime & Activité</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedEst.activity_type}</p>
                <p className="text-slate-600 mt-1">Superficie : {selectedEst.surface_m2} m² ({selectedEst.rate_per_sqm} F/m²)</p>
                {selectedEst.rccm && <p className="text-blue-700 font-mono-ref mt-0.5 font-bold">RCCM : {selectedEst.rccm}</p>}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Situation Financière SAA</span>
                <p className="font-mono-ref font-bold text-slate-800 text-sm mt-0.5">
                  Total dû : {selectedEst.total_due.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-emerald-700 font-mono-ref font-bold">
                  Encaissé : {selectedEst.amount_paid.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-amber-800 font-mono-ref">
                  Solde résiduel : {selectedEst.balance_due.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>

            {selectedEst.decibel_level && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="font-bold">Contrôle Acoustique Sonore : </span>
                    <span className="font-mono-ref font-bold text-sm">{selectedEst.decibel_level} dB</span>
                    <span className="text-[10px] text-slate-500 ml-1">(Seuil nocturne max: 85 dB)</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedEst.decibel_level > 85 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {selectedEst.decibel_level > 85 ? 'INFRACTION SONORE' : 'CONFORME'}
                </span>
              </div>
            )}

            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs">
              <span className="text-slate-400 uppercase font-bold text-[10px]">Agent Enquêteur Assigné</span>
              <p className="font-bold text-slate-800">{selectedEst.identified_by}</p>
              <p className="text-slate-500 text-[10px]">Date du constat : {selectedEst.identified_date}</p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t pt-4">
              <button
                onClick={() => {
                  setSelectedEst(null);
                  setPaymentModalEst(selectedEst);
                }}
                className="bg-[#006d2f] hover:bg-[#005a26] text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Encaisser un acompte</span>
              </button>
              <button
                onClick={() => {
                  setPrintDoc({
                    isOpen: true,
                    type: 'ATTESTATION_A4',
                    title: `Attestation Officielle - ${selectedEst.name}`,
                    data: selectedEst
                  });
                }}
                className="bg-[#022448] hover:bg-[#033468] text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Attestation A4</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New In Situ Identification Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-lg font-black text-[#022448]">Recensement In Situ SAA</h3>
                <p className="text-xs text-slate-500">Identification d'un nouvel établissement récréatif</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEstablishment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom de l'établissement *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bar Dancing Ponton La Belle"
                  value={newForm.name}
                  onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom du Promoteur / Gérant *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Michel GOMA"
                    value={newForm.promoter_name}
                    onChange={e => setNewForm({ ...newForm, promoter_name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Téléphone joignable *</label>
                  <input
                    type="text"
                    required
                    value={newForm.phone}
                    onChange={e => setNewForm({ ...newForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Arrondissement *</label>
                  <select
                    value={newForm.arrondissement}
                    onChange={e => {
                      const arr = e.target.value as ArrondissementCode;
                      const arrInfo = TERRITORIAL_REFERENTIAL.find(a => a.code === arr);
                      const defaultQ = arrInfo?.quartiers[0] || 'Centre';
                      setIsCustomQuartier(false);
                      setNewForm({
                        ...newForm,
                        arrondissement: arr,
                        quartier: defaultQ,
                        lat: arrInfo?.sig_coordinates[0] || -4.7938,
                        lng: arrInfo?.sig_coordinates[1] || 11.8569
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f] text-xs font-semibold bg-white"
                  >
                    {TERRITORIAL_REFERENTIAL.map(a => (
                      <option key={a.code} value={a.code}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">
                      Quartier ({TERRITORIAL_REFERENTIAL.find(a => a.code === newForm.arrondissement)?.name.split(' ')[2] || 'Arrondissement'}) *
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold">Référentiel officiel</span>
                  </div>
                  <select
                    value={isCustomQuartier ? 'AUTRE' : newForm.quartier}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'AUTRE') {
                        setIsCustomQuartier(true);
                      } else {
                        setIsCustomQuartier(false);
                        setNewForm({ ...newForm, quartier: val });
                      }
                    }}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f] text-xs font-semibold bg-white cursor-pointer"
                  >
                    {(TERRITORIAL_REFERENTIAL.find(a => a.code === newForm.arrondissement)?.quartiers || []).map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                    <option value="AUTRE">+ Autre quartier / secteur...</option>
                  </select>
                  {isCustomQuartier && (
                    <input
                      type="text"
                      required
                      placeholder="Préciser le nom du quartier..."
                      value={newForm.quartier}
                      onChange={e => setNewForm({ ...newForm, quartier: e.target.value })}
                      className="mt-1.5 w-full p-1.5 border border-amber-400 bg-amber-50/50 rounded text-xs outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Adresse précise / Point de repère</label>
                <input
                  type="text"
                  placeholder="Ex: Face Station X, Avenue de la Paix"
                  value={newForm.address}
                  onChange={e => setNewForm({ ...newForm, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie d'Activité *</label>
                  <select
                    value={newForm.activity_code}
                    onChange={e => setNewForm({ ...newForm, activity_code: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f]"
                  >
                    {ACTIVITY_CATEGORIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.label} ({c.rate_per_sqm_fcfa} F/m²)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Superficie au sol (m²) *</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={newForm.surface_m2}
                    onChange={e => setNewForm({ ...newForm, surface_m2: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secteur / Régime *</label>
                  <select
                    value={newForm.regime_type}
                    onChange={e => setNewForm({ ...newForm, regime_type: e.target.value as RegimeType })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f]"
                  >
                    <option value="INFORMEL">Informel (Frais 30 000 FCFA)</option>
                    <option value="FORMEL">Formel (Frais 50 000 FCFA)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Niveau sonore mesuré (dB)</label>
                  <input
                    type="number"
                    value={newForm.decibel_level}
                    onChange={e => setNewForm({ ...newForm, decibel_level: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f]"
                  />
                </div>
              </div>

              {/* Realtime calculation summary */}
              {(() => {
                const calc = calculateEstablishmentFee(newForm.activity_code, newForm.surface_m2, newForm.regime_type);
                return (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-900 text-xs">
                    <p className="font-bold">Simulation tarifaire automatique :</p>
                    <div className="flex justify-between mt-1">
                      <span>Frais de dossier réglementaires :</span>
                      <span className="font-mono-ref font-bold">{calc.filingFee.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redevance surface ({newForm.surface_m2} m² × {calc.ratePerSqm} F) :</span>
                      <span className="font-mono-ref font-bold">{(newForm.surface_m2 * calc.ratePerSqm).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-300 pt-1 mt-1 font-extrabold text-sm text-[#006d2f]">
                      <span>REDEVANCE TOTALE EXIGIBLE :</span>
                      <span className="font-mono-ref">{calc.totalDue.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded shadow transition"
                >
                  Enregistrer l'Identification SAA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Payment / Encaissement Modal */}
      {paymentModalEst && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-[#022448]">Encaissement Régie SAA</h3>
                <p className="text-xs text-slate-500">{paymentModalEst.name} • Solde: {paymentModalEst.balance_due.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <button onClick={() => setPaymentModalEst(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Montant Encaissé (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="5000"
                  max={paymentModalEst.balance_due || paymentModalEst.total_due}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 border-2 border-emerald-500 rounded font-mono-ref text-lg font-black text-[#006d2f] focus:outline-none"
                />
                <div className="flex gap-2 mt-1.5">
                  {[30000, 50000, 100000, paymentModalEst.balance_due].filter(v => v > 0).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPaymentAmount(v)}
                      className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-[10px] font-mono-ref font-bold"
                    >
                      {v.toLocaleString('fr-FR')} F
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mode de règlement *</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#006d2f]"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money (*105#)</option>
                  <option value="Airtel Money">Airtel Money (*128#)</option>
                  <option value="Espèces (Régie)">Espèces (Régie des Recettes)</option>
                  <option value="Virement Trésor Public">Virement / Chèque Trésor Public</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observations / Reçu de terrain</label>
                <input
                  type="text"
                  placeholder="Ex: Acompte Tranche 1 / Remis sur place"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded border text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Agent Encaisseur :</span>
                  <span className="font-bold">{currentUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Badge Officiel :</span>
                  <span className="font-mono-ref font-bold">{currentUser.badge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Clé Trésor Public (70%) :</span>
                  <span className="font-mono-ref">{Math.round(paymentAmount * 0.7).toLocaleString('fr-FR')} F</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setPaymentModalEst(null)}
                  className="px-3.5 py-2 border rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded shadow transition flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Valider & Générer Quittance</span>
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
