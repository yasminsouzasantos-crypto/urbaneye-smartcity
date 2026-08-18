import { useEffect, useRef, useState } from 'react';
import {
  X,
  Send,
  Construction,
  Lightbulb,
  Car,
  TrafficCone,
  Camera,
  ImageIcon,
  MapPin,
  Clock,
  Loader2,
  Trash2,
} from 'lucide-react';
import { ProblemType } from '@/types/urban';
import { compressImage, formatDateTime } from '@/lib/urban';
import { toast } from 'sonner';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  position: [number, number];
  address?: string;
  addressLoading?: boolean;
  onSubmit: (data: { type: ProblemType; description: string; photo?: string }) => void;
}

const TYPES: { value: ProblemType; label: string; icon: React.ReactNode }[] = [
  { value: 'acidente', label: 'Acidente', icon: <Car className="w-5 h-5" /> },
  { value: 'obra', label: 'Obra', icon: <Construction className="w-5 h-5" /> },
  { value: 'iluminacao', label: 'Iluminação', icon: <Lightbulb className="w-5 h-5" /> },
  { value: 'transito', label: 'Trânsito', icon: <TrafficCone className="w-5 h-5" /> },
];

export default function ReportModal({
  open,
  onClose,
  position,
  address,
  addressLoading,
  onSubmit,
}: ReportModalProps) {
  const [type, setType] = useState<ProblemType>('acidente');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setLoadingPhoto(true);
    try {
      setPhoto(await compressImage(file));
    } catch {
      toast.error('Não foi possível carregar a foto');
    } finally {
      setLoadingPhoto(false);
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('Descreva o problema antes de enviar');
      return;
    }
    onSubmit({ type, description: description.trim(), photo });
    setDescription('');
    setPhoto(undefined);
    setType('acidente');
    onClose();
    toast.success('✅ Chamado aberto com sucesso!');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[hsl(var(--urban-overlay))]/60" onClick={onClose} />
      <div className="relative w-full max-w-md urban-glass rounded-t-2xl sm:rounded-2xl urban-shadow-lg p-5 animate-slide-up-fade z-10 sm:mx-4 max-h-[92dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Novo chamado</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary active:scale-95 transition-all"
            aria-label="Fechar"
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

        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Foto (opcional)
        </label>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {photo ? (
          <div className="relative mb-5 animate-slide-up-fade">
            <img src={photo} alt="Foto do problema" className="w-full h-44 object-cover rounded-xl" />
            <button
              onClick={() => setPhoto(undefined)}
              className="absolute top-2 right-2 w-9 h-9 rounded-full bg-background/90 flex items-center justify-center active:scale-95 urban-shadow"
              aria-label="Remover foto"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-border text-sm font-medium active:scale-[0.97] transition-all hover:border-primary/40"
            >
              {loadingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              Câmera
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-border text-sm font-medium active:scale-[0.97] transition-all hover:border-primary/40"
            >
              <ImageIcon className="w-5 h-5" />
              Galeria
            </button>
          </div>
        )}

        <div className="rounded-xl bg-secondary/70 p-3 mb-5 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Registrado automaticamente
          </p>
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
            <span>
              {addressLoading ? 'Buscando endereço...' : address ?? 'Endereço aproximado indisponível'}
              <span className="block text-muted-foreground tabular-nums">
                {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="tabular-nums">{formatDateTime(now)}</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-primary text-primary-foreground rounded-xl p-4 font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:opacity-90 text-base"
        >
          <Send className="w-4 h-4" />
          Enviar chamado
        </button>
      </div>
    </div>
  );
}
