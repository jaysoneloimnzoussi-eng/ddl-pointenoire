import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  Send,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Filter,
  X,
  Sparkles
} from 'lucide-react';
import { AgentTourneeEvent } from '../../../types';

interface AutomatedRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: AgentTourneeEvent[];
  currentDateStr: string;
}

export const AutomatedRemindersModal: React.FC<AutomatedRemindersModalProps> = ({
  isOpen,
  onClose,
  events,
  currentDateStr
}) => {
  const [filterType, setFilterType] = useState<'48H' | 'ALL' | 'CONVOCATION'>('48H');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter relevant events for reminder
  const reminderList = useMemo(() => {
    const today = new Date(currentDateStr);
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + 3); // 72h window

    return events.filter(evt => {
      if (evt.status === 'EFFECTUE') return false;

      const evtDate = new Date(evt.date);
      const isUpcoming = evtDate >= today;

      if (filterType === '48H') {
        return isUpcoming && evtDate <= limitDate;
      }
      if (filterType === 'CONVOCATION') {
        return evt.type === 'CONVOCATION' && isUpcoming;
      }
      return isUpcoming;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [events, currentDateStr, filterType]);

  // Generate standardized official message template
  const generateMessage = (evt: AgentTourneeEvent) => {
    const isConvocation = evt.type === 'CONVOCATION';
    const cleanPhone = evt.phone.replace(/[^0-9]/g, '');

    let text = '';
    if (isConvocation) {
      text = `🏛️ RÉPUBLIQUE DU CONGO\nDIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE (DDL-PN)\n\nMadame / Monsieur ${evt.promoterName} (${evt.establishmentName}),\n\nRappel officiel de votre convocation contradictoire fixée au ${evt.date} à ${evt.timeStart} au Bureau du Service Assistance et Autorisation (SAA) (Centre-Ville, Pointe-Noire).\nMotif : Régularisation administrative et dépôt du dossier d'agrément.\n\nAgent notificateur : ${evt.agentName} (${evt.agentBadge}).\nTél : ${evt.phone}.`;
    } else {
      text = `🏛️ RÉPUBLIQUE DU CONGO\nDIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE (DDL-PN)\n\nMadame / Monsieur ${evt.promoterName} (${evt.establishmentName}),\n\nRappel courtois : Conformément à l'accord convenu avec le Service SAA, votre rendez-vous pour le versement du solde / acompte de redevance (${evt.amountDue ? evt.amountDue.toLocaleString('fr-FR') + ' FCFA' : 'solde fixé'}) est programmé le ${evt.date} à ${evt.timeStart}.\n\nMerci de préparer votre dernière quittance.\nAgent SAA : ${evt.agentName} (${evt.agentBadge}).`;
    }

    return { text, cleanPhone };
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 text-xs">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#022448] via-[#033468] to-[#006d2f] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Centre de Relances WhatsApp & SMS (48h)
                </h3>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  AUTOMATIQUE
                </span>
              </div>
              <p className="text-[11px] text-slate-200">
                Génération de rappels officiels conformes aux tenanciers de débits de boissons et loisirs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setFilterType('48H')}
              className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                filterType === '48H' ? 'bg-[#006d2f] text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Échéances à 48h / 72h ({events.filter(e => e.status !== 'EFFECTUE').length})
            </button>
            <button
              onClick={() => setFilterType('CONVOCATION')}
              className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                filterType === 'CONVOCATION' ? 'bg-purple-700 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Convocations Bureau
            </button>
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                filterType === 'ALL' ? 'bg-[#022448] text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Tous les Rendez-vous
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono-ref">
            {reminderList.length} relance(s) prête(s)
          </span>
        </div>

        {/* List of Reminders */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {reminderList.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <p className="font-semibold text-slate-700">Aucune relance urgente requise.</p>
              <p className="text-[11px]">Tous les tenanciers ont été relancés ou sont en règle.</p>
            </div>
          ) : (
            reminderList.map(evt => {
              const { text, cleanPhone } = generateMessage(evt);
              const isCopied = copiedId === evt.id;

              return (
                <div
                  key={evt.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs space-y-2.5 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#022448]">
                          {evt.establishmentName}
                        </span>
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            evt.type === 'CONVOCATION'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {evt.type === 'CONVOCATION' ? 'Convocation' : 'Rappel Acompte'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Promoteur : <strong>{evt.promoterName}</strong> • {evt.arrondissement} ({evt.quartier})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono-ref font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded block">
                        📅 {evt.date} à {evt.timeStart}
                      </span>
                      {evt.amountDue && evt.amountDue > 0 ? (
                        <span className="text-[10px] font-bold text-[#006d2f] font-mono-ref mt-1 block">
                          Reste : {evt.amountDue.toLocaleString('fr-FR')} FCFA
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Pre-formatted message box */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono-ref text-[10.5px] text-slate-700 whitespace-pre-line leading-relaxed">
                    {text}
                  </div>

                  {/* Direct Actions: WhatsApp Web, Copy SMS, Phone Call */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Send WhatsApp */}
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Envoyer sur WhatsApp</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </a>

                    {/* Copy SMS */}
                    <button
                      onClick={() => handleCopy(evt.id, text)}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition ${
                        isCopied
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copié dans le presse-papier !' : 'Copier SMS'}</span>
                    </button>

                    {/* Direct Call */}
                    <a
                      href={`tel:${evt.phone.replace(/\s+/g, '')}`}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg flex items-center gap-1 transition ml-auto"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>Appeler ({evt.phone})</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Messages strictement rédigés sous visa de la Loi N° 21-2019 du 12 juillet 2019.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
