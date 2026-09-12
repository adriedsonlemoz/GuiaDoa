# Guia Doa — beta.2.91 / Flutter alpha.14

Versão: `1.0.0-beta.2.91`; versionCode: `100091`.
APK esperado: `GuiaDOA-FLUTTER-beta.2.91-alpha.14.apk`.

## Ajustes da Home

- Grade principal em três colunas nas larguras usuais de celular, com fallback para duas colunas quando a acessibilidade exige mais espaço.
- Cards com altura uniforme, artes menores, títulos em uma linha e subtítulos limitados a duas linhas.
- Resumo superior continua com Torneio, Favoritos e Atualização; Favoritos não mostra mais o texto redundante “itens salvos”.
- Comparar Tropas e Calculadora usam apenas símbolo e título; Backup preserva sua explicação curta.
- O antigo destaque “Aprimoramento de Tropas” agora comunica corretamente a Calculadora de Evolução.
- A faixa “Sincronizado com a API” e a identificação técnica da build foram removidas da Home. A atualização continua disponível por pull-to-refresh e no terceiro indicador do resumo.

## Tamanho

- Artes usadas na interface foram redimensionadas para o tamanho efetivamente exibido.
- O ZIP de entrega omite originais de produção, imagem de referência e exportações duplicadas; esses arquivos não são necessários para compilar o aplicativo.

## Validação

- Consistência de versão verificada entre `package.json`, API, Flutter e metadados Android.
- Testes de domínio/reinos permanecem inalterados; a alteração de Home é somente de apresentação.
