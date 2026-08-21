# Construções especiais — Gruta e Basílica

## Arquitetura

A rota `edificios` é o módulo-pai. Ela separa:

- Construções normais: catálogo histórico (Casa, Fazenda, Guarnição etc.).
- Gruta: sistema de exploração e Órbitas Espirituais.
- Basílica: sistema de Pedras Espirituais, ranhuras e bônus.

Os registros especiais ficam na mesma coleção de edifícios, identificados por `grupo=especial` e `tipoModulo=gruta|basilica`. Os dados específicos ficam em `dadosEspeciais`, enquanto números por nível permanecem em `niveis`.

## Gruta

Fonte primária: prints do cliente PT-BR enviados em 21/08/2026.

- Nível máximo: 10.
- Requer participação em uma Aliança e uma Base da Aliança funcional.
- Cada exploração dura 4 horas.
- Explorar com aliados aumenta recompensas.
- O benefício de recompensa por ajudar aliados é aplicado a 5 ajudas.
- O nível da Gruta aumenta o total de Órbitas Espirituais em 50% por nível; Nv.10 = 500%.
- 100 Órbitas Espirituais = 1 Pedra Espiritual Nv.1.

## Basílica

Fonte primária: prints do cliente PT-BR enviados em 21/08/2026.

- Nível máximo: 20.
- Nv.1: 6 ranhuras, Pedra máxima Nv.3.
- Nv.20: 24 ranhuras, Pedra máxima Nv.10.
- Seis tipos de Pedra: Ataque, Velocidade, Alma/Vida, Defesa, Alcance e Ataque à Distância.
- Cada Pedra Nv.1 concede +0,5% ao atributo correspondente.
- Três Pedras do mesmo nível formam uma do nível seguinte.
- Custos adicionais observados ao aprimorar uma Pedra já existente: 2, 6 e 18 Pedras Nv.1 equivalentes para 1→2, 2→3 e 3→4.
- Bônus observados: 0,5%, 1%, 2%, 4% nos níveis 1–4.
- A projeção acima do Nv.4 é matemática e deve permanecer marcada como estimativa até confirmação por novos prints.
- Um conjunto com as seis Pedras no Nv.1 ativa +1,5% nos seis atributos; o conjunto acompanha a Pedra de menor nível.

## Assets

Os ícones de Gruta, Basílica e das seis Pedras foram recortados dos screenshots fornecidos pelo usuário e salvos localmente em `public/assets/edificios/especiais/`.
