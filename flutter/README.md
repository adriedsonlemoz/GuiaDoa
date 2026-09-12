# Guia DOA — Flutter principal alpha.4

Esta pasta é o cliente multiplataforma **principal** do Guia DOA para as novas builds Android/Web/iOS. O frontend React/Capacitor permanece no repositório apenas como legado temporário; o backend Express + MongoDB continua sendo a fonte de verdade.

## Alvos

- Android: Flutter nativo e build principal. Durante a alpha, o nome instalado é **Guia DOA Flutter** para identificação imediata; o identificador continua `com.guiadoa.app`.
- Web: Flutter Web consumindo a mesma API. Em desenvolvimento use a porta 5173 para aproveitar o CORS já existente.
- iOS: projeto gerado pelo mesmo bootstrap, com o mesmo backend/API e sem dependências específicas do Android no código de domínio.

## Preparar as plataformas

Linux/macOS:

```bash
cd flutter
./tool/bootstrap_platforms.sh
```

Windows PowerShell:

```powershell
cd flutter
./tool/bootstrap_platforms.ps1
```

O script usa `flutter create` apenas para gerar `android/`, `ios/` e `web/`; o código real fica em `lib/` e não é recriado.

## Executar

```bash
flutter run -d chrome --web-port 5173
flutter run -d android
```

Em macOS, com Xcode configurado:

```bash
flutter run -d ios
```

A API padrão é:

```text
https://guiadoa-agrq.onrender.com
```

Para usar outra API:

```bash
flutter run -d chrome --web-port 5173 --dart-define=API_URL=http://localhost:3001
```

## O que já está nesta alpha.4

- tema Flutter baseado na identidade atual do Guia DOA;
- tela cheia/imersiva no Android e edge-to-edge nas demais plataformas móveis;
- onboarding inicial com idioma, nome e reino;
- perfil local multiplataforma;
- conexão com a API canônica que acessa o MongoDB;
- carregamento dos catálogos de tropas, níveis, dragões, edifícios, reinos, pesquisas, itens, eventos e dicas;
- snapshot local simples para abrir com os últimos dados quando a API estiver indisponível;
- Home responsiva para celular, tablet e navegador;
- busca e visualização inicial dos catálogos já conectados;
- módulo **Tropas** migrado para tela própria com filtros, ordenação, detalhes, treinamento e comparador de duas unidades;
- assets do projeto atual copiados para a árvore Flutter para a migração progressiva;
- preparação reproduzível de Android + Web + iOS.

Consulte `docs/MIGRATION_STATUS.md` para o mapa completo do que ainda precisa ser portado tela por tela.


## Identificação da build principal

- APK: `GuiaDOA-FLUTTER-beta.2.81-alpha.4.apk`
- Nome instalado: `Guia DOA Flutter`
- Selo interno: `FLUTTER α4`
- React/Capacitor: workflow manual `LEGADO - React Capacitor APK`
