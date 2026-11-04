# Avaliação exploratória de uso do UrbanEye

Versão do roteiro: 04/11/2026. Material para coleta futura; nenhuma sessão ou resultado está preenchido.

## Objetivo e participantes

Observar conclusão de tarefas, dificuldades de uso e utilidade percebida por 5 a 8 participantes, preferencialmente pessoas que não desenvolveram o sistema. Recrutar por disponibilidade e registrar, sem nomes pessoais, familiaridade prévia com o UrbanEye e participação ou não em seu desenvolvimento. Se houver desenvolvedores na amostra, identificar essa condição na análise.

Esta é uma avaliação acadêmica exploratória em ambiente local. Relatos de utilidade e intenção de uso expressam percepções nessa experiência. Não demonstram impacto real na gestão municipal, redução de prazos de atendimento, precisão geográfica ou eficácia de serviços públicos. A amostra pequena e por conveniência não representa a população.

## Preparação do facilitador e do observador

1. Usar o mesmo computador, navegador, perfil e origem durante toda a rodada. Fixar a URL completa, incluindo protocolo e porta. Não alternar entre `localhost` e `127.0.0.1`, navegação privada ou outro perfil. Manter versão da aplicação, tamanho de janela e condições de rede constantes, registrando mudanças inevitáveis.
2. Definir um identificador de rodada, como padrão de preenchimento `UE-<data>-<rodada>`. Atribuir códigos distintos de participante, de `P01` a `P08`, somente quando houver participação efetiva. Não pré-preencher resultados.
3. Preparar um cartão individual com nome fictício, e-mail fictício exclusivo e senha de teste, sem criar previamente a conta cidadã. Usar domínio `example.com` e incluir rodada e código no e-mail para evitar colisões com contas preservadas. Não usar nome, e-mail ou senha pessoais. As credenciais ficam no cartão, fora do CSV e do relatório acadêmico.
4. Disponibilizar uma conta administrativa fictícia exclusiva do facilitador, separada das contas cidadãs. Ela é usada apenas na preparação e na intervenção F01. Não entregar sua senha ao participante.
5. Antes da primeira sessão, na conta do facilitador, selecionar **Avaliação local** nos controles de dados do Perfil e conferir a faixa superior. Encerrar a sessão administrativa e apresentar a tela de entrada. Repetir a conferência do modo entre sessões, pois a preferência é compartilhada nesse perfil.
6. Não carregar nem restaurar o conjunto fixo, não usar Demonstração simulada e não limpar cookies, contas, localStorage ou demais dados entre participantes. Dados simulados anteriores permanecem preservados fora do modo. Registros legados e manuais de outras sessões podem continuar no armazenamento; não presumir uma base vazia.
7. Fornecer o marcador literal `<rodada>/<participante_id>` no cartão e exigir sua inclusão na descrição do chamado. Anotar a descrição efetivamente enviada e o horário de abertura para identificar o registro na intervenção. O marcador é um dado do cenário, não uma dica de navegação.
8. Adotar cadastro manual, sem foto nesta rodada, e não solicitar análise por IA. Não acionar Gemini. Mapas e busca de endereço podem usar serviços externos e falhar; registrar essas condições. A avaliação não depende da análise de imagens.
9. Registrar concordância voluntária antes da sessão. A pessoa pode recusar perguntas ou encerrar a participação. Explicar o que será anotado e onde será guardado; gravações de áudio, vídeo ou tela somente se houver concordância específica. Usar códigos nas notas e manter os registros em acesso restrito.

Folha de preparação, a preencher na coleta:

- Rodada, data e versão/revisão da aplicação: ____________________
- Origem completa, navegador/perfil e tamanho da janela: ____________________
- Facilitador e observador: ____________________
- Código do participante e ordem da sessão: ____________________
- Desenvolveu o sistema? ______ Familiaridade prévia: ____________________
- Modo conferido e sessão anterior encerrada: ____________________
- Permissão de localização já existente ou solicitada nesta sessão: ____________________

