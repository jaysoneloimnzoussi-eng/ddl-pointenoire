import React, { useState, useMemo } from 'react';
import {
  FileBarChart,
  Printer,
  Calendar,
  Building2,
  Coins,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2,
  TrendingUp,
  Edit3,
  Save,
  RotateCcw,
  Sparkles,
  FileText,
  Shield,
  Layers,
  ChevronRight,
  Send,
  Plus
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { REPUBLIQUE_CONGO, TERRITORIAL_REFERENTIAL } from '../../constants/referential';
import { PrintModal } from '../print/PrintModal';

interface TrimestreReportContent {
  year: string;
  trimestre: 'T1' | 'T2' | 'T3' | 'T4';
  referenceNumber: string;
  periodLabel: string;
  introduction: string;
  tempsForts: string[];
  indicators: Array<{ name: string; target: string; result: string; status: 'ATTEINT' | 'EN_COURS' | 'REPORTE' }>;
  safmBilan: string;
  saaBilan: string;
  ssidBilan: string;
  spaBilan: string;
  nonRealisees: string;
  perspectives: string;
  ceremonies: string;
  difficultes: string;
  recommandations: string;
  conclusion: string;
  dateSubmission: string;
}

const DEFAULT_REPORTS: Record<string, TrimestreReportContent> = {
  '2026-T3': {
    year: '2026',
    trimestre: 'T3',
    referenceNumber: 'RAP-DDL-PN-2026/T3',
    periodLabel: '1er juillet — 30 septembre 2026',
    introduction: `Le présent rapport dresse le bilan des activités du troisième trimestre 2026 de la Direction Départementale des Loisirs (DDL) de Pointe-Noire. Il fait suite au rapport du T2 qui avait consacré la production de la Fiche Technique des manques remise à Monsieur le Ministre le 17 juin 2026 et acté la nécessité d'un passage décisif du plaidoyer à l'action de terrain.`,
    tempsForts: [
      'Déploiement effectif de la Brigade SAA sur le terrain avec 117 établissements recensés et cartographiés.',
      'Recouvrement électronique direct des acomptes in situ et émission de quittances thermiques 58mm.',
      'Avancée des négociations pour les conventions de partenariat stratégique (Globaline, Institut Français, Wing Wah).',
      'Poursuite des contrôles acoustiques contradictoires et apposition de scellés sur les limiteurs sonores.'
    ],
    indicators: [
      { name: 'Contrôle qualité & Recensement SAA', target: '2 missions / Trimestre', result: '117 établissements inspectés', status: 'ATTEINT' },
      { name: 'Recouvrement & Ventilation Trésor (70%)', target: 'Recouvrement continu', result: 'Enregistrements régie conformes', status: 'ATTEINT' },
      { name: 'Conventions de partenariat stratégique', target: '3 conventions cibles', result: 'Projets finalisés avec Globaline & IFPN', status: 'EN_COURS' },
      { name: 'Cartographie SIG et base numérique', target: '1 base consolidée', result: 'Base Supabase 100% opérationnelle', status: 'ATTEINT' },
      { name: 'Activités loisirs sains scolaires & orphelins', target: 'Lancement effectif', result: 'Fiches projets prêtes (attente budget)', status: 'REPORTE' },
      { name: 'Représentations institutionnelles', target: 'Selon agenda officiel', result: '15 août (Indépendance) & 27 sept (JMT)', status: 'ATTEINT' }
    ],
    safmBilan: `Le Service Administratif, Financier et du Matériel a assuré la tenue sans discontinuité des registres de présence, le suivi des courriers officiels et la comptabilité de la Régie des recettes selon la clé de répartition réglementaire (70% Trésor Public / 30% Régie Fonctionnement DDL).`,
    saaBilan: `Le Service de l'Autorisation (SAA), sous la supervision de M. Jacques MATOKO, a mené les missions de contrôle in situ couvrant les 6 arrondissements de Pointe-Noire. 117 établissements de loisirs ont été traités, des convocations contradictoires ont été notifiées et des accords d'échelonnement ont été conclus avec les exploitants.`,
    ssidBilan: `Le Service des Statistiques, de l'Information et de la Documentation a structuré la base de données numérique consolidée, permettant la géolocalisation précise des débits de boissons, lounges et établissements de nuit, et la production d'indicateurs fiables pour le PTA 2026.`,
    spaBilan: `Le Service de la Promotion et Animation a exploité la méthode de la Table Analytique issue du séminaire de mai pour concevoir les fiches projets d'animation scolaire et sociale, tout en renforçant les contacts avec les partenaires stratégiques (Globaline, Institut Français).`,
    nonRealisees: `Le lancement à grande échelle des concours scolaires de scrabble et des tournois sportifs inter-écoles reste suspendu au déblocage de l'enveloppe budgétaire opérationnelle ou à la signature définitive des conventions de sponsoring.`,
    perspectives: `Pour le quatrième trimestre (T4 2026) : clôture annuelle du PTA 2026, intensification des missions de recouvrement du solde auprès des tenanciers, transmission du rapport annuel consolidé et poursuite du plaidoyer pour l'octroi d'un véhicule de service.`,
    ceremonies: `Participation officielle du Directeur Départemental aux cérémonies du 66ème anniversaire de l'Indépendance Nationale (15 août 2026) et aux manifestations de la Journée Mondiale du Tourisme et des Loisirs (27 septembre 2026).`,
    difficultes: `Persistance du manque de moyens de locomotion autonomes (absence de véhicule et de motos), locaux administratifs exigus ne garantissant pas la confidentialité des auditions, et conflits de compétence territoriaux avec les services municipaux.`,
    recommandations: `1. Obtenir l'arbitrage ministériel sur l'allocation budgétaire minimale de 3 696 000 FCFA. 2. Affecter 5 agents fonctionnaires supplémentaires pour renforcer la Brigade SAA. 3. Finaliser la signature des conventions avec Globaline, l'Institut Français et Wing Wah.`,
    conclusion: `Le troisième trimestre 2026 confirme la montée en puissance opérationnelle de la DDL-PN. Grâce à la digitalisation des procédures et à l'engagement des agents de terrain, la régulation des loisirs devient une réalité tangible à Pointe-Noire.`,
    dateSubmission: '2026-09-30'
  }
};

export const QuarterlyReportsModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [selectedTrimestre, setSelectedTrimestre] = useState<'T1' | 'T2' | 'T3' | 'T4'>('T3');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'EDITOR'>('PREVIEW');

  const stats = storageService.getSystemStats();
  const reportKey = `${selectedYear}-${selectedTrimestre}`;

  // Report state with local storage persistence
  const [reportsStore, setReportsStore] = useState<Record<string, TrimestreReportContent>>(() => {
    const saved = localStorage.getItem('ddl_pn_quarterly_reports_store');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_REPORTS;
  });

  const currentReport: TrimestreReportContent = useMemo(() => {
    if (reportsStore[reportKey]) return reportsStore[reportKey];
    return {
      year: selectedYear,
      trimestre: selectedTrimestre,
      referenceNumber: `RAP-DDL-PN-${selectedYear}/${selectedTrimestre}`,
      periodLabel: selectedTrimestre === 'T1' ? `1er janvier — 31 mars ${selectedYear}`
        : selectedTrimestre === 'T2' ? `1er avril — 30 juin ${selectedYear}`
        : selectedTrimestre === 'T3' ? `1er juillet — 30 septembre ${selectedYear}`
        : `1er octobre — 31 décembre ${selectedYear}`,
      introduction: `Rapport d'activités officiel du ${selectedTrimestre} ${selectedYear} de la Direction Départementale des Loisirs de Pointe-Noire.`,
      tempsForts: [
        'Continuité de la gestion administrative et suivi des dossiers.',
        'Missions de contrôle et assainissement des loisirs à Pointe-Noire.'
      ],
      indicators: [
        { name: 'Missions de contrôle qualité', target: '2 missions', result: 'Exécuté', status: 'ATTEINT' },
        { name: 'Recouvrement régie', target: 'Selon barème', result: 'En cours', status: 'EN_COURS' }
      ],
      safmBilan: 'Gestion courante administrative et financière assurée.',
      saaBilan: 'Traitement des dossiers et régularisation des exploitants de loisirs.',
      ssidBilan: 'Mise à jour des statistiques départementales.',
      spaBilan: 'Animation et sensibilisation aux loisirs sains.',
      nonRealisees: 'Activités reportées faute de moyens logistiques.',
      perspectives: 'Poursuite des objectifs du Plan de Travail Annuel.',
      ceremonies: 'Représentation officielle de la DDL aux événements du département.',
      difficultes: 'Absence de véhicule de service et contraintes budgétaires.',
      recommandations: 'Allocation de moyens logistiques et validation des partenariats.',
      conclusion: 'Le bilan trimestriel témoigne de la détermination du personnel de la DDL-PN.',
      dateSubmission: new Date().toISOString().split('T')[0]
    };
  }, [reportsStore, reportKey, selectedYear, selectedTrimestre]);

  const [editForm, setEditForm] = useState<TrimestreReportContent>(currentReport);

  // Sync edit form when changing trimester or year
  React.useEffect(() => {
    setEditForm(currentReport);
  }, [currentReport]);

  const handleSaveReport = () => {
    const updatedStore = {
      ...reportsStore,
      [reportKey]: editForm
    };
    setReportsStore(updatedStore);
    localStorage.setItem('ddl_pn_quarterly_reports_store', JSON.stringify(updatedStore));
    triggerNotification(`Rapport ${selectedTrimestre} ${selectedYear} enregistré avec succès !`, 'success');
    setActiveTab('PREVIEW');
  };

  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: 'RAPPORT_TRIMESTRIEL_A4';
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'RAPPORT_TRIMESTRIEL_A4',
    title: '',
    data: null
  });

  const handlePrintReport = () => {
    setPrintDoc({
      isOpen: true,
      type: 'RAPPORT_TRIMESTRIEL_A4',
      title: `Rapport Trimestriel d'Activité - ${selectedTrimestre} ${selectedYear}`,
      data: {
        ...currentReport,
        stats,
        author: currentUser.name,
        badge: currentUser.badge,
        signataire: 'Jean Richard NTSEKE NGOUAKA',
        signataireTitre: 'Directeur Départemental des Loisirs de Pointe-Noire'
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#006d2f] text-white font-bold px-2.5 py-0.5 rounded-full font-mono-ref">
              PTA {selectedYear} • MCAPNIT / DGL
            </span>
            <span className="text-xs text-slate-500 font-medium">Générateur & Concepteur de Rapports Officiels</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2 font-republic">
            <FileBarChart className="w-5 h-5 text-[#006d2f]" />
            <span>Rapports Trimestriels d'Activité & de Recouvrement</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Concevez, rédigez et imprimez les rapports trimestriels officiels à soumettre à Monsieur le Directeur Départemental et au Ministère.
          </p>
        </div>

        {/* Year, Quarter & Tab Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#022448] outline-none"
          >
            <option value="2025">Année 2025</option>
            <option value="2026">Année 2026</option>
            <option value="2027">Année 2027</option>
            <option value="2028">Année 2028</option>
          </select>

          {/* Quarter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border text-xs font-bold">
            {(['T1', 'T2', 'T3', 'T4'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTrimestre(t)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedTrimestre === t
                    ? 'bg-[#006d2f] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border text-xs font-bold">
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'PREVIEW'
                  ? 'bg-[#022448] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Aperçu Officiel</span>
            </button>
            <button
              onClick={() => setActiveTab('EDITOR')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'EDITOR'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Rédiger / Éditer</span>
            </button>
          </div>

          {/* Print A4 button */}
          <button
            onClick={handlePrintReport}
            className="bg-gradient-to-r from-red-900 via-[#850404] to-red-950 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow hover:scale-[1.02] transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Imprimer Rapport A4</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Période Couverte</span>
          <p className="font-extrabold text-sm text-[#022448] mt-1">{currentReport.periodLabel}</p>
          <p className="text-emerald-700 font-semibold mt-0.5">{selectedTrimestre} {selectedYear} • DDL-PN</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Recettes Encaissées Régie</span>
          <p className="font-mono-ref font-black text-lg text-emerald-800 mt-0.5">
            {stats.totalPaid.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-slate-500 mt-0.5">Trésor (70%) : {Math.round(stats.totalPaid * 0.7).toLocaleString('fr-FR')} F</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Établissements Contrôlés</span>
          <p className="font-mono-ref font-black text-lg text-[#022448] mt-0.5">
            {stats.totalEst} Dossiers
          </p>
          <p className="text-slate-500 mt-0.5">7 zones de Pointe-Noire couvertes</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Décisions & Mises en Demeure</span>
          <p className="font-mono-ref font-black text-lg text-red-700 mt-0.5">
            {stats.underSanction} Actes émis
          </p>
          <p className="text-slate-500 mt-0.5">Brigade SAA / Contrôle qualité</p>
        </div>
      </div>

      {/* TAB CONTENT: PREVIEW OR EDITOR */}
      {activeTab === 'PREVIEW' ? (
        /* OFFICIAL REPORT PREVIEW (A4 STRUCTURED DOCUMENT) */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          {/* Official Document Banner */}
          <div className="border-b pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono-ref">
                  {currentReport.referenceNumber}
                </span>
                <span className="text-xs text-slate-500">Document Officiel de Gouvernance</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#022448] font-republic mt-2 uppercase tracking-wide">
                Rapport d'Activités du {selectedTrimestre === 'T1' ? 'Premier' : selectedTrimestre === 'T2' ? 'Deuxième' : selectedTrimestre === 'T3' ? 'Troisième' : 'Quatrième'} Trimestre {selectedYear}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Direction Départementale des Loisirs de Pointe-Noire • Période : {currentReport.periodLabel}
              </p>
            </div>
            <div className="text-right font-serif text-xs hidden sm:block">
              <p className="text-slate-500">Destinataire :</p>
              <p className="font-bold text-[#022448]">Monsieur le Directeur Départemental</p>
              <p className="text-[10px] text-slate-400">Direction Générale des Loisirs (Brazzaville)</p>
            </div>
          </div>

          {/* 1. Introduction */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-[#006d2f] pl-2.5">
              1. Introduction & Contexte
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              {currentReport.introduction}
            </p>
          </div>

          {/* Temps Forts */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-amber-600 pl-2.5">
              Temps Forts du Trimestre
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {currentReport.tempsForts.map((tf, i) => (
                <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2 text-xs shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <p className="text-slate-700">{tf}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Tableau de bord des Indicateurs PTA */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-[#022448] pl-2.5">
              2. Synthèse du Bilan Trimestriel — Tableau de Bord PTA {selectedYear}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-[#022448] text-white">
                  <tr>
                    <th className="p-2.5 border">Indicateur PTA {selectedYear}</th>
                    <th className="p-2.5 border">Cible</th>
                    <th className="p-2.5 border">Résultat {selectedTrimestre} {selectedYear}</th>
                    <th className="p-2.5 border text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentReport.indicators.map((ind, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 border font-semibold text-slate-800">{ind.name}</td>
                      <td className="p-2.5 border font-mono-ref">{ind.target}</td>
                      <td className="p-2.5 border font-bold text-slate-900">{ind.result}</td>
                      <td className="p-2.5 border text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            ind.status === 'ATTEINT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ind.status === 'EN_COURS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {ind.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Activités par Service */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-indigo-700 pl-2.5">
              3. Activités Programmées Réalisées par Service
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-extrabold text-[#022448] uppercase">a. Service Administratif, Financier et du Matériel (SAFM)</p>
                <p className="text-slate-700 leading-relaxed text-justify">{currentReport.safmBilan}</p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
                <p className="font-extrabold text-emerald-950 uppercase">b. Service Assistance & Autorisation (SAA)</p>
                <p className="text-slate-700 leading-relaxed text-justify">{currentReport.saaBilan}</p>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1.5">
                <p className="font-extrabold text-blue-950 uppercase">c. Service des Statistiques, Information & Documentation</p>
                <p className="text-slate-700 leading-relaxed text-justify">{currentReport.ssidBilan}</p>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1.5">
                <p className="font-extrabold text-amber-950 uppercase">d. Service de la Promotion et Animation (SPA)</p>
                <p className="text-slate-700 leading-relaxed text-justify">{currentReport.spaBilan}</p>
              </div>
            </div>
          </div>

          {/* 4. Tableau Financier Territorial */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-emerald-700 pl-2.5">
              4. Bilan Financier du Recouvrement par Arrondissement (70% Trésor / 30% Régie)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border">
                <thead className="bg-[#022448] text-white">
                  <tr>
                    <th className="p-2 border">Arrondissement</th>
                    <th className="p-2 border">Locaux Décomptés</th>
                    <th className="p-2 border">Montant Émis (FCFA)</th>
                    <th className="p-2 border">Recouvrement Réalisé</th>
                    <th className="p-2 border">Part Trésor (70%)</th>
                    <th className="p-2 border">Part Régie DDL (30%)</th>
                    <th className="p-2 border">Taux</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.byArrondissement.map(arr => {
                    const tresor = Math.round(arr.paid * 0.7);
                    const regie = arr.paid - tresor;
                    return (
                      <tr key={arr.code} className="hover:bg-slate-50 font-mono-ref">
                        <td className="p-2 border font-sans font-semibold">{arr.arrondissement}</td>
                        <td className="p-2 border">{arr.count}</td>
                        <td className="p-2 border">{arr.due.toLocaleString('fr-FR')}</td>
                        <td className="p-2 border font-bold text-emerald-800">{arr.paid.toLocaleString('fr-FR')}</td>
                        <td className="p-2 border text-blue-800">{tresor.toLocaleString('fr-FR')}</td>
                        <td className="p-2 border text-slate-700">{regie.toLocaleString('fr-FR')}</td>
                        <td className="p-2 border font-bold text-[#006d2f]">{arr.percentRecouvrement}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5, 6, 7. Perspectives & Recommandations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border space-y-1.5">
              <p className="font-bold text-slate-900 uppercase">5. Difficultés & Risques Persistants</p>
              <p className="text-slate-700 leading-relaxed text-justify">{currentReport.difficultes}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-1.5">
              <p className="font-bold text-slate-900 uppercase">6. Suggestions Prioritaires à la Hiérarchie</p>
              <p className="text-slate-700 leading-relaxed text-justify">{currentReport.recommandations}</p>
            </div>
          </div>

          {/* Official Signature Footer */}
          <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-serif italic text-slate-500">Document officiel généré par le Système DDL-PN</p>
              <p className="font-bold text-[#022448]">Pointe-Noire, le {currentReport.dateSubmission}</p>
            </div>

            <div className="text-right font-serif">
              <p className="text-slate-600">Pour l'Autorité Administrative,</p>
              <p className="text-[11px] text-slate-500 italic">Le Directeur Départemental des Loisirs</p>
              <div className="h-10 flex items-center justify-end text-slate-400 italic text-xs">
                [Signature & Cachet Officiel]
              </div>
              <p className="font-black text-[#022448] text-sm">Jean Richard NTSEKE NGOUAKA</p>
            </div>
          </div>
        </div>
      ) : (
        /* INTERACTIVE REPORT EDITOR */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-black text-[#022448] font-republic uppercase">
                Édition du Rapport Trimestriel ({selectedTrimestre} {selectedYear})
              </h3>
              <p className="text-xs text-slate-500">
                Personnalisez les textes, chiffres et constats du rapport. Les modifications s'enregistrent automatiquement dans votre espace.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveReport}
                className="px-4 py-2 bg-[#006d2f] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer le Rapport</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Introduction */}
            <div>
              <label className="block font-bold text-slate-800 uppercase mb-1">
                1. Introduction & Contexte du Trimestre
              </label>
              <textarea
                rows={3}
                value={editForm.introduction}
                onChange={e => setEditForm({ ...editForm, introduction: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-sans focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Services Bilan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">
                  Service Administratif & Financier (SAFM)
                </label>
                <textarea
                  rows={3}
                  value={editForm.safmBilan}
                  onChange={e => setEditForm({ ...editForm, safmBilan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-900 uppercase mb-1">
                  Service Assistance & Autorisation (SAA) — Terrain
                </label>
                <textarea
                  rows={3}
                  value={editForm.saaBilan}
                  onChange={e => setEditForm({ ...editForm, saaBilan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-emerald-300 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-blue-900 uppercase mb-1">
                  Service Statistiques & Documentation (SSID)
                </label>
                <textarea
                  rows={3}
                  value={editForm.ssidBilan}
                  onChange={e => setEditForm({ ...editForm, ssidBilan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-blue-300 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-900 uppercase mb-1">
                  Service Promotion & Animation (SPA)
                </label>
                <textarea
                  rows={3}
                  value={editForm.spaBilan}
                  onChange={e => setEditForm({ ...editForm, spaBilan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-amber-300 rounded-xl focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Difficultés et Recommandations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">
                  Difficultés & Contraintes Rencontrées
                </label>
                <textarea
                  rows={3}
                  value={editForm.difficultes}
                  onChange={e => setEditForm({ ...editForm, difficultes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">
                  Recommandations & Suggestions à la Hiérarchie
                </label>
                <textarea
                  rows={3}
                  value={editForm.recommandations}
                  onChange={e => setEditForm({ ...editForm, recommandations: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Perspectives & Conclusion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">
                  Perspectives pour le Trimestre Suivant
                </label>
                <textarea
                  rows={3}
                  value={editForm.perspectives}
                  onChange={e => setEditForm({ ...editForm, perspectives: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">
                  Conclusion Officielle
                </label>
                <textarea
                  rows={3}
                  value={editForm.conclusion}
                  onChange={e => setEditForm({ ...editForm, conclusion: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditForm(DEFAULT_REPORTS['2026-T3'])}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rétablir le modèle par défaut</span>
              </button>

              <button
                type="button"
                onClick={handleSaveReport}
                className="px-6 py-2.5 bg-[#006d2f] hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer & Prévisualiser</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      <PrintModal
        isOpen={printDoc.isOpen}
        onClose={() => setPrintDoc(prev => ({ ...prev, isOpen: false }))}
        documentType="RAPPORT_TRIMESTRIEL_A4"
        title={printDoc.title}
        data={printDoc.data}
      />
    </div>
  );
};
