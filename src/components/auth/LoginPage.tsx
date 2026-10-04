import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Landmark,
  CheckCircle2
} from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { CongoMapIllustration } from '../common/CongoMapIllustration';
import { REPUBLIQUE_CONGO } from '../../constants/referential';
import { AppUser } from '../../types';
import { authService } from '../../services/authService';
import { QrCode } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser, initialModule?: string) => void;
  onOpenScanner?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onOpenScanner }) => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authService.authenticate(identifier.trim(), password);

      if (result.success && result.user) {
        if (rememberMe) {
          localStorage.setItem('ddl_pn_remembered_user', result.user.email);
        } else {
          localStorage.removeItem('ddl_pn_remembered_user');
        }
        onLoginSuccess(result.user, result.targetModule);
      } else {
        setErrorMessage(result.error || 'Identifiants non reconnus. Veuillez vérifier votre mot de passe.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur lors de la vérification de vos accréditations.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-800 flex flex-col justify-between p-3 sm:p-6 select-none relative overflow-x-hidden">
      {/* Subtle executive background accents */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#021b35] via-[#051f3b] to-[#010e1c] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#006d2f] via-[#fcd116] to-[#dc241f]" />

      {/* Top Republic Sovereign Bar */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-3 text-white">
        <div className="flex items-center gap-3">
          <OfficialRepublicLogo size="md" className="shrink-0 drop-shadow" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-black tracking-widest text-amber-300 font-republic uppercase">
                {REPUBLIQUE_CONGO.nom}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline">
                • {REPUBLIQUE_CONGO.devise}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
              {REPUBLIQUE_CONGO.direction_departementale}
            </h1>
            <p className="text-[10px] text-slate-300 hidden md:block">
              {REPUBLIQUE_CONGO.ministere}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-amber-400/30 px-3 py-1 rounded-full text-xs text-amber-300 font-mono-ref">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">PTA {REPUBLIQUE_CONGO.annee_pta}</span>
        </div>
      </header>

      {/* Central Login Card */}
      <main className="relative z-10 max-w-5xl mx-auto w-full my-auto py-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column (5 cols): Pure PNG Map of Congo without background */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#f8fafd] via-white to-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-center items-center">
            <CongoMapIllustration />
          </div>

          {/* Right Column (7 cols): Secure Government Authentication */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-1.5 bg-[#022448] text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-amber-300" />
                  <span>Portail Officiel des Agents & Régulateurs</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono-ref font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Système Sécurisé
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#022448] font-republic tracking-tight leading-snug">
                Connexion à l'Espace DDL-PN
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Veuillez renseigner vos identifiants officiels d'assermentation pour accéder à vos modules de travail :
              </p>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-900 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block">Erreur d'authentification</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* OFFICIAL AUTHENTICATION FORM */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
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
                      placeholder="Votre nom d'utilisateur, matricule ou email"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#022448] focus:border-[#022448] transition"
                    />
                  </div>
                </div>

                {/* 2. Password Input with Show/Hide Toggle */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mot de Passe de Session <span className="text-red-600">*</span>
                  </label>
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
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#022448] focus:border-[#022448] transition font-mono-ref"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-[#022448] rounded cursor-pointer"
                    />
                    <span className="font-medium">Mémoriser cet appareil</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono-ref">Chiffrement AES-256</span>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#022448] via-[#033468] to-[#022448] hover:from-[#033468] hover:to-[#044488] text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-amber-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-lg active:scale-[0.99]"
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

              {/* Public QR Code Scanner Trigger for Non-authenticated users / Police / Citizens */}
              {onOpenScanner && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onOpenScanner}
                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#006d2f] border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                  >
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>Contrôle Citoyen & Police : Scanner un QR Code / Badge</span>
                  </button>
                </div>
              )}

              {/* Secure Support Box (Strict Confidentiality - No Directory) */}
              <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-[#006d2f]" />
                  <span>Assistance & Accréditations Officielles :</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  En cas d'oubli ou d'initialisation de mot de passe, veuillez contacter l'Administrateur du Système (M. Jacques MATOKO) ou la Direction Départementale des Loisirs de Pointe-Noire.
                </p>
              </div>

            </div>

            {/* Micro footer instructions */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Accréditation DDL-PN Active
              </span>
              <span>DDL-PN Pointe-Noire © 2026</span>
            </div>

          </div>
        </div>
      </main>

      {/* Official Republic Bottom Bar */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center text-white/70 text-[11px] space-y-1">
        <RepublicTricolorBar className="mb-2" />
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