Esses metadados podem ser mantidos nas notas da sessão; não ampliar o cabeçalho do CSV fornecido.

## Campos e comportamentos conferidos no código atual

Referência de preparação para o observador. Não apresentar esta tabela como tutorial antes das tarefas.

| Operação | Requisitos e comportamento atuais |
| --- | --- |
| Cadastro | Perfil cidadão para este cenário; nome fictício com 2 a 60 caracteres após retirar espaços nas pontas, e-mail em formato válido com até 255 caracteres e não cadastrado anteriormente, senha fictícia com 6 a 72 caracteres. Não há campo de confirmação de senha. Cadastro bem-sucedido já inicia a sessão. |
| Entrada em conta existente | E-mail e senha da conta criada. Não exige confirmação por e-mail nesta implementação local. |
| Novo chamado | Descrição com conteúdo além de espaços é obrigatória. Tipo do problema tem sempre uma seleção, inicialmente Acidente; categorias disponíveis: Acidente, Obra, Iluminação e Trânsito. Para o cenário, espera-se Obra. Foto é opcional. Não é necessário analisar imagem para enviar. |
| Local e data | Coordenadas, endereço aproximado quando disponível e data/hora são registrados automaticamente. Não há campo para digitar endereço ou corrigir a posição no formulário atual. |
| Prioridade e gravidade | Não são campos de preenchimento do cidadão no formulário. O sistema atribui valores iniciais; o administrador pode alterar a prioridade e o status. |
| Resposta à resolução | Disponível ao proprietário quando o chamado está Resolvido e aguardando confirmação. Há opções de confirmar ou contestar. A contestação retorna o chamado a atendimento e registra reabertura. |

Conferência documental em [Login.tsx](../../src/pages/Login.tsx), [useAuth.tsx](../../src/hooks/useAuth.tsx), [ReportModal.tsx](../../src/components/ReportModal.tsx), [useGeolocation.ts](../../src/hooks/useGeolocation.ts), [useUrbanReports.ts](../../src/hooks/useUrbanReports.ts), [ReportDetail.tsx](../../src/components/ReportDetail.tsx) e [LocalDataControls.tsx](../../src/components/LocalDataControls.tsx). Esta preparação não incluiu execução de testes ou validação ao vivo da interface.

## Regra de localização

A ocorrência é fictícia e não corresponde a um atendimento no local do computador. O formulário pode salvar a posição padrão de Sorocaba (`-23.5015, -47.4526`) quando não obtém localização pelo navegador. O endereço automático, o marcador do mapa e a indicação “GPS ativo” não demonstram precisão ou validação em campo.

O observador registra em `observacoes` da T02 uma das condições: `localizacao=padrao`, `localizacao=obtida_navegador_nao_validada`, `localizacao=indisponivel` ou `localizacao=indeterminada`, com a indicação exibida e eventual mensagem de erro. Só atribuir obtenção pelo navegador se houver evidência dessa obtenção; igualdade ou diferença em relação à coordenada padrão, isoladamente, não comprova sua origem. Sem evidência suficiente, usar `indeterminada`.

Nunca registrar posição padrão como GPS validado ou declarar a localização da ocorrência fictícia confirmada. Pode-se avaliar a conclusão do cadastro mesmo com posição padrão, desde que essa limitação fique explícita; a tarefa não avalia precisão geográfica. A ausência de edição manual deve ser anotada caso cause dificuldade. Não instruir o participante a inventar uma validação ou editar armazenamento para contornar a limitação.

## Texto inicial padronizado ao participante

