import { ClipboardList, ImageIcon, MapPin, Timer } from 'lucide-react';
import { PROBLEM_SHORT, UrbanReport } from '@/types/urban';
import { formatDateTime, timeInfo } from '@/lib/urban';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface Props {
  reports: UrbanReport[];
  onSelect: (r: UrbanReport) => void;
  onCreate: () => void;
}

export default function MyReports({ reports, onSelect, onCreate }: Props) {
  const mine = reports.filter((r) => r.mine);

  return (
    <div className="h-full overflow-y-auto px-4 pt-20 pb-28">
      <h2 className="text-xl font-bold mb-1">Meus chamados</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {mine.length ? `${mine.length} chamado(s) enviados por você` : 'Você ainda não abriu chamados'}
      </p>

      {!mine.length && (
        <div className="urban-glass urban-shadow rounded-2xl p-8 flex flex-col items-center text-center gap-3 animate-slide-up-fade">
          <ClipboardList className="w-10 h-10 text-primary" />
          <p className="text-sm text-muted-foreground">
            Toque no botão + para reportar um problema perto de você.
          </p>
          <button
            onClick={onCreate}
            className="bg-primary text-primary-foreground rounded-xl px-5 py-3 font-semibold active:scale-[0.97] transition-all"
          >
            Abrir chamado
          </button>
        </div>
      )}

      <div className="space-y-3">
        {mine.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="w-full text-left urban-glass urban-shadow rounded-2xl p-3 flex gap-3 items-center active:scale-[0.98] transition-transform animate-slide-up-fade"
          >
            {r.photo ? (
              <img src={r.photo} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm truncate">{PROBLEM_SHORT[r.type]}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{r.address ?? r.region ?? 'Local registrado'}</span>
              </p>
              <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                {formatDateTime(r.timestamp)}
              </p>
              <p className="text-[11px] font-medium mt-0.5 flex items-center gap-1">
                <Timer className="w-3 h-3 shrink-0 text-primary" />
                {timeInfo(r)}
              </p>
              <div className="mt-1.5">
                <PriorityBadge priority={r.priority} withLabel={false} />
              </div>

            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
