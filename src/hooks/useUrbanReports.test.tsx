import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUrbanReports } from './useUrbanReports';
import { DEFAULT_LOCATION, UrbanReport } from '@/types/urban';
import { REPORTS_STORAGE_KEY, parseReports, retainReports } from '@/lib/reportStorage';

const citizen = { userId: 'citizen-1', isAdmin: false };
const admin = { userId: 'admin-1', isAdmin: true };
const sample = (id = 'existing'): UrbanReport => ({
  id, type: 'obra', description: 'Buraco na pista', severity: 'warning', priority: 'media',
  lat: -23.5, lng: -47.45, timestamp: new Date('2026-09-01T12:00:00Z'), status: 'aberto',
  photo: 'data:image/jpeg;base64,YWJj', mine: true, ownerId: citizen.userId,
});

beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe('persistência e ciclo dos chamados', () => {
  it('não exclui chamados nem fotos ao limitar os sensores', () => {
    const citizenReports = Array.from({ length: 220 }, (_, i) => sample(`r-${i}`));
    const sensors = Array.from({ length: 220 }, (_, i) => ({ ...sample(`sensor-${i}`), isSensor: true, mine: false, ownerId: undefined }));
    const kept = retainReports([...sensors, ...citizenReports]);
    expect(kept.filter(r => r.mine)).toEqual(citizenReports);
    expect(kept.filter(r => r.isSensor)).toHaveLength(1);
  });

  it('mantém todos os chamados quando a simulação ultrapassa 200 registros', () => {
    const originals = Array.from({ length: 201 }, (_, i) => sample(`r-${i}`));
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(originals));
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, citizen));
    act(() => vi.advanceTimersByTime(30_000));
    expect(result.current.reports.filter(r => r.mine)).toHaveLength(201);
    expect(parseReports(localStorage.getItem(REPORTS_STORAGE_KEY)!).filter(r => r.mine)).toHaveLength(201);
  });

  it('mantém fotos e recusa salvar quando o armazenamento está cheio', () => {
    const original = JSON.stringify([sample()]);
    localStorage.setItem(REPORTS_STORAGE_KEY, original);
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, citizen));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError'); });
    act(() => expect(() => result.current.addReport({ type: 'obra', description: 'Novo', position: DEFAULT_LOCATION })).toThrow('cheio'));
    expect(localStorage.getItem(REPORTS_STORAGE_KEY)).toBe(original);
    expect(result.current.reports).toHaveLength(1);
    expect(result.current.reports[0].photo).toBe(sample().photo);
  });

  it.each(['null', '{invalid', JSON.stringify([{ ...sample(), lat: 'inválido' }]), JSON.stringify([{ ...sample(), timestamp: 'inválido' }])])(
    'não sobrescreve dados corrompidos (%s)', (raw) => {
      localStorage.setItem(REPORTS_STORAGE_KEY, raw);
      const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, citizen));
      act(() => vi.advanceTimersByTime(15_000));
      expect(result.current.storageError).toBeTruthy();
      expect(localStorage.getItem(REPORTS_STORAGE_KEY)).toBe(raw);
    }
  );

  it('preserva uma lista vazia sem recriar dados fictícios', () => {
    localStorage.setItem(REPORTS_STORAGE_KEY, '[]');
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, citizen));
    expect(result.current.reports).toEqual([]);
  });

  it('preserva o chamado salvo por outra aba antes da próxima ação', () => {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify([sample()]));
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, citizen));
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify([sample('other-tab'), sample()]));
    act(() => { result.current.addReport({ type: 'obra', description: 'Novo', position: DEFAULT_LOCATION }); });
    expect(result.current.reports).toHaveLength(3);
    expect(result.current.reports.some(r => r.id === 'other-tab')).toBe(true);
  });

  it('gera IDs distintos para chamados no mesmo milissegundo', () => {
    localStorage.setItem(REPORTS_STORAGE_KEY, '[]');
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, citizen));
    act(() => {
      result.current.addReport({ type: 'obra', description: 'Um', position: DEFAULT_LOCATION });
      result.current.addReport({ type: 'obra', description: 'Dois', position: DEFAULT_LOCATION });
    });
    expect(new Set(result.current.reports.map(r => r.id)).size).toBe(2);
  });

  it('não considera o chamado de outra conta como próprio', () => {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify([sample()]));
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, { userId: 'other', isAdmin: false }));
    expect(result.current.reports[0].mine).toBe(false);
    act(() => result.current.updateStatus('existing', 'resolvido'));
    expect(result.current.reports[0].status).toBe('aberto');
  });

  it('registra a nova resolução sem apagar a duração da primeira nem reiniciar uma confirmação', () => {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify([sample()]));
    const { result, rerender } = renderHook(({ account }) => useUrbanReports(DEFAULT_LOCATION, account), { initialProps: { account: admin } });
    act(() => result.current.updateStatus('existing', 'resolvido'));
    const firstResolved = result.current.reports[0].resolvedAt!.getTime();
    const firstDuration = result.current.reports[0].resolutionMsRecorded;
    rerender({ account: citizen });
    act(() => result.current.confirmResolution('existing', false));
    expect(result.current.reports[0].resolvedAt).toBeUndefined();
    rerender({ account: admin });
    act(() => { vi.advanceTimersByTime(1000); result.current.updateStatus('existing', 'resolvido'); });
    expect(result.current.reports[0].resolvedAt!.getTime()).toBe(firstResolved + 1000);
    expect(result.current.reports[0].resolutionMsRecorded).toBe(firstDuration);
    rerender({ account: citizen });
    act(() => result.current.confirmResolution('existing', true));
    rerender({ account: admin });
    act(() => result.current.updateStatus('existing', 'resolvido'));
    expect(result.current.reports[0].confirmation).toBe('confirmado');
  });
});
