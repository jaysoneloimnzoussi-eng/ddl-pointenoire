import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Smartphone,
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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Shield,
  Building2,
  X
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { OfficialRepublicLogo, RepublicTricolorBar } from './OfficialSeal';

interface NavSection {
  title: string;
  items: Array<{
    id: string;
    num: string;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

const SIDEBAR_SECTIONS: NavSection[] = [
  {
    title: 'PILOTAGE & STRATÉGIE',
    items: [
      { id: 'MOD-01', num: '01', label: 'Poste de Commandement', shortLabel: 'Commandement', icon: LayoutDashboard },
      { id: 'MOD-13', num: '13', label: 'Suivi Opérationnel PTA 2026', shortLabel: 'Suivi PTA 2026', icon: Target },
      { id: 'MOD-06', num: '06', label: 'Rapports Trimestriels A4', shortLabel: 'Rapports A4', icon: FileBarChart }
    ]
  },
  {
    title: 'CONTRÔLE & BRIGADE SAA',
    items: [
      { id: 'MOD-02', num: '02', label: 'Recensement & Recouvrement SAA', shortLabel: 'Recensement SAA', icon: ClipboardList, badge: '118' },
      { id: 'MOD-03', num: '03', label: 'Portail Terrain & Google Agenda SAA', shortLabel: 'Portail Terrain SAA', icon: Smartphone, badge: 'Agent' },
      { id: 'MOD-07', num: '07', label: 'SIG Cartographique Pointe-Noire', shortLabel: 'Carte SIG', icon: MapPin },
      { id: 'MOD-04', num: '04', label: 'Passerelle Google Workspace', shortLabel: 'Google Workspace', icon: CloudDownload },
      { id: 'MOD-05', num: '05', label: 'Atelier des Actes & Sanctions', shortLabel: 'Actes & Saisines', icon: FileCheck2, badge: '72h' }
    ]
  },
  {
    title: 'FINANCES & RÉGIE SAF',
    items: [
      { id: 'MOD-10', num: '10', label: 'Régie SAF & Trésor Public', shortLabel: 'Régie & Trésor', icon: Landmark, badge: '70/30' },
      { id: 'MOD-11', num: '11', label: 'Attestations & Quittances POS', shortLabel: 'Attestations & POS', icon: Receipt },
      { id: 'MOD-12', num: '12', label: 'Textes & Simulateur Tarifaire', shortLabel: 'Barèmes & Textes', icon: Calculator }
    ]
  },
  {
    title: 'CENTRAL DGL & PROMOTION',
    items: [
      { id: 'MOD-09', num: '09', label: 'Transmission DGL Brazzaville', shortLabel: 'DGL Brazzaville', icon: Send },
      { id: 'MOD-08', num: '08', label: 'Promotion Loisirs Sains (SPA)', shortLabel: 'SPA & Labels', icon: Sparkles }
    ]
  }
];

export const VerticalSidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isTabletBrigadeMode,
    setIsTabletBrigadeMode,
    currentUser,
    switchUserById,
    logout
  } = useSession();

