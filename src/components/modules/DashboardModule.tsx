import React, { useState, useEffect, useMemo } from 'react';
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
  Printer,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  SlidersHorizontal,
  Download,
  Users,
  Clock,
  Sparkles,
  ArrowDownRight,
  Volume2,
  Landmark,
  BadgeCheck,
  Check,
  Smartphone,
  Wallet,
  ShieldCheck,
  Award,
  RefreshCw
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { Establishment, OfficialLegalAct, TerrainPaymentRecord } from '../../types';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';
import { ACTIVITY_CATEGORIES, TERRITORIAL_REFERENTIAL, APP_USERS } from '../../constants/referential';

export const DashboardModule: React.FC = () => {
  const { setActiveModule } = useSession();
  const [stats, setStats] = useState(storageService.getSystemStats());
  const [acts, setActs] = useState<OfficialLegalAct[]>(storageService.getActs());
  const [establishments, setEstablishments] = useState<Establishment[]>(storageService.getEstablishments());
  const [payments, setPayments] = useState<TerrainPaymentRecord[]>(storageService.getPayments());

  // Filter state for dynamic stats
  const [selectedArrondissement, setSelectedArrondissement] = useState<string>('ALL');
  const [selectedRegime, setSelectedRegime] = useState<string>('ALL');
  const [chartMetric, setChartMetric] = useState<'RECOUVREMENT' | 'ETABLISSEMENTS'>('RECOUVREMENT');

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

  const reloadData = () => {
    setStats(storageService.getSystemStats());
    setActs(storageService.getActs());
    setEstablishments(storageService.getEstablishments());
    setPayments(storageService.getPayments());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Filtered dataset
  const filteredEsts = useMemo(() => {
    return (establishments || []).filter(e => {
      if (!e) return false;
      if (selectedArrondissement !== 'ALL' && e.arrondissement !== selectedArrondissement) return false;
      if (selectedRegime !== 'ALL' && e.regime_type !== selectedRegime) return false;
      return true;
    });
  }, [establishments, selectedArrondissement, selectedRegime]);

  // Statistics aggregated on filtered data
  const filteredMetrics = useMemo(() => {
    const total = filteredEsts.length;
    const totalDue = filteredEsts.reduce((acc, curr) => acc + (curr.total_due || 0), 0);
    const totalPaid = filteredEsts.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);
    const totalBalance = filteredEsts.reduce((acc, curr) => acc + (curr.balance_due || 0), 0);
    const soldeCount = filteredEsts.filter(e => (e.balance_due || 0) === 0 || e.status === 'autorise_dgl').length;
    const formelCount = filteredEsts.filter(e => e.regime_type === 'FORMEL').length;
    const informelCount = total - formelCount;
    const rate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
    
    // Real 70/30 split from payments
    const tresor70 = Math.round(totalPaid * 0.7);
    const regie30 = totalPaid - tresor70;

    // Acoustic limiter metrics
    const limiterCount = filteredEsts.filter(e => e.has_acoustic_limiter).length;
    const avgDecibels = filteredEsts.filter(e => e.decibel_level && e.decibel_level > 0);
    const decibelAvg = avgDecibels.length > 0 
      ? Math.round(avgDecibels.reduce((acc, curr) => acc + (curr.decibel_level || 0), 0) / avgDecibels.length) 
      : 0;

    return {
      total,
      totalDue,
      totalPaid,
      totalBalance,
      soldeCount,
      formelCount,
      informelCount,
      rate: Number(rate.toFixed(1)),
      tresor70,
      regie30,
      limiterCount,
      decibelAvg
    };
  }, [filteredEsts]);

  // Real Arrondissement breakdown directly from database
  const arrondissementStats = useMemo(() => {
    const estList = establishments || [];
    const payList = payments || [];

    return TERRITORIAL_REFERENTIAL.map(arr => {
      const arrEsts = estList.filter(e => e && e.arrondissement === arr.code);
      const count = arrEsts.length;
      const due = arrEsts.reduce((sum, e) => sum + (e.total_due || 0), 0);
      
      // Calculate paid both from establishments and payment records
      const paidFromEsts = arrEsts.reduce((sum, e) => sum + (e.amount_paid || 0), 0);
      const paidFromPayments = payList
        .filter(p => p && p.arrondissement === arr.code)
        .reduce((sum, p) => sum + (p.amount_paid || 0), 0);
      const paid = Math.max(paidFromEsts, paidFromPayments);

      const enRegle = arrEsts.filter(e => (e.balance_due || 0) === 0 || e.status === 'autorise_dgl' || e.status === 'attestation_depot').length;
      const rate = due > 0 ? Math.round((paid / due) * 100) : 0;
      const formels = arrEsts.filter(e => e.regime_type === 'FORMEL').length;
      const informels = count - formels;

      return {
        code: arr.code,
        name: arr.name,
        count,
        due,
        paid,
        balance: due - paid,
        enRegle,
        rate,
        formels,
        informels
      };
    });
  }, [establishments, payments]);

  // Activity category breakdown (100% computed from real establishments)
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { label: string; count: number; paid: number; due: number }>();
    ACTIVITY_CATEGORIES.forEach(c => {
      map.set(c.code, { label: c.label, count: 0, paid: 0, due: 0 });
    });

    (establishments || []).forEach(e => {
      if (!e) return;
      const code = e.activity_code || 'A2.1';
      const defaultLabel = ACTIVITY_CATEGORIES.find(c => c.code === code)?.label || e.activity_type || 'Activité Loisirs';
      const entry = map.get(code) || { label: defaultLabel, count: 0, paid: 0, due: 0 };
      entry.count += 1;
      entry.paid += e.amount_paid || 0;
      entry.due += e.total_due || 0;
      map.set(code, entry);
    });

    return Array.from(map.entries())
      .map(([code, val]) => ({
        code,
        label: val.label,
        count: val.count,
        paid: val.paid,
        due: val.due,
        percent: val.due > 0 ? Math.round((val.paid / val.due) * 100) : 0
      }))
      .filter(item => item.count > 0 || ['A1.1', 'A1.2', 'A1.3', 'A2.1', 'A2.2', 'A3.1', 'A3.2', 'A4.1'].includes(item.code))
      .sort((a, b) => b.count - a.count);
  }, [establishments]);

  // Monthly Payment progression calculated directly from payments database records
  const monthlyTimeline = useMemo(() => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const map = new Map<string, { total: number; count: number; label: string }>();

    (payments || []).forEach(p => {
      if (!p || !p.record_date) return;
      const monthKey = p.record_date.slice(0, 7); // e.g. "2026-09"
      const parts = monthKey.split('-');
      const monthIndex = parts.length > 1 ? parseInt(parts[1], 10) - 1 : 0;
      const label = `${monthNames[monthIndex] || 'Mois'} ${parts[0] || '2026'}`;
      
      const current = map.get(monthKey) || { total: 0, count: 0, label };
      current.total += p.amount_paid || 0;
      current.count += 1;
      map.set(monthKey, current);
    });

    const entries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    // If few months, ensure current active months are present
    if (entries.length === 0) {
      return [
        { key: '2026-09', month: 'Sept 2026', total: filteredMetrics.totalPaid, count: payments.length, color: '#006d2f' }
      ];
    }

    return entries.map(([key, val], idx) => ({
      key,
      month: val.label,
      total: val.total,
      count: val.count,
      color: idx === entries.length - 1 ? '#006d2f' : '#0284c7'
    }));
  }, [payments, filteredMetrics.totalPaid]);

  // Payment Methods Breakdown (100% computed from real payments)
  const paymentMethodStats = useMemo(() => {
    const methodsMap: Record<string, { count: number; total: number; color: string; icon: string }> = {
      'Espèces (Régie)': { count: 0, total: 0, color: 'bg-emerald-500', icon: 'cash' },
      'MTN Mobile Money': { count: 0, total: 0, color: 'bg-amber-400', icon: 'mtn' },
      'Airtel Money': { count: 0, total: 0, color: 'bg-red-500', icon: 'airtel' },
      'Virement Trésor Public': { count: 0, total: 0, color: 'bg-blue-600', icon: 'bank' }
    };

    (payments || []).forEach(p => {
      if (!p) return;
      const method = p.payment_method || 'Espèces (Régie)';
      if (!methodsMap[method]) {
        methodsMap[method] = { count: 0, total: 0, color: 'bg-slate-500', icon: 'other' };
      }
      methodsMap[method].count += 1;
      methodsMap[method].total += p.amount_paid || 0;
    });

    const grandTotal = Object.values(methodsMap).reduce((sum, m) => sum + m.total, 0) || 1;

    return Object.entries(methodsMap).map(([name, data]) => ({
      name,
      count: data.count,
      total: data.total,
      color: data.color,
      percent: Math.round((data.total / grandTotal) * 100)
    })).sort((a, b) => b.total - a.total);
  }, [payments]);

  // Status Funnel Breakdown (100% computed from real establishments)
  const statusFunnel = useMemo(() => {
    const statuses = [
      { key: 'identifie', label: '1. Recensés in situ', color: 'bg-slate-400', textColor: 'text-slate-700' },
      { key: 'convoque', label: '2. Convoqués SAA', color: 'bg-amber-500', textColor: 'text-amber-700' },
      { key: 'en_instruction', label: '3. Acomptes & Instruction', color: 'bg-blue-500', textColor: 'text-blue-700' },
      { key: 'attestation_depot', label: '4. Attestation Délivrée', color: 'bg-indigo-500', textColor: 'text-indigo-700' },
      { key: 'transmis_brazzaville', label: '5. Transmis DGL Brazza', color: 'bg-purple-600', textColor: 'text-purple-700' },
      { key: 'autorise_dgl', label: '6. Agréés DGL Définitifs', color: 'bg-emerald-600', textColor: 'text-emerald-700' },
      { key: 'mise_en_demeure', label: '7. Infractions / Mises en Demeure', color: 'bg-red-600', textColor: 'text-red-700' }
    ];

    const estList = establishments || [];
    const totalCount = estList.length || 1;

    return statuses.map(s => {
      const count = estList.filter(e => {
        if (!e) return false;
        if (s.key === 'mise_en_demeure') {
          return e.status === 'mise_en_demeure' || e.status === 'fermeture_administrative';
        }
        return e.status === s.key;
      }).length;
      const pct = (count / totalCount) * 100;
      return { ...s, count, pct: Number(pct.toFixed(1)) };
    });
  }, [establishments]);

  // Agent Performance Roster calculated directly from real database records
  const agentPerformance = useMemo(() => {
    const fieldUsers = (APP_USERS || []).filter(u => u && (u.role === 'AGENT_SAA' || u.role === 'CHEF_SAA' || u.role === 'ADMIN'));
    const estList = establishments || [];
    const payList = payments || [];
    const actList = acts || [];

    return fieldUsers.map(ag => {
      // Real establishments assigned or identified by this agent
      const agEsts = estList.filter(e => {
        if (!e) return false;
        const firstName = (ag.name || '').split(' ')[0].toLowerCase();
        const byName = e.identified_by ? e.identified_by.toLowerCase().includes(firstName) : false;
        const byBadge = e.identified_by ? e.identified_by.includes(ag.badge) : false;
        const byId = e.assigned_agent_id === ag.id;
        return byName || byBadge || byId;
      });

      // Real payments collected by this agent
      const agPayments = payList.filter(p => {
        if (!p) return false;
        const firstName = (ag.name || '').split(' ')[0].toLowerCase();
        const byName = p.collected_by ? p.collected_by.toLowerCase().includes(firstName) : false;
        const byBadge = p.collected_by ? p.collected_by.includes(ag.badge) : false;
        const byAgentBadge = p.agent_badge === ag.badge;
        return byName || byBadge || byAgentBadge;
      });
      const encaisses = agPayments.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);

      // Real convocations/acts issued
      const agConvocations = actList.filter(
        a => a && ((a.agent_notificateur && a.agent_notificateur.includes(ag.name)) || (a.agent_notificateur && a.agent_notificateur.includes(ag.badge)))
      ).length;

      const totalDue = agEsts.reduce((acc, curr) => acc + (curr.total_due || 0), 0);
      const conformite = totalDue > 0 ? Math.min(100, Math.round((encaisses / totalDue) * 100)) : (agEsts.length > 0 ? 80 : 100);

      return {
        id: ag.badge,
        name: ag.name,
        title: ag.title,
        service: ag.service,
        recenses: agEsts.length,
        encaisses,
        paiementsCount: agPayments.length,
        convocations: agConvocations,
        conformite
      };
    }).sort((a, b) => b.encaisses - a.encaisses);
  }, [establishments, payments, acts]);

  // Urgent relances: mise en demeure or convocation
  const urgentActs = (acts || []).filter(a => a && (a.type === 'MISE_EN_DEMEURE' || a.type === 'CONVOCATION'));
  const recentPayments = (payments || []).slice(0, 8);

  // Maximum values for graph scaling
  const maxArrPaid = Math.max(...arrondissementStats.map(a => a.paid), 1);
  const maxArrDue = Math.max(...arrondissementStats.map(a => a.due), 1);
  const maxMonthPaid = Math.max(...monthlyTimeline.map(m => m.total), 1);

  return (
    <div className="space-y-6 select-none">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#022448] via-[#023b75] to-[#006d2f] text-white p-4 sm:p-6 rounded-2xl shadow-lg border border-[#033468] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] sm:text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full font-mono-ref tracking-wider uppercase">
              POSTE DE COMMANDEMENT STRATÉGIQUE
            </span>
            <span className="text-xs text-emerald-200 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Base Réelle Supabase : {establishments.length} Établissements • {payments.length} Paiements</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-republic tracking-tight">
            Système Intégré de Régulation des Loisirs de Pointe-Noire
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-3xl leading-snug">
            Observatoire statistique départemental consolidé en temps réel : supervision de la brigade SAA, monitoring fiscal Trésor/Régie (70/30) et géométrie spatiale des 6 arrondissements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto shrink-0">
          <button
            onClick={reloadData}
            title="Rafraîchir les données de la base"
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs flex items-center justify-center transition border border-white/20"
          >
            <RefreshCw className="w-4 h-4 text-emerald-300" />
          </button>
          <button
            onClick={() => setActiveModule('MOD-03')}
            className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
          >
            <Calendar className="w-4 h-4" />
            <span>Portail Terrain & Agenda</span>
          </button>
          <button
            onClick={() => setActiveModule('MOD-02')}
            className="flex-1 sm:flex-initial bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
          >
            <Building2 className="w-4 h-4" />
            <span>Recensement SAA</span>
          </button>
          <button
            onClick={() => setActiveModule('MOD-07')}
            className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-white/20 transition"
          >
            <MapPin className="w-4 h-4 text-emerald-300" />
            <span>Carte SIG</span>
          </button>
        </div>
      </div>

      {/* Dynamic Filter Strip for Advanced Analytics */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-[#006d2f]" />
          <span>Filtres Statistiques Dynamiques :</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Arrondissement filter */}
          <select
            value={selectedArrondissement}
            onChange={e => setSelectedArrondissement(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006d2f]"
          >
            <option value="ALL">Tous les 6 Arrondissements ({establishments.length} locaux)</option>
            {TERRITORIAL_REFERENTIAL.map(arr => (
              <option key={arr.code} value={arr.code}>
                {arr.name}
              </option>
            ))}
          </select>

          {/* Regime filter */}
          <select
            value={selectedRegime}
            onChange={e => setSelectedRegime(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006d2f]"
          >
            <option value="ALL">Tous régimes fiscaux</option>
            <option value="FORMEL">Régime Formel (Dossier 50 000 FCFA)</option>
            <option value="INFORMEL">Régime Informel (Dossier 30 000 FCFA)</option>
          </select>

          {/* Reset button */}
          {(selectedArrondissement !== 'ALL' || selectedRegime !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedArrondissement('ALL');
                setSelectedRegime('ALL');
              }}
              className="text-xs text-red-600 hover:underline font-bold px-2 py-1"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Live Filter Indicator */}
        <div className="text-xs text-slate-500 font-mono-ref">
          Échantillon actif : <strong className="text-slate-900">{filteredMetrics.total}</strong> établissements (
          {filteredMetrics.totalPaid.toLocaleString('fr-FR')} FCFA encaissés)
        </div>
      </div>

      {/* 4 KPIs Cards with Trend & Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Recensé */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#006d2f] transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recensement Réel</span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-[#006d2f] group-hover:scale-110 transition">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono-ref">{filteredMetrics.total}</span>
            <span className="text-xs text-slate-500 font-medium">locaux en base</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#006d2f] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (filteredMetrics.total / 150) * 100)}%` }}
              />
            </div>
            <span className="font-bold text-[#006d2f] text-xs font-mono-ref">
              {((filteredMetrics.total / 150) * 100).toFixed(0)}% PTA
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-2">
            <span>Formels : <strong className="text-blue-700 font-mono-ref">{filteredMetrics.formelCount}</strong></span>
            <span>Informels : <strong className="text-amber-700 font-mono-ref">{filteredMetrics.informelCount}</strong></span>
          </div>
        </div>

        {/* KPI 2: Montant Recouvré Réel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-500 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recettes Réelles Encaissées</span>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700 group-hover:scale-110 transition">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-[#022448] font-mono-ref">
              {filteredMetrics.totalPaid.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-amber-800 font-bold">FCFA</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-2 font-mono-ref">
            <span className="text-emerald-700 font-semibold">Trésor (70%) : {filteredMetrics.tresor70.toLocaleString('fr-FR')} F</span>
            <span className="text-slate-600 font-semibold">Régie (30%) : {filteredMetrics.regie30.toLocaleString('fr-FR')} F</span>
          </div>
        </div>

        {/* KPI 3: Taux de performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-500 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Taux de Recouvrement</span>
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-700 group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-900 font-mono-ref">{filteredMetrics.rate}%</span>
            <span className="text-xs text-slate-500 font-medium font-mono-ref">
              ({filteredMetrics.totalDue.toLocaleString('fr-FR')} F dus)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-2">
            <span>Soldés : <strong className="text-emerald-700 font-mono-ref">{filteredMetrics.soldeCount}</strong></span>
            <span>Reste à percevoir : <strong className="text-amber-800 font-mono-ref">{filteredMetrics.totalBalance.toLocaleString('fr-FR')} F</strong></span>
          </div>
        </div>

        {/* KPI 4: Dossiers DGL Brazzaville */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#022448] transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Circuit DGL Brazzaville</span>
            <div className="p-2.5 bg-indigo-50 rounded-xl text-[#022448] group-hover:scale-110 transition">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#022448] font-mono-ref">
              {establishments.filter(e => e.status === 'transmis_brazzaville' || e.status === 'autorise_dgl').length}
            </span>
            <span className="text-xs text-slate-500">dossiers transmis</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-2">
            <span className="text-emerald-700 font-semibold font-mono-ref">
              {establishments.filter(e => e.status === 'autorise_dgl').length} Agréments signés
            </span>
            <button
              onClick={() => setActiveModule('MOD-09')}
              className="text-[#006d2f] hover:underline font-bold flex items-center gap-0.5"
            >
              <span>Bordereaux</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 1 of Charts: Territorial Bar Chart & Monthly Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Territorial Performance (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#006d2f]" />
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Recouvrement Réel & Conformité par Arrondissement
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparatif des montants encaissés vs dus calculés sur les données réelles des 6 arrondissements
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setChartMetric('RECOUVREMENT')}
                className={`px-3 py-1 rounded-lg transition ${
                  chartMetric === 'RECOUVREMENT' ? 'bg-white text-[#006d2f] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recouvrement (FCFA)
              </button>
              <button
                onClick={() => setChartMetric('ETABLISSEMENTS')}
                className={`px-3 py-1 rounded-lg transition ${
                  chartMetric === 'ETABLISSEMENTS' ? 'bg-white text-[#006d2f] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Effectifs Locaux
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-4">
            {arrondissementStats.map(arr => {
              const maxVal = chartMetric === 'RECOUVREMENT' ? maxArrDue : 40;
              const currentVal = chartMetric === 'RECOUVREMENT' ? arr.paid : arr.count;
              const barPercent = Math.min(100, Math.round((currentVal / maxVal) * 100));

              return (
                <div key={arr.code} className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-xl border border-slate-200/80 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-1.5 gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{arr.name}</span>
                      <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono-ref text-[11px] font-bold">
                        {arr.count} établissements
                      </span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.2 rounded font-mono-ref">
                        {arr.enRegle} en règle
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono-ref self-end sm:self-auto">
                      <span className="text-slate-500 font-medium">
                        {arr.paid.toLocaleString('fr-FR')} / {arr.due.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="font-black text-[#006d2f] bg-emerald-100/80 px-2 py-0.5 rounded text-xs">
                        {arr.rate}%
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar (Paid vs Total Due) */}
                  <div className="w-full bg-slate-200/90 rounded-full h-3.5 overflow-hidden flex relative">
                    <div
                      className="bg-gradient-to-r from-[#006d2f] via-[#028a3d] to-amber-500 h-full rounded-full transition-all duration-700 relative"
                      style={{ width: `${Math.min(100, arr.rate)}%` }}
                    />
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                    <span>
                      Formels : <strong className="text-blue-700 font-mono-ref">{arr.formels}</strong> • Informels : <strong className="text-amber-700 font-mono-ref">{arr.informels}</strong>
                    </span>
                    <span>Reste à recouvrer : <strong className="text-amber-900 font-mono-ref">{arr.balance.toLocaleString('fr-FR')} FCFA</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Monthly Evolution & Real Ventilation (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Progression des Paiements</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Historique des encaissements par mois issus de la table des quittances
            </p>

            {/* Vertical column chart */}
            <div className="flex items-end justify-between h-44 pt-6 pb-2 px-1 border-b border-slate-200 gap-2">
              {monthlyTimeline.map((item, idx) => {
                const heightPct = Math.max(15, Math.round((item.total / maxMonthPaid) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-mono-ref font-bold text-slate-700 opacity-90 transition">
                      {(item.total / 1000000).toFixed(1)}M
                    </span>
                    <div
                      className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: item.color
                      }}
                    />
                    <span className="text-[10px] text-slate-600 font-semibold truncate w-full text-center">
                      {item.month.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real 70/30 Financial Split Box */}
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#022448]">
                <Landmark className="w-4 h-4 text-blue-700" />
                <span>Ventilation Fiscale 70/30</span>
              </span>
              <span className="font-mono-ref text-[#006d2f] font-black">
                {filteredMetrics.totalPaid.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-blue-600 h-full" style={{ width: '70%' }} title="70% Trésor Public" />
              <div className="bg-[#006d2f] h-full" style={{ width: '30%' }} title="30% Régie DDL" />
            </div>

            <div className="flex justify-between text-[11px] font-mono-ref pt-1 border-t border-slate-200">
              <span className="text-blue-800 font-semibold">
                🏛️ Trésor (70%) : <strong>{filteredMetrics.tresor70.toLocaleString('fr-FR')} F</strong>
              </span>
              <span className="text-[#006d2f] font-semibold">
                🏢 Régie (30%) : <strong>{filteredMetrics.regie30.toLocaleString('fr-FR')} F</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 of Charts: Funnel of Status & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Funnel of Status (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Entonnoir d'Agrément & Instruction</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cycle de vie légal des {establishments.length} dossiers du recensement in situ à l'agrément ministériel
              </p>
            </div>
            <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2 py-1 rounded-lg font-mono-ref">
              7 Paliers
            </span>
          </div>

          <div className="space-y-2.5">
            {statusFunnel.map((step, idx) => (
              <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-none sm:min-w-[180px]">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${step.color}`} />
                  <span className="font-bold text-slate-800 truncate sm:whitespace-normal">{step.label}</span>
                </div>

                <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                  <div className={`${step.color} h-full rounded-full`} style={{ width: `${step.pct}%` }} />
                </div>

                <div className="flex items-center gap-2 font-mono-ref shrink-0">
                  <span className="font-black text-slate-900">{step.count}</span>
                  <span className="text-[10px] text-slate-500">({step.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Répartition par Catégorie d'Activité</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ventilation économique des débits de boissons, discothèques et complexes récréatifs
              </p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2 py-1 rounded-lg font-mono-ref">
              {categoryBreakdown.length} Typologies
            </span>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {categoryBreakdown.map((cat) => (
              <div key={cat.code} className="bg-slate-50 hover:bg-slate-100/60 p-2.5 rounded-xl border border-slate-200/70 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-ref text-[10px] font-bold bg-white border border-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                      {cat.code}
                    </span>
                    <span className="font-bold text-slate-800 truncate max-w-[120px] sm:max-w-[220px]">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-ref">
                    <span className="font-black text-slate-900">{cat.count} locaux</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                      {cat.paid.toLocaleString('fr-FR')} F
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Payment Methods & Acoustic Control Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Channels (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Canaux d'Encaissement Réels</h3>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono-ref">
              {payments.length} Transactions
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Répartition des paiements enregistrés par méthode de règlement (Mobile Money, Espèces, Trésor)
          </p>

          <div className="space-y-3">
            {paymentMethodStats.map(m => (
              <div key={m.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5 gap-1 flex-wrap">
                  <span className="font-bold text-slate-800">{m.name}</span>
                  <div className="flex flex-wrap items-center gap-2 font-mono-ref">
                    <span className="text-slate-600 font-semibold">{m.count} reçus</span>
                    <span className="font-black text-slate-900">{m.total.toLocaleString('fr-FR')} FCFA</span>
                    <span className="bg-white border border-slate-200 text-[#006d2f] font-bold px-1.5 py-0.5 rounded text-[10px]">
                      {m.percent}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className={`${m.color} h-full rounded-full`} style={{ width: `${m.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acoustic & Police Noise Stats (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Contrôle Acoustique & Police des Loisirs</h3>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded-full font-mono-ref">
                Norme &lt;85 dB
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Suivi du respect de l'Arrêté Départemental N° 018/2026 sur les émissions sonores nocturnes
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-black text-indigo-950 font-mono-ref">{filteredMetrics.limiterCount}</div>
                <div className="text-xs font-semibold text-indigo-800 mt-0.5">Limiteurs Acoustiques Installés</div>
                <div className="text-[10px] text-indigo-600 font-mono-ref mt-1">
                  {Math.round((filteredMetrics.limiterCount / (filteredMetrics.total || 1)) * 100)}% du parc actif
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-black text-amber-950 font-mono-ref">{urgentActs.length}</div>
                <div className="text-xs font-semibold text-amber-800 mt-0.5">Mises en Demeure / Convocations</div>
                <div className="text-[10px] text-amber-700 font-mono-ref mt-1">Délai strict 72 heures</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-1">Obligation Légale d'Insonorisation :</span>
              Tout établissement de catégorie A1 (Discothèques, Cabarets, Lounges) émettant après 22h00 doit obligatoirement posséder un limiteur-enregistreur de décibels scellé par la brigade SAA sous peine de fermeture administrative immédiate.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveModule('MOD-05')}
              className="text-xs font-bold text-[#006d2f] hover:underline flex items-center gap-1"
            >
              <span>Consulter l'Atelier des Actes Juridiques</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Agent SAA Field Performance Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#006d2f]" />
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Performance Réelle des Agents de Terrain (Brigade SAA)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi calculé directement sur les données des tournées, quittances signées et convocations notifiées
            </p>
          </div>

          <button
            onClick={() => setActiveModule('MOD-03')}
            className="text-xs bg-[#006d2f] hover:bg-[#005a26] text-white font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>Ouvrir les Agendas des Agents</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3">Agent & Badge</th>
                <th className="py-3 px-3">Titre & Affectation</th>
                <th className="py-3 px-3 text-center">Établissements Attribués</th>
                <th className="py-3 px-3 text-center">Actes & Convocations</th>
                <th className="py-3 px-3 text-center">Quittances Signées</th>
                <th className="py-3 px-3 text-right">Montant Encaissé</th>
                <th className="py-3 px-3 text-center">Statut Mission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agentPerformance.map(ag => (
                <tr key={ag.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#006d2f] text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {ag.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{ag.name}</span>
                        <span className="text-[10px] font-mono-ref text-slate-500">{ag.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 max-w-[200px] truncate">{ag.title}</td>
                  <td className="py-3 px-3 text-center font-mono-ref font-bold text-slate-800">{ag.recenses}</td>
                  <td className="py-3 px-3 text-center font-mono-ref text-amber-800 font-bold">{ag.convocations}</td>
                  <td className="py-3 px-3 text-center font-mono-ref text-blue-800 font-bold">{ag.paiementsCount}</td>
                  <td className="py-3 px-3 text-right font-mono-ref font-bold text-emerald-800">
                    {ag.encaisses.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold text-[10px] inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Actif</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 5: Urgent Relances & Derniers Encaissements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Actions SAA (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Mesures Conservatoires & Alertes 72h</span>
              </h3>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                Délai Strict
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Mises en demeure et convocations actives nécessitant notification contradictoire ou exécution de scellés.
            </p>

            <div className="space-y-3">
              {urgentActs.slice(0, 4).map(act => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-[#022448] uppercase block">
                        {act.establishment_name}
                      </span>
                      <span className="text-[10px] text-slate-500">{act.arrondissement}</span>
                    </div>
                    <span className="text-[9px] bg-amber-200 text-amber-900 font-mono-ref px-1.5 py-0.5 rounded font-bold">
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
                      <span>Imprimer Acte A4</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveModule('MOD-05')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Accéder à l'Atelier des Actes & Sanctions</span>
            </button>
          </div>
        </div>

        {/* Derniers Encaissements Régie (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Derniers Encaissements Réels & Quittances
                </h3>
                <p className="text-xs text-slate-500">
                  Transactions réelles enregistrées via terminaux mobiles avec quittances certifiées
                </p>
              </div>
              <button
                onClick={() => setActiveModule('MOD-10')}
                className="text-xs text-[#006d2f] hover:underline font-bold flex items-center gap-1"
              >
                <span>Régie SAF</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Quittance Réf</th>
                    <th className="py-2.5 px-3">Établissement</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3">Montant Encaissé</th>
                    <th className="py-2.5 px-3">Agent SAA</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono-ref font-bold text-[#022448]">{p.receipt_reference}</td>
                      <td className="py-2.5 px-3 font-semibold truncate max-w-[150px]">{p.establishment_name}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700 font-medium">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono-ref font-bold text-emerald-800">
                        {p.amount_paid.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[120px]">{p.collected_by}</td>
                      <td className="py-2.5 px-3 text-right">
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

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500">
            <span>Règle d'or renouvellement N+1 active sur toutes les quittances soldées</span>
            <span className="font-mono-ref font-bold text-[#006d2f]">70% Trésor / 30% Régie DDL</span>
          </div>
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
