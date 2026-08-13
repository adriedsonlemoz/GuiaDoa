# Módulo de Tropas

A partir da Beta 2.17, a tela pública de Tropas prioriza leitura simples, semelhante ao fluxo do jogo: lista vertical, poucas opções de filtro e detalhes completos ao tocar em uma unidade.

## Tela pública

A lista mostra apenas:

- imagem da tropa quando cadastrada, com ícone como fallback;
- nome;
- tipo de combate;
- descrição curta;
- requisito de desbloqueio, quando conhecido.

Os únicos filtros da tela são Todas, Longo alcance, Corpo a corpo e Especiais, além da busca por texto.

Comparador e simulador não fazem parte da tela principal de Tropas. Eles permanecem como recursos independentes do projeto, sem competir com a enciclopédia.

## Detalhe da tropa

Ao tocar em uma unidade, o jogador encontra:

- descrição completa;
- todos os atributos cadastrados;
- poder;
- requisito conhecido para liberar/treinar;
- dicas relacionadas.

## Dados administráveis

O Admin continua sendo a fonte de verdade para atributos e requisitos. A Beta 2.17 acrescenta `imagem`, uma URL opcional usada pela lista e pelo detalhe. Se não houver imagem cadastrada, o app usa um ícone temático.

Os campos de taxonomia criados na Beta 2.15 continuam disponíveis internamente e no Admin para organização, Assistente e futuras regras, mas não poluem a interface pública.

## Requisitos

O app só informa como liberar/treinar quando existe dado cadastrado em `desbloqueio`. Quando não há informação confiável, mostra que o requisito ainda não foi cadastrado, em vez de inventar custos ou níveis.
