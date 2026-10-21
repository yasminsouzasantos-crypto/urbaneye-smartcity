import { useEffect, useRef, useState } from 'react';
import {
  X,
  Send,
  Construction,
  Lightbulb,
  Car,
  TrafficCone,
  Camera,
  ImageIcon,
  MapPin,
  Clock,
  Loader2,
  Trash2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  AI_RISK_LABELS,
  AI_SEVERITY_LABELS,
  CitizenProblemType,
  PROBLEM_LABELS,
  ProblemType,
  UrbanImageAnalysis,
} from '@/types/urban';
import { compressImage, formatDateTime } from '@/lib/urban';
import {
  AI_SUGGESTION_MIN_CONFIDENCE,
  analyzeUrbanImage,
  canApplyAiSuggestion,
} from '@/lib/aiAnalysis';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  position: [number, number];
  address?: string;
  addressLoading?: boolean;
  onSubmit: (data: {
    type: ProblemType;
    description: string;
    photo?: string;
    aiAnalysis?: UrbanImageAnalysis;
  }) => void;
}

const TYPES: { value: CitizenProblemType; label: string; icon: React.ReactNode }[] = [
  { value: 'acidente', label: 'Acidente', icon: <Car className="w-5 h-5" /> },
  { value: 'obra', label: 'Obra', icon: <Construction className="w-5 h-5" /> },
  { value: 'iluminacao', label: 'Iluminação', icon: <Lightbulb className="w-5 h-5" /> },
  { value: 'transito', label: 'Trânsito', icon: <TrafficCone className="w-5 h-5" /> },
];

