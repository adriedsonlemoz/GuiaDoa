# Flutter migration alpha.10 — beta.2.87

Versão do repositório: **1.0.0-beta.2.87**  
Flutter: **1.0.0-beta.2.87+100087**  
Android versionCode: **100087**

## Correção do workflow

A alpha.10 corrige a falha detectada pelo `flutter analyze` após a nova Home premium da alpha.9.

- O atalho **Comparar Tropas** agora repassa `ProfileStore` ao `TroopsPage`, como exigido pelo construtor.
- Os avisos `prefer_const_constructors` introduzidos na Home, onboarding e Configurações foram limpos.
- O visual esmeralda/dourado, idioma PT/EN e Configurações da alpha.9 foram preservados.
- Nenhum arquivo da alpha.9 é removido nesta entrega, mantendo compatibilidade com o GitHub Manager.

APK esperado: `GuiaDOA-FLUTTER-beta.2.87-alpha.10.apk`.
