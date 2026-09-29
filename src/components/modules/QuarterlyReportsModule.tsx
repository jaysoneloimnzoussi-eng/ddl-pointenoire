import React, { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { REPUBLIQUE_CONGO, TERRITORIAL_REFERENTIAL } from '../../constants/referential';
import { PrintModal } from '../print/PrintModal';

export const QuarterlyReportsModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [selectedTrimestre, setSelectedTrimestre] = useState<'T1' | 'T2' | 'T3' | 'T4'>('T3');
  const stats = storageService.getSystemStats();

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

  const trimestreData = {
    T1: { period: 'Janvier - Mars 2026', recouv: 7200000, estCount: 38, sanctions: 2, dglTrans: 12 },
    T2: { period: 'Avril - Juin 2026', recouv: 8400000, estCount: 42, sanctions: 4, dglTrans: 18 },
    T3: { period: 'Juillet - Septembre 2026', recouv: stats.totalPaid, estCount: stats.totalEst, sanctions: stats.underSanction, dglTrans: stats.transmittedDgl },
    T4: { period: 'Octobre - Décembre 2026 (Prévisionnel)', recouv: 11000000, estCount: 50, sanctions: 3, dglTrans: 25 }
  }[selectedTrimestre];

  const handlePrintReport = () => {
    setPrintDoc({
      isOpen: true,
      type: 'RAPPORT_TRIMESTRIEL_A4',
      title: `Rapport Trimestriel d'Activité - ${selectedTrimestre} 2026`,
      data: {
        trimestre: selectedTrimestre,
        period: trimestreData.period,
        stats,
        author: currentUser.name,
        badge: currentUser.badge
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-[#006d2f] font-bold px-2 py-0.5 rounded font-mono-ref">
              MCAPNIT • DGL BRAZZAVILLE
            </span>
            <span className="text-xs text-slate-500">Document Officiel de Gouvernance</span>
          </div>
          <h2 className="text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-[#006d2f]" />
            <span>Rapports Trimestriels d'Activité & de Recouvrement (PTA 2026)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Production ministérielle de l'état d'exécution du plan de travail, ventilation des recettes au Trésor et bilan d'assainissement SAA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Trimestre Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border text-xs">
            {(['T1', 'T2', 'T3', 'T4'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTrimestre(t)}
                className={`px-3 py-1.5 rounded font-bold transition ${
                  selectedTrimestre === t
                    ? 'bg-[#006d2f] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t} 2026
              </button>
            ))}
          </div>

          <button
            onClick={handlePrintReport}
            className="bg-[#022448] hover:bg-[#033468] text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Imprimer Rapport A4</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards for Selected Trimestre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Période d'évaluation</span>
          <p className="font-extrabold text-sm text-[#022448] mt-1">{trimestreData.period}</p>
          <p className="text-emerald-700 font-semibold mt-1">Exercice Réglementaire 2026</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Volume Recouvré</span>
          <p className="font-mono-ref font-black text-lg text-emerald-800 mt-0.5">
            {trimestreData.recouv.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-slate-500 mt-1">Trésor (70%) : {Math.round(trimestreData.recouv * 0.7).toLocaleString('fr-FR')} F</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Établissements Traités</span>
          <p className="font-mono-ref font-black text-lg text-[#022448] mt-0.5">
            {trimestreData.estCount} Dossiers
          </p>
          <p className="text-slate-500 mt-1">Dont {stats.formalCount} secteur formel</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Sanctions & Contentieux</span>
          <p className="font-mono-ref font-black text-lg text-red-700 mt-0.5">
            {trimestreData.sanctions} Décisions
          </p>
          <p className="text-slate-500 mt-1">Mises en demeure & scellés exécutés</p>
        </div>
      </div>

      {/* Detailed Analysis View (A4 Mirror Preview) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="border-b pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#022448] font-republic">
              SYNTHÈSE TRIMESTRIELLE D'EXÉCUTION DU PTA 2026 ({selectedTrimestre})
            </h3>
            <p className="text-xs text-slate-500">
              Rapport d'activité consolidé par le Cabinet du Directeur Départemental des Loisirs
            </p>
          </div>
          <span className="text-xs bg-slate-100 font-mono-ref px-2.5 py-1 rounded font-bold text-slate-700">
            RÉF: RAP-DDL-PN-2026/{selectedTrimestre}
          </span>
        </div>

        {/* Section 1: Répartition Territoriale */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#006d2f] mb-3">
            I. Bilan du Recouvrement par Arrondissement
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

        {/* Section 2: Analyse qualitative & Observations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-lg border">
            <h5 className="font-bold text-slate-800 uppercase mb-2">II. Constats et Assainissement SAA</h5>
            <p className="text-slate-600 leading-relaxed">
              La campagne d'assainissement acoustique et de contrôle in situ menée dans les arrondissements 1 (Lumumba) et 2 (Mvou-Mvou) a permis de constater une réduction sensible des plaintes de voisinage pour tapage nocturne. Les établissements équipés de limiteurs scellés ont vu leur conformité confirmée lors des rondes inopinées.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border">
            <h5 className="font-bold text-slate-800 uppercase mb-2">III. Recommandations pour la Direction Générale (DGL)</h5>
            <p className="text-slate-600 leading-relaxed">
              Il est recommandé d'accélérer la signature des arrêtés définitifs ministériels pour le lot des 52 dossiers d'agrément instruits et soldés déjà transmis à Brazzaville. L'apposition du label officiel « Loisirs Sains » encourage activement la régularisation spontanée des promoteurs du secteur informel.
            </p>
          </div>
        </div>

        {/* Signatures Footer preview */}
        <div className="border-t pt-4 flex items-center justify-between text-xs">
          <div className="font-serif">
            <p className="text-slate-500">Document soumis le 29 Septembre 2026</p>
            <p className="font-bold text-[#022448]">Pointe-Noire, République du Congo</p>
          </div>
          <div className="text-right font-serif">
            <p className="text-slate-600">Le Directeur Départemental des Loisirs,</p>
            <p className="font-extrabold text-[#022448]">Jean Richard NTSEKE NGOUAKA</p>
          </div>
        </div>
      </div>

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
