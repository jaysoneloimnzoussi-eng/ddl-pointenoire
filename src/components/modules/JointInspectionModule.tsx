import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Volume2,
  Flame,
  Building2,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Plus,
  Search,
  Filter,
  Users,
  Award,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Radio,
  FileText
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { Establishment, JointInspectionRecord, ArrondissementCode } from '../../types';
import { PrintModal } from '../print/PrintModal';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { formatDateFR } from '../../utils/dateUtils';
import { TERRITORIAL_REFERENTIAL } from '../../constants/referential';

export const JointInspectionModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [inspections, setInspections] = useState<JointInspectionRecord[]>(() => storageService.getJointInspections());
  const [establishments] = useState<Establishment[]>(() => storageService.getEstablishments());

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');
  const [filterArrondissement, setFilterArrondissement] = useState<string>('ALL');

  // New Inspection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string>(establishments[0]?.id || '');
  const [noiseLevelDb, setNoiseLevelDb] = useState<number>(76);
  const [isMeasuringSound, setIsMeasuringSound] = useState(false);
  const [noiseNotes, setNoiseNotes] = useState('Limiteur acoustique testé et scellé. Voie publique préservée.');
  const [extinguishersCount, setExtinguishersCount] = useState<number>(3);
  const [extinguishersValid, setExtinguishersValid] = useState<boolean>(true);
  const [emergencyExitsClear, setEmergencyExitsClear] = useState<boolean>(true);
  const [evacuationPlanDisplayed, setEvacuationPlanDisplayed] = useState<boolean>(true);
  const [sanitaryFacilitiesOk, setSanitaryFacilitiesOk] = useState<boolean>(true);
  const [ventilationOk, setVentilationOk] = useState<boolean>(true);
  const [wasteManagementOk, setWasteManagementOk] = useState<boolean>(true);
  const [administrativeCompliant, setAdministrativeCompliant] = useState<boolean>(true);
  const [policeOrderCompliant, setPoliceOrderCompliant] = useState<boolean>(true);
  const [globalVerdict, setGlobalVerdict] = useState<'FAVORABLE' | 'FAVORABLE_AVEC_RESERVES' | 'DEFAVORABLE'>('FAVORABLE');
  const [prescriptions, setPrescriptions] = useState<string>('Maintenir le calibrage du limiteur acoustique.\nVérification périodique des extincteurs.');

  // Print Modal
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: 'PV_COMMISSION_MIXTE_A4' | 'MACARON_OFFICIEL_VITRINE_A4';
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'PV_COMMISSION_MIXTE_A4',
    title: '',
    data: null
  });

  // Sound meter live simulation
  const toggleSoundMeter = () => {
    if (isMeasuringSound) {
      setIsMeasuringSound(false);
    } else {
      setIsMeasuringSound(true);
      const interval = setInterval(() => {
        setNoiseLevelDb(prev => {
          const delta = (Math.random() * 8) - 4;
          const next = Math.round(Math.min(105, Math.max(50, prev + delta)));
          return next;
        });
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        setIsMeasuringSound(false);
      }, 6000);
    }
  };

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const est = establishments.find(e => e.id === selectedEstablishmentId);
    if (!est) {
      triggerNotification('Veuillez sélectionner un établissement valide.', 'error');
      return;
    }

    const prescriptionList = prescriptions
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const noiseCompliant = noiseLevelDb <= 85;
    const fireSafetyCompliant = extinguishersCount >= 2 && extinguishersValid && emergencyExitsClear;
    const hygieneCompliant = sanitaryFacilitiesOk && ventilationOk && wasteManagementOk;

    const newRecord = storageService.saveJointInspection({
      establishment_id: est.id,
      establishment_name: est.name,
      promoter_name: est.promoter_name,
      arrondissement: est.arrondissement,
      quartier: est.quartier,
      address: est.address,
      inspection_date: new Date().toISOString().split('T')[0],
      noise_level_db: noiseLevelDb,
      noise_compliant: noiseCompliant,
      noise_notes: noiseNotes,
      extinguishers_count: extinguishersCount,
      extinguishers_valid: extinguishersValid,
      emergency_exits_clear: emergencyExitsClear,
      evacuation_plan_displayed: evacuationPlanDisplayed,
      fire_safety_compliant: fireSafetyCompliant,
      sanitary_facilities_ok: sanitaryFacilitiesOk,
      ventilation_ok: ventilationOk,
      waste_management_ok: wasteManagementOk,
      hygiene_compliant: hygieneCompliant,
      administrative_compliant: administrativeCompliant,
      police_order_compliant: policeOrderCompliant,
      global_verdict: globalVerdict,
      prescriptions: prescriptionList,
      inspectors: {
        ddl_officer: `${currentUser.name} (${currentUser.title})`,
        fire_safety_officer: 'Capitaine BOUANGA (Sécurité Civile)',
        hygiene_officer: 'Inspecteur MOUNTOU (Hygiène Mairie)',
        police_officer: 'Officier NGOMA (Police Nationale)'
      }
    });

    setInspections(storageService.getJointInspections());
    setIsModalOpen(false);
    triggerNotification(`Procès-Verbal Conjoint ${newRecord.pv_number} dressé avec succès.`, 'success');
  };

  const filteredInspections = useMemo(() => {
    return inspections.filter(item => {
      const matchSearch =
        item.establishment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.promoter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pv_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.quartier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchVerdict = filterVerdict === 'ALL' || item.global_verdict === filterVerdict;
      const matchArr = filterArrondissement === 'ALL' || item.arrondissement === filterArrondissement;

      return matchSearch && matchVerdict && matchArr;
    });
  }, [inspections, searchQuery, filterVerdict, filterArrondissement]);

  // Statistics
  const favorableCount = inspections.filter(i => i.global_verdict === 'FAVORABLE').length;
  const reservesCount = inspections.filter(i => i.global_verdict === 'FAVORABLE_AVEC_RESERVES').length;
  const defavorableCount = inspections.filter(i => i.global_verdict === 'DEFAVORABLE').length;
  const avgDb = inspections.length > 0
    ? Math.round(inspections.reduce((acc, curr) => acc + (curr.noise_level_db || 0), 0) / inspections.length)
    : 78;

  return (
    <div className="space-y-6">
      {/* Official Header Banner */}
      <div className="bg-gradient-to-r from-[#022448] via-[#011b36] to-[#006d2f] text-white p-5 sm:p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <RepublicTricolorBar className="absolute top-0 left-0 right-0 h-1.5" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono-ref">
                COMMISSION MIXTE DÉPARTEMENTALE • VILLE DE POINTE-NOIRE
              </span>
              <span className="text-xs text-amber-200 font-mono-ref">PTA 2026 - MOD-16</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-republic flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <span>Commission Mixte & Contrôle Sonométrique</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Inspections conjointes intersectorielles : <strong>DDL-PN</strong> (Loisirs & Régie), <strong>Sécurité Civile</strong> (Sapeurs-Pompiers), <strong>Hygiène Mairie</strong> et <strong>Police Nationale</strong>.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs transition transform hover:scale-105 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Contrôle Conjoint (PV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Contrôles Mixtes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#022448] dark:text-white font-mono-ref">{inspections.length}</span>
            <span className="text-xs text-emerald-600 font-bold">100% procès-verbaux</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avis Favorables (Conformes)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 font-mono-ref">{favorableCount}</span>
            <span className="text-xs text-slate-500 font-medium">Eligibles au Macaron</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Réserves / Prescriptions</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-500 font-mono-ref">{reservesCount}</span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Délais 48h - 72h</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Moyenne Acoustique</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#006d2f] font-mono-ref">{avgDb} dB</span>
            <span className="text-xs text-slate-500 font-medium">Plafond légal 85 dB</span>
          </div>
        </div>
      </div>

      {/* Sonometer Interactive Visualizer Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-[#022448] dark:text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-600" />
              <span>Sonomètre Réglementaire de Pointe-Noire (Baromètre Sonore)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Mesures comparatives : <strong>55 dB jour</strong> / <strong>45 dB nuit</strong> (limite riveraine) • <strong>85 dB</strong> (intérieur salle).
            </p>
          </div>

          <button
            onClick={toggleSoundMeter}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isMeasuringSound
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-[#022448] hover:bg-[#003870] text-amber-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isMeasuringSound ? 'Mesure en direct active...' : 'Tester le Sonomètre in situ'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase block">Niveau Sonore Actuel</span>
            <span className={`text-4xl font-black font-mono-ref mt-1 block ${
              noiseLevelDb <= 80 ? 'text-emerald-600' : (noiseLevelDb <= 85 ? 'text-amber-500' : 'text-red-600')
            }`}>
              {noiseLevelDb} dB
            </span>
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              noiseLevelDb <= 80 ? 'bg-emerald-100 text-emerald-800' : (noiseLevelDb <= 85 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')
            }`}>
              {noiseLevelDb <= 80 ? 'Confortable & Conforme' : (noiseLevelDb <= 85 ? 'Seuil Limite Toléré' : 'Infraction : Dépassement Sonore')}
            </span>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>0 dB (Silence)</span>
              <span className="text-amber-600">85 dB (Plafond Légal SAA)</span>
              <span className="text-red-600">110 dB (Danger Auditif)</span>
            </div>
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 ${
                  noiseLevelDb <= 80 ? 'bg-emerald-500' : (noiseLevelDb <= 85 ? 'bg-amber-500' : 'bg-red-600')
                }`}
                style={{ width: `${Math.min(100, (noiseLevelDb / 110) * 100)}%` }}
              />
              <div className="absolute top-0 bottom-0 left-[77%] w-0.5 bg-black" title="Plafond 85dB" />
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Conformément à l'Arrêté Municipal sur la tranquillité publique à Pointe-Noire, tout bar ou dancing émettant au-delà de 85 dB sans sas acoustique et limiteur scellé s'expose à une saisie de matériel sono et fermeture sous 72h.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom d'établissement, promoteur, PV, quartier..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#006d2f]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterVerdict}
            onChange={e => setFilterVerdict(e.target.value)}
            className="border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 font-semibold cursor-pointer"
          >
            <option value="ALL">Tous les avis</option>
            <option value="FAVORABLE">Avis Favorable</option>
            <option value="FAVORABLE_AVEC_RESERVES">Favorable avec Réserves</option>
            <option value="DEFAVORABLE">Avis Défavorable</option>
          </select>

          <select
            value={filterArrondissement}
            onChange={e => setFilterArrondissement(e.target.value)}
            className="border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 font-semibold cursor-pointer"
          >
            <option value="ALL">Tous arrondissements</option>
            {TERRITORIAL_REFERENTIAL.map(arr => (
              <option key={arr.code} value={arr.code}>{arr.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-[#022448] dark:text-white uppercase font-republic">
            Registre des Procès-Verbaux de la Commission Mixte ({filteredInspections.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono-ref">Émargement officiel républicain</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b">
              <tr>
                <th className="p-3">Réf PV & Date</th>
                <th className="p-3">Établissement & Promoteur</th>
                <th className="p-3">Arrondissement</th>
                <th className="p-3">Sonométrie (dB)</th>
                <th className="p-3">Incendie & Hygiène</th>
                <th className="p-3">Avis Commission</th>
                <th className="p-3 text-right">Actions Officielles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    Aucun contrôle conjoint ne correspond à votre filtre.
                  </td>
                </tr>
              ) : (
                filteredInspections.map(insp => (
                  <tr key={insp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono-ref">
                      <span className="font-extrabold text-[#022448] dark:text-white block">{insp.pv_number}</span>
                      <span className="text-[10px] text-slate-400">{formatDateFR(insp.inspection_date)}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 dark:text-slate-100 uppercase block">{insp.establishment_name}</span>
                      <span className="text-[11px] text-slate-500">{insp.promoter_name}</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      <span>{insp.arrondissement}</span>
                      <span className="text-[10px] text-slate-400 block">{insp.quartier}</span>
                    </td>
                    <td className="p-3 font-mono-ref">
                      <span className={`font-black text-sm ${insp.noise_compliant ? 'text-emerald-600' : 'text-red-600'}`}>
                        {insp.noise_level_db} dB
                      </span>
                      <span className="text-[10px] text-slate-400 block">{insp.noise_compliant ? 'Conforme' : 'Dépassement'}</span>
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5 text-[10.5px]">
                        <span className={`inline-block px-1.5 py-0.2 rounded font-semibold ${insp.fire_safety_compliant ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                          Pompiers : {insp.extinguishers_count} ext.
                        </span>
                        <span className={`block text-[10px] ${insp.hygiene_compliant ? 'text-emerald-700' : 'text-amber-700'}`}>
                          Hygiène : {insp.hygiene_compliant ? 'Validée' : 'Réserves'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                        insp.global_verdict === 'FAVORABLE'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : (insp.global_verdict === 'FAVORABLE_AVEC_RESERVES'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-red-100 text-red-900 border border-red-300')
                      }`}>
                        {insp.global_verdict === 'FAVORABLE' ? 'FAVORABLE' : (insp.global_verdict === 'FAVORABLE_AVEC_RESERVES' ? 'AVEC RÉSERVES' : 'DÉFAVORABLE')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setPrintDoc({
                              isOpen: true,
                              type: 'PV_COMMISSION_MIXTE_A4',
                              title: `Procès-Verbal Conjoint - ${insp.establishment_name}`,
                              data: insp
                            });
                          }}
                          className="px-2.5 py-1.5 bg-[#022448] hover:bg-[#003870] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                          title="Imprimer le PV Officiel A4 de la Commission Mixte"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PV A4</span>
                        </button>

                        {insp.global_verdict === 'FAVORABLE' && (
                          <button
                            onClick={() => {
                              const est = establishments.find(e => e.id === insp.establishment_id);
                              setPrintDoc({
                                isOpen: true,
                                type: 'MACARON_OFFICIEL_VITRINE_A4',
                                title: `Macaron Officiel - ${insp.establishment_name}`,
                                data: est || {
                                  id: insp.establishment_id,
                                  name: insp.establishment_name,
                                  promoter_name: insp.promoter_name,
                                  arrondissement: insp.arrondissement,
                                  quartier: insp.quartier,
                                  activity_type: 'Établissement Homologué'
                                }
                              });
                            }}
                            className="px-2.5 py-1.5 bg-[#006d2f] hover:bg-[#005a26] text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Générer et Imprimer le Macaron Officiel de Conformité Vitrine"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Macaron</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Joint Inspection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">PROCÉDURE CONTRADICTOIRE INTERSERVICES</span>
                <h3 className="text-lg font-black text-[#022448] dark:text-white uppercase font-republic">
                  Nouveau Contrôle de la Commission Mixte
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-4 text-xs">
              {/* Select Establishment */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Établissement à Contrôler
                </label>
                <select
                  value={selectedEstablishmentId}
                  onChange={e => setSelectedEstablishmentId(e.target.value)}
                  className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  required
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} — {est.promoter_name} ({est.arrondissement}, {est.quartier})
                    </option>
                  ))}
                </select>
              </div>

              {/* 1. Sonometer & Decibels */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-extrabold text-[#022448] dark:text-white uppercase block">
                  1. Contrôle Sonométrique (DDL-PN / SAA)
                </span>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-0.5">
                      Niveau sonore mesuré in situ (dB)
                    </label>
                    <input
                      type="number"
                      min={40}
                      max={120}
                      value={noiseLevelDb}
                      onChange={e => setNoiseLevelDb(Number(e.target.value))}
                      className="w-full border p-2 rounded-lg font-mono-ref font-black text-sm"
                      required
                    />
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-3">
                    Statut acoustique :{' '}
                    <strong className={noiseLevelDb <= 85 ? 'text-emerald-600' : 'text-red-600'}>
                      {noiseLevelDb <= 85 ? 'Conforme (<= 85 dB)' : 'Infraction acoustique (> 85 dB)'}
                    </strong>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-0.5">
                    Observation acoustique & limiteur
                  </label>
                  <input
                    type="text"
                    value={noiseNotes}
                    onChange={e => setNoiseNotes(e.target.value)}
                    className="w-full border p-1.5 rounded-lg text-xs"
                    placeholder="Ex: Limiteur acoustique vérifié et scellé..."
                  />
                </div>
              </div>

              {/* 2. Fire Safety (Sécurité Civile) */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-extrabold text-[#022448] dark:text-white uppercase block">
                  2. Sécurité Incendie & Évacuation (Sécurité Civile)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-0.5">
                      Nombre d'extincteurs vérifiés
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={extinguishersCount}
                      onChange={e => setExtinguishersCount(Number(e.target.value))}
                      className="w-full border p-1.5 rounded-lg font-mono-ref font-bold"
                    />
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={extinguishersValid}
                        onChange={e => setExtinguishersValid(e.target.checked)}
                      />
                      <span>Charges extincteurs valides</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emergencyExitsClear}
                        onChange={e => setEmergencyExitsClear(e.target.checked)}
                      />
                      <span>Issues de secours dégagées</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. Hygiene & Police */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-extrabold text-[#022448] dark:text-white uppercase block">
                  3. Hygiène Publique & Réglementation Police
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sanitaryFacilitiesOk}
                      onChange={e => setSanitaryFacilitiesOk(e.target.checked)}
                    />
                    <span>Commodités sanitaires conformes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ventilationOk}
                      onChange={e => setVentilationOk(e.target.checked)}
                    />
                    <span>Aération / Ventilation adéquate</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wasteManagementOk}
                      onChange={e => setWasteManagementOk(e.target.checked)}
                    />
                    <span>Gestion salubre des déchets</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policeOrderCompliant}
                      onChange={e => setPoliceOrderCompliant(e.target.checked)}
                    />
                    <span>Respect des horaires & mineurs</span>
                  </label>
                </div>
              </div>

              {/* Global Verdict */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Verdict Conjoint de la Commission
                </label>
                <select
                  value={globalVerdict}
                  onChange={e => setGlobalVerdict(e.target.value as any)}
                  className="w-full border p-2 rounded-xl font-bold bg-white dark:bg-slate-800"
                >
                  <option value="FAVORABLE">AVIS FAVORABLE (Conformité totale)</option>
                  <option value="FAVORABLE_AVEC_RESERVES">FAVORABLE AVEC RÉSERVES (Délais 48h - 72h)</option>
                  <option value="DEFAVORABLE">AVIS DÉFAVORABLE (Fermeture administrative recommandée)</option>
                </select>
              </div>

              {/* Prescriptions */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Prescriptions & Recommandations (une par ligne)
                </label>
                <textarea
                  rows={2}
                  value={prescriptions}
                  onChange={e => setPrescriptions(e.target.value)}
                  className="w-full border p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                  placeholder="Prescriptions formulées par la Commission Mixte..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006d2f] hover:bg-[#005a26] text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  Enregistrer & Dresser le PV Officiel
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
    </div>
  );
};
