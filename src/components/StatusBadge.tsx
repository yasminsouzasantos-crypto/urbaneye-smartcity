import { ReportStatus, STATUS_COLORS, STATUS_LABELS } from '@/types/urban';

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
      <span
        aria-hidden
        className={size === 'md' ? 'w-2 h-2 rounded-full' : 'w-1.5 h-1.5 rounded-full'}
        style={{ backgroundColor: color }}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
