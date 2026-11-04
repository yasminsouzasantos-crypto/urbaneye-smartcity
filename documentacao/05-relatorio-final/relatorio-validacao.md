# Relatório consolidado da validação acadêmica do UrbanEye

Consolidação documental das evidências de 03 e 04/11/2026. Fonte exclusiva: arquivos preservados em `documentacao/`. Esta consolidação não executou testes, auditoria de dependências, aplicação ou serviços externos e não reinspecionou o código fora desse acervo.

## 1. Objetivo e escopo

O objetivo foi examinar o funcionamento dos fluxos locais de cadastro, abertura, acompanhamento, gestão e contestação de chamados, identificar limitações do protótipo e preparar uma avaliação exploratória de uso. As evidências sustentam o funcionamento dos caminhos efetivamente testados, dentro das condições documentadas; não constituem validação integral do sistema.

O UrbanEye foi tratado como **protótipo acadêmico local**, com contas, sessão, chamados e fotos em localStorage, no mesmo computador, origem e perfil de navegador. Alterar protocolo, hostname, porta ou perfil pode separar os dados. A alternância entre cidadão e administrador no mesmo ambiente não demonstra colaboração municipal entre dispositivos. Essa delimitação está no [diagnóstico, especialmente F01/F02](../01-diagnostico/diagnostico-codex.md) e no [registro do lote de dados controlados](../02-correcoes/lote-01-dados-controlados.md).

Para a avaliação de uso, o [roteiro](../03-avaliacao-usuarios/roteiro.md) prevê contas fictícias distintas, modo Avaliação local, chamados manuais de teste separados do conjunto simulado, sem limpeza do navegador entre participantes e sem exigir Gemini. Nos testes automatizados, cada teste usa um contexto descartável isolado do navegador pessoal; as trocas de conta dentro do mesmo teste preservam o armazenamento daquele contexto. São procedimentos distintos, adequados às respectivas finalidades.

## 2. Método e natureza das evidências

A sequência abaixo é documental: descreve atividades anteriores registradas nos arquivos, sem alegar nova reprodução nesta consolidação.

| Etapa | Procedimento documentado | Evidência e alcance |
| --- | --- | --- |
| Diagnóstico assistido por IA | Inspeção estática de fluxos, configurações e dependências, leitura das verificações iniciais e análise dos avisos de segurança. | [Diagnóstico técnico](../01-diagnostico/diagnostico-codex.md). Distingue defeito confirmado por inspeção, suspeita e limitação; não reproduziu explorações nem executou novamente os checks iniciais. |
| Correções e regressão | Controle explícito de dados e procedência; ajuste do fundo cartográfico; investigação e correção do localizador E2E. | [Dados controlados](../02-correcoes/lote-01-dados-controlados.md), [mapa](../02-correcoes/lote-01-ajuste-mapa.md) e [E2E](../02-correcoes/lote-01-ajuste-e2e.md), com logs próprios e preservação dos anteriores. |
| Conferências manuais | Capturas de controles, conjunto fixo e mapas; consulta HTTP real de uma imagem cartográfica. | [Capturas das correções](../02-correcoes/prints/) e [registro HTTP](../02-correcoes/logs/lote-01-mapa-http-real.txt). Evidenciam estados pontuais, sem cobertura automática de todos os cálculos, telas ou provedores. |
| Piloto interno do desenvolvedor/equipe | Execução manual do ciclo de cidadão, intervenção administrativa e contestação, com chamado identificado como `PILOTO-20261104`. | [Notas do piloto](../03-avaliacao-usuarios/notas-piloto.md), de 04/11/2026. A identificação literal é “integrante da equipe”, fora da amostra de participantes; não há identificação adicional do executor no arquivo. |
| Preparação da avaliação com participantes | Cinco tarefas por objetivo, regras de ajuda/abandono/falha técnica, intervenção F01 e questionário posterior. | [Roteiro](../03-avaliacao-usuarios/roteiro.md), [questionário próprio](../03-avaliacao-usuarios/feedback.md) e [modelo de resultados humanos](../03-avaliacao-usuarios/resultados.csv). Instrumentos preparados não equivalem a coleta realizada. |
| Automação do fluxo do piloto | Ampliação dos E2E existentes, com variante automatizada do fluxo de registro manual, sem foto ou IA, e regressão WebP/IA simulada, propriedade entre contas e quota. | [Relatório da automação](../04-validacao-automatizada/relatorio.md), [JSON da suíte](../04-validacao-automatizada/logs/playwright-suite-01.json) e [HTML completo](../04-validacao-automatizada/playwright-report/index.html). Aprovação baseada em asserções determinísticas. |

