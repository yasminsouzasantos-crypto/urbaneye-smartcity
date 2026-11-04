import { fireEvent, render, screen, cleanup, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LocalDataControls from './LocalDataControls';

afterEach(cleanup);
const props = () => ({ mode: 'demonstracao' as const, hiddenCount: 3, onModeChange: vi.fn(), onLoadFixed: vi.fn(), fixedOnly: false, onFixedOnlyChange: vi.fn() });

describe('ações explícitas sobre dados simulados', () => {
  it('seleciona o conjunto fixo sem carregar ou apagar registros', () => {
    const p = props(); render(<LocalDataControls {...p} />);
    fireEvent.change(screen.getByLabelText('Dados exibidos na demonstração'), { target: { value: 'fixed' } });
    expect(p.onFixedOnlyChange).toHaveBeenCalledWith(true);
    expect(p.onLoadFixed).not.toHaveBeenCalled();
  });
  it('não carrega ao entrar no modo e só carrega após confirmação; cancelar não altera dados', () => {
    const p = props(); render(<LocalDataControls {...p} />);
    expect(p.onLoadFixed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Carregar conjunto fixo' }));
    expect(p.onLoadFixed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(p.onLoadFixed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Carregar conjunto fixo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar carga' }));
    expect(p.onLoadFixed).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('avisa que restaurar descarta somente edições dos cenários e exige confirmação separada', () => {
    const p = props(); render(<LocalDataControls {...p} />);
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar conjunto fixo' }));
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('Chamados manuais (incluindo fotos) e legado serão preservados');
    expect(p.onLoadFixed).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar restauração' }));
    expect(p.onLoadFixed).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('mantém confirmação e erro visíveis se a gravação falhar', () => {
    const p = props(); p.onLoadFixed.mockImplementation(() => { throw new Error('Armazenamento cheio'); });
    render(<LocalDataControls {...p} />);
    fireEvent.click(screen.getByRole('button', { name: 'Carregar conjunto fixo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar carga' }));
    expect(within(screen.getByRole('alertdialog')).getByRole('alert')).toHaveTextContent('Armazenamento cheio');
  });

  it('identifica avaliação, mantém os registros ocultos informados e não oferece carga nesse modo', () => {
    const p = props(); render(<LocalDataControls {...p} mode="avaliacao" />);
    expect(screen.getByRole('button', { name: 'Avaliação local' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/3 registro\(s\) preservado/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Carregar conjunto fixo' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Demonstração simulada' }));
    expect(p.onModeChange).toHaveBeenCalledWith('demonstracao');
    expect(p.onLoadFixed).not.toHaveBeenCalled();
  });
});
