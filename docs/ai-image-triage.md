# Triagem de ocorrências por IA

## Arquitetura

O navegador comprime a foto e somente a envia quando o cidadão toca em **Analisar foto com IA**. A Edge Function `analyze-urban-image` mantém a chave do Gemini no servidor, valida tamanho e formato, aplica limitação básica de requisições e usa a API `generateContent` com entrada visual e saída estruturada por JSON Schema.

O Supabase é usado neste fluxo como hospedagem da Edge Function, e não como banco de dados do aplicativo. Contas, sessão e chamados permanecem no `localStorage` do navegador neste protótipo. A foto comprimida é enviada à função e ao Gemini para a análise, mas o resultado somente entra no chamado local depois da ação do cidadão.

A IA devolve:

- existência ou não de um problema urbano visível;
- categoria sugerida;
- gravidade visual sugerida;
- confiança calibrada;
- descrição curta;
- evidências observáveis;
- sinais de risco;
- necessidade de revisão humana.

A sugestão só pode ser aplicada pelo botão quando a confiança é de pelo menos 72%. Mesmo assim, o cidadão precisa revisar e enviar o chamado. Prioridade e status continuam sob controle humano.

## Configuração

Crie gratuitamente uma chave no [Google AI Studio](https://aistudio.google.com/apikey). Use um projeto no nível gratuito, sem ativar faturamento, e crie uma chave nova do tipo recomendado pelo AI Studio.

Na raiz do projeto, instale as dependências, entre no Supabase e conecte o projeto remoto:

```powershell
npm install
npx supabase login
npx supabase link --project-ref yavsfqrbsexjpueritws
```

Copie `supabase/functions/.env.example` para `supabase/functions/.env` e coloque a chave real apenas na cópia ignorada pelo Git:

```powershell
Copy-Item supabase/functions/.env.example supabase/functions/.env
```

Conteúdo esperado:

```env
GEMINI_API_KEY=sua-chave-real
GEMINI_VISION_MODEL=gemini-3.6-flash
AI_ALLOWED_ORIGINS=http://localhost:8080
AI_ANALYSIS_REQUESTS_PER_MINUTE=8
```

Envie os secrets e publique a função:

```powershell
npx supabase secrets set --env-file supabase/functions/.env
npx supabase secrets list
npx supabase functions deploy analyze-urban-image
```

Execute o app e abra `http://localhost:8080`:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm run dev
```

Para validar também os principais fluxos no navegador:

```powershell
npm run test:e2e
```

O arquivo `.env` da raiz também precisa apontar para esse mesmo projeto Supabase. Copie os valores de **Project Settings > API** no painel de `yavsfqrbsexjpueritws`:

```env
VITE_SUPABASE_PROJECT_ID="yavsfqrbsexjpueritws"
VITE_SUPABASE_URL="https://yavsfqrbsexjpueritws.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="cole-a-chave-publicável-do-projeto"
```

Se o painel mostrar o projeto como pausado ou inativo, clique em **Resume project** e espere o status ficar saudável antes de executar o link ou o deploy.

Para executar a função localmente, é necessário Docker ou runtime compatível:

```powershell
npx supabase functions serve analyze-urban-image --env-file supabase/functions/.env
```

Nunca coloque `GEMINI_API_KEY` em uma variável `VITE_*`, no código React ou em um arquivo versionado.

## Escolha do modelo

O padrão é `gemini-3.6-flash`, que aceita imagens e tem entrada e saída gratuitas dentro dos limites do nível gratuito. O modelo é configurável por secret, sem mudança no código. Se a cota gratuita for atingida, a API responde com limite excedido e o cidadão deve tentar novamente depois.

O uso gratuito depende das cotas e condições vigentes da conta Google; ele não significa execução offline nem disponibilidade ilimitada. O navegador precisa de internet e o projeto Supabase precisa estar ativo.

O nível gratuito pode usar o conteúdo enviado para melhorar produtos do Google. Não envie fotos com dados pessoais desnecessários e não use essa modalidade para dados sensíveis ou sigilosos. Para uma implantação pública real, faça uma análise de privacidade e confirme se os termos do nível gratuito são compatíveis com a política do município.

## Checklist antes da produção

1. Migrar o login local para Supabase Auth e voltar a exigir JWT na função. Atualmente `verify_jwt = false` existe apenas para compatibilidade com o protótipo; a função ainda exige a chave publicável do projeto, mas ela não substitui autenticação de usuário.
2. Substituir a limitação em memória por rate limit durável por usuário/IP.
3. Criar um conjunto de avaliação anonimizado, incluindo fotos noturnas, desfocadas, sem problema e fora das quatro categorias.
4. Medir precisão por classe, taxa de falso positivo e taxa de encaminhamento para revisão humana.
5. Definir retenção, consentimento e política de acesso às fotos de acordo com a política de privacidade do município; o nível gratuito do Gemini pode usar o conteúdo para melhoria de produtos.
6. Monitorar cotas gratuitas, logs sem imagens/base64, erros e latência.
7. Manter uma fila de revisão para baixa confiança, risco alto ou contestação do cidadão.

## Regras de segurança adotadas

- chave do Gemini acessível somente na Edge Function;
- limite de 4 MB e formatos JPEG, PNG e WebP;
- validação da assinatura real do arquivo, além do tipo declarado;
- rejeição de corpos de requisição acima do limite antes do processamento completo;
- timeout de 25 segundos;
- instrução explícita para ignorar textos na imagem que tentem comandar ou alterar a análise;
- nenhuma tentativa de identificar rostos, placas ou condições médicas;
- casos graves, ambíguos ou de baixa confiança sempre pedem revisão humana;
- a foto e seu conteúdo nunca são escritos nos logs da função.
