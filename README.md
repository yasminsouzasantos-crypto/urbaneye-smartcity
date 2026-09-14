# 🏙️ UrbanEye

> Protótipo de plataforma para registro, acompanhamento e gestão de ocorrências urbanas.

## Sobre o projeto

O UrbanEye aproxima cidadãos e responsáveis pela manutenção urbana. O cidadão registra um chamado com foto, descrição e localização; o painel administrativo organiza as ocorrências em listas, indicadores e mapas.

## Funcionalidades

### Cidadão

- cadastro e login local;
- registro de ocorrências com foto, descrição e geolocalização;
- triagem opcional da foto por IA, com categoria, gravidade, confiança e descrição sugeridas;
- escolha explícita para usar ou não a descrição sugerida pela IA;
- acompanhamento dos próprios chamados e confirmação de resolução.

### Administrador

- painel de gerenciamento e atualização dos chamados;
- visualização das ocorrências no mapa;
- filtros por categoria, gravidade e status;
- indicadores, mapa de calor e ranking de regiões;
- acesso às fotos associadas às ocorrências.

## Arquitetura e armazenamento

Este projeto ainda é um protótipo de execução local. Contas, sessão e chamados ficam no `localStorage` do navegador; portanto, não são sincronizados entre computadores, navegadores ou perfis e podem ser perdidos ao limpar os dados do site.

O Supabase é usado atualmente para hospedar a Edge Function `analyze-urban-image`, não como banco de dados dos chamados. A função protege a chave secreta e encaminha a foto ao Gemini. Para uso real em produção, autenticação e dados devem ser migrados para serviços persistentes no servidor.

## Tecnologias principais

- React 18, TypeScript e Vite 6;
- Tailwind CSS e componentes Radix UI;
- Leaflet e React Leaflet;
- Supabase Edge Functions;
- Google Gemini com entrada visual e saída estruturada;
- Vitest, Testing Library e Playwright.

## Execução local

Use Node.js com npm. No terminal, entre na pasta que contém este `README.md` e execute:

```powershell
npm install
npm run dev
```

Abra `http://localhost:8080`. A configuração pública do Supabase deve estar no arquivo `.env` da raiz. A chave secreta do Gemini nunca deve ser colocada nesse arquivo ou em qualquer variável `VITE_*`.

## Verificações do projeto

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

O teste E2E já executa um build antes de iniciar o navegador. A triagem real por IA depende de internet, de um projeto Supabase ativo, da função publicada e de cota disponível no Gemini.

## Triagem por IA

A IA atua apenas como assistente. Ela analisa a imagem sob demanda e sugere uma classificação, mas não cria nem envia o chamado automaticamente. O cidadão continua responsável por revisar o resultado e confirmar o envio.

Veja a instalação, as limitações e o checklist de produção em [docs/ai-image-triage.md](docs/ai-image-triage.md).
