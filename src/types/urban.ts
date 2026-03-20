export type Severity = 'severe' | 'warning' | 'normal';

export type ProblemType = 'acidente' | 'obra' | 'iluminacao' | 'transito' | 'sensor';

export interface UrbanReport {
  id: string;
  type: ProblemType;
  description: string;
  severity: Severity;
  lat: number;
  lng: number;
  timestamp: Date;
  isSensor?: boolean;
}

export const PROBLEM_LABELS: Record<ProblemType, string> = {
  acidente: '🚗 Acidente',
  obra: '🚧 Obra',
  iluminacao: '💡 Iluminação',
  transito: '🚦 Trânsito',
  sensor: '📡 Sensor',
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

// Default location: Sorocaba, SP
export const DEFAULT_LOCATION: [number, number] = [-23.5015, -47.4526];
