# Flutter migration alpha.4 — beta.2.81

Versão do repositório: **1.0.0-beta.2.81**  
Flutter: **1.0.0-beta.2.81+100081**  
Android versionCode: **100081**

## Mudança principal

O Flutter passa a ser a **build Android principal** do Guia DOA.

- `.github/workflows/flutter-multiplatform.yml` é o workflow principal e automático para Android + Web + validação iOS.
- O APK publicado tem nome explícito: `GuiaDOA-FLUTTER-beta.2.81-alpha.4.apk`.
- O aplicativo instalado aparece temporariamente como **Guia DOA Flutter** durante a fase alpha.
- A Home e o onboarding exibem a identificação **FLUTTER / alpha.4**, evitando confusão com a versão antiga.
- `.github/workflows/build-apk.yml` foi convertido para **LEGADO - React Capacitor APK** e só pode ser executado manualmente.
- Quando executado manualmente, o APK legado usa o nome `GuiaDOA-LEGADO-CAPACITOR.apk`.

## Home Flutter

A Home foi aproximada da estrutura usada pela Home React atual:

- perfil com reino, relógio e ações de idioma/edição;
- destaque automático de evento ativo no reino quando os dados estiverem disponíveis;
- Arsenal do Comandante na mesma ordem do frontend atual;
- módulos já migrados abrem suas telas Flutter;
- módulos ainda pendentes continuam visíveis, mas identificados como em migração;
- card do Conselheiro/Assistente Tático preservado na hierarquia da Home, ainda marcado como migração;
- status de sincronização com a API continua visível sem ocupar um card grande.

## Backend e Web

A API no Render e o MongoDB permanecem inalterados. O Flutter continua consumindo a mesma API. O Flutter Web é compilado pelo workflow, mas o corte definitivo da hospedagem da Vercel deve ocorrer somente quando os módulos ainda pendentes alcançarem equivalência funcional suficiente, para não remover funções da versão web atual prematuramente.
