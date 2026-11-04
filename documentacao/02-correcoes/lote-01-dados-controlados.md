# Lote 01 — dados controlados para avaliação local

Data: 03/11/2026. Branch: `validacao-academica`. Base: `e2b857554605d2f6848c6c0227e6a9e64c980efd`. Alterações locais, sem commit ou publicação.

## Escopo e limitações mantidas

Este lote trata principalmente do achado F09: controle da geração de dados e identificação de sua procedência para uma demonstração acadêmica no mesmo computador, mesma origem e mesmo perfil de navegador, alternando contas de cidadão e administrador.

O armazenamento continua em localStorage, com os mesmos chamados na chave `urbaneye.reports.v2`. Não foram implementados backend, SUMO, integração IoT, autenticação remota ou migração de permissões. O cadastro administrativo livre, sessão local manipulável, propriedade legada, falta de transações entre abas, quota do navegador, limitações de localização/GPS, ausência de trilha completa e dependências vulneráveis permanecem conforme o diagnóstico inicial. Nenhum registro manual é declarado como ocorrência real validada em campo.

O funcionamento do Gemini não foi modificado ou validado por chamadas reais. Testes de IA existentes continuam isolados, com mocks. Mapas e geocodificação continuam dependendo de serviços externos quando a aplicação é aberta normalmente. Para testar este lote manualmente, não é necessário pressionar “Analisar foto com IA”.

## Comportamento anterior e novo

| Tema | Antes | Agora |
| --- | --- | --- |
| Primeiro acesso sem chamados | Criava 64 ocorrências aleatórias e as persistia | Avaliação local é o padrão; conjunto vazio, sem criação ou escrita automática de chamados |
| Sensores | Nova ocorrência simulada a cada 15 segundos | Gerador periódico removido em ambos os modos |
| Demonstração | Dados e datas aleatórios, misturados à operação local | Modo explícito com dados marcados como simulados e conjunto fixo v1 |
| Carga de dados | Automática no primeiro acesso | Apenas pela interface do Perfil, após confirmação; adiciona somente IDs ausentes |
| Restauração | Sem controle específico do conjunto | Confirmação separada restaura somente os oito IDs do conjunto v1; preserva os demais registros |
| Indicadores/mapas | Usavam toda a lista, incluindo sementes e sensores | Recebem a seleção do modo; demonstração oferece filtro exclusivo do conjunto fixo |
| Origem dos registros | Sem procedência explícita nas sementes | Novos registros têm metadados de origem; legado é reconhecido conservadoramente e rotulado |
| Tempo da análise administrativa | Apenas relógio corrente | Demonstração usa referência fixa e visível: 08/09/2026, 18:00 UTC; avaliação mantém relógio corrente |

Não se limpa o armazenamento ao mudar de modo, entrar/sair da conta, carregar a tela ou avançar o relógio. Trocar modo ou filtro altera a visualização, sem substituir os dados salvos. A mesma linguagem visual, mapas, navegação e componentes de interface foram mantidos; foi acrescentada uma faixa de contexto e controles no Perfil, com espaço superior ajustado nas telas.

## Modos e procedência

A preferência de modo fica na chave `urbaneye.data-mode.v1` e é compartilhada pelas contas desse perfil/origem. Ausência ou valor desconhecido usa avaliação. A seleção “Somente conjunto fixo v1” é um filtro da tela, não persistido: ao remontar a aplicação ou alternar contas pelo logout/login, selecione-o novamente se necessário. Não muda a procedência dos chamados.

| Procedência | Inclusão | Identificação na interface |
| --- | --- | --- |
| `manual_local` | Cadastro no modo avaliação | Manual local · não verificado em campo |
| `demo_manual` | Cadastro na demonstração, em Todos os simulados | Simulado · cadastro manual |
| `fixture`, versão `urbaneye-local-v1` | Carga confirmada dos cenários fixos | Simulado · conjunto fixo v1 |
| `legacy_simulated` ou marcadores antigos conhecidos | Demonstração | Simulado · legado |
| `legacy_unknown` ou registro antigo sem marcadores conhecidos | Avaliação, com ressalva explícita | Legado · origem não verificada |