As expectativas da automação foram confrontadas com os objetivos do roteiro e as regras descritas nos registros, usando o piloto como referência de sequência. O comportamento observado não foi automaticamente adotado como correto: a localização indeterminada não virou GPS validado, a notificação OBS-01 permaneceu pendente e os limites de segurança e integração continuaram declarados. A intervenção **F01 do roteiro** é a atualização administrativa programada; não deve ser confundida com o **achado F01 do diagnóstico**, sobre autorização administrativa.

### 2.1. Piloto e feedback humano

As notas do piloto registram sucesso nas seis etapas descritas, status inicial Aberto, persistência após sair/entrar, passagem a Em atendimento e Resolvido, confirmação pendente e contestação com retorno a atendimento. O executor relatou não ter encontrado dificuldade ou erro nessas etapas. Isso é um relato de uso interno, com familiaridade potencial com o sistema, e não demonstra facilidade para pessoas externas à equipe. Não há tempos humanos medidos ou questionário respondido nessas notas.

A localização exibida no piloto foi “Rua Quinze de Novembro, Centro, Sorocaba”, com origem declarada **indeterminada**. Não há base documental para convertê-la em posição obtida por GPS ou validada em campo.

A avaliação com **5 a 8 participantes**, preferencialmente não desenvolvedores, permanece planejada no acervo consultado. O arquivo de resultados humanos contém somente o cabeçalho e o feedback mantém as respostas em branco. O questionário usa escala de 1 a 5, extremos definidos e “Não consigo avaliar”, além de questões abertas; identifica-se expressamente como **instrumento próprio, não escala validada**. Não foram encontrados resultados de participantes que permitam relatar utilidade percebida, intenção de uso ou escores de usabilidade. A ausência de registros não autoriza inventar respostas nem afirmar que uma coleta ocorreu.

## 3. Ferramentas e papel efetivo da IA

| Ferramenta | Papel demonstrado no acervo | Limite da evidência |
| --- | --- | --- |
| Codex | Assistência ao diagnóstico, interpretação dos registros, preparação e manutenção de correções/testes, execução de comandos nas etapas autorizadas e redação da documentação. A participação na automação está explicitada no [relatório correspondente](../04-validacao-automatizada/relatorio.md). | As escolhas de cobertura e asserções feitas com assistência da IA permanecem sujeitas à revisão de requisitos. Codex não é participante nem substitui avaliador humano ou prova empírica de qualidade do produto. |
| Vitest | Verificações isoladas de utilitários, contas, armazenamento, formulário, dados controlados e contratos dos mapas; logs registram Vitest 3.2.7. | Predomina ambiente Node/jsdom e simulação de dependências. Os testes do handler de análise simulam Deno/fetch; os de mapa simulam componentes react-leaflet. Não comprovam implantação real da função ou renderização cartográfica integrada. |
| TypeScript | Checagem estática por `tsc --noEmit`; detectou, durante o ajuste E2E, leitura potencialmente indefinida de um chamado. | Não executa fluxos, não garante correção de requisitos ou validação no runtime Deno. O diagnóstico registra garantias parciais de configuração, incluindo `strict: false` no projeto frontend e `skipLibCheck`. |
| ESLint | Análise estática de regras de código, incluindo avisos de Fast Refresh. | Ausência de erros não prova funcionamento, acessibilidade ou segurança. A análise de arquivos selecionados na rodada final não equivale a lint integral sem avisos. |
| Playwright | Ações de interface em navegador, alternância de contas, recarga, leitura de estado, asserções, capturas, traces e relatórios HTML/JSON. | Executa os caminhos programados com dados e serviços simulados; não mede compreensão, dificuldade humana, satisfação ou utilidade. |
| Vite e npm | Empacotamento de produção, execução dos scripts e registros históricos de instalação/auditoria. | Build aprovado não valida serviços externos, disponibilidade, segurança de produção ou instalação em máquina limpa. |

Há duas utilizações diferentes de IA. **Codex auxiliou a preparar e executar os testes**. Já a **triagem por Gemini integrada ao produto foi substituída por resposta fixa nos E2E**. No runtime da suíte, a aprovação decorreu de comparações determinísticas de IDs, papéis, elementos, textos, dados persistidos, transições e contadores de mocks; não houve modelo interpretando a tela para atribuir aprovação. A regressão de IA demonstra tratamento de uma resposta fabricada, sem medir precisão, confiança calibrada, latência ou qualidade de classificação do Gemini real.

## 4. Resultados por execução

As contagens a seguir pertencem a execuções e versões locais diferentes. **Não se somam repetições, rodadas intermediárias, etapas de um mesmo teste ou testes de ferramentas distintas como uma única amostra.** Não há relatório de cobertura percentual no acervo.

