import { AlertTriangle, AlertCircle, CheckCircle, Activity } from 'lucide-react';

interface DashboardProps {
  stats: {
    total: number;
    severe: number;
    warning: number;
    normal: number;
  };
}

export default function Dashboard({ stats }: DashboardProps) {
  const cards = [
    { label: 'Total', value: stats.total, icon: Activity, color: 'text-primary' },
    { label: 'Graves', value: stats.severe, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Médios', value: stats.warning, icon: AlertCircle, color: 'text-[hsl(var(--urban-warning))]' },
    { label: 'Normais', value: stats.normal, icon: CheckCircle, color: 'text-[hsl(var(--urban-ok))]' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 px-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="urban-glass urban-shadow rounded-xl p-3 flex flex-col items-center gap-1 animate-slide-up-fade"
        >
          <card.icon className={`w-4 h-4 ${card.color}`} />
          <span className="text-lg font-bold tabular-nums">{card.value}</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );
}
