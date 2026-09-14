import { test, expect, type Page } from '@playwright/test';

const password = 'demo-test-123';
const aiResult = {
  promptVersion: 'urbaneye-image-triage-v1', model: 'test-model', analyzedAt: '2026-09-14T12:00:00Z',
  hasUrbanIssue: true, suggestedType: 'obra', suggestedSeverity: 'warning', confidence: 0.9,
  title: 'Buraco no asfalto', descriptionSuggestion: 'Buraco visível no pavimento da rua.',
  visibleEvidence: ['Pavimento irregular'], riskFlags: [], needsHumanReview: false,
};

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: -23.55052, longitude: -46.63331 });
  // All external calls are intercepted: tests never send photos, spend quota,
  // change cloud data or touch a user's real browser profile.
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (url.pathname.endsWith('/functions/v1/analyze-urban-image')) {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: {
        'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS',
      } });
      const body = route.request().postDataJSON();
      expect(body.image).toMatch(/^data:image\/jpeg;base64,/);
      return route.fulfill({ json: aiResult, headers: { 'access-control-allow-origin': '*' } });
    }
    if (url.hostname === 'nominatim.openstreetmap.org') return route.fulfill({ json: { address: { road: 'Rua de teste', city: 'São Paulo' } } });
    if (url.hostname.endsWith('cartocdn.com')) return route.fulfill({
      contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jMioAAAAASUVORK5CYII=', 'base64'),
    });
    return route.abort();
  });
});

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

test('cadastro → WebP/IA → persistência → gestão → contestação', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await signUp(page, 'citizen@example.com');
  await expect(page.locator('.leaflet-container')).toBeVisible();
  await page.getByRole('button', { name: 'Reportar problema' }).click();
  await expect(page.getByRole('dialog', { name: 'Novo chamado' })).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.85)');
  await page.getByLabel('Descrição', { exact: true }).fill('Minha descrição anterior.');
  await attachWebp(page);
  await page.getByRole('button', { name: 'Analisar foto com IA' }).click();
  await page.getByRole('button', { name: 'Usar sugestão e revisar' }).click();
  await page.getByRole('button', { name: 'Substituir pela descrição da IA' }).click();
  await expect(page.getByLabel('Descrição', { exact: true })).toHaveValue(aiResult.descriptionSuggestion);
  await page.getByRole('button', { name: 'Enviar chamado', exact: true }).click();
  await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  await expect(page.getByText('1 chamado(s) enviados por você')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  await page.getByRole('button', { name: /Obra/ }).click();
  await expect(page.getByText('Sugestão aceita pelo cidadão.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ampliar foto do chamado' })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await signOut(page);
  await signUp(page, 'admin@example.com', true);
  await page.getByRole('button', { name: 'Gestão', exact: true }).click();
  await expect(page.getByText('Chamados por prioridade', { exact: true })).toBeVisible();
  await expect(page.locator('.recharts-wrapper').first()).toBeVisible();
  await page.getByRole('button', { name: /Obra Rua de teste/ }).click();
  await page.getByRole('dialog', { name: 'Detalhes do chamado' }).getByRole('button', { name: 'Crítica', exact: true }).click();
  await page.getByRole('button', { name: 'Marcar como resolvido' }).click();
  await expect(page.getByText('Aguardando confirmação do cidadão.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await signOut(page);
  await page.getByLabel('E-mail', { exact: true }).fill('citizen@example.com');
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.locator('button[type="submit"]').click();
  await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  await page.getByRole('button', { name: /Obra/ }).click();
  await page.getByRole('button', { name: 'Não, ainda não' }).click();
  await expect(page.getByText(/Cidadão informou que o problema ainda não foi resolvido/)).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('urbaneye.reports.v2')!).find((r: { ownerId?: string }) => r.ownerId));
  expect(saved.status).toBe('atendimento');
  expect(saved.priority).toBe('critica');
  expect(saved.photo).toMatch(/^data:image\/jpeg/);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('chamado-revisado.png'), animations: 'disabled' });
});

test('outra conta não recebe os chamados como próprios', async ({ page }) => {
  await page.goto('/');
  await signUp(page, 'owner@example.com');
  await page.getByRole('button', { name: 'Reportar problema' }).click();
  await page.getByLabel('Descrição', { exact: true }).fill('Chamado da primeira conta.');
  await page.getByRole('button', { name: 'Enviar chamado', exact: true }).click();
  await signOut(page);
  await signUp(page, 'other@example.com');
  await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  await expect(page.getByText('Você ainda não abriu chamados')).toBeVisible();
});

test('armazenamento cheio mantém o rascunho e as fotos existentes', async ({ page }) => {
  await page.goto('/');
  await signUp(page, 'quota@example.com');
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
