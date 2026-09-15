# Tela inteira Android — Beta 2.79

Versao: `1.0.0-beta.2.79`. Android: `versionCode 100079`. Data: 2026-09-11.

## Objetivo

O aplicativo Android passa a ocupar toda a area util da tela em modo imersivo, sem manter permanentemente visiveis a barra de status ou a barra de navegacao do sistema.

A alteracao e exclusiva da camada de exibicao Android/WebView. Nao altera dados, regras, API, rotas ou funcoes do Guia DOA.

## Implementacao nativa

O projeto continua sem versionar a pasta `android/`. O Capacitor gera essa pasta durante o workflow e, em seguida, `scripts/apply-android-fullscreen.mjs` aplica a configuracao a `MainActivity.java` gerada.

A Activity:

- usa `WindowInsetsController` em Android 11+ para ocultar `systemBars()`;
- usa `BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`, permitindo que o usuario revele as barras temporariamente com gesto do sistema;
- reaplica o modo imersivo quando a janela recupera foco, inclusive depois de interacoes que possam revelar as barras;
- usa as flags imersivas legadas somente em Androids anteriores ao suporte moderno de `WindowInsetsController`;
- habilita layout edge-to-edge com `setDecorFitsSystemWindows(false)`;
- permite que a janela se estenda para a regiao de recortes de tela, usando `LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS` quando disponivel e `SHORT_EDGES` no fallback.

O script valida o `appId` do Capacitor e se recusa a sobrescrever uma `MainActivity` inesperada que nao derive de `BridgeActivity`.

## WebView e areas seguras

O `index.html` agora declara `viewport-fit=cover`, permitindo que a WebView use a area edge-to-edge.

No CSS:

- `body` e `#root` usam `100dvh` para acompanhar a altura dinamica real da tela;
- a barra superior estende o fundo ate o topo, mas desloca seus controles por `safe-area-inset-top` quando houver recorte;
- o rodape respeita `safe-area-inset-bottom` para nao posicionar conteudo interativo sobre a area reservada a gestos;
- a area principal desconta os insets seguros no calculo minimo de altura.

Isso mantem o visual realmente preenchendo a tela, sem criar faixas artificiais ao redor do conteudo.

## Build

O workflow chama o script de fullscreen imediatamente depois de gerar/sincronizar a plataforma Android e antes da compilacao Gradle. Dessa forma a configuracao nao depende de editar manualmente arquivos gerados e nao se perde entre builds.

## Verificacao

O teste `tests/androidFullscreen279.test.js` cobre:

- ocultacao das barras de sistema;
- comportamento transitorio por gesto;
- edge-to-edge e suporte a display cutout;
- fallback imersivo para Androids antigos;
- reaplicacao ao recuperar foco;
- `viewport-fit=cover` e safe areas no frontend;
- inclusao do script no workflow;
- idempotencia da geracao da `MainActivity`.

## Referencias

- Android Developers — Immersive mode: https://developer.android.com/develop/ui/views/layout/immersive
- Android Developers — Android 15 edge-to-edge behavior: https://developer.android.com/about/versions/15/behavior-changes-15
- Android Developers — WindowManager.LayoutParams display cutout modes: https://developer.android.com/reference/android/view/WindowManager.LayoutParams
