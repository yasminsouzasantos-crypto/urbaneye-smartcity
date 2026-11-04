# Diagnóstico técnico do UrbanEye para validação acadêmica

Data: 03/11/2026. Branch: `validacao-academica`. Commit analisado: `e2b857554605d2f6848c6c0227e6a9e64c980efd`, também identificado como HEAD durante esta revisão.

## 1. Parecer e escopo

O UrbanEye sustenta uma demonstração funcional local de abertura, acompanhamento e gestão de ocorrências. As evidências disponíveis não sustentam afirmar autenticação segura, operação compartilhada entre dispositivos, integração real validada com Gemini ou indicadores representativos de uma cidade. A validação acadêmica deve distinguir a avaliação da interface e das regras locais da avaliação de segurança, integração e qualidade da classificação visual.

Esta etapa é exclusivamente diagnóstica. Nenhum código, configuração, dependência ou evidência anterior foi alterado. Não foram executados instalação, aprovação de scripts, `npm audit fix`, deploy, commits ou chamadas ao Gemini. O único artefato criado é este documento, no caminho relativo solicitado dentro do repositório.

**Localização das evidências:** a estrutura atual foi conferida dentro de `urbaneye-smartcity`: `documentacao/01-diagnostico/` existe neste checkout e `../documentacao/01-diagnostico/` não existe. Os logs estão em `logs/`, os prints em `prints/` e o relatório HTML em `playwright-report-inicial/`, todos relativos à pasta deste documento. Os links abaixo apontam para essas evidências locais, sem copiá-las ou alterá-las. Arquivos e linhas do código referem-se ao commit acima; os caminhos partem da raiz do repositório. Intervalos de linhas são indicativos do trecho relevante.

**Método:** inspeção estática dos fluxos, testes, manifesto, lockfile e configuração; consulta aos logs iniciais e aos avisos públicos de segurança referenciados pelo audit. As verificações adicionais foram somente leituras e consultas: confirmação de branch/HEAD/estado do Git, inventário, busca de referências e extração em memória de versões e relações do `package-lock.json`. Não houve nova execução de testes, build, typecheck, lint, auditoria npm ou aplicação no navegador. Cenários descritos como consequência do código não são reproduções dinâmicas. Os prints e o relatório HTML foram inventariados; os resultados quantitativos foram extraídos dos logs, sem alegar nova avaliação visual das telas.

Classificação dos achados:

- **D — defeito confirmado por inspeção:** o fluxo permite ou produz o comportamento indicado; quando condicional, a condição é explicitada. Não significa exploração executada.
- **S — suspeita:** há mecanismo plausível, mas falta reprodução ou conhecimento da implantação.
- **L — limitação do protótipo:** restrição arquitetural ou funcional identificável; deve ser declarada no trabalho e tratada conforme o objetivo da validação.
- Nas dependências, a **presença de versão reportada é confirmada**; exploração no UrbanEye é uma conclusão separada.

Prioridades: **P1** antes de um piloto compartilhado ou de afirmar segurança/integridade dos resultados; **P2** antes de uma avaliação funcional ampliada; **P3** melhoria de manutenção ou experiência. Nenhum incidente remoto ou exploração crítica foi reproduzido nesta revisão.

## 2. Evidências iniciais aproveitadas

| Verificação anterior | Resultado registrado | Evidência original e limite da conclusão |
| --- | --- | --- |
| Vitest | 7 arquivos, 56 testes aprovados | [04-npm-test-inicial.txt](logs/04-npm-test-inicial.txt). 55 verificações funcionais/técnicas e um teste trivial `expect(true).toBe(true)`; aprovação não equivale a percentual de cobertura. |
| TypeScript | Sem erros reportados | [05-npm-typecheck-inicial.txt](logs/05-npm-typecheck-inicial.txt). `strict: false` em `tsconfig.app.json:25` e `skipLibCheck: true` na linha 24 reduzem as garantias. O comando não demonstra validação de tipos pelo runtime Deno da função. |
| ESLint | 0 erros, 8 avisos | [06-npm-lint-inicial.txt](logs/06-npm-lint-inicial.txt). Avisos de Fast Refresh em sete componentes de UI e `useAuth.tsx:186`; não são prova de falha funcional. |
| Build | Aprovado, Vite 6.4.3 | [07-npm-build-inicial.txt](logs/07-npm-build-inicial.txt). Confirma empacotamento naquele ambiente, sem validar serviços remotos. |
| Playwright | 3 testes aprovados | [08-npm-e2e-inicial.txt](logs/08-npm-e2e-inicial.txt). Gemini/Edge, geocodificação e tiles interceptados; geolocalização simulada. |
| Auditoria | 29 registros: 23 moderados, 4 altos, 2 críticos | [02-npm-audit-inicial.txt](logs/02-npm-audit-inicial.txt). Inclui dependências afetadas indiretamente; não são 29 ataques distintos comprovados. |
| Instalação/scripts | Quatro scripts bloqueados | [01-npm-install-inicial.txt](logs/01-npm-install-inicial.txt) e [03-npm-install-scripts-inicial.txt](logs/03-npm-install-scripts-inicial.txt): esbuild 0.18.20, 0.25.12, 0.28.2 e @swc/core 1.13.2. |
| Ambiente | Node v24.15.0; npm 12.0.2; branch/commit correspondentes | [09-ambiente-e-versao-inicial.txt](logs/09-ambiente-e-versao-inicial.txt). O erro de transcrição anterior (`12.0.2s`) no log 09 foi corrigido pelo responsável para `12.0.2`, conforme a saída original do npm; esta atualização apenas registra a correção já realizada. |

Demais evidências locais: [relatório HTML inicial do Playwright](playwright-report-inicial/index.html) e [pasta de prints iniciais](prints/). A correção de localização e versão do npm preserva os achados técnicos e os resultados iniciais. Nenhum teste foi executado novamente nesta atualização.

## 3. Cadastro, login, permissões e persistência

### F01 — Autorização administrativa controlada pelo navegador

