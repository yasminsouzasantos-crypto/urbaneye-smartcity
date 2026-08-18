import { X, MapPin, CalendarClock, CheckCircle2, Timer, Radio } from 'lucide-react';
import {
  PROBLEM_LABELS,
  ReportStatus,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  UrbanReport,
} from '@/types/urban';
import { formatDateTime, formatDuration, timeInfo } from '@/lib/urban';
import StatusBadge from './StatusBadge';

interface Props {
  report: UrbanReport | null;
  onClose: () => void;
  canManage?: boolean;
  onStatusChange?: (id: string, status: ReportStatus) => void;
}

export default function ReportDetail({ report, onClose, canManage, onStatusChange }: Props) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[hsl(var(--urban-overlay))]/60" onClick={onClose} />
      <div className="relative w-full max-w-md urban-glass rounded-t-2xl sm:rounded-2xl urban-shadow-lg animate-slide-up-fade z-10 max-h-[92dvh] overflow-y-auto">
        {report.photo && (
          <img src={report.photo} alt="Foto do chamado" className="w-full h-48 object-cover sm:rounded-t-2xl rounded-t-2xl" />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-bold leading-tight">{PROBLEM_LABELS[report.type]}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{report.description}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center hover:bg-secondary active:scale-95 transition-all"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <StatusBadge status={report.status} size="md" />
            <span
              className="inline-flex items-center gap-1.5 rounded-full text-[11px] px-2.5 py-1 font-semibold"
              style={{
                backgroundColor: `${SEVERITY_COLORS[report.severity]}1f`,
                color: SEVERITY_COLORS[report.severity],
              }}
            >
              {SEVERITY_LABELS[report.severity]}
            </span>
            {report.isSensor && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-semibold">
                <Radio className="w-3 h-3" /> Sensor
              </span>
            )}
          </div>

          <div className="rounded-xl bg-secondary/70 p-3.5 space-y-2.5 mb-4">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>
                {report.address ?? report.region ?? 'Endereço aproximado indisponível'}
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
                </span>
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CalendarClock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>
                Aberto: <span className="tabular-nums">{formatDateTime(report.timestamp)}</span>
              </span>
            </div>
            {report.resolvedAt && (
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-[hsl(var(--urban-ok))] shrink-0" />
                <span>
                  Resolvido: <span className="tabular-nums">{formatDateTime(report.resolvedAt)}</span>
                  <span className="block text-xs text-muted-foreground">
                    Tempo de resolução:{' '}
                    {formatDuration(report.resolvedAt.getTime() - report.timestamp.getTime())}
                  </span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Timer className="w-4 h-4 text-primary shrink-0" />
              <span>{timeInfo(report)}</span>
            </div>
          </div>

          {canManage && onStatusChange && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Atualizar status
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(report.id, s)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all active:scale-[0.97] ${
                      report.status === s
                        ? 'border-primary bg-[hsl(var(--urban-blue-light))] text-primary'
                        : 'border-border bg-background hover:border-primary/30'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
