import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { compressImage } from './urban';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('processamento de imagem', () => {
  const pictures: { width: number; height: number; src: string; onload: (() => void) | null; onerror: (() => void) | null }[] = [];
  const revoke = vi.fn();
  beforeEach(() => {
    revoke.mockClear();
    pictures.length = 0;
    vi.stubGlobal('Image', class {
      width = 1200; height = 800; src = ''; onload = null; onerror = null;
      constructor() { pictures.push(this); }
    });
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:fixture'), revokeObjectURL: revoke });
  });

  it('recusa arquivos vazios, não-imagens ou maiores que 20 MB antes de decodificar', async () => {
    await expect(compressImage(new File([], 'empty.jpg', { type: 'image/jpeg' }))).rejects.toThrow('20 MB');
    await expect(compressImage(new File(['text'], 'file.txt', { type: 'text/plain' }))).rejects.toThrow('20 MB');
    const large = new File(['data'], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(large, 'size', { value: 21 * 1024 * 1024 });
    await expect(compressImage(large)).rejects.toThrow('20 MB');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('reduz a imagem e libera a referência após codificar JPEG', async () => {
    const ctx = { drawImage: vi.fn(), fillRect: vi.fn(), fillStyle: '' };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,YWJj');
    const pending = compressImage(new File(['data'], 'image.webp', { type: 'image/webp' }));
    pictures[0].onload!();
    await expect(pending).resolves.toBe('data:image/jpeg;base64,YWJj');
    expect(ctx.drawImage).toHaveBeenCalledWith(pictures[0], 0, 0, 900, 600);
    expect(revoke).toHaveBeenCalledWith('blob:fixture');
    expect(pictures[0].onload).toBeNull();
  });

  it('rejeita erros do canvas sem deixar a promessa ou a imagem pendente', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => { throw new Error('canvas-failure'); });
    const pending = compressImage(new File(['data'], 'image.jpg', { type: 'image/jpeg' }));
    pictures[0].onload!();
    await expect(pending).rejects.toThrow('canvas-failure');
    expect(revoke).toHaveBeenCalledOnce();
  });

  it('não produz um canvas vazio para imagens muito estreitas', async () => {
    const ctx = { drawImage: vi.fn(), fillRect: vi.fn(), fillStyle: '' };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,YWJj');
    const pending = compressImage(new File(['data'], 'thin.png', { type: 'image/png' }));
    pictures[0].width = 4000; pictures[0].height = 1;
    pictures[0].onload!();
    await pending;
    expect(ctx.drawImage).toHaveBeenCalledWith(pictures[0], 0, 0, 900, 1);
  });
});

describe('geocodificação', () => {
  beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); });

  it('reutiliza o endereço para atualizações próximas do GPS', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ address: { road: 'Rua Teste', city: 'Sorocaba' } })));
    vi.stubGlobal('fetch', fetchMock);
    const { reverseGeocode } = await import('./urban');
    expect(await reverseGeocode(-23.50151, -47.45261)).toBe('Rua Teste, Sorocaba');
    expect(await reverseGeocode(-23.50152, -47.45262)).toBe('Rua Teste, Sorocaba');
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('encerra a busca por endereço quando o serviço não responde', async () => {
    vi.stubGlobal('fetch', vi.fn((_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new DOMException('abort', 'AbortError')));
    })));
    const { reverseGeocode } = await import('./urban');
    const pending = reverseGeocode(-23.5, -47.4);
    await vi.advanceTimersByTimeAsync(8001);
    await expect(pending).resolves.toBeUndefined();
  });

  it('não inicia uma consulta cancelada na fila', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')));
    const { reverseGeocode } = await import('./urban');
    const controller = new AbortController(); controller.abort();
    expect(await reverseGeocode(-23.5, -47.4, controller.signal)).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });
});
