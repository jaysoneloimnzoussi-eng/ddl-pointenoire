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
  Plus,
  Bot,
  Scale,
  Volume2,
  Users,
  MessageSquare
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { REPUBLIQUE_CONGO, TERRITORIAL_REFERENTIAL } from '../../constants/referential';
import { PrintModal } from '../print/PrintModal';
import { AiReportService, GeneratedReport } from '../../services/aiReportService';
import { AiAssistantModal } from '../common/AiAssistantModal';

export const QuarterlyReportsModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [selectedTrimestre, setSelectedTrimestre] = useState<'T1' | 'T2' | 'T3' | 'T4'>('T3');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'EDITOR'>('PREVIEW');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiActionTarget, setAiActionTarget] = useState<string | null>(null);

  const stats = storageService.getSystemStats();
  const reportKey = `${selectedYear}-${selectedTrimestre}`;

  // Store reports with local storage persistence
  const [reportsStore, setReportsStore] = useState<Record<string, GeneratedReport>>(() => {
    const saved = localStorage.getItem('ddl_pn_exhaustive_quarterly_reports_store');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      '2026-T3': AiReportService.generateExhaustiveQuarterlyReport('2026', 'T3'),
      '2026-T2': AiReportService.generateExhaustiveQuarterlyReport('2026', 'T2'),
      '2026-T1': AiReportService.generateExhaustiveQuarterlyReport('2026', 'T1'),
      '2026-T4': AiReportService.generateExhaustiveQuarterlyReport('2026', 'T4')
    };
  });

  const currentReport: GeneratedReport = useMemo(() => {
    if (reportsStore[reportKey]) return reportsStore[reportKey];
    return AiReportService.generateExhaustiveQuarterlyReport(selectedYear, selectedTrimestre);
  }, [reportsStore, reportKey, selectedYear, selectedTrimestre]);

  const [editForm, setEditForm] = useState<GeneratedReport>(currentReport);

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
    localStorage.setItem('ddl_pn_exhaustive_quarterly_reports_store', JSON.stringify(updatedStore));
    triggerNotification(`Rapport exhaustif ${selectedTrimestre} ${selectedYear} enregistré avec succès !`, 'success');
    setActiveTab('PREVIEW');
  };

  const handleGenerateWithAi = () => {
    const generated = AiReportService.generateExhaustiveQuarterlyReport(selectedYear, selectedTrimestre);
    setEditForm(generated);
    const updatedStore = {
      ...reportsStore,
      [reportKey]: generated
    };
    setReportsStore(updatedStore);
    localStorage.setItem('ddl_pn_exhaustive_quarterly_reports_store', JSON.stringify(updatedStore));
    triggerNotification(`Rapport officiel ${selectedTrimestre} ${selectedYear} généré et enrichi avec l'IA DDL-PN !`, 'success');
  };

  const handleEnrichSpecificSection = (sectionKey: keyof GeneratedReport, title: string, instruction: string) => {
    const currentVal = String(editForm[sectionKey] || '');
    const enriched = AiReportService.enrichSection(title, currentVal, instruction);
    setEditForm(prev => ({
      ...prev,
      [sectionKey]: enriched
    }));
    triggerNotification(`Section "${title}" enrichie par l'IA !`, 'success');
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
    <div className="space-y-5 select-none">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#006d2f] text-white font-bold px-2.5 py-0.5 rounded-full font-mono-ref">
              PTA {selectedYear} • MCAPNIT / DGL
            </span>
            <span className="text-xs text-slate-500 font-medium">Générateur & Concepteur de Rapports Officiels Longs</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2 font-republic">
            <FileBarChart className="w-5 h-5 text-[#006d2f]" />
            <span>Rapports Trimestriels d'Activité & de Recouvrement (Format Ministériel)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rédigez, développez avec l'IA et imprimez les rapports complets à soumettre à Monsieur le Directeur Départemental Jean Richard NTSEKE NGOUAKA.
          </p>
        </div>

        {/* Year, Quarter & Tab Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#022448] outline-none cursor-pointer"
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

          {/* AI Assistant Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
            title="Ouvrir l'Assistant IA DDL-PN"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Assistant IA</span>
          </button>

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

      {/* AI Assistant Quick Actions Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#022448] to-[#006d2f] text-white p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-amber-300 block text-xs">
              Générateur Intelligent IA DDL-PN
            </span>
            <p className="text-[11px] text-slate-200">
              Générez instantanément des rapports longs, exhaustifs et structurés intégrant les 118 établissements, les 4 services et la ventilation Trésor (70%) / Régie (30%).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-stretch md:self-auto">
          <button
            onClick={handleGenerateWithAi}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Générer Rapport Complet Exhaustif</span>
          </button>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
            <span>Poser une consigne à l'IA</span>
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
        /* OFFICIAL REPORT PREVIEW (EXHAUSTIVE A4 STRUCTURED DOCUMENT) */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Official Document Banner */}
          <div className="border-b pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono-ref">
                  {currentReport.referenceNumber}
                </span>
                <span className="text-xs text-slate-500">Document Officiel de Gouvernance & de Tutelle</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-[#022448] font-republic mt-2 uppercase tracking-wide">
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
              1. Introduction & Contexte Institutionnel
            </h4>
            <div className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line">
              {currentReport.introduction}
            </div>
          </div>

          {/* Cadre Juridique */}
          {currentReport.cadreJuridique && (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-[#022448] pl-2.5 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#022448]" />
                <span>2. Cadre Légal & Réglementaire Opposable</span>
              </h4>
              <div className="text-xs text-slate-700 leading-relaxed bg-blue-50/40 p-4 rounded-xl border border-blue-200 whitespace-pre-line">
                {currentReport.cadreJuridique}
              </div>
            </div>
          )}

          {/* Temps Forts */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-amber-600 pl-2.5">
              3. Faits Marquants & Temps Forts du Trimestre
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentReport.tempsForts.map((tf, i) => (
                <div key={i} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <p className="text-slate-700 leading-relaxed">{tf}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tableau de bord des Indicateurs PTA */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-[#022448] pl-2.5">
              4. Synthèse d'Exécution du Plan de Travail Annuel (PTA {selectedYear})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-[#022448] text-white">
                  <tr>
                    <th className="p-2.5 border">Indicateur Clé PTA {selectedYear}</th>
                    <th className="p-2.5 border">Cible Annuelle</th>
                    <th className="p-2.5 border">Résultat {selectedTrimestre} {selectedYear}</th>
                    <th className="p-2.5 border text-center">Statut d'Exécution</th>
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

          {/* Activités par Service */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-indigo-700 pl-2.5">
              5. Bilan Détaillé d'Exécution par Service Départemental
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-extrabold text-[#022448] uppercase">a. Service Administratif, Financier et du Matériel (SAFM)</p>
                <div className="text-slate-700 leading-relaxed text-justify whitespace-pre-line">{currentReport.safmBilan}</div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
                <p className="font-extrabold text-emerald-950 uppercase">b. Service Assistance & Autorisation (SAA — Jacques MATOKO)</p>
                <div className="text-slate-700 leading-relaxed text-justify whitespace-pre-line">{currentReport.saaBilan}</div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1.5">
                <p className="font-extrabold text-blue-950 uppercase">c. Service des Statistiques, Information & Documentation (SSID)</p>
                <div className="text-slate-700 leading-relaxed text-justify whitespace-pre-line">{currentReport.ssidBilan}</div>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1.5">
                <p className="font-extrabold text-amber-950 uppercase">d. Service de la Promotion et Animation (SPA)</p>
                <div className="text-slate-700 leading-relaxed text-justify whitespace-pre-line">{currentReport.spaBilan}</div>
              </div>
            </div>
          </div>

          {/* Bilan Territorial & Décompte par Arrondissement */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-emerald-700 pl-2.5">
              6. Décompte & Recouvrement par Arrondissement (Clé 70% Trésor / 30% Régie)
            </h4>
            {currentReport.bilanTerritorial && (
              <div className="text-xs text-slate-700 leading-relaxed bg-emerald-50/30 p-3.5 rounded-xl border border-emerald-200 whitespace-pre-line mb-3">
                {currentReport.bilanTerritorial}
              </div>
            )}
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

          {/* Police Acoustique & Partenariats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <p className="font-extrabold text-[#022448] uppercase flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>7. Police Acoustique & Contrôles Sonométriques</span>
              </p>
              <div className="text-slate-700 leading-relaxed text-justify whitespace-pre-line">{currentReport.policeAcoustique || 'Contrôles in situ effectués sous seuil limite de 80 dB.'}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <p className="font-extrabold text-[#022448] uppercase flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>8. Partenariats Stratégiques (Globaline, IFPN, Wing Wah)</span>
              </p>
              <div className="text-slate-700 leading-relaxed text-justify whitespace-pre-line">{currentReport.partenariats || 'Conventions en cours de formalisation.'}</div>
            </div>
          </div>

          {/* Difficultés & Recommandations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900 uppercase">9. Difficultés Rencontrées & Risques Persistants</p>
              <div className="text-slate-700 leading-relaxed text-justify whitespace-pre-line">{currentReport.difficultes}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900 uppercase">10. Suggestions Prioritaires à Monsieur le Directeur</p>
              <div className="text-slate-700 leading-relaxed text-justify whitespace-pre-line">{currentReport.recommandations}</div>
            </div>
          </div>

          {/* Conclusion */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase border-l-4 border-purple-700 pl-2">
              11. Conclusion & Perspectives
            </h4>
            <div className="text-slate-700 leading-relaxed text-justify bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line">
              {currentReport.conclusion}
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
        /* INTERACTIVE REPORT EDITOR WITH IA ASSISTANCE PER SECTION */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-base font-black text-[#022448] font-republic uppercase">
                Édition du Rapport Trimestriel ({selectedTrimestre} {selectedYear})
              </h3>
              <p className="text-xs text-slate-500">
                Personnalisez chaque section du rapport ou utilisez les boutons IA pour enrichir le texte.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateWithAi}
                className="px-3 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Régénérer Tout avec l'IA</span>
              </button>
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

          <div className="space-y-5 text-xs">
            {/* Introduction */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800 uppercase">
                  1. Introduction & Contexte du Trimestre
                </label>
                <button
                  type="button"
                  onClick={() => handleEnrichSpecificSection('introduction', 'Introduction', 'allonger et détailler le contexte')}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Enrichir avec l'IA</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={editForm.introduction}
                onChange={e => setEditForm({ ...editForm, introduction: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-sans focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Cadre Juridique */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800 uppercase">
                  2. Cadre Légal & Réglementaire Opposable
                </label>
                <button
                  type="button"
                  onClick={() => handleEnrichSpecificSection('cadreJuridique', 'Cadre Légal', 'ajouter les lois et décrets')}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Enrichir les Visas</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={editForm.cadreJuridique}
                onChange={e => setEditForm({ ...editForm, cadreJuridique: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
              />
            </div>

            {/* Services Bilan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 uppercase">
                    Service Administratif & Financier (SAFM)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleEnrichSpecificSection('safmBilan', 'SAFM', 'détailler la comptabilité de régie et le personnel')}
                    className="text-[11px] text-purple-700 font-bold flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>IA</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editForm.safmBilan}
                  onChange={e => setEditForm({ ...editForm, safmBilan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-emerald-900 uppercase">
                    Service Assistance & Autorisation (SAA) — Jacques MATOKO
                  </label>
                  <button
                    type="button"
                    onClick={() => handleEnrichSpecificSection('saaBilan', 'SAA', 'détailler les opérations de brigade in situ et convocations')}
                    className="text-[11px] text-emerald-700 font-bold flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>IA</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editForm.saaBilan}
                  onChange={e => setEditForm({ ...editForm, saaBilan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-emerald-300 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-blue-900 uppercase">
                    Service Statistiques & Documentation (SSID)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleEnrichSpecificSection('ssidBilan', 'SSID', 'détailler la cartographie SIG et la base Supabase')}
                    className="text-[11px] text-blue-700 font-bold flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>IA</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editForm.ssidBilan}
                  onChange={e => setEditForm({ ...editForm, ssidBilan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-blue-300 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-amber-900 uppercase">
                    Service Promotion & Animation (SPA)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleEnrichSpecificSection('spaBilan', 'SPA', 'détailler les partenariats Globaline et IFPN')}
                    className="text-[11px] text-amber-700 font-bold flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>IA</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editForm.spaBilan}
                  onChange={e => setEditForm({ ...editForm, spaBilan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-amber-300 rounded-xl focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Police acoustique & Partenariats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 uppercase">
                    Police Acoustique & Nuisances Sonores
                  </label>
                  <button
                    type="button"
                    onClick={() => handleEnrichSpecificSection('policeAcoustique', 'Police Acoustique', 'détailler les mesures de décibels et mises en demeure')}
                    className="text-[11px] text-purple-700 font-bold flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>IA</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={editForm.policeAcoustique}
                  onChange={e => setEditForm({ ...editForm, policeAcoustique: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 uppercase">
                    Partenariats Stratégiques (Globaline, IFPN, Wing Wah)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleEnrichSpecificSection('partenariats', 'Partenariats', 'détailler les conventions de sponsoring')}
                    className="text-[11px] text-purple-700 font-bold flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>IA</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={editForm.partenariats}
                  onChange={e => setEditForm({ ...editForm, partenariats: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
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
                  Recommandations & Plaidoyer à Monsieur le Directeur
                </label>
                <textarea
                  rows={3}
                  value={editForm.recommandations}
                  onChange={e => setEditForm({ ...editForm, recommandations: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Conclusion */}
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

            <div className="pt-4 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditForm(AiReportService.generateExhaustiveQuarterlyReport(selectedYear, selectedTrimestre))}
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

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onInsertText={text => {
          setEditForm(prev => ({
            ...prev,
            introduction: prev.introduction + '\n\n' + text
          }));
        }}
      />

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