Os marcadores antigos reconhecidos são IDs `seed-` seguidos de dígitos, prefixo `sensor-` ou `isSensor: true`. A classificação é feita na leitura/visualização; não há migração que sobrescreva a base ao abrir a aplicação. Dados antigos sem marcador não são presumidos reais. A inferência não autentica sua origem e não descobre simulações antigas que tenham perdido todos os marcadores.

A faixa global identifica o modo, a quantidade exibida e o caráter simulado ou não verificado dos dados. Detalhes, listas e popups de pontos exibem a procedência individual. Sensores antigos passam a ser descritos como simulados. Totais de perfil, cartões do mapa, painel administrativo e mapa de calor usam o mesmo conjunto selecionado. O Perfil informa quantos registros estão preservados fora da visualização.

No modo avaliação, simulações reconhecidas não entram nos indicadores. Registros antigos de origem desconhecida continuam visíveis, explicitamente não verificados; para um experimento com resultados empíricos futuros, ainda será necessário avaliar e delimitar esse legado. No modo demonstração, nenhum registro é apresentado como resultado real.

## Como ativar e testar manualmente

1. Inicie o projeto normalmente, por exemplo com `npm run dev`, e mantenha a mesma URL/origem, computador e perfil de navegador durante todo o roteiro. Não limpe dados do navegador para trocar de conta.
2. Entre em uma conta e abra Perfil, ou pressione a faixa de contexto no topo. Em Dados da avaliação local, selecione Avaliação local. Sem dados anteriores, o total é zero e permanece zero mesmo após dois minutos sem ações. Em base antiga, registros preservados podem aparecer conforme sua procedência; o modo não promete apagar o histórico.
3. Cadastre manualmente um chamado sem solicitar IA. Ele recebe `manual_local`, pertence à conta atual e aparece na avaliação. Saia, entre com outra conta no mesmo perfil e confira a gestão; “Meus chamados” continua dependendo da propriedade da conta.
4. No Perfil, selecione Demonstração simulada. A troca não carrega dados e não inicia sensores. Registros de avaliação ficam preservados fora da visualização. Escolha Todos os simulados para ver simulações antigas e cadastrar chamados de demonstração com `demo_manual`.
5. Pressione Carregar conjunto fixo. Leia a confirmação: somente os IDs ausentes serão adicionados. Cancelar não grava nada; Confirmar carga faz a inclusão. Ações manuais de cadastro e registros legados não são apagados.
6. Selecione Somente conjunto fixo v1. Confira os oito cenários e os totais abaixo, independentemente da existência de outras simulações. Nesse filtro não há criação de chamados: os cenários não pertencem a uma conta e um novo cadastro manual ficaria fora da seleção. Volte a Todos os simulados para cadastrar. A gestão de status/prioridade dos cenários continua disponível ao administrador.
7. Como administrador, altere o status de `fixture-v1-01` de aberto para análise. O conjunto passa a ter 1 aberto e 3 em análise. Carregar conjunto fixo novamente não desfaz a edição nem duplica os cenários.
8. Pressione Restaurar conjunto fixo e cancele: a edição permanece. Repita e confirme a restauração: o cenário volta ao estado original, e os totais voltam aos valores abaixo. A mensagem avisa que as edições nos próprios cenários fixos serão descartadas; chamados manuais, inclusive fotos, e legado permanecem.
9. Volte a Avaliação local e confira o chamado manual anterior. Recarregue ou alterne contas: os dados e o modo salvo permanecem; nenhum sensor é criado. Repita a seleção Somente conjunto fixo v1 quando precisar comparar os números novamente.

