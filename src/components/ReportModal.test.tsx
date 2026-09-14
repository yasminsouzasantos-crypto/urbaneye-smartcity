import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ReportModal from './ReportModal';
import { compressImage } from '@/lib/urban';
import { analyzeUrbanImage } from '@/lib/aiAnalysis';
import type { UrbanImageAnalysis } from '@/types/urban';

vi.mock('@/lib/urban', async (importOriginal) => ({ ...await importOriginal<typeof import('@/lib/urban')>(), compressImage: vi.fn() }));
vi.mock('@/lib/aiAnalysis', async (importOriginal) => ({ ...await importOriginal<typeof import('@/lib/aiAnalysis')>(), analyzeUrbanImage: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const analysis: UrbanImageAnalysis = {
  promptVersion: 'urbaneye-image-triage-v1', model: 'test', analyzedAt: '2026-09-14T12:00:00Z',
  hasUrbanIssue: true, suggestedType: 'acidente', suggestedSeverity: 'warning', confidence: 0.9,
  title: 'Problema visível', descriptionSuggestion: 'Descrição sugerida pela IA.', visibleEvidence: [], riskFlags: [], needsHumanReview: false,
};
const photo = 'data:image/jpeg;base64,YWJj';
const file = new File(['image'], 'photo.webp', { type: 'image/webp' });
const props = () => ({ open: true, onClose: vi.fn(), onSubmit: vi.fn(), position: [-23.5, -47.4] as [number, number] });

async function upload() {
  await act(async () => { fireEvent.change(screen.getByLabelText('Foto da galeria'), { target: { files: [file] } }); });
}
async function analyze() {
  await upload();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Analisar foto com IA' })); });
}

beforeEach(() => { vi.clearAllMocks(); vi.mocked(compressImage).mockResolvedValue(photo); vi.mocked(analyzeUrbanImage).mockResolvedValue(analysis); });
afterEach(cleanup);

describe('formulário e concorrência da IA', () => {
  it.each([
    ['Substituir pela descrição da IA', analysis.descriptionSuggestion],
    ['Adicionar ao meu texto', `Meu texto\n\n${analysis.descriptionSuggestion}`],
    ['Manter meu texto', 'Meu texto'],
  ])('respeita a escolha %s', async (choice, expected) => {
    render(<ReportModal {...props()} />);
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Meu texto' } });
    await analyze();
    fireEvent.click(screen.getByRole('button', { name: 'Usar sugestão e revisar' }));
    fireEvent.click(screen.getByRole('button', { name: choice }));
    expect(screen.getByLabelText('Descrição')).toHaveValue(expected);
  });

  it('não afirma que a sugestão foi aplicada só porque a categoria coincide', async () => {
    const p = props(); render(<ReportModal {...p} />);
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Meu texto' } });
    await analyze();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar chamado' }));
    expect(p.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ aiAnalysis: expect.objectContaining({ userDecision: 'not_applied' }) }));
  });

  it('mantém o rascunho e a foto quando salvar falha', async () => {
    const p = props(); p.onSubmit.mockImplementation(() => { throw new Error('Armazenamento cheio'); });
    render(<ReportModal {...p} />);
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Não perder' } });
    await upload();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar chamado' }));
    expect(p.onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Descrição')).toHaveValue('Não perder');
    expect(screen.getByAltText('Foto do problema')).toHaveAttribute('src', photo);
  });

  it('ignora a imagem antiga quando duas leituras terminam fora de ordem', async () => {
    let finishFirst!: (value: string) => void;
    vi.mocked(compressImage).mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve; }));
    render(<ReportModal {...props()} />);
    fireEvent.change(screen.getByLabelText('Foto da galeria'), { target: { files: [file] } });
    expect(screen.getByRole('button', { name: 'Carregando foto...' })).toBeDisabled();
    await upload();
    await act(async () => finishFirst('data:image/jpeg;base64,b2xk'));
    expect(screen.getByAltText('Foto do problema')).toHaveAttribute('src', photo);
  });

  it('cancela a análise ao fechar e ignora a resposta atrasada', async () => {
    let finish!: (value: UrbanImageAnalysis) => void;
    vi.mocked(analyzeUrbanImage).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const p = props(); const { rerender } = render(<ReportModal {...p} />);
    await upload();
    fireEvent.click(screen.getByRole('button', { name: 'Analisar foto com IA' }));
    const signal = vi.mocked(analyzeUrbanImage).mock.calls[0][1]!;
    rerender(<ReportModal {...p} open={false} />);
    expect(signal.aborted).toBe(true);
    await act(async () => finish(analysis));
    rerender(<ReportModal {...p} />);
    expect(screen.queryByText(analysis.title)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analisar foto com IA' })).toBeEnabled();
  });
});
