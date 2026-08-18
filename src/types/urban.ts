export type Severity = 'severe' | 'warning' | 'normal';

export type ProblemType = 'acidente' | 'obra' | 'iluminacao' | 'transito' | 'sensor';

export type ReportStatus = 'aberto' | 'analise' | 'atendimento' | 'resolvido';

export interface UrbanReport {
  id: string;
  type: ProblemType;
  description: string;
  severity: Severity;
  lat: number;
  lng: number;
  timestamp: Date;
  isSensor?: boolean;
  /** base64 data url (compressed) */
  photo?: string;
  address?: string;
  region?: string;
  status: ReportStatus;
  resolvedAt?: Date;
  /** created by the citizen using this device */
  mine?: boolean;
}

export const PROBLEM_LABELS: Record<ProblemType, string> = {
  acidente: '🚗 Acidente',
  obra: '🚧 Obra',
  iluminacao: '💡 Iluminação',
  transito: '🚦 Trânsito',
  sensor: '📡 Sensor',
};

export const PROBLEM_SHORT: Record<ProblemType, string> = {
  acidente: 'Acidente',
  obra: 'Obra',
  iluminacao: 'Iluminação',
  transito: 'Trânsito',
  sensor: 'Sensor',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  severe: 'Grave',
  warning: 'Médio',
  normal: 'Normal',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  severe: '#ef4444',
  warning: '#f59e0b',
  normal: '#22c55e',
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  aberto: 'Aberto',
  analise: 'Em análise',
  atendimento: 'Em atendimento',
  resolvido: 'Resolvido',
};

export const STATUS_DOTS: Record<ReportStatus, string> = {
  aberto: '🔴',
  analise: '🟡',
  atendimento: '🔵',
  resolvido: '🟢',
};

export const STATUS_COLORS: Record<ReportStatus, string> = {
  aberto: '#ef4444',
  analise: '#f59e0b',
  atendimento: '#3b82f6',
  resolvido: '#22c55e',
};

export const STATUS_ORDER: ReportStatus[] = ['aberto', 'analise', 'atendimento', 'resolvido'];

// Default location: Sorocaba, SP
export const DEFAULT_LOCATION: [number, number] = [-23.5015, -47.4526];

export interface RegionDef {
  name: string;
  center: [number, number];
}

export const REGIONS: RegionDef[] = [
  { name: 'Centro', center: [-23.5015, -47.4526] },
  { name: 'Zona Norte', center: [-23.478, -47.452] },
  { name: 'Zona Sul', center: [-23.529, -47.461] },
  { name: 'Zona Leste', center: [-23.503, -47.413] },
  { name: 'Zona Oeste', center: [-23.502, -47.498] },
];