Se um ID reservado já pertencer a registro sem a procedência/versão esperadas ou com proprietário, a carga/restauração é recusada integralmente. Dados corrompidos também não são substituídos pela carga. Em falha de gravação/quota, o snapshot anterior é mantido e a interface apresenta erro, sem fechar a confirmação como sucesso. Não existe neste lote comando de zerar todos os chamados.

## Conjunto fixo v1 e resultados esperados

Cada chamada da fábrica cria objetos e datas novos com os mesmos valores, sem usar relógio, sorteio, GPS ou conta. Os oito cenários não têm proprietário, fotos ou análise de IA; não aparecem como próprios de um cidadão. Para testar confirmação/contestação pela conta proprietária, use um cadastro manual no modo correspondente. O conjunto inclui exemplos de confirmação/contestação já preenchidos para verificar os indicadores.

Todas as aberturas são às **12:00 UTC**, ou 09:00 em America/Sao_Paulo nas datas abaixo. As coordenadas são os centros já cadastrados das regiões de Sorocaba, não endereços de ocorrências reais. A descrição de cada registro declara que é um cenário simulado.

| ID | Abertura (2026) | Categoria | Status | Prioridade | Região | Resolução/confirmação |
| --- | --- | --- | --- | --- | --- | --- |
| `fixture-v1-01` | 01/09 | acidente | aberto | crítica | Centro | — |
| `fixture-v1-02` | 02/09 | obra | análise | alta | Zona Norte | — |
| `fixture-v1-03` | 03/09 | iluminação | atendimento | baixa | Zona Sul | — |
| `fixture-v1-04` | 04/09 | trânsito | resolvido | média | Zona Leste | 04/09, 14:00 UTC; 2 h; confirmado |
| `fixture-v1-05` | 05/09 | acidente | análise | alta | Centro | — |
| `fixture-v1-06` | 06/09 | obra | atendimento | média | Zona Norte | Contestado/reaberto; primeira duração registrada de 1 h; sem resolvedAt atual |
| `fixture-v1-07` | 07/09 | iluminação | resolvido | baixa | Zona Oeste | 07/09, 16:00 UTC; 4 h; pendente |
| `fixture-v1-08` | 08/09 | trânsito | aberto | crítica | Centro | — |

Os totais seguintes pressupõem o filtro Somente conjunto fixo v1 e os cenários sem edições ou após restauração confirmada. Todos os simulados pode ter totais maiores por incluir simulações antigas e cadastros de demonstração preservados.

| Indicador | Esperado |
| --- | --- |
| Total | 8 |
| Por categoria | 2 acidentes, 2 obras, 2 iluminação, 2 trânsito |
| Por status | 2 abertos, 2 em análise, 2 em atendimento, 2 resolvidos |
| Por gravidade | 2 graves, 4 médios, 2 normais |
| Por prioridade | 2 críticas, 2 altas, 2 médias, 2 baixas |
| Prioridade crítica em aberto | 2 |
| Prioridade alta em aberto | 2 |
| KPI Críticos (gravidade grave, não resolvido) | 2 |
| Confirmações | 1 pendente, 1 confirmada, 1 contestada |
| Por região | Centro 3; Zona Norte 2; Zona Sul 1; Zona Leste 1; Zona Oeste 1 |
| Média geral existente | 2 h 20 min: (2 h + 1 h registrada do reaberto + 4 h) / 3 |
| Média regional | Zona Norte 1 h; Zona Leste 2 h; Zona Oeste 4 h; Centro/Sul sem resolução registrada (—) |
| Série de 14 dias da demonstração | Referência 08/09/2026 18:00 UTC; em America/Sao_Paulo, 1 abertura por dia de 01 a 08/09; demais dias da janela com zero |
| Comparação semanal da demonstração | Dois atualmente resolvidos, média de 3 h na semana; sem amostra na anterior, variação calculada 0%, sem alerta de tendência |

