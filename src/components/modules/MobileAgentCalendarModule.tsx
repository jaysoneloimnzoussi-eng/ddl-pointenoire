import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
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
  Smartphone,
  LayoutDashboard,
  Route,
  Building2,
  QrCode,
  FolderLock,
  CloudDownload
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { storageService } from '../../services/storageService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { AgentTourneeEvent, Establishment, TerrainPaymentRecord, AppUser, RegimeType } from '../../types';
import { APP_USERS, TERRITORIAL_REFERENTIAL } from '../../constants/referential';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';
import { OfficialRepublicLogo } from '../common/OfficialSeal';
import { OptimizedRouteModal } from './terrain/OptimizedRouteModal';
import { PromoterPublicPortalModal } from './terrain/PromoterPublicPortalModal';
import { AutomatedRemindersModal } from './terrain/AutomatedRemindersModal';
import { DocumentVaultModal } from './terrain/DocumentVaultModal';

// Liste officielle des agents du Service SAA (strictement issus de APP_USERS)
const FIELD_AGENTS = APP_USERS.filter(u => u.role === 'AGENT_SAA' || u.role === 'CHEF_SAA' || u.role === 'ADMIN' || u.role === 'DIRECTEUR').map(u => ({
  id: u.id,
  badge: u.badge,
  name: u.name,
  role: u.title,
  zone: u.role === 'ADMIN'
    ? 'Supervision Centrale SAA - Tous Arrondissements'
    : u.role === 'DIRECTEUR'
    ? 'Cabinet de Direction Départementale'
    : u.badge === 'SAA-PN-001'
    ? 'Supervision Centrale SAA - Tous Arrondissements'
    : u.badge === 'SAA-PN-008'
    ? 'Arrondissements 1 Lumumba & 2 Mvou-Mvou'
    : u.badge === 'SAA-PN-005'
    ? 'Arrondissements 3 Tié-Tié & 6 Ngoyo'
    : 'Arrondissements 4 Louandjili & 5 Mongo-Mpoukou',
  phone: u.phone,
  avatar: u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
  userRole: u.role
}));

