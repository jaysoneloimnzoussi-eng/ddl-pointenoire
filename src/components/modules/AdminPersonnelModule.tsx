import React, { useState, useMemo } from 'react';
import {
  Shield,
  UserPlus,
  Users,
  Key,
  Eye,
  EyeOff,
  QrCode,
  Printer,
  Copy,
  Check,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeCheck,
  Smartphone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Edit2,
  Trash2,
  RotateCw,
  Download,
  Share2,
  Award,
  Sparkles,
  Landmark,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { authService } from '../../services/authService';
import { UserAccount, UserRole } from '../../types';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { REPUBLIQUE_CONGO, TERRITORIAL_REFERENTIAL } from '../../constants/referential';
import QRCode from 'qrcode';

export const AdminPersonnelModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'CREATE' | 'BADGES' | 'FICHES'>('DIRECTORY');

  // Accounts state
  const [accounts, setAccounts] = useState<UserAccount[]>(() => authService.getAllAccounts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Password visibility map: [accountId]: boolean
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected agent for Badge & Fiche view
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => accounts[0]?.id || 'ADMIN-MATOKO');

  // Password edit modal
  const [editingPasswordAccount, setEditingPasswordAccount] = useState<UserAccount | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');

  // Creation form state
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    username: '',
    role: 'AGENT_SAA' as UserRole,
    matricule: '',
    badge: '',
    title: 'Contrôleur Qualité et Conformité (Police des Loisirs)',
    service: 'Service SAA - Terrain',
    zone: 'Arrondissement 1 Lumumba',
    phone: '+242 06 ',
    email: '',
    defaultPassword: '',
    sermentDate: '2026-01-15'
  });

  // QR Code preview for selected agent
  const [agentQrUrl, setAgentQrUrl] = useState<string>('');

  const reloadAccounts = () => {
    setAccounts([...authService.getAllAccounts()]);
  };

  const selectedAgent = useMemo(() => {
    return accounts.find(a => a.id === selectedAgentId) || accounts[0] || null;
  }, [accounts, selectedAgentId]);

  // Generate QR code whenever selected agent changes
  React.useEffect(() => {
    if (!selectedAgent) return;
    const verifyPayload = `https://ddl-pointenoire.vercel.app/#/verify?agent=${encodeURIComponent(selectedAgent.badge)}&nom=${encodeURIComponent(selectedAgent.name)}&role=${encodeURIComponent(selectedAgent.role)}&val=2026\n[ASSERMENTATION DDL-PN / MCAPNIT]\nAGENT: ${selectedAgent.name}\nBADGE: ${selectedAgent.badge}\nMATRICULE: ${selectedAgent.matricule || '315713H'}\nSERVICE: ${selectedAgent.service}\nZONE: ${selectedAgent.zone || 'Pointe-Noire'}\nSERMENT: TGI Pointe-Noire (Loi 13-2011)\nVALIDITÉ: PTA 2026`;

    QRCode.toDataURL(verifyPayload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 240,
      color: {
        dark: '#022448',
        light: '#ffffff'
      }
    })
      .then(url => setAgentQrUrl(url))
      .catch(err => console.error('QR Error:', err));
  }, [selectedAgent]);

  // Auto-generate badge and login when name or role changes in form
  const handleRoleChangeInForm = (role: UserRole) => {
    let service = 'Service SAA - Terrain';
    let title = 'Agent Contrôleur Qualité et Conformité';
    let badgePrefix = 'SAA-PN';

    if (role === 'DIRECTEUR') {
      service = 'Cabinet de Direction Départementale';
      title = 'Directeur Départemental des Loisirs';
      badgePrefix = 'DDL-DIR';
    } else if (role === 'ADMIN') {
      service = 'Service Assistance & Autorisation (SAA) / Contrôle';
      title = 'Administrateur Application & Resp. SAA';
      badgePrefix = 'ADM-PN';
    } else if (role === 'CHEF_SAA') {
      service = 'Service Assistance et Autorisation (SAA)';
      title = 'Chef de Service SAA';
      badgePrefix = 'SAA-CHEF';
    } else if (role === 'REGISSEUR') {
      service = 'Service Administratif & Financier (SAF)';
      title = 'Régisseur des Recettes & Versements Trésor';
      badgePrefix = 'SAF-REG';
    } else if (role === 'CHEF_SPA') {
      service = 'Service Promotion, Animation & Loisirs Sains';
      title = 'Chef de Service Promotion & Loisirs Sains';
      badgePrefix = 'SPA-PN';
    }

    const nextNum = String(accounts.length + 1).padStart(3, '0');
    setNewAgentForm(prev => ({
      ...prev,
      role,
      service,
      title,
      badge: prev.badge || `${badgePrefix}-${nextNum}`
    }));
  };

  const handleCreateAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentForm.name.trim()) {
      triggerNotification('Veuillez renseigner le nom complet de l’agent.', 'error');
      return;
    }

    const cleanUsername = (newAgentForm.username || newAgentForm.name.split(' ')[0] || 'agent')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const generatedPwd = newAgentForm.defaultPassword.trim() || `${cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)}@2026!`;
    const cleanBadge = newAgentForm.badge.trim() || `SAA-PN-${String(accounts.length + 1).padStart(3, '0')}`;

    const created = authService.addAccount({
      name: newAgentForm.name.trim(),
      username: cleanUsername,
      role: newAgentForm.role,
      title: newAgentForm.title,
      badge: cleanBadge,
      phone: newAgentForm.phone.trim(),
      email: newAgentForm.email.trim() || `${cleanUsername}@ddl-pointenoire.cg`,
      service: newAgentForm.service,
      zone: newAgentForm.zone,
      matricule: newAgentForm.matricule.trim() || `${Math.floor(200000 + Math.random() * 800000)}M`,
      defaultPassword: generatedPwd,
      sermentDate: newAgentForm.sermentDate,
      datePriseService: new Date().toISOString().split('T')[0],
      isActive: true
    });

    reloadAccounts();
    setSelectedAgentId(created.id);
    triggerNotification(`Agent ${created.name} (${created.badge}) enregistré avec succès !`, 'success');

    // Reset form
    setNewAgentForm({
      name: '',
      username: '',
      role: 'AGENT_SAA',
      matricule: '',
      badge: '',
      title: 'Contrôleur Qualité et Conformité (Police des Loisirs)',
      service: 'Service SAA - Terrain',
      zone: 'Arrondissement 1 Lumumba',
      phone: '+242 06 ',
      email: '',
      defaultPassword: '',
      sermentDate: '2026-01-15'
    });

    // Switch to badges tab to show result
    setActiveTab('BADGES');
  };

  const handleSaveNewPassword = () => {
    if (!editingPasswordAccount || !newPasswordVal.trim()) return;
    authService.updatePassword(editingPasswordAccount.id, newPasswordVal.trim());
    reloadAccounts();
    triggerNotification(`Mot de passe mis à jour pour ${editingPasswordAccount.name}.`, 'success');
    setEditingPasswordAccount(null);
    setNewPasswordVal('');
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    triggerNotification('Copié dans le presse-papier !', 'info');
  };

  // Filtered accounts list
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        acc.name.toLowerCase().includes(q) ||
        acc.badge.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        acc.phone.includes(q) ||
        (acc.matricule && acc.matricule.toLowerCase().includes(q));

      const matchRole = selectedRoleFilter === 'ALL' || acc.role === selectedRoleFilter;
      return matchSearch && matchRole;
    });
  }, [accounts, searchQuery, selectedRoleFilter]);

  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#022448] via-[#033468] to-[#022448] text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-amber-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 font-mono-ref bg-black/30 px-2 py-0.5 rounded">
                Espace Direction & Commandement
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                {accounts.length} Agents Enregistrés
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1 font-republic">
              Gestion du Personnel, Accréditations & Badges Officiels QR
            </h1>
            <p className="text-xs text-slate-300">
              Registre central des identifiants, mots de passe, fiches d'identification administrative et génération de cartes professionnelles.
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'DIRECTORY'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Annuaire & Mots de Passe</span>
          </button>
          <button
            onClick={() => setActiveTab('CREATE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'CREATE'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Nouvel Agent</span>
          </button>
          <button
            onClick={() => setActiveTab('BADGES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'BADGES'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Badges QR Sécurisés</span>
          </button>
          <button
            onClick={() => setActiveTab('FICHES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'FICHES'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Fiches d'Identification A4</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: DIRECTORY & PASSWORDS CATALOG
         ======================================================== */}
      {activeTab === 'DIRECTORY' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, badge, matricule..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#022448]"
                />
              </div>

              <select
                value={selectedRoleFilter}
                onChange={e => setSelectedRoleFilter(e.target.value)}
                className="py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="ALL">Tous les rôles ({accounts.length})</option>
                <option value="AGENT_SAA">Agents SAA Terrain</option>
                <option value="CHEF_SAA">Responsables Service SAA</option>
                <option value="REGISSEUR">Régisseurs SAF</option>
                <option value="CHEF_SPA">Cadres SPA</option>
                <option value="ADMIN">Administrateurs</option>
                <option value="DIRECTEUR">Direction Départementale</option>
              </select>
            </div>

            <button
              onClick={() => setActiveTab('CREATE')}
              className="w-full sm:w-auto px-4 py-2 bg-[#006d2f] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Créer un Nouvel Agent</span>
            </button>
          </div>

          {/* Table of Personnel & Passwords */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Agent / Personnel</th>
                  <th className="py-3 px-3">Badge & Matricule</th>
                  <th className="py-3 px-3">Rôle / Statut</th>
                  <th className="py-3 px-3">Service & Zone</th>
                  <th className="py-3 px-3">Identifiant (Login)</th>
                  <th className="py-3 px-3">Mot de Passe Officiel</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map(account => {
                  const isVisible = Boolean(visiblePasswords[account.id]);
                  const isDirector = account.role === 'DIRECTEUR';
                  const isAdmin = account.role === 'ADMIN';

                  return (
                    <tr key={account.id} className="hover:bg-slate-50/80 transition">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border ${
                              isAdmin
                                ? 'bg-red-900 text-amber-300 border-amber-400/40'
                                : isDirector
                                ? 'bg-[#022448] text-amber-300 border-amber-400'
                                : 'bg-[#006d2f] text-white border-emerald-600'
                            }`}
                          >
                            {account.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 leading-tight">
                              {account.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {account.title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Badge & Matricule */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded font-mono-ref">
                          {account.badge}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono-ref">
                          Mat: {account.matricule || 'N/A'}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isAdmin
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : isDirector
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : account.role === 'REGISSEUR'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {account.role}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {account.isActive ? '● Compte Actif' : '○ Suspendu'}
                        </div>
                      </td>

                      {/* Service & Zone */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-semibold truncate max-w-[140px]">
                          {account.service}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{account.zone || 'Pointe-Noire'}</span>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-3">
                        <span className="font-mono-ref font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {account.username}
                        </span>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px] mt-0.5">
                          {account.email}
                        </div>
                      </td>

                      {/* Password with Show/Hide & Copy */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="font-mono-ref text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-800 min-w-[100px]">
                            {isVisible ? (
                              <span className="font-bold text-[#006d2f] select-all">
                                {account.defaultPassword || 'DdlPn@2026!'}
                              </span>
                            ) : (
                              <span className="text-slate-400 tracking-widest">••••••••</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setVisiblePasswords(prev => ({
                                ...prev,
                                [account.id]: !prev[account.id]
                              }))
                            }
                            className="p-1 hover:bg-slate-100 text-slate-500 rounded transition"
                            title={isVisible ? 'Masquer' : 'Afficher le mot de passe'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(account.defaultPassword || 'DdlPn@2026!', account.id)
                            }
                            className="p-1 hover:bg-slate-100 text-slate-500 rounded transition"
                            title="Copier le mot de passe"
                          >
                            {copiedId === account.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAgentId(account.id);
                              setActiveTab('BADGES');
                            }}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Créer / Imprimer le Badge Professionnel QR"
                          >
                            <QrCode className="w-3 h-3 text-amber-700" />
                            <span>Badge</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAgentId(account.id);
                              setActiveTab('FICHES');
                            }}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Voir la Fiche d'Identification Officielle A4"
                          >
                            <FileText className="w-3 h-3 text-blue-700" />
                            <span>Fiche</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingPasswordAccount(account);
                              setNewPasswordVal(account.defaultPassword || '');
                            }}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                            title="Modifier le mot de passe"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: CREATE NEW FIELD AGENT OR EXECUTIVE
         ======================================================== */}
      {activeTab === 'CREATE' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006d2f] flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#022448] font-republic">
                Enregistrement d'un Nouvel Agent de Terrain ou Cadre Administratif
              </h2>
              <p className="text-xs text-slate-500">
                L'agent recevra immédiatement un matricule, un badge officiel, ses accès sécurisés et sa fiche d'assermentation.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateAgentSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nom Complet de l'Agent <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean-Claude LOUBAKI"
                  value={newAgentForm.name}
                  onChange={e => setNewAgentForm({ ...newAgentForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#006d2f]"
                />
              </div>

              {/* Login / Username */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Identifiant de Connexion (Login)
                </label>
                <input
                  type="text"
                  placeholder="Ex: jcloubaki (auto-généré si vide)"
                  value={newAgentForm.username}
                  onChange={e => setNewAgentForm({ ...newAgentForm, username: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref outline-none focus:bg-white focus:ring-2 focus:ring-[#006d2f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Role */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Rôle & Niveau d'Accréditation <span className="text-red-600">*</span>
                </label>
                <select
                  value={newAgentForm.role}
                  onChange={e => handleRoleChangeInForm(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="AGENT_SAA">Agent du Service SAA (Terrain)</option>
                  <option value="CHEF_SAA">Chef / Responsable Service SAA</option>
                  <option value="REGISSEUR">Régisseur SAF (Recettes & Trésor)</option>
                  <option value="CHEF_SPA">Cadre Promotion Loisirs (SPA)</option>
                  <option value="ADMIN">Administrateur Technique</option>
                  <option value="DIRECTEUR">Cadre de Direction Départementale</option>
                </select>
              </div>

              {/* Badge Number */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  N° de Badge Officiel <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SAA-PN-011"
                  value={newAgentForm.badge}
                  onChange={e => setNewAgentForm({ ...newAgentForm, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref font-bold text-amber-900 outline-none"
                />
              </div>

              {/* Matricule */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Matricule Solde / Fonction Publique
                </label>
                <input
                  type="text"
                  placeholder="Ex: 315 713H"
                  value={newAgentForm.matricule}
                  onChange={e => setNewAgentForm({ ...newAgentForm, matricule: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Service */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Service Administratif de Rattachement
                </label>
                <input
                  type="text"
                  value={newAgentForm.service}
                  onChange={e => setNewAgentForm({ ...newAgentForm, service: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold outline-none"
                />
              </div>

              {/* Zone / Arrondissement */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Zone de Contrôle / Arrondissement Attribué
                </label>
                <select
                  value={newAgentForm.zone}
                  onChange={e => setNewAgentForm({ ...newAgentForm, zone: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold outline-none"
                >
                  <option value="Ensemble des 6 Arrondissements (Supervision)">Ensemble des 6 Arrondissements (Supervision)</option>
                  {TERRITORIAL_REFERENTIAL.map(arr => (
                    <option key={arr.code} value={arr.name}>{arr.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Phone */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Téléphone de Contact</label>
                <input
                  type="text"
                  value={newAgentForm.phone}
                  onChange={e => setNewAgentForm({ ...newAgentForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Officiel</label>
                <input
                  type="email"
                  placeholder="nom@ddl-pointenoire.cg"
                  value={newAgentForm.email}
                  onChange={e => setNewAgentForm({ ...newAgentForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              {/* Initial Password */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mot de Passe Initial
                </label>
                <input
                  type="text"
                  placeholder="Ex: Loubaki@2026! (auto-généré si vide)"
                  value={newAgentForm.defaultPassword}
                  onChange={e => setNewAgentForm({ ...newAgentForm, defaultPassword: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref font-bold text-[#006d2f] outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('DIRECTORY')}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 font-bold rounded-xl transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#006d2f] hover:bg-emerald-800 text-white font-black rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>Créer et Activer le Profil de l'Agent</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          TAB 3: BADGES CREATION STUDIO WITH QR CODE
         ======================================================== */}
      {activeTab === 'BADGES' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="font-bold text-slate-700 text-xs shrink-0">
                Sélectionner l'Agent à imprimer :
              </label>
              <select
                value={selectedAgentId}
                onChange={e => setSelectedAgentId(e.target.value)}
                className="w-full sm:w-80 py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.badge} — {acc.name} ({acc.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintBadge}
                className="px-4 py-2 bg-[#022448] hover:bg-[#033468] text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Imprimer Carte PVC / Planche A4</span>
              </button>
            </div>
          </div>

          {/* BADGE PREVIEW (RECTO / VERSO) */}
          {selectedAgent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto py-2">
              {/* ============ RECTO (FRONT) ============ */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span>Face Recto • Format Plastifié PVC 85×54 mm</span>
                </span>

                <div className="w-[360px] sm:w-[400px] aspect-[85.6/53.98] bg-white rounded-2xl shadow-xl border-2 border-slate-800 overflow-hidden flex flex-col justify-between relative select-none">
                  {/* Republic Header Ribbon */}
                  <div className="bg-gradient-to-r from-[#006d2f] via-[#fcd116] to-[#dc241f] h-2.5 w-full shrink-0" />

                  {/* Header Sub-banner */}
                  <div className="bg-[#022448] text-white px-3 py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <OfficialRepublicLogo size="sm" className="shrink-0" />
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-wider text-amber-300 font-republic">
                          {REPUBLIQUE_CONGO.nom}
                        </p>
                        <p className="text-[7px] text-white/90 font-bold leading-none">
                          {REPUBLIQUE_CONGO.ministere_abreviation} • DIRECTION DES LOISIRS
                        </p>
                      </div>
                    </div>
                    <span className="text-[7px] font-mono-ref bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                      PTA 2026
                    </span>
                  </div>

                  {/* Card Title */}
                  <div className="bg-slate-100 border-b border-slate-300 py-1 text-center">
                    <p className="text-[9px] font-black tracking-wider text-[#850404] uppercase font-republic">
                      CARTE PROFESSIONNELLE D'AGENT ASSERMENTÉ
                    </p>
                  </div>

                  {/* Body: Photo, Info, Chip */}
                  <div className="p-3 flex items-center gap-3.5 flex-1">
                    {/* Official Photo Avatar */}
                    <div className="w-20 h-24 rounded-lg bg-[#006d2f] text-amber-300 font-black text-2xl flex flex-col items-center justify-center border-2 border-amber-400 shadow-md shrink-0 relative overflow-hidden">
                      <span>{selectedAgent.name.charAt(0)}</span>
                      <div className="absolute bottom-0 inset-x-0 bg-[#022448]/90 text-[7px] text-white font-mono-ref text-center py-0.5 font-bold">
                        ASSERMENTÉ
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div>
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 block">Nom & Prénoms :</span>
                        <p className="text-xs font-black text-[#022448] leading-tight truncate">
                          {selectedAgent.name}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                        <div>
                          <span className="text-slate-400 font-bold block text-[7px]">Badge Officiel :</span>
                          <span className="font-extrabold text-[#850404] font-mono-ref bg-amber-100 px-1 py-0.2 rounded">
                            {selectedAgent.badge}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[7px]">Matricule :</span>
                          <span className="font-bold text-slate-800 font-mono-ref">
                            {selectedAgent.matricule || '315713H'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold block text-[7px]">Fonction & Service :</span>
                        <p className="text-[8px] font-bold text-slate-700 leading-tight">
                          {selectedAgent.title}
                        </p>
                        <p className="text-[7.5px] text-emerald-800 font-semibold truncate">
                          {selectedAgent.zone || 'Pointe-Noire'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Security Band */}
                  <div className="bg-[#022448] text-white px-3 py-1 flex items-center justify-between text-[7px] font-mono-ref">
                    <span className="text-amber-300 font-bold">POLICE DES LOISIRS DDL-PN</span>
                    <span className="text-white/70">TGI Pointe-Noire • Loi 13-2011</span>
                  </div>
                </div>
              </div>

              {/* ============ VERSO (BACK) ============ */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span>Face Verso • QR Code & Mentions Légales</span>
                </span>

                <div className="w-[360px] sm:w-[400px] aspect-[85.6/53.98] bg-slate-50 rounded-2xl shadow-xl border-2 border-slate-800 overflow-hidden flex flex-col justify-between p-3 select-none relative">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-[8px] font-extrabold text-[#022448] uppercase tracking-wider">
                      PRÉROGATIVES D'ASSERMENTATION
                    </span>
                    <span className="text-[7.5px] font-mono-ref font-bold text-emerald-800">
                      VALABLE JUSQU'AU 31/12/2026
                    </span>
                  </div>

                  {/* Middle: Legal text + Scannable QR Code */}
                  <div className="flex items-center gap-3 py-1.5">
                    <div className="flex-1 text-[7.5px] text-slate-700 leading-relaxed text-justify space-y-1">
                      <p>
                        Le porteur de la présente carte est un agent assermenté de la Direction Départementale des Loisirs de Pointe-Noire (DDL-PN).
                      </p>
                      <p className="font-semibold text-slate-900">
                        Il a prêté serment près le Tribunal de Grande Instance de Pointe-Noire et est habilité à constater toute infraction en matière d'établissements de loisirs.
                      </p>
                      <p className="text-[7px] italic text-slate-500">
                        Les autorités civiles et militaires sont priées de lui prêter main-forte en cas de nécessité.
                      </p>
                    </div>

                    {/* Verifiable High-Res QR Code */}
                    <div className="shrink-0 p-1 bg-white border border-slate-300 rounded-lg shadow-xs flex flex-col items-center">
                      {agentQrUrl ? (
                        <img src={agentQrUrl} alt="QR Code Assermentation" className="w-20 h-20" />
                      ) : (
                        <div className="w-20 h-20 bg-slate-200 animate-pulse rounded" />
                      )}
                      <span className="text-[6.5px] font-mono-ref font-extrabold text-[#022448] mt-0.5">
                        SCANNER CONTRÔLE
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Signature & Official Seal */}
                  <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[7px]">
                    <div>
                      <span className="text-slate-400 block">Contact Direction :</span>
                      <span className="font-bold text-slate-800 font-mono-ref">+242 06 600 00 01</span>
                    </div>

                    <div className="text-right">
                      <p className="font-extrabold text-[#022448]">Le Directeur Départemental des Loisirs</p>
                      <p className="font-black text-slate-900">Jean Richard NTSEKE NGOUAKA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 4: OFFICIAL A4 IDENTIFICATION SHEETS (FICHES A4)
         ======================================================== */}
      {activeTab === 'FICHES' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="font-bold text-slate-700 text-xs shrink-0">
                Sélectionner l'Agent / Cadre :
              </label>
              <select
                value={selectedAgentId}
                onChange={e => setSelectedAgentId(e.target.value)}
                className="w-full sm:w-80 py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.badge} — {acc.name} ({acc.title})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#006d2f] hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Imprimer la Fiche A4 Officielle</span>
            </button>
          </div>

          {/* OFFICIAL A4 DOCUMENT PREVIEW */}
          {selectedAgent && (
            <div className="bg-white max-w-[800px] mx-auto p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-300 text-slate-900 font-sans print-page-a4 select-text">
              {/* Tricolor Republic Ribbon */}
              <RepublicTricolorBar className="mb-6" />

              {/* Official Document Header */}
              <div className="flex items-start justify-between border-b-2 border-[#022448] pb-5 mb-6">
                <div>
                  <h3 className="text-xs font-black tracking-widest text-[#022448] uppercase font-republic">
                    {REPUBLIQUE_CONGO.nom}
                  </h3>
                  <p className="text-[10px] text-[#006d2f] font-bold tracking-wide italic">
                    {REPUBLIQUE_CONGO.devise}
                  </p>
                  <div className="w-16 h-0.5 bg-[#fcd116] my-1" />
                  <p className="text-[10px] text-slate-700 font-bold uppercase">
                    {REPUBLIQUE_CONGO.ministere}
                  </p>
                  <p className="text-[9px] font-extrabold text-[#850404]">
                    {REPUBLIQUE_CONGO.direction_departementale}
                  </p>
                </div>

                <div className="flex flex-col items-end text-right">
                  <OfficialRepublicLogo size="md" className="shrink-0 mb-1" />
                  <span className="text-[9px] font-mono-ref bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-300">
                    RÉF : FIA-DDL-PN-2026/{selectedAgent.badge}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5">
                    Pointe-Noire, le {new Date().toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center my-6 bg-slate-50 border-y-2 border-slate-800 py-3">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#022448] uppercase font-republic">
                  FICHE D'IDENTIFICATION ADMINISTRATIVE & D'ASSERMENTATION DU PERSONNEL
                </h1>
                <p className="text-xs text-[#850404] font-bold uppercase tracking-wider mt-0.5">
                  Direction Départementale des Loisirs de Pointe-Noire (PTA 2026)
                </p>
              </div>

              {/* Identity & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 my-6">
                {/* Agent Photo & QR */}
                <div className="sm:col-span-4 flex flex-col items-center gap-4">
                  <div className="w-32 h-40 rounded-xl bg-gradient-to-b from-[#022448] to-[#011427] text-amber-300 flex flex-col items-center justify-center font-black text-4xl shadow-md border-2 border-amber-400 relative">
                    <span>{selectedAgent.name.charAt(0)}</span>
                    <div className="absolute bottom-2 bg-amber-400 text-slate-950 text-[9px] font-extrabold font-mono-ref px-2 py-0.5 rounded">
                      PHOTO OFFICIELLE
                    </div>
                  </div>

                  <div className="p-2 bg-white border-2 border-slate-300 rounded-xl shadow-xs flex flex-col items-center text-center">
                    {agentQrUrl ? (
                      <img src={agentQrUrl} alt="QR Code" className="w-24 h-24" />
                    ) : (
                      <div className="w-24 h-24 bg-slate-100 animate-pulse" />
                    )}
                    <span className="text-[8px] font-mono-ref font-bold text-slate-600 mt-1">
                      CERTIFICAT SÉCURISÉ
                    </span>
                  </div>
                </div>

                {/* Detailed Administrative Fields */}
                <div className="sm:col-span-8 space-y-3.5 text-xs">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nom et Prénoms :</span>
                    <span className="text-base font-black text-[#022448]">{selectedAgent.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">N° de Badge Officiel :</span>
                      <span className="text-xs font-black text-[#850404] font-mono-ref bg-amber-100 px-2 py-0.5 rounded">
                        {selectedAgent.badge}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Matricule Solde :</span>
                      <span className="text-xs font-bold font-mono-ref text-slate-800">
                        {selectedAgent.matricule || '315 713H'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Rôle / Accréditation :</span>
                      <span className="font-bold text-slate-900">{selectedAgent.role}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Prestation de Serment :</span>
                      <span className="font-bold text-[#006d2f] font-mono-ref">
                        TGI Pointe-Noire ({selectedAgent.sermentDate || '15/01/2026'})
                      </span>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Titre & Attributions :</span>
                    <span className="font-bold text-slate-800">{selectedAgent.title}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Service de Rattachement :</span>
                      <span className="font-semibold text-slate-800">{selectedAgent.service}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Zone d'Affectation :</span>
                      <span className="font-bold text-slate-800">{selectedAgent.zone || 'Pointe-Noire'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Téléphone Professionnel :</span>
                      <span className="font-mono-ref font-bold text-slate-800">{selectedAgent.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Courriel de Service :</span>
                      <span className="font-mono-ref text-slate-800">{selectedAgent.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Powers & Mandate */}
              <div className="my-6 p-4 bg-slate-50 border border-slate-300 rounded-xl text-xs space-y-2 text-justify">
                <h4 className="font-black text-[#022448] uppercase text-[11px] flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Mandat Légal & Pouvoirs de Police Administrative des Loisirs :</span>
                </h4>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  L'agent identifié par la présente fiche est dûment assermenté et mandaté par le Ministère de la Culture, des Arts, du Tourisme et des Loisirs pour effectuer les opérations de recensement, d'enquête statistique, de contrôle de conformité acoustique, de notification de convocations et de recouvrement légal des redevances d'agrément dans les 6 arrondissements de Pointe-Noire, conformément aux dispositions de la Loi n° 13-2011 du 17 mai 2011.
                </p>
              </div>

              {/* Official Seal & Signature */}
              <div className="mt-8 pt-4 border-t-2 border-slate-800 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Visa du Titulaire de la Fiche :</p>
                  <p className="text-xs font-bold text-slate-800 mt-6">{selectedAgent.name}</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-700 mx-auto flex items-center justify-center text-[8px] font-black text-emerald-800 uppercase tracking-tighter text-center">
                    SCEAU DDL-PN
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Pour la Direction Départementale :</p>
                  <p className="text-xs font-extrabold text-[#022448] mt-1">Le Directeur Départemental des Loisirs</p>
                  <div className="h-10 flex items-center justify-end">
                    <span className="text-[11px] font-black text-slate-900 font-republic">Jean Richard NTSEKE NGOUAKA</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT PASSWORD FOR AGENT
         ======================================================== */}
      {editingPasswordAccount && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-300 text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Modifier le Mot de Passe de Session
                </h3>
              </div>
              <button
                onClick={() => setEditingPasswordAccount(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 mb-3">
              Définir un nouveau mot de passe pour l'agent{' '}
              <strong className="text-slate-900">{editingPasswordAccount.name}</strong> ({editingPasswordAccount.badge}) :
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nouveau Mot de Passe :</label>
                <input
                  type="text"
                  required
                  value={newPasswordVal}
                  onChange={e => setNewPasswordVal(e.target.value)}
                  placeholder="Saisir le nouveau mot de passe..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#022448]"
                />
              </div>

              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                L'agent pourra se connecter immédiatement avec ce nouveau mot de passe.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPasswordAccount(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-bold hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveNewPassword}
                className="px-5 py-2 bg-[#022448] hover:bg-[#033468] text-white font-bold rounded-xl shadow-xs"
              >
                Enregistrer le Nouveau Mot de Passe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
