import { Priority, PRIORITY_COLORS, PRIORITY_LABELS } from '@/types/urban';

export default function PriorityBadge({
  priority,
  size = 'sm',
  withLabel = true,
}: {
  priority: Priority;
  size?: 'sm' | 'md';
  withLabel?: boolean;
}) {
  const color = PRIORITY_COLORS[priority];
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
      {withLabel ? 'Prioridade ' : ''}
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