  const handleSelectModule = (id: string) => {
    setActiveModule(id);
    if (id !== 'MOD-03' && isTabletBrigadeMode) {
      setIsTabletBrigadeMode(false);
    }
    // Auto close mobile drawer on select
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Main Vertical Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[69px] left-0 z-50 lg:z-30 h-screen lg:h-[calc(100vh-69px)] bg-[#022448] text-white flex flex-col border-r border-[#033468] shadow-xl transition-all duration-300 select-none ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'w-20' : 'w-72 sm:w-76'}`}
      >
        {/* Tricolor Mini Top Bar */}
        <RepublicTricolorBar />

        {/* Sidebar Header with DDL-PN Logo & Collapse Toggle */}
        <div className="p-3.5 border-b border-[#033468] flex items-center justify-between bg-[#011b36]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <OfficialRepublicLogo size="sm" className="shrink-0" />
            {!isSidebarCollapsed && (
              <div className="leading-tight truncate">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 font-mono-ref block">
                  DDL-PN 2026
                </span>
                <span className="text-xs font-black text-white tracking-tight uppercase truncate block font-republic">
                  Navigation Intégrée
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Button */}
            <button
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              title={isSidebarCollapsed ? 'Développer le menu vertical' : 'Réduire le menu'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Badge Info Card in Sidebar */}
        {!isSidebarCollapsed && (
          <div className="px-3.5 py-2.5 bg-white/5 border-b border-[#033468] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#006d2f] text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-400/30 shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="leading-tight truncate text-xs">
              <p className="font-extrabold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-amber-300/90 font-mono-ref truncate">{currentUser.badge} • {currentUser.role}</p>
            </div>
          </div>
        )}

        {/* Scrollable List of Modules according to role */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Quick Return to Admin Button if logged in as agent */}
          {currentUser.role === 'AGENT_SAA' && (
            <div className="mb-3 px-1">
              <button
                onClick={() => {
                  switchUserById('ADMIN-MATOKO');
                  setActiveModule('MOD-01');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2.5'} bg-gradient-to-r from-red-900 via-[#850404] to-red-950 hover:from-red-800 hover:to-red-900 text-white font-bold text-xs rounded-xl shadow-md border border-amber-400/40 transition cursor-pointer group`}
                title="👑 Retourner à la session Administrateur (Jacques MATOKO)"
              >
                <Shield className="w-4 h-4 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                {!isSidebarCollapsed && (
                  <div className="text-left leading-tight">
                    <span className="block text-[11px] font-black text-amber-300">Espace Admin</span>
                    <span className="block text-[9px] text-white/80 font-normal">Jacques MATOKO</span>
                  </div>
                )}
              </button>
            </div>
          )}

          {(currentUser.role === 'AGENT_SAA'
            ? [
                {
                  title: 'MON ESPACE TERRAIN (AGENT)',
                  items: [
                    { id: 'MOD-03', num: '03', label: 'Mon Agenda Google Calendar', shortLabel: 'Mon Agenda', icon: Smartphone, badge: currentUser.badge },
                    { id: 'MOD-02', num: '02', label: 'Mes Établissements & Convocations', shortLabel: 'Mes Établissements', icon: ClipboardList },
                    { id: 'MOD-07', num: '07', label: 'Carte SIG de Mes Tournées', shortLabel: 'Ma Carte SIG', icon: MapPin },
                  ]
                }
              ]
            : SIDEBAR_SECTIONS
          ).map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isSidebarCollapsed ? (
                <div className="px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 font-mono-ref">
                  {section.title}
                </div>
              ) : (
                <div className="my-1.5 border-t border-[#033468] mx-2" />
              )}

              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectModule(item.id)}
                    title={`${item.id} : ${item.label}`}
                    className={`w-full flex items-center rounded-lg transition-all duration-150 group relative text-left ${
                      isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-[#006d2f] text-white font-bold shadow-md ring-1 ring-amber-400/60 border-l-4 border-amber-400'
                        : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {/* Icon */}
                    <div className="relative shrink-0">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-amber-300' : 'text-slate-300 group-hover:text-white'
                        }`}
                      />
                    </div>

                    {/* Labels & Badges */}
                    {!isSidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between truncate leading-tight">
                        <span className="text-xs truncate">{item.label}</span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono-ref font-bold px-1.5 py-0.2 rounded ${
                                isActive ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-amber-300'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-mono-ref px-1 py-0.2 rounded ${
                              isActive ? 'bg-black/20 text-white font-bold' : 'text-slate-400'
                            }`}
                          >
                            {item.num}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tooltip in collapsed mode */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 hidden group-hover:flex bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none items-center gap-1.5">
                        <span className="text-[10px] text-amber-400 font-mono-ref font-bold">{item.num}</span>
                        <span>{item.label}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer with PTA Certification & Logout */}
        <div className="p-3 border-t border-[#033468] bg-[#011b36] text-[10px] text-slate-400 space-y-2">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-300">RÉPUBLIQUE DU CONGO</p>
                <p className="text-[9px] text-slate-500">PTA 2026 • 13 Modules Actifs</p>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono-ref text-[9px] font-bold">
                PROD v2.0
              </span>
            </div>
          ) : (
            <div className="text-center font-mono-ref font-bold text-amber-400 text-[10px]">
              2026
            </div>
          )}

          {/* Quick logout action */}
          <button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              logout();
            }}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-2 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition text-xs font-semibold`}
            title="Quitter la session"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-red-400">⎋</span>
              {!isSidebarCollapsed && <span>Déconnexion</span>}
            </div>
            {!isSidebarCollapsed && <span className="text-[9px] text-red-400 font-mono-ref">Fermer</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
