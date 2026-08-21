# UrbanEye: Smart City Monitor

Crie um sistema web chamado UrbanEye, focado em Smart Cities, com design moderno, responsivo (mobile-first) e intuitivo.

🎯 Objetivo

O sistema deve simular uma plataforma de monitoramento urbano inteligente, onde cidadãos e sensores contribuem com dados em tempo real.

📱 Responsividade (MUITO IMPORTANTE)

 O site deve funcionar perfeitamente em celulares

 Layout adaptado para tela pequena

 Botões grandes e fáceis de clicar

 Interface estilo app (parecido com iFood/Uber)

🗺️ Mapa interativo

 Usar mapa (Leaflet ou similar)

 Centralizar automaticamente na localização do usuário (GPS do celular)

 Caso o usuário permita, pegar localização em tempo real

 Caso não permita, usar localização padrão (ex: Sorocaba)

📍 Funcionalidades principais

1. 📌 Visualização de problemas

 Pontos no mapa com cores:

 vermelho = grave

 amarelo = médio

 verde = normal

 Ao clicar:

 tipo do problema

 descrição

 horário

2. ➕ Reportar problema (IMPORTANTE)

 Botão flutuante (tipo + igual app)

 Ao clicar:

 abrir modal/formulário bonito

 Campos:

 tipo (acidente, obra, iluminação)

 descrição

 Ao enviar:

 adicionar ponto no mapa na localização atual do usuário

3. 📡 Localização em tempo real

 Usar geolocalização do navegador

 Mostrar um marcador azul indicando onde o usuário está

 Atualizar posição automaticamente (se possível)

4. 🤖 Simulação de sensores

 Adicionar pontos automáticos no mapa

 Atualizar a cada alguns segundos

 Simular:

 trânsito detectado

 acidentes detectados

5. 📊 Dashboard simples

 Mostrar na tela:

 quantidade de problemas

 quantidade de problemas graves

 Atualizar em tempo real

6. 🎨 Design

 Visual moderno (estilo startup)

 Cores limpas (preto, branco, azul)

 Bordas arredondadas

 Sombras suaves

 Animações leves

7. 🧠 Extras (diferencial)

 Animação ao adicionar ponto

 Mensagem tipo:
"Problema reportado com sucesso"

 Ícones bonitos (pode usar emojis)

⚙️ Tecnologias

 HTML, CSS, JavaScript

 Pode usar bibliotecas simples (Leaflet, etc)

 Não precisa backend (dados podem ser simulados)

💡 Experiência do usuário

 Deve parecer um app real

 Fluido e rápido

 Fácil de usar sem explicação

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://urbaneye-smartcity.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1f200d73-7ac0-4469-b868-6ef3630d5618).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
