# Flutter migration alpha.7 — beta.2.84

Versão do repositório: **1.0.0-beta.2.84**  
Flutter: **1.0.0-beta.2.84+100084**  
Android versionCode: **100084**

## Correção desta entrega

O workflow Android/Web e o workflow iOS chegavam ao `flutter analyze`, mas falhavam na Home porque `_ToolCard` acessava propriedades que não existem em `HomeTool`:

- `tool.icon`
- `tool.subtitle`

O modelo já define as propriedades corretas:

- `tool.emoji`
- `tool.subtitleKey`

A Home agora usa o emoji declarado no modelo e resolve o subtítulo através de `AppStrings`, preservando a tradução em Português/Inglês.

## Build principal

- Família: **FLUTTER**
- Canal: **Flutter alpha.7**
- APK: `GuiaDOA-FLUTTER-beta.2.84-alpha.7.apk`
- Android, Web e iOS continuam validados pelo mesmo workflow.
