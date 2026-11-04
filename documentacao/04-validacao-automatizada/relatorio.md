# Validação automatizada do fluxo funcional do piloto

Data: 04/11/2026. **Execução automatizada, sem participantes humanos.** A suíte completa passou com **4 testes, 0 falhas, 0 ignorados e 0 testes instáveis**, sem retries. O CSV contém os sete cenários solicitados e duas regressões adicionais, derivados do JSON do Playwright.

## Referências e critérios de correção

Foram lidos o [roteiro da avaliação](../03-avaliacao-usuarios/roteiro.md), as [notas do piloto](../03-avaliacao-usuarios/notas-piloto.md) e os E2E existentes. As notas identificam um piloto por integrante da equipe, fora da amostra de participantes. Seus relatos não foram convertidos em dados automatizados ou respostas de participantes.

O piloto serviu de referência para a sequência de ações. Os resultados esperados foram conferidos com os objetivos T01–T05, a intervenção F01, os requisitos desta validação e o código de cadastro, criação, propriedade e transições. O cadastro deve produzir uma conta cidadã distinta; o chamado manual em Avaliação local deve manter proprietário e procedência, sobreviver à nova entrada, passar pela atualização administrativa e permitir contestação pelo proprietário. Outra conta não deve listá-lo como próprio.

Não se adotou automaticamente toda saída atual como correta. Em particular, a localização indeterminada descrita no piloto não foi tratada como GPS validado, e a indicação visual “GPS ativo” não é uma comprovação de precisão. Valores exatos da localização automatizada e a descrição da IA pertencem aos mocks. A prioridade inicial média para Obra e sua alteração para crítica foram mantidas como verificações de regressão das regras já existentes, sem atribuir validade técnica municipal a essa classificação.

## Ampliação dos testes

O [arquivo E2E existente](../../e2e/urbaneye.spec.ts) foi ampliado, sem criar outra cópia do ciclo completo. A mesma implementação de cadastro, criação, recarga, login, atualização e contestação agora recebe duas variantes:

- **Piloto manual:** descrição fictícia com marcador exclusivo, categoria Obra escolhida pela interface, sem foto e sem solicitar análise por IA. Também verifica a recusa de descrição vazia.
- **Regressão WebP/IA:** preserva a conversão de WebP para JPEG, aceitação da descrição fixa de IA, persistência da foto, prioridade e contestação. A resposta é simulada integralmente.

O teste de propriedade existente foi reforçado: identifica o ID da primeira conta, verifica sua ausência na lista da segunda, cria um chamado da segunda e confirma isolamento bidirecional sem apagar os dois registros. O teste de armazenamento cheio mantém suas asserções anteriores de rascunho, snapshot preservado e erro visível.

Os localizadores dos chamados usam o ID persistido e o papel de botão, com exigência de uma correspondência. Nenhuma seleção depende de nome acessível contíguo, posição na lista ou apenas categoria. O conteúdo e o status exibidos também são conferidos; ler localStorage sozinho não constitui aprovação. O ID é capturado depois de criar o chamado pela interface, não é injetado para simular sucesso.

A intervenção F01 está identificada como C05: a automação alterna para uma conta administrativa fictícia, exercita também o login administrativo, localiza o mesmo chamado por ID, altera prioridade para crítica, passa a Em atendimento e marca a resolução. Depois, C06 retorna à conta proprietária para contestar. Não há participante nem medição de ajuda de navegação nessa execução.

A [configuração Playwright](../../playwright.config.ts) recebeu somente `serviceWorkers: 'block'`, para evitar que um service worker contorne a interceptação de rede. O limite por teste continua **45.000 ms** e o do servidor **30.000 ms**. Não houve retirada de asserções, testes ignorados ou aumento de timeout.

## Cenários: esperado e obtido

Os IDs C01–C06 são etapas sequenciais do mesmo teste manual. C07 é o teste de propriedade. R01 e R02 são regressões. Portanto, **nove linhas de cenário não equivalem a nove testes independentes**, nove pessoas ou nove sessões de avaliação de usabilidade.

