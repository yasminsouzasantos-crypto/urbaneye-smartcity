import { randomUUID } from 'node:crypto';
import { test as base, expect, type Page, type TestInfo } from '@playwright/test';
import type { UrbanReport } from '../src/types/urban';

const password = 'demo-test-123';
type SavedReport = Omit<UrbanReport, 'timestamp' | 'resolvedAt'> & { timestamp: string; resolvedAt?: string };
interface NetworkAudit {
  localOrigin: string;
  geolocation: { kind: 'simulated'; latitude: number; longitude: number };
  aiPosts: number;
  geocodingRequests: number;
  tileRequests: number;
  blocked: string[];
}
const aiResult = {
  promptVersion: 'urbaneye-image-triage-v1', model: 'test-model', analyzedAt: '2026-09-14T12:00:00Z',
  hasUrbanIssue: true, suggestedType: 'obra', suggestedSeverity: 'warning', confidence: 0.9,
  title: 'Buraco no asfalto', descriptionSuggestion: 'Buraco visível no pavimento da rua.',
  visibleEvidence: ['Pavimento irregular'], riskFlags: [], needsHumanReview: false,
};

// The built-in page/context fixtures create a new, non-persistent context per test.
// Account changes within each scenario deliberately share its local storage.
const test = base.extend<{ networkAudit: NetworkAudit }>({
  networkAudit: [async ({ context, baseURL, browser }, use, testInfo) => {
    if (!baseURL) throw new Error('A origem local do teste é obrigatória');
    const audit: NetworkAudit = {
      localOrigin: new URL(baseURL).origin,
      geolocation: { kind: 'simulated', latitude: -23.55052, longitude: -46.63331 },
      aiPosts: 0, geocodingRequests: 0, tileRequests: 0, blocked: [],
    };
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(audit.geolocation);
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === audit.localOrigin) return route.continue();
      if (url.pathname.endsWith('/functions/v1/analyze-urban-image')) {
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: {
          'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS',
        } });
        audit.aiPosts += 1;
        const body = route.request().postDataJSON();
        expect(body.image).toMatch(/^data:image\/jpeg;base64,/);
        return route.fulfill({ json: aiResult, headers: { 'access-control-allow-origin': '*' } });
      }
      if (url.hostname === 'nominatim.openstreetmap.org') {
        audit.geocodingRequests += 1;
        return route.fulfill({ json: { address: { road: 'Rua de teste', city: 'São Paulo' } } });
      }
      if (url.hostname === 'tile.openstreetmap.org') {
        audit.tileRequests += 1;
        return route.fulfill({
          contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jMioAAAAASUVORK5CYII=', 'base64'),
        });
      }
      audit.blocked.push(`${route.request().method()} ${url.origin}${url.pathname}`);
      return route.abort();
    });
    try { await use(audit); }
    finally {
      await testInfo.attach('rede-simulada-e-ambiente', {
        body: Buffer.from(JSON.stringify({ ...audit, browserVersion: browser.version(), nodeVersion: process.version,
          platform: process.platform, serviceWorkers: 'block', realAiCalls: 'blocked_by_routing' }, null, 2)),
        contentType: 'application/json',
      });
    }
  }, { auto: true }],
});

const fictitiousEmail = (prefix: string) => `${prefix}-${randomUUID()}@example.com`;

async function signUp(page: Page, email: string, admin = false) {
  await page.getByRole('button', { name: 'Criar conta', exact: true }).first().click();
  if (admin) await page.getByRole('button', { name: /Administrador Gestão/ }).click();
  await page.getByLabel('Nome', { exact: true }).fill(admin ? 'Gestor Teste' : 'Cidadão Teste');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole('navigation')).toBeVisible();
}

async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Perfil', exact: true }).click();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('urbaneye.session.v1'))).toBeNull();
}

async function signIn(page: Page, email: string) {
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole('navigation')).toBeVisible();
}

async function attachWebp(page: Page) {
  const data = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#888'; ctx.fillRect(0, 0, 32, 32);
    return canvas.toDataURL('image/webp').split(',')[1];
  });
  await page.getByLabel('Foto da galeria').setInputFiles({ name: 'rua.webp', mimeType: 'image/webp', buffer: Buffer.from(data, 'base64') });
  await expect(page.getByRole('button', { name: 'Analisar foto com IA' })).toBeVisible();
}

