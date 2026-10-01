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
  RefreshCw,
  Scale,
  UserCheck,
  Percent,
  Compass,
  FileCheck2,
  Receipt,
  ArrowRight
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

  // Gender Distribution of Promoters
  const genderStats = useMemo(() => {
    const femaleNames = ['mme', 'madame', 'solange', 'sylvie', 'yvette', 'nadine', 'chimene', 'chimène', 'honorine', 'jeanne', 'patricia', 'marie', 'clarisse', 'brigitte', 'grâce', 'grace', 'chantal', 'esther', 'arlette', 'alphonsine', 'bernice', 'charlotte'];
    let femaleCount = 0;
    let maleCount = 0;

    filteredEsts.forEach(e => {
      const p = (e.promoter_name || '').toLowerCase();
      const isFemale = femaleNames.some(fn => p.includes(fn));
      if (isFemale) {
        femaleCount++;
      } else {
        maleCount++;
      }
    });

    const total = filteredEsts.length || 1;
    const femalePct = Math.round((femaleCount / total) * 100);
    const malePct = 100 - femalePct;

    return {
      femaleCount,
      maleCount,
      femalePct,
      malePct
    };
  }, [filteredEsts]);

  // Status breakdown (Dossier workflow distribution)
  const statusDistribution = useMemo(() => {
    const counts = {
      attestation_depot: 0,
      en_instruction: 0,
      transmis_brazzaville: 0,
      autorise_dgl: 0,
      convoque: 0,
      mise_en_demeure: 0
    };

    filteredEsts.forEach(e => {
      if (e.status === 'attestation_depot') counts.attestation_depot++;
      else if (e.status === 'en_instruction') counts.en_instruction++;
      else if (e.status === 'transmis_brazzaville') counts.transmis_brazzaville++;
      else if (e.status === 'autorise_dgl') counts.autorise_dgl++;
      else if (e.status === 'convoque') counts.convoque++;
      else if (e.status === 'mise_en_demeure' || e.status === 'fermeture_administrative') counts.mise_en_demeure++;
      else counts.en_instruction++;
    });

    const total = filteredEsts.length || 1;
    return [
      { label: 'Attestation de Dépôt délivrée', count: counts.attestation_depot, pct: Math.round((counts.attestation_depot / total) * 100), color: '#006d2f' },
      { label: 'En instruction de dossier', count: counts.en_instruction, pct: Math.round((counts.en_instruction / total) * 100), color: '#0284c7' },
      { label: 'Transmis DGL Brazzaville', count: counts.transmis_brazzaville, pct: Math.round((counts.transmis_brazzaville / total) * 100), color: '#6366f1' },
      { label: 'Agréments définitifs DGL', count: counts.autorise_dgl, pct: Math.round((counts.autorise_dgl / total) * 100), color: '#850404' },
      { label: 'Convoqués au Guichet Bureau', count: counts.convoque, pct: Math.round((counts.convoque / total) * 100), color: '#d97706' },
      { label: 'Mises en demeure (72h)', count: counts.mise_en_demeure, pct: Math.round((counts.mise_en_demeure / total) * 100), color: '#dc2626' }
    ];
  }, [filteredEsts]);

  // Real Arrondissement breakdown directly from database
  const arrondissementStats = useMemo(() => {
    const estList = establishments || [];
    const payList = payments || [];

    return TERRITORIAL_REFERENTIAL.map(arr => {
      const arrEsts = estList.filter(e => e && e.arrondissement === arr.code);
      const count = arrEsts.length;
      const due = arrEsts.reduce((sum, e) => sum + (e.total_due || 0), 0);
      
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

    (filteredEsts || []).forEach(e => {
      if (!e) return;
      const code = e.activity_code || 'A2.1';
      const defaultLabel = ACTIVITY_CATEGORIES.find(c => c.code === code)?.label || e.activity_type || 'Activité Loisirs';
      const entry = map.get(code) || { label: defaultLabel, count: 0, paid: 0, due: 0 };
      entry.count += 1;
      entry.paid += e.amount_paid || 0;
      entry.due += e.total_due || 0;
      map.set(code, entry);
    });

    const totalEsts = filteredEsts.length || 1;
    return Array.from(map.entries())
      .map(([code, val]) => ({
        code,
        label: val.label,
        count: val.count,
        paid: val.paid,
        due: val.due,
        pct: Math.round((val.count / totalEsts) * 100),
        rate: val.due > 0 ? Math.round((val.paid / val.due) * 100) : 0
      }))
      .filter(item => item.count > 0 || ['A1.1', 'A1.2', 'A1.3', 'A2.1', 'A2.2', 'A3.1'].includes(item.code))
      .sort((a, b) => b.count - a.count);
  }, [filteredEsts]);

  // Monthly Payment progression
  const monthlyTimeline = useMemo(() => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const map = new Map<string, { total: number; count: number; label: string }>();

    (payments || []).forEach(p => {
      if (!p || !p.record_date) return;
      const monthKey = p.record_date.slice(0, 7);
      const parts = monthKey.split('-');
      const monthIndex = parts.length > 1 ? parseInt(parts[1], 10) - 1 : 0;
      const label = `${monthNames[monthIndex] || 'Mois'} ${parts[0] || '2026'}`;
      
      const current = map.get(monthKey) || { total: 0, count: 0, label };
      current.total += p.amount_paid || 0;
      current.count += 1;
      map.set(monthKey, current);
    });

    const entries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
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

  // Payment Methods Breakdown (Computed from real payments)
  const paymentMethodStats = useMemo(() => {
    const methodsMap: Record<string, { count: number; total: number; color: string; label: string }> = {
      'Espèces (Régie)': { count: 0, total: 0, color: '#006d2f', label: 'Espèces (Guichet Bureau)' },
      'MTN Mobile Money': { count: 0, total: 0, color: '#d97706', label: 'MTN Mobile Money' },
      'Airtel Money': { count: 0, total: 0, color: '#dc2626', label: 'Airtel Money' },
      'Virement Trésor Public': { count: 0, total: 0, color: '#0284c7', label: 'Virement Trésor' }
    };

    (payments || []).forEach(p => {
      if (!p) return;
      const method = p.payment_method || 'Espèces (Régie)';
      if (!methodsMap[method]) {
        methodsMap[method] = { count: 0, total: 0, color: '#64748b', label: method };
      }
      methodsMap[method].count += 1;
      methodsMap[method].total += p.amount_paid || 0;
    });

    const grandTotal = Object.values(methodsMap).reduce((sum, m) => sum + m.total, 0) || 1;

    return Object.entries(methodsMap).map(([key, val]) => ({
      method: val.label,
      rawKey: key,
      count: val.count,
      total: val.total,
      pct: Math.round((val.total / grandTotal) * 100),
      color: val.color
    })).sort((a, b) => b.total - a.total);
  }, [payments]);

  // Police administrative & legal acts
  const legalActsSummary = useMemo(() => {
    const allActs = acts || [];
    const misesEnDemeure = allActs.filter(a => a.type === 'MISE_EN_DEMEURE').length;
    const convocations = allActs.filter(a => a.type === 'CONVOCATION').length;
    const fermetures = allActs.filter(a => a.type === 'ARRETE_FERMETURE').length;
    const missions = allActs.filter(a => a.type === 'ORDRE_MISSION').length;

    return {
      total: allActs.length,
      misesEnDemeure,
      convocations,
      fermetures,
      missions
    };
  }, [acts]);

  // Maximum values for graph scaling
  const maxArrPaid = Math.max(...arrondissementStats.map(a => a.paid), 1);
  const maxArrDue = Math.max(...arrondissementStats.map(a => a.due), 1);
  const maxMonthPaid = Math.max(...monthlyTimeline.map(m => m.total), 1);

  return (
    <div className="space-y-6 select-none">
      {/* Welcome Strategic Command Banner */}
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
            Tableau de Bord Exécutif & Régulation des Loisirs
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-3xl leading-snug">
            Observatoire départemental consolidé en temps réel : supervision de la brigade SAA, monitoring fiscal Trésor/Régie (70/30), analyse sectorielle (Formel $m^2$ / Informel forfait) et parité de genre.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto shrink-0">
          <button
            onClick={reloadData}
            title="Rafraîchir les données de la base"
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs flex items-center justify-center transition border border-white/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-300" />
          </button>
          <button
            onClick={() => setActiveModule('MOD-14')}
            className="flex-1 sm:flex-initial bg-red-950/80 hover:bg-red-900 text-amber-300 font-extrabold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow border border-amber-400/40 transition cursor-pointer"
            title="Administration des Agents, Mots de Passe & Badges QR"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Personnel & Badges QR</span>
          </button>
          <button
            onClick={() => setActiveModule('MOD-11')}
            className="flex-1 sm:flex-initial bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-slate-950" />
            <span>Guichet Bureau & Titres</span>
          </button>
          <button
            onClick={() => setActiveModule('MOD-03')}
            className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Portail Terrain & Agenda</span>
          </button>
          <button
            onClick={() => setActiveModule('MOD-07')}
            className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-white/20 transition cursor-pointer"
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
            <option value="ALL">Tous régimes (Formel & Informel)</option>
            <option value="FORMEL">Secteur Formel (RCCM • Tarif au m²)</option>
            <option value="INFORMEL">Secteur Informel (Forfait d'accompagnement)</option>
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

      {/* 4 Core KPIs Cards */}
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
            <span>Formels (m²) : <strong className="text-blue-700 font-mono-ref">{filteredMetrics.formelCount}</strong></span>
            <span>Informels (Forfait) : <strong className="text-amber-700 font-mono-ref">{filteredMetrics.informelCount}</strong></span>
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

        {/* KPI 4: Circuit DGL Brazzaville */}
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

      {/* =========================================================================
          NOUVEAU BLOC : GRAPHIQUES CAMEMBERTS / FROMAGES (SECTORIEL & GENRE & STATUTS)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Camembert 1 : Secteur Formel vs Secteur Informel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#006d2f]" />
                <h3 className="font-bold text-slate-900 text-sm">Répartition Sectorielle</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded font-mono-ref">
                Régimes Fiscaux
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Formel (Calcul au m² + RCCM + Enquête Hygiène/Sécurité) vs Informel (Forfait annuel d'accompagnement).
            </p>

            {/* Visual Bar / Donut Representation */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-blue-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Secteur Formel (au m²)
                  </span>
                  <span className="font-mono-ref">{filteredMetrics.formelCount} locaux ({Math.round((filteredMetrics.formelCount / (filteredMetrics.total || 1)) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((filteredMetrics.formelCount / (filteredMetrics.total || 1)) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Secteur Informel (Forfait annuel)
                  </span>
                  <span className="font-mono-ref">{filteredMetrics.informelCount} locaux ({Math.round((filteredMetrics.informelCount / (filteredMetrics.total || 1)) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((filteredMetrics.informelCount / (filteredMetrics.total || 1)) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between font-mono-ref">
            <span>Frais dossier Formel : <strong>50 000 F</strong></span>
            <span>Frais dossier Informel : <strong>30 000 F</strong></span>
          </div>
        </div>

        {/* Camembert 2 : Répartition par Genre des Promoteurs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-slate-900 text-sm">Parité & Genre des Promoteurs</h3>
              </div>
              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded font-mono-ref">
                Exploitants
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Proportion des femmes entrepreneures et gérantes d'établissements de loisirs à Pointe-Noire.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-purple-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    Promotrices Femmes
                  </span>
                  <span className="font-mono-ref">{genderStats.femaleCount} exploitantes ({genderStats.femalePct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${genderStats.femalePct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    Promoteurs Hommes
                  </span>
                  <span className="font-mono-ref">{genderStats.maleCount} exploitants ({genderStats.malePct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-slate-700 h-full rounded-full transition-all duration-500" style={{ width: `${genderStats.malePct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-purple-900 font-semibold flex items-center justify-between">
            <span>Indice d'inclusion féminine :</span>
            <span className="font-mono-ref font-bold">{genderStats.femalePct}% de gestionnaires</span>
          </div>
        </div>

        {/* Camembert 3 : Ventilation des Canaux de Paiement SAF */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">Canaux d'Encaissement SAF</h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded font-mono-ref">
                Régie & Guichet
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Répartition des versements entre le Guichet Bureau et les solutions mobiles.
            </p>

            <div className="space-y-2">
              {paymentMethodStats.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-semibold mb-0.5">
                    <span className="truncate max-w-[170px] text-slate-800 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      {item.method}
                    </span>
                    <span className="font-mono-ref font-bold text-slate-900">{item.total.toLocaleString('fr-FR')} F ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: item.color, width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between font-mono-ref">
            <span>Total Guichet + Mobile :</span>
            <strong className="text-emerald-800">{filteredMetrics.totalPaid.toLocaleString('fr-FR')} FCFA</strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BLOC : STATUTS D'INSTRUCTION ET POLICE ADMINISTRATIVE (ACTES 72h)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Statuts d'Instruction du Circuit (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#022448]" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Circuit d'Instruction & Statuts Réglementaires</h3>
                <p className="text-xs text-slate-500">De l'identification terrain jusqu'à l'Agrément Ministériel à Brazzaville</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {statusDistribution.map((st, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                    {st.label}
                  </span>
                  <span className="font-mono-ref font-extrabold text-slate-900">
                    {st.count} locaux <span className="text-slate-500 font-normal">({st.pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: st.color, width: `${st.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actes de Police Administrative & Sanctions SAA (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-red-700" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Atelier des Actes & Police SAA</h3>
                  <p className="text-xs text-slate-500">Contrôle de conformité et mesures conservatoires</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-mono-ref font-bold text-[10px]">
                Loi 21-2019
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Mises en Demeure (72h)</span>
                <span className="text-2xl font-black text-amber-950 font-mono-ref block mt-1">{legalActsSummary.misesEnDemeure}</span>
                <span className="text-[10px] text-amber-700">Délai sous huitaine</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold text-blue-900 uppercase block">Convocations SAA</span>
                <span className="text-2xl font-black text-blue-950 font-mono-ref block mt-1">{legalActsSummary.convocations}</span>
                <span className="text-[10px] text-blue-700">Auditions au bureau</span>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <span className="text-[10px] font-bold text-red-900 uppercase block">Arrêtés de Fermeture</span>
                <span className="text-2xl font-black text-red-950 font-mono-ref block mt-1">{legalActsSummary.fermetures}</span>
                <span className="text-[10px] text-red-700">Scellés de la République</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-900 uppercase block">Limiteurs Acoustiques</span>
                <span className="text-2xl font-black text-emerald-950 font-mono-ref block mt-1">{filteredMetrics.limiterCount}</span>
                <span className="text-[10px] text-emerald-700">Seuils &lt;85 dB scellés</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModule('MOD-05')}
            className="w-full py-2 bg-[#022448] hover:bg-[#033468] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span>Ouvrir l'Atelier des Actes & Convocations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          BLOC : RECOUVREMENT PAR ARRONDISSEMENT (BAR CHART) & PROGRESSION MENSUELLE
         ========================================================================= */}
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
                Comparatif des montants encaissés vs exigibles calculés sur les 6 arrondissements de Pointe-Noire
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setChartMetric('RECOUVREMENT')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  chartMetric === 'RECOUVREMENT' ? 'bg-white text-[#006d2f] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recouvrement (FCFA)
              </button>
              <button
                onClick={() => setChartMetric('ETABLISSEMENTS')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
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
                <div key={arr.code} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{arr.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono-ref font-semibold">
                        {arr.count} établissements
                      </span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded font-mono-ref">
                        {arr.enRegle} en règle
                      </span>
                    </div>
                    <div className="font-mono-ref font-extrabold text-slate-900 flex items-center gap-2">
                      {chartMetric === 'RECOUVREMENT' ? (
                        <>
                          <span className="text-emerald-800">{arr.paid.toLocaleString('fr-FR')}</span>
                          <span className="text-slate-400 font-normal">/ {arr.due.toLocaleString('fr-FR')} FCFA</span>
                          <span className="text-[#006d2f] font-black">{arr.rate}%</span>
                        </>
                      ) : (
                        <span>{arr.count} locaux recensés</span>
                      )}
                    </div>
                  </div>

                  {/* Dual layered bar */}
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-[#006d2f] to-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono-ref flex-wrap gap-1">
                    <span>Formels : {arr.formels} • Informels : {arr.informels}</span>
                    <span>Reste à recouvrer : {arr.balance.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Monthly Timeline Progression (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Progression des Paiements</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Historique des encaissements par mois issus de la table des quittances
            </p>

            <div className="space-y-4">
              {monthlyTimeline.map((item, idx) => {
                const heightPercent = Math.min(100, Math.round((item.total / maxMonthPaid) * 100));
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-700">{item.month}</span>
                      <span className="font-mono-ref text-slate-900">{item.total.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ backgroundColor: item.color, width: `${heightPercent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 text-right font-mono-ref">
                      {item.count} quittances validées
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-3 rounded-xl text-xs space-y-1">
            <p className="font-bold text-slate-800">Clé de répartition légale :</p>
            <div className="flex justify-between text-[11px] font-mono-ref">
              <span className="text-emerald-700">Trésor (70%) : {filteredMetrics.tresor70.toLocaleString('fr-FR')} F</span>
              <span className="text-blue-900">Régie (30%) : {filteredMetrics.regie30.toLocaleString('fr-FR')} F</span>
            </div>
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