**D/L · P1. Arquivos:** `src/pages/Login.tsx:118`; `src/hooks/useAuth.tsx:56–69,97–123,158–166,179`; `src/App.tsx:17–22`; `src/hooks/useUrbanReports.ts:192,213,232`.

**Evidência estática:** o cadastro oferece Administrador e grava o papel escolhido. `readSession` aceita o papel do JSON local sem consultar uma autoridade; os bloqueios de rota e de mutação dependem desse papel. O método legado `login(role)` também cria uma sessão sem senha, embora não tenha sido encontrado uso dele na interface atual.

**Impacto:** qualquer participante pode se cadastrar administrador pela própria UI. Alterar a sessão local permite assumir papel/identidade sobre os dados daquele navegador. Os controles de interface não constituem uma fronteira de autorização. O alcance observado é o armazenamento local; não foi demonstrado acesso a banco remoto.

**Recomendação:** para piloto, autenticar no servidor, provisionar administradores por processo restrito e verificar papel/propriedade em toda operação persistente. Remover a entrada demo da versão destinada ao piloto. Para apresentação estritamente local, declarar explicitamente que os papéis são simulados. Testar que cadastro público nunca concede administração e que requisições sem autorização são recusadas no servidor.

### F02 — Dados, sessão e acompanhamento existem somente por origem/perfil de navegador

**L · P1 para validação com pessoas em dispositivos distintos. Arquivos:** `src/hooks/useAuth.tsx:33–34,44,53,93`; `src/hooks/useUrbanReports.ts:85–94,126–143`; `src/lib/reportStorage.ts:5,46`; `docs/ai-image-triage.md:7`; `src/integrations/supabase/types.ts:16–23`.

**Evidência estática:** contas, sessão, chamados e fotos ficam no `localStorage`. O Supabase é utilizado na análise da foto, não no CRUD dos chamados; os tipos de banco não declaram tabelas. `MyReports.tsx:15` filtra o conjunto local por `mine`.

**Impacto:** um administrador em outro celular, computador, perfil, porta ou hostname não acompanha os chamados do cidadão. Limpeza de dados/perfil privado pode eliminar o histórico; logout não apaga os dados compartilhados naquele perfil. Todos os registros e fotos ficam acessíveis ao JavaScript da mesma origem, mesmo quando a UI esconde a foto de terceiros. A aplicação não fornece backup/restauração ou sessão com prazo de expiração. Não se pode validar colaboração municipal real com esse mecanismo.

**Recomendação:** persistência central com identificadores de usuário verificados, autorização por registro e política de acesso a fotos; definir retenção e recuperação. Até lá, usar contas fictícias e um mesmo perfil/origem no roteiro e descrever a persistência como local. Não apresentar ocultação visual de fotos como controle de confidencialidade.

**Aspectos positivos observados:** normalização de e-mail, validação básica de cadastro e PBKDF2-SHA256 com sal de 16 bytes e 600.000 iterações (`src/lib/password.ts:2–37`); migração da senha legada; cancelamento de login pendente ao sair. Esses cuidados protegem parcialmente a senha armazenada, mas não resolvem F01/F02.

### F03 — Registros legados sem proprietário podem pertencer a qualquer conta local

**D condicional · P2. Arquivos:** `src/lib/reportStorage.ts:26–27`; `src/hooks/useUrbanReports.ts:120,223`; `src/pages/Index.tsx:200`.

**Evidência estática:** o schema aceita `mine: true` sem `ownerId`; o hook mantém esse valor para qualquer usuário e a confirmação/contestação usa o mesmo fallback. Novos chamados recebem `ownerId` na linha 186; o defeito depende de registro legado nessa forma.

**Impacto:** em uma base local antiga, outra conta pode receber o chamado em “Meus chamados”, ver sua foto pela interface e confirmar/contestar uma resolução alheia. O teste atual de isolamento usa proprietário preenchido e não cobre esse caso.

**Recomendação:** migrar legado com associação explícita/verificada de proprietário ou tratá-lo como sem dono, sem ações pessoais. Criar cenário com duas contas e registro sem `ownerId` antes de considerar resolvido.

### F04 — Atualização de várias abas não é uma transação

**S · P2. Arquivos:** `src/hooks/useUrbanReports.ts:126–138`; `src/hooks/useAuth.tsx:112–123`; `src/hooks/useUrbanReports.test.tsx:63–70`.

**Evidência estática:** as operações leem, modificam e sobrescrevem um JSON inteiro; não há bloqueio, revisão de versão ou transação entre abas. A releitura implementada preserva uma alteração que já terminou antes da leitura, e esse é o caso testado. Não cobre duas abas que leem o mesmo snapshot antes de qualquer escrita.

**Impacto possível:** perda da última inclusão/alteração concorrente; contas também podem competir pela mesma lista. Não reproduzido nesta etapa.

**Recomendação:** investigar com duas abas sincronizadas; adotar transações no backend. Se o escopo continuar local, serializar gravações entre contextos com mecanismo compatível e recuperação, sem alegar que o evento `storage` garante atomicidade.

### F05 — Sem GPS válido, o chamado é salvo na posição padrão

**D · P1 para validade geográfica. Arquivos:** `src/hooks/useGeolocation.ts:11–15,34–37`; `src/types/urban.ts:158`; `src/pages/Index.tsx:57–66`; `src/components/ReportModal.tsx:203–222`; `src/components/UrbanMap.tsx:8–35`.

**Evidência estática:** a posição inicia em Sorocaba e continua disponível quando a permissão é negada ou há timeout. O envio não consulta `loading`, `hasPermission`, idade ou precisão da posição; não existe seleção manual da ocorrência. O marcador “Você está aqui” também é renderizado sem GPS; a permissão só condiciona a centralização inicial.

**Impacto:** um cidadão pode registrar ocorrência ficticiamente no centro padrão durante a espera ou após falha do GPS. Após erro transitório, pode enviar uma posição antiga. Isso contamina mapas e indicadores, mesmo com descrição e foto corretas.

**Recomendação:** distinguir posição de visualização e posição validada da ocorrência, oferecer ponto manual no mapa, informar precisão/origem/idade e exigir confirmação antes de salvar. Cobrir ausência/negação/timeout, posição obsoleta e envio antes da localização.