### 4.1. Base inicial aproveitada pelo diagnóstico

O diagnóstico de 03/11/2026 leu verificações preexistentes; não as executou novamente.

| Verificação inicial | Resultado registrado | Evidência |
| --- | --- | --- |
| Vitest | 7 arquivos, 56 testes aprovados. O diagnóstico distingue 55 verificações funcionais/técnicas e um teste trivial. | [Log inicial Vitest](../01-diagnostico/logs/04-npm-test-inicial.txt) |
| TypeScript | Sem erros reportados. | [Log inicial de tipos](../01-diagnostico/logs/05-npm-typecheck-inicial.txt) |
| ESLint integral | 0 erros e 8 avisos de Fast Refresh. | [Log inicial de lint](../01-diagnostico/logs/06-npm-lint-inicial.txt) |
| Build | Aprovado, Vite 6.4.3. | [Log inicial de build](../01-diagnostico/logs/07-npm-build-inicial.txt) |
| Playwright | 3 testes aprovados; serviços externos e geolocalização simulados. | [Log inicial E2E](../01-diagnostico/logs/08-npm-e2e-inicial.txt), [HTML inicial](../01-diagnostico/playwright-report-inicial/index.html) |
| Auditoria de dependências | 29 registros: 23 moderados, 4 altos e 2 críticos. | [Audit inicial](../01-diagnostico/logs/02-npm-audit-inicial.txt) |

Alguns logs iniciais são transcrições sem código de saída explícito; a formulação acima respeita o resultado registrado e a interpretação do diagnóstico. Não se atribui retrospectivamente um código de saída que não consta da evidência.

### 4.2. Verificações após as correções

| Rodada | Resultado e diferença de escopo | Evidência |
| --- | --- | --- |
| Lote 01, execução intermediária | Vitest: 9 arquivos e 74 testes aprovados; tipos/build aprovados e lint com os mesmos 8 avisos, conforme registro do lote. | [Vitest 01](../02-correcoes/logs/lote-01-vitest-01.txt), [registro do lote](../02-correcoes/lote-01-dados-controlados.md) |
| Lote 01, execução final de dados controlados | Vitest: 9 arquivos e 76 testes aprovados; tipos sem erros; lint integral com 0 erros e 8 avisos; build aprovado, saída 0 nos logs finais. | [Vitest 02](../02-correcoes/logs/lote-01-vitest-02.txt), [tipos](../02-correcoes/logs/lote-01-typecheck-02.txt), [lint](../02-correcoes/logs/lote-01-lint-02.txt), [build](../02-correcoes/logs/lote-01-build-02.txt) |
| Ajuste cartográfico | Vitest: 10 arquivos e 80 testes aprovados, incluindo quatro verificações novas do contrato dos mapas; tipos/build aprovados; lint integral com 0 erros e 8 avisos. Sem execução Playwright nessa etapa específica. | [Vitest mapa](../02-correcoes/logs/lote-01-mapa-vitest-01.txt), [tipos mapa](../02-correcoes/logs/lote-01-mapa-typecheck-01.txt), [lint mapa](../02-correcoes/logs/lote-01-mapa-lint-01.txt), [build mapa](../02-correcoes/logs/lote-01-mapa-build-01.txt) |
| Primeiro E2E após o lote | 2 aprovados e 1 falhou por timeout no clique da linha 89. | [Log da falha](../02-correcoes/logs/lote-01-playwright-01.txt), [HTML preservado](../02-correcoes/playwright-falha-01/playwright-report-lote-01/index.html) |
| Reprodução da falha E2E | Somente o teste afetado: mesma falha, saída 1. | [Reprodução válida](../02-correcoes/logs/lote-01-e2e-ajuste-03-reproducao.txt) |
| Ajuste E2E, verificação intermediária | Teste afetado aprovado; TypeScript apontou `saved` possivelmente indefinido na primeira versão do ajuste, posteriormente corrigido. | [Teste intermediário](../02-correcoes/logs/lote-01-e2e-ajuste-04-afetado.txt), [erro de tipos](../02-correcoes/logs/lote-01-e2e-ajuste-05-typecheck.txt) |
| Ajuste E2E, código final dessa etapa | Teste afetado: 1 aprovado. Depois, suíte completa: 3 aprovados. Tipos aprovados e lint dos três arquivos alterados sem erros/avisos; não corresponde a lint integral sem avisos. | [Afetado final](../02-correcoes/logs/lote-01-e2e-ajuste-08-afetado-final.txt), [suíte de 3 testes](../02-correcoes/logs/lote-01-e2e-ajuste-11-suite-completa.txt), [tipos finais](../02-correcoes/logs/lote-01-e2e-ajuste-09-typecheck-final.txt), [lint selecionado](../02-correcoes/logs/lote-01-e2e-ajuste-10-eslint-final.txt) |

