# Lote 01 — ajuste da falha E2E

Data: 04/11/2026. Alteração local, sem commit ou publicação.

## Causa confirmada

O chamado **estava presente** na gestão. O lote 01 incluiu `SourceBadge` entre a categoria e o endereço no conteúdo do botão de chamados recentes. Como seu nome acessível deriva desse conteúdo, passou a ser:

```text
Obra Manual local · não verificado em campo Rua de teste, São Paulo Média
```

O localizador antigo, `getByRole('button', { name: /Obra Rua de teste/ })`, exigia a sequência contígua `Obra Rua de teste`, que deixou de existir. A espera terminou no limite de 45 segundos. A falha era no localizador, sem evidência de perda do chamado, falha de persistência ou filtragem indevida pelo modo.

Evidências examinadas em `playwright-falha-01/`, mantidas intactas:

- `test-results/.../error-context.md`: lista o botão com o nome completo acima; painel com total 1, aberto 1 e prioridade média 1.
- `test-results/.../test-failed-1.png`: captura examinada visualmente; mostra um registro aberto e prioridade média. A lista de recentes fica abaixo da área visível, portanto a captura sozinha não mostra o botão.
- `test-results/.../trace.zip`: `test.trace` confirma o timeout na linha 89; `1-trace.trace` registra `call@471` aguardando o localizador antigo e o snapshot do DOM contém os elementos `Obra`, o rótulo de origem e o endereço, nessa ordem. O registro de rede inclui geocodificação e análise de imagem respondidas com status 200 pelos mocks do teste.
- Código atual: `AdminDashboard.tsx` renderiza `SourceBadge` antes do endereço, exatamente como registrado no trace.

A extração resumida do trace está em [lote-01-e2e-ajuste-trace-original.txt](logs/lote-01-e2e-ajuste-trace-original.txt). Antes da correção, foi executado somente o teste afetado, reproduzindo a mesma falha na linha 89: [log de reprodução](logs/lote-01-e2e-ajuste-03-reproducao.txt), [relatório da reprodução](playwright-report-lote-01-ajuste-reproducao/index.html).

## Alterações

| Arquivo | Ajuste desta investigação |
| --- | --- |
| [AdminDashboard.tsx](../../src/components/AdminDashboard.tsx) | Acrescenta `data-testid` com o ID do chamado ao botão de cada registro recente. |
| [MyReports.tsx](../../src/components/MyReports.tsx) | Acrescenta o mesmo identificador ao botão do chamado na lista do proprietário. |
| [urbaneye.spec.ts](../../e2e/urbaneye.spec.ts) | Captura o ID persistido do chamado criado; usa esse ID nas três aberturas do registro e em todas as consultas posteriores ao armazenamento. |

O teste confirma que existe exatamente um registro após o envio no contexto isolado, que seu ID é não vazio e que pertence ao ID da sessão cidadã cadastrada no início. Confere também descrição aceita da IA, categoria, endereço, procedência, status inicial e prioridade inicial. O botão é localizado pela interseção do papel `button` com `data-testid="report-<ID criado>"`, exigindo uma única correspondência após a recarga e nas trocas de conta. Nenhuma seleção usa `.first()`, posição, apenas categoria ou primeiro registro com proprietário para identificar o chamado.

```ts
const createdButton = page.getByRole('button')
  .and(page.getByTestId(`report-${created.id}`));
await expect(createdButton).toHaveCount(1);
await createdButton.click();
```

O rótulo de procedência e o nome acessível continuam disponíveis. O teste também verifica a presença do rótulo na lista cidadã e na gestão. O ajuste não depende da posição desse rótulo no nome acessível.

Todas as asserções anteriores foram mantidas. Foram acrescentadas verificações do registro exato para prioridade crítica, estado resolvido com confirmação pendente e data de resolução, preservação do proprietário e contestação com reabertura. O final continua exigindo retorno a atendimento, prioridade crítica, foto JPEG e ausência de erros JavaScript. Os outros testes continuam verificando isolamento entre contas e preservação de rascunho/fotos quando o armazenamento está cheio.

A função de leitura por ID lança erro explícito se o chamado desaparecer. Isso também resolve a possibilidade de `undefined` apontada pela checagem TypeScript estrita na primeira versão do ajuste.

## Execuções e resultados

Primeiro foi reproduzido o teste afetado sem alteração. Depois da correção e do ajuste de tipagem, o teste afetado passou novamente; só então foi executada a suíte completa. Os builds de produção fazem parte de `npm.cmd run test:e2e` e passaram nas execuções efetivas.

