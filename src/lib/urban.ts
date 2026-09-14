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
  if (report.reopened && report.resolutionMsRecorded !== undefined) {
    return `Reaberto pelo cidadão · atendimento anterior levou ${formatDuration(report.resolutionMsRecorded)}`;
  }
  return `Aberto há ${formatDuration(now - report.timestamp.getTime())}`;
}

export function resolutionMs(r: UrbanReport): number | null {
  if (r.status === 'resolvido' && r.resolvedAt) {
    return r.resolvedAt.getTime() - r.timestamp.getTime();
  }
  return r.resolutionMsRecorded ?? null;
}


const addressCache = new Map<string, { address: string; expires: number }>();
let geocodeQueue: Promise<unknown> = Promise.resolve();
let lastGeocodeAt = 0;

/** Cache nearby GPS updates and serialize requests to the public geocoder. */
export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string | undefined> {
  if (signal?.aborted || !Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = addressCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.address;

  const request = geocodeQueue.then(async () => {
    if (signal?.aborted) return undefined;
    const queuedCache = addressCache.get(key);
    if (queuedCache && queuedCache.expires > Date.now()) return queuedCache.address;
    const delay = Math.max(0, 1100 - (Date.now() - lastGeocodeAt));
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    if (signal?.aborted) return undefined;
    lastGeocodeAt = Date.now();
    const address = await fetchAddress(lat, lng, signal);
    if (address) {
      if (addressCache.size >= 50) addressCache.delete(addressCache.keys().next().value);
      addressCache.set(key, { address, expires: Date.now() + 5 * 60_000 });
    }
    return address;
  });
  geocodeQueue = request.catch(() => undefined);
  return request;
}

async function fetchAddress(lat: number, lng: number, signal?: AbortSignal): Promise<string | undefined> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 8000);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=pt-BR`,
      { signal: controller.signal }
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const a = data.address ?? {};
    const parts = [a.road, a.suburb ?? a.neighbourhood, a.city ?? a.town].filter(Boolean);
    return parts.length ? parts.filter((part) => typeof part === 'string').join(', ') : typeof data.display_name === 'string' ? data.display_name : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

/** Compress an image file to a small base64 jpeg suitable for local storage. */
export function compressImage(file: File, maxSize = 900, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.size || file.size > 20 * 1024 * 1024 || (file.type && !file.type.startsWith('image/'))) {
      reject(new Error('Selecione uma imagem válida de até 20 MB.'));
      return;
    }
    // An object URL avoids allocating another base64 copy of the original file.
    const url = URL.createObjectURL(file);
    const img = new Image();
    const cleanup = () => {
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
      URL.revokeObjectURL(url);
    };
    const timeout = setTimeout(() => {
      cleanup();
      img.src = '';
      reject(new Error('A imagem demorou demais para carregar. Tente outra foto.'));
    }, 20_000);
    img.onerror = () => {
      cleanup();
      reject(new Error('Não foi possível abrir essa imagem. Tente JPG, PNG ou WebP.'));
    };
    img.onload = () => {
      try {
        if (!img.width || !img.height) throw new Error('Imagem sem dimensões válidas.');
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Não foi possível processar a imagem.');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (error) { reject(error); }
      finally { cleanup(); }
    };
    img.src = url;
  });
}