> Estamos avaliando como as pessoas usam o UrbanEye, com tarefas fictícias. O foco é o sistema, não seu desempenho pessoal. Nenhum chamado deste exercício será enviado a uma prefeitura ou resultará em serviço real. Use somente os dados fictícios do seu cartão e não use foto nem análise por inteligência artificial nesta rodada. A posição exibida pode ser aproximada ou padrão e não precisa corresponder ao cenário fictício. Você receberá um objetivo por vez e poderá explorar a interface. Se quiser, diga o que está tentando fazer e o que espera encontrar. Você pode pedir ajuda, deixar uma tarefa ou parar a qualquer momento. Em uma etapa, o facilitador usará uma conta administrativa para preparar a resposta fictícia; essa troca é parte prevista do cenário. Ao final, pediremos sua opinião sobre esta experiência.

Ler o mesmo texto em todas as sessões. Não demonstrar funções, antecipar menus, explicar ícones ou elogiar escolhas. Entregar apenas o cartão de dados e o objetivo da tarefa atual. O participante pode consultar o cartão sem isso contar como ajuda. Esclarecer o enunciado sem acrescentar instruções de interface também não conta como ajuda.

## Tarefas do cidadão

As falas abaixo orientam por objetivo. Os critérios ficam com o observador. Não ler critérios, estados internos ou nomes de botões para ensinar o percurso.

| ID | Objetivo a ler ao participante | Critério de conclusão observado |
| --- | --- | --- |
| T01 | “Crie sua conta de cidadão com os dados fictícios do cartão e acesse o UrbanEye.” | Conta cidadã distinta criada e sessão acessível. O acesso automático após cadastrar satisfaz esta tarefa; não exigir uma entrada redundante. |
| T02 | “Imagine um buraco fictício no pavimento de uma rua. Registre essa ocorrência, escolhendo a categoria que considerar adequada e descrevendo a situação com suas palavras. Inclua o marcador do seu cartão e deixe claro que é um teste fictício.” | Um chamado manual salvo, associado à conta da pessoa, com descrição identificável e marcador. Para conclusão integral do cenário, categoria Obra. Verificar procedência “Manual local · não verificado em campo” e registrar a condição da localização separadamente. Apenas preencher o formulário não conclui a tarefa. |
| T03 | “Encontre o chamado que você acabou de registrar e diga qual é o andamento apresentado.” | Abre o próprio chamado, identifica sua descrição/marcador e interpreta o status exibido. Não aceitar registro de outro participante ou do conjunto fixo. |
| T04 | “Encerre sua sessão. Depois, entre novamente com sua conta e consulte o andamento do mesmo chamado.” | Encerra a sessão, autentica a mesma conta com o cartão e reencontra o próprio registro persistido, informando o status. Não realizar intervenção administrativa durante esta tarefa; o andamento pode continuar igual. |
| T05 | Após F01: “Volte à sua conta e consulte a resposta sobre seu chamado. Neste cenário fictício, o buraco continua presente, apesar da informação de resolução. Comunique isso pelo sistema e confira o que aconteceu com o andamento.” | Retorna à conta cidadã, reencontra o mesmo chamado e contesta a resolução. Verifica retorno a atendimento e mensagem de contestação/reabertura. Somente confirmar uma resolução não atende ao objetivo deste cenário. |

Se a pessoa perguntar que categoria deve usar, não fornecer a resposta sem registrar ajuda. Se selecionar outra categoria e salvar, registrar a execução parcial e a divergência; não corrigir silenciosamente nem criar um segundo chamado para simular sucesso.

## F01 — intervenção programada do facilitador

Executar **entre T04 e T05**, com o cronômetro das tarefas parado. Dizer: “Agora farei a atualização administrativa prevista no cenário. Você retomará depois com sua conta.”

1. O facilitador assume o computador, encerra a sessão cidadã e entra em sua conta administrativa fictícia, no mesmo perfil e origem. Confere Avaliação local.
2. Na gestão, identifica o chamado pelo marcador único da rodada/participante, descrição e horário registrados em T02/T03. Se o ID do registro estiver disponível por consulta de leitura, anotá-lo também. Não escolher apenas pela categoria, endereço ou posição na lista. Sem identificação inequívoca, interromper a preparação e registrar o impedimento; não alterar outro chamado.
3. Atualiza o status para Em atendimento e depois marca como Resolvido. Confere a indicação de que aguarda confirmação do cidadão. Não carrega cenários, altera a procedência ou edita o armazenamento.
4. Encerra a sessão administrativa e entrega o computador na tela de entrada. Lê T05 e inicia sua cronometragem. O participante faz a própria entrada e navegação.

