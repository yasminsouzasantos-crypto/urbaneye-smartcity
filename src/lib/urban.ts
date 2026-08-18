import { REGIONS, UrbanReport } from '@/types/urban';

export function regionFor(lat: number, lng: number): string {
  let best = REGIONS[0];
  let bestD = Infinity;
  for (const r of REGIONS) {
    const d = (r.center[0] - lat) ** 2 + (r.center[1] - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  return best.name;
}

export function formatDuration(ms: number): string {
  const total = ms < 0 ? 0 : ms;
  const minutes = Math.floor(total / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
  if (hours) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
  if (!days && mins) parts.push(`${mins} ${mins === 1 ? 'minuto' : 'minutos'}`);
  if (!parts.length) return 'menos de 1 minuto';
  return parts.join(' e ');
}

export function formatDateTime(d: Date): string {
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

/** friendly line: "Resolvido em ..." or "Aberto há ..." */
export function timeInfo(report: UrbanReport, now = Date.now()): string {
  if (report.status === 'resolvido' && report.resolvedAt) {
    return `Resolvido em ${formatDuration(report.resolvedAt.getTime() - report.timestamp.getTime())}`;
  }
  return `Aberto há ${formatDuration(now - report.timestamp.getTime())}`;
}

export function resolutionMs(r: UrbanReport): number | null {
  if (r.status === 'resolvido' && r.resolvedAt) {
    return r.resolvedAt.getTime() - r.timestamp.getTime();
  }
  return null;
}

/** Reverse geocode via OpenStreetMap; fails silently. */
export async function reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=pt-BR`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const a = data.address ?? {};
    const parts = [a.road, a.suburb ?? a.neighbourhood, a.city ?? a.town].filter(Boolean);
    return parts.length ? parts.join(', ') : data.display_name;
  } catch {
    return undefined;
  }
}

/** Compress an image file to a small base64 jpeg suitable for local storage. */
export function compressImage(file: File, maxSize = 900, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read-error'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image-error'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('ctx-error'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
