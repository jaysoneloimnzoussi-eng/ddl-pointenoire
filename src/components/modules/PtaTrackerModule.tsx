import React, { useState, useMemo } from 'react';
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
  Calendar,
  FileText,
  Edit3,
  Save,
  Printer,
  Plus,
  RotateCcw,
  Check
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { REPUBLIQUE_CONGO, TERRITORIAL_REFERENTIAL } from '../../constants/referential';
import { PrintModal } from '../print/PrintModal';

interface PtaContent {
  year: string;
  presentationNote: string;
  contextLessons: string;
  orientations: string[];
  budgetTotal: number;
  budgetLines: Array<{ category: string; description: string; unitCost: string; totalFcfa: number }>;
  partners: string[];
  kpis: Array<{ name: string; target: string; quarterlyTimeline: string }>;
  recommendations: Array<{ priority: 'CRITIQUE' | 'HAUTE' | 'MOYENNE'; title: string; desc: string }>;
}

const DEFAULT_PTA_2026: PtaContent = {
  year: '2026',
  presentationNote: `Le Plan de Travail Annuel 2026 de la Direction Départementale des Loisirs de Pointe-Noire s'inscrit dans la continuité de l'exercice 2025 tout en tirant les enseignements des difficultés rencontrées et des opportunités identifiées. Face à la persistance des contraintes budgétaires, il adopte une approche réaliste et pragmatique fondée sur la consolidation des partenariats et le contrôle de terrain.`,
  contextLessons: `L'année 2025 a été marquée par des contraintes structurelles majeures (insuffisance de moyens de transport, complexité administrative excessive). Malgré ces obstacles, l'année a permis d'identifier trois partenaires stratégiques fiables (Globaline, Institut Français de Pointe-Noire, Wing Wah).`,
  orientations: [
    'Consolidation des partenariats stratégiques pour compenser l\'absence de budget propre.',
    'Priorisation des missions de contrôle qualité des établissements dans les 6 arrondissements et Tchamba Nzassi.',
    'Organisation d\'activités d\'animation inclusives ciblant les écoles, personnes âgées et orphelins.',
    'Simplification administrative pour faciliter la régularisation des établissements de loisirs.'
  ],
  budgetTotal: 3696000,
  budgetLines: [
    { category: 'A. Missions de terrain et déplacements', description: 'Location de bus (contrôle, recensement, enquête) + Frais de carburant', unitCost: '4 500 F/h et forfaits', totalFcfa: 696000 },
    { category: 'B. Activités d\'animation et promotion', description: 'Concours scrabble écoles, matchs inter-classes, programme orphelins, randonnées seniors', unitCost: 'Forfaits animations', totalFcfa: 1400000 },
    { category: 'C. Équipements et matériel', description: '4 Tablettes Android pour collecte de données, matériel communication, fournitures bureau', unitCost: '100 000 F / tablette', totalFcfa: 850000 },
    { category: 'D. Formation et renforcement de capacités', description: 'Formation des 10 points focaux en entreprise et des 4 enquêteurs de terrain', unitCost: '30 000 F / point focal', totalFcfa: 400000 },
    { category: 'E. Événements et cérémonies', description: 'Cérémonie de lancement des partenariats et atelier d\'évaluation à mi-parcours (T2)', unitCost: 'Forfaits cérémonies', totalFcfa: 350000 }
  ],
  partners: [
    'Globaline (Secteur privé — Financement concours scolaires et lots)',
    'Institut Français de Pointe-Noire (Coopération culturelle — Espaces et animateurs)',
    'Wing Wah (Secteur privé — Soutien au programme scrabble pour orphelins)',
    'Mairies des 6 Arrondissements et Sécurité Civile'
  ],
  kpis: [
    { name: 'Missions de contrôle qualité réalisées', target: '8 missions', quarterlyTimeline: 'T1: 2, T2: 2, T3: 2, T4: 2' },
    { name: 'Établissements de loisirs recensés', target: '100% des 7 zones', quarterlyTimeline: 'T1-T2: 100%' },
    { name: 'Conventions de partenariat signées', target: '5 conventions', quarterlyTimeline: 'T1-T2: 3, T3: 2' },
    { name: 'Points focaux créés en entreprise', target: '10 points focaux', quarterlyTimeline: 'T1: 3, T2: 3, T3: 2, T4: 2' },
    { name: 'Activités scolaires & inclusives', target: '8 événements', quarterlyTimeline: '2 par trimestre' },
    { name: 'Rapports trimestriels produits & transmis', target: '4 rapports', quarterlyTimeline: '1 par trimestre' }
  ],
  recommendations: [
    { priority: 'CRITIQUE', title: '1. Allocation Budgétaire Minimale', desc: 'Allouer une enveloppe minimale de 3 696 000 FCFA pour l\'exécution des missions prioritaires de régulation et d\'animation.' },
    { priority: 'CRITIQUE', title: '2. Acquisition de Moyens Logistiques', desc: 'Acquérir 1 véhicule de service et 2 motos pour assurer les missions régulières du Service SAA dans les 7 zones.' },
    { priority: 'HAUTE', title: '3. Simplification des Procédures Administratives', desc: 'Réduire le nombre de pièces exigées pour l\'autorisation d\'ouverture afin d\'accélérer la régularisation du secteur informel.' },
    { priority: 'HAUTE', title: '4. Renforcement des Ressources Humaines', desc: 'Affecter 5 agents fonctionnaires supplémentaires à la DDL-PN (2 Autorisation SAA, 2 Statistiques, 1 Promotion SPA).' },
    { priority: 'MOYENNE', title: '5. Validation des Conventions de Partenariat', desc: 'Faciliter la signature rapide des conventions avec Globaline, l\'Institut Français et Wing Wah.' }
  ]
};

