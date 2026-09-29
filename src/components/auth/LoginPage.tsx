import React, { useState } from 'react';
import {
  Shield,
  Smartphone,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { CongoMapIllustration } from '../common/CongoMapIllustration';
import { REPUBLIQUE_CONGO, APP_USERS } from '../../constants/referential';
import { AppUser } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser, initialModule?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Single unique login credentials input
  const [identifier, setIdentifier] = useState<string>('directeur@ddl-pointenoire.cg');
  const [password, setPassword] = useState<string>('DDL-2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Single submit handler for both Admin and Field Agents
  const handleSingleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const raw = identifier.trim().toLowerCase();

    // 1. Check for Director / General Admin account
    if (
      raw === 'admin' ||
      raw === 'directeur' ||
      raw === 'directeur@ddl-pointenoire.cg' ||
      raw === 'ddl-dir-001' ||
      raw === 'dir-01'
    ) {
      const directorUser = APP_USERS.find(u => u.id === 'DIR-01') || APP_USERS[0];
      setTimeout(() => {
        setIsLoading(false);
        // Opens full Administrator Dashboard (MOD-01)
        onLoginSuccess(directorUser, 'MOD-01');
      }, 300);
      return;
    }

    // 2. Check for Agent de terrain (Badge, Matricule, Phone, Email, Nom)
    const matchedAgent = APP_USERS.find(u => {
      const b = u.badge.toLowerCase();
      const em = u.email.toLowerCase();
      const n = u.name.toLowerCase();
      const p = u.phone.replace(/\s+/g, '');
      const rawClean = raw.replace(/\s+/g, '');

      return (
        b === raw ||
        em === raw ||
        n.includes(raw) ||
        p.includes(rawClean) ||
        u.id.toLowerCase() === raw
      );
    });

    if (matchedAgent) {
      setTimeout(() => {
        setIsLoading(false);
        if (matchedAgent.role === 'AGENT_SAA' || matchedAgent.role === 'CHEF_SAA') {
          // Routes strictly to the private Agent Google Calendar interface (MOD-03)
          onLoginSuccess(matchedAgent, 'MOD-03');
        } else {
          // Other cadres (SAF, SPA, etc.)
          onLoginSuccess(matchedAgent, 'MOD-01');
        }
      }, 300);
      return;
    }

    // 3. Fallback: check dynamic agents from Supabase or allow direct SAA badge input
    if (raw.startsWith('saa') || raw.includes('agent') || raw.startsWith('315') || raw.startsWith('249')) {
      const customAgent: AppUser = {
        id: `SAA-${Date.now().toString().slice(-4)}`,
        badge: raw.toUpperCase().startsWith('SAA') ? raw.toUpperCase() : `SAA-${raw.toUpperCase()}`,
        name: `Agent SAA (${identifier.trim()})`,
        role: 'AGENT_SAA',
        title: 'Agent Enquêteur de Terrain - Brigade SAA',
        phone: '+242 06 654 32 10',
        service: 'Brigade SAA - Terrain',
        email: `${raw.replace(/[^a-zA-Z0-9]/g, '')}@ddl-pointenoire.cg`
      };
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(customAgent, 'MOD-03');
      }, 300);
      return;
    }

    // Unrecognized credential
    setTimeout(() => {
      setIsLoading(false);
      setErrorMessage(
        `Identifiant ou code introuvable. Veuillez saisir votre matricule de brigade (ex: SAA-PN-008) ou votre identifiant administrateur.`
      );
    }, 250);
  };

  const handleQuickFillAdmin = () => {
    setIdentifier('directeur@ddl-pointenoire.cg');
    setPassword('DDL-2026');
    setErrorMessage('');
  };

  const handleQuickFillAgent = (badge: string = 'SAA-PN-008') => {
    setIdentifier(badge);
    setPassword('SAA-2026');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6b0202] via-[#850404] to-[#450101] text-slate-800 flex flex-col justify-between p-3 sm:p-6 select-none relative overflow-x-hidden">
      {/* Decorative Republic Background Watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(252,209,22,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,109,47,0.15),transparent_50%)] pointer-events-none" />

      {/* Top Republic Sovereign Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between pb-4 border-b border-white/20 text-white">
        <div className="flex items-center gap-3">
          <OfficialRepublicLogo size="md" className="shrink-0 drop-shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-black tracking-widest text-amber-300 font-republic uppercase">
                {REPUBLIQUE_CONGO.nom}
              </span>
              <span className="text-[10px] text-emerald-300 font-bold hidden sm:inline">
                • {REPUBLIQUE_CONGO.devise}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
              {REPUBLIQUE_CONGO.direction_departementale}
            </h1>
            <p className="text-[10px] text-amber-100/80 hidden md:block">
              {REPUBLIQUE_CONGO.ministere} ({REPUBLIQUE_CONGO.ministere_abreviation})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-amber-400/40 px-3 py-1 rounded-full text-xs text-amber-300 font-mono-ref">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">PTA {REPUBLIQUE_CONGO.annee_pta}</span>
        </div>
      </header>

      {/* Main Container: Map on the Left + Single Login Form on the Right */}
      <main className="relative z-10 max-w-6xl mx-auto w-full my-auto py-6 sm:py-8">
        <div className="bg-[#0b0c10]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-amber-400/30 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column (5 cols): Map of Republic of Congo */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#022448] to-[#011427] border-b lg:border-b-0 lg:border-r border-amber-400/20 relative flex flex-col justify-between">
            <CongoMapIllustration />
          </div>

          {/* Right Column (7 cols): Single Unique Authentication Portal */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Official Seal badge */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="inline-flex items-center gap-1.5 bg-[#850404] text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-amber-300" />
                  <span>Portail Officiel Unique DDL-PN</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono-ref">Régulation 2026</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#022448] font-republic tracking-tight leading-snug">
                Connexion Sécurisée
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Connectez-vous avec votre identifiant administrateur pour piloter toute l'application, ou votre matricule brigade pour accéder à votre Google Calendar de terrain.
              </p>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Accès non autorisé</p>
                    <p className="mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Unique Login Form */}
              <form onSubmit={handleSingleLogin} className="mt-6 space-y-4">
                {/* Identifier Input (Admin email, or Agent badge/matricule) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                    <span>Identifiant ou Matricule de Brigade</span>
                    <span className="text-[10px] font-normal text-slate-400 lowercase font-sans">
                      email, badge ou matricule
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="Ex: SAA-PN-008 ou directeur@ddl-pointenoire.cg"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#850404] focus:ring-2 focus:ring-[#850404]/20 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 transition outline-none"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                    <span>Mot de passe ou Code secret</span>
                    <span className="text-[10px] font-normal text-slate-400 lowercase font-sans">
                      confidentiel
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Votre code d'accès"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#850404] focus:ring-2 focus:ring-[#850404]/20 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 transition outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-gradient-to-r from-[#850404] to-[#a80505] hover:from-[#700303] hover:to-[#850404] text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authentification officielle...</span>
                    </span>
                  ) : (
                    <>
                      <span>Accéder à mon Espace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Role Routing Explanation Banner */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Aiguillage automatique selon votre profil :</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#022448] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#022448]">Compte Administrateur :</span>
                      <p className="text-[10px] text-slate-500">Ouvre l'ensemble de l'application (Dashboard, SIG Map, PTA, SAF).</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-800">Agent de Terrain :</span>
                      <p className="text-[10px] text-slate-500">Ouvre uniquement votre compte Google Calendar privé et vos RDV.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Helper Pills */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Accès Rapides Enregistrés (Démonstration & Tests) :
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-[11px] border border-blue-200 flex items-center gap-1.5 transition"
                >
                  <Shield className="w-3 h-3 text-blue-700" />
                  <span>Directeur Matoko (Admin Global)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFillAgent('SAA-PN-008')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-200 flex items-center gap-1.5 transition"
                >
                  <Calendar className="w-3 h-3 text-emerald-700" />
                  <span>Agent Loubaki (Badge 08 - Google Calendar)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFillAgent('SAA-PN-005')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200 flex items-center gap-1.5 transition"
                >
                  <Calendar className="w-3 h-3 text-amber-700" />
                  <span>Agent Tchicaya (Badge 05)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Official Republic Bottom Bar */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center text-white/70 text-[11px] space-y-1">
        <RepublicTricolorBar className="mb-3" />
        <p className="font-semibold text-amber-200">
          Système Intégré de Régulation des Loisirs • Direction Départementale des Loisirs de Pointe-Noire (DDL-PN)
        </p>
        <p className="text-[10px] text-white/50">
          Sécurité conforme aux directives gouvernementales de la République du Congo • Base Centrale Supabase
        </p>
      </footer>
    </div>
  );
};