Registrar em `observacoes` da T05: `F01=realizada`, identificação do chamado, estados aplicados e intercorrências. Em caso de impossibilidade, registrar `F01=impedida` e o motivo. A intervenção não é uma tarefa cidadã, não entra no tempo de T04/T05 nem em `ajuda_fornecida`. Se o facilitador indicar onde o participante deve navegar após a entrega, essa orientação adicional conta como ajuda na T05.

## Observação, tempo, ajuda e interrupções

- Reservar aproximadamente 35 a 45 minutos por sessão, como planejamento, não como dado coletado. Aplicar limite de **5 minutos por tarefa** a todos, informado no início. Parar antes se o participante desistir ou houver impedimento técnico. Não prolongar seletivamente para obter sucesso.
- Iniciar o cronômetro ao terminar a leitura do objetivo e entregar o controle. Encerrar quando o critério estiver satisfeito, no abandono, no limite ou na interrupção. Incluir exploração, leitura, erros recuperados, ajuda durante a tarefa e esperas normais do sistema. Excluir leitura inicial, pausas pessoais solicitadas e F01; registrar toda pausa. Em interrupção técnica, anotar o tempo decorrido até parar, sem estimar o que faltaria. Se não começou ou não foi medido, deixar o tempo vazio, nunca preencher com zero por ausência de medida.
- Observar sem apontar o caminho. Após 60 segundos sem avanço aparente, pode perguntar de forma neutra se a pessoa prefere continuar ou receber uma dica; não dar a dica automaticamente. Fornecer ajuda somente quando solicitada ou aceita. Usar primeiro uma orientação geral; instrução de caminho ou execução pelo facilitador deve ficar explícita.
- Registrar cada ajuda, com momento e conteúdo, em `observacoes`. Em `ajuda_fornecida`, usar `nenhuma`, `orientacao_geral`, `instrucao_de_navegacao` ou `execucao_pelo_facilitador`, considerando o nível mais direto usado. Se o facilitador executar uma ação necessária da tarefa, ela não é conclusão pelo participante. Uma conclusão só pode ser `concluiu_com_ajuda` se o participante realizar as ações necessárias com orientação. Execução integral ou da ação decisiva pelo facilitador resulta em `nao_concluiu` para aquela tarefa.
- Registrar hesitações, tentativas, mensagens não compreendidas, funções procuradas e divergência entre expectativa e interface. Separar observação do pesquisador de fala do participante. Não atribuir intenção ou causa sem evidência.
- Distinguir dificuldade de navegação de falha técnica. Erro de senha digitada, categoria inadequada ou função não encontrada não são automaticamente defeitos técnicos. Falha de rede, quota, indisponibilidade de endereço/mapa ou travamento devem ser descritos com o que foi observado. Não afirmar diagnóstico ainda não confirmado. Um problema técnico pode coexistir com conclusão; nesse caso, manter o resultado de conclusão e preencher a falha.
- Se uma tarefa prévia impedir a seguinte, marcar a seguinte `nao_iniciada` com a dependência em `observacoes`. Para avaliar etapas posteriores, o facilitador pode preparar o pré-requisito com dados fictícios, fora do tempo e registrando `pre_requisito_preparado_pelo_facilitador`. Isso não transforma a tarefa anterior em sucesso. As etapas posteriores são relatadas como realizadas com pré-requisito preparado, separadas do fluxo integral concluído sem ajuda. Não criar pré-requisito usando o conjunto simulado.
- Se T05 não estiver disponível por falha na F01, registrar `nao_iniciada` e o motivo técnico/do procedimento, sem classificar como dificuldade do participante. Se já começou e uma falha técnica impede continuar, usar `interrompida_falha_tecnica`. Não tentar repetidamente até substituir um resultado desfavorável; qualquer repetição deve ter registro separado e indicação de tentativa.
- Abandono é a decisão explícita de não continuar uma tarefa. Atingir o limite sem satisfazer o critério é `nao_concluiu`. Em encerramento voluntário da sessão, não insistir; tarefas seguintes ficam `nao_iniciada`. Registrar se a pessoa autoriza manter os dados já anotados conforme a concordância da coleta.

