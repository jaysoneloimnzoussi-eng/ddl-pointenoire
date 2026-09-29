import React, { useState } from 'react';
import {
  Shield,
  Smartphone,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  Check,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { REPUBLIQUE_CONGO, APP_USERS } from '../../constants/referential';
import { AppUser } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser, initialModule?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'AGENT'>('ADMIN');

  // Admin login states
  const [selectedAdminId, setSelectedAdminId] = useState<string>('DIR-01');
  const [adminPassword, setAdminPassword] = useState<string>('congo2026');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string>('');

  // Agent terrain states
  const [selectedAgentId, setSelectedAgentId] = useState<string>('SAA-008');
  const [agentPin, setAgentPin] = useState<string>('1234');
  const [agentError, setAgentError] = useState<string>('');

  // Quick list of admins
  const adminUsers = APP_USERS.filter(u => u.role !== 'AGENT_SAA');
  // Quick list of field agents
  const agentUsers = APP_USERS.filter(u => u.role === 'AGENT_SAA' || u.role === 'CHEF_SAA');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (!adminPassword) {
      setAdminError('Veuillez saisir votre mot de passe d\'habilitation.');
      return;
    }
    const user = APP_USERS.find(u => u.id === selectedAdminId) || APP_USERS[0];
    onLoginSuccess(user, 'MOD-01');
  };

  const handleAgentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAgentError('');
    if (!agentPin || agentPin.length < 4) {
      setAgentError('Le code PIN assermenté doit comporter 4 chiffres.');
      return;
    }
    const user = APP_USERS.find(u => u.id === selectedAgentId) || APP_USERS[2];
    // Automatically route agents to field portal / Google agenda
    onLoginSuccess(user, 'MOD-03');
  };

  const handleQuickDemoAdmin = (userId: string) => {
    setSelectedAdminId(userId);
    setAdminPassword('congo2026');
    const user = APP_USERS.find(u => u.id === userId) || APP_USERS[0];
    onLoginSuccess(user, 'MOD-01');
  };

  const handleQuickDemoAgent = (userId: string) => {
    setSelectedAgentId(userId);
    setAgentPin('1234');
    const user = APP_USERS.find(u => u.id === userId) || APP_USERS[2];
    onLoginSuccess(user, 'MOD-03');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#011427] via-[#022448] to-[#01381b] text-slate-800 flex flex-col justify-between p-3 sm:p-6 relative overflow-hidden select-none">
      {/* Background Republic Watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full border-[60px] border-white flex items-center justify-center font-republic text-9xl font-black text-white">
          DDL
        </div>
      </div>

      {/* Top Bar with Republic Emblem */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between pb-4 border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          <OfficialRepublicLogo size="md" className="shrink-0 drop-shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-400 font-republic uppercase">
                {REPUBLIQUE_CONGO.nom}
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold hidden sm:inline">
                • {REPUBLIQUE_CONGO.devise}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
              Direction Départementale des Loisirs de Pointe-Noire
            </h1>
            <p className="text-[10px] text-slate-300 hidden md:block">
              {REPUBLIQUE_CONGO.ministere}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs text-emerald-300 font-mono-ref">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Portail Sécurisé SAA 2026</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-4xl mx-auto w-full my-auto py-6 sm:py-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-sm grid grid-cols-1 lg:grid-cols-12">
          {/* Left Hero / Brand Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#022448] to-[#011a35] text-white p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/50">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider mb-4 shadow-sm">
                <Shield className="w-3.5 h-3.5" />
                <span>Système Intégré Officiel</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-republic tracking-tight leading-snug">
                Plateforme Numérique de Régulation & Recouvrement
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                Accès exclusif des fonctionnaires et agents assermentés de la Direction Départementale des Loisirs de Pointe-Noire.
              </p>

              {/* Badges / Highlights */}
              <div className="mt-6 space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Poste de commandement & 6 arrondissements</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Google Agenda SAA & Enquêtes in situ</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Recouvrement 100% hors-ligne synchronisé</span>
                </div>
              </div>
            </div>

            {/* Republic Color Line & Footer of Left Col */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <RepublicTricolorBar className="mb-3" />
              <p className="text-[10px] text-slate-400 font-mono-ref">
                Homologation Arrêté Ministériel • Exercice {REPUBLIQUE_CONGO.annee_pta}
              </p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50 flex flex-col justify-between">
            <div>
              {/* Tab Selector: ADMIN vs AGENT TERRAIN */}
              <div className="bg-slate-200/80 p-1 rounded-xl flex gap-1 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('ADMIN')}
                  className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                    activeTab === 'ADMIN'
                      ? 'bg-white text-[#022448] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4 text-[#022448]" />
                  <span>Direction & Cadres</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('AGENT')}
                  className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                    activeTab === 'AGENT'
                      ? 'bg-[#006d2f] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Agents de Terrain (SAA)</span>
                </button>
              </div>

              {/* Form 1: Admin & Cadres */}
              {activeTab === 'ADMIN' ? (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Identité du Cadre / Fonctionnaire
                    </label>
                    <select
                      value={selectedAdminId}
                      onChange={e => setSelectedAdminId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#022448] shadow-sm"
                    >
                      {adminUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.title} ({u.badge})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mot de passe d'habilitation
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        placeholder="Mot de passe sécurisé"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 pr-10 focus:outline-none focus:ring-2 focus:ring-[#022448] shadow-sm font-mono-ref"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Identifiant par défaut prérempli pour démonstration : <strong className="font-mono-ref">congo2026</strong>
                    </p>
                  </div>

                  {adminError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-medium">
                      {adminError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#022448] to-[#023b75] hover:from-[#011a35] hover:to-[#022448] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group"
                  >
                    <span>Ouvrir la Session Administrateur</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>

                  {/* Fast Switch Badges */}
                  <div className="pt-3 border-t border-slate-200/80">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                      Accès rapide un-clic :
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {adminUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickDemoAdmin(u.id)}
                          className="text-[11px] bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-semibold transition flex items-center gap-1.5 shadow-2xs"
                        >
                          <UserCheck className="w-3 h-3 text-[#022448]" />
                          <span>{u.name.split(' ')[0]} ({u.role.replace('_', ' ')})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              ) : (
                /* Form 2: Agents de terrain SAA */
                <form onSubmit={handleAgentLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Agent Assermenté de Brigade
                    </label>
                    <select
                      value={selectedAgentId}
                      onChange={e => setSelectedAgentId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006d2f] shadow-sm"
                    >
                      {agentUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.badge}) — {u.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Code PIN Assermenté (4 Chiffres)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={4}
                        value={agentPin}
                        onChange={e => setAgentPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-center text-xl tracking-[0.5em] font-mono-ref font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006d2f] shadow-sm"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 text-center">
                      Code d'habilitation terrain prérempli : <strong className="font-mono-ref">1234</strong>
                    </p>
                  </div>

                  {agentError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-medium">
                      {agentError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#006d2f] to-[#028a3d] hover:from-[#005a26] hover:to-[#006d2f] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Lancer le Portail Terrain & Google Agenda</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>

                  {/* Fast Switch Agent Badges */}
                  <div className="pt-3 border-t border-slate-200/80">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                      Sélection immédiate de l'agent en tournée :
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {agentUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickDemoAgent(u.id)}
                          className="text-[11px] bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-lg text-slate-700 font-semibold transition flex items-center gap-1.5 shadow-2xs"
                        >
                          <Smartphone className="w-3 h-3 text-[#006d2f]" />
                          <span>{u.name} ({u.badge})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Offline & Security Guarantee */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Compatible connexion 4G instable & fonctionnement 100% hors-ligne.</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center text-[10px] sm:text-xs text-slate-400 pt-4 border-t border-white/10">
        <p>
          République du Congo • Ministère de la Culture, des Arts, du Tourisme et des Loisirs • Direction Départementale des Loisirs de Pointe-Noire (DDL-PN)
        </p>
        <p className="text-slate-500 mt-1">
          Tous droits réservés • Déploiement Vercel & PWA Mobile Ready • Version 2.0.0-PROD-2026
        </p>
      </footer>
    </div>
  );
};