O aumento de 56 para 76 e depois 80 refere-se à ampliação de uma suíte Vitest, não a grupos independentes de pessoas ou requisitos integralmente cobertos. Os 74 intermediários não são adicionais aos 76. A última execução Vitest documentada é a do ajuste cartográfico; não há nova execução Vitest na rodada final de automação do piloto.

Tentativas impedidas pelo ambiente também foram preservadas: uma captura de log não iniciou o teste por erro de parâmetros de `Tee-Object`, e outra parou no build por acesso negado. Elas não contam como teste aprovado nem como defeito funcional do UrbanEye: [tentativa 01](../02-correcoes/logs/lote-01-e2e-ajuste-01-reproducao.txt) e [tentativa 02](../02-correcoes/logs/lote-01-e2e-ajuste-02-reproducao.txt).

### 4.3. Rodada automatizada final do piloto

A execução completa de 04/11/2026 registrou **4 testes aprovados, 0 falhas, 0 ignorados e 0 instáveis**, com uma execução por teste e sem retries. O [JSON da suíte](../04-validacao-automatizada/logs/playwright-suite-01.json), o [log completo](../04-validacao-automatizada/logs/e2e-suite-01.txt), o [HTML](../04-validacao-automatizada/playwright-report/index.html) e a [captura do resumo](../04-validacao-automatizada/prints/01-resumo-playwright.png) são concordantes.

Os quatro testes automatizados são: fluxo de registro manual, sem foto ou IA, baseado no piloto; ciclo WebP/IA simulada; propriedade entre contas; e preservação em quota excedida. Antes deles, houve uma execução automatizada focada no fluxo de registro manual, aprovada, preservada em [log próprio](../04-validacao-automatizada/logs/e2e-manual-01.txt). Essa execução focada não é um quinto teste distinto da suíte final.

TypeScript passou e o ESLint da especificação/configuração alteradas não apresentou erros ou avisos; os builds embutidos nas execuções E2E passaram. Evidências: [tipos](../04-validacao-automatizada/logs/typecheck-01.txt) e [lint selecionado](../04-validacao-automatizada/logs/eslint-01.txt). Isso não demonstra eliminação dos oito avisos encontrados anteriormente no lint integral.

O início documentado foi `2026-11-04T16:07:15.087Z`, equivalente a 13:07:15.087 em America/Sao_Paulo. A duração total do runner registrada no JSON é 64.344,286 ms; o build anterior está separado no log. Esses valores são tempos de automação, não de pessoas.

#### Relação dos nove cenários/verificações

O [CSV automatizado](../04-validacao-automatizada/resultados-automatizados.csv) identifica `tipo_execucao=automatizada_playwright` e execução `PW-2026-11-04T16:07:15.087Z`. C01–C06 são etapas dependentes do **mesmo teste automatizado do fluxo de registro manual, sem foto ou IA**; C07 é outro teste; R01 e R02 correspondem às duas regressões. As seis etapas também são reutilizadas pela variante de IA, mas não foram contadas novamente como cenários independentes. **São quatro testes e nove linhas de cenário/verificação, não nove testes independentes.**

