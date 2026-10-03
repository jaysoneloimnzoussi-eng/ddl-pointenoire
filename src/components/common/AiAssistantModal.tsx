import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  FileText,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Scale,
  Building2,
  Coins,
  Shield,
  MessageSquare
} from 'lucide-react';
import { AiReportService } from '../../services/aiReportService';
import { storageService } from '../../services/storageService';
import { REPUBLIQUE_CONGO } from '../../constants/referential';
import { formatDateFR } from '../../utils/dateUtils';
import { useSession } from '../../context/SessionContext';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText?: (text: string) => void;
  initialPrompt?: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onInsertText,
  initialPrompt
}) => {
  const { currentUser, triggerNotification } = useSession();
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Bonjour ${currentUser.name} ! Je suis l'Assistant IA Administratif & Juridique de la Direction Départementale des Loisirs de Pointe-Noire (DDL-PN).

Je peux vous aider à :
• Rédiger des **rapports trimestriels d'activités (T1, T2, T3, T4)** longs, exhaustifs et détaillés prêts pour signature par Monsieur le Directeur Départemental **Jean Richard NTSEKE NGOUAKA**.
• Concevoir ou ajuster le **Plan de Travail Annuel (PTA 2026 / 2027)** avec objectifs, budgets et calendrier.
• Rédiger des **Mises en demeure (72h)**, **Convocations contradictoires**, ou **Notes de service** avec visas juridiques conformes.
• Calculer et expliciter la **répartition financière Trésor (70%) / Régie DDL (30%)**.

Que souhaitez-vous rédiger ou analyser aujourd'hui ?`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isGenerating) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    let aiResponseText = '';
    const lower = textToSend.toLowerCase();

    // Check if custom text can be handled directly by server-side Gemini
    let usedServerAI = false;
    if (!lower.includes('rapport') && !lower.includes('trimestre') && !lower.includes('mise en demeure')) {
      try {
        const response = await fetch('/api/ai/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: textToSend })
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.text) {
            aiResponseText = data.text;
            usedServerAI = true;
          }
        }
      } catch {
        // Fall back gracefully to local generation engine
      }
    }

    if (!usedServerAI) {
      if (lower.includes('rapport') || lower.includes('trimestre') || lower.includes('t3') || lower.includes('t2')) {
        const isT2 = lower.includes('t2') || lower.includes('deuxième');
        const rep = isT2 ? AiReportService.getT2ExactReport('2026') : AiReportService.getT3ExactReport('2026');
        const trimName = isT2 ? 'DEUXIÈME TRIMESTRE' : 'TROISIÈME TRIMESTRE';
        aiResponseText = `### 📄 RÉPUBLIQUE DU CONGO — DDL-PN
**RAPPORT D'ACTIVITÉS DU ${trimName} ${rep.year}**
*${rep.sousTitreRapport} • ${rep.periodeMois}*
*N° document : ${rep.referenceNumber}*
*Signataire : ${rep.conclusion.signataire}, ${rep.conclusion.titreSignataire}*

---

#### 1. INTRODUCTION
${rep.introduction.join('\n\n')}

---

#### 2. SYNTHÈSE DU BILAN TRIMESTRIEL — TABLEAU DE BORD PTA ${rep.year}
${rep.tableauPta.rows.map(r => `• **${r.indicateur}** | Cible: ${r.cible} | Résultat: ${r.resultat} | [${r.statutLabel || r.statut}]`).join('\n')}

*${rep.tableauPta.noteLecture}*

---

#### 3. ACTIVITÉS PROGRAMMÉES RÉALISÉES
${rep.activitesRealisees.intro}

**a. Service Administratif, Financier et du Matériel (SAFM) :**
${rep.activitesRealisees.safm.rows.map(r => `• N°${r.n} ${r.activite} : ${r.contenu} (Indicateur: ${r.indicateur} • Exécution: ${r.execution} • Obs: ${r.observation})`).join('\n')}

**b. Service de l'Autorisation :**
${rep.activitesRealisees.autorisation.rows.map(r => `• N°${r.n} ${r.activite} : ${r.contenu} (Indicateur: ${r.indicateur} • Exécution: ${r.execution} • Obs: ${r.observation})`).join('\n')}

**c. Service des Statistiques, de l'Information et de la Documentation (SSID) :**
${rep.activitesRealisees.ssid.rows.map(r => `• N°${r.n} ${r.activite} : ${r.contenu} (Indicateur: ${r.indicateur} • Exécution: ${r.execution} • Obs: ${r.observation})`).join('\n')}

**d. Service de la Promotion et Animation :**
${rep.activitesRealisees.spa.rows.map(r => `• N°${r.n} ${r.activite} : ${r.contenu} (Indicateur: ${r.indicateur} • Exécution: ${r.execution} • Obs: ${r.observation})`).join('\n')}

---

#### 4. EXPLOITATION DES RÉSULTATS DE L'ENQUÊTE STATISTIQUE — APPORTS DU ${rep.trimestre}
${rep.enqueteStatistique.intro}

*4.1. Rappel des constats structurants confirmés par la version V2 :*
${rep.enqueteStatistique.constatsV2.map(c => `• **${c.indicateur}** : ${c.valeur} (${c.lecture})`).join('\n')}

*${rep.enqueteStatistique.ficheTechnique.titre} :*
${rep.enqueteStatistique.ficheTechnique.contenu.join('\n\n')}

---

#### 5. ACTIVITÉS PROGRAMMÉES NON RÉALISÉES
${rep.activitesNonRealisees.intro}

${rep.activitesNonRealisees.rows.map(r => `• N°${r.n} **${r.activite}** : ${r.contenu} | Exécution: ${r.execution} | Motif/Obs: ${r.observation}`).join('\n')}

---

#### 6. TRAVAUX EN COURS ET PERSPECTIVES POUR LE TRIMESTRE SUIVANT
${rep.perspectives.items.map(p => `• **${p.code} ${p.titre}** : ${p.texte}`).join('\n')}

---

#### 7. ACTIVITÉS PONCTUELLES — PARTICIPATIONS INSTITUTIONNELLES
${rep.participations.rows.map(p => `• **${p.date}** : ${p.activite} (Rôle: ${p.role} • Cadre: ${p.patronage})`).join('\n')}

${rep.participations.postTable.join('\n\n')}

---

#### 8. DIFFICULTÉS RENCONTRÉES
${rep.difficultes.items.map(d => `${d.numero}. **${d.titre}** : ${d.texte}`).join('\n\n')}

---

#### 9. SUGGESTIONS POUR LE TRIMESTRE SUIVANT
${rep.suggestions.items.map(s => `${s.romain} **${s.titre}** : ${s.texte}`).join('\n\n')}

---

#### 10. CONCLUSION
${rep.conclusion.paragraphs.join('\n\n')}

${rep.conclusion.faitA} ${rep.conclusion.date}
**${rep.conclusion.signataire}**
*${rep.conclusion.titreSignataire}*`;
      } else if (lower.includes('mise en demeure') || lower.includes('sanction') || lower.includes('72h')) {
        aiResponseText = `### ⚖️ PROJET D'ACTE JURIDIQUE : MISE EN DEMEURE SOUS HUTAINE (72H)
**RÉPUBLIQUE DU CONGO** • *Unité - Travail - Progrès*
**Ministère de la Culture, des Arts, du Tourisme et des Loisirs**
**Direction Départementale des Loisirs de Pointe-Noire (DDL-PN)**
*Réf : MD-DDL-PN/SAA-2026/042*

**Destinataire :** Madame / Monsieur l'Exploitant de l'établissement récréatif
**Objet :** Mise en demeure formelle de régularisation administrative et cessation de pollution sonore.

**Monsieur l'Exploitant,**

Vu la Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo ;
Vu le Décret N° 2010-804 du 31 décembre 2010 relatif à la lutte contre les pollutions sonores et nuisances nocturnes ;
Vu le rapport de constat contradictoire dressé par les agents du Service Assistance et Autorisation (SAA) en date du 28 septembre 2026 ;

Il a été dûment constaté que votre établissement fonctionne en contravention flagrante des dispositions réglementaires en vigueur (défaut de paiement des redevances d'agrément et d'autorisation officielle d'ouverture).

En conséquence, il vous est imparti un **délai impératif et non prorogeable de soixante-douze (72) heures** à compter de la notification de la présente pour :
1. Vous présenter au siège de la DDL-PN munis de vos pièces d'identité et justificatifs d'exploitation ;
2. Procéder au règlement des droits d'instruction ou à la signature d'un protocole d'acompte ;
3. Vous conformer aux normes réglementaires en vigueur.

**Faute par vous de vous conformer aux prescriptions ci-dessus dans le délai prescrit, il sera procédé sans autre avis à la fermeture administrative immédiate de vos locaux avec apposition des scellés de la République et poursuites judiciaires.**

Fait à Pointe-Noire, le ${formatDateFR(new Date())}
*Pour le Service SAA : Jacques MATOKO*
*Le Directeur Départemental des Loisirs : Jean Richard NTSEKE NGOUAKA*`;
      } else if (lower.includes('pta') || lower.includes('plan de travail')) {
        aiResponseText = `### 🎯 CADRE STRATÉGIQUE DU PLAN DE TRAVAIL ANNUEL (PTA)
**Direction Départementale des Loisirs de Pointe-Noire**

Le PTA repose sur **4 Axes Stratégiques Majeurs** budgétisés à hauteur de **3 696 000 FCFA** :

1. **Axe 1 : Régulation, Contrôle Qualité & Recensement (SAA)**
   - Cible : 150 établissements inspectés in situ, 100% de dossiers audités.
   - Budget alloué : 1 450 000 FCFA.
   - Responsable : Jacques MATOKO.

2. **Axe 2 : Partenariats Stratégiques & Mobilisation de Ressources**
   - Cible : Conventions formalisées avec Globaline, Institut Français (IFPN) et Wing Wah.
   - Budget alloué : 650 000 FCFA.

3. **Axe 3 : Promotion des Loisirs Sains, Scolaires & Inclusion Sociale (SPA)**
   - Cible : 2 tournois scolaires de scrabble/échecs, 1 journée d'animation pour orphelins, Nuit des Loisirs Sains.
   - Budget alloué : 980 000 FCFA.

4. **Axe 4 : Système d'Information Géographique & Statistiques Décisionnelles (SSID)**
   - Cible : Base de données géo-spatiale Supabase consolidée, 100% des flux ventilés (70% Trésor / 30% Régie DDL).
   - Budget alloué : 616 000 FCFA.`;
      } else {
        aiResponseText = `Voici la réponse administrative rédigée pour vous :

${AiReportService.enrichSection('Rédaction Administrative', textToSend, 'détailler et professionnaliser')}

*Cette analyse tient compte de la répartition légale 70% Trésor / 30% Régie DDL et des attributions de la Direction Départementale des Loisirs de Pointe-Noire dirigée par M. Jean Richard NTSEKE NGOUAKA.*`;
      }
    }

    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsGenerating(false);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    triggerNotification('Texte copié dans le presse-papiers !', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-300 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#022448] via-[#023b75] to-[#006d2f] text-white px-5 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight font-republic">
                  Assistant IA Rédacteur DDL-PN
                </h3>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono-ref font-bold">
                  Intelligence Administrative Congolaise
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                Rapports trimestriels longs, PTA, actes juridiques et analyses de régie pour le Directeur Jean Richard NTSEKE NGOUAKA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Suggestions rapides :
          </span>
          <button
            onClick={() => handleSendMessage('Rédige le rapport trimestriel complet et détaillé du 3ème trimestre 2026 pour le Directeur Départemental')}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-[#006d2f] border border-emerald-200 rounded-lg shrink-0 font-semibold transition shadow-2xs"
          >
            📄 Rapport T3 2026 Exhaustif
          </button>
          <button
            onClick={() => handleSendMessage('Rédige une mise en demeure sous 72 heures avec visas juridiques et avertissement de fermeture')}
            className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 rounded-lg shrink-0 font-semibold transition shadow-2xs"
          >
            ⚖️ Mise en Demeure (72h)
          </button>
          <button
            onClick={() => handleSendMessage('Génère le résumé des 4 axes stratégiques du Plan de Travail Annuel PTA 2026')}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 rounded-lg shrink-0 font-semibold transition shadow-2xs"
          >
            🎯 Synthèse PTA 2026
          </button>
          <button
            onClick={() => handleSendMessage('Explique la clé de répartition financière 70% Trésor Public et 30% Régie DDL')}
            className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded-lg shrink-0 font-semibold transition shadow-2xs"
          >
            💰 Ventilation 70/30
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 shadow-xs text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#022448] text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-100 text-[10px] text-slate-400">
                  <span className="font-bold flex items-center gap-1.5">
                    {msg.sender === 'user' ? (
                      <span className="text-amber-300">Vous ({currentUser.name})</span>
                    ) : (
                      <span className="text-[#006d2f] font-black flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" />
                        Assistant IA DDL-PN
                      </span>
                    )}
                  </span>
                  <span>{msg.time}</span>
                </div>

                <div className="prose prose-xs max-w-none whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {msg.sender === 'ai' && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-[11px]">
                    <button
                      onClick={() => handleCopyText(msg.text, idx)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md font-semibold text-slate-700 flex items-center gap-1 transition"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === idx ? 'Copié !' : 'Copier le texte'}</span>
                    </button>
                    {onInsertText && (
                      <button
                        onClick={() => {
                          onInsertText(msg.text);
                          onClose();
                          triggerNotification('Texte inséré dans le formulaire !', 'success');
                        }}
                        className="px-2.5 py-1 bg-[#006d2f] hover:bg-[#005a26] text-white rounded-md font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Insérer dans le document</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 animate-pulse w-fit">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Rédaction et structuration administrative en cours par l'IA...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Posez une question ou demandez une rédaction (ex: Allonge le rapport T3 avec les chiffres de Lumumba...)"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            disabled={isGenerating}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006d2f] focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isGenerating}
            className="bg-[#006d2f] hover:bg-[#005a26] disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
};
