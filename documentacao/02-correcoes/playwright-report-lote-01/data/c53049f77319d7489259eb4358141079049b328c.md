# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: urbaneye.spec.ts >> cadastro → WebP/IA → persistência → gestão → contestação
- Location: e2e\urbaneye.spec.ts:61:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Obra Rua de teste/ })

```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - generic [ref=f1e2]:
    - region "Notifications (F8)":
      - list
    - region "Notifications alt+T"
    - generic [ref=f1e3]:
      - banner [ref=f1e4]:
        - generic [ref=f1e5]:
          - generic [ref=f1e11]:
            - heading "UrbanEye" [level=1] [ref=f1e12]
            - paragraph [ref=f1e13]: Gestão urbana
          - generic [ref=f1e14]: GPS ativo
        - button "Avaliação local · 1 registro(s) · Dados não verificados em campo · Configurar no Perfil" [ref=f1e20] [cursor=pointer]
      - generic [ref=f1e22]:
        - generic [ref=f1e23]:
          - heading "Gestão urbana" [level=2] [ref=f1e24]
          - paragraph [ref=f1e25]: Análise dos chamados do modo selecionado · uso local
        - generic [ref=f1e26]: Região Zona Leste concentra o maior volume de problemas (1)
        - generic [ref=f1e32]:
          - generic [ref=f1e33]:
            - generic [ref=f1e36]: "1"
            - generic [ref=f1e37]: Total
          - generic [ref=f1e38]:
            - generic [ref=f1e41]: "1"
            - generic [ref=f1e42]: Abertos
          - generic [ref=f1e43]:
            - generic [ref=f1e47]: "0"
            - generic [ref=f1e48]: Em análise
          - generic [ref=f1e49]:
            - generic [ref=f1e52]: "0"
            - generic [ref=f1e53]: Atendimento
          - generic [ref=f1e54]:
            - generic [ref=f1e58]: "0"
            - generic [ref=f1e59]: Resolvidos
          - generic [ref=f1e60]:
            - generic [ref=f1e63]: "0"
            - generic [ref=f1e64]: Críticos
        - generic [ref=f1e65]:
          - heading "Chamados por prioridade" [level=3] [ref=f1e66]
          - generic [ref=f1e67]:
            - generic [ref=f1e68]:
              - generic [ref=f1e69]: Baixa
              - generic [ref=f1e71]: "0"
            - generic [ref=f1e72]:
              - generic [ref=f1e73]: Média
              - generic [ref=f1e75]: "1"
            - generic [ref=f1e76]:
              - generic [ref=f1e77]: Alta
              - generic [ref=f1e79]: "0"
            - generic [ref=f1e80]:
              - generic [ref=f1e81]: Crítica
              - generic [ref=f1e83]: "0"
          - generic [ref=f1e86]:
            - generic [ref=f1e87]: "Críticos em aberto: 0"
            - generic [ref=f1e88]: "Alta em aberto: 0"
            - generic [ref=f1e89]: "Aguardando confirmação: 0"
            - generic [ref=f1e90]: "Contestados: 0"
        - generic [ref=f1e95]:
          - paragraph [ref=f1e96]: Tempo médio de resolução
          - paragraph [ref=f1e97]: —
        - generic [ref=f1e98]:
          - heading "Chamados por tipo" [level=3] [ref=f1e99]
          - img [ref=f1e102]:
            - generic [ref=f1e106]:
              - generic [ref=f1e107]: Acidente
              - generic [ref=f1e109]: Obra
              - generic [ref=f1e111]: Iluminação
              - generic [ref=f1e113]: Trânsito
            - generic [ref=f1e116]:
              - generic [ref=f1e117]: "0"
              - generic [ref=f1e119]: "1"
              - generic [ref=f1e121]: "2"
              - generic [ref=f1e123]: "3"
              - generic [ref=f1e125]: "4"
        - generic [ref=f1e132]:
          - heading "Chamados por gravidade" [level=3] [ref=f1e133]
          - generic [ref=f1e141]:
            - generic [ref=f1e142]: Grave (0)
            - generic [ref=f1e144]: Médio (1)
            - generic [ref=f1e146]: Normal (0)
        - generic [ref=f1e148]:
          - heading "Evolução dos chamados (14 dias)" [level=3] [ref=f1e149]
          - img [ref=f1e152]:
            - generic [ref=f1e156]:
              - generic [ref=f1e157]: 22/10
              - generic [ref=f1e159]: 25/10
              - generic [ref=f1e161]: 28/10
              - generic [ref=f1e163]: 31/10
              - generic [ref=f1e165]: 03/11
            - generic [ref=f1e168]:
              - generic [ref=f1e169]: "0"
              - generic [ref=f1e171]: "1"
              - generic [ref=f1e173]: "2"
              - generic [ref=f1e175]: "3"
              - generic [ref=f1e177]: "4"
        - generic [ref=f1e181]:
          - heading "Problemas mais recorrentes" [level=3] [ref=f1e182]
          - list [ref=f1e183]:
            - listitem [ref=f1e184]:
              - generic [ref=f1e185]: "1"
              - generic [ref=f1e186]: Obra
              - generic [ref=f1e187]: "1"
            - listitem [ref=f1e188]:
              - generic [ref=f1e189]: "2"
              - generic [ref=f1e190]: Acidente
              - generic [ref=f1e191]: "0"
            - listitem [ref=f1e192]:
              - generic [ref=f1e193]: "3"
              - generic [ref=f1e194]: Iluminação
              - generic [ref=f1e195]: "0"
            - listitem [ref=f1e196]:
              - generic [ref=f1e197]: "4"
              - generic [ref=f1e198]: Trânsito
              - generic [ref=f1e199]: "0"
        - generic [ref=f1e200]:
          - heading "Ranking de regiões" [level=3] [ref=f1e201]
          - list [ref=f1e205]:
            - listitem [ref=f1e206]:
              - generic [ref=f1e207]:
                - generic [ref=f1e208]: "1"
                - generic [ref=f1e209]: Zona Leste
                - generic [ref=f1e210]: 1 chamados
              - paragraph [ref=f1e213]: "Tempo médio: —"
        - generic [ref=f1e214]:
          - heading "Chamados recentes" [level=3] [ref=f1e215]
          - generic [ref=f1e216]:
            - button "Todas" [ref=f1e217] [cursor=pointer]
            - button "Baixa" [ref=f1e218] [cursor=pointer]
            - button "Média" [ref=f1e219] [cursor=pointer]
            - button "Alta" [ref=f1e220] [cursor=pointer]
            - button "Crítica" [ref=f1e221] [cursor=pointer]
          - list [ref=f1e222]:
            - listitem [ref=f1e223]:
              - button "Obra Manual local · não verificado em campo Rua de teste, São Paulo Média" [ref=f1e224] [cursor=pointer]:
                - generic [ref=f1e225]:
                  - generic [ref=f1e226]: Obra
                  - generic [ref=f1e227]: Manual local · não verificado em campo
                  - generic [ref=f1e228]: Rua de teste, São Paulo
                - generic [ref=f1e229]: Média
        - generic [ref=f1e232]:
          - generic [ref=f1e233]:
            - heading "Mapa dos chamados" [level=3] [ref=f1e234]
            - generic [ref=f1e239]:
              - button "Calor" [ref=f1e240] [cursor=pointer]
              - button "Pontos" [ref=f1e241] [cursor=pointer]
          - generic [ref=f1e244]:
            - link "Leaflet" [ref=f1e245] [cursor=pointer]:
              - /url: https://leafletjs.com
            - text: "| ©"
            - link "OpenStreetMap contributors" [ref=f1e250] [cursor=pointer]:
              - /url: https://www.openstreetmap.org/copyright
      - navigation [ref=f1e251]:
        - generic [ref=f1e252]:
          - button "Mapa" [ref=f1e253] [cursor=pointer]
          - button "Chamados" [ref=f1e257] [cursor=pointer]
          - button "Gestão" [active] [ref=f1e262] [cursor=pointer]
          - button "Perfil" [ref=f1e266] [cursor=pointer]
  - generic [aria-hidden] [ref=f1e271]: "3"
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | const password = 'demo-test-123';
  4   | const aiResult = {
  5   |   promptVersion: 'urbaneye-image-triage-v1', model: 'test-model', analyzedAt: '2026-09-14T12:00:00Z',
  6   |   hasUrbanIssue: true, suggestedType: 'obra', suggestedSeverity: 'warning', confidence: 0.9,
  7   |   title: 'Buraco no asfalto', descriptionSuggestion: 'Buraco visível no pavimento da rua.',
  8   |   visibleEvidence: ['Pavimento irregular'], riskFlags: [], needsHumanReview: false,
  9   | };
  10  | 
  11  | test.beforeEach(async ({ context }) => {
  12  |   await context.grantPermissions(['geolocation']);
  13  |   await context.setGeolocation({ latitude: -23.55052, longitude: -46.63331 });
  14  |   // All external calls are intercepted: tests never send photos, spend quota,
  15  |   // change cloud data or touch a user's real browser profile.
  16  |   await context.route('**/*', async route => {
  17  |     const url = new URL(route.request().url());
  18  |     if (url.hostname === '127.0.0.1') return route.continue();
  19  |     if (url.pathname.endsWith('/functions/v1/analyze-urban-image')) {
  20  |       if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: {
  21  |         'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS',
  22  |       } });
  23  |       const body = route.request().postDataJSON();
  24  |       expect(body.image).toMatch(/^data:image\/jpeg;base64,/);
  25  |       return route.fulfill({ json: aiResult, headers: { 'access-control-allow-origin': '*' } });
  26  |     }
  27  |     if (url.hostname === 'nominatim.openstreetmap.org') return route.fulfill({ json: { address: { road: 'Rua de teste', city: 'São Paulo' } } });
  28  |     if (url.hostname === 'tile.openstreetmap.org') return route.fulfill({
  29  |       contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jMioAAAAASUVORK5CYII=', 'base64'),
  30  |     });
  31  |     return route.abort();
  32  |   });
  33  | });
  34  | 
  35  | async function signUp(page: Page, email: string, admin = false) {
  36  |   await page.getByRole('button', { name: 'Criar conta', exact: true }).first().click();
  37  |   if (admin) await page.getByRole('button', { name: /Administrador Gestão/ }).click();
  38  |   await page.getByLabel('Nome', { exact: true }).fill(admin ? 'Gestor Teste' : 'Cidadão Teste');
  39  |   await page.getByLabel('E-mail', { exact: true }).fill(email);
  40  |   await page.getByLabel('Senha', { exact: true }).fill(password);
  41  |   await page.locator('button[type="submit"]').click();
  42  |   await expect(page.getByRole('navigation')).toBeVisible();
  43  | }
  44  | 
  45  | async function signOut(page: Page) {
  46  |   await page.getByRole('button', { name: 'Perfil', exact: true }).click();
  47  |   await page.getByRole('button', { name: 'Sair da conta' }).click();
  48  |   await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible();
  49  | }
  50  | 
  51  | async function attachWebp(page: Page) {
  52  |   const data = await page.evaluate(() => {
  53  |     const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32;
  54  |     const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#888'; ctx.fillRect(0, 0, 32, 32);
  55  |     return canvas.toDataURL('image/webp').split(',')[1];
  56  |   });
  57  |   await page.getByLabel('Foto da galeria').setInputFiles({ name: 'rua.webp', mimeType: 'image/webp', buffer: Buffer.from(data, 'base64') });
  58  |   await expect(page.getByRole('button', { name: 'Analisar foto com IA' })).toBeVisible();
  59  | }
  60  | 
  61  | test('cadastro → WebP/IA → persistência → gestão → contestação', async ({ page }, testInfo) => {
  62  |   const errors: string[] = [];
  63  |   page.on('pageerror', error => errors.push(error.message));
  64  |   await page.goto('/');
  65  |   await signUp(page, 'citizen@example.com');
  66  |   await expect(page.locator('.leaflet-container')).toBeVisible();
  67  |   await page.getByRole('button', { name: 'Reportar problema' }).click();
  68  |   await expect(page.getByRole('dialog', { name: 'Novo chamado' })).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.85)');
  69  |   await page.getByLabel('Descrição', { exact: true }).fill('Minha descrição anterior.');
  70  |   await attachWebp(page);
  71  |   await page.getByRole('button', { name: 'Analisar foto com IA' }).click();
  72  |   await page.getByRole('button', { name: 'Usar sugestão e revisar' }).click();
  73  |   await page.getByRole('button', { name: 'Substituir pela descrição da IA' }).click();
  74  |   await expect(page.getByLabel('Descrição', { exact: true })).toHaveValue(aiResult.descriptionSuggestion);
  75  |   await page.getByRole('button', { name: 'Enviar chamado', exact: true }).click();
  76  |   await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  77  |   await expect(page.getByText('1 chamado(s) enviados por você')).toBeVisible();
  78  |   await page.reload();
  79  |   await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  80  |   await page.getByRole('button', { name: /Obra/ }).click();
  81  |   await expect(page.getByText('Sugestão aceita pelo cidadão.')).toBeVisible();
  82  |   await expect(page.getByRole('button', { name: 'Ampliar foto do chamado' })).toBeVisible();
  83  |   await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  84  |   await signOut(page);
  85  |   await signUp(page, 'admin@example.com', true);
  86  |   await page.getByRole('button', { name: 'Gestão', exact: true }).click();
  87  |   await expect(page.getByText('Chamados por prioridade', { exact: true })).toBeVisible();
  88  |   await expect(page.locator('.recharts-wrapper').first()).toBeVisible();
> 89  |   await page.getByRole('button', { name: /Obra Rua de teste/ }).click();
      |                                                                 ^ Error: locator.click: Test timeout of 45000ms exceeded.
  90  |   await page.getByRole('dialog', { name: 'Detalhes do chamado' }).getByRole('button', { name: 'Crítica', exact: true }).click();
  91  |   await page.getByRole('button', { name: 'Marcar como resolvido' }).click();
  92  |   await expect(page.getByText('Aguardando confirmação do cidadão.', { exact: true })).toBeVisible();
  93  |   await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  94  |   await signOut(page);
  95  |   await page.getByLabel('E-mail', { exact: true }).fill('citizen@example.com');
  96  |   await page.getByLabel('Senha', { exact: true }).fill(password);
  97  |   await page.locator('button[type="submit"]').click();
  98  |   await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  99  |   await page.getByRole('button', { name: /Obra/ }).click();
  100 |   await page.getByRole('button', { name: 'Não, ainda não' }).click();
  101 |   await expect(page.getByText(/Cidadão informou que o problema ainda não foi resolvido/)).toBeVisible();
  102 |   const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('urbaneye.reports.v2')!).find((r: { ownerId?: string }) => r.ownerId));
  103 |   expect(saved.status).toBe('atendimento');
  104 |   expect(saved.priority).toBe('critica');
  105 |   expect(saved.photo).toMatch(/^data:image\/jpeg/);
  106 |   expect(errors).toEqual([]);
  107 |   await page.screenshot({ path: testInfo.outputPath('chamado-revisado.png'), animations: 'disabled' });
  108 | });
  109 | 
  110 | test('outra conta não recebe os chamados como próprios', async ({ page }) => {
  111 |   await page.goto('/');
  112 |   await signUp(page, 'owner@example.com');
  113 |   await page.getByRole('button', { name: 'Reportar problema' }).click();
  114 |   await page.getByLabel('Descrição', { exact: true }).fill('Chamado da primeira conta.');
  115 |   await page.getByRole('button', { name: 'Enviar chamado', exact: true }).click();
  116 |   await signOut(page);
  117 |   await signUp(page, 'other@example.com');
  118 |   await page.getByRole('button', { name: 'Meus chamados', exact: true }).click();
  119 |   await expect(page.getByText('Você ainda não abriu chamados')).toBeVisible();
  120 | });
  121 | 
  122 | test('armazenamento cheio mantém o rascunho e as fotos existentes', async ({ page }) => {
  123 |   await page.goto('/');
  124 |   await signUp(page, 'quota@example.com');
  125 |   const before = await page.evaluate(() => localStorage.getItem('urbaneye.reports.v2'));
  126 |   await page.evaluate(() => {
  127 |     const original = Storage.prototype.setItem;
  128 |     Storage.prototype.setItem = function(key, value) {
  129 |       if (key === 'urbaneye.reports.v2') throw new DOMException('full', 'QuotaExceededError');
  130 |       return original.call(this, key, value);
  131 |     };
  132 |   });
  133 |   await page.getByRole('button', { name: 'Reportar problema' }).click();
  134 |   await page.getByLabel('Descrição', { exact: true }).fill('Não perder este rascunho.');
  135 |   await attachWebp(page);
  136 |   await page.getByRole('button', { name: 'Enviar chamado', exact: true }).click();
  137 |   await expect(page.getByLabel('Descrição', { exact: true })).toHaveValue('Não perder este rascunho.');
  138 |   await expect(page.getByRole('alert').first()).toContainText('cheio');
  139 |   expect(await page.evaluate(() => localStorage.getItem('urbaneye.reports.v2'))).toBe(before);
  140 | });
  141 | 
```