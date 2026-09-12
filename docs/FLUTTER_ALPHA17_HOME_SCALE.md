# Guia Doa — beta.2.94 / Flutter alpha.17

Versão: `1.0.0-beta.2.94`; versionCode: `100094`.
APK esperado: `GuiaDOA-FLUTTER-beta.2.94-alpha.17.apk`.

## Workflow 15

O iOS compilou, a análise Flutter não encontrou problemas e 18 testes passaram. A única falha continuou sendo o `RenderFlex` de 1 px na Home com largura de 360 px e escala de texto a 200%.

## Correção

- A Home compacta, abaixo de 400 px, limita sua escala visual a 150%.
- A regra cobre cabeçalho, resumo, cards, atalhos, destaques e navegação inferior, evitando que outro componente interno volte a estourar a altura.
- A partir de 400 px, a escala de texto não é limitada.
- As telas acessadas pela Home continuam usando integralmente a configuração do aparelho.
- O teste verifica a escala efetiva antes de procurar qualquer overflow.

Não houve alteração em reinos, UTC, eventos, API ou persistência.