| ID | Resultado esperado | Resultado obtido na suíte completa |
| --- | --- | --- |
| C01 | Conta cidadã fictícia exclusiva, sessão iniciada e sem acesso à gestão. | Aprovado. E-mail exclusivo, papel cidadão, ID de sessão e ausência da função Gestão verificados. |
| C02 | Descrição obrigatória; chamado Obra em Avaliação local, com proprietário, procedência manual e sem IA/conjunto fixo. | Aprovado. Descrição vazia recusada; único chamado salvo com dados esperados, `manual_local`, sem foto, `aiAnalysis` ou `datasetVersion`; zero solicitações de análise. |
| C03 | Encontrar pelo ID após recarga; conferir conteúdo, procedência e status Aberto. | Aprovado. Botão único, descrição e status exibidos; registro persistido integralmente igual ao criado. |
| C04 | Logout e login da mesma conta preservam ID, conteúdo, proprietário e andamento. | Aprovado. Sessão removida ao sair; nova autenticação reencontrou o mesmo registro Aberto, sem mudança de conteúdo. |
| C05 | Administrador atualiza o mesmo chamado para atendimento e resolução, aguardando confirmação. | Aprovado. Estados exibidos e persistidos conferidos; resolução pendente com data, prioridade crítica e proprietário preservado. |
| C06 | Proprietário contesta; chamado reabre em atendimento. | Aprovado. Mensagem de contestação, `confirmation=contestado`, `reopened=true`, atendimento e ausência de `resolvedAt` atual verificados; proprietário, descrição e prioridade preservados. |
| C07 | Outra conta não recebe o chamado como próprio; registros de ambas continuam salvos. | Aprovado. Segunda conta inicialmente sem chamados próprios; depois, cada conta visualizou apenas seu ID, com proprietários distintos e snapshot preservado. |
| R01 | WebP/IA simulada continua funcionando com persistência da foto e ciclo administrativo. | Aprovado. Foto JPEG, sugestão fixa aceita, prioridade e contestação verificadas; uma solicitação atendida pelo mock. |
| R02 | Armazenamento cheio mantém rascunho e snapshot anterior e informa erro. | Aprovado. `QuotaExceededError` simulado; descrição e snapshot preservados, com alerta visível. |

O [CSV de resultados automatizados](resultados-automatizados.csv) registra uma linha por cenário, com `tipo_execucao=automatizada_playwright`, esperado, obtido, status, teste correspondente e caminhos de evidência. Sua fonte é o [JSON completo da suíte](logs/playwright-suite-01.json); o [resumo estruturado](logs/resumo-cenarios.json) preserva a correspondência. Durações são tempos **automatizados em milissegundos**, lidos do Playwright. Não são tempos humanos, notas de utilidade ou medidas de dificuldade de uso. C01–C06 usam a duração da etapa; C07/R01/R02 usam a do teste correspondente.

## Execuções, falhas e verificações

Primeiro foi executado somente o fluxo manual ampliado. Após sua aprovação, foi executada a suíte completa com os quatro testes. Não houve falha nas asserções nem necessidade de corrigir a aplicação. A observação visual OBS-01 abaixo permanece fora dessa cobertura; a aprovação funcional não estabelece ausência de outros defeitos.

| Execução | Resultado | Saída completa |
| --- | --- | --- |
| `npm.cmd run typecheck` | Aprovado, saída 0. Inclui a especificação E2E pelo `tsconfig.node.json`. | [typecheck-01.txt](logs/typecheck-01.txt) |
| ESLint na especificação e configuração alteradas | Sem erros ou avisos; saída 0. | [eslint-01.txt](logs/eslint-01.txt) |
| E2E focado no piloto manual | 1 aprovado; teste 17.803 ms; execução Playwright 21,5 s; saída 0. | [e2e-manual-01.txt](logs/e2e-manual-01.txt) |
| Suíte E2E completa | 4 aprovados; 0 falhas/ignorados/instáveis; saída 0. | [e2e-suite-01.txt](logs/e2e-suite-01.txt) |
| Build de produção | Aprovado em ambas as execuções E2E; faz parte de `test:e2e`. | Logs E2E acima. |
| Exportação dos resultados | 9 cenários aprovados, derivados do JSON; saída 0. | [exportacao-resultados-01.txt](logs/exportacao-resultados-01.txt) |
| Preservação | 330 arquivos protegidos idênticos por SHA-256. | [preservacao-final.json](logs/preservacao-final.json) |

A suíte começou em **04/11/2026 às 16:07:15.087 UTC** (13:07:15.087 em America/Sao_Paulo). O JSON informa duração total do Playwright de **64.344,286 ms**, incluindo a execução do runner e encerramento; o build anterior está registrado separadamente no log. Não há erro de execução registrado no JSON. Os avisos de `NO_COLOR`/`FORCE_COLOR` nos logs são avisos do ambiente, sem falha de teste.

As condições negativas exercitadas intencionalmente são a validação de descrição vazia em C02 e a falha técnica de quota em R02; ambas tiveram o tratamento esperado. Não foram classificadas como defeitos corrigidos. A aplicação não recebeu alterações neste trabalho. Se uma futura execução revelar defeito, seu erro, trace e esperado devem ser registrados antes de alterar o produto; não substituir a expectativa apenas para acompanhar a implementação.

