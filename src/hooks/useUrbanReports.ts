import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  UrbanReport,
  ProblemType,
  Severity,
  Priority,
  ReportStatus,
  UrbanImageAnalysis,
  REGIONS,
} from '@/types/urban';
import { regionFor } from '@/lib/urban';
import { parseReports, REPORTS_STORAGE_KEY, retainReports, serializeReports, storageErrorMessage } from '@/lib/reportStorage';

const STORAGE_KEY = REPORTS_STORAGE_KEY;
const HOUR = 3600000;

const DESCRIPTIONS: Record<Exclude<ProblemType, 'sensor'>, string[]> = {
  acidente: ['Colisão entre dois veículos', 'Moto caída na pista', 'Atropelamento na faixa'],
  obra: ['Recapeamento da via', 'Buraco profundo no asfalto', 'Obra sem sinalização'],
  iluminacao: ['Poste com lâmpada queimada', 'Rua totalmente escura', 'Poste piscando'],
  transito: ['Congestionamento intenso', 'Semáforo apagado', 'Via interditada'],
};

const TYPES: Exclude<ProblemType, 'sensor'>[] = ['acidente', 'obra', 'iluminacao', 'transito'];

export function severityFor(type: ProblemType): Severity {
  return type === 'acidente' ? 'severe' : type === 'obra' || type === 'transito' ? 'warning' : 'normal';
}

/** prioridade inicial sugerida — o administrador pode alterar depois */
export function defaultPriorityFor(severity: Severity): Priority {
  return severity === 'severe' ? 'alta' : severity === 'warning' ? 'media' : 'baixa';
}

function randomNear(center: [number, number], range = 0.015): [number, number] {
  return [center[0] + (Math.random() - 0.5) * range, center[1] + (Math.random() - 0.5) * range];
}

/** Seed history so the admin dashboard has meaningful analytics from day one. */
function buildSeed(): UrbanReport[] {
  const out: UrbanReport[] = [];
  const now = Date.now();
  for (let i = 0; i < 64; i++) {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    // Centro is intentionally denser
    const regionIdx = Math.random() < 0.4 ? 0 : Math.floor(Math.random() * REGIONS.length);
    const region = REGIONS[regionIdx];
    const [lat, lng] = randomNear(region.center, 0.018);
    const openedAt = now - Math.floor(Math.random() * 28) * 24 * HOUR - Math.floor(Math.random() * 24) * HOUR;
    const roll = Math.random();
    const status: ReportStatus =
      roll < 0.42 ? 'resolvido' : roll < 0.6 ? 'atendimento' : roll < 0.78 ? 'analise' : 'aberto';
    const resolvedAt =
      status === 'resolvido' ? new Date(Math.min(now, openedAt + (2 + Math.random() * 60) * HOUR)) : undefined;
    const severity = severityFor(type);
    const pRoll = Math.random();
    const priority: Priority =
      severity === 'severe' && pRoll < 0.45 ? 'critica' : defaultPriorityFor(severity);
    const cRoll = Math.random();
    out.push({
      id: `seed-${i}`,
      type,
      description: DESCRIPTIONS[type][Math.floor(Math.random() * DESCRIPTIONS[type].length)],
      severity,
      priority,
      lat,
      lng,
      timestamp: new Date(openedAt),
      status,
      resolvedAt,
      confirmation: resolvedAt
        ? cRoll < 0.5
          ? 'confirmado'
          : cRoll < 0.85
            ? 'pendente'
            : 'contestado'
        : undefined,
      resolutionMsRecorded: resolvedAt ? resolvedAt.getTime() - openedAt : undefined,
      region: region.name,
      address: `${region.name}, Sorocaba`,
    });
  }
  return out.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function load(): { reports: UrbanReport[]; raw?: string | null; error?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { reports: raw === null ? buildSeed() : parseReports(raw), raw };
  } catch (error) {
    return { reports: [], error: storageErrorMessage(error) };
  }
}

const SENSOR_TYPES: { type: ProblemType; desc: string; severity: Severity }[] = [
  { type: 'transito', desc: 'Fluxo intenso detectado por sensor', severity: 'warning' },
  { type: 'acidente', desc: 'Possível acidente detectado por sensor', severity: 'severe' },
  { type: 'transito', desc: 'Velocidade reduzida detectada', severity: 'normal' },
];

interface NewReportInput {
  type: ProblemType;
  description: string;
  position: [number, number];
  photo?: string;
  address?: string;
  aiAnalysis?: UrbanImageAnalysis;
}

