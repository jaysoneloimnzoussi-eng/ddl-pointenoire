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
  Sparkles,
  Zap,
  Radio,
  Wifi,
  WifiOff,
  Building2,
  Smartphone
} from 'lucide-react';
import { AgentTourneeEvent, SmsNotificationGatewayItem } from '../../../types';
import { formatDateFR } from '../../../utils/dateUtils';
import { storageService } from '../../../services/storageService';

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
  const [activeTab, setActiveTab] = useState<'RELANCES_IMMEDIATES' | 'PASSERELLE_LOGS'>('RELANCES_IMMEDIATES');
  const [filterType, setFilterType] = useState<'48H' | 'ALL' | 'CONVOCATION'>('48H');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [gatewayLogs, setGatewayLogs] = useState<SmsNotificationGatewayItem[]>(() => storageService.getSmsNotifications());
  const [isDispatchingBatch, setIsDispatchingBatch] = useState<boolean>(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

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
      text = `🏛️ RÉPUBLIQUE DU CONGO\nDIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE (DDL-PN)\n\nMadame / Monsieur ${evt.promoterName} (${evt.establishmentName}),\n\nRappel officiel de votre convocation contradictoire fixée au ${formatDateFR(evt.date)} à ${evt.timeStart} au Bureau du Service Assistance et Autorisation (SAA) (Avenue de la Paix, Pointe-Noire).\nMotif : Régularisation administrative et instruction du dossier d'agrément.\n\nAgent notificateur : ${evt.agentName} (${evt.agentBadge}).\nTél : ${evt.phone}.`;
    } else {
      text = `🏛️ RÉPUBLIQUE DU CONGO\nDIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE (DDL-PN)\n\nMadame / Monsieur ${evt.promoterName} (${evt.establishmentName}),\n\nRappel officiel : Conformément à l'accord convenu avec le Service SAA, votre rendez-vous pour le versement du solde / acompte de redevance (${evt.amountDue ? evt.amountDue.toLocaleString('fr-FR') + ' FCFA' : 'solde convenu'}) est programmé le ${formatDateFR(evt.date)} à ${evt.timeStart}.\nPossibilité de paiement instantané par MTN MoMo (*105#) ou Airtel Money (*128#).\n\nAgent SAA : ${evt.agentName} (${evt.agentBadge}).`;
    }

    return { text, cleanPhone };
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Launch Automated Batch SMS/WhatsApp Gateway
  const handleTriggerBatch = (type: SmsNotificationGatewayItem['notification_type']) => {
    setIsDispatchingBatch(true);
    setTimeout(() => {
      const res = storageService.sendBatchReminders(type);
      setGatewayLogs(storageService.getSmsNotifications());
      setIsDispatchingBatch(false);
      setBatchSuccessMessage(`Campagne automatique exécutée : ${res.count} messages envoyés via la passerelle d'État.`);
      setTimeout(() => setBatchSuccessMessage(null), 4000);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 text-xs">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#022448] via-[#033468] to-[#006d2f] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight font-republic">
                  Passerelle Téléphonique Automatisée (SMS & WhatsApp Officiel d'État)
                </h3>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase font-mono-ref">
                  PTA 2026 • AXE 5
                </span>
              </div>
              <p className="text-[11px] text-slate-200">
                Rappels automatisés à J-5 et J-1, convocations sous 72h et alertes soldes (Format national +242)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shadow Zone & Offline Connectivity Banner */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800 p-2.5 px-4 flex items-center justify-between text-[11px] text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>
              <strong>Mode Connectivité Terrain Renforcé :</strong> En zone d'ombre (Tchiamba-Nzassi, Ngoyo périphérique, Mongo-Mpoukou), les notifications et inspections sont mises en file d'attente géolocalisée et envoyées dès reconnexion au QG.
            </span>
          </div>
          <span className="bg-blue-200 dark:bg-blue-900 font-bold px-2 py-0.5 rounded text-[10px] font-mono-ref shrink-0">
            SYNC PWA ACTIVE
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 pt-2 gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('RELANCES_IMMEDIATES')}
            className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'RELANCES_IMMEDIATES'
                ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1. Relances Immédiates WhatsApp & SMS</span>
            <span className="bg-amber-100 text-amber-950 px-1.5 py-0.2 rounded font-mono-ref font-bold text-[9px]">
              {reminderList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PASSERELLE_LOGS')}
            className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'PASSERELLE_LOGS'
                ? 'border-[#006d2f] text-[#006d2f] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Passerelle Automatique & Logs d'Envoi</span>
            <span className="bg-emerald-100 text-emerald-950 px-1.5 py-0.2 rounded font-mono-ref font-bold text-[9px]">
              {gatewayLogs.length}
            </span>
          </button>
        </div>

        {/* ==============================================================
            TAB 1: RELANCES IMMÉDIATES
           ============================================================== */}
        {activeTab === 'RELANCES_IMMEDIATES' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => setFilterType('48H')}
                  className={`px-3 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                    filterType === '48H' ? 'bg-[#006d2f] text-white shadow-2xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Échéances à 48h / 72h ({events.filter(e => e.status !== 'EFFECTUE').length})
                </button>
                <button
                  onClick={() => setFilterType('CONVOCATION')}
                  className={`px-3 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                    filterType === 'CONVOCATION' ? 'bg-purple-700 text-white shadow-2xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Convocations Bureau
                </button>
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                    filterType === 'ALL' ? 'bg-[#022448] text-white shadow-2xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
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
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Aucune relance urgente requise.</p>
                  <p className="text-[11px]">Tous les tenanciers ont été notifiés ou sont en règle avec le Trésor.</p>
                </div>
              ) : (
                reminderList.map(evt => {
                  const { text, cleanPhone } = generateMessage(evt);
                  const isCopied = copiedId === evt.id;

                  return (
                    <div
                      key={evt.id}
                      className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 shadow-2xs space-y-2.5 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[#022448] dark:text-white">
                              {evt.establishmentName}
                            </span>
                            <span
                              className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                evt.type === 'CONVOCATION'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {evt.type === 'CONVOCATION' ? 'Convocation 72h' : 'Rappel Acompte'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                            Promoteur : <strong>{evt.promoterName}</strong> • {evt.arrondissement} ({evt.quartier})
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-mono-ref font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded block">
                            📅 {formatDateFR(evt.date)} à {evt.timeStart}
                          </span>
                          {evt.amountDue && evt.amountDue > 0 ? (
                            <span className="text-[10px] font-bold text-[#006d2f] font-mono-ref mt-1 block">
                              Reste : {evt.amountDue.toLocaleString('fr-FR')} FCFA
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Pre-formatted message box */}
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono-ref text-[10.5px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
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
                          <span>Envoyer sur WhatsApp (+242)</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>

                        {/* Copy SMS */}
                        <button
                          onClick={() => handleCopy(evt.id, text)}
                          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copié !' : 'Copier SMS'}</span>
                        </button>

                        {/* Direct Call */}
                        <a
                          href={`tel:${evt.phone.replace(/\s+/g, '')}`}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-lg flex items-center gap-1 transition ml-auto"
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
          </div>
        )}

        {/* ==============================================================
            TAB 2: PASSERELLE AUTOMATIQUE & LOGS
           ============================================================== */}
        {activeTab === 'PASSERELLE_LOGS' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
            {/* Automated Dispatch Actions Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-sm text-[#022448] dark:text-white uppercase font-republic">
                    Déclenchement des Campagnes Automatiques par Passerelle d'État
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Envoi instantané par API directe sans saisie manuelle de l'agent. Opérateurs : MTN Congo & Airtel Congo.
                  </p>
                </div>
              </div>

              {batchSuccessMessage && (
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 rounded-lg font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{batchSuccessMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  disabled={isDispatchingBatch}
                  onClick={() => handleTriggerBatch('RAPPEL_J_MOINS_5')}
                  className="p-2.5 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Diffuser Rappels J-5 (Échéance)</span>
                </button>

                <button
                  disabled={isDispatchingBatch}
                  onClick={() => handleTriggerBatch('ALERTE_J_MOINS_1')}
                  className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Alerte Urgence J-1 (Solde dû)</span>
                </button>

                <button
                  disabled={isDispatchingBatch}
                  onClick={() => handleTriggerBatch('CONVOCATION_72H')}
                  className="p-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Notifier Convocations 72h</span>
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Journal d'Émission des Notifications Officielles ({gatewayLogs.length})
                </h5>
                <span className="text-[10px] text-slate-500 font-mono-ref">Traçabilité 100% horodatée</span>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono-ref">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b">
                    <tr>
                      <th className="p-2.5">Date & Heure</th>
                      <th className="p-2.5">Destinataire</th>
                      <th className="p-2.5">Établissement</th>
                      <th className="p-2.5">Canal</th>
                      <th className="p-2.5">Type & Passerelle</th>
                      <th className="p-2.5">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {gatewayLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 text-[10px]">
                          {new Date(log.dispatched_at).toLocaleString('fr-FR')}
                        </td>
                        <td className="p-2.5 font-sans font-bold text-slate-900 dark:text-white">
                          {log.recipient_name}
                          <span className="block font-mono-ref text-[10px] text-slate-400 font-normal">{log.recipient_phone}</span>
                        </td>
                        <td className="p-2.5 font-sans">
                          {log.establishment_name}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            log.channel === 'WHATSAPP_GOUV' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.channel === 'WHATSAPP_GOUV' ? 'WhatsApp' : 'SMS'}
                          </span>
                        </td>
                        <td className="p-2.5 text-[10px] text-slate-500">
                          <strong className="block text-slate-700 dark:text-slate-300">{log.notification_type.replace(/_/g, ' ')}</strong>
                          <span>{log.operator_gateway}</span>
                        </td>
                        <td className="p-2.5">
                          <span className="text-emerald-700 font-bold text-[10px]">✓ DISTRIBUÉ</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Messages délivrés sous le timbre officiel de la Direction Départementale des Loisirs de Pointe-Noire (MCAPNIT).
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