A média geral continua incluindo a duração registrada do reaberto, conforme a regra anterior discutida em F11. Este lote documenta seu resultado, sem redefinir a métrica. A referência temporal fixa afeta os cálculos de janela do painel administrativo na demonstração; não congela o relógio do sistema, a abertura de novos cadastros, datas de alterações de status ou textos relativos como “aberto há”. Cadastros atuais em Todos os simulados podem ficar fora da janela histórica fixa; os totais gerais continuam incluindo-os. A avaliação usa o relógio corrente.

## Arquivos alterados e criados

| Arquivo | Mudança |
| --- | --- |
| `src/types/urban.ts` | Tipos de modo e procedência; versão opcional do conjunto |
| `src/lib/reportData.ts` (novo) | Rótulos, inferência conservadora do legado, seleção por modo, fábrica fixa, referência temporal e operações de carga/restauração com proteção de colisão |
| `src/lib/reportStorage.ts` | Validação opcional dos metadados, mantendo leitura de chamados antigos |
| `src/hooks/useUrbanReports.ts` | Remove sementes/temporizadores e escrita no mount; controla modo, filtro, origem no cadastro e ações explícitas; preserva metadados no patch |
| `src/components/LocalDataControls.tsx` (novo) | Controles no Perfil, seleção dos dados, diálogos de confirmação e erros |
| `src/components/SourceBadge.tsx` (novo) | Rótulo reutilizado de procedência |
| `src/pages/Index.tsx` | Faixa de contexto, ligação dos controles, conjunto selecionado para todas as telas e referência temporal na gestão |
| `src/components/Profile.tsx` | Controles dos modos e total rotulado como dados deste modo |
| `src/components/MyReports.tsx` | Origem por registro e orientação quando a seleção exclusiva não admite cadastro |
| `src/components/ReportDetail.tsx` | Procedência no detalhe e sensor antigo identificado como simulado |
| `src/components/UrbanMap.tsx` | Procedência no popup e posição do controle ajustada à faixa |
| `src/components/AdminMap.tsx` | Procedência nos pontos |
| `src/components/AdminDashboard.tsx` | Contexto local, referência temporal opcional e procedência nos recentes |
| `src/hooks/useUrbanReports.test.tsx` | Mais 9 casos de modos/dados/preservação; teste antigo de volume renomeado sem remover suas asserções |
| `src/lib/reportData.test.ts` (novo) | 6 casos: contrato fixo, contagens, independência de relógio/sorteio, cópias, preservação/restauração, colisões e procedência |
| `src/components/LocalDataControls.test.tsx` (novo) | 5 casos de ações explícitas, cancelamento, confirmação, falha e seleção |
| `documentacao/02-correcoes/lote-01-dados-controlados.md` | Este registro |
| `documentacao/02-correcoes/logs/lote-01-*.txt` | Saídas completas das verificações deste lote |

Os 56 testes anteriores foram preservados. Apenas o nome de um teste que mencionava a simulação periódica foi ajustado para refletir a ausência de geração automática; suas asserções de preservação continuam. São 20 casos adicionais, totalizando 76. A função antiga de retenção continua testada, mas não é chamada automaticamente para remover registros neste lote.

## Verificações executadas

As verificações foram executadas com dependências já instaladas, sem instalação, aprovação de scripts ou auditoria corretiva. Houve bloqueios do ambiente restrito na criação/gravação dos logs; as capturas foram repetidas com a permissão necessária. Tentativas sem captura válida não foram utilizadas como evidência de aprovação. As execuções completas abaixo têm código de saída registrado no próprio arquivo.