export const MobileAgentCalendarModule: React.FC = () => {
  const { currentUser, setActiveModule, triggerNotification } = useSession();

  // Selected agent for private field session (defaults to current user if SAA, or first field agent)
  const [activeAgentBadge, setActiveAgentBadge] = useState<string>(() => {
    const found = FIELD_AGENTS.find(a => a.badge === currentUser.badge || a.name === currentUser.name || a.id === currentUser.id);
    return found ? found.badge : (FIELD_AGENTS[0]?.badge || 'SAA-PN-315');
  });

  useEffect(() => {
    const found = FIELD_AGENTS.find(a => a.badge === currentUser.badge || a.name === currentUser.name || a.id === currentUser.id);
    if (found) {
      setActiveAgentBadge(found.badge);
    }
  }, [currentUser]);

  const currentAgent = useMemo(() => {
    if (currentUser.role === 'AGENT_SAA') {
      const found = FIELD_AGENTS.find(a => a.badge === currentUser.badge || a.name === currentUser.name || a.id === currentUser.id);
      if (found) return found;
    }
    return FIELD_AGENTS.find(a => a.badge === activeAgentBadge) || FIELD_AGENTS[0];
  }, [currentUser, activeAgentBadge]);

  // Calendar Date State (Default date of exercise: 2026-10-02)
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-10-02');
  const [viewMode, setViewMode] = useState<'JOUR' | 'SEMAINE' | 'MOIS' | 'PLANNING'>('SEMAINE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Filter establishments strictly per agent (or all 117 for Admin)
  const establishments = useMemo(() => {
    return storageService.getEstablishmentsForUser(currentUser);
  }, [currentUser]);

  // Events from storage strictly filtered for this user
  const [events, setEvents] = useState<AgentTourneeEvent[]>(() => storageService.getAgentEventsForUser(currentUser));

  useEffect(() => {
    setEvents(storageService.getAgentEventsForUser(currentUser));
    const handleUpdate = () => {
      setEvents(storageService.getAgentEventsForUser(currentUser));
    };
    window.addEventListener('ddl_pn_data_updated', handleUpdate);
    return () => window.removeEventListener('ddl_pn_data_updated', handleUpdate);
  }, [currentUser]);

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
  const [isMiseEnDemeureModalOpen, setIsMiseEnDemeureModalOpen] = useState(false);
  const [isRegisterEstModalOpen, setIsRegisterEstModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSoundMeterModalOpen, setIsSoundMeterModalOpen] = useState(false);
  const [isOfflineQueueModalOpen, setIsOfflineQueueModalOpen] = useState(false);
  const [isAgentLoginModalOpen, setIsAgentLoginModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [selectedPortalEst, setSelectedPortalEst] = useState<Establishment | null>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [selectedVaultEst, setSelectedVaultEst] = useState<Establishment | null>(null);

  // Auto-hide completed today toggle (Automatic disappearance after payment)
  const [hideCompletedToday, setHideCompletedToday] = useState(true);

  // Mise en Demeure form states
  const [medEstId, setMedEstId] = useState<string>('');
  const [medDelaiJours, setMedDelaiJours] = useState<number>(3); // 3 (72h) or 8
  const [medMotif, setMedMotif] = useState<string>(
    'Non-respect réitéré des délais de versement des redevances d’exploitation des loisirs, absence de titre d’agrément officiel et défaut de conciliation.'
  );

  // New Establishment field registration states
  const [newEstForm, setNewEstForm] = useState({
    name: '',
    promoter_name: '',
    phone: '+242 06 ',
    arrondissement: '1_LUMUMBA' as any,
    quartier: 'Centre-Ville',
    address: '',
    activity_code: 'A2.1',
    regime_type: 'INFORMEL' as RegimeType,
    surface_m2: 60,
    total_due: 150000,
    programBureauPassage: true,
    bureauPassageDate: '2026-10-02',
    bureauPassageTime: '10:00',
    bureauPassageOffice: 'Bureau N° 3 — Service Assistance et Autorisation (SAA)',
    bureauPassageMotif: 'Présentation physique, régularisation administrative et dépôt du dossier d\'agrément'
  });

  // Form states
  const [targetEstId, setTargetEstId] = useState<string>(establishments[0]?.id || '');
  useEffect(() => {
    if (establishments.length > 0 && !establishments.some(e => e.id === targetEstId)) {
      setTargetEstId(establishments[0].id);
    }
  }, [establishments, targetEstId]);
  const [paymentAmount, setPaymentAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<TerrainPaymentRecord['payment_method']>('MTN Mobile Money');
  const [payerName, setPayerName] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('Encaissement direct in situ par les agents SAA');
  
  // Tenancière agreement and next installment appointment states
  const [scheduleNextRdv, setScheduleNextRdv] = useState<boolean>(true);
  const [nextAppointmentDate, setNextAppointmentDate] = useState<string>('2026-10-06');
  const [nextAppointmentTime, setNextAppointmentTime] = useState<string>('10:00');
  const [tenanciereAccord, setTenanciereAccord] = useState<string>(
    'Versement du solde convenu avec la tenancière après recette du week-end'
  );
  
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

  // Day Tournée Sheet Modal states
  const [isDaySheetModalOpen, setIsDaySheetModalOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState<string>('2026-10-02');
  const [daySheetActiveTab, setDaySheetActiveTab] = useState<'PROGRAMMES' | 'REPORTES' | 'SOLDE'>('PROGRAMMES');
  const [recentlyPostponedNotice, setRecentlyPostponedNotice] = useState<{
    name: string;
    oldDate: string;
    newDate: string;
    delayMonths: number;
    amountDue: number;
    timeStart: string;
  } | null>(null);

  // Postpone Modal states
  const [isPostponeModalOpen, setIsPostponeModalOpen] = useState(false);
  const [postponeEvent, setPostponeEvent] = useState<AgentTourneeEvent | null>(null);
  const [postponeNewDate, setPostponeNewDate] = useState<string>('2026-12-02');
  const [postponeNewTime, setPostponeNewTime] = useState<string>('10:00');
  const [postponeReason, setPostponeReason] = useState<string>('');

  const calculateEndTime = (start: string): string => {
    const [h, m] = (start || '10:00').split(':').map(Number);
    const endH = (h + 1) % 24;
    return `${String(endH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
  };

  const openPostponeModal = (evt: AgentTourneeEvent) => {
    setPostponeEvent(evt);
    // Default to +2 months as frequently requested by tenanciers
    const d = new Date(evt.date);
    d.setMonth(d.getMonth() + 2);
    setPostponeNewDate(d.toISOString().split('T')[0]);
    setPostponeNewTime(evt.timeStart || '10:00');
    setPostponeReason('Accord verbal avec le tenancier in situ pour passage dans 2 mois');
    setIsPostponeModalOpen(true);
  };

  const applyPostponePresetDays = (days: number) => {
    if (!postponeEvent) return;
    const d = new Date(postponeEvent.date);
    d.setDate(d.getDate() + days);
    setPostponeNewDate(d.toISOString().split('T')[0]);
    setPostponeReason(`Délai convenu avec le tenancier (+${days} jours) pour préparer le versement`);
  };

  const applyPostponePresetMonths = (months: number) => {
    if (!postponeEvent) return;
    const d = new Date(postponeEvent.date);
    d.setMonth(d.getMonth() + months);
    setPostponeNewDate(d.toISOString().split('T')[0]);
    if (months === 2) {
      setPostponeReason('Accord verbal avec le promoteur pour passage dans 2 mois (délai de trésorerie)');
    } else {
      setPostponeReason(`Report convenu d'accord parties (+${months} mois) avec le tenancier`);
    }
  };

  const handleConfirmPostpone = () => {
    if (!postponeEvent || !postponeNewDate) return;

    const oldDate = postponeEvent.date;
    const reasonText = postponeReason.trim() || 'Report convenu avec le tenancier in situ';
    const updatedNotes = `${postponeEvent.notes || ''} [Reporté du ${oldDate} au ${postponeNewDate}. Motif: ${reasonText}]`.trim();

    storageService.updateAgentEvent(postponeEvent.id, {
      date: postponeNewDate,
      timeStart: postponeNewTime,
      timeEnd: calculateEndTime(postponeNewTime),
      status: 'A_FAIRE',
      notes: updatedNotes
    });

    const refreshed = storageService.getAgentEventsForUser(currentUser);
    setEvents(refreshed);

    const oldD = new Date(oldDate);
    const newD = new Date(postponeNewDate);
    const diffDays = Math.round((newD.getTime() - oldD.getTime()) / (1000 * 60 * 60 * 24));
    const diffMonths = Math.max(1, Math.round(diffDays / 30));

    const estName = postponeEvent.establishmentName;
    const est = establishments.find(e => e.id === postponeEvent.establishmentId);
    const amountDue = (est?.balance_due ?? postponeEvent.amountDue) || 0;

    setRecentlyPostponedNotice({
      name: estName,
      oldDate,
      newDate: postponeNewDate,
      delayMonths: diffMonths,
      amountDue,
      timeStart: postponeNewTime
    });

    setIsPostponeModalOpen(false);
    setPostponeEvent(null);

    triggerNotification(
      `Le rendez-vous avec « ${estName} » a été reporté avec succès au ${postponeNewDate}. L'établissement a disparu du planning du ${oldDate} et réapparaîtra le ${postponeNewDate}.`,
      'success'
    );
  };

  const openPaymentForEst = (estId: string) => {
    setTargetEstId(estId);
    const est = establishments.find(x => x.id === estId);
    if (est) {
      setPaymentAmount(Math.min(50000, est.balance_due || 50000));
    }
    setIsPaymentModalOpen(true);
  };

  const handleOpenDaySheet = (dateStr: string) => {
    setSelectedDayDate(dateStr);
    setCurrentDateStr(dateStr);
    setIsDaySheetModalOpen(true);
  };

  // Filter mode: "ONLY_ME" (only current agent's events) or "ALL_AGENTS" (all team)
  const [agentScope, setAgentScope] = useState<'ONLY_ME' | 'ALL_AGENTS'>(() => {
    return (currentUser.role === 'ADMIN' || currentUser.role === 'DIRECTEUR') ? 'ALL_AGENTS' : 'ONLY_ME';
  });

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
      triggerNotification('Mode Hors-Ligne activé. Vos interventions sont sécurisées localement.', 'warning');
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
    setEvents(storageService.getAgentEventsForUser(currentUser));
    setOfflineQueue(storageService.getOfflineQueue());
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await storageService.flushOfflineQueue();
      reloadEvents();
      if (!isSupabaseConfigured) {
        triggerNotification('Mode local autonome : vos tournées et dossiers sont sauvegardés en mémoire sécurisée.', 'info');
      } else if (res && !res.success) {
        triggerNotification(`Mode local de secours : ${res.message}`, 'warning');
      } else {
        triggerNotification('Synchronisation 100% réussie avec le serveur Supabase et la base centrale DDL-PN.', 'success');
      }
    } catch {
      triggerNotification('Données enregistrées localement avec succès.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered Events strictly isolated for field agents
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // For AGENT_SAA: strictly their own events
      if (currentUser.role === 'AGENT_SAA') {
        const matchAgent =
          evt.agentBadge === currentUser.badge ||
          evt.agentId === currentUser.id ||
          evt.agentName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]);
        if (!matchAgent) return false;
      } else {
        // For Admin: respect agentScope selection
        if (agentScope !== 'ALL_AGENTS') {
          const matchAgent =
            evt.agentBadge === activeAgentBadge ||
            evt.agentId === activeAgentBadge;
          if (!matchAgent) return false;
        }
      }

      // Type filter
      const matchType = activeFilters[evt.type] !== false;

      // Search filter
      const matchSearch =
        !searchQuery ||
        evt.establishmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.promoterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.quartier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.phone.includes(searchQuery);

      return matchType && matchSearch;
    });
  }, [events, currentUser, activeAgentBadge, agentScope, activeFilters, searchQuery]);

  // Events of the current day (with automatic disappearance of completed tournées once acompte is paid)
  const currentDayEvents = useMemo(() => {
    return filteredEvents
      .filter(e => e.date === currentDateStr)
      .filter(e => !hideCompletedToday || e.status !== 'EFFECTUE')
      .sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  }, [filteredEvents, currentDateStr, hideCompletedToday]);

  const completedTodayEvents = useMemo(() => {
    return filteredEvents
      .filter(e => e.date === currentDateStr && e.status === 'EFFECTUE');
  }, [filteredEvents, currentDateStr]);

  // Agent daily statistics
  const agentDailyStats = useMemo(() => {
    const todayEvents = events.filter(e => e.date === currentDateStr && (agentScope === 'ALL_AGENTS' || e.agentBadge === activeAgentBadge));
    const allPayments = storageService.getPayments();
    const todayPayments = allPayments.filter(p => p.record_date === currentDateStr && (agentScope === 'ALL_AGENTS' || p.agent_badge === activeAgentBadge));
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
      setCurrentDateStr('2026-10-02');
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
          label: 'Intervention SAA'
        };
    }
  };

  // Perform Encaissement d'acompte on the field
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEstId) return;

    const est = establishments.find(x => x.id === targetEstId);
    if (!est) return;

    const remainingAfterThis = Math.max(0, est.balance_due - Number(paymentAmount));

    const result = storageService.recordPayment({
      establishment_id: est.id,
      amount: Number(paymentAmount),
      payment_method: paymentMethod,
      collected_by: currentAgent.name,
      agent_badge: currentAgent.badge,
      notes: paymentNotes || `Acompte négocié et perçu in situ par ${currentAgent.name}`
    });

    // 1. Mark existing event(s) for this establishment on the current date as EFFECTUE
    const matchingTodayEvents = events.filter(
      evt => evt.establishmentId === est.id && evt.date === currentDateStr && evt.status !== 'EFFECTUE'
    );
    matchingTodayEvents.forEach(evt => {
      storageService.updateAgentEvent(evt.id, {
        status: 'EFFECTUE',
        amountCollected: Number(paymentAmount),
        notes: `${evt.notes || ''} [Acompte perçu in situ le ${currentDateStr} : ${Number(paymentAmount).toLocaleString('fr-FR')} FCFA. Prochain RDV solde : ${nextAppointmentDate || 'N/A'}]`
      });
    });

    if (selectedEvent && selectedEvent.establishmentId === est.id) {
      storageService.updateAgentEvent(selectedEvent.id, {
        status: 'EFFECTUE',
        amountCollected: Number(paymentAmount)
      });
      setSelectedEvent(null);
    }

    // 2. Schedule next appointment if balance remains and agreement was reached with tenancière
    if (remainingAfterThis > 0 && scheduleNextRdv && nextAppointmentDate) {
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
        date: nextAppointmentDate,
        timeStart: nextAppointmentTime || '10:00',
        timeEnd: '11:00',
        type: 'ENCAISSEMENT_ACOMPTE',
        status: 'A_FAIRE',
        priority: 'HAUTE',
        amountDue: remainingAfterThis,
        notes: `Rendez-vous convenu avec la tenancière : ${tenanciereAccord}. Reste à percevoir : ${remainingAfterThis.toLocaleString('fr-FR')} FCFA.`,
        isSynced: isOnline
      });

      // Synchronize directly into Supabase rendezvous table only if configured
      if (isSupabaseConfigured) {
        Promise.resolve(
          supabase.from('rendezvous').insert({
            establishment_id: est.id,
            establishment_name: est.name,
            promoter_name: est.promoter_name,
            promoter_phone: est.phone,
            district: est.arrondissement,
            address: est.address,
            date: nextAppointmentDate,
            time: nextAppointmentTime || '10:00',
            motif: 'Paiement solde / acompte fixé avec la tenancière',
            status: 'CONFIRME',
            next_action_type: 'ENCAISSEMENT_ACOMPTE',
            installment_amount: remainingAfterThis,
            remaining_after: 0,
            notes: tenanciereAccord,
            assigned_agent_badge: currentAgent.badge,
            assigned_agent_name: currentAgent.name
          })
        ).then(({ error }) => {
          if (error) console.info('[Supabase] Rendezvous insert note:', error.message);
        }).catch(() => {
          // offline mode
        });
      }
    }

    reloadEvents();
    setIsPaymentModalOpen(false);

    // Notifications
    if (result.renewalEvent) {
      triggerNotification(
        `⭐ RÈGLE DDL-PN APPLIQUÉE : Redevance intégralement soldée ! Le renouvellement annuel (N+1) des frais d'exploitation a été automatiquement programmé au ${result.renewalEvent.date} dans votre Google Agenda SAA.`,
        'success'
      );
    } else if (remainingAfterThis > 0 && scheduleNextRdv && nextAppointmentDate) {
      triggerNotification(
        `🎉 Acompte de ${Number(paymentAmount).toLocaleString('fr-FR')} FCFA validé ! ${est.name} a disparu de vos tournées du jour et réapparaîtra automatiquement sur votre Google Agenda le ${nextAppointmentDate} à ${nextAppointmentTime || '10:00'} pour le versement du solde (${remainingAfterThis.toLocaleString('fr-FR')} FCFA).`,
        'success'
      );
    } else {
      triggerNotification(
        `Acompte de ${Number(paymentAmount).toLocaleString('fr-FR')} FCFA validé. Reçu N° ${result.payment.receipt_reference}. Reste dû : ${result.establishment.balance_due.toLocaleString('fr-FR')} FCFA.`,
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
        next_due_date: remainingAfterThis > 0 && scheduleNextRdv ? nextAppointmentDate : undefined,
        next_appointment_notes: remainingAfterThis > 0 && scheduleNextRdv ? tenanciereAccord : undefined,
        annual_renewal_scheduled_date: result.establishment.annual_renewal_date
      }
    });
  };

  // Perform Mise en Demeure for insolvable establishments
  const handleDeliverMiseEnDemeure = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = medEstId || targetEstId;
    const est = establishments.find(x => x.id === targetId);
    if (!est) return;

    const matchedUser: AppUser = {
      id: currentAgent.badge,
      name: currentAgent.name,
      badge: currentAgent.badge,
      role: (currentAgent as any).userRole || 'AGENT_SAA',
      title: currentAgent.role,
      service: 'Service Assistance et Autorisation (SAA)',
      phone: currentAgent.phone,
      email: `${currentAgent.badge.toLowerCase()}@ddlpn.gouv.cg`
    };

    const result = storageService.miseEnDemeureEstablishment({
      establishment_id: est.id,
      delaiJours: medDelaiJours,
      motif: medMotif,
      agent: matchedUser
    });

    reloadEvents();
    setIsMiseEnDemeureModalOpen(false);
    triggerNotification(
      `⚖️ Mise en Demeure N° ${result.act.reference_number} (${medDelaiJours === 3 ? '72h' : 'Huitaine'}) délivrée ! Échéance positionnée au ${result.event.date} sur l'Agenda.`,
      'warning'
    );

    setPrintDoc({
      isOpen: true,
      type: 'ACTE_JURIDIQUE_A4',
      title: `Mise en Demeure Officielle - ${result.act.reference_number}`,
      data: result.act
    });
  };

  // Register New Establishment directly from Google Agenda
  const handleRegisterNewEstablishment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstForm.name.trim()) {
      triggerNotification('Veuillez renseigner le nom de l’établissement.', 'error');
      return;
    }

    const arrInfo = TERRITORIAL_REFERENTIAL.find(a => a.code === newEstForm.arrondissement);
    const coords: [number, number] = arrInfo?.sig_coordinates || [-4.7938, 11.8569];
    const totalDue = Number(newEstForm.total_due) || 150000;

    const createdEst = storageService.addEstablishment({
      name: newEstForm.name.trim(),
      promoter_name: newEstForm.promoter_name.trim() || 'Promoteur non renseigné',
      phone: newEstForm.phone.trim(),
      arrondissement: newEstForm.arrondissement,
      quartier: newEstForm.quartier,
      address: newEstForm.address.trim() || `${newEstForm.quartier}, Pointe-Noire`,
      activity_type: newEstForm.activity_code.startsWith('A1') ? 'Loisirs Nocturnes & Festifs' : 'Loisirs Diurnes & Récréatifs',
      activity_code: newEstForm.activity_code,
      regime_type: newEstForm.regime_type,
      surface_m2: Number(newEstForm.surface_m2) || 60,
      filing_fee: 50000,
      rate_per_sqm: newEstForm.regime_type === 'FORMEL' ? 1000 : 0,
      total_due: totalDue,
      amount_paid: 0,
      balance_due: totalDue,
      status: newEstForm.programBureauPassage ? 'convoque' : 'identifie',
      identified_by: `${currentAgent.name} (${currentAgent.badge})`,
      identified_date: new Date().toISOString().split('T')[0],
      coordinates: coords,
      decibel_level: 78,
      has_acoustic_limiter: false,
      installments_chosen: 2,
      assigned_agent_id: currentAgent.badge,
      notes: 'Recensement direct Google Agenda SAA'
    });

    // If programBureauPassage is checked, create convocation event on Google Agenda
    if (newEstForm.programBureauPassage) {
      const matchedUser: AppUser = {
        id: currentAgent.badge,
        name: currentAgent.name,
        badge: currentAgent.badge,
        role: (currentAgent as any).userRole || 'AGENT_SAA',
        title: currentAgent.role,
        service: 'Service Assistance et Autorisation (SAA)',
        phone: currentAgent.phone,
        email: `${currentAgent.badge.toLowerCase()}@ddlpn.gouv.cg`
      };

      const result = storageService.convoquerEstablishment({
        establishment_id: createdEst.id,
        date: newEstForm.bureauPassageDate,
        timeStart: newEstForm.bureauPassageTime,
        motif: `Convocation nouvellement recensé : ${newEstForm.bureauPassageMotif} (${newEstForm.bureauPassageOffice})`,
        agent: matchedUser
      });

      setPrintDoc({
        isOpen: true,
        type: 'ACTE_JURIDIQUE_A4',
        title: `Convocation de Présentation au Bureau - ${result.act.reference_number}`,
        data: result.act
      });

      triggerNotification(
        `✅ Nouvel établissement "${createdEst.name}" enregistré ! Convocation pour comparution au bureau programmée au ${newEstForm.bureauPassageDate} à ${newEstForm.bureauPassageTime}.`,
        'success'
      );
    } else {
      triggerNotification(
        `✅ Nouvel établissement "${createdEst.name}" recensé et enregistré avec succès sur le terrain !`,
        'success'
      );
    }

    reloadEvents();
    setIsRegisterEstModalOpen(false);
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
      service: 'Service Assistance et Autorisation (SAA)',
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
    triggerNotification('Intervention SAA validée et enregistrée in situ.', 'success');
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

  // Dynamic Month days computation
  const monthDays = useMemo(() => {
    const curr = new Date(currentDateStr);
    const year = curr.getFullYear();
    const month = curr.getMonth(); // 0-indexed

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      cells.push({
        dateStr: prevDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(year, month, d);
      const dateStr = currDate.toISOString().split('T')[0];
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === currentDateStr
      });
    }

    // Next month padding to fill grid (35 or 42 cells)
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      cells.push({
        dateStr: nextDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return cells;
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
                {new Date(currentDateStr).toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase()}
              </div>
              <div className="text-[#1a73e8] font-black text-sm leading-none pt-0.5">
                {new Date(currentDateStr).getDate()}
              </div>
            </div>
            <div className="leading-tight hidden sm:block">
              <span className="text-base font-medium text-slate-800 tracking-tight flex items-center gap-1.5">
                <span className="font-semibold text-slate-900">Google Agenda</span>
                <span className="text-[10px] bg-blue-100 text-blue-900 font-mono-ref px-1.5 py-0.5 rounded font-extrabold">
                  SERVICE SAA
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

          {/* Google Calendar Cloud Sync / Transfer Button */}
          <button
            onClick={() => setActiveModule('MOD-04')}
            className="px-2.5 py-1.5 rounded-md text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            title="Transférer tous les établissements et rendez-vous depuis Google Calendar"
          >
            <CloudDownload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Transférer depuis Google Agenda</span>
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

          {/* INDIVIDUAL AGENT PROFILE BADGE / SUPERVISION FILTER */}
          {currentUser.role === 'ADMIN' || currentUser.role === 'DIRECTEUR' ? (
            <button
              onClick={() => setIsAgentLoginModalOpen(true)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-100 hover:bg-slate-200 rounded-full border border-slate-300 transition text-left cursor-pointer"
              title="Superviser un autre agent SAA"
            >
              <div className="w-7 h-7 rounded-full bg-[#006d2f] text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-400">
                {currentAgent.avatar}
              </div>
              <div className="leading-tight hidden sm:block">
                <span className="text-xs font-bold text-[#022448] block truncate max-w-[120px]">
                  {currentAgent.name}
                </span>
                <span className="text-[9px] text-amber-800 font-mono-ref font-semibold block">
                  {currentAgent.badge} (Supervision)
                </span>
              </div>
            </button>
          ) : (
            <div
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-100 rounded-full border border-slate-300 text-left select-none"
              title="Session Agent Assermenté active"
            >
              <div className="w-7 h-7 rounded-full bg-[#006d2f] text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-400">
                {currentAgent.avatar}
              </div>
              <div className="leading-tight hidden sm:block">
                <span className="text-xs font-bold text-[#022448] block truncate max-w-[120px]">
                  {currentAgent.name}
                </span>
                <span className="text-[9px] text-amber-800 font-mono-ref font-semibold block">
                  {currentAgent.badge} • Assermenté
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================
          2. AGENT DAILY STATUS BANNER (Individual stats + Admin switch)
         ======================================================== */}
      <div className="bg-[#022448] text-white px-4 py-2 border-b border-[#033468] flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="font-bold text-amber-300">
            {currentUser.role === 'ADMIN' ? '👑 Supervision Centrale Administrateur :' : 'Espace Terrain Privé :'}
          </span>
          <span className="font-extrabold text-white">
            {currentUser.name}
          </span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono-ref text-slate-200">
            {establishments.length} établissement{establishments.length > 1 ? 's' : ''} géré{establishments.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Individual Daily Metrics & Admin Switch */}
        <div className="flex items-center gap-3 text-[11px] font-mono-ref">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300">Encaissé Aujourd'hui :</span>
            <span className="font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
              {agentDailyStats.totalCollected.toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-300">Convocations :</span>
            <span className="font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded">
              {agentDailyStats.convocationsCount}
            </span>
          </div>

          {/* New Powerful Tools: Route Optimization & WhatsApp Reminders */}
          <button
            type="button"
            onClick={() => setIsRouteModalOpen(true)}
            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded-lg text-xs flex items-center gap-1 border border-emerald-400/40 transition cursor-pointer"
            title="Calculer l'itinéraire le plus court par quartier pour aujourd'hui"
          >
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Itinéraire GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRemindersModalOpen(true)}
            className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold rounded-lg text-xs flex items-center gap-1 border border-purple-400/40 transition cursor-pointer"
            title="Envoyer les rappels automatiques WhatsApp et SMS aux tenanciers (48h)"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Relances 48h</span>
          </button>

          {currentUser.role === 'ADMIN' ? (
            <>
              {/* Scope Toggle: Agent individuel / Tous les agents (Only for Admin) */}
              <button
                onClick={() => setAgentScope(prev => prev === 'ONLY_ME' ? 'ALL_AGENTS' : 'ONLY_ME')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  agentScope === 'ONLY_ME'
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
                }`}
              >
                {agentScope === 'ONLY_ME' ? 'Vue Agent individuel' : 'Supervision Tous les agents'}
              </button>

              <button
                type="button"
                onClick={() => setActiveModule('MOD-01')}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-lg text-xs flex items-center gap-1 border border-amber-400/40 transition cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Commandement (MOD-01)</span>
              </button>
            </>
          ) : null}
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
                        setIsRegisterEstModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-[#006d2f] font-bold flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-[#006d2f]" />
                      <span>+ Recenser Nouvel Établissement</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-slate-800 font-semibold flex items-center gap-2"
                    >
                      <Coins className="w-4 h-4 text-[#006d2f]" />
                      <span>Encaisser un acompte in situ</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsMiseEnDemeureModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-900 font-semibold flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-red-700" />
                      <span>Mise en Demeure (Insolvable / 72h)</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsConvocationModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-purple-50 text-purple-900 font-semibold flex items-center gap-2"
                    >
                      <FileCheck2 className="w-4 h-4 text-purple-700" />
                      <span>Convoquer un tenancier au bureau</span>
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
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                <button
                  onClick={() => setIsRegisterEstModalOpen(true)}
                  className="p-1.5 bg-emerald-50 text-[#006d2f] border border-emerald-200 rounded-lg hover:bg-emerald-100 flex flex-col items-center justify-center gap-0.5 transition shadow-2xs"
                  title="Enregistrer un nouvel établissement et programmer sa présentation au bureau"
                >
                  <Plus className="w-3.5 h-3.5 text-[#006d2f]" />
                  <span>+ Nouveau</span>
                </button>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg hover:bg-amber-100 flex flex-col items-center justify-center gap-0.5 transition shadow-2xs"
                  title="Encaisser un acompte in situ"
                >
                  <Coins className="w-3.5 h-3.5 text-[#006d2f]" />
                  <span>Acompte</span>
                </button>
                <button
                  onClick={() => setIsMiseEnDemeureModalOpen(true)}
                  className="p-1.5 bg-red-50 text-red-900 border border-red-200 rounded-lg hover:bg-red-100 flex flex-col items-center justify-center gap-0.5 transition shadow-2xs"
                  title="Mise en demeure pour espace insolvable"
                >
                  <Shield className="w-3.5 h-3.5 text-red-700" />
                  <span>Demeure</span>
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
                  {monthDays.map((cell, i) => {
                    const isSelected = cell.dateStr === currentDateStr;
                    const dayEvents = events.filter(e => e.date === cell.dateStr && (agentScope === 'ALL_AGENTS' || e.agentBadge === activeAgentBadge));
                    const hasEvents = dayEvents.length > 0;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleOpenDaySheet(cell.dateStr)}
                        title={`${cell.dateStr} : ${dayEvents.length} établissement(s) programmé(s)`}
                        className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-medium transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#1a73e8] text-white font-bold ring-2 ring-blue-300'
                            : hasEvents && cell.isCurrentMonth
                            ? 'font-extrabold text-blue-900 bg-blue-100/70 hover:bg-blue-200'
                            : cell.isCurrentMonth
                            ? 'text-slate-700 hover:bg-slate-200'
                            : 'text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>{cell.dayNum}</span>
                        {hasEvents && !isSelected && (
                          <span className="w-1 h-1 bg-blue-600 rounded-full absolute bottom-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* "Mes Agendas" / Color Filters */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Agendas du Service SAA
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
                  onClick={() => setIsRouteModalOpen(true)}
                  className="w-full text-left p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2 transition"
                >
                  <Route className="w-4 h-4 text-emerald-700" />
                  <span>Itinéraire Optimisé GPS</span>
                </button>
                <button
                  onClick={() => setIsRemindersModalOpen(true)}
                  className="w-full text-left p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4 text-purple-700" />
                  <span>Relances WhatsApp (48h)</span>
                </button>
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
          <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-[#022448]">
                {viewMode === 'SEMAINE' ? `Semaine du ${weekDays[0].dayNum} au ${weekDays[6].dayNum} ${monthYearTitle}` : formattedDateTitle}
              </h3>
              <span className="text-xs bg-blue-50 text-blue-800 font-mono-ref px-2 py-0.5 rounded font-bold">
                {currentDayEvents.length} active(s)
              </span>

              {/* Auto disappearance toggle button */}
              <button
                type="button"
                onClick={() => setHideCompletedToday(prev => !prev)}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                  hideCompletedToday
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Lorsque l'agent encaisse un acompte, l'établissement disparaît de la journée en cours et réapparaît au jour convenu pour le solde."
              >
                <span className={`w-2 h-2 rounded-full ${hideCompletedToday ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>
                  {hideCompletedToday
                    ? `Disparition auto après acompte : ACTIF (${completedTodayEvents.length} soldé/masqué)`
                    : `Afficher aussi les ${completedTodayEvents.length} tournée(s) déjà encaissée(s)`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenDaySheet(currentDateStr)}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#022448] hover:bg-[#003870] text-amber-300 rounded-full text-xs font-black shadow-xs transition cursor-pointer"
                title="Ouvrir la feuille de tournée journalière complète avec listing des montants et reports"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Feuille de Tournée ({currentDayEvents.length})</span>
              </button>
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
                      onClick={() => handleOpenDaySheet(wd.dateStr)}
                      className={`p-2 border-r border-slate-200 text-center cursor-pointer transition ${
                        isCurrent ? 'bg-blue-50/80 font-bold text-blue-800' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="Cliquer pour afficher la liste des établissements de ce jour"
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

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                openPaymentForEst(evt.establishmentId);
                              }}
                              className="px-2.5 py-1 bg-[#006d2f] hover:bg-[#005a26] text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                            >
                              <Coins className="w-3 h-3" />
                              <span>Encaisser</span>
                            </button>

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                openPostponeModal(evt);
                              }}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-xs font-black flex items-center gap-1 shadow-xs transition cursor-pointer"
                              title="Reporter ce rendez-vous d'accord parties avec le tenancier"
                            >
                              <Clock className="w-3 h-3 text-slate-950" />
                              <span>Reporter</span>
                            </button>

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
                {monthDays.map((cell, i) => {
                  const dayEvents = filteredEvents.filter(e => e.date === cell.dateStr);
                  const isCurrent = cell.dateStr === currentDateStr;
                  const dayTotalDue = dayEvents.reduce((sum, e) => {
                    const est = establishments.find(x => x.id === e.establishmentId);
                    return sum + ((est?.balance_due ?? e.amountDue) || 0);
                  }, 0);

                  return (
                    <div
                      key={i}
                      onClick={() => handleOpenDaySheet(cell.dateStr)}
                      className={`min-h-[96px] p-2 border rounded-xl transition cursor-pointer flex flex-col justify-between group ${
                        isCurrent
                          ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-400'
                          : cell.isCurrentMonth
                          ? 'hover:bg-slate-50 hover:border-slate-300 border-slate-200 bg-white'
                          : 'bg-slate-50/50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono-ref text-[11px] font-bold ${
                            isCurrent
                              ? 'text-blue-700 font-black'
                              : cell.isCurrentMonth
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {cell.dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-100 text-blue-900 font-mono-ref">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Events chips in cell */}
                      <div className="space-y-1 my-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map(de => {
                          const style = getTypeStyle(de.type);
                          return (
                            <div
                              key={de.id}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate text-white ${style.bg}`}
                              title={`${de.timeStart} ${de.establishmentName}`}
                            >
                              {de.timeStart} {de.establishmentName}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <span className="text-[8.5px] text-slate-500 font-bold block text-center">
                            +{dayEvents.length - 2} autres
                          </span>
                        )}
                      </div>

                      {/* Bottom financial summary indicator if events */}
                      {dayTotalDue > 0 && (
                        <div className="text-[8.5px] font-bold text-amber-800 font-mono-ref truncate border-t border-slate-100 pt-0.5">
                          {(dayTotalDue / 1000).toFixed(0)}k F dû
                        </div>
                      )}
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
              <div className="grid grid-cols-3 gap-2">
                {/* Encaisser Acompte */}
                <button
                  onClick={() => {
                    setTargetEstId(selectedEvent.establishmentId);
                    setPaymentAmount(selectedEvent.amountDue || 50000);
                    setIsPaymentModalOpen(true);
                  }}
                  className="p-2 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow text-xs"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Encaisser</span>
                </button>

                {/* Convoquer */}
                <button
                  onClick={() => {
                    setTargetEstId(selectedEvent.establishmentId);
                    setIsConvocationModalOpen(true);
                  }}
                  className="p-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow text-xs"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Convoquer</span>
                </button>

                {/* Mise en Demeure */}
                <button
                  onClick={() => {
                    setMedEstId(selectedEvent.establishmentId);
                    setIsMiseEnDemeureModalOpen(true);
                  }}
                  className="p-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow text-xs"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-300" />
                  <span>Mise en Demeure</span>
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

              {/* Portal & GED Buttons */}
              <div className="grid grid-cols-2 gap-2 text-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const est = establishments.find(e => e.id === selectedEvent.establishmentId);
                    if (est) {
                      setSelectedPortalEst(est);
                      setIsPortalModalOpen(true);
                    }
                  }}
                  className="p-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-950" />
                  <span>Portail Tenancier (MoMo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const est = establishments.find(e => e.id === selectedEvent.establishmentId);
                    if (est) {
                      setSelectedVaultEst(est);
                      setIsVaultModalOpen(true);
                    }
                  }}
                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold border border-blue-200 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <FolderLock className="w-3.5 h-3.5 text-blue-700" />
                  <span>Coffre-Fort GED</span>
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

                    {/* TENANCIÈRE INSTALLMENT AGREEMENT & NEXT RENDEZ-VOUS */}
                    {!isWillBeFullyPaid && (
                      <div className="p-3.5 bg-emerald-50/90 border-2 border-emerald-500 rounded-xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-black text-xs text-emerald-950">
                            <Calendar className="w-4 h-4 text-emerald-700" />
                            <span>Accord Tenancière & Prochain Rendez-vous</span>
                          </div>
                          <span className="font-mono-ref font-extrabold text-xs text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">
                            Nouveau reste : {Math.max(0, (est?.balance_due || 0) - paymentAmount).toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>

                        <p className="text-[11px] text-emerald-900 leading-snug">
                          Comme la tenancière paie par acomptes échelonnés, fixez avec elle la date et l'heure de votre prochain passage pour percevoir le solde.
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-800 block mb-1 text-[11px]">
                              Date fixée avec la tenancière *
                            </label>
                            <input
                              type="date"
                              required={scheduleNextRdv}
                              value={nextAppointmentDate}
                              onChange={e => setNextAppointmentDate(e.target.value)}
                              className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-bold text-xs text-slate-800 focus:ring-2 focus:ring-emerald-400"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-800 block mb-1 text-[11px]">
                              Heure convenue *
                            </label>
                            <input
                              type="time"
                              required={scheduleNextRdv}
                              value={nextAppointmentTime}
                              onChange={e => setNextAppointmentTime(e.target.value)}
                              className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-bold text-xs text-slate-800 focus:ring-2 focus:ring-emerald-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-800 block mb-1 text-[11px]">
                            Engagement verbal / Accord de la tenancière :
                          </label>
                          <input
                            type="text"
                            value={tenanciereAccord}
                            onChange={e => setTenanciereAccord(e.target.value)}
                            placeholder="Ex: Versement convenu après la recette du week-end..."
                            className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-400"
                          />
                        </div>
                      </div>
                    )}

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
          7B. MODAL: MISE EN DEMEURE POUR ESPACE INSOLVABLE (72h)
         ======================================================== */}
      {isMiseEnDemeureModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-base font-extrabold text-red-950 font-republic">
                    Délivrer une Mise en Demeure Officielle
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Police des Loisirs • Procédure contradictoire exécutoire
                  </p>
                </div>
              </div>
              <button onClick={() => setIsMiseEnDemeureModalOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleDeliverMiseEnDemeure} className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Établissement insolvable concerné *</label>
                <select
                  value={medEstId || targetEstId}
                  onChange={e => setMedEstId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-800 bg-white"
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} — Reste dû : {est.balance_due.toLocaleString('fr-FR')} FCFA ({est.arrondissement})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Délai d'exécution légal *</label>
                  <select
                    value={medDelaiJours}
                    onChange={e => setMedDelaiJours(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-red-900 bg-red-50/50"
                  >
                    <option value={3}>72 Heures (Urgence / Défaut réitéré)</option>
                    <option value={8}>Huitaine (8 Jours francs)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Agent / Notificateur</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentAgent.name} (${currentAgent.badge})`}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motif réglementaire de la mise en demeure *</label>
                <textarea
                  rows={3}
                  required
                  value={medMotif}
                  onChange={e => setMedMotif(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  placeholder="Préciser les manquements constatés..."
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-900 space-y-1">
                <span className="font-extrabold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  Effet automatique sur l'Agenda Google :
                </span>
                <p>
                  L'échéance de {medDelaiJours === 3 ? '72 heures' : '8aine'} sera automatiquement positionnée dans l'Agenda Google du service pour vérification du paiement ou exécution de l'arrêté de fermeture administrative.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsMiseEnDemeureModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow flex items-center gap-1.5"
                >
                  <Shield className="w-4 h-4 text-amber-300" />
                  <span>Délivrer & Imprimer l'Acte A4</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          7C. MODAL: RECENSER UN NOUVEL ÉTABLISSEMENT SUR LE TERRAIN
              ET PROGRAMMER SON PASSAGE AU BUREAU DDL-PN
         ======================================================== */}
      {isRegisterEstModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-5 border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006d2f] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#022448] font-republic">
                    Recensement d'un Nouvel Établissement
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Saisie in situ par {currentAgent.name} ({currentAgent.badge})
                  </p>
                </div>
              </div>
              <button onClick={() => setIsRegisterEstModalOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleRegisterNewEstablishment} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom de l'Établissement *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bar Dancing Le Triomphe"
                    value={newEstForm.name}
                    onChange={e => setNewEstForm({ ...newEstForm, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Promoteur / Gérant *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: M. Jean-Pierre MABIALA"
                    value={newEstForm.promoter_name}
                    onChange={e => setNewEstForm({ ...newEstForm, promoter_name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Téléphone Promoteur *</label>
                  <input
                    type="text"
                    required
                    value={newEstForm.phone}
                    onChange={e => setNewEstForm({ ...newEstForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono-ref font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Arrondissement *</label>
                  <select
                    value={newEstForm.arrondissement}
                    onChange={e => {
                      const arrCode = e.target.value as any;
                      const arrInfo = TERRITORIAL_REFERENTIAL.find(a => a.code === arrCode);
                      const defQ = arrInfo?.quartiers[0] || 'Centre-Ville';
                      setNewEstForm({
                        ...newEstForm,
                        arrondissement: arrCode,
                        quartier: defQ
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-800 bg-white"
                  >
                    {TERRITORIAL_REFERENTIAL.map(a => (
                      <option key={a.code} value={a.code}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quartier (lié à l'Arr.) *</label>
                  <select
                    value={newEstForm.quartier}
                    onChange={e => setNewEstForm({ ...newEstForm, quartier: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white"
                  >
                    {(TERRITORIAL_REFERENTIAL.find(a => a.code === newEstForm.arrondissement)?.quartiers || []).map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Adresse précise / Repère terrain</label>
                <input
                  type="text"
                  placeholder="Ex: Face Marché Tié-Tié, Rue de la Paix"
                  value={newEstForm.address}
                  onChange={e => setNewEstForm({ ...newEstForm, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Régime Fiscal *</label>
                  <select
                    value={newEstForm.regime_type}
                    onChange={e => setNewEstForm({ ...newEstForm, regime_type: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="INFORMEL">Secteur Informel (Forfait annuel)</option>
                    <option value="FORMEL">Secteur Formel (Tarif m²)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Surface exploitée (m²)</label>
                  <input
                    type="number"
                    value={newEstForm.surface_m2}
                    onChange={e => setNewEstForm({ ...newEstForm, surface_m2: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono-ref"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Redevance Estimée (FCFA) *</label>
                  <input
                    type="number"
                    value={newEstForm.total_due}
                    onChange={e => setNewEstForm({ ...newEstForm, total_due: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono-ref font-bold text-amber-900 bg-amber-50"
                  />
                </div>
              </div>

              {/* CONVOCATION PROGRAMMATION BOX (KEY USER REQUIREMENT) */}
              <div className="p-3.5 bg-purple-50/80 border-2 border-purple-300 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-950 text-xs">
                    <input
                      type="checkbox"
                      checked={newEstForm.programBureauPassage}
                      onChange={e => setNewEstForm({ ...newEstForm, programBureauPassage: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-700 focus:ring-purple-500"
                    />
                    <span>📅 Programmer le passage pour venir se présenter au bureau DDL-PN</span>
                  </label>
                  <span className="text-[10px] font-mono-ref font-black bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                    CONVOCATION
                  </span>
                </div>

                {newEstForm.programBureauPassage && (
                  <div className="space-y-2.5 pt-2 border-t border-purple-200/60 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-purple-900 block mb-1 text-[11px]">
                          Date de comparution au bureau *
                        </label>
                        <input
                          type="date"
                          required
                          value={newEstForm.bureauPassageDate}
                          onChange={e => setNewEstForm({ ...newEstForm, bureauPassageDate: e.target.value })}
                          className="w-full p-2 bg-white border border-purple-300 rounded-lg font-semibold text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-purple-900 block mb-1 text-[11px]">
                          Heure du rendez-vous *
                        </label>
                        <input
                          type="time"
                          required
                          value={newEstForm.bureauPassageTime}
                          onChange={e => setNewEstForm({ ...newEstForm, bureauPassageTime: e.target.value })}
                          className="w-full p-2 bg-white border border-purple-300 rounded-lg font-semibold text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-purple-900 block mb-1 text-[11px]">
                        Lieu / Bureau de convocation
                      </label>
                      <input
                        type="text"
                        value={newEstForm.bureauPassageOffice}
                        onChange={e => setNewEstForm({ ...newEstForm, bureauPassageOffice: e.target.value })}
                        className="w-full p-2 bg-white border border-purple-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-purple-900 block mb-1 text-[11px]">
                        Motif officiel de la présentation au bureau
                      </label>
                      <input
                        type="text"
                        value={newEstForm.bureauPassageMotif}
                        onChange={e => setNewEstForm({ ...newEstForm, bureauPassageMotif: e.target.value })}
                        className="w-full p-2 bg-white border border-purple-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsRegisterEstModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006d2f] hover:bg-emerald-800 text-white font-bold rounded-lg shadow flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Enregistrer & Programmer au Calendrier SAA</span>
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
                <label className="font-bold text-slate-700 block mb-1">Instructions / Notes d'intervention</label>
                <input
                  type="text"
                  name="eventNotes"
                  placeholder="Ex: Vérification paiement acompte ou conformité administrative"
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
          9. MODAL: SONOMÈTRE NUMÉRIQUE SAA (DÉCIBELMÈTRE)
         ======================================================== */}
      {isSoundMeterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 text-xs text-center">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h3 className="text-base font-extrabold text-blue-900 flex items-center gap-1.5">
                <Volume2 className="w-5 h-5 text-blue-600" />
                <span>Sonomètre Numérique SAA</span>
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
                      {item.payload?.establishment_name || item.payload?.establishmentName || 'Intervention SAA'}
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
                  <span>Sélection de l'Agent SAA</span>
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
                      setIsAgentLoginModalOpen(false);
                      triggerNotification(`Affichage du planning supervisé pour ${agent.name} (${agent.badge}).`, 'info');
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

      {/* ========================================================
          12. MODAL: FEUILLE DE TOURNÉE JOURNALIÈRE (LISTE DES ÉTABLISSEMENTS)
         ======================================================== */}
      {isDaySheetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col border border-slate-200 overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-[#022448] to-[#005a26] text-white flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono-ref">
                    DDL-PN • SERVICE ASSISTANCE ET AUTORISATION (SAA)
                  </span>
                  <span className="text-xs text-amber-300 font-mono-ref font-bold">
                    Exercice 2026
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black font-republic text-white mt-1 flex items-center gap-2">
                  <span>Planning Journalier des Établissements & Recouvrements</span>
                </h3>
                <p className="text-xs text-slate-200 mt-0.5">
                  Gestion centralisée des visites, perceptions des droits régie et reports contradictoires
                </p>
              </div>

              {/* Day Switcher Controls inside Modal Header */}
              <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(selectedDayDate);
                    d.setDate(d.getDate() - 1);
                    const newStr = d.toISOString().split('T')[0];
                    setSelectedDayDate(newStr);
                    setCurrentDateStr(newStr);
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
                  title="Jour précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center px-2">
                  <div className="text-[11px] font-black uppercase text-amber-300">
                    {new Date(selectedDayDate).toLocaleDateString('fr-FR', { weekday: 'long' })}
                  </div>
                  <div className="text-xs font-bold text-white font-mono-ref">
                    {new Date(selectedDayDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(selectedDayDate);
                    d.setDate(d.getDate() + 1);
                    const newStr = d.toISOString().split('T')[0];
                    setSelectedDayDate(newStr);
                    setCurrentDateStr(newStr);
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
                  title="Jour suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <input
                  type="date"
                  value={selectedDayDate}
                  onChange={e => {
                    if (e.target.value) {
                      setSelectedDayDate(e.target.value);
                      setCurrentDateStr(e.target.value);
                    }
                  }}
                  className="bg-white/20 border border-white/30 text-white rounded-lg px-2 py-1 text-[11px] font-mono-ref focus:outline-none cursor-pointer"
                  title="Sélectionner une date précise"
                />

                <button
                  onClick={() => setIsDaySheetModalOpen(false)}
                  className="ml-2 p-1.5 hover:bg-red-500/80 rounded-full text-slate-200 hover:text-white transition cursor-pointer"
                  title="Fermer la fenêtre"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Day Summary KPI Bar */}
            {(() => {
              const dayEvents = filteredEvents.filter(e => e.date === selectedDayDate);
              const dayTotalDue = dayEvents.reduce((sum, e) => {
                const est = establishments.find(x => x.id === e.establishmentId);
                return sum + (est?.total_due || e.amountDue || 0);
              }, 0);
              const dayTotalPaid = dayEvents.reduce((sum, e) => {
                const est = establishments.find(x => x.id === e.establishmentId);
                return sum + (est?.amount_paid || 0);
              }, 0);
              const dayTotalBalance = dayEvents.reduce((sum, e) => {
                const est = establishments.find(x => x.id === e.establishmentId);
                return sum + ((est?.balance_due ?? e.amountDue) || 0);
              }, 0);

              const postponedFromThisDay = events.filter(e => e.notes && e.notes.includes(`[Reporté du ${selectedDayDate}`));
              const completedThisDay = dayEvents.filter(e => e.status === 'EFFECTUE');

              return (
                <div>
                  <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Left: Count */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Établissements programmés :</span>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-xl font-black text-sm font-mono-ref border border-blue-200">
                        {dayEvents.length} établissement{dayEvents.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Right: Financial Triplet */}
                    <div className="flex flex-wrap items-center gap-3 font-mono-ref">
                      <div className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Exigible</span>
                        <strong className="text-slate-900 text-xs">{dayTotalDue.toLocaleString('fr-FR')} FCFA</strong>
                      </div>
                      <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 shadow-2xs">
                        <span className="text-[10px] text-emerald-700 block uppercase font-bold">Déjà Réglé</span>
                        <strong className="text-emerald-800 text-xs">{dayTotalPaid.toLocaleString('fr-FR')} FCFA</strong>
                      </div>
                      <div className="px-3.5 py-1.5 bg-amber-100/90 rounded-xl border-2 border-amber-400 shadow-2xs">
                        <span className="text-[10px] text-amber-900 block uppercase font-black">Solde Restant à Recouvrer</span>
                        <strong className="text-amber-950 text-sm font-black">{dayTotalBalance.toLocaleString('fr-FR')} FCFA</strong>
                      </div>
                    </div>
                  </div>

                  {/* Banner when an establishment has just been postponed */}
                  {recentlyPostponedNotice && (
                    <div className="mx-4 sm:mx-6 mt-3 p-3.5 bg-amber-50 border-2 border-amber-400 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                          ✓
                        </span>
                        <div>
                          <p className="font-extrabold text-amber-950 text-xs sm:text-sm">
                            Rendez-vous reporté avec succès d'accord parties avec le tenancier !
                          </p>
                          <p className="text-amber-900 text-[11px] mt-0.5">
                            L'établissement <strong>« {recentlyPostponedNotice.name} »</strong> a bien <strong>disparu du planning de ce jour</strong> et réapparaîtra automatiquement sur le calendrier le <strong>{recentlyPostponedNotice.newDate}</strong> (dans {recentlyPostponedNotice.delayMonths} mois).
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDayDate(recentlyPostponedNotice.newDate);
                            setCurrentDateStr(recentlyPostponedNotice.newDate);
                          }}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                          title="Aller directement voir le jour où il est reprogrammé"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Aller voir au {recentlyPostponedNotice.newDate}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecentlyPostponedNotice(null)}
                          className="p-1 text-amber-800 hover:text-amber-950"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setDaySheetActiveTab('PROGRAMMES')}
                      className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                        daySheetActiveTab === 'PROGRAMMES'
                          ? 'border-blue-600 text-blue-800 font-black'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Établissements programmés ce jour ({dayEvents.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDaySheetActiveTab('REPORTES')}
                      className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                        daySheetActiveTab === 'REPORTES'
                          ? 'border-amber-600 text-amber-900 font-black'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Récemment reportés d'accord parties ({postponedFromThisDay.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDaySheetActiveTab('SOLDE')}
                      className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                        daySheetActiveTab === 'SOLDE'
                          ? 'border-emerald-600 text-emerald-800 font-black'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Soldés / Réglés ({completedThisDay.length})</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Establishments List Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
              {(() => {
                const dayEvents = filteredEvents.filter(e => e.date === selectedDayDate);
                const postponedFromThisDay = events.filter(e => e.notes && e.notes.includes(`[Reporté du ${selectedDayDate}`));
                const completedThisDay = dayEvents.filter(e => e.status === 'EFFECTUE');

                // TAB 2: POSTPONED ESTABLISHMENTS
                if (daySheetActiveTab === 'REPORTES') {
                  if (postponedFromThisDay.length === 0) {
                    return (
                      <div className="text-center py-14 text-slate-400">
                        <Clock className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                        <p className="font-bold text-sm text-slate-700">
                          Aucun établissement reporté pour cette date.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Tous les rendez-vous programmés pour cette date sont actuellement maintenus.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                        <strong>Historique des reports contradictoires :</strong> Ces établissements ont été initialement programmés pour le <strong>{selectedDayDate}</strong> puis déplacés suite à un accord avec le promoteur/tenancier in situ. Ils ont disparu de ce jour et sont désormais inscrits à leur nouvelle date.
                      </div>

                      {postponedFromThisDay.map(pe => {
                        const est = establishments.find(x => x.id === pe.establishmentId);
                        const balance = (est?.balance_due ?? pe.amountDue) || 0;

                        return (
                          <div
                            key={pe.id}
                            className="p-4 rounded-2xl bg-amber-50/50 border border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono-ref font-bold text-xs bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
                                  Nouvelle date : {pe.date} ({pe.timeStart})
                                </span>
                                <span className="text-[10px] bg-white border border-amber-300 text-amber-900 px-2 py-0.5 rounded font-bold">
                                  Reporté
                                </span>
                              </div>

                              <h4 className="text-base font-extrabold text-[#022448]">
                                « {pe.establishmentName} »
                              </h4>

                              <p className="text-xs text-slate-600">
                                Tenancier : <strong>{pe.promoterName}</strong> • Tél : {pe.phone} • Quartier : {pe.quartier}
                              </p>

                              {pe.notes && (
                                <p className="text-xs text-amber-800 bg-white/80 p-2 rounded-xl border border-amber-200 italic">
                                  {pe.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col sm:items-end gap-2 shrink-0">
                              <span className="font-mono-ref font-black text-amber-950 text-xs bg-white px-3 py-1.5 rounded-xl border border-amber-300">
                                Solde à recouvrer : {balance.toLocaleString('fr-FR')} FCFA
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDayDate(pe.date);
                                  setCurrentDateStr(pe.date);
                                  setDaySheetActiveTab('PROGRAMMES');
                                }}
                                className="px-3.5 py-1.5 bg-[#022448] hover:bg-[#003870] text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Voir au {pe.date}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // TAB 3: COMPLETED ESTABLISHMENTS
                if (daySheetActiveTab === 'SOLDE') {
                  if (completedThisDay.length === 0) {
                    return (
                      <div className="text-center py-14 text-slate-400">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                        <p className="font-bold text-sm text-slate-700">
                          Aucun encaissement soldé ce jour pour le moment.
                        </p>
                      </div>
                    );
                  }
                }

                // TAB 1 (DEFAULT): PROGRAMMED ESTABLISHMENTS FOR THIS DAY
                const targetList = daySheetActiveTab === 'SOLDE' ? completedThisDay : dayEvents;

                if (targetList.length === 0) {
                  return (
                    <div className="text-center py-14 text-slate-400">
                      <Calendar className="w-14 h-14 mx-auto mb-3 text-slate-300 stroke-1" />
                      <p className="font-black text-base text-slate-700">
                        Aucun établissement programmé pour cette journée.
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Tous les rendez-vous ont été honorés ou reportés à une date ultérieure d'accord parties avec les tenanciers.
                      </p>
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDayDate('2026-10-02');
                            setCurrentDateStr('2026-10-02');
                          }}
                          className="px-4 py-2 bg-[#022448] hover:bg-[#003870] text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Aller au 2 Octobre (Jour 2)</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return targetList.map((evt, idx) => {
                  const style = getTypeStyle(evt.type);
                  const est = establishments.find(x => x.id === evt.establishmentId);
                  const balance = (est?.balance_due ?? evt.amountDue) || 0;
                  const totalDue = (est?.total_due ?? evt.amountDue) || 0;
                  const paid = est?.amount_paid || 0;

                  return (
                    <div
                      key={evt.id}
                      className={`p-4 sm:p-5 rounded-2xl border-l-4 ${style.border} ${style.bgLight} border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-4`}
                    >
                      {/* Left: Comprehensive info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-ref font-black text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded-lg shadow-2xs">
                            Établissement #{idx + 1} sur {targetList.length}
                          </span>
                          <span className="font-mono-ref font-bold text-xs bg-white px-2 py-0.5 rounded-md border border-slate-300 text-slate-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>{evt.timeStart} - {evt.timeEnd}</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${style.bg}`}>
                            {style.label}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            evt.status === 'EFFECTUE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : evt.status === 'REPORTE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-900'
                          }`}>
                            {evt.status === 'EFFECTUE' ? 'Visité / Réglé' : evt.status === 'REPORTE' ? 'Reporté' : 'À Faire Aujourd\'hui'}
                          </span>
                        </div>

                        {/* Official Establishment Name */}
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-[#022448] tracking-tight">
                            « {evt.establishmentName} »
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold">
                            {est?.activity_type || 'Établissement de loisirs régulé'} • Surface : {est?.surface_m2 || 250} m² • Régime : <span className="font-bold text-slate-700">{est?.regime_type || 'FORMEL'}</span>
                          </p>
                        </div>

                        {/* Promoter & Location */}
                        <div className="text-xs text-slate-700 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1.5">
                            <span className="text-slate-400">Tenancier / Promoteur :</span>
                            <strong className="text-slate-900 font-extrabold">{evt.promoterName}</strong>
                          </span>

                          <span className="flex items-center gap-1 font-mono-ref font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            📞 {evt.phone}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{evt.quartier} ({evt.arrondissement}) — {evt.address}</span>
                        </p>

                        {evt.notes && (
                          <div className="text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 italic">
                            « {evt.notes} »
                          </div>
                        )}
                      </div>

                      {/* Right: Explicit Financial Box & Key Action Buttons */}
                      <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 min-w-[280px]">
                        {/* 3-Column Financial Summary Card */}
                        <div className="w-full bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs font-mono-ref space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] text-slate-500">
                            <span>Montant Total Dû :</span>
                            <strong className="text-slate-800 font-bold">{totalDue.toLocaleString('fr-FR')} FCFA</strong>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-slate-500">
                            <span>Déjà Versé :</span>
                            <strong className="text-emerald-700 font-bold">{paid.toLocaleString('fr-FR')} FCFA</strong>
                          </div>
                          <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center bg-amber-50/80 -mx-3 -mb-3 p-2.5 rounded-b-2xl border-t border-amber-200">
                            <span className="text-[11px] font-black text-amber-950 uppercase tracking-tight">Reste à Payer :</span>
                            <span className="text-sm font-black text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded-lg border border-amber-400">
                              {balance.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 w-full sm:justify-end">
                          {/* 1. RESCHEDULE / REPORTER LE RENDEZ-VOUS (Prominent Button) */}
                          <button
                            type="button"
                            onClick={() => openPostponeModal(evt)}
                            className="flex-1 sm:flex-initial px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition cursor-pointer border border-amber-500"
                            title="Reporter ce rendez-vous d'accord parties avec le tenancier (disparaît de ce jour et réapparaît à la date convenue)"
                          >
                            <Clock className="w-4 h-4 text-slate-950" />
                            <span>Reporter le RDV</span>
                          </button>

                          {/* 2. ENCAISSER L'ACOMPTE / LE SOLDE */}
                          <button
                            type="button"
                            onClick={() => openPaymentForEst(evt.establishmentId)}
                            className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#006d2f] hover:bg-[#005a26] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition cursor-pointer"
                            title="Encaisser un acompte ou le solde et délivrer une quittance"
                          >
                            <Coins className="w-4 h-4" />
                            <span>Encaisser</span>
                          </button>

                          {/* 3. CONTACT DIRECT */}
                          <a
                            href={`tel:${evt.phone.replace(/\s+/g, '')}`}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                            title="Appeler directement le promoteur"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          <a
                            href={`https://wa.me/${evt.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour M. ${evt.promoterName}, Direction Départementale des Loisirs de Pointe-Noire (DDL-PN). Nous confirmons notre passage ce jour concernant « ${evt.establishmentName} » pour régularisation des droits d'exploitation.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition border border-emerald-200"
                            title="Contacter sur WhatsApp avec rappel officiel"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          13. MODAL: REPORTER LE RENDEZ-VOUS (ACCORD DU TENANCIER)
         ======================================================== */}
      {isPostponeModalOpen && postponeEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-5 sm:p-6 border border-slate-200 text-xs space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-mono-ref">
                    ACCORD TENANCIER IN SITU
                  </span>
                  <span className="text-xs text-slate-500 font-mono-ref font-bold">
                    Date initiale : {postponeEvent.date}
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#022448] flex items-center gap-2 mt-1">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>Reporter le Rendez-vous & Déplacer l'Établissement</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  L'établissement <strong>disparaîtra du planning du {postponeEvent.date}</strong> et réapparaîtra automatiquement sur le calendrier au jour convenu avec le tenancier.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsPostponeModalOpen(false);
                  setPostponeEvent(null);
                }}
                className="text-slate-400 font-bold p-1 hover:text-slate-600 cursor-pointer rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Target Establishment summary */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 p-3.5 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center">
                <strong className="text-slate-950 font-black text-sm">
                  « {postponeEvent.establishmentName} »
                </strong>
                <span className="font-mono-ref font-black text-amber-950 bg-amber-200 px-2.5 py-0.5 rounded-lg border border-amber-300">
                  Solde Dû : {((establishments.find(e => e.id === postponeEvent.establishmentId)?.balance_due) ?? postponeEvent.amountDue ?? 0).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <span>Promoteur : <strong className="text-slate-900">{postponeEvent.promoterName}</strong></span>
                <span>• Tél : <span className="font-mono-ref text-emerald-800 font-bold">{postponeEvent.phone}</span></span>
                <span>• Quartier : {postponeEvent.quartier}</span>
              </div>
            </div>

            {/* Quick Preset Buttons (Prominently featuring +2 months) */}
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                Délai convenu avec le tenancier (Raccourcis rapides) :
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyPostponePresetDays(3)}
                  className="p-2.5 bg-slate-50 hover:bg-amber-100 text-slate-800 rounded-xl font-bold text-[11px] transition border border-slate-200 hover:border-amber-300 cursor-pointer text-center"
                >
                  +3 Jours (72h)
                </button>
                <button
                  type="button"
                  onClick={() => applyPostponePresetDays(7)}
                  className="p-2.5 bg-slate-50 hover:bg-amber-100 text-slate-800 rounded-xl font-bold text-[11px] transition border border-slate-200 hover:border-amber-300 cursor-pointer text-center"
                >
                  +1 Semaine
                </button>
                <button
                  type="button"
                  onClick={() => applyPostponePresetDays(14)}
                  className="p-2.5 bg-slate-50 hover:bg-amber-100 text-slate-800 rounded-xl font-bold text-[11px] transition border border-slate-200 hover:border-amber-300 cursor-pointer text-center"
                >
                  +2 Semaines
                </button>
                <button
                  type="button"
                  onClick={() => applyPostponePresetMonths(1)}
                  className="p-2.5 bg-slate-50 hover:bg-amber-100 text-slate-800 rounded-xl font-bold text-[11px] transition border border-slate-200 hover:border-amber-300 cursor-pointer text-center"
                >
                  +1 Mois (30 jours)
                </button>

                {/* +2 MOIS: EMPHASIZED BUTTON (As requested by user: "Parce que il peut pousser ça par exemple dans deux mois") */}
                <button
                  type="button"
                  onClick={() => applyPostponePresetMonths(2)}
                  className="p-2.5 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 text-amber-950 rounded-xl font-black text-[11px] transition border-2 border-amber-500 shadow-xs hover:shadow-md cursor-pointer text-center relative"
                >
                  <span className="block font-black text-xs">+2 Mois (60 jours)</span>
                  <span className="text-[9px] uppercase tracking-wider block font-extrabold text-amber-900">Accord Tenancier ⭐</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPostponePresetMonths(3)}
                  className="p-2.5 bg-slate-50 hover:bg-amber-100 text-slate-800 rounded-xl font-bold text-[11px] transition border border-slate-200 hover:border-amber-300 cursor-pointer text-center"
                >
                  +3 Mois (90 jours)
                </button>
              </div>
            </div>

            {/* Date & Time selection */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nouvelle Date Convenue *
                </label>
                <input
                  type="date"
                  value={postponeNewDate}
                  onChange={e => setPostponeNewDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono-ref font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500/20"
                  required
                />
                <span className="text-[10px] text-amber-800 font-bold block mt-1">
                  {postponeNewDate ? new Date(postponeNewDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </span>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nouvel Horaire Convenu *
                </label>
                <input
                  type="time"
                  value={postponeNewTime}
                  onChange={e => setPostponeNewTime(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono-ref font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>
            </div>

            {/* Reasons / Justification */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Motif & Raisons formulées par le tenancier :
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  "Accord verbal pour passage dans 2 mois (trésorerie)",
                  "Délai sollicité pour rassemblement du solde de redevance",
                  "Promoteur en déplacement / voyage d'affaires",
                  "Travaux d'insonorisation et mise aux normes en cours"
                ].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setPostponeReason(tag)}
                    className="text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-800 px-2.5 py-1 rounded-lg transition border border-slate-200 hover:border-amber-300 cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <textarea
                value={postponeReason}
                onChange={e => setPostponeReason(e.target.value)}
                placeholder="Ex: Le promoteur a sollicité un délai de 60 jours d'accord parties pour rassembler le solde..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
              />
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsPostponeModalOpen(false);
                  setPostponeEvent(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmPostpone}
                disabled={!postponeNewDate}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 border border-amber-500"
              >
                <Clock className="w-4 h-4 text-slate-950" />
                <span>Confirmer le Report & Déplacer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optimized Route Modal */}
      <OptimizedRouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        events={filteredEvents}
        currentDateStr={currentDateStr}
        agentName={currentAgent.name}
        agentBadge={currentAgent.badge}
        onSelectEvent={evt => setSelectedEvent(evt)}
        onMarkDone={evtId => handleMarkEventDone(evtId)}
      />

      {/* Automated Reminders (SMS & WhatsApp 48h) Modal */}
      <AutomatedRemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        events={filteredEvents}
        currentDateStr={currentDateStr}
      />

      {/* Promoter Public Portal & MoMo Payment Modal */}
      <PromoterPublicPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => {
          setIsPortalModalOpen(false);
          setSelectedPortalEst(null);
        }}
        establishment={selectedPortalEst}
        onPaymentSuccess={payment => {
          reloadEvents();
          triggerNotification(`Paiement de ${payment.amount_paid.toLocaleString('fr-FR')} FCFA validé via le portail Mobile Money ! Quittance N° ${payment.receipt_reference}.`, 'success');
        }}
      />

      {/* Document Vault & Digital GED Modal */}
      <DocumentVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => {
          setIsVaultModalOpen(false);
          setSelectedVaultEst(null);
        }}
        establishment={selectedVaultEst}
        agentName={currentAgent.name}
        onDocumentAdded={() => {
          reloadEvents();
          triggerNotification('Pièce justificative chiffrée et versée au dossier avec succès.', 'success');
        }}
      />

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
