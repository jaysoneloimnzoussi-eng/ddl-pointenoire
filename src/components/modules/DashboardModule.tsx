import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Coins,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  FileText,
  MapPin,
  Calendar,
  Layers,
  Printer
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { Establishment, OfficialLegalAct } from '../../types';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';

export const DashboardModule: React.FC = () => {
  const { setActiveModule, triggerNotification } = useSession();
  const [stats, setStats] = useState(storageService.getSystemStats());
  const [acts, setActs] = useState<OfficialLegalAct[]>(storageService.getActs());
  const [establishments, setEstablishments] = useState<Establishment[]>(storageService.getEstablishments());

  // Print modal state
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: PrintDocumentType;
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'ACTE_JURIDIQUE_A4',
    title: '',
    data: null
  });

  useEffect(() => {
    setStats(storageService.getSystemStats());
    setActs(storageService.getActs());
    setEstablishments(storageService.getEstablishments());
  }, []);

  // Urgent relances: mise en demeure or convocation
  const urgentActs = acts.filter(a => a.type === 'MISE_EN_DEMEURE' || a.type === 'CONVOCATION');
  const recentPayments = storageService.getPayments().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#022448] via-[#023b75] to-[#006d2f] text-white p-5 sm:p-6 rounded-xl shadow-md border border-[#033468] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded font-mono-ref">
              POSTE DE COMMANDEMENT STRATÉGIQUE
            </span>
            <span className="text-xs text-emerald-200 font-medium">PTA 2026 • Exercice en cours</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-republic tracking-tight">
            Système Intégré de Régulation des Loisirs de Pointe-Noire
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
            Supervision opérationnelle de la brigade SAA, suivi des 6 arrondissements territoriaux et encaissement direct des redevances d'agrément.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => setActiveModule('MOD-02')}
            className="flex-1 md:flex-initial bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition"
          >
            <Building2 className="w-4 h-4" />
            <span>Nouveau Recensement</span>
          </button>
          <button
            onClick={() => setActiveModule('MOD-07')}
            className="flex-1 md:flex-initial bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-white/20 transition"
          >
            <MapPin className="w-4 h-4 text-emerald-300" />
            <span>Carte SIG</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Recensé */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#006d2f] transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Établissements Recensés</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-[#006d2f] group-hover:scale-110 transition">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono-ref">{stats.totalEst}</span>
            <span className="text-xs text-slate-500 font-medium">/ 150 (PTA 2026)</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#006d2f] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.totalEst / 150) * 100)}%` }}
              />
            </div>
            <span className="font-bold text-[#006d2f] text-[11px] font-mono-ref">
              {((stats.totalEst / 150) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Formel : <strong>{stats.formalCount}</strong></span>
            <span>Informel : <strong>{stats.informalCount}</strong></span>
          </div>
        </div>

        {/* KPI 2: Montant Recouvré */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-500 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recouvrement Encaissé</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700 group-hover:scale-110 transition">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-[#022448] font-mono-ref">
              {(stats.totalPaid).toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-amber-800 font-bold">FCFA</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-2">
            <span className="text-emerald-700 font-semibold">Trésor (70%) : {stats.shareTresor.toLocaleString('fr-FR')}</span>
            <span className="text-slate-600 font-medium">Régie (30%) : {stats.shareRegie.toLocaleString('fr-FR')}</span>
          </div>
        </div>

        {/* KPI 3: Taux de performance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-500 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Taux de Performance</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700 group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-900 font-mono-ref">{stats.recoveryRate}%</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              +14.2% ce mois
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {stats.authorizedDgl} établissements autorisés définitifs DGL
          </p>
          <div className="mt-1 text-[11px] text-slate-600 flex justify-between">
            <span>En instruction : <strong>{stats.inInstruction}</strong></span>
            <span>Sanctions : <strong className="text-red-600">{stats.underSanction}</strong></span>
          </div>
        </div>

        {/* KPI 4: Dossiers Transmis Brazzaville */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#022448] transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Dossiers DGL Brazzaville</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-[#022448] group-hover:scale-110 transition">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#022448] font-mono-ref">{stats.transmittedDgl}</span>
            <span className="text-xs text-slate-500">dossiers transmis</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Bordereaux d'envoi scellés et enregistrés au cabinet central
          </p>
          <div className="mt-2">
            <button
              onClick={() => setActiveModule('MOD-09')}
              className="text-xs text-[#006d2f] hover:text-[#005a26] font-bold flex items-center gap-1"
            >
              <span>Voir le circuit transmission</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Territorial Performance Grid & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recouvrement par Arrondissement */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Recouvrement & Conformité par Arrondissement</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono-ref">
                  6 Zones
                </span>
              </h3>
              <p className="text-xs text-slate-500">Répartition territoriale des 118 établissements de la ville océane</p>
            </div>
            <button
              onClick={() => setActiveModule('MOD-07')}
              className="text-xs text-[#006d2f] hover:underline font-bold flex items-center gap-1"
            >
              <span>Ouvrir SIG</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {stats.byArrondissement.map(arr => {
              return (
                <div key={arr.code} className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800">{arr.arrondissement}</span>
                      <span className="bg-white border border-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono-ref text-[10px]">
                        {arr.count} locaux
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono-ref">
                      <span className="text-slate-500">
                        {arr.paid.toLocaleString('fr-FR')} / {arr.due.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="font-bold text-[#006d2f] bg-emerald-50 px-1.5 py-0.5 rounded">
                        {arr.percentRecouvrement}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#006d2f] to-amber-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, arr.percentRecouvrement)}%` }}
                    />
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>En règle / Soldé : <strong>{arr.enRegle}</strong></span>
                    <span>Reste à percevoir : <strong className="text-amber-800 font-mono-ref">{(arr.due - arr.paid).toLocaleString('fr-FR')} FCFA</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Urgent Actions & Relances (MOD-05 link) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Mesures Conservatoires SAA</span>
              </h3>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                Délai 72h
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Mises en demeure et convocations actives nécessitant notification ou exécution de scellés.
            </p>

            <div className="space-y-3">
              {urgentActs.map(act => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-[#022448] uppercase block">
                        {act.establishment_name}
                      </span>
                      <span className="text-[10px] text-slate-500">{act.arrondissement}</span>
                    </div>
                    <span className="text-[9px] bg-amber-200 text-amber-900 font-mono-ref px-1 rounded font-bold">
                      {act.type === 'MISE_EN_DEMEURE' ? 'M.D. 72h' : 'Convocation'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 mt-1 line-clamp-2 italic">
                    « {act.motif} »
                  </p>

                  <div className="mt-2.5 flex items-center justify-between border-t border-amber-200/60 pt-2 text-[10px]">
                    <span className="text-slate-500">Échéance : <strong>{act.delai_huitaine_date || '72h'}</strong></span>
                    <button
                      onClick={() => {
                        setPrintDoc({
                          isOpen: true,
                          type: 'ACTE_JURIDIQUE_A4',
                          title: `Acte Officiel - ${act.reference_number}`,
                          data: act
                        });
                      }}
                      className="text-[#006d2f] hover:text-[#005a26] font-bold flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Imprimer Acte</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveModule('MOD-05')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Accéder à l'Atelier des Actes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Derniers Encaissements Régie */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Derniers Encaissements & Quittances Délivrées
            </h3>
            <p className="text-xs text-slate-500">Transactions enregistrées sur le terrain par les agents SAA Loubaki, Tchicaya et Makosso</p>
          </div>
          <button
            onClick={() => setActiveModule('MOD-10')}
            className="text-xs text-[#006d2f] hover:underline font-bold flex items-center gap-1"
          >
            <span>Voir toute la régie SAF</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Quittance Réf</th>
                <th className="py-2.5 px-3">Établissement</th>
                <th className="py-2.5 px-3">Arrondissement</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Montant Encaissé</th>
                <th className="py-2.5 px-3">Agent SAA</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 font-mono-ref font-bold text-[#022448]">{p.receipt_reference}</td>
                  <td className="py-2 px-3 font-semibold">{p.establishment_name}</td>
                  <td className="py-2 px-3 text-slate-600">{p.arrondissement}</td>
                  <td className="py-2 px-3">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700 font-medium">
                      {p.payment_method}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono-ref font-bold text-emerald-800">
                    {p.amount_paid.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-2 px-3 text-slate-600">{p.collected_by}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => {
                        setPrintDoc({
                          isOpen: true,
                          type: 'TICKET_58MM',
                          title: `Ticket Quittance - ${p.receipt_reference}`,
                          data: p
                        });
                      }}
                      className="text-xs bg-[#006d2f]/10 text-[#006d2f] hover:bg-[#006d2f]/20 font-bold px-2 py-1 rounded inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Ticket 58mm</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Print Modal */}
      <PrintModal
        isOpen={printDoc.isOpen}
        onClose={() => setPrintDoc(prev => ({ ...prev, isOpen: false }))}
        documentType={printDoc.type}
        title={printDoc.title}
        data={printDoc.data}
      />
    </div>
  );
};