export function useUrbanReports(userPosition: [number, number], account: { userId: string; isAdmin: boolean }) {
  const [initial] = useState(load);
  const [storedReports, setReports] = useState(initial.reports);
  const [storageError, setStorageError] = useState(initial.error);
  const reportsRef = useRef(storedReports);
  const lastRawRef = useRef(initial.raw);
  const idCounter = useRef(1000);
  const { userId, isAdmin } = account;
  const [latitude, longitude] = userPosition;
  const reports = useMemo(() => storedReports.map((report) => {
    const mine = report.ownerId ? report.ownerId === userId : !!report.mine;
    return !!report.mine === mine ? report : { ...report, mine };
  }), [storedReports, userId]);

  // Persist before reporting success. Reading the latest snapshot also preserves
  // changes made in another tab between this render and a user action.
  const commit = useCallback((change: (current: UrbanReport[]) => UrbanReport[]) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const current = raw === lastRawRef.current ? reportsRef.current : raw === null ? [] : parseReports(raw);
      const next = change(current);
      if (next !== current || raw === null) {
        const serialized = serializeReports(next);
        localStorage.setItem(STORAGE_KEY, serialized);
        lastRawRef.current = serialized;
      } else { lastRawRef.current = raw; }
      reportsRef.current = next;
      setReports(next);
      setStorageError(undefined);
      return next;
    } catch (error) {
      const message = storageErrorMessage(error);
      setStorageError(message);
      throw new Error(message);
    }
  }, []);

  useEffect(() => {
    if (!initial.error) {
      try {
        commit((current) => current);
      } catch { /* storageError is displayed by the page */ }
    }
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const next = raw === null ? [] : parseReports(raw);
        lastRawRef.current = raw;
        reportsRef.current = next;
        setReports(next);
        setStorageError(undefined);
      } catch (error) { setStorageError(storageErrorMessage(error)); }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [commit, initial.error]);

  const addReport = useCallback((input: NewReportInput) => {
    const { type, description, position, photo, address, aiAnalysis } = input;
    const severity = severityFor(type);
    const newReport: UrbanReport = {
      id: `r-${crypto.randomUUID()}`,
      type,
      description,
      severity,
      priority: defaultPriorityFor(severity),
      lat: position[0],
      lng: position[1],
      timestamp: new Date(),
      status: 'aberto',
      photo,
      address,
      aiAnalysis,
      region: regionFor(position[0], position[1]),
      mine: true,
      ownerId: userId,
    };
    commit((prev) => [newReport, ...prev]);
    return newReport;
  }, [commit, userId]);

  const updateStatus = useCallback((id: string, status: ReportStatus) => {
    if (!isAdmin) return;
    commit((prev) =>
      prev.map((r) => {
        if (r.id !== id || r.status === status) return r;
        if (status === 'resolvido') {
          const resolvedAt = new Date();
          return {
            ...r,
            status,
            resolvedAt,
            resolutionMsRecorded:
              r.resolutionMsRecorded ?? resolvedAt.getTime() - r.timestamp.getTime(),
            confirmation: 'pendente',
          };
        }
        return { ...r, status, resolvedAt: undefined, confirmation: undefined };
      })
    );
  }, [commit, isAdmin]);

  /** administrador define a prioridade técnica */
  const updatePriority = useCallback((id: string, priority: Priority) => {
    if (!isAdmin) return;
    commit((prev) => prev.map((r) => (r.id === id ? { ...r, priority } : r)));
  }, [commit, isAdmin]);

  /** cidadão confirma (ou contesta) a resolução — histórico é preservado */
  const confirmResolution = useCallback((id: string, solved: boolean) => {
    commit((prev) =>
      prev.map((r) =>
        r.id === id && (r.ownerId ? r.ownerId === userId : r.mine) && r.status === 'resolvido' && r.confirmation === 'pendente'
          ? solved
            ? { ...r, confirmation: 'confirmado', status: 'resolvido' }
            : { ...r, confirmation: 'contestado', status: 'atendimento', reopened: true, resolvedAt: undefined }
          : r
      )
    );
  }, [commit, userId]);

  const patchReport = useCallback((id: string, patch: Partial<UrbanReport>) => {
    if (!isAdmin) return;
    commit((prev) => parseReports(serializeReports(prev.map((r) => (r.id === id ? { ...r, ...patch, id: r.id, ownerId: r.ownerId } : r)))));
  }, [commit, isAdmin]);

  // Sensor simulation (kept from the original experience)
  useEffect(() => {
    const center: [number, number] = [latitude, longitude];
    const interval = setInterval(() => {
      const sensor = SENSOR_TYPES[Math.floor(Math.random() * SENSOR_TYPES.length)];
      const [lat, lng] = randomNear(center);
      const sensorReport: UrbanReport = {
        id: `sensor-${++idCounter.current}-${Date.now()}`,
        type: sensor.type,
        description: sensor.desc,
        severity: sensor.severity,
        priority: defaultPriorityFor(sensor.severity),
        lat,
        lng,
        timestamp: new Date(),
        isSensor: true,
        status: 'aberto',
        region: regionFor(lat, lng),
      };
      try {
        commit((prev) => retainReports([sensorReport, ...prev]));
      } catch { /* keep the persisted data and show storageError */ }
    }, 15000);

    return () => clearInterval(interval);
  }, [latitude, longitude, commit]);

  const stats = useMemo(() => ({
    total: reports.length,
    severe: reports.filter((r) => r.severity === 'severe').length,
    warning: reports.filter((r) => r.severity === 'warning').length,
    normal: reports.filter((r) => r.severity === 'normal').length,
    aberto: reports.filter((r) => r.status === 'aberto').length,
    analise: reports.filter((r) => r.status === 'analise').length,
    atendimento: reports.filter((r) => r.status === 'atendimento').length,
    resolvido: reports.filter((r) => r.status === 'resolvido').length,
    critica: reports.filter((r) => r.priority === 'critica').length,
    alta: reports.filter((r) => r.priority === 'alta').length,
    media: reports.filter((r) => r.priority === 'media').length,
    baixa: reports.filter((r) => r.priority === 'baixa').length,
    aguardandoConfirmacao: reports.filter((r) => r.confirmation === 'pendente').length,
    contestados: reports.filter((r) => r.confirmation === 'contestado').length,
  }), [reports]);

  return { reports, addReport, updateStatus, updatePriority, confirmResolution, patchReport, stats, storageError };
}