| ID | Escopo esperado e resultado obtido | Resultado | Evidência correspondente |
| --- | --- | --- | --- |
| C01 | Conta cidadã com e-mail fictício exclusivo, sessão identificada e ausência da função Gestão na interface. | Aprovado | Etapa C01 no [JSON](../04-validacao-automatizada/logs/playwright-suite-01.json) e no [trace do fluxo automatizado](<../04-validacao-automatizada/evidencias/suite-01/urbaneye-piloto-manual-cad-9f747-ncia-→-gestão-→-contestação/trace.zip>). |
| C02 | Descrição vazia recusada; único chamado Obra salvo em Avaliação local com proprietário e `manual_local`, sem foto, análise ou versão de conjunto fixo. | Aprovado | [Captura automatizada do chamado](../04-validacao-automatizada/evidencias/C02-manual.png), etapa C02 no [JSON](../04-validacao-automatizada/logs/playwright-suite-01.json) e [trace do fluxo automatizado](<../04-validacao-automatizada/evidencias/suite-01/urbaneye-piloto-manual-cad-9f747-ncia-→-gestão-→-contestação/trace.zip>). |
| C03 | Após recarga, botão único pelo ID, procedência manual, status Aberto e igualdade integral do registro criado. | Aprovado | Etapa C03 no [JSON](../04-validacao-automatizada/logs/playwright-suite-01.json) e no [trace do fluxo automatizado](<../04-validacao-automatizada/evidencias/suite-01/urbaneye-piloto-manual-cad-9f747-ncia-→-gestão-→-contestação/trace.zip>). |
| C04 | Logout remove sessão; novo login da mesma conta reencontra o mesmo ID, conteúdo, proprietário e status Aberto. | Aprovado | [Captura de persistência](../04-validacao-automatizada/evidencias/C04-persistencia.png), etapa C04 no [JSON](../04-validacao-automatizada/logs/playwright-suite-01.json). |
| C05 | Login administrativo, mesmo chamado em atendimento e depois Resolvido, prioridade crítica, data de resolução e confirmação pendente, preservando proprietário. | Aprovado | [Atendimento](../04-validacao-automatizada/evidencias/C05-atendimento.png), [resolução pendente](../04-validacao-automatizada/evidencias/C05-resolucao.png), etapa C05 no [JSON](../04-validacao-automatizada/logs/playwright-suite-01.json). |
| C06 | Proprietário contesta: atendimento, `confirmation=contestado`, reabertura e ausência de data de resolução atual; descrição, prioridade e proprietário preservados. | Aprovado | [Captura da contestação](../04-validacao-automatizada/evidencias/C06-contestacao.png), etapa C06 no [JSON](../04-validacao-automatizada/logs/playwright-suite-01.json) e [trace do fluxo automatizado](<../04-validacao-automatizada/evidencias/suite-01/urbaneye-piloto-manual-cad-9f747-ncia-→-gestão-→-contestação/trace.zip>). |
| C07 | Outra conta não recebe o ID alheio como próprio; cada conta encontra seu registro e ambos continuam no armazenamento. | Aprovado | [Captura da outra conta](../04-validacao-automatizada/evidencias/C07-outra-conta.png), [trace de propriedade](<../04-validacao-automatizada/evidencias/suite-01/urbaneye-C07-outra-conta-n-ee573-e-os-chamados-como-próprios/trace.zip>). A aprovação não abrange OBS-01. |
| R01 | WebP convertido em JPEG, sugestão fixa aceita, foto persistida e ciclo administrativo/contestação preservados. | Aprovado | Teste WebP/IA no [JSON](../04-validacao-automatizada/logs/playwright-suite-01.json) e [trace WebP/IA](<../04-validacao-automatizada/evidencias/suite-01/urbaneye-cadastro-→-WebP-I-24446-ncia-→-gestão-→-contestação/trace.zip>). |
| R02 | `QuotaExceededError` provocado no contexto descartável preserva descrição do rascunho e snapshot anterior, com erro visível. | Aprovado | Teste de quota no [JSON](../04-validacao-automatizada/logs/playwright-suite-01.json) e [trace de quota](<../04-validacao-automatizada/evidencias/suite-01/urbaneye-armazenamento-che-894c6-cunho-e-as-fotos-existentes/trace.zip>). |

Os links apontam para arquivos existentes do acervo. Imagens mostram estados de tela, enquanto JSON e traces permitem relacionar cada estado às ações e asserções. Não há captura individual exclusiva de todas as etapas; C01 e C03 são sustentados principalmente pelas etapas e pelo trace compartilhado. As durações por cenário no CSV são automatizadas e não devem ser comparadas a tempos humanos do roteiro.

## 5. Problemas, ajustes e evidências anteriores/posteriores

### 5.1. Dados sintéticos e controle do experimento

O achado F09 do [diagnóstico](../01-diagnostico/diagnostico-codex.md) registrava geração inicial de 64 ocorrências aleatórias e sensor simulado a cada 15 segundos, misturados aos indicadores. Isso comprometia a reprodutibilidade e a interpretação dos números como resultados de uma cidade.

O [lote 01](../02-correcoes/lote-01-dados-controlados.md) documentou a remoção dessa geração automática, Avaliação local como padrão sem novos chamados automáticos, Demonstração simulada explícita, conjunto fixo de oito cenários, carga/restauração confirmadas e procedência individual. A classificação de legado permanece conservadora e não autentica sua origem. Trocar modo ou conta não apaga dados.

Os logs de [76 testes](../02-correcoes/logs/lote-01-vitest-02.txt) sustentam a regressão dos controles e da persistência; as [capturas dos controles](../02-correcoes/prints/lote-01-01-controles-dos-modos.png) e [do conjunto carregado](../02-correcoes/prints/lote-01-05-conjunto-carregado.png) registram estados da interface. A fábrica de oito casos e os indicadores esperados são dados do experimento, não ocorrências reais ou medidas de desempenho municipal. O próprio registro alerta que tabelas de médias/séries esperadas não equivalem a testes independentes de renderização/cálculo de todos os gráficos.

