import React from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import { RepublicHeader } from './components/common/RepublicHeader';
import { VerticalSidebar } from './components/common/VerticalSidebar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardModule } from './components/modules/DashboardModule';
import { FieldRecensementModule } from './components/modules/FieldRecensementModule';
import { MobileAgentCalendarModule } from './components/modules/MobileAgentCalendarModule';
import { GoogleWorkspaceGatewayModule } from './components/modules/GoogleWorkspaceGatewayModule';
import { LegalActsGeneratorModule } from './components/modules/LegalActsGeneratorModule';
import { QuarterlyReportsModule } from './components/modules/QuarterlyReportsModule';
import { SigMapModule } from './components/modules/SigMapModule';
import { SpaPromotionModule } from './components/modules/SpaPromotionModule';
import { TransmissionDglModule } from './components/modules/TransmissionDglModule';
import { SafRegieRecettesModule } from './components/modules/SafRegieRecettesModule';
import { TitlesAndReceiptsModule } from './components/modules/TitlesAndReceiptsModule';
import { LegalTextsAndSimulatorModule } from './components/modules/LegalTextsAndSimulatorModule';
import { PtaTrackerModule } from './components/modules/PtaTrackerModule';
import { RepublicTricolorBar, OfficialRepublicLogo } from './components/common/OfficialSeal';
import { REPUBLIQUE_CONGO } from './constants/referential';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    login,
    activeModule,
    isTabletBrigadeMode,
    activeNotification,
    clearNotification
  } = useSession();

  // If not authenticated, render LoginPage
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={login} />;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'MOD-01':
        return <DashboardModule />;
      case 'MOD-02':
        return <FieldRecensementModule />;
      case 'MOD-03':
        return <MobileAgentCalendarModule />;
      case 'MOD-04':
        return <GoogleWorkspaceGatewayModule />;
      case 'MOD-05':
        return <LegalActsGeneratorModule />;
      case 'MOD-06':
        return <QuarterlyReportsModule />;
      case 'MOD-07':
        return <SigMapModule />;
      case 'MOD-08':
        return <SpaPromotionModule />;
      case 'MOD-09':
        return <TransmissionDglModule />;
      case 'MOD-10':
        return <SafRegieRecettesModule />;
      case 'MOD-11':
        return <TitlesAndReceiptsModule />;
      case 'MOD-12':
        return <LegalTextsAndSimulatorModule />;
      case 'MOD-13':
        return <PtaTrackerModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafd] text-slate-800">
      {/* Top Header */}
      <RepublicHeader />

      {/* Instant Notification Toast */}
      {activeNotification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-white border border-slate-300 shadow-2xl rounded-xl p-3.5 flex items-start gap-3 animate-in slide-in-from-bottom-5">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              activeNotification.type === 'success'
                ? 'bg-emerald-100 text-emerald-800'
                : activeNotification.type === 'warning'
                ? 'bg-amber-100 text-amber-900'
                : activeNotification.type === 'error'
                ? 'bg-red-100 text-red-900'
                : 'bg-blue-100 text-blue-900'
            }`}
          >
            {activeNotification.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : activeNotification.type === 'warning' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 text-xs">
            <span className="font-extrabold text-[#022448] block mb-0.5">Notification Système DDL-PN</span>
            <p className="text-slate-700 leading-snug">{activeNotification.message}</p>
          </div>
          <button onClick={clearNotification} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Body Layout with Vertical Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Vertical Left Sidebar */}
        <VerticalSidebar />

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${isTabletBrigadeMode ? 'p-2 sm:p-3' : 'p-3 sm:p-6'} bg-[#f8fafd]`}>
          <div className="max-w-[1720px] mx-auto">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Official Republic Footer */}
      <footer className="no-print bg-[#022448] text-white border-t border-[#033468] py-6 mt-12 text-xs">
        <RepublicTricolorBar className="mb-6 -mt-6" />
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <OfficialRepublicLogo size="md" showMotto={false} className="hidden sm:flex shrink-0" />
            <div>
              <p className="font-bold text-amber-300 uppercase tracking-widest text-[11px] font-republic">
                {REPUBLIQUE_CONGO.nom} • {REPUBLIQUE_CONGO.devise}
              </p>
              <p className="text-slate-300 font-medium">
                {REPUBLIQUE_CONGO.direction_departementale}
              </p>
              <p className="text-[10px] text-slate-400">
                {REPUBLIQUE_CONGO.siege} • {REPUBLIQUE_CONGO.contact}
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400 space-y-1">
            <p className="text-slate-200 font-semibold">
              Système Intégré de Régulation des Loisirs • Version 2.0.0-PROD-2026
            </p>
            <p>
              Homologué pour le Plan de Travail Annuel ({REPUBLIQUE_CONGO.annee_pta}) • Supabase & Local Fallback
            </p>
            <p className="text-[10px] text-slate-500">
              © {new Date().getFullYear()} Ministère de la Culture, des Arts, du Tourisme et des Loisirs (MCAPNIT)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