async function readSavedReports(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('urbaneye.reports.v2') ?? '[]') as SavedReport[]);
}

async function readReport(page: Page, id: string) {
  const report = (await readSavedReports(page)).find(report => report.id === id);
  if (!report) throw new Error(`Chamado criado ${id} ausente do armazenamento`);
  return report;
}

const reportButton = (page: Page, id: string) => page.getByRole('button').and(page.getByTestId(`report-${id}`));
const detailDialog = (page: Page) => page.getByRole('dialog', { name: 'Detalhes do chamado' });

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, animations: 'disabled' });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

async function expectEvaluationMode(page: Page) {
  await expect(page.getByRole('button', { name: /^Avaliação local ·/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('urbaneye.data-mode.v1'))).toBe('avaliacao');
}

async function expectDisplayedStatus(page: Page, label: string) {
  // Administrative status buttons have the same text; assert the displayed badge.
  await expect(detailDialog(page).getByText(label, { exact: true }).and(page.locator('span'))).toBeVisible();
}

for (const variant of ['manual', 'WebP/IA'] as const) {
  test(variant === 'manual' ? 'piloto manual: cadastro → persistência → gestão → contestação'
    : 'cadastro → WebP/IA → persistência → gestão → contestação', async ({ page, networkAudit }, testInfo) => {
    const manual = variant === 'manual';
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const email = fictitiousEmail(manual ? 'piloto-manual' : 'regressao-ia');
    const marker = `AUTOMATIZADO-${randomUUID()}`;
    const description = manual ? `${marker}: teste fictício de buraco no pavimento de uma obra.` : aiResult.descriptionSuggestion;

    const ownerId = await test.step('C01 Cadastro cidadão exclusivo', async () => {
      await page.goto('/');
      expect(await readSavedReports(page)).toEqual([]);
      expect(await page.evaluate(() => localStorage.getItem('urbaneye.session.v1'))).toBeNull();
      await signUp(page, email);
      const session = await page.evaluate(() => JSON.parse(localStorage.getItem('urbaneye.session.v1')!) as { id: string; email: string; role: string });
      expect(session).toMatchObject({ email, role: 'cidadao' });
      expect(session.id).toBeTruthy();
      await expect(page.getByRole('button', { name: 'Gestão', exact: true })).toHaveCount(0);
      await expect(page.locator('.leaflet-container')).toBeVisible();
      return session.id;
    });

    const created = await test.step('C02 Ocorrência manual em Avaliação local', async () => {
      await page.getByRole('button', { name: 'Perfil', exact: true }).click();
      await page.getByRole('button', { name: 'Avaliação local', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Avaliação local', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expectEvaluationMode(page);
      await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
      await page.getByRole('button', { name: 'Reportar problema' }).click();
      const form = page.getByRole('dialog', { name: 'Novo chamado' });
      await expect(form).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.85)');
      if (manual) {
        await form.getByRole('button', { name: 'Enviar chamado', exact: true }).click();
        await expect(page.getByText('Descreva o problema antes de enviar', { exact: true })).toBeVisible();
        expect(await readSavedReports(page)).toEqual([]);
        await form.getByRole('button', { name: 'Obra', exact: true }).click();
        await page.getByLabel('Descrição', { exact: true }).fill(description);
      } else {
        await page.getByLabel('Descrição', { exact: true }).fill('Minha descrição anterior.');
        await attachWebp(page);
        await page.getByRole('button', { name: 'Analisar foto com IA' }).click();
        await page.getByRole('button', { name: 'Usar sugestão e revisar' }).click();
        await page.getByRole('button', { name: 'Substituir pela descrição da IA' }).click();
        await expect(page.getByLabel('Descrição', { exact: true })).toHaveValue(aiResult.descriptionSuggestion);
      }
      await form.getByRole('button', { name: 'Enviar chamado', exact: true }).click();
      await expect(form).not.toBeVisible();
      await expect(page.getByText('1 chamado(s) enviados por você')).toBeVisible();
      const reports = await readSavedReports(page);
      expect(reports).toHaveLength(1);
      const [report] = reports;
      expect(report.id).toBeTruthy();
      expect(report).toMatchObject({ ownerId, source: 'manual_local', type: 'obra', description,
        address: 'Rua de teste, São Paulo', status: 'aberto', priority: 'media', lat: -23.55052, lng: -46.63331 });
      expect(report.datasetVersion).toBeUndefined();
      if (manual) {
        expect(report.photo).toBeUndefined();
        expect(report.aiAnalysis).toBeUndefined();
        expect(networkAudit.aiPosts).toBe(0);
      }
      await capture(page, testInfo, 'C02-chamado-manual-local');
      return report;
    });

    await testInfo.attach('identidade-ficticia-do-cenario', {
      body: Buffer.from(JSON.stringify({ execution: 'automated', variant, marker, reportId: created.id, ownerId, email }, null, 2)),
      contentType: 'application/json',
    });

    await test.step('C03 Localizar ID e conferir Aberto', async () => {
      await page.reload();
      await expectEvaluationMode(page);
      await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
      const button = reportButton(page, created.id);
      await expect(button).toHaveCount(1);
      await expect(button).toContainText('Manual local · não verificado em campo');
      await expect(button).toContainText('Aberto');
      await button.click();
      await expectDisplayedStatus(page, 'Aberto');
      await expect(detailDialog(page)).toContainText(description);
      if (!manual) {
        await expect(page.getByText('Sugestão aceita pelo cidadão.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Ampliar foto do chamado' })).toBeVisible();
      }
      expect(await readReport(page, created.id)).toEqual(created);
      await detailDialog(page).getByRole('button', { name: 'Fechar', exact: true }).click();
    });

    await test.step('C04 Logout e login preservam o mesmo chamado', async () => {
      await signOut(page);
      await signIn(page, email);
      await expectEvaluationMode(page);
      await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
      await expect(reportButton(page, created.id)).toHaveCount(1);
      await reportButton(page, created.id).click();
      await expectDisplayedStatus(page, 'Aberto');
      await expect(detailDialog(page)).toContainText(description);
      expect(await readReport(page, created.id)).toEqual(created);
      await capture(page, testInfo, 'C04-persistencia-apos-login');
      await detailDialog(page).getByRole('button', { name: 'Fechar', exact: true }).click();
    });

    await test.step('C05 F01 administrador atende e resolve', async () => {
      await signOut(page);
      const adminEmail = fictitiousEmail('gestor-cenario');
      await signUp(page, adminEmail, true);
      // Exercise administrative login too, rather than relying only on signup.
      await signOut(page);
      await signIn(page, adminEmail);
      await expectEvaluationMode(page);
      await page.getByRole('button', { name: 'Gestão', exact: true }).click();
      await expect(page.getByText('Chamados por prioridade', { exact: true })).toBeVisible();
      await expect(page.locator('.recharts-wrapper').first()).toBeVisible();
      const button = reportButton(page, created.id);
      await expect(button).toHaveCount(1);
      await expect(button).toContainText('Rua de teste, São Paulo');
      await expect(button).toContainText('Manual local · não verificado em campo');
      await button.click();
      await expect(detailDialog(page)).toContainText(description);
      await detailDialog(page).getByRole('button', { name: 'Crítica', exact: true }).click();
      expect(await readReport(page, created.id)).toMatchObject({ ownerId, priority: 'critica', status: 'aberto' });
      await detailDialog(page).getByRole('button', { name: 'Em atendimento', exact: true }).click();
      await expectDisplayedStatus(page, 'Em atendimento');
      expect(await readReport(page, created.id)).toMatchObject({ ownerId, priority: 'critica', status: 'atendimento' });
      await capture(page, testInfo, 'C05-em-atendimento');
      await page.getByRole('button', { name: 'Marcar como resolvido' }).click();
      await expectDisplayedStatus(page, 'Resolvido');
      await expect(page.getByText('Aguardando confirmação do cidadão.', { exact: true })).toBeVisible();
      expect(await readReport(page, created.id)).toMatchObject({ ownerId, priority: 'critica', status: 'resolvido', confirmation: 'pendente' });
      expect((await readReport(page, created.id)).resolvedAt).toBeTruthy();
      await capture(page, testInfo, 'C05-resolvido-pendente');
      await detailDialog(page).getByRole('button', { name: 'Fechar', exact: true }).click();
    });

    await test.step('C06 Proprietário contesta e reabre', async () => {
      await signOut(page);
      await signIn(page, email);
      await expectEvaluationMode(page);
      await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
      const button = reportButton(page, created.id);
      await expect(button).toHaveCount(1);
      await expect(button).toContainText('Resolvido');
      await button.click();
      await expectDisplayedStatus(page, 'Resolvido');
      await page.getByRole('button', { name: 'Não, ainda não' }).click();
      await expect(page.getByText(/Cidadão informou que o problema ainda não foi resolvido/)).toBeVisible();
      await expectDisplayedStatus(page, 'Em atendimento');
      const saved = await readReport(page, created.id);
      expect(saved).toBeDefined();
      expect(saved.ownerId).toBe(ownerId);
      expect(saved.confirmation).toBe('contestado');
      expect(saved.reopened).toBe(true);
      expect(saved.status).toBe('atendimento');
      expect(saved.priority).toBe('critica');
      expect(saved.source).toBe('manual_local');
      expect(saved.description).toBe(description);
      expect(saved.resolvedAt).toBeUndefined();
      if (!manual) expect(saved.photo).toMatch(/^data:image\/jpeg/);
      expect(networkAudit.aiPosts).toBe(manual ? 0 : 1);
      expect(errors).toEqual([]);
      await capture(page, testInfo, 'chamado-revisado');
    });
  });
}

test('C07 outra conta não recebe os chamados como próprios', async ({ page, networkAudit }, testInfo) => {
  await page.goto('/');
  const ownerEmail = fictitiousEmail('proprietario');
  await signUp(page, ownerEmail);
  await page.getByRole('button', { name: 'Perfil', exact: true }).click();
  await page.getByRole('button', { name: 'Avaliação local', exact: true }).click();
  await expectEvaluationMode(page);
  await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  await page.getByRole('button', { name: 'Reportar problema' }).click();
  await page.getByLabel('Descrição', { exact: true }).fill('Chamado da primeira conta.');
  await page.getByRole('button', { name: 'Enviar chamado', exact: true }).click();
  await expect(page.getByText('1 chamado(s) enviados por você')).toBeVisible();
  const [owned] = await readSavedReports(page);
  expect(owned.ownerId).toBeTruthy();
  await signOut(page);
  await signUp(page, fictitiousEmail('outra-conta'));
  await expectEvaluationMode(page);
  await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  await expect(page.getByText('Você ainda não abriu chamados')).toBeVisible();
  await expect(reportButton(page, owned.id)).toHaveCount(0);
  expect(await readReport(page, owned.id)).toEqual(owned);
  await capture(page, testInfo, 'C07-outra-conta-sem-chamado-alheio');
  await page.getByRole('button', { name: 'Reportar problema' }).click();
  await page.getByLabel('Descrição', { exact: true }).fill('Chamado fictício da segunda conta.');
  await page.getByRole('button', { name: 'Enviar chamado', exact: true }).click();
  await expect(page.getByText('1 chamado(s) enviados por você')).toBeVisible();
  const reports = await readSavedReports(page);
  expect(reports).toHaveLength(2);
  const other = reports.find(report => report.id !== owned.id);
  if (!other) throw new Error('Chamado da segunda conta ausente');
  expect(other.ownerId).toBeTruthy();
  expect(other.ownerId).not.toBe(owned.ownerId);
  await expect(reportButton(page, other.id)).toHaveCount(1);
  await expect(reportButton(page, owned.id)).toHaveCount(0);
  await signOut(page);
  await signIn(page, ownerEmail);
  await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  await expect(reportButton(page, owned.id)).toHaveCount(1);
  await expect(reportButton(page, other.id)).toHaveCount(0);
  expect(await readSavedReports(page)).toEqual(reports);
  expect(networkAudit.aiPosts).toBe(0);
  await capture(page, testInfo, 'C07-proprietario-preservado');
});

test('armazenamento cheio mantém o rascunho e as fotos existentes', async ({ page }) => {
  await page.goto('/');
  await signUp(page, fictitiousEmail('quota'));
  const before = await page.evaluate(() => localStorage.getItem('urbaneye.reports.v2'));
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'urbaneye.reports.v2') throw new DOMException('full', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Reportar problema' }).click();
  await page.getByLabel('Descrição', { exact: true }).fill('Não perder este rascunho.');
  await attachWebp(page);
  await page.getByRole('button', { name: 'Enviar chamado', exact: true }).click();
  await expect(page.getByLabel('Descrição', { exact: true })).toHaveValue('Não perder este rascunho.');
  await expect(page.getByRole('alert').first()).toContainText('cheio');
  expect(await page.evaluate(() => localStorage.getItem('urbaneye.reports.v2'))).toBe(before);
});
