# Dicas e tutoriais

A biblioteca de Dicas usa o banco online como fonte de conteúdo. Cada dica pode ser gerenciada no Admin com:

- título, resumo, categoria, tipo e tempo de leitura;
- conteúdo em Português e Inglês no mesmo registro;
- imagens;
- destaque, ordem e estado ativo/inativo;
- relações com módulos e entidades do jogo.

## Conteúdo dinâmico

O renderer aceita marcadores para valores derivados dos dados atuais do jogo. Na Beta 2.14 existem:

- `{{fonte_n35}}` — capacidade atual da Fonte da Cura no nível 35;
- `{{fontes_38}}` — capacidade calculada para 38 Fontes no nível 35.

Os marcadores são resolvidos somente na apresentação. O texto armazenado continua editável no Admin.

## Relações

Uma dica pode apontar para módulos (`ilhas`, `edificios`, `tropas`, `dragoes`, etc.) e para entidades específicas (slugs/nomes). O app usa isso para exibir atalhos e referências com os dados atuais carregados do jogo.
