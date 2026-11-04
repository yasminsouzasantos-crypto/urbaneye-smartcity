import { DataMode, ReportSource, UrbanReport, REGIONS } from '@/types/urban';

export const DATA_MODE_STORAGE_KEY = 'urbaneye.data-mode.v1';
export const FIXTURE_VERSION = 'urbaneye-local-v1';
export const DEMO_REFERENCE_TIME = Date.parse('2026-09-08T18:00:00.000Z');
export const DATA_MODE_LABELS: Record<DataMode, string> = {
  avaliacao: 'Avaliação local',
  demonstracao: 'Demonstração simulada',
};
export const SOURCE_LABELS: Record<ReportSource, string> = {
  manual_local: 'Manual local · não verificado em campo',
  demo_manual: 'Simulado · cadastro manual',
  fixture: 'Simulado · conjunto fixo v1',
  legacy_simulated: 'Simulado · legado',
  legacy_unknown: 'Legado · origem não verificada',
};

/** Infer only known old simulator markers; never call unmarked legacy data real. */
export function sourceFor(report: UrbanReport): ReportSource {
  if (report.isSensor || /^seed-\d+$/.test(report.id) || report.id.startsWith('sensor-')) return 'legacy_simulated';
  return report.source ?? 'legacy_unknown';
}

export function isSimulated(report: UrbanReport): boolean {
  return ['fixture', 'demo_manual', 'legacy_simulated'].includes(sourceFor(report));
}

export function belongsToMode(report: UrbanReport, mode: DataMode): boolean {
  return isSimulated(report) === (mode === 'demonstracao');
}

/** Each call returns new objects/dates. No clock, randomness, account or GPS input. */
export function fixedReports(): UrbanReport[] {
  const rows = [
    ['acidente', 'aberto', 'critica', 0],
    ['obra', 'analise', 'alta', 1],
    ['iluminacao', 'atendimento', 'baixa', 2],
    ['transito', 'resolvido', 'media', 3],
    ['acidente', 'analise', 'alta', 0],
    ['obra', 'atendimento', 'media', 1],
    ['iluminacao', 'resolvido', 'baixa', 4],
    ['transito', 'aberto', 'critica', 0],
  ] as const;
  return rows.map(([type, status, priority, regionIndex], index) => {
    const region = REGIONS[regionIndex];
    const timestamp = new Date(`2026-09-0${index + 1}T12:00:00.000Z`);
    const duration = index === 3 ? 2 * 3_600_000 : index === 6 ? 4 * 3_600_000 : undefined;
    return {
      id: `fixture-v1-${String(index + 1).padStart(2, '0')}`,
      source: 'fixture', datasetVersion: FIXTURE_VERSION,
      type, status, priority,
      description: `Cenário simulado ${index + 1}: ${type}. Sem ocorrência real associada.`,
      severity: type === 'acidente' ? 'severe' : type === 'iluminacao' ? 'normal' : 'warning',
      timestamp, lat: region.center[0], lng: region.center[1],
      region: region.name, address: `${region.name}, Sorocaba (simulado)`,
      ...(duration !== undefined ? {
        resolvedAt: new Date(timestamp.getTime() + duration),
        resolutionMsRecorded: duration,
        confirmation: index === 3 ? 'confirmado' as const : 'pendente' as const,
      } : {}),
      ...(index === 5 ? { reopened: true, confirmation: 'contestado' as const, resolutionMsRecorded: 3_600_000 } : {}),
    };
  });
}

/** Loading only fills missing IDs; reset explicitly restores only this dataset. */
export function applyFixedReports(current: UrbanReport[], reset: boolean): UrbanReport[] {
  const fixtures = fixedReports();
  const ids = new Set(fixtures.map(report => report.id));
  for (const report of current) {
    if (ids.has(report.id) && (report.source !== 'fixture' || report.datasetVersion !== FIXTURE_VERSION || report.ownerId || report.mine)) {
      throw new Error('Um ID do conjunto fixo já pertence a outro registro. Nenhum dado foi alterado.');
    }
  }
  if (reset) return [...fixtures, ...current.filter(report => !ids.has(report.id))];
  const existing = new Set(current.map(report => report.id));
  const missing = fixtures.filter(report => !existing.has(report.id));
  return missing.length ? [...missing, ...current] : current;
}
