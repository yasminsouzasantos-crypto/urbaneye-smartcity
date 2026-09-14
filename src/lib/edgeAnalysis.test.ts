// @vitest-environment node
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

let handler: (request: Request) => Promise<Response>;
const env: Record<string, string> = {
  AI_ALLOWED_ORIGINS: 'http://localhost:8080', SUPABASE_PUBLISHABLE_KEY: 'test-public-key',
  GEMINI_API_KEY: 'test-server-key', AI_ANALYSIS_REQUESTS_PER_MINUTE: '8',
};
const result = {
  hasUrbanIssue: true, suggestedType: 'obra', suggestedSeverity: 'warning', confidence: 0.9,
  title: 'Buraco', descriptionSuggestion: 'Pavimento danificado.', visibleEvidence: ['Buraco visível'], riskFlags: [], needsHumanReview: false,
};
const jpeg = `data:image/jpeg;base64,${btoa('\xff\xd8\xff' + 'test-image')}`;
const request = (body: unknown = { image: jpeg }, headers = {}) => new Request('http://local/analyze', {
  method: 'POST', headers: { origin: 'http://localhost:8080', apikey: 'test-public-key', 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('Deno', { env: { get: (key: string) => env[key] }, serve: (fn: typeof handler) => { handler = fn; } });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(result) }] } }] }))));
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await import('../../supabase/functions/analyze-urban-image/index.ts');
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('Edge Function sem serviços externos', () => {
  it.each([null, [], 1, 'text', {}, { image: 5 }])('devolve 400 para corpo inválido (%j), sem chamar o provedor', async (body) => {
    expect((await handler(request(body))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejeita origem e chave pública incorretas', async () => {
    expect((await handler(request(undefined, { origin: 'https://untrusted.example' }))).status).toBe(403);
    expect((await handler(request(undefined, { apikey: 'wrong' }))).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('responde ao preflight sem consumir o provedor', async () => {
    const response = await handler(new Request('http://local/analyze', { method: 'OPTIONS', headers: { origin: 'http://localhost:8080' } }));
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:8080');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('limita o corpo mesmo sem Content-Length', async () => {
    const response = await handler(request({ image: 'x'.repeat(6 * 1024 * 1024) }));
    expect(response.status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('recusa base64 inválido e texto disfarçado de imagem', async () => {
    expect((await handler(request({ image: 'data:image/jpeg;base64,====' }))).status).toBe(400);
    expect((await handler(request({ image: `data:image/png;base64,${btoa('not a picture')}` }))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    jpeg,
    `data:image/png;base64,${btoa('\x89PNG\r\n\x1a\n' + 'test')}`,
    `data:image/webp;base64,${btoa('RIFF\x04\x00\x00\x00WEBPtest')}`,
  ])('aceita os formatos suportados e mantém o contrato do cliente', async (image) => {
    const response = await handler(request({ image }));
    expect(response.status).toBe(200);
    const { isUrbanImageAnalysis } = await import('./aiAnalysis');
    expect(isUrbanImageAnalysis(await response.json())).toBe(true);
  });

  it('ignora pensamentos, une as partes e remove campos imprevistos do modelo', async () => {
    const json = JSON.stringify({ ...result, unexpected: 'should not escape', visibleEvidence: ['x'.repeat(300)] });
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ candidates: [{ content: { parts: [
      { thought: true, text: 'private reasoning' }, { text: json.slice(0, 30) }, { text: json.slice(30) },
    ] } }] })));
    const response = await handler(request());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.unexpected).toBeUndefined();
    expect(body.visibleEvidence[0]).toHaveLength(160);
  });

  it('aplica limite de tentativas antes de chamar o Gemini', async () => {
    for (let i = 0; i < 8; i++) await handler(request({}));
    expect((await handler(request())).status).toBe(429);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([429, 404, 500])('trata erro %i do provedor sem expor sua resposta', async status => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('sensitive upstream details', { status }));
    const response = await handler(request());
    expect(response.status).toBe(status === 404 ? 503 : status === 500 ? 502 : 429);
    expect(await response.text()).not.toContain('sensitive');
  });

  it('interrompe o provedor após o timeout', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementationOnce((_url, init) => new Promise((_resolve, reject) => {
      init!.signal!.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    }));
    const pending = handler(request());
    await vi.advanceTimersByTimeAsync(25_001);
    expect((await pending).status).toBe(502);
  });
});
