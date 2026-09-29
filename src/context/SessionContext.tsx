import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, UserRole } from '../types';
import { APP_USERS } from '../constants/referential';

interface SessionContextType {
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  switchUserById: (id: string) => void;
  isAuthenticated: boolean;
  login: (user: AppUser, targetModule?: string) => void;
  logout: () => void;
  activeModule: string;
  setActiveModule: (moduleId: string) => void;
  isTabletBrigadeMode: boolean;
  setIsTabletBrigadeMode: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  alertCount: number;
  triggerNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  activeNotification: { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  clearNotification: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ddl_pn_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    const saved = localStorage.getItem('ddl_pn_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = APP_USERS.find(u => u.id === parsed.id);
        if (match) return match;
      } catch {
        // fallback
      }
    }
    return APP_USERS[0]; // Default: Directeur Jacques Alphonse MATOKO
  });

  const [activeModule, setActiveModule] = useState<string>(() => {
    return localStorage.getItem('ddl_pn_active_module') || 'MOD-01';
  });

  const [isTabletBrigadeMode, setIsTabletBrigadeMode] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('ddl_pn_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  useEffect(() => {
    localStorage.setItem('ddl_pn_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('ddl_pn_auth', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('ddl_pn_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ddl_pn_active_module', activeModule);
  }, [activeModule]);

  const login = (user: AppUser, targetModule?: string) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (targetModule) {
      setActiveModule(targetModule);
    } else if (user.role === 'AGENT_SAA') {
      setActiveModule('MOD-03');
    } else {
      setActiveModule('MOD-01');
    }
    triggerNotification(`Bienvenue, ${user.name} (${user.title})`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ddl_pn_auth');
    triggerNotification('Vous avez été déconnecté du Système DDL-PN.', 'info');
  };

  const switchUserById = (id: string) => {
    const user = APP_USERS.find(u => u.id === id);
    if (user) {
      setCurrentUser(user);
      triggerNotification(`Session basculée sur : ${user.name} (${user.title})`, 'info');
    }
  };

  const triggerNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setActiveNotification({ message, type });
    setTimeout(() => {
      setActiveNotification(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const clearNotification = () => {
    setActiveNotification(null);
  };

  return (
    <SessionContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserById,
        activeModule,
        setActiveModule,
        isTabletBrigadeMode,
        setIsTabletBrigadeMode,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        alertCount: 3, // urgent relances
        triggerNotification,
        activeNotification,
        clearNotification
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