### F06 — Erros de armazenamento são tratados, mas capacidade continua limitada

**L · P2. Arquivos:** `src/lib/urban.ts:111–150`; `src/lib/reportStorage.ts:50–62`; `src/hooks/useUrbanReports.ts:126–149`; `src/components/ReportModal.tsx:221–228`.

**Evidência:** fotos são reduzidas para JPEG com maior lado de 900 px e qualidade 0,6; o JSON completo é regravado a cada alteração. Cidadãos não são descartados pela retenção de sensores. Os testes iniciais cobrem quota excedida, dados corrompidos e manutenção do rascunho/foto; isso é uma proteção efetiva dentro do escopo testado.

**Impacto:** compressão não garante espaço para volume crescente; atingir a quota impede novas gravações, inclusive gestão. Regravar e analisar toda a lista de forma síncrona pode prejudicar dispositivos lentos. Não há limite medido de chamados/fotos ou de tempo por operação.

**Recomendação:** definir volume-alvo e medir com fotos reais anonimizadas; guardar binários fora do JSON e, para uso compartilhado, em serviço com política de acesso. Oferecer recuperação/exportação antes de remover qualquer dado. Não recomendar limpeza indiscriminada do navegador como correção.

## 4. Status, prioridade, resolução e contestação

O fluxo implementado permite ao administrador alterar status e prioridade, registrar resolução e aguardar resposta do proprietário. Contestação retorna a `atendimento`, define `reopened` e conserva a primeira duração; nova resolução atualiza `resolvedAt`. O teste em `useUrbanReports.test.tsx:90` cobre esse ciclo e evita reiniciar a confirmação ao selecionar novamente o mesmo status. Os tipos e badges separam gravidade e prioridade; gravidade inicial é determinada pela categoria, não pela avaliação visual da IA (`useUrbanReports.ts:26–33,169–175`).

### F07 — Histórico de decisões é um snapshot, sem trilha de eventos

**L · P2. Arquivos:** `src/hooks/useUrbanReports.ts:192–208,220–228`; `src/types/urban.ts` (estrutura `UrbanReport`); `src/components/ReportDetail.tsx:309–343`.

**Evidência estática:** todos os status são selecionáveis, inclusive retorno de resolvido para aberto/análise. Sair de resolvido limpa data e confirmação; resolver de novo substitui a contestação por `pendente`. Permanecem apenas alguns campos resumidos, sem lista de eventos com autor, data, justificativa, evidência de execução ou número de contestações.

**Impacto:** não é possível reconstruir o atendimento, provar quem alterou prioridade/status ou separar ciclos de resolução. A declaração de que “histórico é preservado” no comentário do hook refere-se à duração/indicador de reabertura, não a uma auditoria completa. Transições livres são uma decisão de protótipo, não defeito de regra comprovado sem requisitos adicionais.

**Recomendação:** formalizar transições permitidas e critérios de resolução, registrar eventos imutáveis e justificativa/evidência, preservar contestações anteriores. Definir se o indicador mede primeira resposta, primeira resolução ou resolução final, com testes por ciclo.

### F08 — Administrador pode abrir chamado próprio, mas não confirmar sua resolução

**D · P2. Arquivos:** `src/pages/Index.tsx:168–179`; `src/hooks/useUrbanReports.ts:185–186`; `src/components/ReportDetail.tsx:258`.

**Evidência estática:** o botão de criação está disponível também para administradores nas abas mapa/meus chamados. A confirmação só aparece quando `!canManage && isOwner`. O login recupera o papel da conta; não existe alternância para cidadão mantendo a mesma identidade.

**Impacto:** o chamado próprio de administrador pode ficar pendente indefinidamente pela interface, mesmo estando resolvido. Sementes resolvidas sem proprietário também geram pendências que nenhum cidadão pode confirmar.

**Recomendação:** decidir se administrador pode abrir chamados e como se aplica confirmação nesse caso; permitir a resposta do proprietário com separação de responsabilidades ou impedir criação nesse perfil. Não delegar confirmação a uma conta diferente como se fosse o autor.

## 5. Mapas, filtros e indicadores

### F09 — Dados sintéticos e sensores automáticos alteram os resultados da avaliação

**L · P1 para validade acadêmica. Arquivos:** `src/hooks/useUrbanReports.ts:40–89,238–278`; `src/components/AdminDashboard.tsx:58–151`; `src/components/AdminMap.tsx:15–34`.

**Evidência estática:** primeiro acesso gera 64 ocorrências aleatórias com distribuição, status e confirmações simulados; a cada 15 segundos há nova leitura de sensor simulada próxima ao usuário. Sementes não recebem campo específico de procedência; são distinguíveis principalmente pelo ID `seed-*`. Sensores têm `isSensor`, mas totais, séries, ranking e mapa de calor agregam todos os registros sem separar a origem. A simulação continua quando outras abas internas estão abertas.

**Impacto:** números mudam entre instalações e durante uma tarefa. Ranking e tempos não medem desempenho municipal; podem medir os parâmetros aleatórios. Sensores simulados tampouco comprovam integração IoT.

**Recomendação:** modo de demonstração explicitamente rotulado, fixtures determinísticas e modo de coleta acadêmica sem geração automática. Separar proveniência e excluir dados sintéticos dos resultados do estudo. Fixar dataset, período e critério de cálculo antes das sessões.

### F10 — Região é o centro mais próximo, sem delimitação territorial

**L · P2. Arquivos:** `src/lib/urban.ts:3–14`; `src/types/urban.ts:158` e lista `REGIONS`; `src/hooks/useUrbanReports.ts:184`; `e2e/urbaneye.spec.ts:14–15`.

**Evidência estática:** qualquer latitude/longitude é atribuída ao centro cadastrado com menor distância quadrática em graus, sem limite municipal/polígonos. O teste E2E usa São Paulo, fora de Sorocaba, mas não verifica a região atribuída. O mapa administrativo inicia sempre em Sorocaba (`AdminMap.tsx:50`).

