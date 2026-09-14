import { useState } from 'react';
import {
  X,
  MapPin,
  CalendarClock,
  CheckCircle2,
  Timer,
  Radio,
  Maximize2,
  ImageOff,
  AlertTriangle,
  FileText,
  Tag,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  AI_RISK_LABELS,
  AI_SEVERITY_LABELS,
  PROBLEM_LABELS,
  Priority,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  ReportStatus,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  UrbanReport,
} from '@/types/urban';
import { formatDateTime, formatDuration, timeInfo } from '@/lib/urban';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface Props {
  report: UrbanReport | null;
  onClose: () => void;
  canManage?: boolean;
  /** citizens only see photos of their own reports */
  canViewPhoto?: boolean;
  onStatusChange?: (id: string, status: ReportStatus) => void;
  onPriorityChange?: (id: string, priority: Priority) => void;
  onConfirmResolution?: (id: string, solved: boolean) => void;
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
      <div className="min-w-0">
        <span className="block text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </span>
        <span className="block">{children}</span>
      </div>
    </div>
  );
}

export default function ReportDetail({
  report,
  onClose,
  canManage,
  canViewPhoto = true,
  onStatusChange,
  onPriorityChange,
  onConfirmResolution,
}: Props) {
  const [zoom, setZoom] = useState(false);
  if (!report) return null;

  const photo = canViewPhoto ? report.photo : undefined;
  const isOwner = !!report.mine;
  const awaitingCitizen = report.status === 'resolvido' && report.confirmation === 'pendente';
  const totalMs =
    report.resolvedAt ? report.resolvedAt.getTime() - report.timestamp.getTime() : report.resolutionMsRecorded ?? null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[hsl(var(--urban-overlay))]/60" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Detalhes do chamado" className="relative w-full max-w-md urban-glass rounded-t-2xl sm:rounded-2xl urban-shadow-lg animate-slide-up-fade z-10 max-h-[92dvh] overflow-y-auto">
        {photo ? (
          <button
            type="button"
            onClick={() => setZoom(true)}
            className="relative block w-full rounded-t-2xl overflow-hidden bg-secondary"
            aria-label="Ampliar foto do chamado"
          >
            <img
              src={photo}
              alt={`Foto do chamado: ${PROBLEM_LABELS[report.type]}`}
              className="w-full h-56 object-contain bg-secondary"
            />
            <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-background/85 flex items-center justify-center urban-shadow">
              <Maximize2 className="w-4 h-4 text-foreground" />
            </span>
          </button>
        ) : (
          <div className="rounded-t-2xl bg-secondary/70 py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
            <ImageOff className="w-4 h-4" />
            Nenhuma foto foi adicionada
          </div>
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
            <PriorityBadge priority={report.priority} size="md" />
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

          {report.confirmation === 'contestado' && (
            <div className="rounded-xl bg-destructive/10 text-destructive p-3 mb-4 flex items-start gap-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              Cidadão informou que o problema ainda não foi resolvido. Chamado retornou para atendimento.
            </div>
          )}
          {report.confirmation === 'confirmado' && (
            <div className="rounded-xl bg-[hsl(var(--urban-ok))]/12 text-[hsl(var(--urban-ok))] p-3 mb-4 flex items-start gap-2 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              Resolução confirmada pelo cidadão.
            </div>
          )}
          {awaitingCitizen && (
            <div className="rounded-xl bg-secondary p-3 mb-4 flex items-start gap-2 text-sm font-medium text-muted-foreground">
              <Timer className="w-4 h-4 mt-0.5 shrink-0" />
              Aguardando confirmação do cidadão.
            </div>
          )}

          {report.aiAnalysis && (canManage || isOwner) && (
            <section className="rounded-xl border border-primary/20 bg-[hsl(var(--urban-blue-light))] p-3.5 mb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Triagem por IA</p>
                    <p className="text-sm font-semibold mt-0.5">{report.aiAnalysis.title}</p>
                  </div>
                </div>
                <span className="rounded-full bg-background/80 px-2 py-1 text-[10px] font-bold tabular-nums shrink-0">
                  {Math.round(report.aiAnalysis.confidence * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sugestão:{' '}
                <span className="font-semibold text-foreground">
                  {report.aiAnalysis.suggestedType === 'indeterminado'
                    ? 'Indeterminada'
                    : PROBLEM_LABELS[report.aiAnalysis.suggestedType]}
                  {' · '}
                  {AI_SEVERITY_LABELS[report.aiAnalysis.suggestedSeverity]}
                </span>
              </p>
              {!!report.aiAnalysis.visibleEvidence.length && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                  {report.aiAnalysis.visibleEvidence.map((evidence) => (
                    <li key={evidence}>{evidence}</li>
                  ))}
                </ul>
              )}
              {!!report.aiAnalysis.riskFlags.length && (
                <p className="mt-2 rounded-lg bg-destructive/10 p-2 text-xs font-semibold text-destructive">
                  Riscos sinalizados: {report.aiAnalysis.riskFlags.map((flag) => AI_RISK_LABELS[flag]).join(' · ')}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">
                {report.aiAnalysis.userDecision === 'accepted'
                  ? 'Sugestão aceita pelo cidadão.'
                  : report.aiAnalysis.userDecision === 'edited'
                    ? 'Sugestão revisada pelo cidadão.'
                    : 'Sugestão não aplicada pelo cidadão.'}
                {report.aiAnalysis.needsHumanReview ? ' Revisão da equipe recomendada.' : ''}
              </p>
              {canManage && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Modelo: {report.aiAnalysis.model} · Prompt: {report.aiAnalysis.promptVersion}
                </p>
              )}
            </section>
          )}

          <div className="rounded-xl bg-secondary/70 p-3.5 space-y-3 mb-4">
            <InfoRow icon={Tag} label="Tipo">
              {PROBLEM_LABELS[report.type]}
            </InfoRow>
            <InfoRow icon={MapPin} label="Local">
              {report.address ?? report.region ?? 'Endereço aproximado indisponível'}
              <span className="block text-xs text-muted-foreground tabular-nums">
                {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
              </span>
            </InfoRow>
            <InfoRow icon={CalendarClock} label="Data e horário de abertura">
              <span className="tabular-nums">{formatDateTime(report.timestamp)}</span>
            </InfoRow>
            <InfoRow icon={FileText} label="Descrição">
              {report.description}
            </InfoRow>
            {report.resolvedAt && (
              <InfoRow icon={CheckCircle2} label="Resolução registrada">
                <span className="tabular-nums">{formatDateTime(report.resolvedAt)}</span>
                {totalMs !== null && (
                  <span className="block text-xs text-muted-foreground">
                    Tempo total: {formatDuration(totalMs)}
                  </span>
                )}
              </InfoRow>
            )}
            {report.reopened && (
              <InfoRow icon={RotateCcw} label="Reabertura">
                Chamado retornou para atendimento após contestação do cidadão.
              </InfoRow>
            )}
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <Timer className="w-4 h-4 text-primary shrink-0" />
              <span>{timeInfo(report)}</span>
            </div>
          </div>

          {/* Confirmação do cidadão */}
          {!canManage && isOwner && awaitingCitizen && onConfirmResolution && (
            <div className="rounded-xl border border-border p-3.5 mb-4">
              <p className="text-sm font-semibold mb-3">O problema foi resolvido?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onConfirmResolution(report.id, true)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.97] transition-all"
                >
                  <ThumbsUp className="w-4 h-4" /> Sim, foi resolvido
                </button>
                <button
                  onClick={() => onConfirmResolution(report.id, false)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-border text-sm font-semibold active:scale-[0.97] transition-all"
                >
                  <ThumbsDown className="w-4 h-4" /> Não, ainda não
                </button>
              </div>
            </div>
          )}

          {canManage && onPriorityChange && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Prioridade (avaliação técnica)
              </p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {PRIORITY_ORDER.map((p) => {
                  const activeP = report.priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => onPriorityChange(report.id, p)}
                      className="p-2.5 rounded-xl border-2 text-xs font-semibold transition-all active:scale-[0.97]"
                      style={
                        activeP
                          ? {
                              borderColor: PRIORITY_COLORS[p],
                              color: PRIORITY_COLORS[p],
                              backgroundColor: `${PRIORITY_COLORS[p]}14`,
                            }
                          : undefined
                      }
                    >
                      {PRIORITY_LABELS[p]}
                    </button>
                  );
                })}
              </div>
            </>
          )}

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
              {report.status !== 'resolvido' && (
                <button
                  onClick={() => onStatusChange(report.id, 'resolvido')}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl p-4 font-semibold text-primary-foreground bg-[hsl(var(--urban-ok))] active:scale-[0.97] transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Marcar como resolvido
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {zoom && photo && (
        <div
          className="fixed inset-0 z-[1200] bg-[hsl(var(--urban-overlay))]/95 flex items-center justify-center p-4"
          onClick={() => setZoom(false)}
        >
          <img
            src={photo}
            alt={`Foto ampliada do chamado: ${PROBLEM_LABELS[report.type]}`}
            className="max-w-full max-h-[90dvh] object-contain rounded-xl"
          />
          <button
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 flex items-center justify-center"
            aria-label="Fechar foto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
