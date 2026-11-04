import { useState } from 'react';
import { DataMode } from '@/types/urban';
import { DATA_MODE_LABELS } from '@/lib/reportData';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface LocalDataControlsProps {
  mode: DataMode;
  hiddenCount: number;
  onModeChange: (mode: DataMode) => void;
  onLoadFixed: (reset?: boolean) => void;
  fixedOnly: boolean;
  onFixedOnlyChange: (fixedOnly: boolean) => void;
}

export default function LocalDataControls({ mode, hiddenCount, onModeChange, onLoadFixed, fixedOnly, onFixedOnlyChange }: LocalDataControlsProps) {
  const [action, setAction] = useState<'load' | 'reset' | null>(null);
  const [error, setError] = useState<string>();
  const chooseMode = (next: DataMode) => {
    try { onModeChange(next); setError(undefined); }
    catch (failure) { setError((failure as Error).message); }
  };
  const confirm = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!action) return;
    try { onLoadFixed(action === 'reset'); setError(undefined); setAction(null); }
    catch (failure) { setError((failure as Error).message); }
  };

  return (
    <section className="urban-glass urban-shadow rounded-2xl p-4 mb-4 space-y-3" aria-label="Dados da avaliação local">
      <h3 className="font-semibold">Dados da avaliação local</h3>
      <p className="text-xs text-muted-foreground">Mesmo computador e perfil de navegador. Nenhum modo gera ocorrências ou sensores automaticamente.</p>
      <div className="grid grid-cols-2 gap-2">
        {(['avaliacao', 'demonstracao'] as const).map(value => (
          <button key={value} type="button" aria-pressed={mode === value} onClick={() => chooseMode(value)}
            className={`rounded-xl border-2 p-3 text-sm font-semibold ${mode === value ? 'border-primary text-primary' : 'border-border'}`}>
            {DATA_MODE_LABELS[value]}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {mode === 'avaliacao'
          ? 'Mapas e indicadores mostram registros manuais locais e legado de origem não verificada. Não são resultados de campo validados.'
          : 'Mapas e indicadores mostram apenas dados simulados: conjunto fixo, cadastros de demonstração e simulações antigas.'}
      </p>
      <p className="text-xs text-muted-foreground">{hiddenCount} registro(s) preservado(s) fora desta visualização. Trocar de modo não apaga nem substitui chamados.</p>
      {mode === 'demonstracao' && (
        <>
          <label className="block text-xs font-semibold" htmlFor="demo-data-scope">Dados exibidos na demonstração</label>
          <select id="demo-data-scope" value={fixedOnly ? 'fixed' : 'all'} onChange={event => onFixedOnlyChange(event.target.value === 'fixed')}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm">
            <option value="all">Todos os simulados</option>
            <option value="fixed">Somente conjunto fixo v1</option>
          </select>
          <p className="text-xs text-muted-foreground">Para conferir os totais reproduzíveis, escolha Somente conjunto fixo v1. Para cadastrar um chamado de demonstração, escolha Todos os simulados.</p>
          <p className="text-xs text-muted-foreground">Conjunto fixo v1: 8 chamados simulados, 2 por categoria e 2 por status. Não pertencem a uma conta.</p>
          <button type="button" className="w-full rounded-xl bg-primary text-primary-foreground p-3 text-sm font-semibold"
            onClick={() => { setError(undefined); setAction('load'); }}>Carregar conjunto fixo</button>
          <button type="button" className="w-full rounded-xl border-2 border-border p-3 text-sm font-semibold"
            onClick={() => { setError(undefined); setAction('reset'); }}>Restaurar conjunto fixo</button>
        </>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <AlertDialog open={action !== null} onOpenChange={open => { if (!open) setAction(null); }}>
        <AlertDialogContent overlayClassName="z-[1090]" className="z-[1100] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{action === 'reset' ? 'Restaurar os 8 chamados simulados?' : 'Carregar os 8 chamados simulados?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'reset'
                ? 'Somente os registros do conjunto fixo v1 voltarão aos valores originais, descartando alterações feitas neles. Chamados manuais (incluindo fotos) e legado serão preservados.'
                : 'Serão adicionados apenas os IDs ausentes do conjunto fixo v1. Nenhum chamado existente será apagado ou substituído, inclusive os cenários já editados.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirm}>Confirmar {action === 'reset' ? 'restauração' : 'carga'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
