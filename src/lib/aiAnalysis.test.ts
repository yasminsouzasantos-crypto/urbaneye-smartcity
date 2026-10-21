import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

import { canApplyAiSuggestion, friendlyFunctionError, isUrbanImageAnalysis } from './aiAnalysis';
import { UrbanImageAnalysis } from '@/types/urban';

const validAnalysis: UrbanImageAnalysis = {
  promptVersion: 'urbaneye-image-triage-v1',
  model: 'test-model',
  analyzedAt: '2026-09-11T12:00:00.000Z',
  hasUrbanIssue: true,
  suggestedType: 'obra',
  suggestedSeverity: 'warning',
  confidence: 0.88,
  title: 'Buraco no asfalto',
  descriptionSuggestion: 'Há um buraco visível no pavimento da via.',
  visibleEvidence: ['Abertura irregular no asfalto', 'Pavimento danificado ao redor'],
  riskFlags: [],
  needsHumanReview: false,
};

describe('triagem visual por IA', () => {
  it('aceita um resultado completo e bem formado', () => {
    expect(isUrbanImageAnalysis(validAnalysis)).toBe(true);
  });

  it('rejeita confiança fora do intervalo', () => {
    expect(isUrbanImageAnalysis({ ...validAnalysis, confidence: 1.2 })).toBe(false);
  });

  it('só permite aplicar sugestões confiáveis e determinadas', () => {
    expect(canApplyAiSuggestion(validAnalysis)).toBe(true);
    expect(canApplyAiSuggestion({ ...validAnalysis, confidence: 0.6 })).toBe(false);
    expect(canApplyAiSuggestion({ ...validAnalysis, suggestedType: 'indeterminado' })).toBe(false);
  });

  it('explica quando a função ainda não foi publicada', () => {
    const error = { context: new Response(null, { status: 404 }) };
    expect(friendlyFunctionError(error)).toContain('ainda não foi publicado');
  });
});
