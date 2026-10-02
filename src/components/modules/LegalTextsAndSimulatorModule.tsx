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
  const [customForfait, setCustomForfait] = useState<number>(50000);
  const [installments, setInstallments] = useState<number>(2);

  const calc = calculateEstablishmentFee(
    selectedActivity,
    surface,
    regime,
    regime === 'INFORMEL' ? customForfait : undefined
  );
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
                  <p className="text-[10px] text-slate-500 mt-0.5">Forfait DDL : 50 000 FCFA (révisable)</p>
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
                  <p className="text-[10px] text-slate-500 mt-0.5">Frais de dossier : 50 000 FCFA + Surface</p>
                </button>
              </div>
            </div>

            {/* SECTEUR INFORMEL : Saisie manuelle du forfait DDL-PN */}
            {regime === 'INFORMEL' ? (
              <div className="p-4 bg-emerald-50/90 border-2 border-emerald-500 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                    <span>Forfait DDL-PN Secteur Informel (FCFA) *</span>
                  </label>
                  <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    50 000 FCFA par défaut (révisable)
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={customForfait}
                    onChange={e => setCustomForfait(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 bg-white border-2 border-emerald-600 rounded-lg font-mono-ref font-black text-base text-[#022448] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">FCFA</span>
                </div>

                {/* Boutons d'ajustements manuels rapides */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-slate-600 font-medium text-[10px]">Ajustements rapides :</span>
                  <button
                    type="button"
                    onClick={() => setCustomForfait(50000)}
                    className="px-2 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 cursor-pointer shadow-2xs"
                  >
                    50 000 F (Forfait DDL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomForfait(Math.max(0, customForfait - 10000))}
                    className="px-2 py-1 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    -10 000 F (Baisse)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomForfait(customForfait + 10000)}
                    className="px-2 py-1 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    +10 000 F (Hausse)
                  </button>
                </div>
                <p className="text-[10.5px] text-emerald-900 leading-snug">
                  * Note officielle : À la Direction Départementale des Loisirs de Pointe-Noire, le montant forfaitaire réglementaire pour le secteur informel est de <strong>50 000 FCFA</strong>. Ce montant peut être saisi manuellement à la baisse comme à la hausse lors des constatations et conciliations sur le terrain.
                </p>
              </div>
            ) : (
              /* SECTEUR FORMEL : Activité et Surface */
              <>
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
              </>
            )}

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
              {regime === 'INFORMEL' ? (
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Forfait DDL-PN Secteur Informel :</span>
                  <span className="font-bold text-emerald-400">{calc.totalDue.toLocaleString('fr-FR')} FCFA</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Frais de dossier réglementaires :</span>
                    <span>{calc.filingFee.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Superficie ({surface} m² × {calc.ratePerSqm} F) :</span>
                    <span>{(surface * calc.ratePerSqm).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </>
              )}

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
