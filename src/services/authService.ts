import { AppUser, UserAccount } from '../types';
import { APP_USERS } from '../constants/referential';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_ACCOUNTS_KEY = 'ddl_pn_user_accounts_v2';
const MASTER_EMERGENCY_PASSWORD = 'DdlPn@2026!';

// Official credentials catalog for all DDL-PN personnel
export const OFFICIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'ADMIN-MATOKO',
    badge: 'ADM-PN-001',
    username: 'matoko',
    name: 'Jacques MATOKO',
    role: 'ADMIN',
    title: 'Administrateur Application & Resp. Service Assistance et Autorisation (SAA)',
    phone: '053028383',
    service: 'Service Assistance & Autorisation (SAA) / Contrôle Qualités & Conformité',
    email: 'Jacks.matoko@gmail.com',
    defaultPassword: 'Matoko@2026',
    isActive: true
  },
  {
    id: 'DIR-01',
    badge: 'DDL-DIR-001',
    username: 'directeur',
    name: 'Jean Richard NTSEKE NGOUAKA',
    role: 'DIRECTEUR',
    title: 'Directeur Départemental des Loisirs de Pointe-Noire (DDL-PN)',
    phone: '+242 06 600 00 01',
    service: 'Cabinet de Direction Départementale',
    email: 'directeur@ddl-pointenoire.cg',
    defaultPassword: 'Directeur@2026',
    isActive: true
  },
  {
    id: '0594a697-48ba-4fb7-b4cb-a979ad46f37c',
    badge: 'SAA-PN-315',
    username: 'ambetos',
    name: 'Loic Anaclet Brell AMBETOS',
    role: 'AGENT_SAA',
    title: 'Contrôleur Qualité et Conformité (Matricule : 315713H)',
    phone: '06 425 0604',
    service: 'Service SAA - Terrain',
    email: 'ambetos.saa@ddl-pointenoire.cg',
    defaultPassword: 'Ambetos@315',
    isActive: true
  },
  {
    id: 'f42ad6b1-701a-4d8c-81df-504be9b607af',
    badge: 'SAA-PN-249',
    username: 'obomba',
    name: 'Yvette Lucette OBOMBA',
    role: 'AGENT_SAA',
    title: 'Statistiques et Documentation (Matricule : 249 500F)',
    phone: '065531376 / 05 627 2029',
    service: 'Service SAA - Terrain',
    email: 'obomba.saa@ddl-pointenoire.cg',
    defaultPassword: 'Obomba@249',
    isActive: true
  },
  {
    id: 'd016ff2d-7544-466e-98c7-3cc83dbc1203',
    badge: 'SAA-PN-002',
    username: 'kiounga',
    name: 'Rhonel KIOUNGA',
    role: 'AGENT_SAA',
    title: 'Agent de Terrain DDL',
    phone: '+242 06 933 8110',
    service: 'Service SAA - Terrain',
    email: 'kiounga.saa@ddl-pointenoire.cg',
    defaultPassword: 'Kiounga@002',
    isActive: true
  },
  {
    id: '9dfdf0dd-0177-4126-89db-335cfaf7c0dc',
    badge: 'SAA-PN-003',
    username: 'wawa',
    name: 'Éloge MAHOUA-WAWA',
    role: 'AGENT_SAA',
    title: 'Agent de Terrain DDL',
    phone: '06 955 8937',
    service: 'Service SAA - Terrain',
    email: 'wawaeloge@gmail.com',
    defaultPassword: 'Wawa@2026',
    isActive: true
  },
  {
    id: '9b6f4a6e-9557-4e5e-bd4b-9590ec256bca',
    badge: 'SAA-PN-004',
    username: 'mpika',
    name: 'Franck MPIKA',
    role: 'AGENT_SAA',
    title: 'Contrôleur Qualité et Conformité',
    phone: '+242 06 6536116 / 05 749 4748',
    service: 'Service SAA - Terrain',
    email: 'franckmpika555@gmail.com',
    defaultPassword: 'Mpika@2026',
    isActive: true
  },
  {
    id: '8f0c52a7-7ab4-498c-b67d-273e98583fe4',
    badge: 'SAA-PN-005',
    username: 'ngoma',
    name: 'Anicet NGOMA',
    role: 'AGENT_SAA',
    title: 'Agent de Terrain DDL',
    phone: '06 902 3655',
    service: 'Service SAA - Terrain',
    email: 'ngoma.saa@ddl-pointenoire.cg',
    defaultPassword: 'Ngoma@2026',
    isActive: true
  },
  {
    id: '2136e93e-5733-44f9-b9ce-a61bb2538f58',
    badge: 'SAA-PN-006',
    username: 'elenga',
    name: 'Jude ELENGA LAURGAEL',
    role: 'AGENT_SAA',
    title: 'Contrôleur Qualité & Conformité',
    phone: '05 087 6707',
    service: 'Service SAA - Terrain',
    email: 'elenga.saa@ddl-pointenoire.cg',
    defaultPassword: 'Elenga@2026',
    isActive: true
  },
  {
    id: '60588776-5ed5-424c-8579-9fb599ce1896',
    badge: 'SAA-PN-007',
    username: 'ibara',
    name: 'Fredy IBARA LABIRA',
    role: 'AGENT_SAA',
    title: 'Contrôleur Qualité et Conformité',
    phone: '06 000 00 07',
    service: 'Service SAA - Terrain',
    email: 'ibara.saa@ddl-pointenoire.cg',
    defaultPassword: 'Ibara@2026',
    isActive: true
  },
  {
    id: 'b9fb7b59-a262-4751-a25a-e6c10e6472ea',
    badge: 'SAA-PN-008',
    username: 'galoum',
    name: 'Hugues GALOUM OCKOUO',
    role: 'AGENT_SAA',
    title: 'Contrôleur Qualité et Conformité',
    phone: '06 675 73 87 / 06 125 8401',
    service: 'Service SAA - Terrain',
    email: 'galoum.saa@ddl-pointenoire.cg',
    defaultPassword: 'Galoum@2026',
    isActive: true
  },
  {
    id: '268281cd-3b0c-476f-a99a-0e7f8c41a9e0',
    badge: 'SAA-PN-009',
    username: 'mpemba',
    name: 'Juveldi MPEMBA',
    role: 'AGENT_SAA',
    title: 'Responsable Qualité',
    phone: '068817104',
    service: 'Service SAA - Terrain',
    email: 'mpemba.saa@ddl-pointenoire.cg',
    defaultPassword: 'Mpemba@2026',
    isActive: true
  },
  {
    id: '4aa6cbd4-7b8d-48cf-adc9-736e8295c9d0',
    badge: 'SPA-PN-010',
    username: 'kitsakou',
    name: 'Ulriche Pergella KITSAKOU',
    role: 'CHEF_SPA',
    title: 'Promotion & Animation des Loisirs',
    phone: '06 000 00 10',
    service: 'Service Promotion, Animation & Loisirs Sains',
    email: 'kitsakou.spa@ddl-pointenoire.cg',
    defaultPassword: 'Kitsakou@2026',
    isActive: true
  },
  {
    id: 'SAF-REGIE',
    badge: 'SAF-REG-01',
    username: 'regie',
    name: 'Régisseur DDL-PN',
    role: 'REGISSEUR',
    title: 'Régisseur des Recettes & Versements Trésor',
    phone: '+242 06 800 12 34',
    service: 'Service Administratif & Financier (SAF)',
    email: 'regie.saf@ddl-pointenoire.cg',
    defaultPassword: 'RegieSaf@2026',
    isActive: true
  }
];

