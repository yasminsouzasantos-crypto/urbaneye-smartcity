import { webcrypto } from 'node:crypto';
import { act, cleanup, renderHook } from '@testing-library/react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from './useAuth';
import { legacyHash, verifyPassword } from '@/lib/password';

const data = { name: 'Pessoa Teste', email: 'teste@example.com', password: 'test-pass-123', role: 'cidadao' as const };
const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
beforeEach(() => { localStorage.clear(); vi.stubGlobal('crypto', webcrypto); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('contas locais', () => {
  it('cadastra, sai e entra com senha derivada e sal aleatório', async () => {
    const { result } = renderHook(useAuth, { wrapper });
    await act(async () => { expect(await result.current.signUp(data)).toEqual({}); });
    const first = JSON.parse(localStorage.getItem('urbaneye.users.v1')!)[0];
    expect(first.secret).toMatch(/^pbkdf2-sha256\$600000\$/);
    expect(first.secret).not.toContain(data.password);
    act(() => result.current.logout());
    await act(async () => { expect(await result.current.signIn({ ...data, password: 'wrong' })).toHaveProperty('error'); });
    expect(result.current.user).toBeNull();
    await act(async () => { expect(await result.current.signIn(data)).toEqual({}); });
    expect(result.current.user?.id).toBe(first.id);
    expect(await verifyPassword(data.password, first.secret, data.email)).toBe(true);
  });

  it('migra a senha antiga durante o login sem trocar a conta', async () => {
    localStorage.setItem('urbaneye.users.v1', JSON.stringify([{ id: 'legacy-id', name: data.name, email: data.email, role: data.role, secret: legacyHash(`${data.email}:${data.password}`) }]));
    const { result } = renderHook(useAuth, { wrapper });
    await act(async () => { expect(await result.current.signIn(data)).toEqual({}); });
    expect(result.current.user?.id).toBe('legacy-id');
    const updated = JSON.parse(localStorage.getItem('urbaneye.users.v1')!)[0];
    expect(updated.secret).toMatch(/^pbkdf2-sha256\$/);
    expect(await verifyPassword(data.password, updated.secret, data.email)).toBe(true);
  });

  it('não apaga contas inválidas ao cadastrar', async () => {
    localStorage.setItem('urbaneye.users.v1', '[null]');
    const { result } = renderHook(useAuth, { wrapper });
    await act(async () => { expect(await result.current.signUp(data)).toHaveProperty('error'); });
    expect(localStorage.getItem('urbaneye.users.v1')).toBe('[null]');
    expect(result.current.user).toBeNull();
  });

  it('retorna erro em vez de travar com armazenamento bloqueado', async () => {
    const { result } = renderHook(useAuth, { wrapper });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
    await act(async () => { expect(await result.current.signUp(data)).toHaveProperty('error'); });
    expect(result.current.user).toBeNull();
  });

  it('ignora uma sessão malformada e acompanha logout de outra aba', async () => {
    localStorage.setItem('urbaneye.session.v1', JSON.stringify({ id: 'bad', role: 'admin', name: {} }));
    const { result } = renderHook(useAuth, { wrapper });
    expect(result.current.user).toBeNull();
    await act(async () => { await result.current.signUp(data); });
    localStorage.removeItem('urbaneye.session.v1');
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'urbaneye.session.v1' })));
    expect(result.current.user).toBeNull();
  });

  it('não reabre a sessão se o usuário sair durante o processamento', async () => {
    const { result } = renderHook(useAuth, { wrapper });
    await act(async () => {
      const pending = result.current.signUp(data);
      result.current.logout();
      expect(await pending).toHaveProperty('error');
    });
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('urbaneye.session.v1')).toBeNull();
  });
});
