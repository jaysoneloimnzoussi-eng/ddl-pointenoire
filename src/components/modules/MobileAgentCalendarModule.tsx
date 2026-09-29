import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  MapPin,
  Phone,
  MessageSquare,
  Check,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Coins,
  Printer,
  Navigation,
  Volume2,
  RefreshCw,
  Wifi,
  WifiOff,
  Filter,
  MoreVertical,
  X,
  ArrowRight,
  UserCheck,
  Layers,
  FileCheck2,
  Receipt,
  RotateCw,
  Sparkles,
  Lock,
  Unlock,
  Sliders,
  Share2,
  Download,
  AlertCircle,
  Eye,
  Info,
  CalendarDays,
  Smartphone
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { storageService } from '../../services/storageService';
import { AgentTourneeEvent, Establishment, TerrainPaymentRecord, AppUser } from '../../types';
import { APP_USERS, TERRITORIAL_REFERENTIAL } from '../../constants/referential';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';
import { OfficialRepublicLogo } from '../common/OfficialSeal';

// Liste officielle des agents assermentés de terrain de la Brigade SAA (strictement issus de APP_USERS)
const FIELD_AGENTS = APP_USERS.filter(u => u.role === 'AGENT_SAA' || u.role === 'CHEF_SAA').map(u => ({
  badge: u.badge,
  name: u.name,
  role: u.title,
  zone: u.badge === 'SAA-PN-001'
    ? 'Commandement Central Brigade SAA - Tous Arrondissements'
    : u.badge === 'SAA-PN-008'
    ? 'Arrondissements 1 Lumumba & 2 Mvou-Mvou'
    : u.badge === 'SAA-PN-005'
    ? 'Arrondissements 3 Tié-Tié & 6 Ngoyo'
    : 'Arrondissements 4 Louandjili & 5 Mongo-Mpoukou',
  phone: u.phone,
  avatar: u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}));