**OBS-01 — notificação anterior após troca de conta:** na [captura C07](evidencias/C07-outra-conta.png), a segunda conta está corretamente sem chamados próprios, mas ainda aparece o aviso transitório “Chamado aberto com sucesso”, referente ao cadastro da primeira conta. É uma possível inconsistência de contexto das notificações, registrada antes de qualquer correção. A causa e a duração não foram investigadas; não houve correção nem nova asserção para considerar essa notificação correta. C07 aprova exclusivamente a propriedade e preservação dos registros, e não o ciclo de vida das notificações.

## Ambiente e identificação da versão

| Item | Valor desta execução |
| --- | --- |
| Sistema | Windows, `win32`, versão 10.0.19045, x64 |
| Node / npm | v24.15.0 / 12.0.2 |
| Playwright instalado | 1.63.0 |
| Vite instalado | 6.4.3 |
| Navegador | Microsoft Edge, canal `msedge`, versão 147.0.3912.72, headless |
| Janela / concorrência | 1280 × 900; 1 worker |
| Origem | `http://127.0.0.1:8081`, servidor de preview próprio, `reuseExistingServer=false` |
| Retries / repetições | 0 retries; cada teste executado uma vez na suíte completa |
| Branch / HEAD | `validacao-academica` / `e2b857554605d2f6848c6c0227e6a9e64c980efd` |
| Snapshot SHA-256 do código/configuração/dependências testados | `E770FA330351E91963C018CE55D7D0CDF530D464385B9FA3E43584ED4A025D93` |

O workspace já continha alterações locais dos lotes anteriores. O HEAD, isoladamente, não representa a versão executada. [versao-testada.json](logs/versao-testada.json) registra os hashes dos arquivos considerados no snapshot, ambiente e estatísticas. O identificador do snapshot corresponde ao SHA-256 da lista ordenada de caminhos e hashes, conforme registrada. O [diff dos testes e configuração](logs/diff-testes-config.txt) complementa a identificação, incluindo diferenças locais anteriores nesses arquivos.

## Isolamento e serviços simulados

Cada teste usa as fixtures `page` e `context` do Playwright, em um contexto novo e não persistente. Não se conecta ao navegador pessoal, não usa seu diretório de perfil e não altera suas contas ou chamados. Dentro de cada teste, logout/login e troca de contas usam a **mesma origem e o mesmo armazenamento daquele contexto**, sem limpar dados. Isso permite exercitar a persistência e a propriedade previstas no roteiro. Entre testes, os contextos são independentes; isso não deve ser confundido com apagar dados entre participantes de uma coleta humana.

Todos os cadastros são fictícios. Os e-mails usam prefixos do cenário, UUID e domínio `example.com`; nenhum endereço do piloto foi reutilizado. O fluxo manual usa marcador próprio na descrição, e o teste acompanha o chamado por seu ID. Os estados normais são produzidos pela interface, não por injeção direta em localStorage. Somente a regressão de quota substitui `Storage.setItem` no contexto descartável para provocar a falha conhecida.

A interceptação permite rede real apenas para a origem local exata. Geocodificação Nominatim e tiles OpenStreetMap são respondidos localmente; quaisquer outros destinos externos são abortados. O endpoint de análise de imagem também é respondido localmente com objeto fixo. Service workers estão bloqueados para manter essa cobertura.

A [auditoria de rede e ambiente](evidencias/rede-e-ambiente-suite-01.json) foi anexada pelo teste e extraída do JSON:

| Teste | Análises solicitadas e simuladas | Geocodificações simuladas | Tiles simulados |
| --- | --- | --- | --- |
| Piloto manual | 0 | 2 | 336 |
| WebP/IA | 1 | 2 | 336 |
| Propriedade entre contas | 0 | 1 | 162 |
| Quota | 0 | 1 | 54 |

**Não houve chamada real ao Gemini.** A única análise solicitada foi atendida pelo mock da regressão WebP/IA. Os contadores medem solicitações interceptadas, sem validar disponibilidade, qualidade de resposta, consumo ou comportamento dos serviços reais. Os tiles usados são imagens mínimas simuladas; não se valida cartografia real.

A geolocalização também foi simulada em todos os contextos: latitude `-23.55052`, longitude `-46.63331`; o endereço fixo do mock foi “Rua de teste, São Paulo”. Essa condição não valida GPS, não determina a origem do endereço observado no piloto e não testa negação de permissão, precisão, posição padrão ou edição manual de localização.