| Verificação | Execução final | Log completo |
| --- | --- | --- |
| `npm.cmd test` (Vitest) | 9 arquivos; 76 testes aprovados; saída 0 | [lote-01-vitest-02.txt](logs/lote-01-vitest-02.txt) |
| `npm.cmd run typecheck` | Sem erros; saída 0 | [lote-01-typecheck-02.txt](logs/lote-01-typecheck-02.txt) |
| `npm.cmd run lint` | 0 erros e 8 avisos de Fast Refresh preexistentes; saída 0 | [lote-01-lint-02.txt](logs/lote-01-lint-02.txt) |
| `npm.cmd run build` | Vite 6.4.3; aprovado; saída 0 | [lote-01-build-02.txt](logs/lote-01-build-02.txt) |

Uma rodada completa intermediária, anterior à seleção exclusiva do conjunto fixo, também passou: 74 testes, typecheck sem erros, lint com os mesmos 8 avisos e build aprovado. Logs preservados: [Vitest 01](logs/lote-01-vitest-01.txt), [typecheck 01](logs/lote-01-typecheck-01.txt), [lint 01](logs/lote-01-lint-01.txt) e [build 01](logs/lote-01-build-01.txt). Na rodada 01, PowerShell formatou mensagens `npm notice` de stderr como `NativeCommandError`; os comandos concluíram com saída 0. Na rodada final, stderr foi unido ao stdout antes da captura para preservar a saída sem essa formatação.

Os novos testes executados verificam ausência de geração/escrita inicial, passagem do tempo em ambos os modos, isolamento dos totais, propriedade entre contas, persistência do modo, inclusão idempotente, restauração restrita, proteção de registros/fotos, quota e dados corrompidos, colisões, proteção dos metadados e confirmação/cancelamento pela UI em jsdom. Os cenários e contagens fixos são assertados com valores explícitos. A tabela de médias/séries acima descreve os resultados esperados pela regra existente; não constitui nova execução visual desses gráficos no navegador.

Também foram executados `git diff --check` (sem erros de whitespace) e comparação SHA-256 das evidências iniciais e dos arquivos de dependências. Todos os logs, prints e relatório HTML iniciais, `package.json`, `package-lock.json`, `bun.lock` e `bun.lockb` permaneceram idênticos. O diagnóstico também estava idêntico na conferência intermediária; na conferência final, seu hash diferiu apenas por formatação de finais de linha/espaços em branco finais: normalizando esses elementos, o hash original foi reproduzido. Nenhuma operação deste lote escreveu nesse arquivo, e essa diferença não foi revertida. Os achados e resultados do diagnóstico permanecem iguais. O build atualizou somente a saída gerada ignorada em `dist/`, além das alterações de fonte/documentação listadas. Não houve Playwright, alteração de seu relatório inicial, chamada real ao Gemini, commit ou publicação.

## Pendências e próxima validação

- Executar Playwright em etapa posterior, com saídas e relatório próprios deste lote, preservando o relatório inicial. Validar troca de contas, modos, cancelamento/confirmação e recuperação dos chamados no navegador integrado.
- Conferir visualmente a faixa superior, mapas, diálogos, filtro do conjunto e indicadores, incluindo telas pequenas. A aprovação de testes jsdom, typecheck e build não é avaliação visual ou multidispositivo.
- Conferir no painel os totais, médias e série documentados, com o conjunto restaurado e o filtro exclusivo. Ainda não foi acrescentado teste independente de renderização dos gráficos administrativos.
- Delimitar legado de origem desconhecida antes de usar dados como resultados empíricos; metadados locais não são prova de procedência e continuam editáveis pelo navegador.
- Resolver os demais achados do diagnóstico conforme o escopo de lotes posteriores: autenticação/permissões, GPS/localização manual, histórico e regras de confirmação, revisão humana da IA, acessibilidade, quota/backup, concorrência e dependências vulneráveis. Eles não foram declarados resolvidos por este lote.
- Se a avaliação exigir iniciar uma base manual vazia, planejar exportação e reinicialização explícita em lote próprio; nenhuma função de limpeza global foi adicionada para evitar perda dos chamados existentes.