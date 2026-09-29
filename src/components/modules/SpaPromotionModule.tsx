import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  CreditCard,
  Share2,
  Rss,
  Printer,
  Plus,
  CheckCircle,
  Copy,
  Calendar,
  ExternalLink,
  MessageCircle,
  Megaphone
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { SpaMerchantSubscription, SpaHonorDiploma } from '../../types';
import { PrintModal } from '../print/PrintModal';

export const SpaPromotionModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [activeTab, setActiveTab] = useState<'PTA_EVENTS' | 'DIPLOME_HONNEUR' | 'ABONNEMENTS' | 'RESEAUX_SOCIAUX' | 'FLUX_RSS'>('DIPLOME_HONNEUR');

  const [diplomas, setDiplomas] = useState<SpaHonorDiploma[]>(() => storageService.getDiplomas());
  const [subscriptions, setSubscriptions] = useState<SpaMerchantSubscription[]>(() => storageService.getSubscriptions());
  const establishments = storageService.getEstablishments();

  // Print modal
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: 'DIPLOME_HONNEUR_A4';
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'DIPLOME_HONNEUR_A4',
    title: '',
    data: null
  });

  // Modal new diploma
  const [isAddDipModal, setIsAddDipModal] = useState(false);
  const [dipEstId, setDipEstId] = useState(establishments[0]?.id || '');
  const [dipLabel, setDipLabel] = useState('Diplôme d’Honneur des Loisirs Sains & d’Excellence Acoustique');
  const [dipReasons, setDipReasons] = useState('Respect exemplaire des normes acoustiques (<80 dB) certifié par la Brigade SAA');

  // Copy RSS
  const handleCopyRss = () => {
    navigator.clipboard.writeText(`${window.location.origin}/api/rss.xml`);
    triggerNotification('URL du flux officiel RSS 2.0 copiée dans le presse-papier !', 'success');
  };

  const handleCreateDiploma = (e: React.FormEvent) => {
    e.preventDefault();
    const est = establishments.find(e => e.id === dipEstId);
    if (!est) return;

    const newDip = storageService.addDiploma({
      establishment_id: est.id,
      establishment_name: est.name,
      promoter_name: est.promoter_name,
      arrondissement: est.arrondissement,
      label: dipLabel,
      award_date: new Date().toISOString().split('T')[0],
      reference_number: `DIP-HONNEUR-DDLPN-2026-${String(diplomas.length + 1).padStart(3, '0')}`,
      reasons: [dipReasons, 'Environnement sain et convivialité exemplaire', 'Participation à la charte municipale des loisirs']
    });

    setDiplomas(storageService.getDiplomas());
    setIsAddDipModal(false);
    triggerNotification(`Diplôme d'Honneur décerné à ${est.name} !`, 'success');

    // Propose print
    setPrintDoc({
      isOpen: true,
      type: 'DIPLOME_HONNEUR_A4',
      title: `Diplôme d'Honneur - ${est.name}`,
      data: newDip
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-mono-ref">
              SERVICE SPA • MCAPNIT
            </span>
            <span className="text-xs text-slate-500">Valorisation du Patrimoine Récréatif</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Service Promotion, Animation et Loisirs Sains (SPA)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Labellisation d'excellence, abonnements marchands, kit d'influence réseaux sociaux et syndication RSS 2.0.
          </p>
        </div>

        {/* 5 Sub-Module Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg border text-xs gap-1">
          <button
            onClick={() => setActiveTab('DIPLOME_HONNEUR')}
            className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
              activeTab === 'DIPLOME_HONNEUR' ? 'bg-[#006d2f] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Diplômes d'Honneur</span>
          </button>

          <button
            onClick={() => setActiveTab('ABONNEMENTS')}
            className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
              activeTab === 'ABONNEMENTS' ? 'bg-[#006d2f] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Abonnements Marchands</span>
          </button>

          <button
            onClick={() => setActiveTab('PTA_EVENTS')}
            className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
              activeTab === 'PTA_EVENTS' ? 'bg-[#006d2f] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Événements PTA 2026</span>
          </button>

          <button
            onClick={() => setActiveTab('RESEAUX_SOCIAUX')}
            className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
              activeTab === 'RESEAUX_SOCIAUX' ? 'bg-[#006d2f] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Kit Réseaux</span>
          </button>

          <button
            onClick={() => setActiveTab('FLUX_RSS')}
            className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
              activeTab === 'FLUX_RSS' ? 'bg-[#006d2f] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Rss className="w-3.5 h-3.5" />
            <span>Flux RSS 2.0</span>
          </button>
        </div>
      </div>

      {/* Sub-module 1: Diplômes d'Honneur */}
      {activeTab === 'DIPLOME_HONNEUR' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Catalogue Officiel des Établissements Labellisés « Loisirs Sains »
              </h3>
              <p className="text-xs text-slate-500">
                Distinctions récompensant la conformité acoustique et le respect de la charte républicaine.
              </p>
            </div>
            <button
              onClick={() => setIsAddDipModal(true)}
              className="bg-[#006d2f] hover:bg-[#005a26] text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Décerner un Diplôme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diplomas.map(dip => (
              <div
                key={dip.id}
                className="bg-amber-50/50 border border-amber-300 p-5 rounded-xl shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-ref font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                      {dip.reference_number}
                    </span>
                    <span className="text-xs text-slate-500">{dip.award_date}</span>
                  </div>

                  <h4 className="text-lg font-black text-[#022448] font-republic uppercase mt-3">
                    {dip.establishment_name}
                  </h4>
                  <p className="text-xs font-semibold text-[#006d2f] mt-0.5">
                    {dip.label}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Promoteur : <strong>{dip.promoter_name}</strong> • {dip.arrondissement}
                  </p>

                  <div className="mt-3 bg-white/70 p-3 rounded border border-amber-200 text-xs">
                    <p className="font-bold text-slate-700 text-[11px] mb-1">Mérites constatés par la Brigade :</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                      {dip.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Paraphe Directeur Départemental</span>
                  <button
                    onClick={() => {
                      setPrintDoc({
                        isOpen: true,
                        type: 'DIPLOME_HONNEUR_A4',
                        title: `Diplôme d'Honneur - ${dip.establishment_name}`,
                        data: dip
                      });
                    }}
                    className="bg-[#022448] hover:bg-[#033468] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Imprimer Diplôme A4</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-module 2: Abonnements Marchands */}
      {activeTab === 'ABONNEMENTS' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Formules d'Abonnement Promotionnel DDL-PN
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Les établissements régularisés peuvent souscrire à des formules d'accompagnement et de promotion officielle garantissant leur visibilité sur les supports départementaux et leur inclusion dans le guide touristique de Pointe-Noire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bronze Plan */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-mono-ref">
                  FORMULE BRONZE
                </span>
                <div className="mt-2 mb-4">
                  <span className="text-2xl font-black text-[#022448] font-mono-ref">25 000</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">FCFA / mois</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f]" />
                    <span>Référencement guide départemental</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f]" />
                    <span>Kit de sensibilisation acoustique</span>
                  </li>
                </ul>
              </div>
              <button className="mt-6 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition">
                Souscrire un Établissement
              </button>
            </div>

            {/* Silver Plan */}
            <div className="bg-white p-5 rounded-xl border-2 border-slate-400 shadow-md flex flex-col justify-between relative">
              <span className="absolute -top-2.5 right-4 bg-slate-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                POPULAIRE
              </span>
              <div>
                <span className="text-xs bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded font-mono-ref">
                  FORMULE SILVER
                </span>
                <div className="mt-2 mb-4">
                  <span className="text-2xl font-black text-[#022448] font-mono-ref">50 000</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">FCFA / mois</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f]" />
                    <span>Inclusion catalogue éco-responsable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f]" />
                    <span>Relais mensuel réseaux officiels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f]" />
                    <span>Plaque "Recommandé DDL-PN"</span>
                  </li>
                </ul>
              </div>
              <button className="mt-6 w-full py-2 bg-[#022448] hover:bg-[#033468] text-white text-xs font-bold rounded-lg transition">
                Souscrire un Établissement
              </button>
            </div>

            {/* Gold Plan */}
            <div className="bg-amber-50/50 p-5 rounded-xl border-2 border-amber-400 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded font-mono-ref">
                  FORMULE GOLD EXCELLENCE
                </span>
                <div className="mt-2 mb-4">
                  <span className="text-2xl font-black text-[#022448] font-mono-ref">100 000</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">FCFA / mois</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f]" />
                    <span>En-tête prioritaire portail web DDL-PN</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f]" />
                    <span>Relais bi-mensuel Facebook & WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f]" />
                    <span>Mention au Journal Officiel des Loisirs (RSS)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#006d2f]" />
                    <span>Calibration acoustique annuelle gratuite</span>
                  </li>
                </ul>
              </div>
              <button className="mt-6 w-full py-2 bg-[#006d2f] hover:bg-[#005a26] text-white text-xs font-bold rounded-lg transition">
                Souscrire un Établissement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-module 3: PTA Events */}
      {activeTab === 'PTA_EVENTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded font-mono-ref text-[10px]">
                OCTOBRE 2026
              </span>
              <h4 className="font-extrabold text-[#022448] text-sm mt-2">
                Semaine de la Nuit Saine de Pointe-Noire
              </h4>
              <p className="text-slate-500 mt-1">
                Sensibilisation des boîtes de nuit et cabarets de Lumumba et Tié-Tié aux décibels modérés.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <span className="bg-emerald-100 text-[#006d2f] font-bold px-2 py-0.5 rounded font-mono-ref text-[10px]">
                NOVEMBRE 2026
              </span>
              <h4 className="font-extrabold text-[#022448] text-sm mt-2">
                Festival des Rumbas et Convivialités Ponténégrines
              </h4>
              <p className="text-slate-500 mt-1">
                Animation territoriale dans les arrondissements 2 (Mvou-Mvou) et 4 (Loandjili).
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-mono-ref text-[10px]">
                DÉCEMBRE 2026
              </span>
              <h4 className="font-extrabold text-[#022448] text-sm mt-2">
                Nuit des Étoiles & Remise des Diplômes Départementaux
              </h4>
              <p className="text-slate-500 mt-1">
                Gala de clôture du PTA 2026 sous le haut patronage du Ministère de tutelle.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-module 4: Kit Réseaux Sociaux */}
      {activeTab === 'RESEAUX_SOCIAUX' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#006d2f]" />
              <span>Générateur de Publications Officielles (Facebook / WhatsApp)</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-lg border font-mono-ref text-[11px] leading-relaxed text-slate-800">
              <p className="font-bold text-[#006d2f]">
                🏛️ [COMMUNIQUÉ OFFICIEL] DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE (DDL-PN)
              </p>
              <p className="mt-2">
                Dans le cadre de l’exécution du Plan de Travail Annuel (PTA 2026), la Brigade du Service Agrément et Assainissement (SAA) félicite les établissements labellisés pour leur engagement citoyen et le respect scrupuleux de la Charte Acoustique Nocturne.
              </p>
              <p className="mt-2">
                📢 Rappel aux exploitants : L'échéance de dépôt des dossiers d'agrément et d'attestation provisoire est fixée aux guichets de la régie DDL-PN.
              </p>
              <p className="mt-2 text-slate-500">
                #PointeNoire #LoisirsSains #CongoBrazzaville #MCAPNIT #PTA2026
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `🏛️ [COMMUNIQUÉ OFFICIEL DDL-PN] Respect de la charte acoustique nocturne et agréments d'exploitation 2026. Infos : +242 06 600 00 01`
                  );
                  triggerNotification('Texte copié pour partage WhatsApp !', 'success');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Copier pour WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-module 5: Flux XML RSS 2.0 */}
      {activeTab === 'FLUX_RSS' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Rss className="w-4 h-4 text-amber-600" />
                  <span>Flux XML RSS 2.0 Officiel - Journal des Loisirs Sains</span>
                </h3>
                <p className="text-slate-500 text-xs">
                  Généré dynamiquement par le serveur backend Express sur <code className="bg-slate-100 px-1 rounded font-mono-ref">/api/rss.xml</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyRss}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier l'URL RSS</span>
                </button>
                <a
                  href="/api/rss.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#006d2f] hover:bg-[#005a26] text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir le XML Brut</span>
                </a>
              </div>
            </div>

            <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono-ref text-[11px] overflow-x-auto max-h-60">
              <pre>{`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>DDL-PN - Journal Officiel des Loisirs Sains et Régulations de Pointe-Noire</title>
    <link>https://ddl-pointenoire.cg/rss</link>
    <description>Flux d'actualités officielles, agréments délivrés...</description>
    <language>fr-cg</language>
    <item>
      <title>Lancement de la Campagne d'Assainissement Acoustique et Contrôle SAA 2026</title>
      <category>Régulation</category>
    </item>
    <item>
      <title>Promulgation de la Charte des Loisirs Sains et Éco-Responsables</title>
      <category>Promotion SPA</category>
    </item>
  </channel>
</rss>`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Add Diploma Modal */}
      {isAddDipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-black text-[#022448]">Attribution d'un Diplôme d'Honneur</h3>
              <button onClick={() => setIsAddDipModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateDiploma} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Établissement récipiendaire *</label>
                <select
                  value={dipEstId}
                  onChange={e => setDipEstId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                >
                  {establishments.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.promoter_name} ({e.arrondissement})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Intitulé de la distinction *</label>
                <input
                  type="text"
                  required
                  value={dipLabel}
                  onChange={e => setDipLabel(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motifs d'excellence récompensés *</label>
                <textarea
                  rows={3}
                  required
                  value={dipReasons}
                  onChange={e => setDipReasons(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddDipModal(false)}
                  className="px-3.5 py-2 border rounded font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded shadow"
                >
                  Délivrer le Diplôme & Imprimer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      <PrintModal
        isOpen={printDoc.isOpen}
        onClose={() => setPrintDoc(prev => ({ ...prev, isOpen: false }))}
        documentType="DIPLOME_HONNEUR_A4"
        title={printDoc.title}
        data={printDoc.data}
      />
    </div>
  );
};