export const PtaTrackerModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const stats = storageService.getSystemStats();

  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PREVIEW' | 'EDITOR'>('DASHBOARD');

  // PTA Storage State
  const [ptaStore, setPtaStore] = useState<Record<string, PtaContent>>(() => {
    const saved = localStorage.getItem('ddl_pn_pta_annual_store');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return { '2026': DEFAULT_PTA_2026 };
  });

  const currentPta: PtaContent = useMemo(() => {
    if (ptaStore[selectedYear]) return ptaStore[selectedYear];
    return {
      ...DEFAULT_PTA_2026,
      year: selectedYear,
      presentationNote: `Plan de Travail Annuel de la Direction Départementale des Loisirs de Pointe-Noire pour l'exercice ${selectedYear}.`
    };
  }, [ptaStore, selectedYear]);

  const [editForm, setEditForm] = useState<PtaContent>(currentPta);

  React.useEffect(() => {
    setEditForm(currentPta);
  }, [currentPta]);

  const handleSavePta = () => {
    const updated = {
      ...ptaStore,
      [selectedYear]: editForm
    };
    setPtaStore(updated);
    localStorage.setItem('ddl_pn_pta_annual_store', JSON.stringify(updated));
    triggerNotification(`Plan de Travail Annuel (PTA ${selectedYear}) enregistré avec succès !`, 'success');
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

  const handlePrintPta = () => {
    setPrintDoc({
      isOpen: true,
      type: 'RAPPORT_TRIMESTRIEL_A4',
      title: `Plan de Travail Annuel (PTA ${selectedYear}) - DDL-PN`,
      data: {
        trimestre: `PTA ANNUEL ${selectedYear}`,
        periodLabel: `Exercice Budgétaire et Réglementaire ${selectedYear}`,
        introduction: currentPta.presentationNote,
        tempsForts: currentPta.orientations,
        indicators: currentPta.kpis.map(k => ({
          name: k.name,
          target: k.target,
          result: k.quarterlyTimeline,
          status: 'EN_COURS' as const
        })),
        safmBilan: `Budget prévisionnel minimal : ${currentPta.budgetTotal.toLocaleString('fr-FR')} FCFA. Plaidoyer pour 1 véhicule, 2 motos et 4 tablettes de collecte.`,
        saaBilan: `Missions de contrôle qualité des établissements de loisirs (8 missions programmées dans les 7 zones d'intervention).`,
        ssidBilan: `Recensement, cartographie des opérateurs et enquête sur les besoins en loisirs de la population.`,
        spaBilan: `Partenariats avec Globaline, Institut Français et Wing Wah. Programme scrabble pour 30 orphelins et 8 randonnées seniors.`,
        difficultes: currentPta.contextLessons,
        recommandations: currentPta.recommendations.map(r => `${r.title} : ${r.desc}`).join(' | '),
        conclusion: `Le PTA ${selectedYear} vise la transformation de la DDL-PN en une direction opérationnelle, crédible et efficace.`,
        dateSubmission: `${selectedYear}-01-15`,
        signataire: 'Jean Richard NTSEKE NGOUAKA',
        signataireTitre: 'Directeur Départemental des Loisirs de Pointe-Noire'
      }
    });
  };

  // 4 Official Strategic Axes
  const axes = [
    {
      number: 1,
      title: 'Axe 1 : Régulation et Contrôle des Établissements',
      lead: 'Service Autorisation (SAA)',
      color: 'border-emerald-500 bg-emerald-50/30',
      progress: Math.min(100, Math.round((stats.totalEst / 150) * 100)),
      desc: 'Recensement exhaustif, 8 missions de contrôle qualité dans les 7 zones et simplification des procédures.'
    },
    {
      number: 2,
      title: 'Axe 2 : Partenariats et Mobilisation de Ressources',
      lead: 'Cabinet de Direction DDL-PN',
      color: 'border-amber-500 bg-amber-50/30',
      progress: 60,
      desc: 'Conventions avec Globaline, Institut Français, Wing Wah et déploiement de 10 points focaux en entreprise.'
    },
    {
      number: 3,
      title: 'Axe 3 : Animation et Inclusion Sociale (Loisirs Sains)',
      lead: 'Service Promotion, Animation (SPA)',
      color: 'border-blue-500 bg-blue-50/30',
      progress: 55,
      desc: 'Animations scolaires dans 10 écoles, initiation scrabble pour 30 orphelins et randonnées pour personnes âgées.'
    },
    {
      number: 4,
      title: 'Axe 4 : Information, Statistiques et Cartographie',
      lead: 'Service Statistiques & Documentation (SSID)',
      color: 'border-indigo-500 bg-indigo-50/30',
      progress: 80,
      desc: 'Cartographie SIG des opérateurs, enquête sur les pratiques de loisirs et production des bulletins officiels.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#006d2f] text-white font-bold px-2.5 py-0.5 rounded-full font-mono-ref">
              PTA {selectedYear} • RÉPUBLIQUE DU CONGO
            </span>
            <span className="text-xs text-slate-500 font-medium">Cadre Logique & Concepteur Annuel</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2 font-republic">
            <Target className="w-5 h-5 text-[#006d2f]" />
            <span>Plan de Travail Annuel ({selectedYear})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Élaborez, pilotez et imprimez les PTA annuels de la Direction Départementale des Loisirs de Pointe-Noire.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#022448] outline-none"
          >
            <option value="2025">Exercice 2025</option>
            <option value="2026">Exercice 2026</option>
            <option value="2027">Exercice 2027</option>
            <option value="2028">Exercice 2028</option>
          </select>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border text-xs font-bold">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'DASHBOARD'
                  ? 'bg-[#006d2f] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Suivi des 4 Axes</span>
            </button>
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'PREVIEW'
                  ? 'bg-[#022448] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document PTA Officiel</span>
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
              <span>Rédiger / Modifier PTA</span>
            </button>
          </div>

          <button
            onClick={handlePrintPta}
            className="bg-gradient-to-r from-red-900 via-[#850404] to-red-950 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow hover:scale-[1.02] transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Imprimer PTA A4</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OPERATIONAL DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* 4 Strategic Axes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {axes.map(axe => (
              <div
                key={axe.number}
                className={`p-5 rounded-2xl border-l-4 bg-white shadow-sm flex flex-col justify-between ${axe.color}`}
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

                  <h3 className="font-extrabold text-slate-900 text-base mt-2 font-republic">
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
                  <span>Périmètre : <strong>7 Zones Départementales</strong></span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Jalonnement Actif</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Budget Minimal & KPI Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Budget Minimal 2026 */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-black text-[#022448] font-republic uppercase">
                    Budget Prévisionnel Minimal ({selectedYear})
                  </h3>
                  <p className="text-[11px] text-slate-500">Enveloppe minimale d'exécution</p>
                </div>
                <span className="font-mono-ref font-black text-sm text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {currentPta.budgetTotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {currentPta.budgetLines.map((line, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{line.category}</p>
                      <p className="text-[10px] text-slate-500">{line.description}</p>
                    </div>
                    <span className="font-mono-ref font-bold text-slate-900 shrink-0 ml-2">
                      {line.totalFcfa.toLocaleString('fr-FR')} F
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Key Performance Indicators */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-black text-[#022448] font-republic uppercase">
                    Indicateurs de Performance Clés (KPI)
                  </h3>
                  <p className="text-[11px] text-slate-500">Chronogramme trimestriel d'évaluation</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded">
                  7 Activités Principales
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#022448] text-white">
                    <tr>
                      <th className="p-2">Indicateur Clé</th>
                      <th className="p-2">Cible Annuelle</th>
                      <th className="p-2">Répartition Trimestrielle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentPta.kpis.map((k, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 font-semibold text-slate-800">{k.name}</td>
                        <td className="p-2 font-mono-ref font-bold text-emerald-800">{k.target}</td>
                        <td className="p-2 font-mono-ref text-slate-600 text-[11px]">{k.quarterlyTimeline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL PTA PREVIEW */}
      {activeTab === 'PREVIEW' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          <div className="border-b pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-mono-ref">
                DOCUMENT OFFICIEL DE PLANIFICATION
              </span>
              <h3 className="text-xl font-black text-[#022448] font-republic mt-2 uppercase tracking-wide">
                PLAN DE TRAVAIL ANNUEL {selectedYear} (PTA)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Direction Départementale des Loisirs de Pointe-Noire • Ministère de la Culture, des Arts, du Tourisme et des Loisirs
              </p>
            </div>
            <div className="text-right font-serif text-xs hidden sm:block">
              <p className="text-slate-500">Approbation :</p>
              <p className="font-bold text-[#022448]">Direction Générale des Loisirs (Brazzaville)</p>
            </div>
          </div>

          {/* Note de présentation */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-[#006d2f] pl-2.5">
              Note de Présentation & Orientations Stratégiques {selectedYear}
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50 p-4 rounded-xl border border-slate-200">
              {currentPta.presentationNote}
            </p>
          </div>

          {/* 4 Piliers */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-amber-600 pl-2.5">
              Les 4 Piliers Stratégiques Retenus
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {currentPta.orientations.map((p, i) => (
                <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <p className="text-slate-700">{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandations prioritaires */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#022448] font-republic uppercase border-l-4 border-red-700 pl-2.5">
              Recommandations Prioritaires à la Hiérarchie
            </h4>
            <div className="space-y-2 text-xs">
              {currentPta.recommendations.map((r, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border flex items-start gap-3">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 uppercase ${
                    r.priority === 'CRITIQUE' ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {r.priority}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{r.title}</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Signatures */}
          <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-serif italic text-slate-500">Plan validé pour exécution</p>
              <p className="font-bold text-[#022448]">Pointe-Noire, le 15 Janvier {selectedYear}</p>
            </div>

            <div className="text-right font-serif">
              <p className="text-slate-600">Le Directeur Départemental des Loisirs de Pointe-Noire,</p>
              <div className="h-10 flex items-center justify-end text-slate-400 italic text-xs">
                [Signature & Sceau Officiel]
              </div>
              <p className="font-black text-[#022448] text-sm">Jean Richard NTSEKE NGOUAKA</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PTA INTERACTIVE EDITOR */}
      {activeTab === 'EDITOR' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-black text-[#022448] font-republic uppercase">
                Concepteur & Éditeur du Plan de Travail Annuel ({selectedYear})
              </h3>
              <p className="text-xs text-slate-500">
                Ajustez les orientations, le budget et les objectifs pour chaque nouvel exercice.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSavePta}
              className="px-4 py-2 bg-[#006d2f] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer le PTA</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 uppercase mb-1">
                Note de Présentation & Orientations Générales ({selectedYear})
              </label>
              <textarea
                rows={4}
                value={editForm.presentationNote}
                onChange={e => setEditForm({ ...editForm, presentationNote: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 uppercase mb-1">
                Contexte et Leçons de l'Exercice Précédent
              </label>
              <textarea
                rows={3}
                value={editForm.contextLessons}
                onChange={e => setEditForm({ ...editForm, contextLessons: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white outline-none"
              />
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditForm(DEFAULT_PTA_2026)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rétablir le modèle par défaut</span>
              </button>

              <button
                type="button"
                onClick={handleSavePta}
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
