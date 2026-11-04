import { describe, expect, it, vi, afterEach } from 'vitest';
import { applyFixedReports, belongsToMode, fixedReports, sourceFor } from './reportData';
import { parseReports, serializeReports } from './reportStorage';

afterEach(() => vi.restoreAllMocks());

describe('conjunto controlado e procedência', () => {
  it('mantém IDs, datas e totais conhecidos sem depender de relógio ou sorteio', () => {
    vi.spyOn(Date, 'now').mockReturnValue(0);
    vi.spyOn(Math, 'random').mockImplementation(() => { throw new Error('Sorteio proibido'); });
    const reports = fixedReports();
    expect(reports.map(r => [r.id, r.timestamp.toISOString(), r.type, r.status])).toEqual([
      ['fixture-v1-01', '2026-09-01T12:00:00.000Z', 'acidente', 'aberto'],
      ['fixture-v1-02', '2026-09-02T12:00:00.000Z', 'obra', 'analise'],
      ['fixture-v1-03', '2026-09-03T12:00:00.000Z', 'iluminacao', 'atendimento'],
      ['fixture-v1-04', '2026-09-04T12:00:00.000Z', 'transito', 'resolvido'],
      ['fixture-v1-05', '2026-09-05T12:00:00.000Z', 'acidente', 'analise'],
      ['fixture-v1-06', '2026-09-06T12:00:00.000Z', 'obra', 'atendimento'],
      ['fixture-v1-07', '2026-09-07T12:00:00.000Z', 'iluminacao', 'resolvido'],
      ['fixture-v1-08', '2026-09-08T12:00:00.000Z', 'transito', 'aberto'],
    ]);
    const counts = (field: 'priority' | 'severity' | 'region') => reports.reduce((out, r) => {
      out[r[field]!] = (out[r[field]!] ?? 0) + 1; return out;
    }, {} as Record<string, number>);
    expect(counts('priority')).toEqual({ critica: 2, alta: 2, media: 2, baixa: 2 });
    expect(counts('severity')).toEqual({ severe: 2, warning: 4, normal: 2 });
    expect(counts('region')).toEqual({ Centro: 3, 'Zona Norte': 2, 'Zona Sul': 1, 'Zona Leste': 1, 'Zona Oeste': 1 });
    expect(reports.filter(r => r.confirmation === 'pendente')).toHaveLength(1);
    expect(reports.filter(r => r.confirmation === 'contestado')).toHaveLength(1);
    expect(reports.filter(r => r.confirmation === 'confirmado')).toHaveLength(1);
    reports[0].timestamp.setFullYear(2000);
    expect(fixedReports()[0].timestamp.toISOString()).toBe('2026-09-01T12:00:00.000Z');
  });

  it('preserva alterações ao carregar novamente e restaura somente o conjunto fixo explicitamente', () => {
    const original = fixedReports();
    const edited = { ...original[0], status: 'resolvido' as const };
    const manual = { ...original[1], id: 'manual', source: 'manual_local' as const, ownerId: 'owner', photo: 'foto' };
    const current = [edited, manual, ...original.slice(1)];
    expect(applyFixedReports(current, false)).toBe(current);
    const reset = applyFixedReports(current, true);
    expect(reset.find(r => r.id === edited.id)?.status).toBe('aberto');
    expect(reset.find(r => r.id === 'manual')).toBe(manual);
    expect(current[0]).toBe(edited);
  });

  it.each([false, true])('recusa colisão de ID sem sobrescrever registros (restaurar=%s)', reset => {
    const conflict = { ...fixedReports()[0], source: 'manual_local' as const, ownerId: 'owner' };
    const current = [conflict];
    expect(() => applyFixedReports(current, reset)).toThrow('ID');
    expect(current).toEqual([conflict]);
  });

  it('separa simulações antigas e nunca declara legado desconhecido como ocorrência real', () => {
    const report = { ...fixedReports()[0], id: 'old', source: undefined };
    expect(sourceFor(report)).toBe('legacy_unknown');
    expect(belongsToMode(report, 'avaliacao')).toBe(true);
    for (const simulated of [{ ...report, id: 'seed-12' }, { ...report, id: 'sensor-1001-123' }, { ...report, isSensor: true }]) {
      expect(sourceFor(simulated)).toBe('legacy_simulated');
      expect(belongsToMode(simulated, 'avaliacao')).toBe(false);
      expect(belongsToMode(simulated, 'demonstracao')).toBe(true);
    }
  });

  it('preserva procedência e versão na persistência e recusa valor inválido', () => {
    expect(parseReports(serializeReports(fixedReports()))).toEqual(fixedReports());
    expect(() => parseReports(JSON.stringify([{ ...fixedReports()[0], source: 'real' }]))).toThrow();
  });
});
