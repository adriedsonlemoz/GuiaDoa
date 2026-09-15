# Build Android — Beta 2.81

Versão: `1.0.0-beta.2.81`. Android: `versionCode 100081`. Data: 2026-09-15.

## Falha corrigida

O Build APK Android 76 parava antes da compilação na etapa `android-actions/setup-android@v3`. A action executava internamente `sdkmanager tools`, mas o pacote legado `tools` não está mais disponível no repositório atual do Android SDK, encerrando o job com código 1.

## Correção aplicada

- Removida a dependência de `android-actions/setup-android@v3`.
- O workflow valida `ANDROID_HOME` e a disponibilidade de `sdkmanager` no runner hospedado.
- Licenças são aceitas pela ferramenta já instalada no runner.
- A instalação é limitada aos componentes realmente usados pelo projeto: `platform-tools`, `platforms;android-36` e `build-tools;36.0.0`.
- O restante do fluxo de testes, build web, Capacitor, Gradle, assinatura, verificação e publicação do APK foi preservado.

## Regressão

Foi adicionada validação automatizada para impedir o retorno de `android-actions/setup-android` ou de uma chamada direta a `sdkmanager tools`.
