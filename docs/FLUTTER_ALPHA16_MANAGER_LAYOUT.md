# Guia Doa — beta.2.93 / Flutter alpha.16

Versão: `1.0.0-beta.2.93`; versionCode: `100093`.
APK esperado: `GuiaDOA-FLUTTER-beta.2.93-alpha.16.apk`.

## GitHub Manager

- A raiz agora contém `github-manager.json` como fonte explícita de identidade.
- Nome de exibição: `Guia Doa`.
- Identificador forte e namespace: `com.guiadoa.app`.
- Linguagem e tipo: `Dart` e `Flutter`.
- Versão e versionCode são validados contra `package.json`, `pubspec.yaml`, `release.json` e `mobile/android-version.json`.
- Novas Releases usam o título `Guia Doa v<versão>`.

## Workflow 14

O segundo ajuste de altura não eliminou o overflow de 1 px em largura de 360 px com texto a 200%, indicando uma limitação estrutural do `BottomNavigationBar` padrão.

A Home agora usa uma barra inferior própria, com cinco áreas de toque iguais, os mesmos ícones e destinos, sem a altura interna rígida do componente anterior. Os rótulos permanecem em uma linha e reduzem apenas quando necessário.

As regras de reinos, UTC, eventos e carregamento não foram modificadas.
