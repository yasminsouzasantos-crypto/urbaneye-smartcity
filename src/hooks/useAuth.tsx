import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'cidadao' | 'admin';

export interface SessionUser {
  name: string;
  role: Role;
}

interface AuthValue {
  user: SessionUser | null;
  ready: boolean;
  login: (role: Role, name?: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const STORAGE_KEY = 'urbaneye.session.v1';

const AuthContext = createContext<AuthValue | null>(null);

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser;
    if (parsed?.role !== 'cidadao' && parsed?.role !== 'admin') return null;
    return { name: parsed.name || (parsed.role === 'admin' ? 'Administrador' : 'Cidadão'), role: parsed.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readSession());
    setReady(true);
  }, []);

  const login = useCallback((role: Role, name?: string) => {
    const session: SessionUser = {
      role,
      name: name?.trim() || (role === 'admin' ? 'Administrador' : 'Cidadão'),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, ready, login, logout, isAdmin: user?.role === 'admin' }),
    [user, ready, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
