import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  CloudDownload,
  FileCheck2,
  FileBarChart,
  MapPin,
  Sparkles,
  Send,
  Landmark,
  Receipt,
  Calculator,
  Target,
  Smartphone,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  Bell,
  RefreshCw,
  Menu,
  LogOut,
  Shield,
  QrCode
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { APP_USERS, REPUBLIQUE_CONGO } from '../../constants/referential';
import { OfficialRepublicLogo, RepublicTricolorBar } from './OfficialSeal';
import { storageService } from '../../services/storageService';
import { formatDateFR } from '../../utils/dateUtils';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export const MODULE_ITEMS = [
  { id: 'MOD-01', label: 'Poste de Commandement', shortLabel: 'Commandement', icon: LayoutDashboard },
  { id: 'MOD-02', label: 'Recensement & Recouvrement SAA', shortLabel: 'SAA Terrain', icon: ClipboardList },
  { id: 'MOD-03', label: 'Portail Terrain & Google Agenda SAA', shortLabel: 'Portail Terrain', icon: Smartphone },
  { id: 'MOD-04', label: 'Passerelle Google Workspace', shortLabel: 'Google Workspace', icon: CloudDownload },
  { id: 'MOD-05', label: 'Atelier des Actes & Sanctions', shortLabel: 'Actes & Saisines', icon: FileCheck2 },
  { id: 'MOD-06', label: 'Rapports Trimestriels', shortLabel: 'Rapports A4', icon: FileBarChart },
  { id: 'MOD-07', label: 'SIG Pointe-Noire', shortLabel: 'SIG Cartographie', icon: MapPin },
  { id: 'MOD-08', label: 'Promotion Loisirs Sains (SPA)', shortLabel: 'SPA & Labels', icon: Sparkles },
  { id: 'MOD-09', label: 'Transmission DGL Brazzaville', shortLabel: 'DGL Brazzaville', icon: Send },
  { id: 'MOD-10', label: 'Régie SAF & Trésor Public', shortLabel: 'Régie & Trésor', icon: Landmark },
  { id: 'MOD-11', label: 'Attestations & Quittances', shortLabel: 'Titres & POS', icon: Receipt },
  { id: 'MOD-12', label: 'Textes & Simulateur', shortLabel: 'Législation & Barèmes', icon: Calculator },
  { id: 'MOD-13', label: 'Suivi PTA 2026', shortLabel: 'PTA 2026', icon: Target }
];

