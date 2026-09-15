# Dragões

A Beta 2.31 adota um catálogo progressivo de Dragões. O objetivo é registrar apenas dados confirmados à medida que novas telas do jogo forem obtidas.

## Retratos

Os 14 retratos atuais foram recortados diretamente das capturas fornecidas ao projeto e ficam em `public/assets/dragons/`. Nenhuma imagem foi gerada artificialmente.

## Atributos

Não é necessário cadastrar os 90 níveis. O Admin aceita snapshots esparsos (por exemplo Nv.1, Nv.5, Nv.10, Nv.51). O frontend compara somente dragões que possuem um snapshot confirmado para o mesmo nível. Nv.0 é um estado pessoal/local e começa zerado.

Atributos elementais só são exibidos a partir do Nv.51. O Grande Dragão possui atualmente snapshots confirmados de Nv.1 e Nv.51.

## Habilidades

Cada habilidade guarda apenas `id`, `nome`, `tipo`, `imagem` opcional e `descricao`/efeito base. Não há progressão obrigatória de Nv.1 a Nv.90.

## Como obter

`obtencao` é estruturado para permitir ligação futura com Campos/Anthropus. O Dragão Beladona já referencia Campo de Floresta Nv.6–10. Dragões sem origem confirmada permanecem como captura pendente, sem dados inventados.

## Catálogo confirmado — Beta 2.68

A ordem pública passa a ser fixa: Grande Dragão, Água, Fogo, Terra, Beladona, Tóxico, Espinha Negra e depois os demais. Grande Dragão e Dragão da Água possuem snapshots confirmados do Nv.1 ao Nv.30; o Grande Dragão mantém também o Nv.51 elemental. O guia não estima XP necessário entre níveis sem evidência.

A alimentação usa dados confirmados do jogo: Carneiro/Mutton +100 XP, Bovina/Beef +200 XP, Frango/Chicken +500 XP e Veado/Venison +1.000 XP. Os três primeiros são ligados à Savana quando aparecem como recompensa.

Os nomes oficiais ingleses também viraram aliases de busca. Exemplos corrigidos: Nightshade Dragon, Frost Dragon, Blackspine Dragon e Faerie Dragon.

## Interface de atributos — Beta 2.69

- A ficha não exibe mais uma faixa horizontal com todos os níveis cadastrados.
- Os níveis confirmados são percorridos por setas `‹ ›` e também podem ser escolhidos diretamente em um seletor.
- No celular, o retrato do dragão fica centralizado e usa `object-fit: contain`, evitando cortes do asset original.
- A comparação considera somente níveis confirmados em comum entre os dois dragões.
- Valores deixam de usar a cor própria de cada dragão: somente a vantagem recebe destaque positivo neutro, com a diferença numérica; empates ficam neutros.
- Um resumo automático lista em quais atributos cada dragão leva vantagem e quais ficaram empatados.
