# Flutter migration alpha.8 — beta.2.85

Versão do repositório: **1.0.0-beta.2.85**  
Flutter: **1.0.0-beta.2.85+100085**  
Android versionCode: **100085**

## Correção desta etapa

O workflow Flutter falhava em Android/Web e iOS na etapa **Bootstrap platforms** com `Permission denied`.

O arquivo `flutter/tool/bootstrap_platforms.sh` pode perder o bit executável ao passar por ZIP/sincronização do GitHub Manager. O workflow agora executa o script explicitamente com:

```sh
bash ./tool/bootstrap_platforms.sh
```

Assim o build não depende da permissão Unix do arquivo e funciona de forma consistente em runners Linux e macOS.

- Canal: **Flutter alpha.8**
- APK: `GuiaDOA-FLUTTER-beta.2.85-alpha.8.apk`