### 5.2. Fundo cartográfico: acesso real e simulação

O [registro do ajuste](../02-correcoes/lote-01-ajuste-mapa.md) atribuiu o problema à configuração CARTO Positron sem chave. A [captura anterior feita pelo usuário](../02-correcoes/prints/lote-01-06-indicadores-parte-6.png), examinada pelo agente nesta revisão documental, mostra “API KEY REQUIRED” repetido no fundo do mapa da gestão, com os marcadores ainda visíveis e crédito CARTO. Há, portanto, comparação visual antes/depois no acervo, em conjunto com a [captura da gestão em pontos após o ajuste](../02-correcoes/prints/lote-01-09-mapa-gestao-pontos-corrigido.png). A inspeção do arquivo preservado pelo agente não foi uma nova captura nem uma execução ao vivo da aplicação. O relato de que o agente não obteve nova captura na etapa do ajuste não implica ausência da captura anterior feita pelo usuário.

A correção registrada centralizou o fundo dos dois mapas em OpenStreetMap, atualizou atribuição/opções e evitou montar tiles em mapas inativos. Há três níveis distintos de evidência posterior:

1. **Contrato simulado dos componentes:** quatro testes Vitest de mapa, incluídos nos [80 aprovados](../02-correcoes/logs/lote-01-mapa-vitest-01.txt), verificam configuração e ativação com react-leaflet substituído. Não acessam o provedor.
2. **Imagem real isolada:** o [log HTTP](../02-correcoes/logs/lote-01-mapa-http-real.txt) registra uma consulta não simulada a um tile OSM, status 200, `image/png` e 42.247 bytes. A [imagem recebida](../02-correcoes/logs/lote-01-mapa-tile-real.png) contém cartografia de Sorocaba/Votorantim, sem a mensagem de chave. Demonstra o conteúdo dessa resposta, não a composição de todos os mapas do aplicativo.
3. **Capturas de conferência da aplicação:** o [mapa principal](../02-correcoes/prints/lote-01-07-mapa-principal-corrigido.png), a [gestão em calor](../02-correcoes/prints/ilote-01-08-mapa-gestao-calor-corrigido.png) e a [gestão em pontos](../02-correcoes/prints/lote-01-09-mapa-gestao-pontos-corrigido.png) mostram cartografia e atribuição OpenStreetMap visíveis. São evidências visuais do fundo cartográfico em estados da interface; o mapa principal está em Demonstração simulada, com oito registros. Cartografia real visível não transforma esses registros em ocorrências reais.

Há uma ressalva de rastreabilidade: o [log de observação do ajuste](../02-correcoes/logs/lote-01-mapa-observacao.txt) e seu relatório deixaram a inspeção integrada pendente por indisponibilidade/timeout de acesso ao navegador. As capturas corrigidas existem no acervo e mostram o resultado visual, mas não há ata complementar com autoria, horário e trilha de rede de cada captura. Não se atribui ao agente uma inspeção ao vivo que aquele log nega. Tampouco se deduz das imagens a origem de cada download/cache, a disponibilidade contínua do provedor ou compatibilidade em outros dispositivos.

Os **tiles dos E2E são PNGs mínimos simulados**, inclusive na rodada final. A aprovação desses testes não é evidência do conteúdo cartográfico real mostrado nas capturas de conferência. Não houve nova consulta cartográfica nesta consolidação.

### 5.3. Falha E2E por alteração do nome acessível

O [log após o lote](../02-correcoes/logs/lote-01-playwright-01.txt) registra timeout de 45 segundos na linha 89, ao procurar `/Obra Rua de teste/`. O [contexto de erro preservado](<../02-correcoes/playwright-falha-01/test-results/urbaneye-cadastro-→-WebP-I-24446-ncia-→-gestão-→-contestação/error-context.md>) lista o chamado presente, com o nome acessível:

```text
Obra Manual local · não verificado em campo Rua de teste, São Paulo Média
```

O rótulo de procedência interrompeu o trecho contíguo esperado pelo localizador. A [captura da falha](<../02-correcoes/playwright-falha-01/test-results/urbaneye-cadastro-→-WebP-I-24446-ncia-→-gestão-→-contestação/test-failed-1.png>) mostra um registro no painel; como a lista de recentes fica abaixo da área visível, a presença/nome do botão é sustentada pelo contexto e pela [extração documentada do trace](../02-correcoes/logs/lote-01-e2e-ajuste-trace-original.txt), além do [trace original](<../02-correcoes/playwright-falha-01/test-results/urbaneye-cadastro-→-WebP-I-24446-ncia-→-gestão-→-contestação/trace.zip>). Não era evidência de ausência do chamado.

