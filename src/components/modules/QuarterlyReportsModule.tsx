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
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { PrintModal } from '../print/PrintModal';
import {
  AiReportService,
  OfficialQuarterlyReport,
  ReportTableRow,
  PtaIndicatorRow,
  EnqueteConstatRow,
  ParticipationRow
} from '../../services/aiReportService';
import { OfficialReportDocumentView } from './OfficialReportDocumentView';
import { AiAssistantModal } from '../common/AiAssistantModal';

export const QuarterlyReportsModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [selectedTrimestre, setSelectedTrimestre] = useState<'T1' | 'T2' | 'T3' | 'T4'>('T3');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'EDITOR'>('PREVIEW');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const reportKey = `${selectedYear}-${selectedTrimestre}`;

  // Local storage cache for the reports
  const [reportsStore, setReportsStore] = useState<Record<string, OfficialQuarterlyReport>>(() => {
    const saved = localStorage.getItem('ddl_pn_validated_quarterly_reports_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved reports store', e);
      }
    }
    return {
      '2026-T3': AiReportService.getT3ExactReport('2026'),
      '2026-T2': AiReportService.getT2ExactReport('2026'),
      '2026-T1': AiReportService.getT2ExactReport('2026'), // fallback to structure
      '2026-T4': AiReportService.getT3ExactReport('2026')
    };
  });

  const currentReport: OfficialQuarterlyReport = useMemo(() => {
    if (reportsStore[reportKey]) return reportsStore[reportKey];
    return selectedTrimestre === 'T2'
      ? AiReportService.getT2ExactReport(selectedYear)
      : AiReportService.getT3ExactReport(selectedYear);
  }, [reportsStore, reportKey, selectedYear, selectedTrimestre]);

  const [editForm, setEditForm] = useState<OfficialQuarterlyReport>(currentReport);

  // Sync edit form on report change
  React.useEffect(() => {
    setEditForm(currentReport);
  }, [currentReport]);

  const handleSaveReport = () => {
    const updatedStore = {
      ...reportsStore,
      [reportKey]: editForm
    };
    setReportsStore(updatedStore);
    localStorage.setItem('ddl_pn_validated_quarterly_reports_v3', JSON.stringify(updatedStore));
    triggerNotification(`Rapport officiel ${selectedTrimestre} ${selectedYear} enregistré avec succès !`, 'success');
    setActiveTab('PREVIEW');
  };

  const handleResetToValidatedTemplate = () => {
    const fresh = selectedTrimestre === 'T2'
      ? AiReportService.getT2ExactReport(selectedYear)
      : AiReportService.getT3ExactReport(selectedYear);
    setEditForm(fresh);
    const updatedStore = {
      ...reportsStore,
      [reportKey]: fresh
    };
    setReportsStore(updatedStore);
    localStorage.setItem('ddl_pn_validated_quarterly_reports_v3', JSON.stringify(updatedStore));
    triggerNotification(`Modèle officiel validé (${selectedTrimestre} ${selectedYear}) rechargé !`, 'success');
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
      title: `Rapport Trimestriel d'Activité - ${selectedTrimestre} ${selectedYear} (9 Pages A4)`,
      data: currentReport
    });
  };

  return (
    <div className="space-y-5 select-none">
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#0c4a7e] text-white font-bold px-2.5 py-0.5 rounded-full font-mono-ref">
              MODÈLE OFFICIEL VALIDÉ • 9 PAGES
            </span>
            <span className="text-xs text-slate-500 font-medium">Direction Départementale des Loisirs de Pointe-Noire</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#0c4a7e] tracking-tight mt-1 flex items-center gap-2 font-serif">
            <BookOpen className="w-5 h-5 text-[#006d2f]" />
            <span>Rapports Trimestriels d'Activité — Maquette Conforme DDL-PN</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rédaction, mise en page A4, typographie, tableaux PTA et pagination identiques au document validé pour signature par Monsieur Jean Richard NTSEKE NGOUAKA.
          </p>
        </div>

        {/* Trimester, Tab and Print Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#0c4a7e] outline-none cursor-pointer"
          >
            <option value="2025">Année 2025</option>
            <option value="2026">Année 2026</option>
            <option value="2027">Année 2027</option>
          </select>

          {/* Quarter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border text-xs font-bold">
            {(['T1', 'T2', 'T3', 'T4'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTrimestre(t)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedTrimestre === t
                    ? 'bg-[#0c4a7e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'T3' ? '3ème Trimestre (T3)' : t === 'T2' ? '2ème Trimestre (T2)' : t}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border text-xs font-bold">
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'PREVIEW'
                  ? 'bg-[#006d2f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Aperçu Officiel 9 Pages</span>
            </button>
            <button
              onClick={() => setActiveTab('EDITOR')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'EDITOR'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modifier / Personnaliser</span>
            </button>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrintReport}
            className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Imprimer / PDF A4</span>
          </button>
        </div>
      </div>

      {/* Quick Info & Action Bar */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-300 block text-xs font-serif">
              Conformité Stricte au Format Validé de la République du Congo
            </span>
            <p className="text-[11px] text-slate-300">
              {selectedTrimestre === 'T3' ? 'Troisième Trimestre 2026 (Juillet – Septembre 2026)' : 'Deuxième Trimestre 2026 (Avril – Juin 2026)'} • Période, en-tête MICTAL/DGL, 10 sections et 9 pages A4 intégrales.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetToValidatedTemplate}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recharger Modèle {selectedTrimestre} Validé</span>
          </button>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            <span>Assistant IA Rédacteur</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'PREVIEW' ? (
        /* OFFICIAL 9-PAGE PREVIEW */
        <OfficialReportDocumentView
          report={currentReport}
          onPrint={handlePrintReport}
        />
      ) : (
        /* INTERACTIVE SECTIONS & TABLES EDITOR */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-base font-black text-[#0c4a7e] font-serif uppercase">
                Personnalisation du Rapport du {selectedTrimestre} {selectedYear}
              </h3>
              <p className="text-xs text-slate-500">
                Vous pouvez adapter les textes, les lignes de tableaux d'indicateurs ou les observations pour chaque service.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToValidatedTemplate}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rétablir Défaut</span>
              </button>
              <button
                type="button"
                onClick={handleSaveReport}
                className="px-5 py-2 bg-[#006d2f] hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer & Prévisualiser</span>
              </button>
            </div>
          </div>

          <div className="space-y-6 text-xs">
            {/* 1. Introduction paragraphs */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="font-bold text-[#0c4a7e] font-serif text-sm uppercase block border-b pb-1">
                1. Introduction (Paragraphes)
              </label>
              {editForm.introduction.map((para, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold">Paragraphe {idx + 1} :</span>
                  <textarea
                    rows={3}
                    value={para}
                    onChange={e => {
                      const updated = [...editForm.introduction];
                      updated[idx] = e.target.value;
                      setEditForm({ ...editForm, introduction: updated });
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0c4a7e] outline-none"
                  />
                </div>
              ))}
            </div>

            {/* 2. Tableau de bord PTA */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="font-bold text-[#0c4a7e] font-serif text-sm uppercase block border-b pb-1">
                2. Tableau de Bord PTA (Indicateurs & Résultats)
              </label>
              <div className="space-y-2 overflow-x-auto">
                <table className="w-full text-[11px] border border-slate-300 bg-white">
                  <thead className="bg-[#0c4a7e] text-white">
                    <tr>
                      <th className="p-1.5 border">Indicateur</th>
                      <th className="p-1.5 border w-28">Cible</th>
                      <th className="p-1.5 border">Résultat {selectedTrimestre}</th>
                      <th className="p-1.5 border w-32">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editForm.tableauPta.rows.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-1.5 border font-semibold">
                          <input
                            type="text"
                            value={row.indicateur}
                            onChange={e => {
                              const updated = [...editForm.tableauPta.rows];
                              updated[idx].indicateur = e.target.value;
                              setEditForm({
                                ...editForm,
                                tableauPta: { ...editForm.tableauPta, rows: updated }
                              });
                            }}
                            className="w-full bg-transparent outline-none font-semibold text-slate-800"
                          />
                        </td>
                        <td className="p-1.5 border">
                          <input
                            type="text"
                            value={row.cible}
                            onChange={e => {
                              const updated = [...editForm.tableauPta.rows];
                              updated[idx].cible = e.target.value;
                              setEditForm({
                                ...editForm,
                                tableauPta: { ...editForm.tableauPta, rows: updated }
                              });
                            }}
                            className="w-full bg-transparent outline-none text-slate-700"
                          />
                        </td>
                        <td className="p-1.5 border">
                          <input
                            type="text"
                            value={row.resultat}
                            onChange={e => {
                              const updated = [...editForm.tableauPta.rows];
                              updated[idx].resultat = e.target.value;
                              setEditForm({
                                ...editForm,
                                tableauPta: { ...editForm.tableauPta, rows: updated }
                              });
                            }}
                            className="w-full bg-transparent outline-none text-slate-800"
                          />
                        </td>
                        <td className="p-1.5 border">
                          <select
                            value={row.statut}
                            onChange={e => {
                              const updated = [...editForm.tableauPta.rows];
                              updated[idx].statut = e.target.value as any;
                              updated[idx].statutLabel =
                                e.target.value === 'ATTEINT' ? 'ATTEINT' :
                                e.target.value === 'URGENTER' ? 'À URGENTER' :
                                e.target.value === 'REPORTE' ? `REPORTÉ ${selectedTrimestre === 'T2' ? 'T3' : 'T4'}` : 'EN COURS';
                              setEditForm({
                                ...editForm,
                                tableauPta: { ...editForm.tableauPta, rows: updated }
                              });
                            }}
                            className="w-full p-1 rounded bg-slate-100 border text-xs font-bold cursor-pointer"
                          >
                            <option value="ATTEINT">ATTEINT</option>
                            <option value="REPORTE">REPORTÉ</option>
                            <option value="URGENTER">À URGENTER</option>
                            <option value="EN_COURS">EN COURS</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Perspectives & Travaux en cours */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="font-bold text-[#0c4a7e] font-serif text-sm uppercase block border-b pb-1">
                6. Travaux en cours et Perspectives
              </label>
              {editForm.perspectives.items.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="font-bold text-slate-800">{item.code} {item.titre}</span>
                  <textarea
                    rows={2}
                    value={item.texte}
                    onChange={e => {
                      const updated = [...editForm.perspectives.items];
                      updated[idx].texte = e.target.value;
                      setEditForm({
                        ...editForm,
                        perspectives: { ...editForm.perspectives, items: updated }
                      });
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              ))}
            </div>

            {/* 4. Difficultés et Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-red-900 font-serif text-sm uppercase block border-b pb-1">
                  8. Difficultés Rencontrées (6 points)
                </label>
                {editForm.difficultes.items.map((diff, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-[11px]">{diff.numero}. {diff.titre}</span>
                    <textarea
                      rows={2}
                      value={diff.texte}
                      onChange={e => {
                        const updated = [...editForm.difficultes.items];
                        updated[idx].texte = e.target.value;
                        setEditForm({
                          ...editForm,
                          difficultes: { ...editForm.difficultes, items: updated }
                        });
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-[#0c4a7e] font-serif text-sm uppercase block border-b pb-1">
                  9. Suggestions Prioritaires (6 points romains)
                </label>
                {editForm.suggestions.items.map((sug, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-[11px]">{sug.romain} {sug.titre}</span>
                    <textarea
                      rows={2}
                      value={sug.texte}
                      onChange={e => {
                        const updated = [...editForm.suggestions.items];
                        updated[idx].texte = e.target.value;
                        setEditForm({
                          ...editForm,
                          suggestions: { ...editForm.suggestions, items: updated }
                        });
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Conclusion */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="font-bold text-[#0c4a7e] font-serif text-sm uppercase block border-b pb-1">
                10. Conclusion & Signature
              </label>
              {editForm.conclusion.paragraphs.map((cPara, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold">Paragraphe {idx + 1} :</span>
                  <textarea
                    rows={2}
                    value={cPara}
                    onChange={e => {
                      const updated = [...editForm.conclusion.paragraphs];
                      updated[idx] = e.target.value;
                      setEditForm({
                        ...editForm,
                        conclusion: { ...editForm.conclusion, paragraphs: updated }
                      });
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold">Date de signature :</label>
                  <input
                    type="text"
                    value={editForm.conclusion.date}
                    onChange={e => setEditForm({
                      ...editForm,
                      conclusion: { ...editForm.conclusion, date: e.target.value }
                    })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none font-serif"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold">Signataire :</label>
                  <input
                    type="text"
                    value={editForm.conclusion.signataire}
                    onChange={e => setEditForm({
                      ...editForm,
                      conclusion: { ...editForm.conclusion, signataire: e.target.value }
                    })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none font-serif font-bold text-[#0c4a7e]"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetToValidatedTemplate}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rétablir le modèle validé</span>
              </button>

              <button
                type="button"
                onClick={handleSaveReport}
                className="px-6 py-2.5 bg-[#006d2f] hover:bg-emerald-800 text-white font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer & Prévisualiser (9 Pages)</span>
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
          triggerNotification('Texte d\'enrichissement IA reçu !', 'success');
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
