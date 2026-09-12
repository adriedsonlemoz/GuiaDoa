# Guia Doa — Flutter migration alpha.11

Esta pasta é o novo cliente multiplataforma do **Guia Doa**. O frontend React/Capacitor continua no repositório enquanto a migração avança; o backend Express + MongoDB permanece a fonte de verdade.

## Alvos

- Android: Flutter nativo, identificador preservado como `com.guiadoa.app` quando as plataformas são geradas pelo script.
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

## O que já está nesta alpha

- Home Flutter refeita com a identidade premium do mockup aprovado: verde esmeralda, dourado, cards escuros e navegação inferior;
- tela cheia/imersiva no Android e edge-to-edge nas demais plataformas móveis;
- onboarding inicial premium com idioma PT/EN selecionável e persistido imediatamente, nome e reino;
- perfil local multiplataforma e tela de Configurações com troca de idioma em tempo real;
- conexão com a API canônica que acessa o MongoDB;
- carregamento dos catálogos de tropas, níveis, dragões, edifícios, reinos, pesquisas, itens, eventos e dicas;
- snapshot local simples para abrir com os últimos dados quando a API estiver indisponível;
- Home responsiva para celular, tablet e navegador, com busca, resumo, atalhos rápidos e destaques;
- busca e visualização inicial dos catálogos já conectados;
- módulo **Tropas** migrado para tela própria com filtros, ordenação, detalhes, treinamento e comparador de duas unidades;
- assets do projeto atual copiados para a árvore Flutter para a migração progressiva;
- preparação reproduzível de Android + Web + iOS.

Consulte `docs/MIGRATION_STATUS.md` para o mapa completo do que ainda precisa ser portado tela por tela.

## Android release networking

The generated Android platform is patched by `tool/bootstrap_platforms.sh` / `.ps1` to keep `android.permission.INTERNET` in the **main** manifest, so release APKs can reach the Render API. The workflow passes the API endpoint with `--dart-define=API_URL=...`, preferring `FLUTTER_API_URL`, then the existing `VITE_API_URL` secret.

## Alpha.11 — fechamento da primeira passagem funcional

A alpha.11 restaura o nome público **Guia Doa**, corrige o launcher Android com ícone adaptativo e adiciona rotas Flutter funcionais para os módulos públicos restantes da versão React/Capacitor. Consulte [`../docs/FLUTTER_MIGRATION_ALPHA11.md`](../docs/FLUTTER_MIGRATION_ALPHA11.md) para a matriz de equivalência.