O [ajuste](../02-correcoes/lote-01-ajuste-e2e.md) acrescentou identificação por ID aos botões e passou a seguir o chamado exato na interface e na persistência, exigindo correspondência única. Preservou o rótulo acessível e as asserções de prioridade, resolução, propriedade, contestação e foto; não aumentou o timeout. O teste afetado passou e a [suíte posterior de três testes](../02-correcoes/logs/lote-01-e2e-ajuste-11-suite-completa.txt) ficou aprovada, com [HTML próprio](../02-correcoes/playwright-report-lote-01-ajuste/index.html). A ampliação posterior para quatro testes reutilizou esse identificador.

A checagem de tipos também detectou `saved` possivelmente indefinido na primeira versão do ajuste. O registro informa que a leitura por ID passou a lançar erro explícito se o chamado desaparecer, antes da aprovação final de tipos. Trata-se de correção no teste; não deve ser contada como seis defeitos diferentes pelas seis mensagens TS18048.

## 6. Limitações e pendências

### 6.1. Observação OBS-01

O [relatório automatizado](../04-validacao-automatizada/relatorio.md) registra uma notificação da ação anterior após troca de conta. Na [captura C07](../04-validacao-automatizada/evidencias/C07-outra-conta.png), a segunda conta está sem chamados próprios, mas ainda aparece “Chamado aberto com sucesso”, referente à primeira conta. A causa e a duração não foram investigadas e não há correção documentada. C07 verifica propriedade/preservação, não o ciclo de vida dessas notificações. O relato do piloto de ausência de dificuldade não elimina essa observação de outra execução.

### 6.2. Dependências e reprodutibilidade

O [audit inicial](../01-diagnostico/logs/02-npm-audit-inicial.txt) registrou **29 vulnerabilidades: 23 moderadas, 4 altas e 2 críticas**. O [diagnóstico, seção 7](../01-diagnostico/diagnostico-codex.md), agrupou os avisos em dez famílias: Vitest/mocker/tinypool, Vite, esbuild na cadeia Drizzle, brace-expansion, glob, minimatch, postcss-selector-parser, React Router, source-map-js e Zod.

Essas são contagens históricas do relatório de dependências, incluindo propagação a ancestrais; não são 29 ataques independentes ou explorações comprovadas do UrbanEye. O diagnóstico distingue riscos das ferramentas de desenvolvimento/teste, condições dependentes de implantação e fluxos não alcançáveis demonstradamente pelo formulário. Também não se pode concluir que sejam irrelevantes apenas porque os testes funcionaram.

Os registros posteriores declaram preservação de dependências/lockfiles e não documentam atualização corretiva ou nova auditoria. Assim, o acervo não comprova resolução desses avisos nem oferece um novo retrato de vulnerabilidades. Esta consolidação não atualizou informações externas ou recomendações de versões.

Os [scripts de instalação bloqueados](../01-diagnostico/logs/03-npm-install-scripts-inicial.txt) abrangem três versões de esbuild e `@swc/core`. O êxito no ambiente registrado não comprova instalação limpa em outra máquina, nem torna esses bloqueios prova de código malicioso. A multiplicidade de lockfiles e a ausência de validação de instalação limpa continuam limitações de reprodutibilidade apontadas no diagnóstico.

### 6.3. Arquitetura, geografia, IA e cobertura

Permanecem sem correção demonstrada no acervo os limites do [diagnóstico](../01-diagnostico/diagnostico-codex.md), especialmente:

- Autorização administrativa controlada localmente, cadastro administrativo livre e sessão manipulável. O desaparecimento da função Gestão para cidadão no teste não constitui fronteira de autorização em servidor.
- Armazenamento compartilhado por origem/perfil, sem persistência municipal centralizada, backup demonstrado ou isolamento confidencial entre contas. O teste de “meus chamados” não demonstra confidencialidade do localStorage. O caso legado `mine=true` sem proprietário não é coberto pelo isolamento de registros novos com `ownerId`.
- Concorrência não transacional entre abas, quota e ausência de volume/desempenho-alvo medidos. A preservação em quota simulada cobre somente a condição exercitada.
- Posição padrão ou antiga em falha de localização, ausência de edição manual no formulário e região aproximada por centro mais próximo. Não há comprovação de precisão geográfica, delimitação municipal ou validação de bairro.
- Histórico por snapshot, sem trilha completa de decisões; pendência do administrador autor de chamado; definição incompleta dos indicadores, alcance restrito de filtros/calor e ausência de oráculo independente para todos os cálculos.
- Endpoint de IA sem autenticação de cidadão demonstrada, limite de requisições com restrições de implantação, revisão humana sem fila operacional e falta de validação real do contrato/modelo, gateway Deno e classificação com conjunto rotulado.
- Falta de avaliação multidispositivo, leitores de tela/teclado, foco dos diálogos, câmera e formatos reais em diferentes plataformas, rede degradada e uso offline. Aprovação em Edge 1280 × 900 não valida essas condições.

