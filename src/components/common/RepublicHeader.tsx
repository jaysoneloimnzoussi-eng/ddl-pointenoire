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
  LogOut
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { APP_USERS, REPUBLIQUE_CONGO } from '../../constants/referential';
import { OfficialRepublicLogo, RepublicTricolorBar } from './OfficialSeal';
import { storageService } from '../../services/storageService';

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
    switchUserById,
    logout,
    activeModule,
    setActiveModule,
    isTabletBrigadeMode,
    setIsTabletBrigadeMode,
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
      setCurrentTime(
        now.toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' • ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setNetworkStatus(storageService.getNetworkStatus());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncNow = () => {
    storageService.flushOfflineQueue();
    setNetworkStatus(storageService.getNetworkStatus());
    triggerNotification('Synchronisation immédiate avec Supabase réussie.', 'success');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm select-none">
      {/* Tricolor Republic line */}
      <RepublicTricolorBar />

      {/* Main Official Banner */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Coat of Arms + Official Titles */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => {
              // On desktop toggle collapse, on mobile toggle open
              if (window.innerWidth >= 1024) {
                setIsSidebarCollapsed(prev => !prev);
              } else {
                setIsMobileSidebarOpen(prev => !prev);
              }
            }}
            className="p-2 rounded-lg bg-slate-100 hover:bg-[#022448] text-slate-700 hover:text-white transition flex items-center justify-center border border-slate-200"
            title="Ouvrir / Réduire le menu vertical"
            aria-label="Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Official Coat of Arms Logo */}
          <OfficialRepublicLogo size="sm" className="shrink-0" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#006d2f] font-republic">
                {REPUBLIQUE_CONGO.nom}
              </span>
              <span className="text-[9px] text-slate-400 font-medium hidden md:inline">• {REPUBLIQUE_CONGO.devise}</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-mono-ref font-bold">
                PTA 2026
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-[#022448] tracking-tight leading-tight">
              DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE
            </h1>
            <p className="text-[10px] text-slate-500 font-medium hidden lg:block">
              {REPUBLIQUE_CONGO.ministere} ({REPUBLIQUE_CONGO.ministere_abreviation})
            </p>
          </div>
        </div>

        {/* Right: Clock, Network, Role Switcher, Tablet Mode */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Time display */}
          <div className="hidden xl:flex flex-col items-end text-right pr-2 border-r border-slate-200">
            <span className="text-[11px] font-mono-ref font-semibold text-slate-700">{currentTime}</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Pointe-Noire (UTC+1)</span>
          </div>

          {/* Offline/Supabase Status Indicator */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[11px]">
            {networkStatus.isOnline ? (
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Supabase Actif</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Hors-Ligne ({networkStatus.queueLength})</span>
              </span>
            )}

            {networkStatus.queueLength > 0 && (
              <button
                onClick={handleSyncNow}
                title="Synchroniser les données locales"
                className="ml-1 p-0.5 hover:bg-emerald-100 rounded text-emerald-700 transition"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
              </button>
            )}
          </div>

          {/* Quick Tablet / Field Mode Toggle */}
          <button
            onClick={() => {
              const nextVal = !isTabletBrigadeMode;
              setIsTabletBrigadeMode(nextVal);
              if (nextVal) {
                setActiveModule('MOD-03');
                triggerNotification('Mode Tablette Brigade SAA activé plein écran.', 'info');
              }
            }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded transition ${
              isTabletBrigadeMode
                ? 'bg-[#006d2f] text-white shadow-sm ring-2 ring-[#006d2f]/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
            title="Basculer vers le mode tactile brigade terrain"
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
            className="relative p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Alertes & Relances urgentes"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {alertCount}
              </span>
            )}
          </button>

          {/* Official Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 bg-[#022448]/5 hover:bg-[#022448]/10 border border-[#022448]/20 px-2.5 py-1.5 rounded text-left transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#022448] text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-400/40">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-bold text-[#022448] flex items-center gap-1">
                  <span>{currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1] || ''}</span>
                  <span className="text-[9px] bg-amber-100 text-amber-900 font-mono-ref px-1 rounded">
                    {currentUser.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Changer d'utilisateur assermenté
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {APP_USERS.map(user => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUserById(user.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition ${
                          isSelected ? 'bg-emerald-50 text-[#006d2f] font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <UserCheck className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-[#006d2f]' : 'text-slate-400'}`} />
                        <div className="text-xs leading-snug">
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{user.name}</span>
                            <span className="text-[9px] font-mono-ref bg-slate-100 text-slate-600 px-1 rounded">
                              {user.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">{user.title}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Déconnexion Option */}
                <div className="p-1.5 border-t border-slate-100 bg-slate-50/70">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-md transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion de la session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