**Impacto:** chamados externos ou próximos a fronteiras podem receber região incorreta e aparecer longe do enquadramento inicial; ranking por bairro não representa uma divisão oficial.

**Recomendação:** delimitar área de atendimento e validar ponto em polígono oficial; explicitar “fora da área” e oferecer enquadramento dos resultados. Se a aproximação continuar, documentar sua natureza e não tratá-la como georreferenciamento de bairro validado.

### F11 — Indicadores de resolução e criticidade precisam de definição consistente

**L · P2. Arquivos:** `src/lib/urban.ts:49–53`; `src/components/AdminDashboard.tsx:66,70–85,88–100,132,172–184`; `src/hooks/useUrbanReports.ts:203–204`.

**Evidência estática:** média geral/regional inclui `resolutionMsRecorded` de chamados reabertos; comparação semanal só inclui os atualmente resolvidos. Após nova resolução, a média passa a usar a duração até o novo `resolvedAt`. O KPI “Críticos” usa gravidade `severe`, enquanto o alerta de “prioridade crítica” usa `priority === 'critica'`.

**Impacto:** a média geral pode incluir atendimento contestado enquanto a semanal o exclui; um chamado de prioridade crítica e gravidade normal não entra no KPI “Críticos”. Isso pode ser intencional, mas sem definição induz interpretações divergentes. Não foi encontrado teste de agregação independente para esses cenários.

**Recomendação:** definir população, denominador, ciclo de resolução e significado de cada indicador; usar rótulos inequívocos, como “gravidade alta” e “prioridade crítica”; separar tempos de primeira resolução e encerramento confirmado. Validar os números com um conjunto pequeno calculado manualmente, incluindo reabertos e pendentes.

### F12 — Filtros e mapa de calor têm escopo restrito

**L · P2. Arquivos:** `src/components/AdminDashboard.tsx:218–224,428–459,517`; `src/components/AdminMap.tsx:15–34`; `src/components/UrbanMap.tsx:104–107`; `src/components/MyReports.tsx:15`.

**Evidência estática:** o filtro por prioridade altera somente a lista “Chamados recentes”, limitada a oito registros; mapa e indicadores recebem a lista integral. Não foram identificados filtros por período, status, tipo ou região. O calor é uma contagem por célula de 0,006 grau, relativa ao máximo atual, incluindo resolvidos, sementes e sensores; não é uma estimativa ponderada de risco.

**Impacto:** limita investigação e comparação de ocorrências; a cor pode mudar quando outro local ganha registros, sem mudança na célula observada. O filtro não é defeituoso por deixar KPIs intactos, pois está inserido na seção de recentes; falta escopo de filtragem analítica mais amplo.

**Recomendação:** declarar o alcance atual e definir filtros comuns caso o estudo exija análise territorial/temporal. Documentar unidade e normalização do calor, oferecer legenda e separar ocorrências ativas, históricas e simuladas. Testar listas vazias, contagens, filtro combinado e limitação/paginação.

## 6. Triagem por IA e tratamento de falhas

Há salvaguardas concretas no código: análise somente por ação do usuário, aviso sobre envio ao Gemini, aplicação manual da sugestão, limiar de confiança de 0,72, validação de resposta no cliente, marcação de revisão humana, opção de manter/substituir/acrescentar descrição, cancelamento e descarte de respostas antigas. A função limita corpo e imagem, verifica assinatura inicial JPEG/PNG/WebP, impõe timeout de 25 s e não escreve a foto nos logs (`src/lib/aiAnalysis.ts:35–69,98–115`; `ReportModal.tsx:128–239,436–437`; função:162–189,256–287,335–385). A assinatura inicial não é uma decodificação completa do arquivo. Os testes isolados usam fetch e Deno simulados; o tratamento de erros implementado não prova disponibilidade remota.

### F13 — Endpoint de IA exige chave pública, sem autenticar o cidadão

**D/L · P1 antes de exposição pública. Arquivos:** `supabase/config.toml:5–6`; `supabase/functions/analyze-urban-image/index.ts:79–89,108–136,245–249`; `docs/ai-image-triage.md:101–102`.

**Evidência estática:** JWT desabilitado, chave publicável como credencial única e requisição sem `Origin` aceita. A chave é parte da configuração do cliente e não identifica usuário. A limitação usa um mapa em memória por instância e endereço dos cabeçalhos de encaminhamento.

**Impacto:** quem obtiver a chave pública pode solicitar análises sem conta local e consumir cota se a função estiver publicada/configurada. CORS restringe navegador, mas não autentica clientes HTTP. Reinícios e múltiplas instâncias não compartilham contador. Falsificação de IP depende do tratamento dos cabeçalhos pelo gateway e permanece **suspeita de implantação**, não bypass reproduzido.

**Recomendação:** autenticação de usuário verificável, limite durável por usuário/IP confiável, teto global de custo e concorrência. Manter rejeições de tamanho/origem como defesa complementar. Verificar o comportamento do gateway em ambiente isolado antes de afirmar proteção por IP. O próprio guia já reconhece essas pendências.

### F14 — Contrato remoto e qualidade da IA não foram validados pelas evidências

**L/S · P1 para afirmar eficácia da IA; P2 para demonstração manual. Arquivos:** função `index.ts:5,285,291–329`; `src/lib/edgeAnalysis.test.ts:18–25,56–79`; `e2e/urbaneye.spec.ts:4–31`; `docs/ai-image-triage.md:89–106`.

**Evidência:** o modelo configurável tem padrão `gemini-3.6-flash`; os testes fabricam o JSON retornado e não verificam aceitação do payload/modelo pelo provedor. O E2E intercepta a chamada antes de executar a Edge Function. Não há dataset rotulado ou métricas de acerto por classe. Nada nesta revisão comprova ou refuta disponibilidade do modelo, configuração do projeto, cotas, latência real ou compatibilidade do contrato remoto.

**Impacto:** os 56/3 testes aprovados não demonstram que uma imagem real será classificada com sucesso, nem que “90% de confiança” corresponde a 90% de acerto. Riscos de cenas noturnas, ambíguas e tentativas de instrução na imagem permanecem sem avaliação empírica.

