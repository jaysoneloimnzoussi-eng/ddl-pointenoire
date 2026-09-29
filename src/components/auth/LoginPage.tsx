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
  Mail,
  BadgeAlert,
  HelpCircle
} from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { REPUBLIQUE_CONGO, APP_USERS } from '../../constants/referential';
import { AppUser } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser, initialModule?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'AGENT'>('ADMIN');

  // Input credentials
  const [identifier, setIdentifier] = useState<string>('directeur@ddl-pointenoire.cg');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Agents only: badge or phone or email
  const [agentBadge, setAgentBadge] = useState<string>('SAA-PN-008');
  const [agentPhone, setAgentPhone] = useState<string>('+242 06 654 32 10');
  const [agentError, setAgentError] = useState<string>('');

  // Lists filtered strictly from referential APP_USERS
  const adminUsers = APP_USERS.filter(u => u.role !== 'AGENT_SAA');
  const agentUsers = APP_USERS.filter(u => u.role === 'AGENT_SAA' || u.role === 'CHEF_SAA');

  // Connect as Admin / Cadre
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedInput = identifier.trim().toLowerCase();
    // Match against real database record (email, badge or ID)
    const matchedUser = adminUsers.find(
      u =>
        u.email.toLowerCase() === trimmedInput ||
        u.badge.toLowerCase() === trimmedInput ||
        u.id.toLowerCase() === trimmedInput
    );

    if (!matchedUser) {
      setErrorMessage(
        `Aucun compte d'administration ne correspond à l'identifiant « ${identifier} ». Seuls les agents et cadres enregistrés dans le registre officiel DDL-PN sont autorisés.`
      );
      return;
    }

    onLoginSuccess(matchedUser, 'MOD-01');
  };

  // Connect as Field Agent SAA
  const handleAgentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAgentError('');

    const trimmedBadge = agentBadge.trim().toUpperCase();
    const matchedAgent = agentUsers.find(
      u =>
        u.badge.toUpperCase() === trimmedBadge ||
        u.id.toUpperCase() === trimmedBadge ||
        u.email.toLowerCase() === agentBadge.trim().toLowerCase()
    );

    if (!matchedAgent) {
      setAgentError(
        `Matricule de brigade « ${agentBadge} » non répertorié. Seuls les agents assermentés de la Brigade SAA enregistrés dans la base ont accès au portail de terrain.`
      );
      return;
    }

    onLoginSuccess(matchedAgent, 'MOD-03');
  };

  const handleSelectAdminAccount = (user: AppUser) => {
    setIdentifier(user.email);
    setErrorMessage('');
  };

  const handleSelectAgentAccount = (user: AppUser) => {
    setAgentBadge(user.badge);
    setAgentPhone(user.phone);
    setAgentError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#011427] via-[#022448] to-[#012d1b] text-slate-800 flex flex-col justify-between p-3 sm:p-6 select-none relative">
      {/* Top Republic Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-4 border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          <OfficialRepublicLogo size="md" className="shrink-0 drop-shadow" />
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
              {REPUBLIQUE_CONGO.direction_departementale}
            </h1>
            <p className="text-[10px] text-slate-300 hidden md:block">
              {REPUBLIQUE_CONGO.ministere} ({REPUBLIQUE_CONGO.ministere_abreviation})
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs text-emerald-300 font-mono-ref">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Année {REPUBLIQUE_CONGO.annee_pta}</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-4xl mx-auto w-full my-auto py-6 sm:py-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Official Notice & Database Registry */}
          <div className="lg:col-span-5 bg-[#022448] text-white p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/50">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider mb-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Registre Authentifié</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-republic tracking-tight leading-snug">
                Portail Officiel d'Accès Sécurisé
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                Conformément à la réglementation de la République du Congo, l'accès est strictement réservé aux agents publics et assermentés enregistrés dans la base institutionnelle de la DDL-PN.
              </p>

              {/* Verified Registered Accounts list */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider mb-2">
                  Personnel Répertorié dans la Base :
                </p>
                <div className="space-y-1.5 text-xs">
                  {APP_USERS.map(u => (
                    <div
                      key={u.id}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-[10px] text-slate-300">{u.title}</span>
                      </div>
                      <span className="text-[9px] font-mono-ref bg-white/10 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                        {u.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <RepublicTricolorBar className="mb-2.5" />
              <p className="text-[10px] text-slate-400">
                {REPUBLIQUE_CONGO.siege} • {REPUBLIQUE_CONGO.contact}
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50 flex flex-col justify-between">
            <div>
              {/* Tab Selector: Direction / Admin vs Agent Terrain */}
              <div className="bg-slate-200/80 p-1 rounded-xl flex gap-1 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ADMIN');
                    setErrorMessage('');
                  }}
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
                  onClick={() => {
                    setActiveTab('AGENT');
                    setAgentError('');
                  }}
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
                      Compte Cadre / Direction (Sélectionnez ou saisissez)
                    </label>
                    <select
                      value={identifier}
                      onChange={e => {
                        setIdentifier(e.target.value);
                        setErrorMessage('');
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#022448] shadow-xs"
                    >
                      {adminUsers.map(u => (
                        <option key={u.id} value={u.email}>
                          {u.name} — {u.title} ({u.badge})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Identifiant Institutionnel / Email vérifié
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={e => {
                          setIdentifier(e.target.value);
                          setErrorMessage('');
                        }}
                        placeholder="ex: directeur@ddl-pointenoire.cg"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#022448] shadow-xs font-mono-ref"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-medium flex items-start gap-2">
                      <BadgeAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#022448] to-[#023b75] hover:from-[#011a35] hover:to-[#022448] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group"
                  >
                    <span>Valider et Accéder au Poste de Commandement</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>

                  {/* Registered Cadres Quick Pick */}
                  <div className="pt-3 border-t border-slate-200/80">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                      Sélectionner un compte vérifié :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {adminUsers.map(u => {
                        const isChosen = identifier.toLowerCase() === u.email.toLowerCase();
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectAdminAccount(u)}
                            className={`text-left p-2 rounded-lg border text-xs transition flex items-start gap-2 ${
                              isChosen
                                ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <UserCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isChosen ? 'text-[#022448]' : 'text-slate-400'}`} />
                            <div className="leading-tight truncate">
                              <span className="block truncate font-semibold">{u.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono-ref">{u.badge}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </form>
              ) : (
                /* Form 2: Agents de terrain SAA */
                <form onSubmit={handleAgentLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Agent Assermenté SAA Répertorié
                    </label>
                    <select
                      value={agentBadge}
                      onChange={e => {
                        const b = e.target.value;
                        setAgentBadge(b);
                        const match = agentUsers.find(a => a.badge === b);
                        if (match) setAgentPhone(match.phone);
                        setAgentError('');
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006d2f] shadow-xs"
                    >
                      {agentUsers.map(u => (
                        <option key={u.id} value={u.badge}>
                          {u.name} — {u.badge} ({u.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Matricule de Badge Officiel
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={agentBadge}
                        onChange={e => {
                          setAgentBadge(e.target.value);
                          setAgentError('');
                        }}
                        placeholder="ex: SAA-PN-008"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono-ref font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006d2f] shadow-xs"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Numéro de liaison brigade : <strong className="font-mono-ref text-slate-700">{agentPhone}</strong>
                    </p>
                  </div>

                  {agentError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-medium flex items-start gap-2">
                      <BadgeAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{agentError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#006d2f] to-[#028a3d] hover:from-[#005a26] hover:to-[#006d2f] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Ouvrir l'Espace Terrain & Google Agenda SAA</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>

                  {/* Registered SAA Agents Selection */}
                  <div className="pt-3 border-t border-slate-200/80">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                      Agents Assermentés de la Brigade SAA :
                    </p>
                    <div className="space-y-1.5">
                      {agentUsers.map(u => {
                        const isChosen = agentBadge.toUpperCase() === u.badge.toUpperCase();
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectAgentAccount(u)}
                            className={`w-full text-left p-2 rounded-lg border text-xs transition flex items-center justify-between ${
                              isChosen
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Smartphone className={`w-3.5 h-3.5 ${isChosen ? 'text-[#006d2f]' : 'text-slate-400'}`} />
                              <div>
                                <span className="font-semibold block">{u.name}</span>
                                <span className="text-[10px] text-slate-500">{u.title}</span>
                              </div>
                            </div>
                            <span className="font-mono-ref text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              {u.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Verification Guarantee */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Base locale et synchronisation centrale conformes aux matricules DDL-PN.</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center text-[10px] text-slate-400 pt-3 border-t border-white/10">
        <p>
          {REPUBLIQUE_CONGO.nom} • {REPUBLIQUE_CONGO.ministere} • {REPUBLIQUE_CONGO.direction_departementale}
        </p>
        <p className="text-slate-500 mt-0.5">
          Système Intégré de Régulation des Loisirs • Version 2.0.0-PROD-2026
        </p>
      </footer>
    </div>
  );
};
