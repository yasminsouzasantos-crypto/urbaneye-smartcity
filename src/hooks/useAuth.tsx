import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPasswordSecret, legacyHash, verifyPassword } from '@/lib/password';
import { toast } from 'sonner';

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
  signUp: (data: { name: string; email: string; password: string; role: Role }) => Promise<{ error?: string }>;
  signIn: (data: { email: string; password: string }) => Promise<{ error?: string }>;
  /** legacy demo entry, kept so nothing that used it breaks */
  login: (role: Role, name?: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const STORAGE_KEY = 'urbaneye.session.v1';
const USERS_KEY = 'urbaneye.users.v1';

const AuthContext = createContext<AuthValue | null>(null);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<SessionUser>;
  return typeof item.id === 'string' && !!item.id && typeof item.name === 'string' &&
    typeof item.email === 'string' && (item.role === 'cidadao' || item.role === 'admin');
}

function readAccounts(): StoredAccount[] {
  const raw = localStorage.getItem(USERS_KEY);
  const parsed: unknown = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(account => isSessionUser(account) && typeof (account as StoredAccount).secret === 'string')) {
    throw new Error('As contas locais estão em um formato inválido; os dados foram preservados.');
  }
  return parsed;
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (parsed?.role !== 'cidadao' && parsed?.role !== 'admin') return null;
    if ([parsed.id, parsed.name, parsed.email].some(value => value !== undefined && typeof value !== 'string')) return null;
    return {
      id: parsed.id || legacyHash(parsed.email || parsed.name || 'anon'),
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
  const attemptRef = useRef(0);

  useEffect(() => {
    setUser(readSession());
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        attemptRef.current += 1;
        setUser(readSession());
      }
    };
    window.addEventListener('storage', sync);
    return () => { attemptRef.current += 1; window.removeEventListener('storage', sync); };
  }, []);

  const persist = useCallback((session: SessionUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
  }, []);

  const signUp = useCallback<AuthValue['signUp']>(
    async ({ name, email, password, role }) => {
      const attempt = ++attemptRef.current;
      try {
      const cleanEmail = normalizeEmail(email);
      const cleanName = name.trim();
      if (cleanName.length < 2) return { error: 'Informe seu nome completo.' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) return { error: 'E-mail inválido.' };
      if (password.length < 6) return { error: 'A senha precisa ter ao menos 6 caracteres.' };
      if (cleanName.length > 60 || cleanEmail.length > 255 || password.length > 72 || !['cidadao', 'admin'].includes(role)) {
        return { error: 'Confira os dados informados.' };
      }

      const secret = await createPasswordSecret(password);
      if (attempt !== attemptRef.current) return { error: 'Operação de entrada cancelada.' };
      const accounts = readAccounts();
      if (accounts.some((a) => a.email === cleanEmail)) return { error: 'Já existe uma conta com este e-mail.' };

      const account: StoredAccount = {
        id: crypto.randomUUID(),
        name: cleanName,
        email: cleanEmail,
        role,
        secret,
      };
      writeAccounts([...accounts, account]);
      persist({ id: account.id, name: account.name, email: account.email, role: account.role });
      return {};
      } catch {
        return { error: 'Não foi possível salvar a conta ou a sessão. Verifique o espaço e as permissões de armazenamento do navegador e use localhost ou HTTPS.' };
      }
    },
    [persist]
  );

  const signIn = useCallback<AuthValue['signIn']>(
    async ({ email, password }) => {
      const attempt = ++attemptRef.current;
      try {
      const cleanEmail = normalizeEmail(email);
      const account = readAccounts().find((a) => a.email === cleanEmail);
      if (!account || !(await verifyPassword(password, account.secret, cleanEmail))) {
        return { error: 'E-mail ou senha incorretos.' };
      }
      if (!account.secret.startsWith('pbkdf2-sha256$')) {
        const secret = await createPasswordSecret(password);
        if (attempt !== attemptRef.current) return { error: 'Operação de entrada cancelada.' };
        const latest = readAccounts();
        // Preserve accounts registered while the password was being checked.
        writeAccounts(latest.map(item => item.id === account.id && item.secret === account.secret ? { ...item, secret } : item));
      }
      if (attempt !== attemptRef.current) return { error: 'Operação de entrada cancelada.' };
      persist({ id: account.id, name: account.name, email: account.email, role: account.role });
      return {};
      } catch {
        return { error: 'Não foi possível acessar as contas ou salvar a sessão neste navegador. Os dados existentes foram preservados.' };
      }
    },
    [persist]
  );

  const login = useCallback(
    (role: Role, name?: string) => {
      attemptRef.current += 1;
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
    attemptRef.current += 1;
    try { localStorage.removeItem(STORAGE_KEY); }
    catch { toast.error('A sessão foi encerrada nesta tela, mas o navegador bloqueou a remoção da sessão salva.'); }
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