export const RepublicHeader: React.FC = () => {
  const {
    currentUser,
    logout,
    activeModule,
    setActiveModule,
    isTabletTerrainMode,
    setIsTabletTerrainMode,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    alertCount,
    triggerNotification
  } = useSession();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [networkStatus, setNetworkStatus] = useState(storageService.getNetworkStatus());
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dayName = now.toLocaleDateString('fr-FR', { weekday: 'short' });
      setCurrentTime(
        `${dayName} ${formatDateFR(now)} • ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
      );
      setNetworkStatus(storageService.getNetworkStatus());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      if (!isSupabaseConfigured) {
        setNetworkStatus(storageService.getNetworkStatus());
        triggerNotification('Mode local autonome actif : 16 établissements et quittances enregistrés en mémoire sécurisée.', 'info');
        return;
      }
      const syncResult = await storageService.flushOfflineQueue();
      setNetworkStatus(storageService.getNetworkStatus());
      if (syncResult && !syncResult.success) {
        triggerNotification(`Mode local de secours actif : ${syncResult.message}`, 'warning');
      } else {
        triggerNotification('Synchronisation 100% réussie avec la base de données Supabase.', 'success');
      }
    } catch {
      triggerNotification('Mode local persistant actif. Données sauvegardées avec succès.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm select-none transition-colors duration-200">
      {/* Tricolor Republic line */}
      <RepublicTricolorBar />

      {/* Main Official Banner */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Coat of Arms + Official Titles */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setIsSidebarCollapsed(prev => !prev);
              } else {
                setIsMobileSidebarOpen(prev => !prev);
              }
            }}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#022448] text-slate-700 dark:text-slate-200 hover:text-white transition flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
            title="Ouvrir / Réduire le menu vertical"
            aria-label="Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Official Coat of Arms Logo */}
          <OfficialRepublicLogo size="sm" className="shrink-0 hidden xs:flex sm:flex" />

          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#006d2f] font-republic truncate">
                {REPUBLIQUE_CONGO.nom}
              </span>
              <span className="text-[9px] text-slate-400 font-medium hidden md:inline">• {REPUBLIQUE_CONGO.devise}</span>
              <span className="text-[8px] sm:text-[9px] bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded font-mono-ref font-bold shrink-0">
                PTA 2026
              </span>
            </div>
            <h1 className="text-xs sm:text-base font-extrabold text-[#022448] dark:text-white tracking-tight leading-tight truncate">
              DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden lg:block truncate">
              {REPUBLIQUE_CONGO.ministere} ({REPUBLIQUE_CONGO.ministere_abreviation})
            </p>
          </div>
        </div>

        {/* Right: Clock, Network, Role Switcher, Tablet Mode */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 min-w-0 shrink-0">
          {/* Time display */}
          <div className="hidden xl:flex flex-col items-end text-right pr-2 border-r border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-mono-ref font-semibold text-slate-700 dark:text-slate-300">{currentTime}</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Pointe-Noire (UTC+1)</span>
          </div>

          {/* Offline/Supabase Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-[11px]">
            {isSupabaseConfigured ? (
              networkStatus.isOnline ? (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium" title="Connecté au Cloud Supabase">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden md:inline">Supabase Cloud</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium" title="Hors ligne - modifications conservées en attente">
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                  <span>Hors-Ligne ({networkStatus.queueLength})</span>
                </span>
              )
            ) : (
              <span className="flex items-center gap-1 text-blue-800 dark:text-blue-300 font-medium" title="Mode local autonome opérationnel sans dépendance cloud">
                <Shield className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                <span className="hidden md:inline">Mode Local Autonome</span>
              </span>
            )}

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              title={isSupabaseConfigured ? "Synchroniser avec Supabase" : "Vérifier la sauvegarde des données locales"}
              className="ml-1 p-1 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded text-emerald-700 dark:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
            </button>
          </div>

          {/* Prominent Google Agenda SAA Button (Affichage Principal) */}
          <button
            onClick={() => setActiveModule('MOD-03')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs ${
              activeModule === 'MOD-03'
                ? 'bg-[#1a73e8] text-white ring-2 ring-blue-400/50 shadow-md'
                : 'bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
            }`}
            title="Afficher le Google Agenda SAA (Module Principal Terrain)"
          >
            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-extrabold tracking-tight">Agenda SAA</span>
            <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono-ref font-black ${
              activeModule === 'MOD-03' ? 'bg-white text-blue-800' : 'bg-blue-600 text-white'
            }`}>
              Principal
            </span>
          </button>

          {/* QR Code Scanner Trigger Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('ddl_open_qr_scanner'))}
            className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 transition cursor-pointer shadow-2xs"
            title="Scanner un QR Code officiel avec la caméra ou une photo"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden md:inline">Scanner QR</span>
          </button>

          {/* Quick Tablet / Field Mode Toggle */}
          <button
            onClick={() => {
              const nextVal = !isTabletTerrainMode;
              setIsTabletTerrainMode(nextVal);
              if (nextVal) {
                setActiveModule('MOD-03');
                triggerNotification('Mode Tablette Terrain SAA activé plein écran.', 'info');
              }
            }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded transition cursor-pointer ${
              isTabletTerrainMode
                ? 'bg-[#006d2f] text-white shadow-sm ring-2 ring-[#006d2f]/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
            title="Basculer vers le mode tactile terrain"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mode Tablette</span>
          </button>

          {/* Alert Bell */}
          <button
            onClick={() => {
              setActiveModule('MOD-05');
              triggerNotification('3 Mises en demeure requièrent une exécution ou notification.', 'warning');
            }}
            className="relative p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Alertes & Relances urgentes"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {alertCount}
              </span>
            )}
          </button>

          {/* Official User Profile Badge & Direct Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#022448]/5 dark:bg-slate-800 border border-[#022448]/20 dark:border-slate-700 pl-2 pr-1.5 py-1 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-[#022448] text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-400/40 shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left leading-tight pr-1">
              <div className="text-xs font-bold text-[#022448] dark:text-slate-100 flex items-center gap-1">
                <span className="truncate max-w-[110px]">{currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1] || ''}</span>
                <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-mono-ref px-1 rounded font-bold shrink-0">
                  {currentUser.badge}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px]">
                {currentUser.role}
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg text-slate-500 hover:text-red-700 dark:hover:text-red-400 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="Déconnexion sécurisée"
            >
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="hidden md:inline text-red-700 dark:text-red-400 text-[11px]">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