O diagnóstico recomendava tratar itens de autorização, dados e localização antes de extrapolar para um piloto compartilhado com usuários reais. A preparação dos instrumentos e o piloto interno não encerram essas pendências.

### 6.4. Serviços externos simulados e informação ausente

Na rodada final, a [auditoria extraída do teste](../04-validacao-automatizada/evidencias/rede-e-ambiente-suite-01.json) registra zero solicitações de análise nos testes automatizados do fluxo de registro manual sem foto ou IA, de propriedade e de quota, e uma na regressão WebP/IA, atendida pelo mock. Geocodificação e tiles também foram simulados, com destinos externos restantes bloqueados e service workers desabilitados. Portanto, não houve chamada real ao Gemini nessa rodada e não se avaliou disponibilidade ou precisão dos provedores.

A localização automatizada foi `-23.55052, -46.63331`, com endereço fixo “Rua de teste, São Paulo”; não corresponde à origem indeterminada relatada no piloto e não a esclarece. Nenhuma dessas evidências autoriza chamar uma posição padrão de GPS validado.

As lacunas/divergências relevantes ficam explícitas: falta de respostas de participantes; ausência de tempos humanos; observação integrada do mapa deixada pendente no log apesar de capturas disponíveis sem ata complementar; escopos diferentes do lint integral e selecionado; ausência de novo Vitest/audit na rodada final; e repetição dos rótulos C01–C06 na variante de IA, que não gera novos cenários independentes. Não se preencheu nenhuma dessas lacunas por suposição.

## 7. Ambiente, versão documentada e rastreabilidade

Segundo o [registro de versão da rodada final](../04-validacao-automatizada/logs/versao-testada.json), o ambiente foi Windows 10.0.19045 x64, Node v24.15.0, npm 12.0.2, Playwright 1.63.0 e Vite 6.4.3; navegador Edge `msedge` 147.0.3912.72, headless, viewport 1280 × 900, um worker e origem `http://127.0.0.1:8081`, com servidor de preview próprio.

A branch registrada é `validacao-academica`, com HEAD `e2b857554605d2f6848c6c0227e6a9e64c980efd`. Como havia alterações locais, esse HEAD não identifica sozinho o conteúdo testado. O snapshot documentado para os arquivos considerados na execução é:

```text
E770FA330351E91963C018CE55D7D0CDF530D464385B9FA3E43584ED4A025D93
```

Esse identificador provém do acervo, não de uma nova checagem da aplicação nesta consolidação. Os [registros de preservação da automação](../04-validacao-automatizada/logs/preservacao-final.json) confirmam 330 arquivos então protegidos idênticos; o [registro do ajuste E2E](../02-correcoes/logs/lote-01-e2e-ajuste-12-preservacao-final.txt) se refere a outro conjunto, de 113 arquivos. Essas contagens têm escopos diferentes e não representam testes ou participantes.

Todos os links deste relatório são relativos ao acervo documental e foram conferidos quanto à existência dos destinos. As evidências anteriores permanecem nos seus caminhos; não foram reclassificadas como novas execuções nem sobrescritas. Nenhum resultado humano foi preenchido. Esta etapa criou somente o relatório consolidado, sem alterar a aplicação, instalar dependências, executar testes, fazer commits ou publicar.

## 8. Conclusão

As evidências documentam a correção do controle de dados da demonstração, do fundo cartográfico e da identificação do chamado no E2E, além da aprovação dos fluxos locais efetivamente exercitados. Na rodada automatizada final, os quatro testes cobriram nove cenários/verificações de cadastro, criação manual, identificação, persistência, gestão, contestação, propriedade e regressões, com serviços externos simulados. O piloto interno relatou funcionamento do mesmo ciclo manual, sem integrar a amostra planejada de participantes.

O resultado sustenta uma demonstração funcional local sob as condições registradas. Não sustenta validação integral, segurança de produção, operação municipal compartilhada, precisão da IA real, precisão geográfica ou utilidade comprovada por participantes. A avaliação exploratória com pessoas externas à equipe, a investigação de OBS-01 e o tratamento das pendências técnicas e de dependências continuam necessários para ampliar essas conclusões.
