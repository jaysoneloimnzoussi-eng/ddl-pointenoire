import React, { useState } from 'react';
import { OfficialQuarterlyReport } from '../../services/aiReportService';
import {
  Printer,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  Layers,
  BookOpen,
  X
} from 'lucide-react';

interface OfficialReportDocumentViewProps {
  report: OfficialQuarterlyReport;
  onPrint?: () => void;
  onClose?: () => void;
  readOnly?: boolean;
}

export const OfficialReportDocumentView: React.FC<OfficialReportDocumentViewProps> = ({
  report,
  onPrint,
  onClose,
  readOnly = false
}) => {
  const [currentPageView, setCurrentPageView] = useState<'ALL' | number>('ALL');
  const [isCopied, setIsCopied] = useState(false);

  const trimLabel =
    report.trimestre === 'T1' ? "1er Trimestre" :
    report.trimestre === 'T2' ? "2ème Trimestre" :
    report.trimestre === 'T3' ? "3ème Trimestre" :
    "4ème Trimestre";

  const fullTrimTitle =
    report.trimestre === 'T1' ? "PREMIER TRIMESTRE" :
    report.trimestre === 'T2' ? "DEUXIÈME TRIMESTRE" :
    report.trimestre === 'T3' ? "TROISIÈME TRIMESTRE" :
    "QUATRIÈME TRIMESTRE";

  const nextTrimLabel =
    report.trimestre === 'T1' ? "DEUXIÈME TRIMESTRE" :
    report.trimestre === 'T2' ? "TROISIÈME TRIMESTRE" :
    report.trimestre === 'T3' ? "QUATRIÈME TRIMESTRE" :
    "PREMIER TRIMESTRE N+1";

  const nextTrimCode =
    report.trimestre === 'T1' ? "T2" :
    report.trimestre === 'T2' ? "T3" :
    report.trimestre === 'T3' ? "T4" :
    "T1 N+1";

  const runningHeader = (
    <div className="border-b border-slate-300 pb-1.5 mb-5 flex items-center justify-between text-[10px] text-slate-500 font-serif italic tracking-wide">
      <span>DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE</span>
      <span>Rapport d'Activités — {trimLabel} {report.year}</span>
    </div>
  );

  const runningFooter = (pageNum: number) => (
    <div className="mt-8 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-400 font-serif">
      Page {pageNum} sur 9
    </div>
  );

  const renderStatusBadge = (statut: string, label?: string) => {
    const text = label || statut;
    if (statut === 'ATTEINT') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#d4edda] text-[#155724] border border-[#c3e6cb] px-2 py-0.5 rounded text-[10px] font-bold tracking-tight">
          <span>✅</span>
          <span>{text}</span>
        </span>
      );
    }
    if (statut === 'URGENTER') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#fff3cd] text-[#856404] border border-[#ffeeba] px-2 py-0.5 rounded text-[10px] font-bold tracking-tight">
          <span>⚠</span>
          <span>{text}</span>
        </span>
      );
    }
    if (statut === 'REPORTE') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#ffe8cc] text-[#d9480f] border border-[#ffd8a8] px-2 py-0.5 rounded text-[10px] font-bold tracking-tight">
          <span>⚠</span>
          <span>{text}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-[#e2f0d9] text-[#2b542c] border border-[#c5e1a5] px-2 py-0.5 rounded text-[10px] font-bold tracking-tight">
        <span>✅</span>
        <span>{text}</span>
      </span>
    );
  };

  const handleCopyAllText = () => {
    const fullText = `DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE
RAPPORT D'ACTIVITÉS DU ${fullTrimTitle} ${report.year}
${report.sousTitreRapport}
${report.periodeMois}

1. INTRODUCTION
${report.introduction.join('\n\n')}

2. SYNTHÈSE DU BILAN TRIMESTRIEL — TABLEAU DE BORD PTA ${report.year}
${report.tableauPta.rows.map(r => `• ${r.indicateur} | Cible: ${r.cible} | Résultat: ${r.resultat} | Statut: ${r.statutLabel || r.statut}`).join('\n')}

3. ACTIVITÉS PROGRAMMÉES RÉALISÉES
${report.activitesRealisees.intro}

4. EXPLOITATION DES RÉSULTATS DE L'ENQUÊTE STATISTIQUE
${report.enqueteStatistique.intro}

5. ACTIVITÉS PROGRAMMÉES NON RÉALISÉES
${report.activitesNonRealisees.rows.map(r => `• ${r.n} ${r.activite} : ${r.contenu} (Obs: ${r.observation})`).join('\n')}

6. TRAVAUX EN COURS ET PERSPECTIVES POUR LE ${nextTrimCode} ${report.year}
${report.perspectives.items.map(p => `${p.code} ${p.titre}\n${p.texte}`).join('\n\n')}

7. PARTICIPATIONS INSTITUTIONNELLES
${report.participations.rows.map(p => `${p.date} : ${p.activite} (${p.role})`).join('\n')}

8. DIFFICULTÉS RENCONTRÉES
${report.difficultes.items.map(d => `${d.numero}. ${d.titre}\n${d.texte}`).join('\n\n')}

9. SUGGESTIONS POUR LE ${nextTrimCode} ${report.year}
${report.suggestions.items.map(s => `${s.romain} ${s.titre}\n${s.texte}`).join('\n\n')}

10. CONCLUSION
${report.conclusion.paragraphs.join('\n\n')}

${report.conclusion.faitA} ${report.conclusion.date}
${report.conclusion.signataire}
${report.conclusion.titreSignataire}`;

    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // --- PAGE 1 ---
  const Page1 = (
    <div className="print-page-a4 bg-white p-8 sm:p-12 text-slate-800 shadow-md border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-serif relative">
      <div>
        {runningHeader}

        {/* Boxed Official Header */}
        <div className="border border-slate-800 grid grid-cols-12 mb-6 text-center text-xs">
          {/* Left Column (7 cols) */}
          <div className="col-span-7 border-r border-slate-800 p-3 space-y-1">
            <p className="font-bold text-[10px] uppercase leading-tight tracking-wider">
              {report.ministere}
            </p>
            <div className="w-12 h-px bg-slate-400 mx-auto my-1" />
            <p className="font-bold text-[10px] uppercase tracking-wider">
              {report.directionGenerale}
            </p>
            <div className="w-12 h-px bg-slate-400 mx-auto my-1" />
            <p className="font-bold text-[9.5px] uppercase tracking-wider">
              {report.departement}
            </p>
            <div className="w-12 h-px bg-slate-400 mx-auto my-1" />
            <p className="font-black text-[10px] uppercase tracking-wider text-slate-900">
              {report.directionDepartementale}
            </p>
            <div className="w-12 h-px bg-slate-400 mx-auto my-1" />
            <p className="font-mono text-[9px] text-slate-600 mt-1">
              {report.referenceNumber}
            </p>
          </div>

          {/* Right Column (5 cols) */}
          <div className="col-span-5 p-3 flex flex-col justify-center items-center">
            <p className="font-extrabold text-[12px] uppercase tracking-widest text-slate-900 font-serif">
              {report.republique}
            </p>
            <p className="italic text-[10px] text-slate-700 mt-1 font-serif">
              {report.devise}
            </p>
          </div>
        </div>

        {/* Big Navy Blue Title */}
        <div className="text-center my-6">
          <h1 className="text-xl sm:text-2xl font-black text-[#0c4a7e] uppercase tracking-wide font-serif leading-tight">
            RAPPORT D'ACTIVITÉS DU {fullTrimTitle} {report.year}
          </h1>
          <p className="font-serif italic text-slate-700 text-sm mt-1.5 font-medium">
            {report.sousTitreRapport}
          </p>
          <p className="font-serif font-bold text-slate-900 text-xs mt-1">
            {report.periodeMois}
          </p>
        </div>

        {/* Metadata Table */}
        <div className="mb-6 overflow-hidden border border-slate-400 text-xs">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold w-1/3 bg-slate-50 border-r border-slate-300">Structure</td>
                <td className="p-2">{report.metadata.structure}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Ministère</td>
                <td className="p-2">{report.metadata.ministere}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Hiérarchie</td>
                <td className="p-2">{report.metadata.hierarchie}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Période couverte</td>
                <td className="p-2 font-medium">{report.metadata.periodeCouverte}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Référence PTA</td>
                <td className="p-2">{report.metadata.referencePta}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">N° de document</td>
                <td className="p-2 font-mono text-[11px]">{report.metadata.numeroDocument}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 1. INTRODUCTION */}
        <div>
          <h2 className="text-[#0c4a7e] font-serif font-bold text-sm sm:text-base uppercase border-b-2 border-[#0c4a7e] pb-1 mb-3 tracking-wide">
            1. INTRODUCTION
          </h2>
          <div className="space-y-2.5 text-[11.5px] leading-relaxed text-justify text-slate-800">
            {report.introduction.slice(0, 3).map((para, i) => (
              <p key={i} className="indent-6">{para}</p>
            ))}
          </div>
        </div>
      </div>
      {runningFooter(1)}
    </div>
  );

  // --- PAGE 2 ---
  const Page2 = (
    <div className="print-page-a4 bg-white p-8 sm:p-12 text-slate-800 shadow-md border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-serif relative">
      <div>
        {runningHeader}

        {/* Continuation paragraph of Introduction if present */}
        {report.introduction.length > 3 && (
          <div className="mb-5 text-[11.5px] leading-relaxed text-justify text-slate-800">
            <p className="indent-6">{report.introduction[3]}</p>
          </div>
        )}

        {/* 2. SYNTHÈSE DU BILAN TRIMESTRIEL — TABLEAU DE BORD PTA 2026 */}
        <div className="mb-6">
          <h2 className="text-[#0c4a7e] font-serif font-bold text-sm sm:text-base uppercase border-b-2 border-[#0c4a7e] pb-1 mb-2 tracking-wide">
            2. SYNTHÈSE DU BILAN TRIMESTRIEL — TABLEAU DE BORD PTA {report.year}
          </h2>
          <p className="text-[11.5px] text-slate-700 italic mb-3">
            {report.tableauPta.intro}
          </p>

          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-[#0c4a7e] text-white">
                <tr>
                  <th className="p-2 border border-slate-400 text-left font-bold uppercase tracking-wider text-[10px] w-2/5">
                    INDICATEUR PTA {report.year}
                  </th>
                  <th className="p-2 border border-slate-400 text-center font-bold uppercase tracking-wider text-[10px] w-1/5">
                    CIBLE ANNUELLE
                  </th>
                  <th className="p-2 border border-slate-400 text-left font-bold uppercase tracking-wider text-[10px] w-1/4">
                    RÉSULTAT {report.trimestre} {report.year}
                  </th>
                  <th className="p-2 border border-slate-400 text-center font-bold uppercase tracking-wider text-[10px] w-1/6">
                    STATUT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {report.tableauPta.rows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="p-2 border border-slate-300 font-semibold text-slate-900 leading-snug">
                      {row.indicateur}
                    </td>
                    <td className="p-2 border border-slate-300 text-center text-slate-700">
                      {row.cible}
                    </td>
                    <td className="p-2 border border-slate-300 text-slate-800 leading-snug">
                      {row.resultat}
                    </td>
                    <td className="p-2 border border-slate-300 text-center whitespace-nowrap">
                      {renderStatusBadge(row.statut, row.statutLabel)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 text-[10.5px] text-slate-600 italic leading-snug text-justify">
            {report.tableauPta.noteLecture}
          </div>
        </div>

        {/* 3. ACTIVITÉS PROGRAMMÉES RÉALISÉES */}
        <div>
          <h2 className="text-[#0c4a7e] font-serif font-bold text-sm sm:text-base uppercase border-b-2 border-[#0c4a7e] pb-1 mb-2 tracking-wide">
            3. ACTIVITÉS PROGRAMMÉES RÉALISÉES
          </h2>
          <p className="text-[11.5px] text-justify leading-relaxed text-slate-800 mb-3 indent-6">
            {report.activitesRealisees.intro}
          </p>

          <h3 className="font-bold text-slate-900 text-xs uppercase mb-1">
            a. Service Administratif, Financier et du Matériel (SAFM)
          </h3>
          <p className="text-[11.5px] text-justify leading-relaxed text-slate-700 indent-6">
            {report.activitesRealisees.safm.intro}
          </p>
        </div>
      </div>
      {runningFooter(2)}
    </div>
  );

  // --- PAGE 3 ---
  const Page3 = (
    <div className="print-page-a4 bg-white p-8 sm:p-12 text-slate-800 shadow-md border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-serif relative">
      <div>
        {runningHeader}

        {/* Table SAFM */}
        <div className="mb-6 overflow-x-auto border border-slate-400">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="bg-[#0c4a7e] text-white">
              <tr>
                <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[5%]">N°</th>
                <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[18%]">Activités Prévues</th>
                <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[32%]">Contenus / Actions</th>
                <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[18%]">Indicateurs</th>
                <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[10%]">Exécution</th>
                <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[17%]">Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {report.activitesRealisees.safm.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                  <td className="p-2 border border-slate-300 text-center font-bold">{row.n}</td>
                  <td className="p-2 border border-slate-300 font-semibold leading-tight">{row.activite}</td>
                  <td className="p-2 border border-slate-300 leading-snug">{row.contenu}</td>
                  <td className="p-2 border border-slate-300 leading-snug">{row.indicateur}</td>
                  <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800">{row.execution}</td>
                  <td className="p-2 border border-slate-300 leading-snug text-slate-700">{row.observation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* b. Service de l'Autorisation */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 text-xs uppercase mb-1">
            b. Service de l'Autorisation
          </h3>
          <p className="text-[11.5px] text-justify leading-relaxed text-slate-700 indent-6 mb-3">
            {report.activitesRealisees.autorisation.intro}
          </p>

          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="bg-[#0c4a7e] text-white">
                <tr>
                  <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[5%]">N°</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[18%]">Activités Prévues</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[32%]">Contenus / Actions</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[18%]">Indicateurs</th>
                  <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[10%]">Exécution</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[17%]">Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {report.activitesRealisees.autorisation.rows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="p-2 border border-slate-300 text-center font-bold">{row.n}</td>
                    <td className="p-2 border border-slate-300 font-semibold leading-tight">{row.activite}</td>
                    <td className="p-2 border border-slate-300 leading-snug">{row.contenu}</td>
                    <td className="p-2 border border-slate-300 leading-snug">{row.indicateur}</td>
                    <td className={`p-2 border border-slate-300 text-center font-bold ${row.execution === 'Exécuté' ? 'text-emerald-800' : 'text-red-700'}`}>
                      {row.execution}
                    </td>
                    <td className="p-2 border border-slate-300 leading-snug text-slate-700">{row.observation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* c. Service SSID */}
        <div>
          <h3 className="font-bold text-slate-900 text-xs uppercase mb-1">
            c. Service des Statistiques, de l'Information et de la Documentation (SSID)
          </h3>
          <p className="text-[11.5px] text-justify leading-relaxed text-slate-700 indent-6 mb-3">
            {report.activitesRealisees.ssid.intro}
          </p>

          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="bg-[#0c4a7e] text-white">
                <tr>
                  <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[5%]">N°</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[18%]">Activités Prévues</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[32%]">Contenus / Actions</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[18%]">Indicateurs</th>
                  <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[10%]">Exécution</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[17%]">Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {report.activitesRealisees.ssid.rows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="p-2 border border-slate-300 text-center font-bold">{row.n}</td>
                    <td className="p-2 border border-slate-300 font-semibold leading-tight">{row.activite}</td>
                    <td className="p-2 border border-slate-300 leading-snug">{row.contenu}</td>
                    <td className="p-2 border border-slate-300 leading-snug">{row.indicateur}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800">{row.execution}</td>
                    <td className="p-2 border border-slate-300 leading-snug text-slate-700">{row.observation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {runningFooter(3)}
    </div>
  );

  // --- PAGE 4 ---
  const Page4 = (
    <div className="print-page-a4 bg-white p-8 sm:p-12 text-slate-800 shadow-md border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-serif relative">
      <div>
        {runningHeader}

        {/* d. Service Promotion et Animation */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 text-xs uppercase mb-1">
            d. Service de la Promotion et Animation
          </h3>
          <p className="text-[11.5px] text-justify leading-relaxed text-slate-700 indent-6 mb-3">
            {report.activitesRealisees.spa.intro}
          </p>

          <div className="overflow-x-auto border border-slate-400 mb-6">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="bg-[#0c4a7e] text-white">
                <tr>
                  <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[5%]">N°</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[22%]">Activités Prévues</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[30%]">Contenus / Actions</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[18%]">Indicateurs</th>
                  <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[10%]">Exécution</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[15%]">Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {report.activitesRealisees.spa.rows.map((row, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="p-2 border border-slate-300 text-center font-bold">{row.n}</td>
                    <td className="p-2 border border-slate-300 font-semibold leading-tight">{row.activite}</td>
                    <td className="p-2 border border-slate-300 leading-snug">{row.contenu}</td>
                    <td className="p-2 border border-slate-300 leading-snug">{row.indicateur}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800">{row.execution}</td>
                    <td className="p-2 border border-slate-300 leading-snug text-slate-700">{row.observation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. EXPLOITATION DES RÉSULTATS DE L'ENQUÊTE STATISTIQUE */}
        <div>
          <h2 className="text-[#0c4a7e] font-serif font-bold text-sm sm:text-base uppercase border-b-2 border-[#0c4a7e] pb-1 mb-2 tracking-wide">
            4. EXPLOITATION DES RÉSULTATS DE L'ENQUÊTE STATISTIQUE — APPORTS DU {trimLabel.toUpperCase()}
          </h2>
          <p className="text-[11.5px] text-justify leading-relaxed text-slate-800 mb-3 indent-6">
            {report.enqueteStatistique.intro}
          </p>

          <h3 className="font-bold text-slate-900 text-xs mb-2">
            4.1. Rappel des constats structurants confirmés par la version V2
          </h3>

          <div className="overflow-x-auto border border-slate-400 mb-4">
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-[#0c4a7e] text-white">
                <tr>
                  <th className="p-2 border border-slate-400 text-left font-bold text-[10px] w-2/5">Indicateur</th>
                  <th className="p-2 border border-slate-400 text-center font-bold text-[10px] w-1/4">Valeur</th>
                  <th className="p-2 border border-slate-400 text-left font-bold text-[10px] w-1/3">Lecture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {report.enqueteStatistique.constatsV2.map((c, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="p-2 border border-slate-300 font-semibold">{c.indicateur}</td>
                    <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-900">{c.valeur}</td>
                    <td className="p-2 border border-slate-300 text-slate-700">{c.lecture}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-bold text-slate-900 text-xs mb-2">
            {report.enqueteStatistique.ficheTechnique.titre}
          </h3>
          <div className="space-y-2 text-[11.5px] leading-relaxed text-justify text-slate-800">
            {report.enqueteStatistique.ficheTechnique.contenu.slice(0, 1).map((p, i) => (
              <p key={i} className="indent-6">{p}</p>
            ))}
          </div>
        </div>
      </div>
      {runningFooter(4)}
    </div>
  );

  // --- PAGE 5 ---
  const Page5 = (
    <div className="print-page-a4 bg-white p-8 sm:p-12 text-slate-800 shadow-md border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-serif relative">
      <div>
        {runningHeader}

        {/* Continuation paragraph of Fiche Technique */}
        {report.enqueteStatistique.ficheTechnique.contenu.length > 1 && (
          <div className="mb-6 text-[11.5px] leading-relaxed text-justify text-slate-800">
            <p className="indent-6">{report.enqueteStatistique.ficheTechnique.contenu[1]}</p>
          </div>
        )}

        {/* 5. ACTIVITÉS PROGRAMMÉES NON RÉALISÉES */}
        <div>
          <h2 className="text-[#0c4a7e] font-serif font-bold text-sm sm:text-base uppercase border-b-2 border-[#0c4a7e] pb-1 mb-2 tracking-wide">
            5. ACTIVITÉS PROGRAMMÉES NON RÉALISÉES
          </h2>
          <p className="text-[11.5px] text-justify leading-relaxed text-slate-800 mb-3 indent-6">
            {report.activitesNonRealisees.intro}
          </p>

          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="bg-[#0c4a7e] text-white">
                <tr>
                  <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[5%]">N°</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[20%]">Activités Prévues</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[30%]">Contenus / Actions</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[18%]">Indicateurs</th>
                  <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[10%]">Exécution</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[17%]">Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {report.activitesNonRealisees.rows.slice(0, 6).map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="p-2 border border-slate-300 text-center font-bold">{row.n}</td>
                    <td className="p-2 border border-slate-300 font-semibold leading-tight">{row.activite}</td>
                    <td className="p-2 border border-slate-300 leading-snug">{row.contenu}</td>
                    <td className="p-2 border border-slate-300 leading-snug">{row.indicateur}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-red-700">{row.execution}</td>
                    <td className="p-2 border border-slate-300 leading-snug text-slate-700">{row.observation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {runningFooter(5)}
    </div>
  );

  // --- PAGE 6 ---
  const Page6 = (
    <div className="print-page-a4 bg-white p-8 sm:p-12 text-slate-800 shadow-md border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-serif relative">
      <div>
        {runningHeader}

        {/* Row 07 of Non Réalisées */}
        {report.activitesNonRealisees.rows.length > 6 && (
          <div className="mb-6 overflow-x-auto border border-slate-400">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="bg-[#0c4a7e] text-white">
                <tr>
                  <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[5%]">N°</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[20%]">Activités Prévues</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[30%]">Contenus / Actions</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[18%]">Indicateurs</th>
                  <th className="p-1.5 border border-slate-400 text-center font-bold text-[9.5px] w-[10%]">Exécution</th>
                  <th className="p-1.5 border border-slate-400 text-left font-bold text-[9.5px] w-[17%]">Observation</th>
                </tr>
              </thead>
              <tbody>
                {report.activitesNonRealisees.rows.slice(6).map((row, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="p-2 border border-slate-300 text-center font-bold">{row.n}</td>
                    <td className="p-2 border border-slate-300 font-semibold leading-tight">{row.activite}</td>
                    <td className="p-2 border border-slate-300 leading-snug">{row.contenu}</td>
                    <td className="p-2 border border-slate-300 leading-snug">{row.indicateur}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-red-700">{row.execution}</td>
                    <td className="p-2 border border-slate-300 leading-snug text-slate-700">{row.observation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. TRAVAUX EN COURS ET PERSPECTIVES */}
        <div className="mb-6">
          <h2 className="text-[#0c4a7e] font-serif font-bold text-sm sm:text-base uppercase border-b-2 border-[#0c4a7e] pb-1 mb-3 tracking-wide">
            {report.perspectives.titre}
          </h2>

          <div className="space-y-3.5">
            {report.perspectives.items.map((item, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-slate-900 text-xs mb-1">
                  {item.code} {item.titre}
                </h3>
                <p className="text-[11.5px] text-justify leading-relaxed text-slate-800 indent-6">
                  {item.texte}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. ACTIVITÉS PONCTUELLES — PARTICIPATIONS INSTITUTIONNELLES (Intro) */}
        <div>
          <h2 className="text-[#0c4a7e] font-serif font-bold text-sm sm:text-base uppercase border-b-2 border-[#0c4a7e] pb-1 mb-2 tracking-wide">
            7. ACTIVITÉS PONCTUELLES — PARTICIPATIONS INSTITUTIONNELLES
          </h2>
          <p className="text-[11.5px] text-justify leading-relaxed text-slate-800 indent-6">
            {report.participations.intro}
          </p>
        </div>
      </div>
      {runningFooter(6)}
    </div>
  );

  // --- PAGE 7 ---
  const Page7 = (
    <div className="print-page-a4 bg-white p-8 sm:p-12 text-slate-800 shadow-md border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-serif relative">
      <div>
        {runningHeader}

        {/* Table Participations */}
        <div className="mb-4 overflow-x-auto border border-slate-400">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="bg-[#0c4a7e] text-white">
              <tr>
                <th className="p-2 border border-slate-400 text-left font-bold text-[10px] w-1/4">DATE</th>
                <th className="p-2 border border-slate-400 text-left font-bold text-[10px] w-2/5">ACTIVITÉ / ÉVÉNEMENT</th>
                <th className="p-2 border border-slate-400 text-left font-bold text-[10px] w-1/4">RÔLE / PARTICIPATION</th>
                <th className="p-2 border border-slate-400 text-left font-bold text-[10px] w-1/6">CADRE / PATRONAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {report.participations.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                  <td className="p-2 border border-slate-300 font-mono text-[9.5px] leading-tight font-semibold text-slate-900 whitespace-pre-line">
                    {row.date}
                  </td>
                  <td className="p-2 border border-slate-300 font-serif leading-snug">
                    {row.activite}
                  </td>
                  <td className="p-2 border border-slate-300 font-serif leading-snug text-slate-700">
                    {row.role}
                  </td>
                  <td className="p-2 border border-slate-300 font-serif leading-snug text-[9.5px]">
                    {row.patronage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Post-Table Paragraphs */}
        <div className="space-y-2 mb-6 text-[11.5px] leading-relaxed text-justify text-slate-800">
          {report.participations.postTable.map((p, i) => (
            <p key={i} className="indent-6">{p}</p>
          ))}
        </div>

        {/* 8. DIFFICULTÉS RENCONTRÉES */}
        <div>
          <h2 className="text-[#0c4a7e] font-serif font-bold text-sm sm:text-base uppercase border-b-2 border-[#0c4a7e] pb-1 mb-2 tracking-wide">
            8. DIFFICULTÉS RENCONTRÉES
          </h2>
          <p className="text-[11.5px] text-justify leading-relaxed text-slate-800 mb-3 indent-6">
            {report.difficultes.intro}
          </p>

          <div className="space-y-3">
            {report.difficultes.items.slice(0, 5).map((item, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-slate-900 text-xs mb-0.5">
                  {item.numero}. {item.titre}
                </h3>
                <p className="text-[11.5px] text-justify leading-relaxed text-slate-800 indent-6">
                  {item.texte}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {runningFooter(7)}
    </div>
  );

  // --- PAGE 8 ---
  const Page8 = (
    <div className="print-page-a4 bg-white p-8 sm:p-12 text-slate-800 shadow-md border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-serif relative">
      <div>
        {runningHeader}

        {/* Item 6 of Difficultés */}
        {report.difficultes.items.length > 5 && (
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 text-xs mb-0.5">
              {report.difficultes.items[5].numero}. {report.difficultes.items[5].titre}
            </h3>
            <p className="text-[11.5px] text-justify leading-relaxed text-slate-800 indent-6">
              {report.difficultes.items[5].texte}
            </p>
          </div>
        )}

        {/* 9. SUGGESTIONS POUR LE TRIMESTRE SUIVANT */}
        <div className="mb-6">
          <h2 className="text-[#0c4a7e] font-serif font-bold text-sm sm:text-base uppercase border-b-2 border-[#0c4a7e] pb-1 mb-2 tracking-wide">
            9. SUGGESTIONS POUR LE {nextTrimLabel} {report.year}
          </h2>
          <p className="text-[11.5px] text-justify leading-relaxed text-slate-800 mb-3 indent-6">
            {report.suggestions.intro}
          </p>

          <div className="space-y-3">
            {report.suggestions.items.map((sug, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-slate-900 text-xs mb-0.5 italic">
                  {sug.romain} {sug.titre}
                </h3>
                <p className="text-[11.5px] text-justify leading-relaxed text-slate-800 indent-6">
                  {sug.texte}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 10. CONCLUSION (Intro) */}
        <div>
          <h2 className="text-[#0c4a7e] font-serif font-bold text-sm sm:text-base uppercase border-b-2 border-[#0c4a7e] pb-1 mb-2 tracking-wide">
            10. CONCLUSION
          </h2>
          <div className="space-y-2.5 text-[11.5px] leading-relaxed text-justify text-slate-800">
            {report.conclusion.paragraphs.slice(0, 2).map((p, i) => (
              <p key={i} className="indent-6">{p}</p>
            ))}
          </div>
        </div>
      </div>
      {runningFooter(8)}
    </div>
  );

  // --- PAGE 9 ---
  const Page9 = (
    <div className="print-page-a4 bg-white p-8 sm:p-12 text-slate-800 shadow-md border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-serif relative">
      <div>
        {runningHeader}

        {/* Remainder of Conclusion */}
        <div className="space-y-3.5 text-[11.5px] leading-relaxed text-justify text-slate-800 mb-12">
          {report.conclusion.paragraphs.slice(2).map((p, i) => (
            <p key={i} className="indent-6">{p}</p>
          ))}
        </div>

        {/* Official Signature Block */}
        <div className="flex justify-end pt-8">
          <div className="text-right w-80 font-serif">
            <p className="text-xs text-slate-800 italic mb-2">
              {report.conclusion.faitA} ________________________ {report.year}
            </p>
            <div className="h-16 flex items-center justify-end text-slate-400 italic text-xs">
              [Signature officielle et Cachet DDL-PN]
            </div>
            <p className="font-bold text-slate-900 text-sm tracking-wide uppercase underline underline-offset-4">
              {report.conclusion.signataire}
            </p>
            <p className="text-[11px] text-slate-600 italic mt-0.5">
              {report.conclusion.titreSignataire}
            </p>
          </div>
        </div>
      </div>
      {runningFooter(9)}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top Document Toolbar */}
      <div className="no-print bg-slate-900 text-white p-3 sm:p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs sm:text-sm">
              Document Officiel Validé — {trimLabel} {report.year}
            </h3>
            <p className="text-[11px] text-slate-300">
              Format A4 exact en 9 pages conformes à la maquette ministérielle DDL-PN
            </p>
          </div>
        </div>

        {/* Page selector pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setCurrentPageView('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              currentPageView === 'ALL'
                ? 'bg-[#006d2f] text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Toutes les 9 Pages
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(p => (
            <button
              key={p}
              onClick={() => setCurrentPageView(p)}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition ${
                currentPageView === p
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              P{p}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAllText}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Texte copié !' : 'Copier tout le texte'}</span>
          </button>

          {onPrint && (
            <button
              onClick={onPrint}
              className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Imprimer / Exporter A4 (9 Pages)</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition cursor-pointer hover:scale-105 active:scale-95"
              title="Fermer l'aperçu du document officiel"
            >
              <X className="w-3.5 h-3.5" />
              <span>Fermer l'aperçu</span>
            </button>
          )}
        </div>
      </div>

      {/* Pages Container */}
      <div className="space-y-8 bg-slate-200/70 p-4 sm:p-8 rounded-2xl overflow-x-auto print:bg-white print:p-0 print:space-y-0">
        {(currentPageView === 'ALL' || currentPageView === 1) && (
          <div className="page-container page-break-after-always">
            {Page1}
          </div>
        )}
        {(currentPageView === 'ALL' || currentPageView === 2) && (
          <div className="page-container page-break-after-always">
            {Page2}
          </div>
        )}
        {(currentPageView === 'ALL' || currentPageView === 3) && (
          <div className="page-container page-break-after-always">
            {Page3}
          </div>
        )}
        {(currentPageView === 'ALL' || currentPageView === 4) && (
          <div className="page-container page-break-after-always">
            {Page4}
          </div>
        )}
        {(currentPageView === 'ALL' || currentPageView === 5) && (
          <div className="page-container page-break-after-always">
            {Page5}
          </div>
        )}
        {(currentPageView === 'ALL' || currentPageView === 6) && (
          <div className="page-container page-break-after-always">
            {Page6}
          </div>
        )}
        {(currentPageView === 'ALL' || currentPageView === 7) && (
          <div className="page-container page-break-after-always">
            {Page7}
          </div>
        )}
        {(currentPageView === 'ALL' || currentPageView === 8) && (
          <div className="page-container page-break-after-always">
            {Page8}
          </div>
        )}
        {(currentPageView === 'ALL' || currentPageView === 9) && (
          <div className="page-container">
            {Page9}
          </div>
        )}
      </div>
    </div>
  );
};
