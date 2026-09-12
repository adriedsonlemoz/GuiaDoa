# Guia Doa — beta.2.92 / Flutter alpha.15

Versão: `1.0.0-beta.2.92`; versionCode: `100092`.
APK esperado: `GuiaDOA-FLUTTER-beta.2.92-alpha.15.apk`.

## Falha corrigida

O workflow 13 confirmou que análise, iOS e 18 testes passaram, mas Android/Web foi interrompido pelo teste da Home em largura de 360 px com texto ampliado a 200%. Um `RenderFlex` da composição compacta ultrapassava sua altura em 1 px.

## Solução

- Os cards recebem altura adicional somente em telas estreitas com texto ampliado, preservando as três colunas no uso normal e o fallback acessível em duas colunas.
- A ampliação dos cinco rótulos da navegação inferior foi limitada a 150%, evitando uma segunda fonte de overflow na mesma largura.
- A configuração de acessibilidade continua integralmente aplicada ao restante da Home e das demais telas.
- A barra inferior recebeu uma chave estável para continuar coberta pelo teste responsivo.
- Não houve mudança nas regras de reinos, UTC, eventos, carregamento ou sincronização.