| Verificação | Resultado | Log |
| --- | --- | --- |
| Reprodução, somente `--grep cadastro`, antes da correção | 1 falhou, mesmo timeout de 45 s na linha 89; saída 1 | [03-reproducao](logs/lote-01-e2e-ajuste-03-reproducao.txt) |
| Teste afetado após o primeiro ajuste | 1 aprovado; saída 0 | [04-afetado](logs/lote-01-e2e-ajuste-04-afetado.txt) |
| TypeScript intermediário | Detectou possibilidade de `saved` indefinido; corrigida antes da validação final | [05-typecheck](logs/lote-01-e2e-ajuste-05-typecheck.txt) |
| Teste afetado com o código final | **1 aprovado**, 13,8 s de teste, 18,1 s de execução Playwright; saída 0 | [08-afetado-final](logs/lote-01-e2e-ajuste-08-afetado-final.txt) |
| `npm.cmd run typecheck`, código final | Aprovado, incluindo a especificação E2E pelo `tsconfig.node.json`; saída 0 | [09-typecheck-final](logs/lote-01-e2e-ajuste-09-typecheck-final.txt) |
| ESLint nos três arquivos alterados neste ajuste | Sem erros ou avisos; saída 0 | [10-eslint-final](logs/lote-01-e2e-ajuste-10-eslint-final.txt) |
| Suíte E2E completa, código final | **3 aprovados**, 36,7 s de execução Playwright; saída 0 | [11-suite-completa](logs/lote-01-e2e-ajuste-11-suite-completa.txt) |
| Preservação SHA-256 e `git diff --check` | 113 arquivos protegidos idênticos; sem erros de whitespace; saída 0 | [12-preservacao-final](logs/lote-01-e2e-ajuste-12-preservacao-final.txt) |

Comandos E2E finais, executados na raiz do projeto com `PLAYWRIGHT_HTML_OPEN=never` e pastas de relatório próprias:

```powershell
npm.cmd run test:e2e -- --grep cadastro --reporter=list,html --trace=on --output=documentacao/02-correcoes/test-results-lote-01-ajuste-afetado-final
npm.cmd run test:e2e -- --reporter=list,html --trace=on --output=documentacao/02-correcoes/test-results-lote-01-ajuste
```

O limite do teste permanece em **45.000 ms**; a configuração Playwright não foi alterada. Não houve teste ignorado, remoção de asserções, repetição automática para mascarar falhas ou alteração de dependências.

As interceptações de rede existentes foram preservadas: apenas `127.0.0.1` segue para o servidor local; a análise de imagem, o Nominatim e os tiles OpenStreetMap recebem respostas simuladas; demais destinos são abortados. As execuções usam contextos isolados do Playwright, sem chamadas reais à IA ou alterações em serviços remotos.

## Artefatos e preservação

- [Relatório HTML final solicitado](playwright-report-lote-01-ajuste/index.html), com os três testes e traces anexados.
- [Relatório do teste afetado final](playwright-report-lote-01-ajuste-afetado-final/index.html).
- Novas evidências da suíte em `test-results-lote-01-ajuste/`: `.last-run.json` com `status: passed` e nenhuma falha, trace dos três testes e `chamado-revisado.png`. A captura final foi examinada e mostra a contestação, o retorno a atendimento, a prioridade crítica e a procedência manual local.
- Reprodução e execuções intermediárias têm pastas próprias; as evidências finais não sobrescrevem as anteriores.
- Todos os novos logs usam o prefixo `lote-01-e2e-ajuste` em `logs/`. Os logs textuais desta investigação foram normalizados para UTF-8, preservando sua saída.
- O [manifesto inicial de hashes](logs/lote-01-e2e-ajuste-preservacao-antes.json) inclui todos os arquivos preexistentes de `documentacao/`, `package.json`, os três arquivos de lock e `playwright.config.ts`. A especificação E2E também foi registrada no manifesto como arquivo que seria alterado; ela foi excluída da comparação dos 113 arquivos protegidos.

Tentativas de ambiente também foram registradas: `01-reproducao` não iniciou a execução devido à combinação inválida de parâmetros de `Tee-Object`; `02-reproducao` parou no build por acesso negado do ambiente restrito. A reprodução válida e os E2E seguintes rodaram com permissão fora desse ambiente, mantendo os mocks. Os logs `06-eslint` e `07-typecheck-spec` registram verificações intermediárias aprovadas. Essas tentativas não são contadas como aprovação E2E.

As alterações anteriores do workspace foram preservadas. Não houve instalação, atualização de dependências, commit ou publicação.
