import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  UrbanReport,
  ProblemType,
  Severity,
  Priority,
  ReportStatus,
  UrbanImageAnalysis,
  DataMode,
} from '@/types/urban';
import { regionFor } from '@/lib/urban';
import { parseReports, REPORTS_STORAGE_KEY, serializeReports, storageErrorMessage } from '@/lib/reportStorage';
import { applyFixedReports, belongsToMode, DATA_MODE_STORAGE_KEY, FIXTURE_VERSION } from '@/lib/reportData';

const STORAGE_KEY = REPORTS_STORAGE_KEY;
export function severityFor(type: ProblemType): Severity {
  return type === 'acidente' ? 'severe' : type === 'obra' || type === 'transito' ? 'warning' : 'normal';
}

/** prioridade inicial sugerida — o administrador pode alterar depois */
export function defaultPriorityFor(severity: Severity): Priority {
  return severity === 'severe' ? 'alta' : severity === 'warning' ? 'media' : 'baixa';
}

function load(): { reports: UrbanReport[]; raw?: string | null; error?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { reports: raw === null ? [] : parseReports(raw), raw };
  } catch (error) {
    return { reports: [], error: storageErrorMessage(error) };
  }
}

interface NewReportInput {
  type: ProblemType;
  description: string;
  position: [number, number];
  photo?: string;
  address?: string;
  aiAnalysis?: UrbanImageAnalysis;
}

function readMode(): DataMode {
  try { return localStorage.getItem(DATA_MODE_STORAGE_KEY) === 'demonstracao' ? 'demonstracao' : 'avaliacao'; }
  catch { return 'avaliacao'; }
}

export function useUrbanReports(_userPosition: [number, number], account: { userId: string; isAdmin: boolean }) {
  const [initial] = useState(load);
  const [storedReports, setReports] = useState(initial.reports);
  const [storageError, setStorageError] = useState(initial.error);
  const [mode, setMode] = useState<DataMode>(readMode);
  const [fixedOnly, setFixedOnly] = useState(false);
  const reportsRef = useRef(storedReports);
  const lastRawRef = useRef(initial.raw);
  const { userId, isAdmin } = account;

  const reports = useMemo(() => storedReports.filter(report => belongsToMode(report, mode) &&
    (mode !== 'demonstracao' || !fixedOnly || (report.source === 'fixture' && report.datasetVersion === FIXTURE_VERSION))).map((report) => {
    const mine = report.ownerId ? report.ownerId === userId : !!report.mine;
    return !!report.mine === mine ? report : { ...report, mine };
  }), [storedReports, userId, mode, fixedOnly]);
  const hiddenCount = storedReports.length - reports.length;

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
    const sync = (event: StorageEvent) => {
      if (event.key === DATA_MODE_STORAGE_KEY || event.key === null) setMode(readMode());
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
  }, []);

  const changeMode = useCallback((next: DataMode) => {
    if (next !== 'avaliacao' && next !== 'demonstracao') throw new Error('Modo inválido.');
    try {
      localStorage.setItem(DATA_MODE_STORAGE_KEY, next);
      setMode(next);
    } catch (error) {
      const message = storageErrorMessage(error);
      setStorageError(message);
      throw new Error(message);
    }
  }, []);

  // Called only by the explicit, confirmed actions in LocalDataControls.
  const loadFixedReports = useCallback((reset = false) => {
    if (mode !== 'demonstracao') throw new Error('Ative a demonstração simulada para carregar o conjunto fixo.');
    commit(current => applyFixedReports(current, reset));
  }, [commit, mode]);

  const addReport = useCallback((input: NewReportInput) => {
    if (mode === 'demonstracao' && fixedOnly) throw new Error('Selecione Todos os simulados no Perfil para cadastrar um chamado de demonstração.');
    const { type, description, position, photo, address, aiAnalysis } = input;
    const severity = severityFor(type);
    const newReport: UrbanReport = {
      id: `r-${crypto.randomUUID()}`,
      source: mode === 'demonstracao' ? 'demo_manual' : 'manual_local',
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
  }, [commit, userId, mode, fixedOnly]);

  const updateStatus = useCallback((id: string, status: ReportStatus) => {
    if (!isAdmin) return;
    commit((prev) =>
      prev.map((r) => {
        if (r.id !== id || !belongsToMode(r, mode) || r.status === status) return r;
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
  }, [commit, isAdmin, mode]);

  /** administrador define a prioridade técnica */
  const updatePriority = useCallback((id: string, priority: Priority) => {
    if (!isAdmin) return;
    commit((prev) => prev.map((r) => (r.id === id && belongsToMode(r, mode) ? { ...r, priority } : r)));
  }, [commit, isAdmin, mode]);

  /** cidadão confirma (ou contesta) a resolução — histórico é preservado */
  const confirmResolution = useCallback((id: string, solved: boolean) => {
    commit((prev) =>
      prev.map((r) =>
        r.id === id && belongsToMode(r, mode) && (r.ownerId ? r.ownerId === userId : r.mine) && r.status === 'resolvido' && r.confirmation === 'pendente'
          ? solved
            ? { ...r, confirmation: 'confirmado', status: 'resolvido' }
            : { ...r, confirmation: 'contestado', status: 'atendimento', reopened: true, resolvedAt: undefined }
          : r
      )
    );
  }, [commit, userId, mode]);

  const patchReport = useCallback((id: string, patch: Partial<UrbanReport>) => {
    if (!isAdmin) return;
    commit((prev) => parseReports(serializeReports(prev.map((r) => (r.id === id && belongsToMode(r, mode) ? {
      ...r, ...patch, id: r.id, ownerId: r.ownerId, source: r.source, datasetVersion: r.datasetVersion,
    } : r)))));
  }, [commit, isAdmin, mode]);

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

  return { reports, addReport, updateStatus, updatePriority, confirmResolution, patchReport, stats, storageError,
    mode, changeMode, loadFixedReports, hiddenCount, fixedOnly, setFixedOnly };
}
