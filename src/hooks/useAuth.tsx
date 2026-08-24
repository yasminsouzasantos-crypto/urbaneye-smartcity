import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'cidadao' | 'admin';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface StoredAccount extends SessionUser {
  secret: string;
}

interface AuthValue {
  user: SessionUser | null;
  ready: boolean;
  signUp: (data: { name: string; email: string; password: string; role: Role }) => { error?: string };
  signIn: (data: { email: string; password: string }) => { error?: string };
  /** legacy demo entry, kept so nothing that used it breaks */
  login: (role: Role, name?: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const STORAGE_KEY = 'urbaneye.session.v1';
const USERS_KEY = 'urbaneye.users.v1';

const AuthContext = createContext<AuthValue | null>(null);

/** obfuscation only — demo app without backend */
function hash(value: string) {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredAccount[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser;
    if (parsed?.role !== 'cidadao' && parsed?.role !== 'admin') return null;
    return {
      id: parsed.id || hash(parsed.email || parsed.name || 'anon'),
      email: parsed.email || '',
      name: parsed.name || (parsed.role === 'admin' ? 'Administrador' : 'Cidadão'),
      role: parsed.role,
    };
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

  const persist = useCallback((session: SessionUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
  }, []);

  const signUp = useCallback<AuthValue['signUp']>(
    ({ name, email, password, role }) => {
      const cleanEmail = normalizeEmail(email);
      const cleanName = name.trim();
      if (cleanName.length < 2) return { error: 'Informe seu nome completo.' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) return { error: 'E-mail inválido.' };
      if (password.length < 6) return { error: 'A senha precisa ter ao menos 6 caracteres.' };

      const accounts = readAccounts();
      if (accounts.some((a) => a.email === cleanEmail)) return { error: 'Já existe uma conta com este e-mail.' };

      const account: StoredAccount = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        name: cleanName,
        email: cleanEmail,
        role,
        secret: hash(`${cleanEmail}:${password}`),
      };
      writeAccounts([...accounts, account]);
      persist({ id: account.id, name: account.name, email: account.email, role: account.role });
      return {};
    },
    [persist]
  );

  const signIn = useCallback<AuthValue['signIn']>(
    ({ email, password }) => {
      const cleanEmail = normalizeEmail(email);
      const account = readAccounts().find((a) => a.email === cleanEmail);
      if (!account || account.secret !== hash(`${cleanEmail}:${password}`)) {
        return { error: 'E-mail ou senha incorretos.' };
      }
      persist({ id: account.id, name: account.name, email: account.email, role: account.role });
      return {};
    },
    [persist]
  );

  const login = useCallback(
    (role: Role, name?: string) => {
      persist({
        id: `demo-${role}`,
        email: `${role}@urbaneye.app`,
        role,
        name: name?.trim() || (role === 'admin' ? 'Administrador' : 'Cidadão'),
      });
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, ready, signUp, signIn, login, logout, isAdmin: user?.role === 'admin' }),
    [user, ready, signUp, signIn, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