export default function ReportModal({
  open,
  onClose,
  position,
  address,
  addressLoading,
  onSubmit,
}: ReportModalProps) {
  const [type, setType] = useState<CitizenProblemType>('acidente');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [analysis, setAnalysis] = useState<UrbanImageAnalysis | undefined>();
  const [analysisError, setAnalysisError] = useState<string | undefined>();
  const [showAiDescriptionChoice, setShowAiDescriptionChoice] = useState(false);
  const [suggestionApplied, setSuggestionApplied] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const analysisRequestRef = useRef(0);
  const photoRequestRef = useRef(0);
  const analysisControllerRef = useRef<AbortController | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setLoadingPhoto(false);
      setAnalyzingPhoto(false);
      setShowAiDescriptionChoice(false);
      return;
    }
    submittingRef.current = false;
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearInterval(t);
      photoRequestRef.current += 1;
      analysisRequestRef.current += 1;
      analysisControllerRef.current?.abort();
      analysisControllerRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    const requestId = ++photoRequestRef.current;
    analysisRequestRef.current += 1;
    analysisControllerRef.current?.abort();
    analysisControllerRef.current = null;
    setSuggestionApplied(false);
    setAnalysis(undefined);
    setAnalysisError(undefined);
    setAnalyzingPhoto(false);
    setShowAiDescriptionChoice(false);
    setLoadingPhoto(true);
    try {
      const compressed = await compressImage(file);
      if (photoRequestRef.current === requestId) setPhoto(compressed);
    } catch (error) {
      if (photoRequestRef.current === requestId) toast.error(error instanceof Error ? error.message : 'Não foi possível carregar a foto');
    } finally {
      if (photoRequestRef.current === requestId) setLoadingPhoto(false);
    }
  };

  const removePhoto = () => {
    photoRequestRef.current += 1;
    analysisRequestRef.current += 1;
    analysisControllerRef.current?.abort();
    analysisControllerRef.current = null;
    setLoadingPhoto(false);
    setSuggestionApplied(false);
    setPhoto(undefined);
    setAnalysis(undefined);
    setAnalysisError(undefined);
    setAnalyzingPhoto(false);
    setShowAiDescriptionChoice(false);
    if (cameraRef.current) cameraRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const handleAnalyzePhoto = async () => {
    if (!photo || loadingPhoto || analysisControllerRef.current) return;
    const requestId = ++analysisRequestRef.current;
    const controller = new AbortController();
    analysisControllerRef.current = controller;
    setAnalyzingPhoto(true);
    setAnalysisError(undefined);
    setShowAiDescriptionChoice(false);

    try {
      const result = await analyzeUrbanImage(photo, controller.signal);
      if (analysisRequestRef.current !== requestId) return;
      setAnalysis(result);
      setSuggestionApplied(false);
    } catch (error) {
      if (analysisRequestRef.current !== requestId) return;
      setAnalysisError(error instanceof Error ? error.message : 'Não foi possível analisar a foto.');
    } finally {
      if (analysisRequestRef.current === requestId) {
        setAnalyzingPhoto(false);
        analysisControllerRef.current = null;
      }
    }
  };

  const applyAiSuggestionChoice = (choice: 'replace' | 'append' | 'keep') => {
    if (!analysis || !canApplyAiSuggestion(analysis) || analysis.suggestedType === 'indeterminado') return;

    const suggestion = analysis.descriptionSuggestion.trim();
    setSuggestionApplied(true);
    setType(analysis.suggestedType);

    if (choice === 'replace' && suggestion) {
      setDescription(suggestion);
    } else if (choice === 'append' && suggestion) {
      setDescription(`${description.trim()}\n\n${suggestion}`);
    }

    setShowAiDescriptionChoice(false);
    toast.success('Sugestão da IA aplicada. Revise antes de enviar.');
  };

  const applyAiSuggestion = () => {
    if (!analysis || !canApplyAiSuggestion(analysis) || analysis.suggestedType === 'indeterminado') return;

    if (description.trim() && analysis.descriptionSuggestion.trim()) {
      setShowAiDescriptionChoice(true);
      return;
    }

    applyAiSuggestionChoice('replace');
  };

  const handleSubmit = () => {
    if (loadingPhoto || analyzingPhoto || submittingRef.current) return;
    if (!description.trim()) {
      toast.error('Descreva o problema antes de enviar');
      return;
    }
    submittingRef.current = true;
    const aiAnalysis = analysis
      ? {
          ...analysis,
          userDecision:
            suggestionApplied
              ? type === analysis.suggestedType && description.trim() === analysis.descriptionSuggestion.trim()
                ? ('accepted' as const)
                : ('edited' as const)
              : ('not_applied' as const),
        }
      : undefined;
    try {
      onSubmit({ type, description: description.trim(), photo, aiAnalysis });
    } catch (error) {
      submittingRef.current = false;
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o chamado.');
      return;
    }
    analysisRequestRef.current += 1;
    photoRequestRef.current += 1;
    setSuggestionApplied(false);
    setDescription('');
    setPhoto(undefined);
    setAnalysis(undefined);
    setAnalysisError(undefined);
    setAnalyzingPhoto(false);
    setShowAiDescriptionChoice(false);
    setType('acidente');
    onClose();
    toast.success('Chamado aberto com sucesso');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[hsl(var(--urban-overlay))]/60" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Novo chamado" className="relative w-full max-w-md urban-glass rounded-t-2xl sm:rounded-2xl urban-shadow-lg p-5 animate-slide-up-fade z-10 sm:mx-4 max-h-[92dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Novo chamado</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary active:scale-95 transition-all"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Tipo do problema
        </label>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-[0.97] text-sm font-medium ${
                type === t.value
                  ? 'border-primary bg-[hsl(var(--urban-blue-light))] text-primary'
                  : 'border-border bg-background hover:border-primary/30'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <label htmlFor="report-description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Descrição
        </label>
        <textarea
          id="report-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o que está acontecendo..."
          rows={3}
          className="w-full rounded-xl border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all mb-5 placeholder:text-muted-foreground"
        />

        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Foto (opcional)
        </label>
        <input
          ref={cameraRef}
          aria-label="Foto da câmera"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={galleryRef}
          aria-label="Foto da galeria"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {photo ? (
          <div className="mb-5 animate-slide-up-fade space-y-3">
            <div className="relative">
              <img src={photo} alt="Foto do problema" className="w-full h-44 object-cover rounded-xl" />
              <button
                onClick={removePhoto}
                className="absolute top-2 right-2 w-9 h-9 rounded-full bg-background/90 flex items-center justify-center active:scale-95 urban-shadow"
                aria-label="Remover foto"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>

            <section className="rounded-2xl border border-primary/20 bg-[hsl(var(--urban-blue-light))] p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">Triagem inteligente da foto</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    A IA sugere o tipo e o risco. Você sempre revisa antes de enviar.
                  </p>
                </div>
              </div>

              {!analysis && (
                <button
                  type="button"
                  onClick={handleAnalyzePhoto}
                  disabled={analyzingPhoto}
                  className="mt-3 w-full rounded-xl bg-primary text-primary-foreground p-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {analyzingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {analyzingPhoto ? 'Analisando com IA...' : 'Analisar foto com IA'}
                </button>
              )}

              {analysisError && (
                <div role="alert" className="mt-3 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                  <p className="font-semibold">{analysisError}</p>
                  <button
                    type="button"
                    onClick={handleAnalyzePhoto}
                    className="mt-2 inline-flex items-center gap-1.5 font-semibold underline underline-offset-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
                  </button>
                </div>
              )}

              {analysis && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl bg-background/80 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold">{analysis.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {analysis.hasUrbanIssue && analysis.suggestedType !== 'indeterminado'
                            ? `${PROBLEM_LABELS[analysis.suggestedType]} · ${AI_SEVERITY_LABELS[analysis.suggestedSeverity]}`
                            : 'Problema não identificado com segurança'}
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold tabular-nums shrink-0">
                        {Math.round(analysis.confidence * 100)}% confiança
                      </span>
                    </div>

                    {!!analysis.visibleEvidence.length && (
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                        {analysis.visibleEvidence.map((evidence) => (
                          <li key={evidence}>{evidence}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {!!analysis.riskFlags.length && (
                    <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Possível risco imediato
                      </p>
                      <p className="mt-1">{analysis.riskFlags.map((flag) => AI_RISK_LABELS[flag]).join(' · ')}</p>
                      <p className="mt-1 font-medium">
                        Afaste-se do risco e acione o serviço de emergência adequado. Não espere pelo aplicativo.
                      </p>
                    </div>
                  )}

                  {canApplyAiSuggestion(analysis) ? (
                    <button
                      type="button"
                      onClick={applyAiSuggestion}
                      disabled={analyzingPhoto}
                      className="w-full rounded-xl border-2 border-primary text-primary p-3 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Usar sugestão e revisar
                    </button>
                  ) : (
                    <p className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground font-medium">
                      Confiança abaixo de {Math.round(AI_SUGGESTION_MIN_CONFIDENCE * 100)}% ou imagem inconclusiva. Selecione o tipo e descreva o problema manualmente.
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">{analysis.descriptionSuggestion}</p>

                  {analysis.needsHumanReview && (
                    <p className="text-[11px] text-muted-foreground">
                      Este caso foi marcado para revisão humana. A classificação da IA não substitui a avaliação da equipe.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleAnalyzePhoto}
                    disabled={analyzingPhoto}
                    className="text-xs font-semibold text-primary inline-flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {analyzingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Analisar novamente
                  </button>
                </div>
              )}

              <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
                Ao analisar, a foto é enviada ao Google Gemini para a triagem deste chamado. No nível gratuito, o conteúdo pode ser usado pelo Google para melhorar produtos. A IA pode errar; não inclua dados pessoais desnecessários.
              </p>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-border text-sm font-medium active:scale-[0.97] transition-all hover:border-primary/40"
            >
              {loadingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              Câmera
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-border text-sm font-medium active:scale-[0.97] transition-all hover:border-primary/40"
            >
              <ImageIcon className="w-5 h-5" />
              Galeria
            </button>
          </div>
        )}

        <div className="rounded-xl bg-secondary/70 p-3 mb-5 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Registrado automaticamente
          </p>
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
            <span>
              {addressLoading ? 'Buscando endereço...' : address ?? 'Endereço aproximado indisponível'}
              <span className="block text-muted-foreground tabular-nums">
                {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="tabular-nums">{formatDateTime(now)}</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loadingPhoto || analyzingPhoto}
          className="w-full bg-primary text-primary-foreground rounded-xl p-4 font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:opacity-90 text-base disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          {loadingPhoto ? 'Carregando foto...' : analyzingPhoto ? 'Aguardando análise...' : 'Enviar chamado'}
        </button>
      </div>

      <AlertDialog open={showAiDescriptionChoice} onOpenChange={setShowAiDescriptionChoice}>
        <AlertDialogContent overlayClassName="z-[1090]" className="z-[1100] max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Como deseja usar a descrição da IA?</AlertDialogTitle>
            <AlertDialogDescription>
              Você já escreveu uma descrição. Escolha como combinar seu texto com a sugestão; a categoria
              indicada pela IA também será aplicada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <AlertDialogAction onClick={() => applyAiSuggestionChoice('replace')} className="w-full">
              Substituir pela descrição da IA
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => applyAiSuggestionChoice('append')}
              className="w-full border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Adicionar ao meu texto
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => applyAiSuggestionChoice('keep')}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Manter meu texto
            </AlertDialogAction>
            <AlertDialogCancel className="w-full mt-0">Cancelar</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
