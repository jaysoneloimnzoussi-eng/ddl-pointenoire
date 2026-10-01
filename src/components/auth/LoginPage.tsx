import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronDown,
  Eye,
  EyeOff,
  AlertCircle,
  Key,
  BadgeCheck,
  Smartphone,
  Landmark,
  RefreshCw,
  Search
} from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { CongoMapIllustration } from '../common/CongoMapIllustration';
import { REPUBLIQUE_CONGO } from '../../constants/referential';
import { AppUser, UserAccount } from '../../types';
import { authService, OFFICIAL_USER_ACCOUNTS } from '../../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser, initialModule?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState<string>('ambetos');
  const [password, setPassword] = useState<string>('Ambetos@315');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [directorySearch, setDirectorySearch] = useState<string>('');
  const [isEmergencyInfoOpen, setIsEmergencyInfoOpen] = useState<boolean>(false);

  const allAccounts = authService.getAllAccounts();

  // Filtered accounts for directory search
  const filteredAccounts = allAccounts.filter(acc => {
    const q = directorySearch.toLowerCase();
    return (
      acc.name.toLowerCase().includes(q) ||
      acc.badge.toLowerCase().includes(q) ||
      acc.username.toLowerCase().includes(q) ||
      acc.role.toLowerCase().includes(q) ||
      acc.phone.includes(q)
    );
  });

  // Pre-fill credentials from directory
  const handleSelectAccount = (account: UserAccount, autoSubmit: boolean = false) => {
    setIdentifier(account.username);
    setPassword(account.defaultPassword || 'DdlPn@2026!');
    setErrorMessage(null);

    if (autoSubmit) {
      executeLogin(account.username, account.defaultPassword || 'DdlPn@2026!');
    }
  };

  const executeLogin = async (idToUse: string, pwdToUse: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authService.authenticate(idToUse, pwdToUse);

      if (result.success && result.user) {
        if (rememberMe) {
          localStorage.setItem('ddl_pn_remembered_user', result.user.email);
        } else {
          localStorage.removeItem('ddl_pn_remembered_user');
        }
        onLoginSuccess(result.user, result.targetModule);
      } else {
        setErrorMessage(result.error || 'Identifiants invalides. Veuillez vérifier votre mot de passe.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur de connexion au service d’authentification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(identifier, password);
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

      {/* Main Authentication Container */}
      <main className="relative z-10 max-w-6xl mx-auto w-full my-auto py-4 sm:py-6">
        <div className="bg-[#0b0c10]/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] border border-amber-400/30 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column (5 cols): Official Map of Republic of Congo */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#022448] to-[#011427] border-b lg:border-b-0 lg:border-r border-amber-400/20 relative flex flex-col justify-between">
            <CongoMapIllustration />
          </div>

          {/* Right Column (7 cols): Real Database Authentication Form */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="inline-flex items-center gap-1.5 bg-[#850404] text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-amber-300" />
                  <span>Portail Sécurisé des Agents Assermentés</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono-ref font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Connecté
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#022448] font-republic tracking-tight leading-snug">
                Connexion à l'Espace DDL-PN
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Authentifiez-vous avec votre identifiant officiel (Email, Matricule, Badge ou Nom d'utilisateur) et votre mot de passe :
              </p>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-xl flex items-start gap-2.5 text-red-900 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block">Erreur d'authentification</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* REAL AUTHENTICATION FORM */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
                {/* 1. Identifier Input */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Identifiant Officiel / Matricule / Email <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={e => {
                        setIdentifier(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Ex: ambetos, Jacks.matoko@gmail.com, ou SAA-PN-315"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#850404] focus:border-[#850404] transition"
                    />
                  </div>
                </div>

                {/* 2. Password Input with Show/Hide Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Mot de Passe de Session <span className="text-red-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsEmergencyInfoOpen(!isEmergencyInfoOpen)}
                      className="text-[11px] text-[#006d2f] hover:underline font-semibold"
                    >
                      Mot de passe d'urgence ?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Saisissez votre mot de passe"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#850404] focus:border-[#850404] transition font-mono-ref"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition"
                      title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Emergency Password helper banner */}
                {isEmergencyInfoOpen && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 space-y-1 animate-in fade-in">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <Key className="w-3.5 h-3.5 text-amber-700" />
                      <span>Mot de passe d'urgence Brigade Terrain :</span>
                    </p>
                    <p>
                      En cas d'oubli, vous pouvez utiliser le mot de passe maître de mission : <code className="bg-amber-200/80 px-1.5 py-0.5 rounded font-bold font-mono-ref">DdlPn@2026!</code>
                    </p>
                  </div>
                )}

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-[#850404] rounded cursor-pointer"
                    />
                    <span className="font-medium">Mémoriser cet appareil</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono-ref">Session chiffrée</span>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-900 via-[#850404] to-red-950 hover:from-red-800 hover:to-red-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-amber-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Vérification des accréditations...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-amber-300" />
                      <span>Se Connecter à l'Espace DDL-PN</span>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </button>
              </form>

              {/* ACCORDION: OFFICIAL PERSONNEL DIRECTORY & 1-CLICK TEST FILL */}
              <div className="mt-5 pt-3 border-t border-slate-200">
                <details className="text-xs group" open={false}>
                  <summary className="font-bold text-slate-700 hover:text-[#022448] cursor-pointer flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-600" />
                      <span>Annuaire & Mots de Passe Officiels des Agents ({allAccounts.length} Profils)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>

                  <div className="mt-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3">
                    {/* Search inside accounts */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Filtrer agent par nom, badge ou rôle..."
                        value={directorySearch}
                        onChange={e => setDirectorySearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                      />
                    </div>

                    {/* Scrollable grid of agent account cards */}
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      {filteredAccounts.map(account => {
                        const isAdmin = account.role === 'ADMIN';
                        const isDirector = account.role === 'DIRECTEUR';
                        return (
                          <div
                            key={account.id}
                            onClick={() => handleSelectAccount(account, false)}
                            className={`p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                              identifier.toLowerCase() === account.username.toLowerCase() ||
                              identifier.toLowerCase() === account.email.toLowerCase()
                                ? 'bg-amber-50 border-amber-400 shadow-xs'
                                : 'bg-white hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isAdmin
                                    ? 'bg-red-900 text-amber-300'
                                    : isDirector
                                    ? 'bg-[#022448] text-white'
                                    : 'bg-emerald-700 text-white'
                                }`}
                              >
                                {account.name.charAt(0)}
                              </div>
                              <div className="min-w-0 leading-tight">
                                <div className="font-extrabold text-slate-900 flex items-center gap-1.5 truncate">
                                  <span>{account.name}</span>
                                  <span className="text-[9px] bg-slate-100 font-mono-ref px-1 rounded text-slate-600 font-bold shrink-0">
                                    {account.badge}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  ID: <strong className="text-slate-800 font-mono-ref">{account.username}</strong> • Pass: <strong className="text-[#006d2f] font-mono-ref">{account.defaultPassword}</strong>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleSelectAccount(account, true);
                              }}
                              className="shrink-0 ml-2 px-2.5 py-1 bg-slate-800 hover:bg-[#850404] text-white text-[10px] font-bold rounded-lg transition"
                              title="Se connecter directement avec ce profil"
                            >
                              Entrer
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </details>
              </div>

            </div>

            {/* Micro footer instructions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Base Supabase connectée • Table app_users
              </span>
              <span>DDL-PN Pointe-Noire © 2026</span>
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
          Ministère de la Culture, des Arts, du Tourisme et des Loisirs • République du Congo
        </p>
      </footer>
    </div>
  );
};
