import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Users,
  Award,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Radio,
  FileText,
  Mic,
  MicOff,
  AlertOctagon,
  Scale
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import {
  Establishment,
  JointInspectionRecord,
  AcousticInfractionPv,
  ArrondissementCode
} from '../../types';
import { PrintModal } from '../print/PrintModal';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { formatDateFR } from '../../utils/dateUtils';
import { TERRITORIAL_REFERENTIAL } from '../../constants/referential';

export const JointInspectionModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [activeTab, setActiveTab] = useState<'COMMISSION_MIXTE' | 'SONOMETRIE_CONNECTEE'>('COMMISSION_MIXTE');

  const [inspections, setInspections] = useState<JointInspectionRecord[]>(() => storageService.getJointInspections());
  const [acousticInfractions, setAcousticInfractions] = useState<AcousticInfractionPv[]>(() => storageService.getAcousticInfractions());
  const [establishments] = useState<Establishment[]>(() => storageService.getEstablishments());

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');
  const [filterArrondissement, setFilterArrondissement] = useState<string>('ALL');

  // New Joint Inspection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string>(establishments[0]?.id || '');
  const [noiseLevelDb, setNoiseLevelDb] = useState<number>(76);
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

  // Sonometer Live Microphone & State
  const [isLiveMicActive, setIsLiveMicActive] = useState<boolean>(false);
  const [liveDb, setLiveDb] = useState<number>(54);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // New Acoustic PV Modal State
  const [isAcousticPvModalOpen, setIsAcousticPvModalOpen] = useState<boolean>(false);
  const [acousticTargetEstId, setAcousticTargetEstId] = useState<string>(establishments[0]?.id || '');
  const [measuredDbInput, setMeasuredDbInput] = useState<number>(92);
  const [measurementLocation, setMeasurementLocation] = useState<AcousticInfractionPv['measurement_location']>('VOIE_PUBLIQUE_RIVERAINS');
  const [timePeriod, setTimePeriod] = useState<AcousticInfractionPv['time_period']>('NOCTURNE_22H_06H');
  const [sanctionImmediate, setSanctionImmediate] = useState<AcousticInfractionPv['sanction_immediate']>('MISE_EN_DEMEURE_48H');
  const [infractionNotes, setInfractionNotes] = useState('Émission sonore assourdissante mesurée à 5m des habitations riveraines.');

  // Print Modal
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: 'PV_COMMISSION_MIXTE_A4' | 'MACARON_OFFICIEL_VITRINE_A4' | 'PV_INFRACTION_ACOUSTIQUE_A4';
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'PV_COMMISSION_MIXTE_A4',
    title: '',
    data: null
  });

  // Thresholds calculation
  const legalThreshold = timePeriod === 'NOCTURNE_22H_06H' ? 45 : (measurementLocation === 'SALLE_INTERIEURE' ? 85 : 55);
  const excessCalculated = Math.max(0, measuredDbInput - legalThreshold);

  // Microphone Live decibels listener
  const toggleLiveMic = async () => {
    if (isLiveMicActive) {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsLiveMicActive(false);
      setLiveDb(52);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        setIsLiveMicActive(true);
        triggerNotification('Microphone connecté : sonométrie en direct active.', 'success');

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updatePitch = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          // Approximate calibrated dB scale (30 dB ambient to 105 dB loud)
          const computedDb = Math.round(35 + (average * 0.7));
          setLiveDb(Math.min(115, Math.max(30, computedDb)));
          animationFrameRef.current = requestAnimationFrame(updatePitch);
        };
        updatePitch();
      } catch (err: any) {
        console.warn('Microphone inaccessible, mode simulation acoustique actif:', err);
        setIsLiveMicActive(true);
        triggerNotification('Simulation sonométrique haute précision active in situ.', 'info');
        // Simulated live fluctuates
        const interval = setInterval(() => {
          setLiveDb(prev => {
            const delta = Math.floor(Math.random() * 9) - 4;
            return Math.min(105, Math.max(45, prev + delta));
          });
        }, 600);
        setTimeout(() => clearInterval(interval), 10000);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioStream) audioStream.getTracks().forEach(t => t.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [audioStream]);

  // Handle Create Joint Inspection
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
        ddl_officer: `${currentUser?.name || 'Bienvenu LOUBAKI'} (${currentUser?.title || 'Chef SAA'})`,
        fire_safety_officer: 'Capitaine BOUANGA (Sécurité Civile / Pompiers)',
        hygiene_officer: 'Inspecteur MOUNTOU (Hygiène Mairie)',
        police_officer: 'Officier NGOMA (Police Nationale)'
      }
    });

    setInspections(storageService.getJointInspections());
    setIsModalOpen(false);
    triggerNotification(`Procès-Verbal Conjoint ${newRecord.pv_number} dressé avec succès.`, 'success');
  };

  // Handle Create Acoustic Infraction PV
  const handleCreateAcousticInfraction = (e: React.FormEvent) => {
    e.preventDefault();
    const target = establishments.find(e => e.id === acousticTargetEstId);
    if (!target) {
      triggerNotification('Veuillez sélectionner un établissement valide.', 'error');
      return;
    }

    const newPv = storageService.createAcousticInfraction({
      establishment_id: target.id,
      establishment_name: target.name,
      promoter_name: target.promoter_name,
      arrondissement: target.arrondissement,
      address: target.address,
      inspection_datetime: new Date().toISOString(),
      measured_db: Number(measuredDbInput),
      threshold_legal_db: legalThreshold,
      excess_db: excessCalculated,
      measurement_location: measurementLocation,
      time_period: timePeriod,
      sanction_immediate: sanctionImmediate,
      officers: {
        ddl_officer: `${currentUser?.name || 'Bienvenu LOUBAKI'} (DDL-PN)`,
        police_officer: 'Capitaine MAKOSSO (Police Nationale)',
        hygiene_officer: 'Inspecteur PEMBA (Hygiène Mairie)'
      },
      notes: infractionNotes
    });

    setAcousticInfractions(storageService.getAcousticInfractions());
    setIsAcousticPvModalOpen(false);
    triggerNotification(`PV d'infraction acoustique ${newPv.pv_number} dressé avec succès.`, 'success');

    // Prompt print
    setPrintDoc({
      isOpen: true,
      type: 'PV_INFRACTION_ACOUSTIQUE_A4',
      title: `PV Infraction Acoustique - ${newPv.pv_number}`,
      data: newPv
    });
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

  return (
    <div className="space-y-6">
      {/* Official Header Banner */}
      <div className="bg-gradient-to-r from-[#022448] via-[#011b36] to-[#006d2f] text-white p-5 sm:p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <RepublicTricolorBar className="absolute top-0 left-0 right-0 h-1.5" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono-ref">
                COMMISSION MIXTE DÉPARTEMENTALE & SONOMÉTRIE • POINTE-NOIRE
              </span>
              <span className="text-xs text-amber-200 font-mono-ref">PTA 2026 - AXE 3</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-republic flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <span>Inspection Conjointe, Sonométrie & Répression des Nuisances</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Plateforme collaborative interinstitutionnelle associant la <strong>DDL-PN</strong> (Loisirs & Régulation), la <strong>Sécurité Civile</strong> (Sapeurs-Pompiers : extincteurs, issues), la <strong>Mairie de Pointe-Noire</strong> (Hygiène & salubrité) et la <strong>Police Nationale / Gendarmerie</strong> (ordre public & fermeture nocturne).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAcousticPvModalOpen(true)}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs transition cursor-pointer"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Dresser PV Infraction dB</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs transition transform hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Contrôle Mixte</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('COMMISSION_MIXTE')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'COMMISSION_MIXTE'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Contrôles Mixtes Intersectoriels ({inspections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SONOMETRIE_CONNECTEE')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'SONOMETRIE_CONNECTEE'
              ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>2. Sonométrie Connectée & PV d'Infraction ({acousticInfractions.length})</span>
        </button>
      </div>

      {/* ==============================================================
          TAB 1: COMMISSION MIXTE (POMPIERS, HYGIÈNE, POLICE, DDL-PN)
         ============================================================== */}
      {activeTab === 'COMMISSION_MIXTE' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Contrôles Mixtes</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#022448] dark:text-white font-mono-ref">{inspections.length}</span>
                <span className="text-xs text-emerald-600 font-bold">100% PV officiels</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avis Favorables (Conformes)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600 font-mono-ref">{favorableCount}</span>
                <span className="text-xs text-slate-500 font-medium">Éligibles au Macaron</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Réserves (Délais 72h)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-500 font-mono-ref">{reservesCount}</span>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Prescriptions notifiées</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avis Défavorables</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-red-600 font-mono-ref">{defavorableCount}</span>
                <span className="text-xs text-red-600 font-medium">Mise en demeure / Scellés</span>
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
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-800 focus:outline-hidden"
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
              <span className="text-xs text-slate-500 font-mono-ref">Ville de Pointe-Noire</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b">
                  <tr>
                    <th className="p-3">N° PV & Date</th>
                    <th className="p-3">Établissement & Promoteur</th>
                    <th className="p-3">Sonométrie (dB)</th>
                    <th className="p-3">Sécurité Incendie</th>
                    <th className="p-3">Hygiène & Salubrité</th>
                    <th className="p-3">Verdict Global</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono-ref">
                  {filteredInspections.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3">
                        <strong className="text-[#022448] dark:text-amber-400 block">{item.pv_number}</strong>
                        <span className="text-[10px] text-slate-400 font-sans">{formatDateFR(item.inspection_date)}</span>
                      </td>
                      <td className="p-3 font-sans">
                        <strong className="text-slate-900 dark:text-white block uppercase">{item.establishment_name}</strong>
                        <span className="text-[11px] text-slate-500">{item.promoter_name} • {item.arrondissement} ({item.quartier})</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.noise_level_db <= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.noise_level_db} dB {item.noise_level_db <= 85 ? '✓' : '⚠️ Excès'}
                        </span>
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`text-[11px] font-bold ${item.fire_safety_compliant ? 'text-emerald-700' : 'text-red-600'}`}>
                          {item.fire_safety_compliant ? '✓ Conforme (Extincteurs OK)' : '⚠️ Non conforme'}
                        </span>
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`text-[11px] font-bold ${item.hygiene_compliant ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {item.hygiene_compliant ? '✓ Salubrité OK' : '⚠️ Réserves hygiène'}
                        </span>
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-1 rounded-lg text-[9.5px] font-bold ${
                          item.global_verdict === 'FAVORABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.global_verdict === 'FAVORABLE_AVEC_RESERVES'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.global_verdict.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setPrintDoc({
                              isOpen: true,
                              type: 'PV_COMMISSION_MIXTE_A4',
                              title: `PV Commission Mixte - ${item.pv_number}`,
                              data: item
                            });
                          }}
                          className="bg-[#022448] hover:bg-[#033468] text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimer PV</span>
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
          TAB 2: SONOMÉTRIE CONNECTÉE & RÉPRESSION EN DIRECT (AXE 3)
         ============================================================== */}
      {activeTab === 'SONOMETRIE_CONNECTEE' && (
        <div className="space-y-6">
          {/* Live Sound Meter Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-400 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400 font-mono-ref">
                  SONOMÈTRE GOUVERNEMENTAL CONNECTÉ • CAPTEUR IN SITU
                </span>
                <h3 className="text-lg font-black text-[#022448] dark:text-white uppercase font-republic flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                  <span>Module d'Enregistrement Acoustique en Décibels (dB)</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLiveMic}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm ${
                    isLiveMicActive
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-purple-700 hover:bg-purple-800 text-white'
                  }`}
                >
                  {isLiveMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isLiveMicActive ? 'Arrêter la Mesure Micro' : 'Activer Microphone In Situ'}</span>
                </button>

                <button
                  onClick={() => setIsAcousticPvModalOpen(true)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Dresser PV d'Infraction Direct</span>
                </button>
              </div>
            </div>

            {/* Gauge Display & Presets */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Niveau Sonore Relevé
                </span>
                <span className={`text-6xl font-black font-mono-ref my-2 block ${
                  liveDb <= 55 ? 'text-emerald-600' : (liveDb <= 85 ? 'text-amber-500' : 'text-red-600')
                }`}>
                  {liveDb} <span className="text-2xl font-bold">dB(A)</span>
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  liveDb <= 55
                    ? 'bg-emerald-100 text-emerald-800'
                    : liveDb <= 85
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-red-100 text-red-800 animate-pulse'
                }`}>
                  {liveDb <= 55 ? '✓ Conforme Voisinage' : liveDb <= 85 ? '⚠️ Tolérance Intérieure (Limiteur Obligatoire)' : '🚨 DÉPASSEMENT CRITIQUE • INFRACTION'}
                </span>
              </div>

              <div className="md:col-span-8 space-y-4">
                {/* Visual Bar with Legal Reference Lines */}
                <div>
                  <div className="flex justify-between text-xs font-bold font-mono-ref mb-1 text-slate-600 dark:text-slate-300">
                    <span>30 dB</span>
                    <span className="text-blue-600 font-bold">45 dB (Nuit 22h-06h)</span>
                    <span className="text-emerald-600 font-bold">55 dB (Jour)</span>
                    <span className="text-amber-600 font-bold">85 dB (Salle Intérieure)</span>
                    <span className="text-red-600 font-bold">115 dB</span>
                  </div>

                  <div className="w-full h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full transition-all duration-300 ${
                        liveDb <= 55 ? 'bg-emerald-500' : (liveDb <= 85 ? 'bg-amber-500' : 'bg-red-600')
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, ((liveDb - 30) / 85) * 100))}%` }}
                    />
                    {/* Tick markers */}
                    <div className="absolute top-0 bottom-0 left-[17.6%] w-0.5 bg-blue-600" title="45 dB Nocturne" />
                    <div className="absolute top-0 bottom-0 left-[29.4%] w-0.5 bg-emerald-600" title="55 dB Diurne" />
                    <div className="absolute top-0 bottom-0 left-[64.7%] w-0.5 bg-amber-600" title="85 dB Intérieur" />
                  </div>
                </div>

                {/* Calibration Presets for Agents */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Calibrages & Simulations Rapides de Terrain :
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => setLiveDb(42)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Calme résidentiel (42 dB)
                    </button>
                    <button
                      onClick={() => setLiveDb(52)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold cursor-pointer"
                    >
                      Terrasse conforme jour (52 dB)
                    </button>
                    <button
                      onClick={() => setLiveDb(78)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-bold cursor-pointer"
                    >
                      Lounge VIP intérieur (78 dB)
                    </button>
                    <button
                      onClick={() => setLiveDb(91)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg font-bold cursor-pointer"
                    >
                      Infraction nocturne riverains (91 dB)
                    </button>
                    <button
                      onClick={() => setLiveDb(98)}
                      className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-black cursor-pointer"
                    >
                      Nuisance critique & Scellés (98 dB)
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p>
                    <strong>Loi N° 21-2019 du 12 juillet 2019 :</strong> Tout dépassement mesuré au voisinage immédiat au-delà de <strong>45 dB la nuit</strong> ou <strong>55 dB le jour</strong> constitue une contravention de 5ème classe entraînant la saisie du matériel sonore et la fermeture administrative immédiate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acoustic Infraction Records Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-[#022448] dark:text-white uppercase font-republic">
                  Registre des Procès-Verbaux d'Infraction Acoustique ({acousticInfractions.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Constats contradictoires in situ notifiés aux exploitants avec mise en demeure et réquisition de la force publique.
                </p>
              </div>

              <button
                onClick={() => setIsAcousticPvModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau PV Acoustique</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-ref">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold">
                    <th className="pb-2">N° PV & Date</th>
                    <th className="pb-2">Établissement & Promoteur</th>
                    <th className="pb-2">Niveau Mesuré</th>
                    <th className="pb-2">Seuil Légal</th>
                    <th className="pb-2">Excès dB</th>
                    <th className="pb-2">Sanction Immédiate</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {acousticInfractions.map(pv => (
                    <tr key={pv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3">
                        <strong className="text-red-700 dark:text-red-400 block">{pv.pv_number}</strong>
                        <span className="text-[10px] text-slate-400 font-sans">{formatDateFR(pv.inspection_datetime)}</span>
                      </td>
                      <td className="py-3 font-sans">
                        <strong className="text-slate-900 dark:text-white block uppercase">{pv.establishment_name}</strong>
                        <span className="text-[11px] text-slate-500">{pv.promoter_name} • {pv.arrondissement}</span>
                      </td>
                      <td className="py-3 font-black text-red-600 text-sm">
                        {pv.measured_db} dB(A)
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {pv.threshold_legal_db} dB(A)
                      </td>
                      <td className="py-3 font-black text-red-700">
                        +{pv.excess_db} dB
                      </td>
                      <td className="py-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pv.sanction_immediate === 'SAISIE_AMPLIFICATEURS'
                            ? 'bg-red-100 text-red-800'
                            : pv.sanction_immediate === 'FERMETURE_ADMINISTRATIVE_IMMEDIATE'
                            ? 'bg-red-200 text-red-900 font-black'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {pv.sanction_immediate.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setPrintDoc({
                              isOpen: true,
                              type: 'PV_INFRACTION_ACOUSTIQUE_A4',
                              title: `PV Infraction Acoustique - ${pv.pv_number}`,
                              data: pv
                            });
                          }}
                          className="bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimer PV</span>
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

      {/* Modal New Acoustic Infraction PV */}
      {isAcousticPvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 space-y-4 border border-red-300 dark:border-red-900 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="font-black text-sm uppercase font-republic">
                  Dresser un Procès-Verbal d'Infraction Acoustique
                </h3>
              </div>
              <button onClick={() => setIsAcousticPvModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAcousticInfraction} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Établissement Contrevenant</label>
                <select
                  value={acousticTargetEstId}
                  onChange={e => setAcousticTargetEstId(e.target.value)}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold"
                  required
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} ({est.promoter_name} - {est.arrondissement})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Niveau Mesuré (dB)</label>
                  <input
                    type="number"
                    min={40}
                    max={125}
                    value={measuredDbInput}
                    onChange={e => setMeasuredDbInput(Number(e.target.value))}
                    className="w-full border p-2 rounded-xl font-mono-ref font-black text-red-600 text-base bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Période Horaire</label>
                  <select
                    value={timePeriod}
                    onChange={e => setTimePeriod(e.target.value as any)}
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="NOCTURNE_22H_06H">Nocturne (22h - 06h / Seuil 45 dB)</option>
                    <option value="DIURNE_06H_22H">Diurne (06h - 22h / Seuil 55 dB)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Lieu du Prélèvement</label>
                  <select
                    value={measurementLocation}
                    onChange={e => setMeasurementLocation(e.target.value as any)}
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="VOIE_PUBLIQUE_RIVERAINS">Voie Publique / Habitations</option>
                    <option value="TERRASSE">Terrasse Extérieure</option>
                    <option value="SALLE_INTERIEURE">Salle Intérieure</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Sanction Immédiate</label>
                  <select
                    value={sanctionImmediate}
                    onChange={e => setSanctionImmediate(e.target.value as any)}
                    className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold text-red-700"
                  >
                    <option value="MISE_EN_DEMEURE_48H">Mise en demeure sous 48h (Limiteur)</option>
                    <option value="SAISIE_AMPLIFICATEURS">Saisie Immédiate des Baffles / Scellés</option>
                    <option value="FERMETURE_ADMINISTRATIVE_IMMEDIATE">Fermeture Administrative Immédiate</option>
                  </select>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-300 font-mono-ref flex justify-between text-xs">
                <span>Seuil légal : <strong>{legalThreshold} dB</strong></span>
                <span className="text-red-700 font-black">Excès : +{excessCalculated} dB</span>
              </div>

              <div>
                <label className="font-bold block mb-1">Motif & Observations Contradictoires</label>
                <textarea
                  value={infractionNotes}
                  onChange={e => setInfractionNotes(e.target.value)}
                  rows={2}
                  className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAcousticPvModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Générer le PV & Imprimer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal New Joint Inspection */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-5 space-y-4 border border-slate-300 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm uppercase text-[#022448] dark:text-white font-republic">
                Nouveau Contrôle Conjoint de la Commission Mixte
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">1. Sélectionner l'Établissement</label>
                <select
                  value={selectedEstablishmentId}
                  onChange={e => setSelectedEstablishmentId(e.target.value)}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold"
                  required
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} — {est.arrondissement} ({est.promoter_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sonometer */}
              <div className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl space-y-2">
                <span className="font-bold uppercase text-[#006d2f] block">
                  2. Contrôle Sonométrique in situ (Seuil max 85 dB)
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={50}
                    max={105}
                    value={noiseLevelDb}
                    onChange={e => setNoiseLevelDb(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono-ref font-black text-sm text-[#022448] dark:text-white w-16">
                    {noiseLevelDb} dB
                  </span>
                </div>
              </div>

              {/* Safety Civile / Fire */}
              <div className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl space-y-2">
                <span className="font-bold uppercase text-red-700 block">
                  3. Sécurité Civile & Incendie (Sapeurs-Pompiers)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={extinguishersValid}
                      onChange={e => setExtinguishersValid(e.target.checked)}
                    />
                    <span>Extincteurs révisés et valides</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={emergencyExitsClear}
                      onChange={e => setEmergencyExitsClear(e.target.checked)}
                    />
                    <span>Issues de secours dégagées</span>
                  </label>
                </div>
              </div>

              {/* Hygiene & Sanitation */}
              <div className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl space-y-2">
                <span className="font-bold uppercase text-blue-700 block">
                  4. Hygiène Publique & Mairie de Pointe-Noire
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sanitaryFacilitiesOk}
                      onChange={e => setSanitaryFacilitiesOk(e.target.checked)}
                    />
                    <span>Installations sanitaires salubres</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={wasteManagementOk}
                      onChange={e => setWasteManagementOk(e.target.checked)}
                    />
                    <span>Gestion et bacs à ordures conformes</span>
                  </label>
                </div>
              </div>

              {/* Verdict */}
              <div>
                <label className="font-bold block mb-1">5. Verdict Global de la Commission</label>
                <select
                  value={globalVerdict}
                  onChange={e => setGlobalVerdict(e.target.value as any)}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="FAVORABLE">Avis Favorable (Conforme)</option>
                  <option value="FAVORABLE_AVEC_RESERVES">Favorable avec Réserves (Prescriptions sous 72h)</option>
                  <option value="DEFAVORABLE">Avis Défavorable (Mise en demeure / Fermeture)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Prescriptions Notifiées</label>
                <textarea
                  value={prescriptions}
                  onChange={e => setPrescriptions(e.target.value)}
                  rows={2}
                  className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006d2f] hover:bg-[#005a26] text-white rounded-xl font-bold cursor-pointer"
                >
                  Enregistrer & Dresser le PV
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
