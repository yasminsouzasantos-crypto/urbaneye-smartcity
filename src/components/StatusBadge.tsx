import { ReportStatus, STATUS_COLORS, STATUS_DOTS, STATUS_LABELS } from '@/types/urban';

export default function StatusBadge({
  status,
  size = 'sm',
}: {
  status: ReportStatus;
  size?: 'sm' | 'md';
}) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        size === 'md' ? 'text-sm px-3 py-1.5' : 'text-[11px] px-2.5 py-1'
      }`}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <span aria-hidden>{STATUS_DOTS[status]}</span>
      {STATUS_LABELS[status]}
    </span>
  );
}
