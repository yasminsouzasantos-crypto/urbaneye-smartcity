# Evidências da suíte automatizada

Capturas e traces produzidos pelo Playwright, com contas fictícias e serviços externos simulados. As imagens abaixo são cópias byte a byte dos anexos da suíte; não foram editadas. A indicação de GPS nas telas resulta de coordenadas simuladas.

## Capturas selecionadas

- [C02-chamado-manual-local](C02-manual.png)
- [C04-persistencia-apos-login](C04-persistencia.png)
- [C05-em-atendimento](C05-atendimento.png)
- [C05-resolvido-pendente](C05-resolucao.png)
- [chamado-revisado](C06-contestacao.png)
- [C07-outra-conta-sem-chamado-alheio](C07-outra-conta.png)

## Traces completos

Um trace por teste, incluindo as etapas, snapshots de DOM, ações e rede interceptada.

- [piloto manual: cadastro → persistência → gestão → contestação](<suite-01/urbaneye-piloto-manual-cad-9f747-ncia-→-gestão-→-contestação/trace.zip>)
- [cadastro → WebP/IA → persistência → gestão → contestação](<suite-01/urbaneye-cadastro-→-WebP-I-24446-ncia-→-gestão-→-contestação/trace.zip>)
- [C07 outra conta não recebe os chamados como próprios](<suite-01/urbaneye-C07-outra-conta-n-ee573-e-os-chamados-como-próprios/trace.zip>)
- [armazenamento cheio mantém o rascunho e as fotos existentes](<suite-01/urbaneye-armazenamento-che-894c6-cunho-e-as-fotos-existentes/trace.zip>)

[Auditoria de rede e ambiente](rede-e-ambiente-suite-01.json). As identidades fictícias do fluxo principal e os contadores de mocks também estão anexados ao relatório HTML e ao JSON do Playwright.

A subpasta `manual-01/` preserva a execução focada anterior à suíte. A subpasta `suite-01/` contém os originais e anexos da execução completa.