**Recomendação:** manter contrato simulado para regressão e criar avaliação separada, posteriormente autorizada, com imagens anonimizadas/rotuladas e versão de modelo/prompt registrada. Medir matriz de confusão, precisão/recall por classe, falsos positivos em imagens sem ocorrência, revisão humana, erros/latência e efeito das sugestões sobre o cidadão. Confirmar contrato em documentação oficial antes dessa etapa e realizar integração controlada somente quando autorizada. Não houve chamada real nesta revisão.

### F15 — Revisão humana é metadado, sem fila operacional

**L · P2. Arquivos:** `src/components/ReportModal.tsx:420–423`; `src/components/ReportDetail.tsx:168–216`; `src/components/AdminDashboard.tsx:56,218–224`; `src/hooks/useUrbanReports.ts:169–175`.

**Evidência estática:** `needsHumanReview` é mostrado no detalhe, mas não há fila/filtro, responsável ou registro de conclusão da revisão. Gravidade/prioridade continuam derivadas da categoria, mesmo quando a IA sugere risco maior; aplicar a sugestão altera categoria/texto, não a decisão técnica de prioridade.

**Impacto:** uma sinalização importante pode não receber atenção operacional. Isso não prova erro da IA nem justifica automatizar prioridade; indica ausência de mecanismo para executar a revisão anunciada.

**Recomendação:** tornar casos sinalizados encontráveis, registrar responsável/decisão e distinguir sugestão visual de gravidade/prioridade técnica. Manter possibilidade de criar chamado manual quando IA falhar. Cobrir 401/403/413/429/503/timeout/JSON inválido também na UI, incluindo preservação do rascunho e nova tentativa.

## 7. Dependências e vulnerabilidades

A análise abaixo combina o audit inicial com as versões do lockfile e avisos consultados em 03/11/2026. Não é uma nova execução de `npm audit`. As correções são opções para uma etapa futura: **compatibilidade provável dentro de uma major não equivale a atualização testada**. “No fix available” do npm pode significar falta de solução na árvore/intervalos atuais, mesmo quando o pacote upstream já possui versão corrigida.

Os 29 registros se agrupam nas famílias abaixo. Além dos pacotes raiz dos avisos, o relatório propaga vulnerabilidade para `vitest`, `drizzle-kit`, `@esbuild-kit/core-utils`, `@esbuild-kit/esm-loader`, `sucrase`, `@tailwindcss/typography`, `react-router-dom`, `@eslint/config-array`, `@eslint/eslintrc`, `eslint`, `@eslint-community/eslint-utils`, `@typescript-eslint/utils`, `@typescript-eslint/eslint-plugin`, `typescript-eslint`, `@typescript-eslint/type-utils`, `@typescript-eslint/parser`, `eslint-plugin-react-refresh` e `@typescript-eslint/typescript-estree`. A contagem não pode ser somada novamente por advisory ou por cópia instalada.

