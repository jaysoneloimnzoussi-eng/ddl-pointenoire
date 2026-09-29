import React, { useState } from 'react';
import {
  Calculator,
  BookOpen,
  Scale,
  Coins,
  FileText,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Copy
} from 'lucide-react';
import { LEGAL_TEXTS, ACTIVITY_CATEGORIES, TAXATION_RULES } from '../../constants/referential';
import { RegimeType } from '../../types';
import { calculateEstablishmentFee } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';

export const LegalTextsAndSimulatorModule: React.FC = () => {
  const { triggerNotification } = useSession();
  const [selectedActivity, setSelectedActivity] = useState<string>('A1.1');
  const [surface, setSurface] = useState<number>(150);
  const [regime, setRegime] = useState<RegimeType>('INFORMEL');
  const [installments, setInstallments] = useState<number>(2);

  const calc = calculateEstablishmentFee(selectedActivity, surface, regime);
  const tresorShare = Math.round(calc.totalDue * 0.7);
  const regieShare = calc.totalDue - tresorShare;
  const perInstallment = Math.round(calc.totalDue / installments);

  const selectedCatObj = ACTIVITY_CATEGORIES.find(c => c.code === selectedActivity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-[#006d2f] font-bold px-2 py-0.5 rounded font-mono-ref">
              CADRE JURIDIQUE & FISCALITÉ
            </span>
            <span className="text-xs text-slate-500">PTA 2026</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#006d2f]" />
            <span>Textes Fondateurs & Moteur de Simulation Tarifaire</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Formule officielle : <code className="font-mono-ref font-bold text-slate-800">Redevance_Totale = Frais_Dossier + (Superficie_m² × Taux_Activité)</code>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Simulator */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#006d2f]" />
              <span>Simulateur en Temps Réel de Redevance d'Agrément</span>
            </h3>
            <p className="text-xs text-slate-500">Calculez instantanément le montant dû et l'échéancier des acomptes</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Regime */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Secteur Réglementaire</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegime('INFORMEL')}
                  className={`p-3 rounded-lg border text-left transition ${
                    regime === 'INFORMEL'
                      ? 'border-[#006d2f] bg-emerald-50 text-[#006d2f] font-bold ring-1 ring-[#006d2f]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-bold">Secteur Informel</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Frais de dossier : 30 000 FCFA</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRegime('FORMEL')}
                  className={`p-3 rounded-lg border text-left transition ${
                    regime === 'FORMEL'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-bold">Secteur Formel (RCCM)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Frais de dossier : 50 000 FCFA</p>
                </button>
              </div>
            </div>

            {/* Activity Category */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Catégorie d'Activité de Loisirs</label>
              <select
                value={selectedActivity}
                onChange={e => setSelectedActivity(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-1 focus:ring-[#006d2f]"
              >
                {ACTIVITY_CATEGORIES.map(cat => (
                  <option key={cat.code} value={cat.code}>
                    {cat.code} - {cat.label} ({cat.rate_per_sqm_fcfa} FCFA/m²)
                  </option>
                ))}
              </select>
            </div>

            {/* Surface slider & input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Superficie au sol déclarée</label>
                <span className="font-mono-ref font-extrabold text-sm text-[#022448]">{surface} m²</span>
              </div>
              <input
                type="range"
                min="20"
                max="800"
                step="5"
                value={surface}
                onChange={e => setSurface(Number(e.target.value))}
                className="w-full accent-[#006d2f] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>20 m²</span>
                <span>200 m²</span>
                <span>500 m²</span>
                <span>800 m²</span>
              </div>
            </div>

            {/* Installments */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Facilité de Paiement (Nombre d'Acomptes)</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setInstallments(num)}
                    className={`py-2 rounded-lg font-bold text-center border transition ${
                      installments === num
                        ? 'bg-[#022448] text-white border-[#022448]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {num === 1 ? 'Comptant' : `${num} Acomptes`}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Box */}
            <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3 font-mono-ref mt-4">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Frais de dossier réglementaires :</span>
                <span>{calc.filingFee.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Superficie ({surface} m² × {calc.ratePerSqm} F) :</span>
                <span>{(surface * calc.ratePerSqm).toLocaleString('fr-FR')} FCFA</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-700 text-amber-400 font-extrabold text-base sm:text-lg">
                <span className="font-sans text-xs uppercase tracking-wider text-slate-300">TOTAL EXIGIBLE :</span>
                <span>{calc.totalDue.toLocaleString('fr-FR')} FCFA</span>
              </div>

              {installments > 1 && (
                <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700 text-xs text-emerald-300 flex justify-between">
                  <span>Montant de chaque acompte ({installments}x) :</span>
                  <span className="font-bold">{perInstallment.toLocaleString('fr-FR')} FCFA / mois</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-700 flex justify-between text-[11px] text-slate-400">
                <span>Part Trésor (70%) : <strong className="text-white">{tresorShare.toLocaleString('fr-FR')} F</strong></span>
                <span>Part Régie DDL (30%) : <strong className="text-white">{regieShare.toLocaleString('fr-FR')} F</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Legal Corpus */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-[#006d2f]" />
              <span>Recueil Législatif & Textes d'Application</span>
            </h3>

            <div className="space-y-4 text-xs">
              {LEGAL_TEXTS.map(txt => (
                <div key={txt.ref} className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-mono-ref bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                    {txt.ref}
                  </span>
                  <h4 className="font-extrabold text-[#022448] text-xs mt-1.5">
                    {txt.title}
                  </h4>

                  <div className="mt-2.5 space-y-2 text-slate-600 font-legal italic">
                    {txt.articles.map(art => (
                      <p key={art.num} className="leading-relaxed">
                        <strong className="not-italic text-slate-800">{art.num} : </strong>
                        « {art.text} »
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
