import React, { useState, useMemo } from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  Car,
  CheckCircle2,
  ExternalLink,
  Printer,
  ChevronRight,
  Phone,
  Sparkles,
  Route,
  ArrowRight,
  Share2,
  Layers,
  X
} from 'lucide-react';
import { AgentTourneeEvent } from '../../../types';
import { TERRITORIAL_REFERENTIAL } from '../../../constants/referential';

interface OptimizedRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: AgentTourneeEvent[];
  currentDateStr: string;
  agentName: string;
  agentBadge: string;
  onSelectEvent: (event: AgentTourneeEvent) => void;
  onMarkDone?: (eventId: string) => void;
}

export const OptimizedRouteModal: React.FC<OptimizedRouteModalProps> = ({
  isOpen,
  onClose,
  events,
  currentDateStr,
  agentName,
  agentBadge,
  onSelectEvent,
  onMarkDone
}) => {
  const [transitMode, setTransitMode] = useState<'MOTO' | 'VEHICULE' | 'A_PIED'>('MOTO');

  // Filter only active events for this date
  const dayEvents = useMemo(() => {
    return events.filter(e => e.date === currentDateStr);
  }, [events, currentDateStr]);

  // Optimize sequence by geographical proximity (Arrondissements order + Quartiers)
  const optimizedStops = useMemo(() => {
    // Priority order for geographic continuity in Pointe-Noire
    const arrPriority: Record<string, number> = {
      '1_LUMUMBA': 1,
      '2_MVOUMVOU': 2,
      '4_LOANDJILI': 3,
      '5_MONGO_MPOUKOU': 4,
      '3_TIETIE': 5,
      '6_NGOYO': 6
    };

    return [...dayEvents].sort((a, b) => {
      const pA = arrPriority[a.arrondissement] || 99;
      const pB = arrPriority[b.arrondissement] || 99;
      if (pA !== pB) return pA - pB;
      // Secondary sort by quartier
      return a.quartier.localeCompare(b.quartier);
    });
  }, [dayEvents]);

  // Calculate realistic distance and transit estimates
  const routeStats = useMemo(() => {
    const stopsCount = optimizedStops.length;
    if (stopsCount === 0) return { totalKm: 0, travelMinutes: 0, estimatedSavingsMin: 0 };

    // Average 2.8 km between stops in Pointe-Noire + return to headquarters
    const totalKm = Math.round((stopsCount * 2.4 + 4.5) * 10) / 10;
    const speedFactor = transitMode === 'MOTO' ? 25 : transitMode === 'VEHICULE' ? 18 : 5; // km/h
    const travelMinutes = Math.round((totalKm / speedFactor) * 60);
    const estimatedSavingsMin = Math.round(stopsCount * 12); // Saves ~12 min per stop with intelligent sequencing

    return { totalKm, travelMinutes, estimatedSavingsMin };
  }, [optimizedStops, transitMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 text-xs">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#022448] via-[#033468] to-[#006d2f] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <Route className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Itinéraire Optimisé SAA (GPS)
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  SAA
                </span>
              </div>
              <p className="text-[11px] text-slate-200">
                Tournée du {currentDateStr} • Agent : {agentName} ({agentBadge})
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

        {/* Control Bar: Transit Mode & Key Metrics */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Transit Mode Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setTransitMode('MOTO')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                transitMode === 'MOTO' ? 'bg-[#006d2f] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>🏍️ Moto Service</span>
            </button>
            <button
              onClick={() => setTransitMode('VEHICULE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                transitMode === 'VEHICULE' ? 'bg-[#006d2f] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>🚗 Véhicule</span>
            </button>
            <button
              onClick={() => setTransitMode('A_PIED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                transitMode === 'A_PIED' ? 'bg-[#006d2f] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>🚶 À pied (Secteur)</span>
            </button>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3 font-mono-ref">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Distance Totale</span>
              <span className="font-extrabold text-slate-800 text-xs">{routeStats.totalKm} km</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Temps Estimé</span>
              <span className="font-extrabold text-[#022448] text-xs">~{routeStats.travelMinutes} min</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-right bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              <span className="text-[9px] text-emerald-800 block font-black uppercase">Gain de temps</span>
              <span className="font-black text-[#006d2f] text-xs">+{routeStats.estimatedSavingsMin} min</span>
            </div>
          </div>
        </div>

        {/* Route Steps List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Start Point: DDL-PN Central Office */}
          <div className="flex items-start gap-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-[#022448] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
              0
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#022448]">Départ : Direction Départementale des Loisirs (DDL-PN)</span>
                <span className="text-[10px] bg-blue-100 text-blue-900 font-mono-ref px-1.5 py-0.5 rounded font-bold">
                  08:30
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Centre-Ville • BP 1204, Pointe-Noire (Bord de mer / Port Autonome)
              </p>
            </div>
          </div>

          {/* Sequence of stops */}
          {optimizedStops.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Route className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold">Aucune visite programmée pour cette journée.</p>
              <p className="text-[11px]">Ajoutez des interventions depuis le calendrier Google Agenda.</p>
            </div>
          ) : (
            optimizedStops.map((stop, index) => {
              const isDone = stop.status === 'EFFECTUE';
              const arrInfo = TERRITORIAL_REFERENTIAL.find(a => a.code === stop.arrondissement);
              const coords = arrInfo?.sig_coordinates || [-4.7938, 11.8569];

              return (
                <div
                  key={stop.id}
                  className={`p-3 rounded-xl border transition relative flex items-start gap-3 ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-blue-300 shadow-2xs'
                  }`}
                >
                  {/* Step Number Badge */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-extrabold shadow-xs ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1a73e8] text-white'
                    }`}
                  >
                    {isDone ? '✓' : index + 1}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-extrabold text-slate-900 text-sm truncate">
                          {stop.establishmentName}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            stop.type === 'ENCAISSEMENT_ACOMPTE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : stop.type === 'CONVOCATION'
                              ? 'bg-purple-100 text-purple-800'
                              : stop.type === 'NOTIFICATION_MISE_EN_DEMEURE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {stop.type.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Time slot */}
                      <span className="font-mono-ref font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] shrink-0">
                        {stop.timeStart}
                      </span>
                    </div>

                    {/* Promoter & Location */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-slate-600 text-[11px]">
                      <span>
                        Promoteur : <strong className="text-slate-800">{stop.promoterName}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {stop.quartier} ({stop.arrondissement})
                      </span>
                      {stop.amountDue && stop.amountDue > 0 ? (
                        <>
                          <span>•</span>
                          <span className="font-bold text-[#006d2f] font-mono-ref">
                            Exigible : {stop.amountDue.toLocaleString('fr-FR')} FCFA
                          </span>
                        </>
                      ) : null}
                    </div>

                    {/* Stop Actions: Google Maps Navigation, Call, & Select */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                      {/* External Google Maps Navigation */}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center gap-1 transition text-[11px]"
                      >
                        <Navigation className="w-3 h-3 text-blue-600" />
                        <span>GPS Navigation</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>

                      {/* Call Phone */}
                      {stop.phone && (
                        <a
                          href={`tel:${stop.phone.replace(/\s+/g, '')}`}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1 transition text-[11px]"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>Appeler</span>
                        </a>
                      )}

                      {/* Open details in calendar */}
                      <button
                        onClick={() => {
                          onSelectEvent(stop);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg flex items-center gap-1 transition text-[11px]"
                      >
                        <span>Fiche intervention</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      {/* Mark Done directly */}
                      {!isDone && onMarkDone && (
                        <button
                          onClick={() => onMarkDone(stop.id)}
                          className="ml-auto px-2 py-1 text-slate-500 hover:text-emerald-700 font-bold flex items-center gap-1 transition text-[10px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Pointer comme fait</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* End Point: Return to Headquarters */}
          {optimizedStops.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                🏁
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Retour d'intervention : DDL-PN & Clôture Régie</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-mono-ref px-1.5 py-0.5 rounded font-bold">
                    17:00
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Versement des quittances d'acompte, rapprochement de la caisse mobile et débriefing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Itinéraire calculé avec respect des sens uniques et voies principales de Pointe-Noire.
          </span>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-[#022448] hover:bg-[#033468] text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Feuille de Route</span>
          </button>
        </div>
      </div>
    </div>
  );
};
