# Lote 01 — ajuste do fundo cartográfico

Data: 03/11/2026. Branch: `validacao-academica`. Alterações locais, sem commit ou publicação. Escopo restrito aos tiles dos mapas, atribuição e testes correspondentes.

## Causa identificada

Os dois mapas usavam o mesmo serviço raster **CARTO Positron**, sem parâmetro de chave:

```text
https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
```

As URLs estavam duplicadas em `src/components/AdminMap.tsx` e `src/components/UrbanMap.tsx`, com subdomínios a/b/c/d. O primeiro é o mapa da Gestão; o segundo é o mapa principal. Os marcadores são camadas separadas, por isso podem continuar aparecendo sobre tiles com mensagem de acesso.

A documentação oficial atual da CARTO confirma que raster e vetor exigem chave e que requisições raster sem chave recebem a marca “API key required”. O serviço possui modalidade gratuita, mas continua exigindo emissão e uso de chave. Isso corresponde à mensagem relatada pelo usuário e à configuração encontrada. Não foi feita nova captura da tela antiga nem requisição ao serviço antigo para tentar contornar a marca. Fontes consultadas em 03/11/2026: [repositório oficial de basemaps CARTO](https://github.com/CartoDB/basemap-styles/blob/master/README.md), [instruções oficiais de chave](https://www.carto.com/basemaps/apikey/index.html) e [termos CARTO, atualizados em 29/09/2026](https://www.carto.com/legal/basemap-terms/).

Não é um defeito dos dados fixos ou do cálculo de indicadores. O relato de que os indicadores corresponderam ao esperado é uma conferência manual do usuário, não um novo teste visual executado pelo agente.

## Solução aplicada

Os dois mapas agora compartilham a configuração de tiles padrão do **OpenStreetMap**, centralizada em `src/lib/mapConfig.ts`:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

Não há chave, cadastro ou segredo no código ou em variável de ambiente. Foram removidos os subdomínios e o sufixo de imagem retina específicos da configuração anterior. A atribuição utilizada é **© OpenStreetMap contributors**, com link para a página de copyright/licença; o crédito CARTO foi retirado porque seu serviço deixou de ser utilizado. [Licença e atribuição oficiais do OpenStreetMap](https://www.openstreetmap.org/copyright).

O mapa principal mantém seu controle explícito de atribuição no canto superior esquerdo; seu deslocamento foi alterado de 76 para 128 px para acomodar a faixa de contexto do lote 01. Gestão mantém o controle de atribuição do Leaflet. A posição efetivamente visível nas telas/dispositivos ainda requer conferência no navegador.

A escolha é adequada à demonstração local interativa de baixo volume, sujeita à política do serviço: HTTPS, atribuição visível, Referer válido e cache HTTP normal. Não foram implementados download offline, varredura, prefetch ou proxy. O serviço é best-effort, sem garantia de disponibilidade; uso intensivo ou offline exige outra solução. [Política oficial de tiles OSMF](https://operations.osmfoundation.org/policies/tiles/).

As opções compartilhadas definem `referrerPolicy: 'strict-origin-when-cross-origin'`, permitindo o envio da origem como Referer. Nenhum cabeçalho para invalidar cache foi introduzido. `updateWhenIdle: true` e `updateWhenZooming: false` evitam solicitar camadas intermediárias durante movimentos. O TileLayer só é montado quando o respectivo mapa está ativo, evitando carregar o fundo do mapa principal enquanto a Gestão está visível. O contêiner do mapa e os dados dos chamados continuam preservados.

A URL está centralizada para permitir futura troca de serviço sem procurar cópias em cada mapa. A alteração visual esperada é de Positron claro para o estilo padrão OSM; categorias, posições, calor, status, prioridade, datas e procedência dos chamados não foram modificados.

## Arquivos deste ajuste

| Arquivo | Alteração |
| --- | --- |
| `src/lib/mapConfig.ts` | URL, atribuição e opções comuns do serviço OSM |
| `src/components/AdminMap.tsx` | Configuração comum e tiles condicionados ao mapa ativo |
| `src/components/UrbanMap.tsx` | Mesma configuração e supressão de tiles quando oculto |
| `src/index.css` | Atribuição do mapa principal deslocada para baixo do cabeçalho |
| `src/components/map/basemaps.test.tsx` (novo) | Quatro verificações isoladas do contrato dos dois mapas e ativação |
| `e2e/urbaneye.spec.ts` | Atualizado apenas o hostname interceptado pelo mock de tiles para OSM; suíte não executada nesta etapa |
| `documentacao/02-correcoes/lote-01-ajuste-mapa.md` | Este registro |
| `documentacao/02-correcoes/logs/lote-01-mapa-*` | Novas saídas e evidência HTTP, separadas das anteriores |

Já havia alterações do lote 01 no checkout. Elas foram preservadas. Comparação SHA-256 entre o início e a conferência deste ajuste confirmou que os 50 arquivos preexistentes protegidos permaneceram idênticos: documentação/evidências já existentes, manifestos/lockfiles e os arquivos de tipos, fábrica de dados, armazenamento e hook de chamados. Não foram atualizadas dependências nem alteradas regras ou dados de chamados. O build apenas regenera `dist/`, ignorado pelo Git.

## Verificações executadas e limites

| Verificação | Resultado | Evidência nova |
| --- | --- | --- |
| Vitest, `npm.cmd test` | 10 arquivos, 80 testes aprovados, saída 0 | [lote-01-mapa-vitest-01.txt](logs/lote-01-mapa-vitest-01.txt) |
| `npm.cmd run typecheck` | Sem erros, saída 0 | [lote-01-mapa-typecheck-01.txt](logs/lote-01-mapa-typecheck-01.txt) |
| `npm.cmd run lint` | 0 erros, 8 avisos preexistentes, saída 0 | [lote-01-mapa-lint-01.txt](logs/lote-01-mapa-lint-01.txt) |
| `npm.cmd run build` | Vite 6.4.3, aprovado, saída 0 | [lote-01-mapa-build-01.txt](logs/lote-01-mapa-build-01.txt) |
| `git diff --check` | Sem erros de whitespace | Verificação no terminal; avisos de conversão LF/CRLF não são erros do check |
| HTTP real, uma única imagem de Sorocaba | 200; image/png; 42.247 bytes; conteúdo cartográfico observado | [lote-01-mapa-http-real.txt](logs/lote-01-mapa-http-real.txt), [imagem recebida](logs/lote-01-mapa-tile-real.png) |
| Navegador integrado | Não foi possível observar os mapas montados | [lote-01-mapa-observacao.txt](logs/lote-01-mapa-observacao.txt) |

**Testes simulados:** os quatro novos testes Vitest substituem componentes de react-leaflet, sem rede. Verificam que ambos os mapas passam URL/atribuição/opções corretas e que não montam tiles enquanto inativos. Não testam o provedor, a renderização real do Leaflet ou a visibilidade efetiva da atribuição. Os 76 casos do lote anterior continuam aprovados. O mock E2E continua devolvendo um PNG artificial; apenas seu destino foi corrigido, sem executar Playwright ou substituir seu relatório inicial. Uma resposta simulada ou um evento de imagem carregada, isoladamente, não detectaria necessariamente a marca de acesso do provedor.

**Acesso real limitado:** foi feita uma requisição não simulada a `https://tile.openstreetmap.org/12/1508/2323.png`, com User-Agent identificando o diagnóstico UrbanEye e Referer `http://localhost:8080/`. Não houve varredura, navegação automática entre níveis de zoom ou download de área. A resposta declarou `Cache-Control: max-age=87836, stale-while-revalidate=604800, stale-if-error=604800`. O arquivo PNG recebido foi aberto com o visualizador de imagens: mostra cartografia e nomes de Sorocaba/Votorantim, sem “API KEY REQUIRED”. Isso comprova o acesso e o conteúdo dessa imagem naquela consulta; não comprova o carregamento integrado dos mapas da aplicação.

**Observação integrada pendente:** o inventário de uso do computador informou `The browser access host is unavailable`. A tentativa de acessar a janela já aberta da visualização do UrbanEye terminou com `Computer Use app approval timed out`. Não houve screenshot válido da aplicação ou observação dos tiles compostos nas telas Gestão e principal. Não foi contornada essa limitação com automação headless de navegação de tiles. Portanto, **o mapa não é declarado visualmente validado**.

## Conferência manual restante

1. Na aplicação local atualizada, abra o mapa principal e aguarde o fundo cartográfico. Confira ruas/regiões e a atribuição OpenStreetMap visível abaixo do cabeçalho. Não é necessário alterar chamados, carregar/restaurar dados ou solicitar IA.
2. Abra Gestão com os dados que já estavam selecionados; role até o mapa e confira cartografia sob calor e pontos, além da atribuição no canto do mapa. A mudança de fundo não deve alterar os indicadores já conferidos.
3. No painel de rede do navegador, se necessário, verifique imagens de `tile.openstreetmap.org`, sem chamadas de tiles a `cartocdn.com`, sem chave e com Referer da origem local. Não force recargas repetidas ignorando o cache.
4. Registre posteriormente observação/screenshot e resultado com novos nomes, sem sobrescrever os logs, prints ou relatórios iniciais.

Sem chamadas reais ao Gemini, emissão de chave, alteração de conta/permissão remota, instalação, commit ou publicação neste ajuste.