## Preenchimento de resultados.csv

O [modelo](resultados.csv) começa **somente com o cabeçalho**, sem participantes, tempos ou resultados. Na coleta, acrescentar uma linha por participante e tarefa, usando T01 a T05. Não inserir linha de F01 como tarefa cidadã. Se houver repetição, manter a primeira observação e identificar a tentativa adicional em `observacoes`; não tratá-la como participante independente.

| Coluna | Regra de preenchimento |
| --- | --- |
| participante_id | Código atribuído na sessão. Se reunir rodadas no mesmo arquivo, prefixar com o identificador da rodada. Sem nome ou credenciais. |
| tarefa_id | T01, T02, T03, T04 ou T05. |
| resultado | `concluiu_sem_ajuda`, `concluiu_com_ajuda`, `nao_concluiu`, `abandonou`, `interrompida_falha_tecnica` ou `nao_iniciada`, conforme regras acima. |
| tempo_segundos | Número de segundos efetivamente medido. Usar ponto se houver fração decimal. Vazio quando não medido ou tarefa não iniciada. |
| ajuda_fornecida | Um dos quatro valores definidos acima. Vazio se a tarefa não foi iniciada; não presumir ausência de ajuda sem observação. |
| dificuldade | Descrição breve do que foi observado; `nenhuma_observada` somente quando houve observação suficiente. Vazio quando não observado. |
| falha_tecnica | Descrever falha observada e seu efeito. Usar `nenhuma_observada` quando aplicável; vazio quando não observado. |
| observacoes | Contexto, falas identificadas como tal, marcador do chamado, localização em T02, F01 em T05, ajuda, pausas, pré-requisitos preparados e tentativas. Sem senhas ou dados pessoais. |

O separador é vírgula e a codificação é UTF-8. Colocar textos que contenham vírgulas ou quebras de linha entre aspas duplas; duplicar aspas internas. Não inserir unidades junto ao número de segundos. Campo vazio é informação ausente, não sucesso, falha ou nota zero.

## Encerramento e relato acadêmico

Aplicar [feedback.md](feedback.md) após as tarefas, sem orientar respostas. Pedir opinião mesmo se houve dificuldades, permitindo “Não consigo avaliar” e perguntas sem resposta. Guardar uma cópia preenchida por código de participante, separada do modelo. Encerrar a sessão da conta e conferir o modo para o próximo participante, preservando todos os dados do navegador.

Relatar o número efetivo de participantes e quem desenvolveu ou conhecia o sistema. Apresentar contagens por tarefa, separando conclusão sem ajuda, com ajuda, não conclusão, abandono, falha técnica e não iniciadas. Mostrar denominadores e interrupções; não somar tentativas como pessoas distintas. Descrever tempos apenas das tentativas medidas, distinguindo resultados e pausas; não transformar limite de tarefa em tempo de conclusão. Resumir respostas por item, sem substituir “Não consigo avaliar” por número, e agrupar dificuldades e sugestões sem inventar citações. Não calcular um escore validado a partir do questionário próprio. Explicitar o uso do mesmo computador, condições herdadas do perfil, ordem das sessões, acúmulo de registros, cenário fictício e intervenção do facilitador. Restringir conclusões à usabilidade observada e percepção de utilidade nessa rodada.
