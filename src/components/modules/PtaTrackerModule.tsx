import React from 'react';
import {
  Target,
  CheckCircle2,
  TrendingUp,
  Clock,
  Building2,
  Shield,
  Coins,
  Send,
  Sparkles,
  Calendar
} from 'lucide-react';
import { PTA_2026_AXES } from '../../constants/referential';
import { storageService } from '../../services/storageService';

export const PtaTrackerModule: React.FC = () => {
  const stats = storageService.getSystemStats();

  const axes = [
    {
      number: 1,
      title: 'Axe 1 : Recensement Exhaustif & Assainissement SAA',
      lead: 'Brigade SAA - Terrain',
      color: 'border-emerald-500 bg-emerald-50/30',
      progress: Math.min(100, Math.round((stats.totalEst / 150) * 100)),
      desc: 'Cartographie et assainissement des 150 débits de boissons et établissements récréatifs de Pointe-Noire.'
    },
    {
      number: 2,
      title: 'Axe 2 : Digitalisation des Paiements & Régie SAF',
      lead: 'SAF / Régie des Recettes',
      color: 'border-amber-500 bg-amber-50/30',
      progress: Math.min(100, Math.round((stats.totalPaid / 35000000) * 100)),
      desc: 'Recouvrement électronique direct avec émission instantanée de quittances thermiques 58mm.'
    },
    {
      number: 3,
      title: 'Axe 3 : Promotion des Loisirs Sains & Charte Acoustique',
      lead: 'Service Promotion, Animation (SPA)',
      color: 'border-blue-500 bg-blue-50/30',
      progress: 68,
      desc: 'Labellisation au Diplôme d’Honneur et sensibilisation aux seuils sonores autorisés.'
    },
    {
      number: 4,
      title: 'Axe 4 : Transmission Centrale & Modernisation Administrative',
      lead: 'Cabinet de Direction DDL-PN',
      color: 'border-indigo-500 bg-indigo-50/30',
      progress: Math.min(100, Math.round((stats.transmittedDgl / 75) * 100)),
      desc: 'Bordereaux d’envoi scellés pour signature définitive des agréments par la DGL à Brazzaville.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#006d2f] text-white font-bold px-2 py-0.5 rounded font-mono-ref">
              PLAN DE TRAVAIL ANNUEL
            </span>
            <span className="text-xs text-slate-500">PTA 2026 • République du Congo</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#006d2f]" />
            <span>Tableau de Bord du Plan de Travail Annuel (PTA 2026)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des 4 axes stratégiques ministériels et jalonnement des indicateurs de performance de la Direction Départementale.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border p-2.5 rounded-lg text-xs font-mono-ref">
          <span className="text-slate-500">Avancement Global PTA :</span>
          <span className="font-extrabold text-[#006d2f] text-sm">73.5%</span>
        </div>
      </div>

      {/* 4 Strategic Axes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {axes.map(axe => (
          <div
            key={axe.number}
            className={`p-5 rounded-xl border-l-4 bg-white shadow-sm flex flex-col justify-between ${axe.color}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {axe.lead}
                </span>
                <span className="text-xs font-mono-ref font-bold text-[#022448] bg-white px-2 py-0.5 rounded border">
                  {axe.progress}% Réalisé
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base mt-2">
                {axe.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {axe.desc}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mt-4">
                <div
                  className="bg-[#006d2f] h-full rounded-full transition-all duration-700"
                  style={{ width: `${axe.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Échéance finale : <strong>31 Décembre 2026</strong></span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>En bonne voie</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Objective Indicators Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm">Indicateurs Spécifiques de Performance PTA 2026</h3>
          <p className="text-xs text-slate-500">Contrat d'objectifs validé avec le Ministère de tutelle</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#022448] text-white uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Réf</th>
                <th className="py-2.5 px-3">Intitulé de l'Objectif</th>
                <th className="py-2.5 px-3">Service Pilote</th>
                <th className="py-2.5 px-3">Cible 2026</th>
                <th className="py-2.5 px-3">Actuel</th>
                <th className="py-2.5 px-3">Taux</th>
                <th className="py-2.5 px-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PTA_2026_AXES.map(obj => (
                <tr key={obj.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono-ref font-bold text-slate-500">{obj.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{obj.objective_title}</td>
                  <td className="py-2.5 px-3 text-slate-600">{obj.lead_service}</td>
                  <td className="py-2.5 px-3 font-mono-ref font-bold">
                    {obj.target_value.toLocaleString('fr-FR')} {obj.unit}
                  </td>
                  <td className="py-2.5 px-3 font-mono-ref text-emerald-800 font-bold">
                    {obj.current_value.toLocaleString('fr-FR')} {obj.unit}
                  </td>
                  <td className="py-2.5 px-3 font-mono-ref font-extrabold text-[#006d2f]">
                    {obj.progress_percent}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[10px] bg-emerald-100 text-[#006d2f] font-bold px-2 py-0.5 rounded">
                      Conforme
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