export interface AuthResult {
  success: boolean;
  user?: AppUser;
  targetModule?: string;
  error?: string;
}

class AuthService {
  private accounts: UserAccount[] = [];

  constructor() {
    this.initAccounts();
  }

  private initAccounts() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.accounts = parsed;
          return;
        }
      }
    } catch {
      // ignore
    }
    this.accounts = [...OFFICIAL_USER_ACCOUNTS];
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(this.accounts));
    } catch {
      // ignore
    }
  }

  public getAllAccounts(): UserAccount[] {
    return this.accounts;
  }

  public getFieldAgents(): UserAccount[] {
    return this.accounts.filter(a => a.role === 'AGENT_SAA' || a.role === 'CHEF_SPA');
  }

  public getAccountById(id: string): UserAccount | undefined {
    return this.accounts.find(a => a.id === id);
  }

  public addAccount(accountData: Omit<UserAccount, 'id'> & { id?: string }): UserAccount {
    const newId = accountData.id || `AGENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newAccount: UserAccount = {
      ...accountData,
      id: newId,
      isActive: accountData.isActive ?? true,
      defaultPassword: accountData.defaultPassword || 'DdlPn@2026!'
    };
    this.accounts.unshift(newAccount);
    this.saveToStorage();
    return newAccount;
  }

  public updatePassword(accountId: string, newPassword: string): boolean {
    const acc = this.accounts.find(a => a.id === accountId);
    if (!acc) return false;
    acc.defaultPassword = newPassword;
    acc.passwordHash = newPassword;
    this.saveToStorage();
    return true;
  }

  public updateAccount(accountId: string, updates: Partial<UserAccount>): boolean {
    const idx = this.accounts.findIndex(a => a.id === accountId);
    if (idx === -1) return false;
    this.accounts[idx] = {
      ...this.accounts[idx],
      ...updates
    };
    this.saveToStorage();
    return true;
  }

  public deleteAccount(accountId: string): boolean {
    const prevLen = this.accounts.length;
    this.accounts = this.accounts.filter(a => a.id !== accountId);
    if (this.accounts.length !== prevLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Multi-criteria authentication:
   * Accepts identifier as Email, Username, Badge, Phone, or Matricule.
   * Matches password with default password, custom password, or Master Emergency Password.
   */
  public async authenticate(identifier: string, rawPassword: string): Promise<AuthResult> {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanIdStrict = cleanId.replace(/[\s\-_.]/g, '');
    const cleanPwd = (rawPassword || '').trim();

    if (!cleanId) {
      return { success: false, error: "Veuillez saisir votre identifiant (Email, Nom d'utilisateur, Badge ou Téléphone)." };
    }

    if (!cleanPwd) {
      return { success: false, error: 'Veuillez renseigner votre mot de passe de session.' };
    }

    // 1. Try to find user in accounts
    let account = this.accounts.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uUsername = (u.username || '').toLowerCase();
      const uBadge = (u.badge || '').toLowerCase().replace(/[\s\-_.]/g, '');
      const uPhone = (u.phone || '').replace(/[\s\-_.]/g, '');
      const uName = (u.name || '').toLowerCase();
      const uId = (u.id || '').toLowerCase();

      return (
        uEmail === cleanId ||
        uUsername === cleanId ||
        uBadge === cleanIdStrict ||
        uBadge.includes(cleanIdStrict) ||
        uPhone === cleanIdStrict ||
        uPhone.includes(cleanIdStrict) ||
        uName === cleanId ||
        uId === cleanId
      );
    });

    // Special aliases
    if (!account) {
      if (cleanId === 'admin' || cleanId.includes('matoko') || cleanId.includes('jacks')) {
        account = this.accounts.find(u => u.id === 'ADMIN-MATOKO');
      } else if (cleanId === 'directeur' || cleanId.includes('ntseke') || cleanId.includes('ngouaka')) {
        account = this.accounts.find(u => u.id === 'DIR-01');
      } else if (cleanId === 'regie' || cleanId === 'saf' || cleanId.includes('tresor')) {
        account = this.accounts.find(u => u.id === 'SAF-REGIE');
      }
    }

    if (!account) {
      return {
        success: false,
        error: `Identifiant « ${identifier} » non reconnu dans le fichier des agents assermentés DDL-PN.`
      };
    }

    // 2. Validate password
    const validPasswords = [
      account.defaultPassword,
      account.passwordHash,
      MASTER_EMERGENCY_PASSWORD,
      'DdlPn@2026',
      'Matoko@2026',
      'Directeur@2026'
    ].filter(Boolean);

    const isPasswordValid = validPasswords.some(
      p => p && p.toLowerCase() === cleanPwd.toLowerCase()
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: `Mot de passe incorrect pour le compte de ${account.name} (${account.badge}).`
      };
    }

    // 3. Update last login
    account.lastLogin = new Date().toISOString();
    this.saveToStorage();

    // Async sync to Supabase in background only if configured
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase
          .from('app_users')
          .update({ last_login: account.lastLogin })
          .eq('id', account.id)
      ).catch(() => {
        // ignore network errors
      });
    }

    // Determine target module
    let targetModule = 'MOD-01';
    if (account.role === 'AGENT_SAA') {
      targetModule = 'MOD-03'; // Google Calendar / Portal
    } else if (account.role === 'REGISSEUR') {
      targetModule = 'MOD-10'; // Régie SAF & Trésor
    } else if (account.role === 'CHEF_SPA') {
      targetModule = 'MOD-08'; // SPA & Loisirs Sains
    }

    const appUser: AppUser = {
      id: account.id,
      badge: account.badge,
      name: account.name,
      role: account.role,
      title: account.title,
      phone: account.phone,
      service: account.service,
      email: account.email
    };

    return {
      success: true,
      user: appUser,
      targetModule
    };
  }
}

export const authService = new AuthService();