export const MobileAgentCalendarModule: React.FC = () => {
  const { currentUser, switchUserById, triggerNotification } = useSession();

  // Selected agent for private field session (defaults to current user if SAA, or first field agent)
  const [activeAgentBadge, setActiveAgentBadge] = useState<string>(() => {
    const found = FIELD_AGENTS.find(a => a.badge === currentUser.badge);
    return found ? found.badge : 'SAA-PN-008'; // Default Guy-Serge LOUBAKI
  });

  const currentAgent = useMemo(() => {
    return FIELD_AGENTS.find(a => a.badge === activeAgentBadge) || FIELD_AGENTS[1];
  }, [activeAgentBadge]);

  // Calendar Date State (Default date of exercise: 2026-09-29)
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-09-29');
  const [viewMode, setViewMode] = useState<'JOUR' | 'SEMAINE' | 'MOIS' | 'PLANNING'>('SEMAINE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Events from storage
  const [events, setEvents] = useState<AgentTourneeEvent[]>(() => storageService.getAgentEvents());
  const establishments = storageService.getEstablishments();

  // Network & Sync State
  const [isRealOnline, setIsRealOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const isOnline = isRealOnline && !isSimulatedOffline;

  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => storageService.getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals & Panels
  const [selectedEvent, setSelectedEvent] = useState<AgentTourneeEvent | null>(null);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isConvocationModalOpen, setIsConvocationModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSoundMeterModalOpen, setIsSoundMeterModalOpen] = useState(false);
  const [isOfflineQueueModalOpen, setIsOfflineQueueModalOpen] = useState(false);
  const [isAgentLoginModalOpen, setIsAgentLoginModalOpen] = useState(false);

  // Form states
  const [targetEstId, setTargetEstId] = useState<string>(establishments[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<TerrainPaymentRecord['payment_method']>('MTN Mobile Money');
  const [payerName, setPayerName] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('Encaissement direct in situ par la Brigade SAA');
  
  // Convocation form
  const [convocationDate, setConvocationDate] = useState<string>('2026-10-02');
  const [convocationTime, setConvocationTime] = useState<string>('10:00');
  const [convocationMotif, setConvocationMotif] = useState<string>(
    'Comparution obligatoire pour régularisation du dossier SAA et versement des frais d\'exploitation réglementaires.'
  );

  // Decibel meter state
  const [currentDecibels, setCurrentDecibels] = useState<number>(76);
  const [isMeasuringSound, setIsMeasuringSound] = useState(false);

  // Filter types checkboxes
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({
    CONVOCATION: true,
    ENCAISSEMENT_ACOMPTE: true,
    RENOUVELLEMENT_ANNUEL: true,
    NOTIFICATION_MISE_EN_DEMEURE: true,
    CONTROLE_ACOUSTIQUE: true,
    RECENSEMENT_IN_SITU: true
  });

  // Filter mode: "ONLY_ME" (only current agent's events) or "ALL_BRIGADE" (all team)
  const [agentScope, setAgentScope] = useState<'ONLY_ME' | 'ALL_BRIGADE'>('ONLY_ME');

  // Print modal state
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: PrintDocumentType;
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'TICKET_58MM',
    title: '',
    data: null
  });

  // Network sync listener
  useEffect(() => {
    const handleOnline = () => {
      setIsRealOnline(true);
      if (!isSimulatedOffline) {
        triggerNotification('Connexion Internet rétablie. Synchronisation automatique avec la base centrale en cours...', 'info');
        handleSyncNow();
      }
    };
    const handleOffline = () => {
      setIsRealOnline(false);
      triggerNotification('Mode Hors-Ligne activé. Vos actions de brigade sont sécurisées localement.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      setOfflineQueue(storageService.getOfflineQueue());
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isSimulatedOffline]);

  // Decibel sound meter simulation effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMeasuringSound) {
      timer = setInterval(() => {
        // Vary between 68 and 94 dB
        const val = Math.floor(70 + Math.random() * 24);
        setCurrentDecibels(val);
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isMeasuringSound]);

  const reloadEvents = () => {
    setEvents(storageService.getAgentEvents());
    setOfflineQueue(storageService.getOfflineQueue());
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      storageService.flushOfflineQueue();
      reloadEvents();
      setIsSyncing(false);
      triggerNotification('Synchronisation 100% réussie avec le serveur Supabase et la base centrale DDL-PN.', 'success');
    }, 900);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Scope filter: only active agent or all brigade
      const matchAgent =
        agentScope === 'ALL_BRIGADE' ||
        evt.agentBadge === activeAgentBadge ||
        evt.agentId === activeAgentBadge;

      // Type filter
      const matchType = activeFilters[evt.type] !== false;

      // Search filter
      const matchSearch =
        !searchQuery ||
        evt.establishmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.promoterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.quartier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.phone.includes(searchQuery);

      return matchAgent && matchType && matchSearch;
    });
  }, [events, activeAgentBadge, agentScope, activeFilters, searchQuery]);

  // Events of the current day
  const currentDayEvents = useMemo(() => {
    return filteredEvents
      .filter(e => e.date === currentDateStr)
      .sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  }, [filteredEvents, currentDateStr]);

  // Agent daily statistics
  const agentDailyStats = useMemo(() => {
    const todayEvents = events.filter(e => e.date === currentDateStr && (agentScope === 'ALL_BRIGADE' || e.agentBadge === activeAgentBadge));
    const allPayments = storageService.getPayments();
    const todayPayments = allPayments.filter(p => p.record_date === currentDateStr && (agentScope === 'ALL_BRIGADE' || p.agent_badge === activeAgentBadge));
    const totalCollected = todayPayments.reduce((sum, p) => sum + p.amount_paid, 0);
    const convocationsCount = todayEvents.filter(e => e.type === 'CONVOCATION').length;
    const pendingTournees = todayEvents.filter(e => e.status !== 'EFFECTUE').length;

    return {
      totalCollected,
      convocationsCount,
      pendingTournees,
      todayPaymentsCount: todayPayments.length
    };
  }, [events, currentDateStr, activeAgentBadge, agentScope]);

  // Navigate Date
  const handleNavigate = (direction: 'PREV' | 'NEXT' | 'TODAY') => {
    if (direction === 'TODAY') {
      setCurrentDateStr('2026-09-29');
      return;
    }
    const current = new Date(currentDateStr);
    if (viewMode === 'JOUR') {
      current.setDate(current.getDate() + (direction === 'NEXT' ? 1 : -1));
    } else if (viewMode === 'SEMAINE') {
      current.setDate(current.getDate() + (direction === 'NEXT' ? 7 : -7));
    } else {
      current.setMonth(current.getMonth() + (direction === 'NEXT' ? 1 : -1));
    }
    setCurrentDateStr(current.toISOString().split('T')[0]);
  };

  // Google Calendar Colors by Type
  const getTypeStyle = (type: AgentTourneeEvent['type']) => {
    switch (type) {
      case 'CONVOCATION':
        return {
          bg: 'bg-purple-600',
          bgLight: 'bg-purple-50',
          border: 'border-purple-300',
          text: 'text-purple-800',
          pillBg: '#9333ea',
          label: 'Convocation SAA'
        };
      case 'ENCAISSEMENT_ACOMPTE':
        return {
          bg: 'bg-[#006d2f]',
          bgLight: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-800',
          pillBg: '#006d2f',
          label: 'Acompte / Recouvrement'
        };
      case 'RENOUVELLEMENT_ANNUEL':
        return {
          bg: 'bg-amber-600',
          bgLight: 'bg-amber-50',
          border: 'border-amber-400',
          text: 'text-amber-900',
          pillBg: '#d97706',
          label: 'Renouvellement Annuel N+1'
        };
      case 'NOTIFICATION_MISE_EN_DEMEURE':
        return {
          bg: 'bg-red-600',
          bgLight: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-800',
          pillBg: '#dc2626',
          label: 'Mise en Demeure (72h)'
        };
      case 'CONTROLE_ACOUSTIQUE':
        return {
          bg: 'bg-blue-600',
          bgLight: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-800',
          pillBg: '#2563eb',
          label: 'Contrôle Acoustique (<80dB)'
        };
      case 'RECENSEMENT_IN_SITU':
        return {
          bg: 'bg-cyan-600',
          bgLight: 'bg-cyan-50',
          border: 'border-cyan-300',
          text: 'text-cyan-800',
          pillBg: '#0891b2',
          label: 'Recensement In Situ'
        };
      default:
        return {
          bg: 'bg-slate-600',
          bgLight: 'bg-slate-50',
          border: 'border-slate-300',
          text: 'text-slate-800',
          pillBg: '#475569',
          label: 'Intervention Brigade'
        };
    }
  };

  // Perform Encaissement d'acompte on the field
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEstId) return;

    const est = establishments.find(x => x.id === targetEstId);
    if (!est) return;

    const result = storageService.recordPayment({
      establishment_id: est.id,
      amount: Number(paymentAmount),
      payment_method: paymentMethod,
      collected_by: currentAgent.name,
      agent_badge: currentAgent.badge,
      notes: paymentNotes || `Encaissement sur le terrain par ${currentAgent.name}`
    });

    reloadEvents();
    setIsPaymentModalOpen(false);

    // Business Rule Check: Annual Renewal
    if (result.renewalEvent) {
      triggerNotification(
        `⭐ RÈGLE DDL-PN APPLIQUÉE : Redevance intégralement soldée ! Le renouvellement annuel (N+1) des frais d'exploitation a été automatiquement programmé au ${result.renewalEvent.date} dans votre Google Agenda SAA.`,
        'success'
      );
    } else {
      triggerNotification(
        `Acompte de ${paymentAmount.toLocaleString('fr-FR')} FCFA validé. Reçu N° ${result.payment.receipt_reference}. Reste dû : ${result.establishment.balance_due.toLocaleString('fr-FR')} FCFA.`,
        'success'
      );
    }

    // Auto open printable thermal ticket 58mm
    setPrintDoc({
      isOpen: true,
      type: 'TICKET_58MM',
      title: `Ticket Quittance - ${result.payment.receipt_reference}`,
      data: {
        ...result.payment,
        activity_type: est.activity_type,
        address: est.address,
        annual_renewal_scheduled_date: result.establishment.annual_renewal_date
      }
    });
  };

  // Perform Convocation
  const handleConfirmConvocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEstId) return;

    const est = establishments.find(x => x.id === targetEstId);
    if (!est) return;

    const matchedUser: AppUser = {
      id: currentAgent.badge,
      name: currentAgent.name,
      badge: currentAgent.badge,
      role: 'AGENT_SAA',
      title: currentAgent.role,
      service: 'Service Agrément et Assainissement (SAA)',
      phone: currentAgent.phone,
      email: `${currentAgent.badge.toLowerCase()}@ddlpn.gouv.cg`
    };

    const result = storageService.convoquerEstablishment({
      establishment_id: est.id,
      date: convocationDate,
      timeStart: convocationTime,
      motif: convocationMotif,
      agent: matchedUser
    });

    reloadEvents();
    setIsConvocationModalOpen(false);
    triggerNotification(`Convocation officielle N° ${result.act.reference_number} enregistrée et programmée au calendrier SAA !`, 'success');

    // Propose print of official Convocation Act A4
    setPrintDoc({
      isOpen: true,
      type: 'ACTE_JURIDIQUE_A4',
      title: `Convocation Contradictoire - ${result.act.reference_number}`,
      data: result.act
    });
  };

  // Mark event done
  const handleMarkEventDone = (evtId: string) => {
    storageService.updateAgentEvent(evtId, { status: 'EFFECTUE' });
    reloadEvents();
    if (selectedEvent?.id === evtId) {
      setSelectedEvent(prev => (prev ? { ...prev, status: 'EFFECTUE' } : null));
    }
    triggerNotification('Opération de brigade validée et enregistrée in situ.', 'success');
  };

  // Save Decibel Measurement
  const handleSaveDecibels = () => {
    if (!selectedEvent) return;
    storageService.updateAgentEvent(selectedEvent.id, { decibelMeasure: currentDecibels });
    reloadEvents();
    setIsSoundMeterModalOpen(false);
    triggerNotification(
      `Relevé acoustique contradictoire de ${currentDecibels} dB enregistré pour ${selectedEvent.establishmentName} (${currentDecibels <= 80 ? 'Conforme' : 'Infraction sonore'}).`,
      currentDecibels <= 80 ? 'success' : 'warning'
    );
  };

  // Date Header Formatter
  const formattedDateTitle = useMemo(() => {
    const d = new Date(currentDateStr);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [currentDateStr]);

  const monthYearTitle = useMemo(() => {
    const d = new Date(currentDateStr);
    const m = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return m.charAt(0).toUpperCase() + m.slice(1);
  }, [currentDateStr]);

  // Week days array for Week View
  const weekDays = useMemo(() => {
    const curr = new Date(currentDateStr);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Monday is start
    const monday = new Date(curr.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      days.push({
        dateStr: next.toISOString().split('T')[0],
        dayName: next.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNum: next.getDate()
      });
    }
    return days;
  }, [currentDateStr]);

  // Working Hours for Day and Week Views
  const HOURS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden font-sans">
      {/* ========================================================
          1. GOOGLE CALENDAR MAIN HEADER
         ======================================================== */}
      <header className="px-3 sm:px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0 select-none">
        {/* Left: Google Calendar Brand & Date Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger toggle for left sidebar */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition"
            title="Afficher/Masquer le panneau latéral"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>

          {/* Google Calendar Logo (Authentic Google 31 Icon) */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('TODAY')}>
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center p-0.5 overflow-hidden">
              <div className="w-full bg-[#1a73e8] text-white text-[8px] font-bold text-center uppercase tracking-tighter">
                SEP
              </div>
              <div className="text-[#1a73e8] font-black text-sm leading-none pt-0.5">
                29
              </div>
            </div>
            <div className="leading-tight hidden sm:block">
              <span className="text-base font-medium text-slate-800 tracking-tight flex items-center gap-1.5">
                <span className="font-semibold text-slate-900">Google Agenda</span>
                <span className="text-[10px] bg-blue-100 text-blue-900 font-mono-ref px-1.5 py-0.5 rounded font-extrabold">
                  BRIGADE SAA
                </span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                DDL-PN • République du Congo
              </span>
            </div>
          </div>

          {/* Today Button & Arrows */}
          <div className="flex items-center gap-1 ml-1 sm:ml-4">
            <button
              onClick={() => handleNavigate('TODAY')}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => handleNavigate('PREV')}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition"
              title="Précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleNavigate('NEXT')}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition"
              title="Suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-semibold text-slate-800 ml-1 truncate">
              {monthYearTitle}
            </h2>
          </div>
        </div>

        {/* Center: Search in Calendar */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs relative mx-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Rechercher tournée, promoteur, local..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-full py-1.5 pl-9 pr-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-inner"
          />
        </div>

        {/* Right: Network Status, View Switcher & Individual Agent Profile */}
        <div className="flex items-center gap-2">
          {/* Offline / Online Sync Indicator */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-xs">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden xl:inline">En Ligne</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-800 font-bold text-[11px] animate-pulse">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Hors-Ligne ({offlineQueue.length})</span>
              </span>
            )}

            {/* Offline queue button */}
            {offlineQueue.length > 0 && (
              <button
                onClick={() => setIsOfflineQueueModalOpen(true)}
                className="ml-1 px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-mono-ref text-[10px] font-bold hover:bg-amber-300 transition"
                title="Voir la file d'attente hors-ligne"
              >
                {offlineQueue.length} en attente
              </button>
            )}

            {/* Manual Sync Button */}
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              title="Synchroniser immédiatement avec Supabase et la base centrale"
              className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-emerald-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Offline Simulator Switch (allows user to test offline work right away) */}
          <button
            onClick={() => {
              setIsSimulatedOffline(prev => !prev);
              triggerNotification(
                !isSimulatedOffline
                  ? 'Mode Hors-Ligne simulé activé. Vous pouvez tester les encaissements et convocations sans connexion !'
                  : 'Connexion réseau rétablie. Vos opérations en file locale vont être synchronisées.',
                !isSimulatedOffline ? 'warning' : 'success'
              );
            }}
            className={`hidden md:flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-semibold transition ${
              isSimulatedOffline
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Tester le mode déconnecté sur le terrain"
          >
            <WifiOff className="w-3 h-3" />
            <span>{isSimulatedOffline ? 'Simu Hors-Ligne ACTIF' : 'Simuler Hors-Ligne'}</span>
          </button>

          {/* Google Calendar View Switcher (Jour, Semaine, Mois, Planning) */}
          <select
            value={viewMode}
            onChange={e => setViewMode(e.target.value as any)}
            className="py-1 px-2.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none cursor-pointer"
          >
            <option value="JOUR">Jour</option>
            <option value="SEMAINE">Semaine</option>
            <option value="MOIS">Mois</option>
            <option value="PLANNING">Planning</option>
          </select>

          {/* INDIVIDUAL AGENT PROFILE BUTTON */}
          <button
            onClick={() => setIsAgentLoginModalOpen(true)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-100 hover:bg-slate-200 rounded-full border border-slate-300 transition text-left"
            title="Changer d'agent ou verrouiller l'accès"
          >
            <div className="w-7 h-7 rounded-full bg-[#006d2f] text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-400">
              {currentAgent.avatar}
            </div>
            <div className="leading-tight hidden sm:block">
              <span className="text-xs font-bold text-[#022448] block truncate max-w-[120px]">
                {currentAgent.name}
              </span>
              <span className="text-[9px] text-amber-800 font-mono-ref font-semibold block">
                {currentAgent.badge}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* ========================================================
          2. AGENT DAILY STATUS BANNER (Individual stats)
         ======================================================== */}
      <div className="bg-[#022448] text-white px-4 py-2 border-b border-[#033468] flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="font-bold text-amber-300">
            Espace Terrain Individuel :
          </span>
          <span className="font-extrabold text-white">
            {currentAgent.name}
          </span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono-ref text-slate-200">
            {currentAgent.role} • {currentAgent.zone}
          </span>
        </div>

        {/* Individual Daily Metrics */}
        <div className="flex items-center gap-4 text-[11px] font-mono-ref">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300">Encaissé Aujourd'hui :</span>
            <span className="font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
              {agentDailyStats.totalCollected.toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-300">Convocations émises :</span>
            <span className="font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded">
              {agentDailyStats.convocationsCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-300">Tournées restantes :</span>
            <span className="font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded">
              {agentDailyStats.pendingTournees}
            </span>
          </div>

          {/* Scope Toggle: Only Me / All Brigade */}
          <button
            onClick={() => setAgentScope(prev => prev === 'ONLY_ME' ? 'ALL_BRIGADE' : 'ONLY_ME')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
              agentScope === 'ONLY_ME'
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
            }`}
          >
            {agentScope === 'ONLY_ME' ? 'Mon planning seul' : 'Toute la brigade'}
          </button>
        </div>
      </div>

      {/* ========================================================
          3. MAIN BODY: LEFT GOOGLE SIDEBAR + CALENDAR VIEWPORT
         ======================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Google Calendar Controls (Collapsible) */}
        {isSidebarOpen && (
          <aside className="w-64 border-r border-slate-200 p-3 bg-white flex flex-col justify-between hidden md:flex shrink-0 overflow-y-auto select-none">
            <div className="space-y-4">
              {/* Giant "+ Créer" Google Calendar Button */}
              <div className="relative">
                <button
                  onClick={() => setIsCreateMenuOpen(prev => !prev)}
                  className="w-full bg-white hover:bg-slate-50 hover:shadow-md text-slate-700 border border-slate-200 py-2.5 px-4 rounded-full font-medium text-xs flex items-center gap-3 shadow-sm transition group"
                >
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 36 36">
                      <path fill="#4285F4" d="M16 16v14h4V16h14v-4H20V-2h-4v14H2v4h14z" />
                      <path fill="#FBBC05" d="M30 16H20l-4-4h14z" />
                      <path fill="#34A853" d="M16 30h4V20l-4-4z" />
                      <path fill="#EA4335" d="M20 16V2h-4l-4 4z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-slate-800">
                    Créer
                  </span>
                  <span className="ml-auto text-[10px] text-slate-400">▼</span>
                </button>

                {/* Dropdown Menu for Google Calendar Create */}
                {isCreateMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-40 text-xs">
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsConvocationModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-purple-50 text-purple-900 font-semibold flex items-center gap-2"
                    >
                      <FileCheck2 className="w-4 h-4 text-purple-700" />
                      <span>Convoquer un tenancier</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-[#006d2f] font-semibold flex items-center gap-2"
                    >
                      <Coins className="w-4 h-4 text-[#006d2f]" />
                      <span>Encaisser un acompte in situ</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsCreateEventModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 text-blue-900 font-semibold flex items-center gap-2"
                    >
                      <CalendarDays className="w-4 h-4 text-blue-700" />
                      <span>Planifier une tournée SAA</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsSoundMeterModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-amber-50 text-amber-900 font-semibold flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4 text-amber-700" />
                      <span>Mesure sonométrique (dB)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                <button
                  onClick={() => setIsConvocationModalOpen(true)}
                  className="p-2 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-1 transition shadow-2xs"
                  title="Délivrer une convocation contradictoire"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>Convoquer</span>
                </button>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="p-2 bg-emerald-50 text-[#006d2f] border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-1 transition shadow-2xs"
                  title="Encaisser un acompte in situ avec renouvellement N+1"
                >
                  <Coins className="w-3.5 h-3.5 text-[#006d2f]" />
                  <span>Encaisser</span>
                </button>
              </div>

              {/* Mini Interactive Month Calendar widget */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-bold text-slate-700">{monthYearTitle}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleNavigate('PREV')} className="p-0.5 text-slate-400 hover:text-slate-800">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleNavigate('NEXT')} className="p-0.5 text-slate-400 hover:text-slate-800">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-400 font-semibold mb-1">
                  <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[11px]">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `2026-09-${String(day).padStart(2, '0')}`;
                    const isSelected = dateStr === currentDateStr;
                    const hasEvents = events.some(e => e.date === dateStr && (agentScope === 'ALL_BRIGADE' || e.agentBadge === activeAgentBadge));
                    return (
                      <button
                        key={day}
                        onClick={() => setCurrentDateStr(dateStr)}
                        className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-medium transition ${
                          isSelected
                            ? 'bg-[#1a73e8] text-white font-bold'
                            : hasEvents
                            ? 'font-bold text-slate-900 hover:bg-slate-200'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* "Mes Agendas" / Color Filters */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mes Agendas de Brigade
                </span>
                <div className="space-y-1.5">
                  {[
                    { key: 'CONVOCATION', label: 'Convocations SAA', color: 'bg-purple-600' },
                    { key: 'ENCAISSEMENT_ACOMPTE', label: 'Acomptes & Recouvrements', color: 'bg-[#006d2f]' },
                    { key: 'RENOUVELLEMENT_ANNUEL', label: 'Renouvellements N+1', color: 'bg-amber-600' },
                    { key: 'NOTIFICATION_MISE_EN_DEMEURE', label: 'Mises en demeure (72h)', color: 'bg-red-600' },
                    { key: 'CONTROLE_ACOUSTIQUE', label: 'Contrôles acoustiques (<80dB)', color: 'bg-blue-600' },
                    { key: 'RECENSEMENT_IN_SITU', label: 'Recensements in situ', color: 'bg-cyan-600' }
                  ].map(cat => (
                    <label key={cat.key} className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-700 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={activeFilters[cat.key] !== false}
                        onChange={e =>
                          setActiveFilters(prev => ({ ...prev, [cat.key]: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0`} />
                      <span className="truncate">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick field tools */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsSoundMeterModalOpen(true)}
                  className="w-full text-left p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold flex items-center gap-2 transition"
                >
                  <Volume2 className="w-4 h-4 text-blue-700" />
                  <span>Sonomètre Numérique</span>
                </button>
                <button
                  onClick={() => setIsOfflineQueueModalOpen(true)}
                  className="w-full text-left p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-2 transition"
                >
                  <RefreshCw className="w-4 h-4 text-amber-700" />
                  <span>File d'attente ({offlineQueue.length})</span>
                </button>
              </div>
            </div>

            {/* Current Agent Badge Card at Bottom of Sidebar */}
            <div className="pt-3 border-t border-slate-200 text-xs bg-slate-50 p-2.5 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Agent Assermenté</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">ACTIF</span>
              </div>
              <p className="font-extrabold text-[#022448] text-xs">
                {currentAgent.name}
              </p>
              <p className="text-[10px] text-amber-800 font-mono-ref font-semibold">
                Matricule : {currentAgent.badge}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 truncate">
                {currentAgent.zone}
              </p>
            </div>
          </aside>
        )}

        {/* ========================================================
            4. CALENDAR MAIN VIEWPORT
           ======================================================== */}
        <main className="flex-1 overflow-y-auto bg-white flex flex-col">
          {/* Subheader / Day Title */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-[#022448]">
                {viewMode === 'SEMAINE' ? `Semaine du ${weekDays[0].dayNum} au ${weekDays[6].dayNum} ${monthYearTitle}` : formattedDateTitle}
              </h3>
              <span className="text-xs bg-blue-50 text-blue-800 font-mono-ref px-2 py-0.5 rounded font-bold">
                {currentDayEvents.length} intervention(s)
              </span>
            </div>

            {/* Mobile quick actions */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                onClick={() => setIsConvocationModalOpen(true)}
                className="p-1.5 bg-purple-600 text-white rounded text-xs font-bold"
              >
                Convoquer
              </button>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="p-1.5 bg-[#006d2f] text-white rounded text-xs font-bold"
              >
                Encaisser
              </button>
            </div>
          </div>

          {/* ----------------------------------------------------
              VIEW 1: VUE SEMAINE (Google Calendar 7-Day Time Grid)
             ---------------------------------------------------- */}
          {viewMode === 'SEMAINE' && (
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Day Header Columns */}
              <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 sticky top-0 z-20 text-xs">
                <div className="p-2 border-r border-slate-200 text-center font-bold text-slate-400 text-[10px]">
                  HEURE
                </div>
                {weekDays.map(wd => {
                  const isCurrent = wd.dateStr === currentDateStr;
                  return (
                    <div
                      key={wd.dateStr}
                      onClick={() => {
                        setCurrentDateStr(wd.dateStr);
                        setViewMode('JOUR');
                      }}
                      className={`p-2 border-r border-slate-200 text-center cursor-pointer transition ${
                        isCurrent ? 'bg-blue-50/80 font-bold text-blue-800' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-400">{wd.dayName}</div>
                      <div className={`text-base font-extrabold ${isCurrent ? 'text-[#1a73e8]' : 'text-slate-800'}`}>
                        {wd.dayNum}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hourly Rows Grid */}
              <div className="flex-1 divide-y divide-slate-100">
                {HOURS.map(hour => {
                  return (
                    <div key={hour} className="grid grid-cols-8 min-h-[64px] relative">
                      {/* Hour Label */}
                      <div className="p-1.5 border-r border-slate-200 text-right font-mono-ref text-[10px] text-slate-400 select-none">
                        {hour}
                      </div>

                      {/* 7 Columns for the 7 Days */}
                      {weekDays.map(wd => {
                        // Find events in this day and roughly this hour
                        const cellEvents = filteredEvents.filter(
                          e => e.date === wd.dateStr && e.timeStart.startsWith(hour.slice(0, 2))
                        );

                        return (
                          <div
                            key={wd.dateStr}
                            onClick={() => {
                              setCurrentDateStr(wd.dateStr);
                              setConvocationTime(hour);
                            }}
                            className="border-r border-slate-100 p-1 relative hover:bg-blue-50/20 transition cursor-pointer"
                          >
                            {cellEvents.map(evt => {
                              const style = getTypeStyle(evt.type);
                              const isRenewal = evt.type === 'RENOUVELLEMENT_ANNUEL';
                              return (
                                <div
                                  key={evt.id}
                                  onClick={e => {
                                    e.stopPropagation();
                                    setSelectedEvent(evt);
                                  }}
                                  className={`mb-1 p-1.5 rounded text-white text-[10px] leading-tight font-medium shadow-xs transition hover:brightness-110 cursor-pointer overflow-hidden ${style.bg}`}
                                  title={`${evt.timeStart} - ${evt.establishmentName} (${style.label})`}
                                >
                                  <div className="font-bold truncate flex items-center gap-1">
                                    {isRenewal && <Sparkles className="w-2.5 h-2.5 text-amber-200 shrink-0" />}
                                    <span>{evt.timeStart}</span>
                                    <span className="truncate">{evt.establishmentName}</span>
                                  </div>
                                  <div className="text-[8.5px] opacity-90 truncate">
                                    {evt.promoterName} • {evt.arrondissement.split(' ')[1] || evt.arrondissement}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              VIEW 2: VUE JOUR (Hourly Time Grid 07:00 - 20:00)
             ---------------------------------------------------- */}
          {viewMode === 'JOUR' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentDayEvents.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="font-semibold text-slate-600">Aucune intervention planifiée pour cette date.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Cliquez sur « Créer » pour programmer une inspection, convocation ou acompte.</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      onClick={() => setIsConvocationModalOpen(true)}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow inline-flex items-center gap-1.5"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Convoquer un Tenancier</span>
                    </button>
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="px-4 py-2 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold text-xs rounded-lg shadow inline-flex items-center gap-1.5"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Encaisser un Acompte</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-w-4xl mx-auto">
                  {currentDayEvents.map(evt => {
                    const style = getTypeStyle(evt.type);
                    const isRenewal = evt.type === 'RENOUVELLEMENT_ANNUEL';
                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`p-4 rounded-xl border-l-4 ${style.border} ${style.bgLight} border shadow-sm hover:shadow-md transition cursor-pointer relative group`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono-ref font-bold text-xs bg-white px-2 py-0.5 rounded border text-slate-700">
                              {evt.timeStart} - {evt.timeEnd}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${style.bg}`}>
                              {style.label}
                            </span>
                            {isRenewal && (
                              <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-700" />
                                <span>Renouvellement Annuel N+1</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                evt.status === 'EFFECTUE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : evt.status === 'EN_COURS'
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {evt.status === 'EFFECTUE' ? 'Terminé' : evt.status === 'EN_COURS' ? 'En Cours' : 'À Faire'}
                            </span>
                          </div>
                        </div>

                        {/* Establishment & Details */}
                        <div className="mt-2.5">
                          <h4 className="font-extrabold text-base text-[#022448]">
                            {evt.establishmentName}
                          </h4>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            Promoteur : <strong className="text-slate-800">{evt.promoterName}</strong> • Tél : <span className="font-mono-ref">{evt.phone}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{evt.quartier} ({evt.arrondissement}) — {evt.address}</span>
                          </p>
                        </div>

                        {/* Notes / Infractions */}
                        {evt.notes && (
                          <div className="mt-2.5 p-2 bg-white/80 rounded border border-slate-200/60 text-xs italic text-slate-700">
                            « {evt.notes} »
                          </div>
                        )}

                        {/* Quick action footer */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 font-mono-ref text-[11px]">
                            {evt.amountDue ? (
                              <span className="text-amber-800 font-bold">
                                Dû : {evt.amountDue.toLocaleString('fr-FR')} FCFA
                              </span>
                            ) : null}
                            {evt.decibelMeasure ? (
                              <span className="text-blue-800 font-bold">
                                {evt.decibelMeasure} dB
                              </span>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Call button */}
                            <a
                              href={`tel:${evt.phone.replace(/\s+/g, '')}`}
                              onClick={e => e.stopPropagation()}
                              className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                              title="Appeler le promoteur"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            {/* WhatsApp button */}
                            <a
                              href={`https://wa.me/${evt.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="p-1.5 bg-[#006d2f] text-white rounded hover:bg-[#005a26] transition"
                              title="Message WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            {evt.status !== 'EFFECTUE' && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleMarkEventDone(evt.id);
                                }}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow-sm"
                              >
                                <Check className="w-3 h-3" />
                                <span>Valider Fait</span>
                              </button>
                            )}

                            <span className="text-blue-600 group-hover:translate-x-0.5 transition font-bold text-xs flex items-center gap-1">
                              <span>Ouvrir Fiche</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------
              VIEW 3: VUE PLANNING (Agenda stream)
             ---------------------------------------------------- */}
          {viewMode === 'PLANNING' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
              {filteredEvents.map(evt => {
                const style = getTypeStyle(evt.type);
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="flex items-start gap-4 p-3.5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition cursor-pointer"
                  >
                    <div className="w-20 text-center shrink-0">
                      <span className="text-[10px] font-mono-ref font-bold text-slate-400 uppercase block">
                        {evt.date}
                      </span>
                      <span className="text-xs font-mono-ref font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {evt.timeStart}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${style.bg}`}>
                          {style.label}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#022448]">
                          {evt.establishmentName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {evt.promoterName} • {evt.arrondissement}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${evt.status === 'EFFECTUE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {evt.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ----------------------------------------------------
              VIEW 4: VUE MOIS (Standard Month Grid)
             ---------------------------------------------------- */}
          {viewMode === 'MOIS' && (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 py-1.5 border-b mb-1">
                <span>Lundi</span><span>Mardi</span><span>Mercredi</span><span>Jeudi</span><span>Vendredi</span><span>Samedi</span><span>Dimanche</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = (i % 30) + 1;
                  const dateStr = `2026-09-${String(dayNum).padStart(2, '0')}`;
                  const dayEvents = filteredEvents.filter(e => e.date === dateStr);
                  const isCurrent = dateStr === currentDateStr;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setCurrentDateStr(dateStr);
                        setViewMode('JOUR');
                      }}
                      className={`min-h-[90px] p-1.5 border rounded-lg transition cursor-pointer flex flex-col justify-between ${
                        isCurrent ? 'bg-blue-50/50 border-blue-400' : 'hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono-ref text-[11px] font-bold ${isCurrent ? 'text-blue-700 font-black' : 'text-slate-700'}`}>
                          {dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </div>

                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map(de => {
                          const style = getTypeStyle(de.type);
                          return (
                            <div
                              key={de.id}
                              className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded truncate text-white ${style.bg}`}
                            >
                              {de.timeStart} {de.establishmentName}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <span className="text-[8.5px] text-slate-500 font-semibold block text-center">
                            +{dayEvents.length - 2} autres
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          5. GOOGLE CALENDAR EVENT DETAIL MODAL (Card Opened upon click)
         ======================================================== */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 border border-slate-200 text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full ${getTypeStyle(selectedEvent.type).bg}`} />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {getTypeStyle(selectedEvent.type).label}
                  </span>
                  <h3 className="text-base font-extrabold text-[#022448] leading-tight">
                    {selectedEvent.establishmentName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time & Agent */}
            <div className="flex items-center gap-2 text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-lg border font-mono-ref">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{selectedEvent.date} • {selectedEvent.timeStart} - {selectedEvent.timeEnd}</span>
              <span className="ml-auto text-slate-500 font-bold">Agent: {selectedEvent.agentBadge}</span>
            </div>

            {/* Contact & Address */}
            <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-lg border">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Promoteur & Coordonnées</p>
                <p className="font-extrabold text-slate-800 text-sm">{selectedEvent.promoterName}</p>
                <p className="font-mono-ref text-slate-600">{selectedEvent.phone}</p>
              </div>

              {/* Call & WhatsApp Quick Buttons */}
              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${selectedEvent.phone.replace(/\s+/g, '')}`}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-center flex items-center justify-center gap-1 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appeler</span>
                </a>
                <a
                  href={`https://wa.me/${selectedEvent.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 bg-[#006d2f] hover:bg-[#005a26] text-white rounded font-bold text-center flex items-center justify-center gap-1 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="pt-2 border-t text-[11px] text-slate-600">
                <span className="font-bold">Adresse :</span> {selectedEvent.address} ({selectedEvent.arrondissement})
              </div>
            </div>

            {/* CRITICAL ANNUAL RENEWAL BANNER */}
            {selectedEvent.type === 'RENOUVELLEMENT_ANNUEL' && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 mb-4 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Renouvellement Annuel N+1 des Frais d'Exploitation</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Conformément à la réglementation DDL-PN, cet établissement a précédemment soldé la totalité de sa redevance. Son échéance de renouvellement annuel a été calculée et positionnée automatiquement à la date anniversaire de son premier acompte.
                </p>
              </div>
            )}

            {/* Actions for Field Agents */}
            <div className="space-y-2 pt-2 border-t">
              <div className="grid grid-cols-2 gap-2">
                {/* Encaisser Acompte */}
                <button
                  onClick={() => {
                    setTargetEstId(selectedEvent.establishmentId);
                    setPaymentAmount(selectedEvent.amountDue || 50000);
                    setIsPaymentModalOpen(true);
                  }}
                  className="p-2.5 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow"
                >
                  <Coins className="w-4 h-4" />
                  <span>Encaisser Acompte</span>
                </button>

                {/* Convoquer */}
                <button
                  onClick={() => {
                    setTargetEstId(selectedEvent.establishmentId);
                    setIsConvocationModalOpen(true);
                  }}
                  className="p-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Délivrer Convocation</span>
                </button>
              </div>

              {/* Pointage GPS & Acoustique */}
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <button
                  onClick={() => {
                    triggerNotification(`Pointage GPS in situ validé pour ${selectedEvent.establishmentName}. Coordonnées enregistrées dans la tournée.`, 'info');
                  }}
                  className="p-2 border hover:bg-slate-50 font-semibold rounded-lg flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pointage GPS</span>
                </button>

                <button
                  onClick={() => {
                    setIsSoundMeterModalOpen(true);
                  }}
                  className="p-2 border hover:bg-slate-50 font-semibold rounded-lg flex items-center justify-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mesure Sonore ({selectedEvent.decibelMeasure || 76} dB)</span>
                </button>
              </div>

              {/* Mark as Done */}
              {selectedEvent.status !== 'EFFECTUE' && (
                <button
                  onClick={() => handleMarkEventDone(selectedEvent.id)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Marquer la Tournée comme Effectuée</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. MODAL: ENCAISSEMENT ACOMPTE SUR LE TERRAIN
             (WITH GOLDEN ANNUAL RENEWAL RULE AUTOMATION)
         ======================================================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#006d2f] flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-[#006d2f]" />
                  <span>Encaissement d'Acompte Terrain & Reçu 58mm</span>
                </h3>
                <p className="text-[10px] text-slate-500">Régie Mobile SAA • Agent : {currentAgent.name}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Établissement payeur *</label>
                <select
                  value={targetEstId}
                  onChange={e => setTargetEstId(e.target.value)}
                  className="w-full p-2 border rounded font-semibold text-slate-800"
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} — Solde dû : {est.balance_due.toLocaleString('fr-FR')} FCFA ({est.arrondissement})
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const est = establishments.find(x => x.id === targetEstId);
                const isWillBeFullyPaid = est && paymentAmount >= est.balance_due;
                const firstDate = est?.first_payment_date || (est && est.amount_paid > 0 ? (est.identified_date || '2026-03-15') : currentDateStr);
                const [y, m, d] = firstDate.split('-');
                const renewalDateStr = `${parseInt(y, 10) + 1}-${m}-${d}`;

                return (
                  <>
                    {/* Financial Summary Box */}
                    {est && (
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1 text-[11px] font-mono-ref">
                        <div className="flex justify-between text-slate-600">
                          <span>Total redevance d'exploitation :</span>
                          <span className="font-bold">{est.total_due.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Acomptes déjà perçus :</span>
                          <span className="font-bold text-emerald-700">{est.amount_paid.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between text-amber-900 font-bold border-t pt-1">
                          <span>Solde résiduel actuel :</span>
                          <span className="font-extrabold text-amber-800">{est.balance_due.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[10px]">
                          <span>Date du 1er acompte versé :</span>
                          <span className="font-bold">{firstDate}</span>
                        </div>
                      </div>
                    )}

                    {/* Amount Input with Shortcuts */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Montant perçu sur le terrain (FCFA) *</label>
                      <input
                        type="number"
                        min="5000"
                        required
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(Number(e.target.value))}
                        className="w-full p-2.5 border-2 border-emerald-500 rounded-lg font-mono-ref font-extrabold text-lg text-[#006d2f] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {[25000, 50000, 100000, est?.balance_due].filter((v): v is number => !!v && v > 0).map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setPaymentAmount(amt)}
                            className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded text-[10px] font-mono-ref font-bold text-slate-700 border"
                          >
                            {amt === est?.balance_due ? `Solde total (${amt.toLocaleString('fr-FR')} F)` : `${amt.toLocaleString('fr-FR')} F`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Mode d'encaissement *</label>
                        <select
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value as any)}
                          className="w-full p-2 border rounded font-medium"
                        >
                          <option value="MTN Mobile Money">MTN Mobile Money (*105#)</option>
                          <option value="Airtel Money">Airtel Money (*128#)</option>
                          <option value="Espèces (Régie)">Espèces (Régie Mobile)</option>
                          <option value="Virement Trésor Public">Virement / Chèque Trésor</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Nom du payeur / Mandataire</label>
                        <input
                          type="text"
                          placeholder={est?.promoter_name || 'Nom du promoteur'}
                          value={payerName}
                          onChange={e => setPayerName(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>

                    {/* GOLDEN BUSINESS RULE ALERT BANNER */}
                    {isWillBeFullyPaid && (
                      <div className="p-3 bg-amber-50 border-2 border-amber-400 rounded-lg text-amber-950 text-[11px] space-y-1 shadow-sm">
                        <div className="font-black flex items-center gap-1.5 text-xs text-amber-900">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>RÈGLE DDL-PN : RENOUVELLEMENT ANNUEL AUTOMATIQUE N+1</span>
                        </div>
                        <p className="leading-snug">
                          Cet encaissement solde à 100% les frais d'exploitation de l'établissement.
                          Le renouvellement annuel de paiement sera automatiquement programmé le :
                        </p>
                        <div className="font-mono-ref font-black text-sm text-center py-1 bg-white border border-amber-300 rounded text-amber-950">
                          📅 {renewalDateStr} (date anniversaire du premier acompte)
                        </div>
                        <p className="text-[10px] text-amber-800 italic">
                          Un événement de renouvellement N+1 sera automatiquement injecté dans votre Google Agenda avec notification.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-1.5 border rounded font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded shadow flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Valider & Générer Quittance 58mm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          7. MODAL: DÉLIVRANCE DE CONVOCATION CONTRADICTOIRE
         ======================================================== */}
      {isConvocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h3 className="text-base font-extrabold text-purple-900 flex items-center gap-1.5">
                <FileCheck2 className="w-5 h-5 text-purple-700" />
                <span>Délivrance de Convocation Contradictoire</span>
              </h3>
              <button onClick={() => setIsConvocationModalOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleConfirmConvocation} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Établissement à convoquer *</label>
                <select
                  value={targetEstId}
                  onChange={e => setTargetEstId(e.target.value)}
                  className="w-full p-2 border rounded font-semibold text-slate-800"
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} — {est.promoter_name} ({est.arrondissement})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date de comparution *</label>
                  <input
                    type="date"
                    required
                    value={convocationDate}
                    onChange={e => setConvocationDate(e.target.value)}
                    className="w-full p-2 border rounded font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Heure de comparution *</label>
                  <input
                    type="time"
                    required
                    value={convocationTime}
                    onChange={e => setConvocationTime(e.target.value)}
                    className="w-full p-2 border rounded font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motif de la convocation *</label>
                <textarea
                  rows={3}
                  required
                  value={convocationMotif}
                  onChange={e => setConvocationMotif(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsConvocationModalOpen(false)}
                  className="px-3 py-1.5 border rounded font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded shadow flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Délivrer & Imprimer Convocation A4</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          8. MODAL: PROGRAMMER UNE TOURNÉE SAA DANS L'AGENDA
         ======================================================== */}
      {isCreateEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h3 className="text-base font-extrabold text-[#022448] flex items-center gap-1.5">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <span>Programmer une Tournée SAA</span>
              </h3>
              <button onClick={() => setIsCreateEventModalOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const est = establishments.find(x => x.id === targetEstId);
                if (!est) return;

                const form = e.currentTarget;
                const type = (form.elements.namedItem('eventType') as HTMLSelectElement).value as any;
                const date = (form.elements.namedItem('eventDate') as HTMLInputElement).value;
                const timeStart = (form.elements.namedItem('eventStart') as HTMLInputElement).value;
                const notes = (form.elements.namedItem('eventNotes') as HTMLInputElement).value;

                storageService.addAgentEvent({
                  agentId: currentAgent.badge,
                  agentName: currentAgent.name,
                  agentBadge: currentAgent.badge,
                  establishmentId: est.id,
                  establishmentName: est.name,
                  promoterName: est.promoter_name,
                  phone: est.phone,
                  arrondissement: est.arrondissement,
                  quartier: est.quartier,
                  address: est.address,
                  date,
                  timeStart,
                  timeEnd: '11:30',
                  type,
                  status: 'A_FAIRE',
                  priority: 'NORMALE',
                  amountDue: est.balance_due,
                  notes,
                  isSynced: isOnline
                });

                reloadEvents();
                setIsCreateEventModalOpen(false);
                triggerNotification(`Tournée enregistrée pour ${est.name} le ${date} à ${timeStart}.`, 'success');
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Établissement cible *</label>
                <select
                  value={targetEstId}
                  onChange={e => setTargetEstId(e.target.value)}
                  className="w-full p-2 border rounded font-semibold text-slate-800"
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} — {est.promoter_name} ({est.arrondissement})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Type d'intervention *</label>
                <select name="eventType" className="w-full p-2 border rounded font-bold text-[#022448]">
                  <option value="ENCAISSEMENT_ACOMPTE">Acompte / Encaissement In Situ</option>
                  <option value="CONVOCATION">Convocation Contradictoire SAA</option>
                  <option value="CONTROLE_ACOUSTIQUE">Contrôle Sonore & Limiteur Acoustique</option>
                  <option value="NOTIFICATION_MISE_EN_DEMEURE">Notification Mise en Demeure (72h)</option>
                  <option value="RECENSEMENT_IN_SITU">Recensement In Situ Nouveau Local</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    name="eventDate"
                    defaultValue={currentDateStr}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Heure de début *</label>
                  <input
                    type="time"
                    name="eventStart"
                    defaultValue="10:00"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instructions / Notes de brigade</label>
                <input
                  type="text"
                  name="eventNotes"
                  placeholder="Ex: Constat sonore ou vérification paiement 1er acompte"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateEventModalOpen(false)}
                  className="px-3 py-1.5 border rounded font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold rounded shadow"
                >
                  Ajouter au Google Agenda SAA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          9. MODAL: SONOMÈTRE NUMÉRIQUE DE BRIGADE (DÉCIBELMÈTRE)
         ======================================================== */}
      {isSoundMeterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 text-xs text-center">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h3 className="text-base font-extrabold text-blue-900 flex items-center gap-1.5">
                <Volume2 className="w-5 h-5 text-blue-600" />
                <span>Sonomètre Numérique de Brigade</span>
              </h3>
              <button onClick={() => setIsSoundMeterModalOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            {/* Decibel Gauge Circle */}
            <div className="my-4 p-6 bg-slate-900 text-white rounded-2xl shadow-inner border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                Pression Acoustique (dB SPL)
              </span>
              <div className="text-5xl font-black font-mono-ref tracking-tight text-white flex items-baseline gap-1">
                <span>{currentDecibels}</span>
                <span className="text-lg text-slate-400 font-bold">dB</span>
              </div>

              {/* Status pill */}
              <div className="mt-3">
                {currentDecibels <= 80 ? (
                  <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded-full font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Conforme Norme SAA (&lt; 80 dB)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-950 text-red-300 border border-red-600 rounded-full font-bold text-xs flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Infraction Nuisance Sonore (&gt; 80 dB)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Toggle live simulation */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setIsMeasuringSound(prev => !prev)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                  isMeasuringSound
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isMeasuringSound ? 'Arrêter la Mesure' : 'Capturer le Son Ambiant'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 mb-4 text-left bg-slate-50 p-2.5 rounded border leading-tight">
              <strong>Seuil Légal République du Congo :</strong> 80 dB en journée, 70 dB à partir de 22h00 pour les établissements sans sas phonique certifié.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsSoundMeterModalOpen(false)}
                className="px-3 py-1.5 border rounded font-semibold text-slate-600"
              >
                Fermer
              </button>
              {selectedEvent && (
                <button
                  type="button"
                  onClick={handleSaveDecibels}
                  className="px-4 py-1.5 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded shadow"
                >
                  Enregistrer sur la Tournée
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          10. MODAL: FILE D'ATTENTE HORS-LIGNE & SYNCHRONISATION
         ======================================================== */}
      {isOfflineQueueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div>
                <h3 className="text-base font-extrabold text-amber-900 flex items-center gap-1.5">
                  <WifiOff className="w-5 h-5 text-amber-600" />
                  <span>File d'Attente Hors-Ligne ({offlineQueue.length})</span>
                </h3>
                <p className="text-[10px] text-slate-500">Actions enregistrées sur ce smartphone en attente de réseau</p>
              </div>
              <button onClick={() => setIsOfflineQueueModalOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            {offlineQueue.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">Toutes les opérations sont synchronisées !</p>
                <p className="text-[11px] text-slate-500 mt-1">Aucune transaction en attente de transfert vers Supabase.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {offlineQueue.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-amber-800 uppercase text-[10px]">{item.action}</span>
                      <span className="text-[9px] font-mono-ref text-slate-400">{item.timestamp?.slice(11, 19)}</span>
                    </div>
                    <div className="text-[11px] mt-1 font-medium">
                      {item.payload?.establishment_name || item.payload?.establishmentName || 'Opération brigade'}
                    </div>
                    {item.payload?.amount && (
                      <div className="text-emerald-700 font-mono-ref font-bold text-[10px]">
                        {item.payload.amount.toLocaleString('fr-FR')} FCFA
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t mt-3">
              <button
                type="button"
                onClick={() => setIsOfflineQueueModalOpen(false)}
                className="px-3 py-1.5 border rounded font-semibold text-slate-600"
              >
                Fermer
              </button>
              {offlineQueue.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleSyncNow();
                    setIsOfflineQueueModalOpen(false);
                  }}
                  disabled={isSyncing}
                  className="px-4 py-1.5 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded shadow flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Synchroniser maintenant</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          11. MODAL: ACCÈS INDIVIDUEL PAR AGENT (PIN / PROFIL)
         ======================================================== */}
      {isAgentLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#022448] flex items-center gap-1.5">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span>Sélection de l'Agent de Brigade SAA</span>
                </h3>
                <p className="text-[10px] text-slate-500">Accès individuel au Google Agenda et carnet d'encaissement</p>
              </div>
              <button onClick={() => setIsAgentLoginModalOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            <div className="space-y-2">
              {FIELD_AGENTS.map(agent => {
                const isSelected = agent.badge === activeAgentBadge;
                return (
                  <div
                    key={agent.badge}
                    onClick={() => {
                      setActiveAgentBadge(agent.badge);
                      const matchedUser = APP_USERS.find(u => u.badge === agent.badge);
                      if (matchedUser) {
                        switchUserById(matchedUser.id);
                      }
                      setIsAgentLoginModalOpen(false);
                      triggerNotification(`Session agent activée pour ${agent.name} (${agent.badge}).`, 'success');
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-400'
                        : 'hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#006d2f] text-amber-300 font-extrabold text-sm flex items-center justify-center border border-amber-400 shrink-0">
                        {agent.avatar}
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-[#022448]">{agent.name}</p>
                        <p className="text-[11px] text-amber-800 font-mono-ref font-bold">{agent.badge} • {agent.role}</p>
                        <p className="text-[10px] text-slate-500">{agent.zone}</p>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <span className="px-2 py-1 bg-[#1a73e8] text-white font-bold text-[10px] rounded">
                          Connecté
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 font-bold text-[10px] rounded hover:bg-slate-200">
                          Choisir
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t mt-4 text-center text-[10px] text-slate-400">
              Chaque agent dispose de son propre planning de tournée, de son registre d'encaissement et de ses convocations contradictoires.
            </div>
          </div>
        </div>
      )}

      {/* Global Printable Document Modal */}
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
