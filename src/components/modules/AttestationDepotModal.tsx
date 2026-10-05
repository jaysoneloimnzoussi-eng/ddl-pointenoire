import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Printer,
  X,
  Building2,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  Search,
  PlusCircle,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Establishment, ArrondissementCode, RegimeType } from '../../types';
import { TERRITORIAL_REFERENTIAL, ACTIVITY_CATEGORIES, REPUBLIQUE_CONGO } from '../../constants/referential';
import { useSession } from '../../context/SessionContext';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { OfficialVerifiableQrCode } from '../common/OfficialVerifiableQrCode';
import { formatDateFR } from '../../utils/dateUtils';
import { PrintModal } from '../print/PrintModal';

interface AttestationDepotModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedEstId?: string;
}

export const AttestationDepotModal: React.FC<AttestationDepotModalProps> = ({
  isOpen,
  onClose,
  preselectedEstId
}) => {
  const { triggerNotification } = useSession();
  const [establishments, setEstablishments] = useState<Establishment[]>(() => storageService.getEstablishments());
  const [selectedEstId, setSelectedEstId] = useState<string>(preselectedEstId || '');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Form state for the attestation
  const [formData, setFormData] = useState({
    establishment_name: '',
    promoter_title: 'Monsieur',
    promoter_name: '',
    activity_type: 'Établissement de loisirs et divertissements',
    activity_code: 'A2.1',
    arrondissement: '1_LUMUMBA' as ArrondissementCode,
    quartier: 'Centre-Ville',
    address: '',
    reference_number: '',
    date_emission: new Date().toISOString().split('T')[0],
    amount_paid: 30000
  });

  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Reload establishments on open
  useEffect(() => {
    if (isOpen) {
      const all = storageService.getEstablishments();
      setEstablishments(all);

      if (preselectedEstId) {
        setSelectedEstId(preselectedEstId);
      } else if (!selectedEstId && all.length > 0) {
        setSelectedEstId(all[0].id);
      }
    }
  }, [isOpen, preselectedEstId]);

  // When selected establishment changes from dropdown
  useEffect(() => {
    if (isAddingNew) return;

    const est = establishments.find(e => e.id === selectedEstId);
    if (est) {
      const actObj = ACTIVITY_CATEGORIES.find(a => a.code === est.activity_code);
      const activityLabel = actObj ? actObj.label : est.activity_code || 'Établissement de loisirs';
      const refNum = `ATT-DDL-PN-2026/${est.id.slice(-4).toUpperCase()}`;

      setFormData({
        establishment_name: est.name,
        promoter_title: 'Monsieur',
        promoter_name: est.promoter_name || 'Exploitant',
        activity_type: activityLabel,
        activity_code: est.activity_code,
        arrondissement: est.arrondissement,
        quartier: est.quartier || 'Centre-Ville',
        address: est.address || '',
        reference_number: refNum,
        date_emission: new Date().toISOString().split('T')[0],
        amount_paid: est.amount_paid > 0 ? est.amount_paid : 30000
      });
    }
  }, [selectedEstId, establishments, isAddingNew]);

  // Filter establishments for the dropdown
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
        const randId = Math.floor(1000 + Math.random() * 9000);
        setFormData({
          establishment_name: '',
          promoter_title: 'Monsieur',
          promoter_name: '',
          activity_type: 'Bar Dancing / Débit de boissons',
          activity_code: 'A2.1',
          arrondissement: '1_LUMUMBA',
          quartier: 'Centre-Ville',
          address: '',
          reference_number: `ATT-DDL-PN-2026/${randId}`,
          date_emission: new Date().toISOString().split('T')[0],
          amount_paid: 30000
        });
      } else if (establishments.length > 0) {
        setSelectedEstId(establishments[0].id);
      }
      return next;
    });
  };

  const handleLaunchPrint = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.establishment_name.trim()) {
      triggerNotification('Veuillez spécifier le nom de l’établissement.', 'error');
      return;
    }

    // If new establishment, save it to database
    if (isAddingNew) {
      const created = storageService.addEstablishment({
        name: formData.establishment_name.trim(),
        promoter_name: formData.promoter_name.trim() || 'Exploitant',
        phone: '+242 06 000 00 00',
        arrondissement: formData.arrondissement,
        quartier: formData.quartier || 'Centre-Ville',
        address: formData.address || '',
        activity_type: formData.activity_type,
        activity_code: formData.activity_code,
        regime_type: 'INFORMEL',
        surface_m2: 80,
        filing_fee: 50000,
        rate_per_sqm: 0,
        total_due: formData.amount_paid || 50000,
        amount_paid: formData.amount_paid || 30000,
        balance_due: Math.max(0, (formData.amount_paid || 50000) - (formData.amount_paid || 30000)),
        status: 'attestation_depot',
        identified_by: 'Guichet Unique SAA',
        identified_date: new Date().toISOString().split('T')[0],
        installments_chosen: 1,
        coordinates: [-4.7938, 11.8569]
      });
      setEstablishments(storageService.getEstablishments());
      setSelectedEstId(created.id);
      setIsAddingNew(false);
    }

    // Open print preview
    setIsPrintModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#022448] via-[#023871] to-[#006d2f] text-white p-5 shrink-0 relative">
            <RepublicTricolorBar className="absolute top-0 left-0 right-0 h-1.5" />
            <div className="flex items-start justify-between gap-4 mt-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <FileText className="w-6 h-6 text-[#022448]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono-ref font-black uppercase text-amber-300 tracking-wider block">
                    SERVICE ASSISTANCE ET AUTORISATION (SAA) • GUICHET UNIQUE
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-republic tracking-tight flex items-center gap-2">
                    <span>Délivrance d'Attestation de Dépôt</span>
                    <span className="text-xs font-mono-ref bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                      Format A4
                    </span>
                  </h2>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* 1. SELECTION DES ÉTABLISSEMENTS PAR LISTE DÉROULANTE */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-black uppercase text-[#022448] dark:text-amber-300 flex items-center gap-2 font-mono-ref">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Choisir l'établissement bénéficiaire dans la liste déroulante :</span>
                </label>
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
                  <span>{isAddingNew ? 'Revenir à la liste déroulante' : '+ Nouvel établissement hors registre'}</span>
                </button>
              </div>

              {!isAddingNew ? (
                <div className="space-y-2">
                  {/* Dropdown select box */}
                  <div className="relative">
                    <select
                      value={selectedEstId}
                      onChange={e => setSelectedEstId(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border-2 border-emerald-600 dark:border-emerald-500 rounded-xl text-sm font-bold text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        -- Sélectionnez un établissement dans la liste déroulante ({establishments.length} enregistrés) --
                      </option>
                      {filteredEstablishments.map(est => (
                        <option key={est.id} value={est.id}>
                          « {est.name} » — {est.arrondissement} ({est.activity_code}) • Promoteur : {est.promoter_name || 'Non renseigné'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-emerald-700 dark:text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Quick filter search input for large lists */}
                  <div className="flex items-center gap-2 pt-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={filterSearch}
                      onChange={e => setFilterSearch(e.target.value)}
                      placeholder="Filtrer la liste déroulante par nom, quartier ou promoteur..."
                      className="w-full text-xs bg-transparent border-none text-slate-600 dark:text-slate-300 placeholder-slate-400 focus:outline-none"
                    />
                    {filterSearch && (
                      <button
                        type="button"
                        onClick={() => setFilterSearch('')}
                        className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Saisie manuelle d'un nouvel exploitant : les informations renseignées ci-dessous seront immédiatement enregistrées dans la base DDL-PN.</span>
                </div>
              )}
            </div>

            {/* 2. FORMULAIRE & APERÇU EN DIRECT */}
            <form onSubmit={handleLaunchPrint} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Formulaire de validation / ajustement */}
              <div className="lg:col-span-6 space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 font-mono-ref">
                    Paramètres de l'Attestation
                  </h3>
                </div>

                {/* Nom Établissement */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nom Commercial de l'Établissement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.establishment_name}
                    onChange={e => setFormData({ ...formData, establishment_name: e.target.value })}
                    placeholder="Ex: Le Club des Anges, VIP Lounge..."
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-[#022448] dark:text-amber-300"
                  />
                </div>

                {/* Promoteur Civilité + Nom */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Civilité
                    </label>
                    <select
                      value={formData.promoter_title}
                      onChange={e => setFormData({ ...formData, promoter_title: e.target.value })}
                      className="w-full px-2.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl"
                    >
                      <option value="Monsieur">Monsieur</option>
                      <option value="Madame">Madame</option>
                      <option value="La Société">Société</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nom & Prénoms du Promoteur
                    </label>
                    <input
                      type="text"
                      value={formData.promoter_name}
                      onChange={e => setFormData({ ...formData, promoter_name: e.target.value })}
                      placeholder="Ex: Jean-Baptiste MAKAYA"
                      className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-medium"
                    />
                  </div>
                </div>

                {/* Activité */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Activité Réglementaire Récréative
                  </label>
                  <select
                    value={formData.activity_code}
                    onChange={e => {
                      const code = e.target.value;
                      const act = ACTIVITY_CATEGORIES.find(a => a.code === code);
                      setFormData({
                        ...formData,
                        activity_code: code,
                        activity_type: act ? act.label : code
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-medium"
                  >
                    {ACTIVITY_CATEGORIES.map(a => (
                      <option key={a.code} value={a.code}>
                        {a.code} - {a.label} ({a.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Arrondissement & Quartier */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Arrondissement
                    </label>
                    <select
                      value={formData.arrondissement}
                      onChange={e => setFormData({ ...formData, arrondissement: e.target.value as ArrondissementCode })}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-semibold"
                    >
                      {TERRITORIAL_REFERENTIAL.map(ar => (
                        <option key={ar.code} value={ar.code}>
                          {ar.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Quartier / Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.quartier}
                      onChange={e => setFormData({ ...formData, quartier: e.target.value })}
                      placeholder="Ex: Fond Tié-Tié, Grand Marché..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-medium"
                    />
                  </div>
                </div>

                {/* Référence & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      N° Référence Officielle
                    </label>
                    <input
                      type="text"
                      value={formData.reference_number}
                      onChange={e => setFormData({ ...formData, reference_number: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-mono-ref font-bold text-[#850404]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Date d'Émission
                    </label>
                    <input
                      type="date"
                      value={formData.date_emission}
                      onChange={e => setFormData({ ...formData, date_emission: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-medium"
                    />
                  </div>
                </div>

                {/* Acompte / Montant */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Montant Encaissé ou Quittancé (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.amount_paid}
                    onChange={e => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-mono-ref font-black text-emerald-800 dark:text-emerald-400"
                  />
                </div>

                {/* Validation CTA inside left column */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-[#006d2f] to-[#022448] hover:from-emerald-800 hover:to-slate-900 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Printer className="w-5 h-5 text-amber-300" />
                    <span>Délivrer & Imprimer l'Attestation A4</span>
                  </button>
                </div>
              </div>

              {/* Aperçu en direct (Live Preview) */}
              <div className="lg:col-span-6 bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-300 dark:border-slate-800">
                  <span className="text-[10px] font-mono-ref font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Aperçu Direct du Document Réglementaire (A4)
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                    PTA 2026
                  </span>
                </div>

                {/* Document miniature card */}
                <div className="bg-white text-slate-900 p-4 sm:p-5 rounded-xl shadow-md border border-slate-300 font-serif text-[11px] leading-tight space-y-3 flex-1 flex flex-col justify-between">
                  {/* Top Bar miniature */}
                  <div className="flex justify-between items-start border-b border-slate-300 pb-2">
                    <div className="text-left text-[8px] space-y-0.5">
                      <p className="font-extrabold text-[#006d2f] uppercase">RÉPUBLIQUE DU CONGO</p>
                      <p className="italic text-slate-500">Unité - Travail - Progrès</p>
                      <p className="font-bold text-[#022448]">MCAPNIT / DDL-PN</p>
                      <p className="text-[7px] text-slate-600">SERVICE ASSISTANCE & AUTORISATION</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <OfficialRepublicLogo size="xs" showMotto={false} />
                      <RepublicTricolorBar className="w-12 h-0.5 mt-0.5" />
                    </div>

                    <div className="text-right text-[8px] flex flex-col items-end">
                      <p className="italic text-slate-600">Pointe-Noire, le {formatDateFR(formData.date_emission)}</p>
                      <p className="font-mono-ref font-bold text-red-900 text-[8.5px]">{formData.reference_number}</p>
                      <div className="mt-1">
                        <OfficialVerifiableQrCode
                          data={{
                            ref: formData.reference_number,
                            type: 'ATTESTATION_A4',
                            establishment_name: formData.establishment_name,
                            promoter_name: formData.promoter_name,
                            date: formData.date_emission,
                            amount: formData.amount_paid
                          }}
                          size={40}
                          showDetails={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center my-1">
                    <span className="text-[8px] font-mono-ref font-bold text-[#006d2f] uppercase tracking-widest block">
                      TITRE TRANSITOIRE D'EXPLOITATION
                    </span>
                    <h4 className="text-sm font-black uppercase tracking-widest text-[#022448] font-republic underline decoration-[#006d2f] underline-offset-4 mt-0.5">
                      ATTESTATION DE DÉPÔT
                    </h4>
                  </div>

                  {/* Paragraph 1 */}
                  <p className="text-justify text-[9.5px] leading-relaxed">
                    Par la présente, je soussigné, Directeur Départemental des Loisirs de Pointe-Noire, atteste que{' '}
                    <strong className="text-[#022448] font-bold">
                      {formData.promoter_title} {formData.promoter_name || 'l’Exploitant'}
                    </strong>,{' '}
                    a déposé un dossier d'instruction en vue de solliciter l'agrément officiel d'exploitation d'un{' '}
                    <strong>{formData.activity_type}</strong>, dénommé{' '}
                    <strong className="text-[#022448] uppercase">
                      « {formData.establishment_name || '...'} »
                    </strong>, sis à{' '}
                    <span className="italic">{formData.quartier || 'Pointe-Noire'}</span>, {formData.arrondissement}.
                  </p>

                  {/* Paragraph 2 (simplified as requested!) */}
                  <p className="text-justify text-[9.5px] leading-relaxed text-slate-700">
                    La présente attestation est délivrée à titre transitoire pour permettre la continuité des activités durant la phase d'instruction technique et de mise en conformité du dossier.
                  </p>

                  {/* Paragraph 3 */}
                  <p className="text-[9px] font-semibold text-slate-800">
                    En foi de quoi, la présente attestation lui est établie pour servir et valoir ce que de droit. /-
                  </p>

                  {/* Signature block (cleaned up as requested!) */}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-end text-[7.5px]">
                    <div className="text-slate-500 space-y-0.5">
                      <p className="font-bold uppercase text-slate-700">Ampliations :</p>
                      <p>• SAA / SAF / Chrono</p>
                      <p>• Intéressé(e)</p>
                    </div>

                    <div className="text-center font-serif">
                      <p className="text-slate-600">Fait à Pointe-Noire, le {formatDateFR(formData.date_emission)}</p>
                      <p className="text-[7px] italic text-slate-400 py-0.5">[Sceau & Paraphe Officiel]</p>
                      <p className="font-bold text-[#022448] uppercase font-republic">Jean Richard NTSEKE NGOUAKA</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer close */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Official Print Modal (opens when launching print) */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          documentType="ATTESTATION_A4"
          title={`Attestation de Dépôt - ${formData.establishment_name}`}
          data={{
            ...formData,
            reference_number: formData.reference_number,
            receipt_reference: formData.reference_number,
            date_emission: formData.date_emission,
            record_date: formData.date_emission
          }}
        />
      )}
    </>
  );
};
