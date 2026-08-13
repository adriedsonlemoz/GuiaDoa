# Sistema visual do GUIA DOA

## Beta 2.20

A interface pública passa a seguir uma linguagem inspirada nas telas do Dragons of Atlantis sem reproduzir recursos, moedas ou ações que o GUIA não executa.

### Princípios

- Pergaminho/bege como superfície principal.
- Verde-petróleo no cabeçalho global.
- Marrom escuro nas abas e navegação secundária.
- Bronze/dourado envelhecido em bordas e destaques.
- Azul reservado a ações comuns e verde a ações positivas.
- Painéis oliva para atributos, requisitos e tabelas comparativas.
- Menos cantos arredondados, pills e cards flutuantes.
- Listas contínuas para tropas, pesquisas, dragões e itens.
- Sem recursos, moedas, compras ou botões de jogo falsos.

### Componentes compartilhados

`src/components/shared/GameChrome.jsx` concentra os principais blocos reutilizáveis:

- `GamePanel`
- `GameTabs`
- `GameSectionTitle`
- `GameActionButton`
- `GameInfoTable`

As classes globais correspondentes vivem em `src/index.css`.

### Build

A Beta 2.20 também adiciona `scripts/check-frontend.mjs`, que usa o TypeScript para analisar todos os arquivos `.js` e `.jsx` do frontend. O objetivo é detectar erros sintáticos de JSX antes do deploy, incluindo a regressão que interrompeu o build do Armazém na Beta 2.19.

## Beta 2.21

- Tipografia visual unificada na fonte nativa do sistema para melhorar legibilidade em telas pequenas.
- Marrom estrutural substituído por verde-petróleo nas abas e cabeçalhos de módulos.
- Ícones da grade da Home deixam de usar círculos decorativos.
- Botões compactos do perfil usam a mesma família verde do cabeçalho; o idioma passa a usar símbolo monocromático.
- Lista de Tropas mostra Poder sem abrir o detalhe.
- Comparação rápida de Tropas: ativar Comparar, escolher duas unidades e abrir a comparação existente.
- Cores de comparação e seletores alinhadas à nova paleta verde/pergaminho.

