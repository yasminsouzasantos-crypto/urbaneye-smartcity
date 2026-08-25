import { useState, useCallback, useEffect, useRef } from 'react';
import {
  UrbanReport,
  ProblemType,
  Severity,
  Priority,
  ReportStatus,
  DEFAULT_LOCATION,
  REGIONS,
} from '@/types/urban';
import { regionFor } from '@/lib/urban';

const STORAGE_KEY = 'urbaneye.reports.v2';
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
      status === 'resolvido' ? new Date(openedAt + (2 + Math.random() * 60) * HOUR) : undefined;
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

function serialize(reports: UrbanReport[]) {
  return JSON.stringify(
    reports.map((r) => ({
      ...r,
      timestamp: r.timestamp.toISOString(),
      resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : undefined,
    }))
  );
}

function load(): UrbanReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeed();
    const parsed = JSON.parse(raw) as (Omit<UrbanReport, 'timestamp' | 'resolvedAt'> & {
      timestamp: string;
      resolvedAt?: string;
    })[];
    if (!Array.isArray(parsed) || !parsed.length) return buildSeed();
    return parsed.map((r) => ({
      ...r,
      priority: r.priority ?? defaultPriorityFor(r.severity),
      timestamp: new Date(r.timestamp),
      resolvedAt: r.resolvedAt ? new Date(r.resolvedAt) : undefined,
    }));
  } catch {
    return buildSeed();
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
}

export function useUrbanReports(userPosition: [number, number]) {
  const [reports, setReports] = useState<UrbanReport[]>(() => load());
  const idCounter = useRef(1000);

  useEffect(() => {
    try {
      // photos are kept, but drop them if we blow the quota
      localStorage.setItem(STORAGE_KEY, serialize(reports));
    } catch {
      try {
        localStorage.setItem(STORAGE_KEY, serialize(reports.map((r) => ({ ...r, photo: undefined }))));
      } catch {
        /* ignore */
      }
    }
  }, [reports]);

  const addReport = useCallback((input: NewReportInput) => {
    const { type, description, position, photo, address } = input;
    const severity = severityFor(type);
    const newReport: UrbanReport = {
      id: `r-${Date.now()}`,
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
      region: regionFor(position[0], position[1]),
      mine: true,
    };
    setReports((prev) => [newReport, ...prev]);
    return newReport;
  }, []);

  const updateStatus = useCallback((id: string, status: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (status === 'resolvido') {
          const resolvedAt = r.resolvedAt ?? new Date();
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
  }, []);

  /** administrador define a prioridade técnica */
  const updatePriority = useCallback((id: string, priority: Priority) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, priority } : r)));
  }, []);

  /** cidadão confirma (ou contesta) a resolução — histórico é preservado */
  const confirmResolution = useCallback((id: string, solved: boolean) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? solved
            ? { ...r, confirmation: 'confirmado', status: 'resolvido' }
            : { ...r, confirmation: 'contestado', status: 'atendimento', reopened: true }
          : r
      )
    );
  }, []);

  const patchReport = useCallback((id: string, patch: Partial<UrbanReport>) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  // Sensor simulation (kept from the original experience)
  useEffect(() => {
    const center = userPosition[0] !== DEFAULT_LOCATION[0] ? userPosition : DEFAULT_LOCATION;
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
      setReports((prev) => [sensorReport, ...prev].slice(0, 200));
    }, 15000);

    return () => clearInterval(interval);
  }, [userPosition]);

  const stats = {
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
  };

  return { reports, addReport, updateStatus, updatePriority, confirmResolution, patchReport, stats };
}
