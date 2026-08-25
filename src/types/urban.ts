export type Severity = 'severe' | 'warning' | 'normal';

export type ProblemType = 'acidente' | 'obra' | 'iluminacao' | 'transito' | 'sensor';

export type ReportStatus = 'aberto' | 'analise' | 'atendimento' | 'resolvido';

export type Priority = 'baixa' | 'media' | 'alta' | 'critica';

/** confirmação do cidadão após o administrador marcar como resolvido */
export type Confirmation = 'pendente' | 'confirmado' | 'contestado';

export interface UrbanReport {
  id: string;
  type: ProblemType;
  description: string;
  severity: Severity;
  /** avaliação técnica da equipe (definida pelo administrador) */
  priority: Priority;
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
  /** confirmação do cidadão sobre a resolução */
  confirmation?: Confirmation;
  /** tempo total registrado na primeira resolução (ms) */
  resolutionMsRecorded?: number;
  /** chamado reaberto após contestação do cidadão */
  reopened?: boolean;
  /** created by the citizen using this device */
  mine?: boolean;
}

export const PROBLEM_LABELS: Record<ProblemType, string> = {
  acidente: 'Acidente',
  obra: 'Obra',
  iluminacao: 'Iluminação',
  transito: 'Trânsito',
  sensor: 'Sensor',
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
  severe: '#dc2626',
  warning: '#d97706',
  normal: '#16a34a',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  baixa: '#64748b',
  media: '#d97706',
  alta: '#ea580c',
  critica: '#dc2626',
};

export const PRIORITY_ORDER: Priority[] = ['baixa', 'media', 'alta', 'critica'];

export const CONFIRMATION_LABELS: Record<Confirmation, string> = {
  pendente: 'Aguardando confirmação do cidadão',
  confirmado: 'Resolução confirmada pelo cidadão',
  contestado: 'Cidadão informou que não foi resolvido',
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  aberto: 'Aberto',
  analise: 'Em análise',
  atendimento: 'Em atendimento',
  resolvido: 'Resolvido',
};

export const STATUS_COLORS: Record<ReportStatus, string> = {
  aberto: '#dc2626',
  analise: '#d97706',
  atendimento: '#0b6bcb',
  resolvido: '#16a34a',
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
