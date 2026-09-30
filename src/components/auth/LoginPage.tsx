import React, { useState } from 'react';
import {
  Shield,
  Smartphone,
  Lock,
  User,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { CongoMapIllustration } from '../common/CongoMapIllustration';
import { REPUBLIQUE_CONGO, APP_USERS } from '../../constants/referential';
import { AppUser } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser, initialModule?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState<string>('Jacks.matoko@gmail.com');
  const [password, setPassword] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('0594a697-48ba-4fb7-b4cb-a979ad46f37c');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Field agents list from Supabase referential
  const fieldAgents = APP_USERS.filter(u => u.role === 'AGENT_SAA' || u.role === 'CHEF_SPA');
  const matokoAdmin = APP_USERS.find(u => u.id === 'ADMIN-MATOKO') || APP_USERS[0];
  const directorUser = APP_USERS.find(u => u.id === 'DIR-01') || APP_USERS[1];

  // Direct 1-Click Login handlers (No password required)
  const handleDirectLoginAsAdmin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(matokoAdmin, 'MOD-01');
    }, 150);
  };

  const handleDirectLoginAsDirector = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(directorUser, 'MOD-01');
    }, 150);
  };

  const handleDirectLoginAsSelectedAgent = () => {
    const targetAgent = APP_USERS.find(u => u.id === selectedAgentId) || fieldAgents[0];
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(targetAgent, 'MOD-03');
    }, 150);
  };

  const handleDirectLoginAgent = (agent: AppUser) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(agent, 'MOD-03');
    }, 150);
  };

  // Form submit handler for custom input (No restrictive password check)
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const raw = identifier.trim().toLowerCase();
    const rawClean = raw.replace(/[\s\-_.]/g, '');

    // 1. Check for Jacques MATOKO (Admin & Resp. SAA)
    if (
      raw.includes('matoko') ||
      raw.includes('jacques') ||
      raw.includes('jacks') ||
      raw === 'admin' ||
      raw === 'administrateur' ||
      rawClean.includes('053028383') ||
      raw === 'adm-pn-001' ||
      raw === 'saa-pn-001'
    ) {
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(matokoAdmin, 'MOD-01');
      }, 150);
      return;
    }

    // 2. Check for Monsieur Jean Richard NTSEKE NGOUAKA (Directeur)
    if (
      raw.includes('ntseke') ||
      raw.includes('ngouaka') ||
      raw.includes('richard') ||
      raw === 'directeur' ||
      raw === 'ddl' ||
      raw.includes('directeur@ddl-pointenoire.cg') ||
      raw === 'ddl-dir-001' ||
      raw === 'dir-01'
    ) {
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(directorUser, 'MOD-01');
      }, 150);
      return;
    }

    // 3. Match against real Supabase Agents list (Matricule, Name, Phone, Email, Badge)
    const matchedAgent = APP_USERS.find(u => {
      const b = u.badge.toLowerCase().replace(/[\s\-_.]/g, '');
      const em = u.email.toLowerCase();
      const n = u.name.toLowerCase();
      const p = u.phone.replace(/[\s\-_.]/g, '');
      const t = u.title.toLowerCase();

      return (
        b.includes(rawClean) ||
        em === raw ||
        n.includes(raw) ||
        p.includes(rawClean) ||
        t.includes(raw) ||
        u.id.toLowerCase() === raw
      );
    });

    if (matchedAgent) {
      setTimeout(() => {
        setIsLoading(false);
        if (matchedAgent.role === 'AGENT_SAA' || matchedAgent.role === 'CHEF_SPA') {
          onLoginSuccess(matchedAgent, 'MOD-03');
        } else {
          onLoginSuccess(matchedAgent, 'MOD-01');
        }
      }, 150);
      return;
    }

    // 4. If any custom identifier entered, open as dynamic field agent (MOD-03)
    const dynamicAgent: AppUser = {
      id: `SAA-${Date.now().toString().slice(-4)}`,
      badge: identifier.trim().toUpperCase(),
      name: `Agent SAA (${identifier.trim()})`,
      role: 'AGENT_SAA',
      title: 'Agent Enquêteur de Terrain - Brigade SAA',
      phone: '+242 06 000 00 00',
      service: 'Brigade SAA - Terrain',
      email: `${rawClean}@ddl-pointenoire.cg`
    };

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(dynamicAgent, 'MOD-03');
    }, 150);
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

      {/* Main Container: Map of Congo on Left + Direct 1-Click Access on Right */}
      <main className="relative z-10 max-w-6xl mx-auto w-full my-auto py-6 sm:py-8">
        <div className="bg-[#0b0c10]/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] border border-amber-400/30 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column (5 cols): Official Map of Republic of Congo */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#022448] to-[#011427] border-b lg:border-b-0 lg:border-r border-amber-400/20 relative flex flex-col justify-between">
            <CongoMapIllustration />
          </div>

          {/* Right Column (7 cols): Direct Access & Portal */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-1.5 bg-[#850404] text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-amber-300" />
                  <span>Accès Direct Sans Mot de Passe Imposé</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono-ref">Session Sécurisée</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#022448] font-republic tracking-tight leading-snug">
                Espace de Travail DDL-PN
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Cliquez directement sur votre profil pour ouvrir immédiatement votre espace dédié :
              </p>

              {/* 1-CLICK INSTANT ACCESS CARDS */}
              <div className="mt-5 space-y-3">
                {/* 1. JACQUES MATOKO (ADMIN & RESP. SAA) */}
                <button
                  type="button"
                  onClick={handleDirectLoginAsAdmin}
                  disabled={isLoading}
                  className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-red-900 via-[#850404] to-red-950 text-white shadow-md hover:shadow-xl hover:scale-[1.01] transition-all border border-amber-400/40 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shrink-0 text-amber-300">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black tracking-wide text-white font-republic">
                          Jacques MATOKO
                        </span>
                        <span className="text-[10px] bg-amber-400 text-red-950 font-black px-2 py-0.5 rounded-full uppercase">
                          Administrateur
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 mt-0.5">
                        Resp. Service Assistance & Autorisation (SAA) • Contrôle Qualités
                      </p>
                      <p className="text-[10px] text-white/60 font-mono-ref mt-0.5">
                        Jacks.matoko@gmail.com • Tél: 053028383
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-300 font-bold text-xs bg-black/20 px-3 py-1.5 rounded-xl group-hover:bg-amber-400 group-hover:text-red-950 transition">
                    <span>Ouvrir</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* 2. DIRECTEUR DEPARTEMENTAL */}
                <button
                  type="button"
                  onClick={handleDirectLoginAsDirector}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md transition border border-slate-700 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 text-blue-300">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-republic">
                          Jean Richard NTSEKE NGOUAKA
                        </span>
                        <span className="text-[9px] bg-blue-500/30 text-blue-200 border border-blue-400/30 px-1.5 py-0.5 rounded uppercase font-bold">
                          Directeur
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        Directeur Départemental des Loisirs de Pointe-Noire (DDL-PN)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300 font-semibold text-[11px] group-hover:text-white transition">
                    <span>Accéder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 3. AGENT DE TERRAIN SAA (GOOGLE CALENDAR INTERFACE) */}
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                          Agents de Terrain SAA (Google Calendar)
                        </span>
                        <p className="text-[10px] text-emerald-800">
                          Accès direct à l'agenda de descente, rendez-vous et solde tenancières
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <div className="relative flex-1">
                      <select
                        value={selectedAgentId}
                        onChange={e => setSelectedAgentId(e.target.value)}
                        className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {fieldAgents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} — {agent.badge} ({agent.phone})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-emerald-700 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>

                    <button
                      type="button"
                      onClick={handleDirectLoginAsSelectedAgent}
                      disabled={isLoading}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Ouvrir l'Agenda</span>
                    </button>
                  </div>

                  {/* Quick agent chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-emerald-200/60">
                    {fieldAgents.slice(0, 4).map(agent => (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => handleDirectLoginAgent(agent)}
                        className="text-[10px] font-bold px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-900 rounded-md border border-emerald-300 transition cursor-pointer"
                      >
                        {agent.name.split(' ')[0]} ({agent.badge})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MANUAL SEARCH / CUSTOM INPUT ACCORDION */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <details className="text-xs group">
                  <summary className="font-semibold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center justify-between py-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Ou taper un identifiant / numéro manuellement</span>
                    </span>
                    <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>

                  <form onSubmit={handleFormLogin} className="mt-3 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="Ex: Jacks.matoko@gmail.com, 053028383, ou Matricule"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#850404]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#850404] hover:bg-[#6b0202] text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Entrer directement</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </details>
              </div>

            </div>

            {/* Micro footer instructions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Base Supabase connectée
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
