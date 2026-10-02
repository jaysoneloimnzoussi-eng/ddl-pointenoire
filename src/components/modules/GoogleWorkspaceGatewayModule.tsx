import React, { useState, useEffect, useMemo } from 'react';
import {
  CloudDownload,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  Shield,
  FileSpreadsheet,
  Check,
  Search,
  Filter,
  Building2,
  Phone,
  UserCheck,
  MapPin,
  ExternalLink,
  SlidersHorizontal,
  Info,
  Layers,
  Sparkles,
  AlertTriangle,
  LogOut,
  Edit2,
  Trash2
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { storageService, calculateEstablishmentFee, getCoordinatesForArrondissement } from '../../services/storageService';
import { ArrondissementCode, RegimeType, Establishment } from '../../types';
import { TERRITORIAL_REFERENTIAL, ACTIVITY_CATEGORIES } from '../../constants/referential';
import {
  googleSignIn,
  getAccessToken,
  logoutGoogle,
  fetchGoogleCalendarEvents,
  parseEventToEstablishment,
  ExtractedCalendarEstablishment,
  initAuth
} from '../../services/googleCalendarService';
import { User } from 'firebase/auth';

export const GoogleWorkspaceGatewayModule: React.FC = () => {
  const { currentUser, triggerNotification, setActiveModule } = useSession();
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // Date filters
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [tabFilter, setTabFilter] = useState<'ALL' | 'NEW' | 'EXISTING' | 'MISSING_PHONE'>('ALL');

  // Parsed events
  const [extractedItems, setExtractedItems] = useState<ExtractedCalendarEstablishment[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  // Edit modal
  const [editingItem, setEditingItem] = useState<ExtractedCalendarEstablishment | null>(null);

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Google Sign In
  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      setGoogleUser(result.user);
      setAccessToken(result.accessToken);
      triggerNotification(`Connecté avec succès au compte Google : ${result.user.email}`, 'success');
    } catch (error: any) {
      console.error(error);
      triggerNotification(
        error.message || "Échec de la connexion à Google. Veuillez réessayer.",
        'error'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setAccessToken(null);
    setExtractedItems([]);
    setSelectedIds(new Set());
    setHasScanned(false);
    triggerNotification('Compte Google déconnecté.', 'info');
  };

  // Extract from Google Calendar
  const handleFetchCalendar = async () => {
    if (!accessToken) {
      triggerNotification("Veuillez d'abord vous connecter à votre compte Google.", 'warning');
      return;
    }

    setIsScanning(true);
    try {
      const rawEvents = await fetchGoogleCalendarEvents(accessToken, startDate);
      const currentEstablishments = storageService.getEstablishments();

      const parsed = rawEvents.map(evt => parseEventToEstablishment(evt, currentEstablishments));
      setExtractedItems(parsed);
      setHasScanned(true);

      // Pre-select new establishments that do not yet exist in database
      const newIds = new Set<string>();
      parsed.forEach(p => {
        if (!p.alreadyExists) {
          newIds.add(p.eventId);
        }
      });
      setSelectedIds(newIds);

      triggerNotification(
        `${rawEvents.length} événements récupérés depuis votre Google Agenda (${parsed.filter(p => !p.alreadyExists).length} nouveaux établissements détectés).`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      triggerNotification(
        err.message || "Erreur lors de la récupération des événements Google Agenda.",
        'error'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Toggle selection
  const toggleSelect = (eventId: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(eventId)) {
      updated.delete(eventId);
    } else {
      updated.add(eventId);
    }
    setSelectedIds(updated);
  };

  const selectAll = () => {
    const allIds = new Set(filteredItems.map(i => i.eventId));
    setSelectedIds(allIds);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Filtered extracted items
  const filteredItems = useMemo(() => {
    return extractedItems.filter(item => {
      if (tabFilter === 'NEW' && item.alreadyExists) return false;
      if (tabFilter === 'EXISTING' && !item.alreadyExists) return false;
      if (tabFilter === 'MISSING_PHONE' && item.phone.trim() !== '') return false;
      if (keywordFilter.trim() !== '') {
        const kw = keywordFilter.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(kw);
        const matchesProm = item.promoter_name.toLowerCase().includes(kw);
        const matchesLoc = item.eventLocation.toLowerCase().includes(kw);
        const matchesTitle = item.eventTitle.toLowerCase().includes(kw);
        if (!matchesName && !matchesProm && !matchesLoc && !matchesTitle) return false;
      }
      return true;
    });
  }, [extractedItems, tabFilter, keywordFilter]);

  // Import Selected
  const handleImportSelected = () => {
    const toImport = extractedItems.filter(
      item => selectedIds.has(item.eventId) && !importedIds.has(item.eventId)
    );

    if (toImport.length === 0) {
      triggerNotification("Aucun établissement sélectionné ou déjà importé.", 'warning');
      return;
    }

    let addedEstCount = 0;
    let addedEventCount = 0;

    toImport.forEach(item => {
      const { filingFee, ratePerSqm, totalDue } = calculateEstablishmentFee(
        item.activity_code,
        item.surface_m2,
        item.regime_type
      );

      // 1. Check if establishment exists in local database or add new
      const existingList = storageService.getEstablishments();
      const existingEst = existingList.find(
        e => e.name.toLowerCase() === item.name.toLowerCase()
      );

      const targetEst = existingEst || storageService.addEstablishment({
        name: item.name,
        promoter_name: item.promoter_name || 'Promoteur à régulariser',
        phone: item.phone || '+242 06 000 00 00',
        arrondissement: item.arrondissement,
        quartier: item.quartier || 'Centre',
        address: item.eventLocation || `${item.quartier}, ${item.arrondissement}`,
        activity_type: item.activity_type,
        activity_code: item.activity_code,
        regime_type: item.regime_type,
        surface_m2: item.surface_m2,
        filing_fee: filingFee,
        rate_per_sqm: ratePerSqm,
        total_due: totalDue,
        amount_paid: 0,
        balance_due: totalDue,
        status: item.statusRecommendation,
        identified_by: `${currentUser.name} (Google Calendar Import)`,
        identified_date: item.eventDate,
        coordinates: getCoordinatesForArrondissement(item.arrondissement, item.name),
        has_acoustic_limiter: item.activity_code === 'A1.1' || item.activity_code === 'A1.2',
        decibel_level: 78,
        installments_chosen: 2,
        notes: `Importé depuis Google Agenda : ${item.eventTitle} (${item.eventDate})`
      });

      if (!existingEst) {
        addedEstCount++;
      }

      // 2. Transfer the Rendez-vous event into the Application's Calendar
      storageService.addAgentEvent({
        agentId: currentUser.id,
        agentName: currentUser.name,
        agentBadge: currentUser.badge,
        establishmentId: targetEst.id,
        establishmentName: targetEst.name,
        promoterName: targetEst.promoter_name,
        phone: targetEst.phone,
        arrondissement: targetEst.arrondissement,
        quartier: targetEst.quartier,
        address: targetEst.address,
        date: item.eventDate,
        timeStart: item.timeStart || '09:00',
        timeEnd: item.timeEnd || '10:30',
        type: item.eventType || 'RECENSEMENT_IN_SITU',
        status: item.eventStatus || 'A_FAIRE',
        priority: item.priority || 'NORMALE',
        amountDue: targetEst.total_due,
        amountCollected: targetEst.amount_paid,
        notes: item.eventDescription || item.eventTitle,
        isSynced: true
      });

      addedEventCount++;
    });

    // Mark as imported
    const newImported = new Set(importedIds);
    toImport.forEach(i => newImported.add(i.eventId));
    setImportedIds(newImported);

    triggerNotification(
      `Transfert réussi : ${addedEstCount} établissements créés et ${addedEventCount} rendez-vous programmés dans votre calendrier DDL-PN.`,
      'success'
    );
  };

  // Save edit modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setExtractedItems(prev =>
      prev.map(i => (i.eventId === editingItem.eventId ? editingItem : i))
    );
    setEditingItem(null);
    triggerNotification('Modifications enregistrées pour cet établissement.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-[#022448] to-[#005a26] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-slate-700/60 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
              GOOGLE WORKSPACE • PASSERELLE AGENDA SAA
            </span>
            <span className="text-xs text-blue-200 font-medium flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              <span>API Google Calendar v3</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-republic tracking-tight text-white">
            Extraction & Injection depuis Google Agenda
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed font-light">
            Importez directement les tournées, visites et établissements enregistrés dans votre Google Agenda du début de l'année jusqu'à aujourd'hui. L'analyseur intelligent extrait automatiquement les exploitants, adresses, arrondissements et surfaces, même si certaines coordonnées sont incomplètes.
          </p>
        </div>

        {/* Auth / Account Action */}
        <div className="relative z-10 self-stretch xl:self-auto shrink-0 flex items-center gap-3">
          {accessToken && googleUser ? (
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 p-2.5 rounded-2xl">
              {googleUser.photoURL ? (
                <img
                  src={googleUser.photoURL}
                  alt={googleUser.displayName || 'Google User'}
                  className="w-9 h-9 rounded-full border border-emerald-400"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {googleUser.email?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <span className="text-xs font-bold text-white block truncate max-w-[170px]">
                  {googleUser.displayName || googleUser.email}
                </span>
                <span className="text-[10px] text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Connecté Google
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Déconnecter Google"
                className="p-2 hover:bg-white/20 rounded-xl text-slate-300 hover:text-red-300 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-md border border-slate-200 transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isAuthenticating ? 'Connexion...' : 'Se connecter avec Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Extraction Control Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Date range picker */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Période dans l'Agenda :</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-slate-400 text-[10px] font-bold">Du</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-transparent text-slate-800 font-semibold focus:outline-none"
                />
              </div>

              <span className="text-slate-400 text-xs">à</span>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-slate-400 text-[10px] font-bold">Au</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-transparent text-slate-800 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleFetchCalendar}
              disabled={isScanning || !accessToken}
              className={`font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer ${
                accessToken
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scan en cours...' : 'Extraire les Établissements'}</span>
            </button>
          </div>

          {/* Quick stats ribbon */}
          {hasScanned && (
            <div className="flex items-center gap-3 text-xs font-mono-ref">
              <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-bold">
                {extractedItems.length} détectés
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
                {extractedItems.filter(i => !i.alreadyExists).length} nouveaux
              </span>
              <span className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl font-bold">
                {selectedIds.size} sélectionnés
              </span>
            </div>
          )}
        </div>

        {!accessToken && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Cliquez sur <strong>« Se connecter avec Google »</strong> ci-dessus pour autoriser la lecture sécurisée de vos événements d'agenda. Aucune modification ne sera apportée à votre agenda personnel (accès en lecture seule certifiée).
            </p>
          </div>
        )}

        {importedIds.size > 0 && (
          <div className="mt-4 bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-950">
                  {importedIds.size} établissements et rendez-vous transférés avec succès !
                </p>
                <p className="text-[11px] text-emerald-800">
                  Toutes les dates, horaires, exploitants et coordonnées extraits de votre Google Agenda ont été intégrés dans votre calendrier DDL-PN.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModule('MOD-03')}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer shrink-0"
            >
              <Calendar className="w-4 h-4 text-emerald-200" />
              <span>Ouvrir le Calendrier de l'Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Extracted Items Explorer & Batch Action */}
      {hasScanned && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Sub-header & Filtering Tabs */}
          <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            {/* Tab Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTabFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  tabFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Tous ({extractedItems.length})
              </button>
              <button
                onClick={() => setTabFilter('NEW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  tabFilter === 'NEW'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                Nouveaux uniquement ({extractedItems.filter(i => !i.alreadyExists).length})
              </button>
              <button
                onClick={() => setTabFilter('EXISTING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  tabFilter === 'EXISTING'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Déjà en base ({extractedItems.filter(i => i.alreadyExists).length})
              </button>
              <button
                onClick={() => setTabFilter('MISSING_PHONE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  tabFilter === 'MISSING_PHONE'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                Téléphone à compléter ({extractedItems.filter(i => !i.phone).length})
              </button>
            </div>

            {/* Keyword search & Select / Deselect */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrer..."
                  value={keywordFilter}
                  onChange={e => setKeywordFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
                />
              </div>

              <button
                onClick={selectAll}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tout cocher
              </button>
              <button
                onClick={deselectAll}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Décocher
              </button>

              <button
                onClick={handleImportSelected}
                disabled={selectedIds.size === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                  selectedIds.size > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Injecter la sélection ({selectedIds.size})</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50/50">
                  <th className="p-3 w-10 text-center">
                    <span className="sr-only">Sélection</span>
                  </th>
                  <th className="py-3 px-2 font-semibold">Établissement & Événement Agenda</th>
                  <th className="py-3 px-2 font-semibold">Promoteur / Contact</th>
                  <th className="py-3 px-2 font-semibold">Arrondissement & Quartier</th>
                  <th className="py-3 px-2 font-semibold">Activité & Surface</th>
                  <th className="py-3 px-2 font-semibold">Statut Base</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Aucun établissement ne correspond aux critères de filtre.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const isSelected = selectedIds.has(item.eventId);
                    const isImported = importedIds.has(item.eventId);

                    return (
                      <tr
                        key={item.eventId}
                        className={`transition ${
                          isImported
                            ? 'bg-emerald-50/30'
                            : isSelected
                            ? 'bg-blue-50/40'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isImported}
                            onChange={() => toggleSelect(item.eventId)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-2">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {isImported && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                Importé ✓
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate max-w-xs">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.eventDate} • {item.eventTitle}</span>
                          </div>
                          {item.eventDescription && (
                            <p className="text-[10px] text-slate-400 italic truncate max-w-sm mt-0.5">
                              « {item.eventDescription} »
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-2">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            <span>{item.promoter_name}</span>
                          </div>
                          <div className="mt-0.5">
                            {item.phone ? (
                              <span className="text-emerald-700 font-mono-ref text-[11px] font-semibold flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" />
                                <span>{item.phone}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                Numéro manquant (à compléter)
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-2">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{item.arrondissement}</span>
                          </div>
                          <span className="text-[11px] text-slate-500">{item.quartier}</span>
                        </td>

                        <td className="py-3 px-2 font-mono-ref">
                          <div className="font-semibold text-slate-800 text-[11px]">
                            {item.activity_type}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {item.surface_m2} m² • {item.regime_type}
                          </div>
                        </td>

                        <td className="py-3 px-2">
                          {item.alreadyExists ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                              <CheckCircle className="w-3 h-3 text-slate-500" />
                              <span>Déjà répertorié</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Nouveau</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setEditingItem({ ...item })}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition cursor-pointer"
                            title="Modifier avant importation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Edit Modal before import */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Ajuster l'Établissement extrait
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom de l'établissement</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Promoteur / Gérant</label>
                  <input
                    type="text"
                    value={editingItem.promoter_name}
                    onChange={e => setEditingItem({ ...editingItem, promoter_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={editingItem.phone}
                    onChange={e => setEditingItem({ ...editingItem, phone: e.target.value })}
                    placeholder="+242 06 000 00 00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono-ref text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Arrondissement</label>
                  <select
                    value={editingItem.arrondissement}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        arrondissement: e.target.value as ArrondissementCode
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-medium"
                  >
                    {TERRITORIAL_REFERENTIAL.map(arr => (
                      <option key={arr.code} value={arr.code}>
                        {arr.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quartier</label>
                  <input
                    type="text"
                    value={editingItem.quartier}
                    onChange={e => setEditingItem({ ...editingItem, quartier: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Régime Fiscale</label>
                  <select
                    value={editingItem.regime_type}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        regime_type: e.target.value as RegimeType
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900"
                  >
                    <option value="FORMEL">Secteur Formel (au m²)</option>
                    <option value="INFORMEL">Secteur Informel (Forfait)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Surface (m²)</label>
                  <input
                    type="number"
                    value={editingItem.surface_m2}
                    onChange={e =>
                      setEditingItem({ ...editingItem, surface_m2: parseInt(e.target.value, 10) || 100 })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono-ref text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
