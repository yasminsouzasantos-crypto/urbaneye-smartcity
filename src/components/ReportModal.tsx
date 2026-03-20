import { useState } from 'react';
import { X, Send, Construction, Lightbulb, Car, TrafficCone } from 'lucide-react';
import { ProblemType } from '@/types/urban';
import { toast } from 'sonner';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (type: ProblemType, description: string) => void;
}

const TYPES: { value: ProblemType; label: string; icon: React.ReactNode }[] = [
  { value: 'acidente', label: 'Acidente', icon: <Car className="w-5 h-5" /> },
  { value: 'obra', label: 'Obra', icon: <Construction className="w-5 h-5" /> },
  { value: 'iluminacao', label: 'Iluminação', icon: <Lightbulb className="w-5 h-5" /> },
  { value: 'transito', label: 'Trânsito', icon: <TrafficCone className="w-5 h-5" /> },
];

export default function ReportModal({ open, onClose, onSubmit }: ReportModalProps) {
  const [type, setType] = useState<ProblemType>('acidente');
  const [description, setDescription] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('Descreva o problema antes de enviar');
      return;
    }
    onSubmit(type, description);
    setDescription('');
    setType('acidente');
    onClose();
    toast.success('✅ Problema reportado com sucesso!');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[hsl(var(--urban-overlay))]/60" onClick={onClose} />
      <div className="relative w-full max-w-md urban-glass rounded-t-2xl sm:rounded-2xl urban-shadow-lg p-6 animate-slide-up-fade z-10 mx-4 mb-0 sm:mb-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Reportar Problema</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Tipo do problema
        </label>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-[0.97] text-sm font-medium ${
                type === t.value
                  ? 'border-primary bg-[hsl(var(--urban-blue-light))] text-primary'
                  : 'border-border bg-background hover:border-primary/30'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o que está acontecendo..."
          rows={3}
          className="w-full rounded-xl border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all mb-5 placeholder:text-muted-foreground"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-primary text-primary-foreground rounded-xl p-4 font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:opacity-90 text-base"
        >
          <Send className="w-4 h-4" />
          Enviar Reporte
        </button>
      </div>
    </div>
  );
}
