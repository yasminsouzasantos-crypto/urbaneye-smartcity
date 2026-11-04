import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUrbanReports } from './useUrbanReports';
import { DEFAULT_LOCATION, UrbanReport } from '@/types/urban';
import { REPORTS_STORAGE_KEY, parseReports, retainReports } from '@/lib/reportStorage';
import { DATA_MODE_STORAGE_KEY, fixedReports } from '@/lib/reportData';

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

  it('mantém mais de 200 chamados sem expirar registros com a passagem do tempo', () => {
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

describe('modos locais sem geração automática', () => {
  it('isola o conjunto fixo dos demais simulados e impede cadastros que ficariam ocultos', () => {
    const raw = JSON.stringify([...fixedReports(), { ...sample('seed-0'), ownerId: undefined }, { ...sample('demo'), source: 'demo_manual' }]);
    localStorage.setItem(REPORTS_STORAGE_KEY, raw);
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, citizen));
    act(() => result.current.changeMode('demonstracao'));
    expect(result.current.stats.total).toBe(10);
    act(() => result.current.setFixedOnly(true));
    expect(result.current.stats.total).toBe(8);
    expect(result.current.hiddenCount).toBe(2);
    expect(result.current.reports.every(r => r.source === 'fixture')).toBe(true);
    act(() => expect(() => result.current.addReport({ type: 'obra', description: 'Não ocultar', position: DEFAULT_LOCATION })).toThrow('Todos os simulados'));
    expect(localStorage.getItem(REPORTS_STORAGE_KEY)).toBe(raw);
    act(() => result.current.setFixedOnly(false));
    expect(result.current.stats.total).toBe(10);
  });
  it('inicia em avaliação vazia sem gravar dados ou criar sensores com o tempo', () => {
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, citizen));
    expect(result.current.mode).toBe('avaliacao');
    act(() => vi.advanceTimersByTime(120_000));
    expect(result.current.reports).toEqual([]);
    expect(result.current.stats.total).toBe(0);
    expect(localStorage.getItem(REPORTS_STORAGE_KEY)).toBeNull();
    expect(write).not.toHaveBeenCalled();
  });

  it('troca os modos sem regravar ou apagar os chamados existentes', () => {
    const raw = JSON.stringify([sample(), { ...sample('seed-1'), ownerId: undefined, mine: false }]);
    localStorage.setItem(REPORTS_STORAGE_KEY, raw);
    const { result, unmount } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, citizen));
    expect(result.current.reports.map(r => r.id)).toEqual(['existing']);
    expect(result.current.hiddenCount).toBe(1);
    act(() => result.current.changeMode('demonstracao'));
    expect(result.current.reports.map(r => r.id)).toEqual(['seed-1']);
    act(() => vi.advanceTimersByTime(120_000));
    expect(result.current.stats.total).toBe(1);
    expect(localStorage.getItem(REPORTS_STORAGE_KEY)).toBe(raw);
    unmount();
    const next = renderHook(() => useUrbanReports(DEFAULT_LOCATION, admin));
    expect(next.result.current.mode).toBe('demonstracao');
    expect(next.result.current.reports.map(r => r.id)).toEqual(['seed-1']);
  });

  it('marca cadastros conforme o modo, separa totais e mantém propriedade ao alternar contas', () => {
    const { result, rerender } = renderHook(({ account }) => useUrbanReports(DEFAULT_LOCATION, account), { initialProps: { account: citizen } });
    act(() => { result.current.addReport({ type: 'obra', description: 'Avaliação', position: DEFAULT_LOCATION }); });
    expect(result.current.reports[0].source).toBe('manual_local');
    act(() => result.current.changeMode('demonstracao'));
    expect(result.current.stats.total).toBe(0);
    act(() => { result.current.addReport({ type: 'acidente', description: 'Simulado', position: DEFAULT_LOCATION }); });
    expect(result.current.reports[0].source).toBe('demo_manual');
    expect(result.current.stats).toMatchObject({ total: 1, severe: 1, warning: 0 });
    rerender({ account: admin });
    expect(result.current.reports[0].mine).toBe(false);
    act(() => result.current.changeMode('avaliacao'));
    expect(result.current.stats).toMatchObject({ total: 1, severe: 0, warning: 1 });
    expect(parseReports(localStorage.getItem(REPORTS_STORAGE_KEY)!)).toHaveLength(2);
  });

  it('só carrega explicitamente na demonstração, sem duplicar ou restaurar edições na carga', () => {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify([sample()]));
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, admin));
    act(() => expect(() => result.current.loadFixedReports()).toThrow('demonstração'));
    act(() => result.current.changeMode('demonstracao'));
    expect(result.current.reports).toHaveLength(0);
    act(() => result.current.loadFixedReports());
    expect(result.current.stats).toMatchObject({ total: 8, aberto: 2, analise: 2, atendimento: 2, resolvido: 2,
      severe: 2, warning: 4, normal: 2, critica: 2, alta: 2, media: 2, baixa: 2, aguardandoConfirmacao: 1, contestados: 1 });
    act(() => result.current.updateStatus('fixture-v1-01', 'analise'));
    act(() => result.current.loadFixedReports());
    expect(result.current.stats).toMatchObject({ total: 8, aberto: 1, analise: 3 });
    act(() => result.current.loadFixedReports(true));
    expect(result.current.stats).toMatchObject({ total: 8, aberto: 2, analise: 2 });
    expect(parseReports(localStorage.getItem(REPORTS_STORAGE_KEY)!).find(r => r.id === 'existing')).toEqual(sample());
  });

  it('falha de quota na carga mantém o snapshot e o modo, sem relatar dados carregados', () => {
    const raw = JSON.stringify([sample()]);
    localStorage.setItem(REPORTS_STORAGE_KEY, raw);
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, admin));
    act(() => result.current.changeMode('demonstracao'));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError'); });
    act(() => expect(() => result.current.loadFixedReports()).toThrow('cheio'));
    expect(localStorage.getItem(REPORTS_STORAGE_KEY)).toBe(raw);
    expect(result.current.stats.total).toBe(0);
    expect(result.current.mode).toBe('demonstracao');
    expect(result.current.storageError).toContain('cheio');
  });

  it('não sobrescreve armazenamento corrompido ao carregar ou restaurar', () => {
    localStorage.setItem(REPORTS_STORAGE_KEY, '{invalid');
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, admin));
    act(() => result.current.changeMode('demonstracao'));
    act(() => expect(() => result.current.loadFixedReports()).toThrow());
    act(() => expect(() => result.current.loadFixedReports(true)).toThrow());
    expect(localStorage.getItem(REPORTS_STORAGE_KEY)).toBe('{invalid');
  });

  it('não permite reclassificar procedência pelo patch administrativo ou editar outro modo', () => {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify([...fixedReports(), sample()]));
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, admin));
    act(() => result.current.updateStatus('fixture-v1-01', 'resolvido'));
    act(() => result.current.changeMode('demonstracao'));
    expect(result.current.reports.find(r => r.id === 'fixture-v1-01')?.status).toBe('aberto');
    act(() => result.current.patchReport('fixture-v1-01', { source: 'manual_local', datasetVersion: undefined }));
    expect(result.current.reports.find(r => r.id === 'fixture-v1-01')).toMatchObject({ source: 'fixture', datasetVersion: 'urbaneye-local-v1' });
  });

  it('sincroniza o modo de outra aba e usa avaliação para preferência inválida', () => {
    localStorage.setItem(DATA_MODE_STORAGE_KEY, 'invalid');
    const { result } = renderHook(() => useUrbanReports(DEFAULT_LOCATION, citizen));
    expect(result.current.mode).toBe('avaliacao');
    act(() => {
      localStorage.setItem(DATA_MODE_STORAGE_KEY, 'demonstracao');
      window.dispatchEvent(new StorageEvent('storage', { key: DATA_MODE_STORAGE_KEY }));
    });
    expect(result.current.mode).toBe('demonstracao');
  });
});
