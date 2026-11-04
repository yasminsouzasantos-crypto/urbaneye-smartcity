import { UrbanReport } from '@/types/urban';
import { SOURCE_LABELS, sourceFor } from '@/lib/reportData';

export default function SourceBadge({ report }: { report: UrbanReport }) {
  return <span className="block text-[10px] font-medium text-muted-foreground mt-1">{SOURCE_LABELS[sourceFor(report)]}</span>;
}
