import {
  AiProblemType,
  AiRiskFlag,
  AiSuggestedSeverity,
  UrbanImageAnalysis,
} from '@/types/urban';

export const AI_SUGGESTION_MIN_CONFIDENCE = 0.72;

const PROBLEM_TYPES: AiProblemType[] = [
  'acidente',
  'obra',
  'iluminacao',
  'transito',
  'indeterminado',
];
const SEVERITIES: AiSuggestedSeverity[] = ['severe', 'warning', 'normal', 'indeterminada'];
const RISK_FLAGS: AiRiskFlag[] = [
  'via_bloqueada',
  'fogo_ou_fumaca',
  'pessoa_em_risco',
  'fiacao_exposta',
  'alagamento',
  'dano_estrutural',
];

function isStringArray(value: unknown, max: number): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= max &&
    value.every((item) => typeof item === 'string' && item.trim().length > 0 && item.length <= 160)
  );
}

export function isUrbanImageAnalysis(value: unknown): value is UrbanImageAnalysis {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<UrbanImageAnalysis>;

  return (
    item.promptVersion === 'urbaneye-image-triage-v1' &&
    typeof item.model === 'string' &&
    item.model.length > 0 && item.model.length <= 200 &&
    typeof item.analyzedAt === 'string' &&
    Number.isFinite(Date.parse(item.analyzedAt)) &&
    typeof item.hasUrbanIssue === 'boolean' &&
    PROBLEM_TYPES.includes(item.suggestedType as AiProblemType) &&
    SEVERITIES.includes(item.suggestedSeverity as AiSuggestedSeverity) &&
    typeof item.confidence === 'number' &&
    item.confidence >= 0 &&
    item.confidence <= 1 &&
    typeof item.title === 'string' &&
    item.title.trim().length > 0 && item.title.length <= 80 &&
    typeof item.descriptionSuggestion === 'string' &&
    item.descriptionSuggestion.length <= 400 &&
    isStringArray(item.visibleEvidence, 4) &&
    Array.isArray(item.riskFlags) &&
    item.riskFlags.length <= 6 &&
    item.riskFlags.every((flag) => RISK_FLAGS.includes(flag)) &&
    typeof item.needsHumanReview === 'boolean' &&
    (item.userDecision === undefined || ['accepted', 'edited', 'not_applied'].includes(item.userDecision))
  );
}

export function canApplyAiSuggestion(analysis: UrbanImageAnalysis): boolean {
  return (
    analysis.hasUrbanIssue &&
    analysis.suggestedType !== 'indeterminado' &&
    analysis.confidence >= AI_SUGGESTION_MIN_CONFIDENCE
  );
}

export function friendlyFunctionError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Não foi possível analisar a foto.';

  const candidate = error as { message?: string; context?: Response };
  if (candidate.context?.status === 404) {
    return 'O serviço de análise ainda não foi publicado neste projeto Supabase.';
  }
  if (candidate.context?.status === 401) {
    return 'A chave pública do projeto Supabase é inválida ou está desatualizada.';
  }
  if (candidate.context?.status === 403) {
    return 'Este endereço não está autorizado a usar o serviço de análise.';
  }
  if (candidate.context?.status === 429) {
    return 'Limite de análises atingido. Aguarde um minuto e tente novamente.';
  }
  if (candidate.context?.status === 413) return 'A foto é grande demais para análise.';
  if (candidate.context?.status === 503) {
    return 'A análise por IA não foi configurada ou o modelo selecionado está indisponível.';
  }
  if (candidate.message?.toLowerCase().includes('fetch')) {
    return 'Sem conexão com o serviço de análise. Tente novamente.';
  }
  return 'Não foi possível analisar a foto. Tente novamente.';
}

export async function analyzeUrbanImage(photo: string, signal?: AbortSignal): Promise<UrbanImageAnalysis> {
  if (!/^data:image\/(jpeg|png|webp);base64,/i.test(photo)) {
    throw new Error('Formato de imagem não suportado.');
  }

  // Mantém o SDK do Supabase fora do bundle inicial; ele só é carregado quando
  // o cidadão consente e solicita a análise da foto.
  const { supabase } = await import('@/integrations/supabase/client');
  if (signal?.aborted) throw new DOMException('Análise cancelada.', 'AbortError');
  const { data, error } = await supabase.functions.invoke('analyze-urban-image', {
    body: { image: photo },
    signal,
    timeout: 35_000,
  });

  if (error) throw new Error(friendlyFunctionError(error));
  if (!isUrbanImageAnalysis(data)) throw new Error('A IA retornou uma análise inválida.');
  return data;
}
