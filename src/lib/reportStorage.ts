import { z } from 'zod';
import { isUrbanImageAnalysis } from './aiAnalysis';
import type { UrbanReport } from '@/types/urban';

export const REPORTS_STORAGE_KEY = 'urbaneye.reports.v2';

const dateSchema = z.string().refine((value) => Number.isFinite(Date.parse(value))).transform((value) => new Date(value));
const reportSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['acidente', 'obra', 'iluminacao', 'transito', 'sensor']),
  description: z.string(),
  severity: z.enum(['severe', 'warning', 'normal']),
  priority: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  timestamp: dateSchema,
  status: z.enum(['aberto', 'analise', 'atendimento', 'resolvido']),
  resolvedAt: dateSchema.optional(),
  confirmation: z.enum(['pendente', 'confirmado', 'contestado']).optional(),
  resolutionMsRecorded: z.number().finite().nonnegative().optional(),
  photo: z.string().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  isSensor: z.boolean().optional(),
  reopened: z.boolean().optional(),
  mine: z.boolean().optional(),
  ownerId: z.string().min(1).optional(),
  // Old optional AI metadata must not prevent access to a valid report.
  aiAnalysis: z.unknown().optional().transform((value) => isUrbanImageAnalysis(value) ? value : undefined),
}).passthrough();

export function parseReports(raw: string): UrbanReport[] {
  const parsed = z.array(reportSchema).safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error('Os chamados salvos estão em um formato inválido. Os dados originais foram preservados.');
  const ids = new Set<string>();
  return parsed.data.map((report) => {
    if (ids.has(report.id)) throw new Error('Há chamados com identificadores repetidos. Os dados originais foram preservados.');
    ids.add(report.id);
    return {
      ...report,
      priority: report.priority ?? (report.severity === 'severe' ? 'alta' : report.severity === 'warning' ? 'media' : 'baixa'),
    } as UrbanReport;
  });
}

export function serializeReports(reports: UrbanReport[]): string {
  return JSON.stringify(reports);
}

export function storageErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'name' in error && error.name === 'QuotaExceededError') {
    return 'O armazenamento do navegador está cheio. Não foi possível salvar; os chamados e fotos anteriores foram preservados.';
  }
  return 'Não foi possível acessar ou salvar os chamados neste navegador. Os dados originais foram preservados.';
}

/** Only disposable simulated sensor readings may expire, never citizen reports. */
export function retainReports(reports: UrbanReport[]): UrbanReport[] {
  const permanentCount = reports.filter((report) => !report.isSensor || report.mine || report.ownerId).length;
  const sensorLimit = Math.max(1, 200 - permanentCount);
  let sensors = 0;
  return reports.filter((report) => !report.isSensor || report.mine || report.ownerId || ++sensors <= sensorLimit);
}