| ID / prioridade e natureza | Dependência, versão e arquivo/linha | Condição, evidência e impacto no contexto | Opção de correção compatível ou migração necessária |
| --- | --- | --- | --- |
| V01 · P2; P1 se ferramentas de teste expostas. Versões reportadas confirmadas; exploração não comprovada | Direta dev `vitest` 3.2.7 → transitivas `@vitest/mocker` 3.2.7 e `tinypool` 1.1.1. `package.json:98`; `package-lock.json:4121,8123,9064` | Mocker exige acesso ao WebSocket/plugin de mocks; permite leitura de arquivo ou injeção de JS. Tinypool tem gadgets de execução de código dependentes de poluição prévia do protótipo e módulo/opções controlados. Não foi encontrada uma origem de poluição alcançável a partir do formulário. Vitest atual usa Node/jsdom, sem Browser Mode configurado. Os dois registros críticos do audit não comprovam RCE no site estático. Fontes: [leitura de arquivos](https://github.com/advisories/GHSA-82fw-gwwq-j7x9), [injeção em mocks](https://github.com/advisories/GHSA-qxg6-89mg-rqv8), [opções do worker](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3), [opções de run](https://github.com/advisories/GHSA-85c8-ppgw-ccpr). | Mocker: correção conjunta a partir de 4.1.12 ou 5.0.3; tinypool: pelo menos 2.1.2 para ambos os avisos. Migrar Vitest de forma coordenada com seus pacotes e confirmar a árvore efetivamente resolvida; o audit sugere 5.1.0, mudança de major. Não forçar tinypool 2 sobre o intervalo `^1.1.1` do Vitest 3 sem validar a API. Manter ferramentas inacessíveis externamente. |
| V02 · P1 no ambiente de desenvolvimento compartilhado. Versão reportada confirmada | Direta dev Vite 6.4.3. `package.json:97`; `package-lock.json:8935`; `vite.config.ts:8–9` expõe host `::` | Avisos de abertura de editor no Windows, injeção por middleware e leitura fora da raiz. Windows é pertinente ao ambiente, mas acesso ao endpoint/editor e demais precondições não foram explorados. O bypass de existência pode dispensar criação de arquivo malicioso. O caso de flags de editor em Vite depende de WSL/editor afetado; o de arquivos externos exclui Windows; middleware customizado não foi identificado. Impacto principal: máquina do desenvolvedor, não o `dist` servido estaticamente. Fontes: [escape no Windows](https://github.com/advisories/GHSA-698v-4r3x-3vcv), [flags de editor](https://github.com/advisories/GHSA-r825-w8mm-5pxw), [bypass Windows](https://github.com/advisories/GHSA-587h-7wmj-h5pm), [middleware](https://github.com/advisories/GHSA-9jrq-w75r-8gcw), [arquivos externos](https://github.com/advisories/GHSA-rq7h-c2jc-7f22). | Atualização candidata para Vite 6.4.4 ou posterior corrigida na linha 6, dentro de `^6.4.3`; confirmar todos os avisos no lockfile futuro. Durante avaliação, preferir servidor de arquivos de produção e restringir dev server à interface necessária. Não é necessário migrar automaticamente para Vite 7/8 para tratar esses avisos. |
| V03 · P2. Versão reportada confirmada; recurso vulnerável não usado pelo fluxo encontrado | Direta dev `drizzle-kit` 0.31.10 → `@esbuild-kit/esm-loader` → `core-utils` → esbuild 0.18.20. `package.json:84`; `package-lock.json:542,5091` | [CORS do servidor esbuild](https://github.com/advisories/GHSA-67mh-4wv8-2f99) permite leitura por site malicioso quando esse servidor está em execução e o usuário visita o site. Ter o binário instalado ou usá-lo para build não satisfaz essa condição. Outras cópias 0.25.12 e 0.28.2 não estão no intervalo desse aviso. Não foi encontrado uso do servidor esbuild por Drizzle no projeto; schema está vazio. | Corrigido no esbuild 0.25.0. Avaliar remoção de ferramentas Drizzle não utilizadas ou versão do ancestral que substitua o loader antigo. Não aceitar o downgrade automático para drizzle-kit 0.18.1 sugerido pelo audit sem investigação. Override entre majors de esbuild exige teste específico do loader/build. |
| V04 · P2. Versões reportadas confirmadas | Transitiva `brace-expansion` 1.1.18 e 2.1.4 via minimatch/ESLint, typescript-eslint e glob. `package-lock.json:4471,4022,5963`; diretas relacionadas `package.json:86,94,96` | Padrões não confiáveis podem causar CPU excessiva ou estouro de pilha; não há caminho encontrado entre descrição/foto do cidadão e expansão de globs. Risco maior em ferramentas que processam repositórios/padrões não confiáveis. Fontes: [complexidade quadrática](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr), [grupos aninhados](https://github.com/advisories/GHSA-qhr7-859c-m2p7), [parseCommaParts](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p). | 1.1.21 e 2.1.7 tratam os três avisos nas linhas correspondentes. São candidatas dentro dos intervalos transitivos `^1.1.7` e `^2.0.2`; atualizar resolução de cada cópia em etapa controlada, sem trocar tudo por major 5. |
| V05 · P2. Versão reportada confirmada | Transitiva glob 10.5.0 via Tailwind → sucrase; `package-lock.json:5930`; `package.json:94` | [Cancelamento incompleto](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4): travessia pode continuar após abort, gastando CPU/I/O. Requer uso de glob cancelável sobre árvore custosa/controlável. Sem caminho remoto do app identificado. Lockfile marca glob como não exclusivamente dev; isso sozinho não prova presença no bundle do navegador. | Aviso aponta 14.0.2. Não cabe no `^10.3.10` do sucrase. Atualizar o ancestral com suporte à correção, buscar backport ou substituir a cadeia; não forçar glob 14 sem confirmar Node/API e testar build. |
| V06 · P2. Versões reportadas confirmadas; aplicabilidade por versão/uso precisa ser apurada | Transitivas minimatch 3.1.5 e 9.0.9 via ESLint, typescript-eslint e glob. `package-lock.json:6622,4032,5972`; `package.json:86,96` | [Amplificação de globparts](https://github.com/advisories/GHSA-g3hv-75wg-m249): descrição demonstra caminho com `optimizationLevel >= 2`; o aviso marca `<11.0.1`. Nas cópias locais 9.0.9 há `firstPhasePreProcess` e `globParts.push`; o padrão é nível 1. Não foi comprovado chamador com nível 2 e padrão hostil. A implementação 3.1.5 não deve ser tratada como reprodução do mecanismo só por corresponder à faixa ampla. | Correção upstream indicada em 11.0.1, mas fora dos intervalos 3/9 dos ancestrais. O “No fix available” inicial se refere à árvore resolvível. Buscar atualizações/backports dos ancestrais; limitar padrões e entrada não confiável. Override global para 11 pode quebrar exportações/API. |
| V07 · P2. Versões reportadas confirmadas | Transitiva postcss-selector-parser 6.0.10 via `@tailwindcss/typography` (direta dev) e 6.1.4 via Tailwind/postcss-nested. `package.json:76,94`; `package-lock.json:3551,7080` | [Seletores de alta complexidade](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) podem bloquear CPU durante parsing de CSS. Não foi identificado processamento de CSS enviado por cidadão. O plugin typography nem está habilitado em `tailwind.config.ts` (plugins: apenas animate), embora esteja instalado. | 6.1.5 é candidata para intervalos `^6.1.1`/`^6.1.2`; typography fixa exatamente 6.0.10 e exige atualizar/remover o ancestral ou override específico revisado. Evitar o downgrade para typography 0.5.4 sugerido automaticamente. Validar CSS gerado. |
| V08 · P2. Versão reportada confirmada; condições dos ataques ausentes no fluxo encontrado | Direta runtime `react-router-dom` 6.30.6 → react-router 6.30.6. `package.json:65`; `package-lock.json:7371,7386`; `src/App.tsx:38` | [Redirecionamento externo](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) exige destino controlado por atacante; navegações encontradas usam caminhos internos constantes. [Injeção em hidratação SSR](https://github.com/advisories/GHSA-337j-9hxr-rhxg) não se aplica ao modo declarativo `BrowserRouter` encontrado, sem SSR. Não há redirecionamento explorado. | Avisos indicam 7.18.0. Não cabe em `^6.30.1`; planejar migração Router 7 com testes de rotas, redirects e dependências/Node, ou backport suportado se disponibilizado. Até lá, preservar destinos internos controlados. |
| V09 · P2. Versão reportada confirmada | Transitiva source-map-js 1.2.1 via PostCSS, com caminhos também usados por ferramentas/CSS. `package-lock.json:7748`; `package.json:92`; relação PostCSS `^1.2.1` | [Offsets de source map](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) maliciosos podem bloquear o event loop quando consumidos. Não há upload de source map no app; risco principal no processamento de artefatos não confiáveis. Presença no lockfile não demonstra caminho remoto. | 1.2.2 é candidata dentro de `^1.2.1`; atualizar resolução e verificar todas as cópias/consumidores e build em etapa futura. |
| V10 · P2; P1 se passar a validar entrada remota irrestrita. Versão reportada confirmada | Direta runtime Zod 3.25.76. `package.json:71`; `package-lock.json:9408`; `src/lib/reportStorage.ts:33` | [Consumo de memória em coleções](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5): validação de arrays enormes com muitos erros. Aqui o array vem de armazenamento local e não há limite prévio de quantidade; quota local reduz alcance e o chamador precisa conseguir introduzir o conteúdo. A função de IA valida manualmente, sem Zod. Não foi demonstrado DoS remoto. | Aviso indica 4.6.6 ou superior; audit sugere 4.6.7. Migração de major exige revisar schema, transformações e consumers de formulários, inclusive compatibilidade de `@hookform/resolvers` 3.10.0. Limitar bytes/quantidade antes de JSON/Zod e adicionar recuperação de dados são mitigações, não equivalentes à atualização. |

### F16 — Scripts bloqueados deixam uma lacuna de reprodutibilidade, não uma falha comprovada

**L · P2. Evidência/arquivo:** logs 01 e 03 acima; `package-lock.json:542` e cópias de esbuild/@swc/core; scripts `package.json:7–15`.

**Impacto:** build e testes funcionaram no ambiente registrado apesar dos bloqueios. Isso não permite concluir que os scripts sejam desnecessários em máquina limpa, outra arquitetura ou outra versão de Node; binários opcionais já instalados podem explicar o sucesso, mas essa explicação não foi comprovada. Os bloqueios também não demonstram pacote malicioso.

**Recomendação:** futura instalação limpa e isolada com lockfile, Node/npm e plataforma registrados, política de scripts explícita e revisão individual da origem/conteúdo dos scripts. Validar o binário correspondente a cada cadeia e executar os checks necessários. Não aprovar scripts automaticamente e não usar os resultados desta máquina como prova de portabilidade. Definir gerenciador canônico: existem `package-lock.json`, `bun.lock` e `bun.lockb`, e instalações por ferramentas diferentes podem resolver árvores distintas.

## 8. Cobertura de testes e cenários ausentes

Não há relatório de cobertura percentual nas evidências. A contagem de testes não mede cobertura de requisitos. `vitest.config.ts:7–12` usa jsdom por padrão; `edgeAnalysis.test.ts:1,18–25` executa o handler sob Node com Deno/fetch simulados, sem gateway/deploy Deno real. Typecheck e build frontend não substituem essa validação.

| Área e referências | Cobertura demonstrada pelos testes iniciais | Cenários ainda necessários (propostos; não executados nesta etapa) |
| --- | --- | --- |
| Contas — `useAuth.test.tsx:13–69` | Cadastro/login/logout local, senha incorreta, derivação/migração, dados inválidos preservados, storage bloqueado, sessão malformada e cancelamento | Negar autopromoção administrativa; rota `/gestao` para cidadão/anônimo; sessão forjada/expirada; e-mail duplicado/normalizado; concorrência de cadastro em duas abas; falha ao salvar sessão após salvar conta. |
| Chamados — `useUrbanReports.test.tsx:19–114` | Retenção, quota, dados corrompidos, lista vazia, outra aba já gravada, IDs, propriedade com ownerId, ciclo contestação/nova resolução | Legado sem proprietário; duas escritas simultâneas; confirmação/contestação por terceiro; prioridade por cidadão; todas as transições e falhas; confirmação positiva pela UI; chamado de administrador; rastro histórico. |
| Formulário/IA — `ReportModal.test.tsx:33–89`; `aiAnalysis.test.ts:25–42` | Três escolhas de descrição, decisão não aplicada, rascunho em falha, leitura de fotos fora de ordem, análise cancelada, contrato/limiar básico | Erros HTTP na UI, nova tentativa, timeout, resposta inválida, troca de conta durante análise, envio duplicado, limiar exato 0,72 e inconclusivos na UI; preservação dos campos em todas as falhas. |
| Função — `edgeAnalysis.test.ts:28–105` | Corpos inválidos, origem/chave incorretas, preflight, corpo excessivo, base64/assinatura, formatos, saída multipartes, rate limit local, erros 429/404/500 e timeout | Integração Deno/gateway isolada, origem ausente, cota distribuída, IP confiável, cold start, resposta vazia/JSON inválido/contraditório; contrato de requisição real; cancelamento upstream e limites de concorrência. |
| Utilitários — `urban.test.ts:19–89` | Rejeição/compressão com objetos de imagem/canvas simulados, liberação de URL, geocode com cache/timeout/cancelamento | Fotos reais por navegador, EXIF/orientação/HEIC, enormes dimensões; regionFor fora da cidade/fronteira; cálculos de resolução e agregações com oráculo independente. |
| E2E — `e2e/urbaneye.spec.ts:61,110,122` | Cadastro → WebP convertido → IA simulada → persistência → gestão → contestação; separação de “meus”; falha de quota preserva rascunho | Login de conta preexistente e senha incorreta pela UI; permissões negativas de rotas/fotos/gestão; GPS negado/lento; falha realista de tiles/rede; filtros, KPIs, calor, navegação direta e refresh em `/gestao`; acessibilidade e dispositivos. |

**F17 — Lacunas de validação por requisito: L · P1/P2.** Arquivos/evidências: tabela acima, `src/test/example.test.ts:5`, `playwright.config.ts:9–11`. Impacto: os resultados atuais sustentam apenas os cenários simulados efetivamente assertados. Recomendação: vincular cada requisito acadêmico a cenário, dado, resultado esperado e evidência; substituir o teste trivial por verificação relevante na próxima etapa; priorizar os casos negativos ligados a F01/F03/F05/F13 e os cálculos F09/F11 antes de ampliar quantidade de testes.

## 9. Dispositivos, rede e acessibilidade

### F18 — Compatibilidade multidispositivo não demonstrada

**L/S · P2. Arquivos:** `playwright.config.ts:9–11`; `src/components/map/MapAutoSize.tsx:19–34`; `src/lib/password.ts:13`; `src/hooks/useGeolocation.ts:29–48`; `src/components/ReportModal.tsx:293–310`; `src/lib/urban.ts:111–150`; `src/pages/Index.tsx:112`.

**Evidência:** a configuração E2E define viewport de 1280×900 e canal Edge no Windows por padrão; não há projetos WebKit/Firefox/mobile configurados. Há CSS adaptativo com `dvh`, breakpoints e rolagem, além de `ResizeObserver` e revalidação do mapa na orientação/visibilidade. Isso mostra intenção de adaptação, não teste em aparelhos distintos.

**Impacto/condições:** acesso por IP da LAN em HTTP pode impedir Web Crypto/geolocalização, ainda que localhost funcione no computador; câmera com `capture` depende do navegador e a galeria aceita formatos que podem não ser decodificados, como HEIC em certas plataformas. Telas pequenas, teclado virtual, orientação, zoom, área segura, baixo desempenho/memória e PBKDF2 precisam de medição. Não foi confirmado defeito visual específico nesses dispositivos.

**Recomendação:** matriz mínima com Android/Chrome, iPhone/Safari, desktop Chromium e Firefox, retrato/paisagem, teclado e zoom, em origem HTTPS controlada; testar captura real/galeria, negar GPS, armazenamento privado e recarga. Registrar sistema, navegador, resolução, rede e resultados sem confundir emulação de viewport com câmera/GPS/aparelho real.

### F19 — Diálogos declaram modalidade sem implementar gestão de foco

**D por inspeção do comportamento implementado; S quanto ao efeito por tecnologia assistiva · P2. Arquivos:** `src/components/ReportModal.tsx:243–245`; `src/components/ReportDetail.tsx:90–92,347–370`.

**Evidência estática:** os dois diálogos principais são contêineres personalizados com `role="dialog"`/`aria-modal`, sem implementação de foco inicial, contenção/restauração de foco, Escape ou isolamento do fundo. O AlertDialog usado para escolher descrição da IA é outro componente e não resolve o foco do modal principal.

**Impacto:** uso por teclado pode alcançar controles de fundo e não seguir o comportamento esperado de diálogo. O comportamento com leitores de tela não foi testado.

**Recomendação:** adotar primitiva de diálogo acessível, manter nome e foco previsíveis, suportar Escape/restauração e testar teclado/leitor de tela, inclusive foto ampliada. Não considerar atributos ARIA isolados como validação de acessibilidade.

### F20 — Disponibilidade externa e modo offline são limitados

**L · P2. Arquivos:** `src/components/UrbanMap.tsx:125–132`; `src/components/AdminMap.tsx:62–69`; `src/lib/urban.ts:90–104`; `src/lib/aiAnalysis.ts:98–115`; `src/main.tsx:1–6`.

**Evidência estática:** tiles CARTO, Nominatim e função/Google dependem de rede. Geocodificação retorna indisponível em falha; IA oferece erro/tentativa e permite fluxo manual depois da falha. Não foi encontrado service worker/fila offline ou tratamento específico de `tileerror` no código do app.

**Impacto:** localStorage não torna a aplicação instalável/offline; uma primeira carga ou recarga pode falhar sem rede, tiles podem ficar vazios e endereço/IA indisponíveis. Não há evidência de SLA, limites de uso ou resiliência dos provedores na implantação. E2E usa tiles artificiais e não valida o mapa cartográfico real.

**Recomendação:** incluir estados de erro e orientação para mapa/rede, manter criação manual quando viável e definir requisito offline antes de implementar cache/fila. Avaliar uso de provedores e limites para o volume pretendido em etapa própria. Testar perda/retorno de rede sem enviar dados reais nesta etapa diagnóstica.

## 10. Ordem sugerida de correções e validação

1. **Delimitar o experimento:** declarar arquitetura local, suspender alegações de segurança/IoT/IA validada, separar dados sintéticos e fixar dataset/indicadores (F02, F09, F11, F14). Se a avaliação for somente de usabilidade com simulações, registrar isso como desenho do estudo.
2. **Corrigir autoridade e acesso antes de piloto compartilhado:** cadastro administrativo restrito, identidade e autorização no servidor, propriedade de registros/fotos e proteção do endpoint de IA com limite durável (F01–F03, F13). Adicionar cenários negativos correspondentes.
3. **Preservar integridade dos registros:** localização explícita/confirmada, persistência compartilhada transacional quando exigida, política de quota/recuperação e migração segura do legado (F04–F06). Validar com dados fictícios em dois dispositivos.
4. **Proteger o ambiente de avaliação e atualizar dependências seletivamente:** primeiro Vite 6.4.4+ e patches compatíveis de brace-expansion/source-map-js/selector-parser; depois migrações coordenadas de Vitest, Router e Zod, e revisão de Drizzle, glob/minimatch e typography (V01–V10). Revisar scripts individualmente e comprovar instalação limpa (F16); nenhuma execução automática de correções.
5. **Formalizar o atendimento:** transições, confirmação por proprietário, trilha de eventos, critério de encerramento e revisão humana; resolver o caso de administrador autor (F07, F08, F15).
6. **Validar geografia e análise:** área de atendimento, regiões, filtros, definição de calor e cálculos com resultados esperados independentes (F10–F12).
7. **Fechar as lacunas de testes e dispositivos:** executar os cenários prioritários da seção 8, acessibilidade dos diálogos, rede ruim, câmera/galeria/GPS em plataformas distintas e desempenho com volume-alvo (F17–F20). Preservar os logs iniciais e produzir novas evidências separadas na etapa de correção.
8. **Avaliar IA em estudo separado e autorizado:** confirmar contrato/configuração, testar integração controlada e somente depois medir classificação com dataset rotulado e revisão humana (F14/F15). Reportar erros e incertezas junto às métricas, sem usar confiança declarada pelo modelo como medida de acurácia.

A aceitação para uma apresentação local pode assumir limitações declaradas; a aceitação para um piloto com usuários reais depende de resolver os itens P1 de autorização, dados, localização e endpoint. Os resultados iniciais são uma base de regressão útil, mas não encerram essas validações.