## Evidências e limites de interpretação

O [relatório HTML completo](playwright-report/index.html) contém os quatro testes, etapas, capturas anexadas, identidades fictícias, auditorias e traces. O [índice de evidências](evidencias/indice.md) liga os quatro traces completos e seis capturas selecionadas. Os originais permanecem em `evidencias/suite-01/`; a execução focada foi preservada em `evidencias/manual-01/` e em seu [relatório próprio](playwright-report-manual-01/index.html).

As capturas selecionadas mostram [criação manual](evidencias/C02-manual.png), [persistência após login](evidencias/C04-persistencia.png), [atendimento](evidencias/C05-atendimento.png), [resolução pendente](evidencias/C05-resolucao.png), [contestação](evidencias/C06-contestacao.png) e [outra conta sem chamado alheio](evidencias/C07-outra-conta.png). São cópias sem edição dos anexos; notificações temporárias podem sobrepor parte do conteúdo. A verificação de um estado depende das asserções e do trace, além da imagem.

Esta rodada verifica comportamento funcional de uma versão local em um navegador e resolução de tela. Não mede compreensão humana, esforço, satisfação, utilidade percebida, intenção de uso ou impacto municipal. Não substitui a avaliação com 5 a 8 pessoas. Também não valida integração remota, uso em dispositivos distintos, concorrência entre abas, segurança de autenticação em produção ou desempenho de serviços externos. O cadastro administrativo livre e o armazenamento compartilhado em localStorage permanecem limitações do protótipo. O teste de propriedade verifica a lista de chamados próprios por conta; não demonstra confidencialidade dos dados do armazenamento compartilhado.

## Participação da IA

A IA, por meio do agente OpenAI Codex, participou da leitura do roteiro/piloto e do código, da manutenção e ampliação dos testes, da preparação dos mocks e dados fictícios, da execução dos comandos e da redação deste relatório. O material automatizado foi organizado com assistência da IA; não foi apresentado como coleta humana.

Durante os testes, quem compara valores e decide aprovação é o **Playwright, com asserções determinísticas**: IDs, papel da conta, presença/ausência de elementos, textos de status, conteúdo persistido, propriedade, campos de resolução, foto e contadores de rede. Nenhum modelo de IA interpreta telas ou atribui notas para decidir aprovação em tempo de execução. A resposta de triagem da regressão é um objeto fixo; seu conteúdo não é uma inferência real do Gemini. A IA auxiliou na escolha e implementação das asserções, o que continua sujeito à revisão dos requisitos e dos limites de cobertura.

## Reprodução e preservação

Com dependências já instaladas, executar na raiz do projeto. Escolher caminhos novos para cada execução futura, preservando esta rodada:

```powershell
$env:PLAYWRIGHT_HTML_OPEN = 'never'
$env:PLAYWRIGHT_HTML_OUTPUT_DIR = 'documentacao/04-validacao-automatizada/playwright-report-manual-01'
$env:PLAYWRIGHT_JSON_OUTPUT_FILE = 'documentacao/04-validacao-automatizada/logs/playwright-manual-01.json'
npm.cmd run test:e2e -- --grep piloto.manual --reporter=list,html,json --trace=on --output=documentacao/04-validacao-automatizada/evidencias/manual-01

$env:PLAYWRIGHT_HTML_OUTPUT_DIR = 'documentacao/04-validacao-automatizada/playwright-report'
$env:PLAYWRIGHT_JSON_OUTPUT_FILE = 'documentacao/04-validacao-automatizada/logs/playwright-suite-01.json'
npm.cmd run test:e2e -- --reporter=list,html,json --trace=on --output=documentacao/04-validacao-automatizada/evidencias/suite-01
```

Os comandos desta rodada foram capturados integralmente com stdout/stderr nos logs indicados e código de saída ao final. Os E2E rodaram com permissão fora do ambiente restrito devido às restrições já conhecidas para build e execução do navegador, mantendo os contextos isolados e os mocks.

O [manifesto anterior](logs/preservacao-antes.json) e a [comparação final](logs/preservacao-final.json) confirmam 330 arquivos protegidos idênticos, incluindo toda a documentação preexistente, os arquivos de aplicação em `src/`, `package.json` e os três locks. Apenas a especificação E2E e a configuração Playwright eram mudanças autorizadas nessa comparação. `resultados.csv`, `feedback.md`, roteiro e notas do piloto permaneceram intactos. Relatórios e traces anteriores não foram usados como diretórios de saída. Não houve instalação ou atualização de dependências, correção da aplicação, commit ou publicação.
