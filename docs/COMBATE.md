# Mecânicas de Combate

## Beta 2.54

A área pública **Mecânicas de Combate** foi criada como uma camada de explicação do sistema de batalha. Ela não cria uma segunda fonte de verdade para tropas: exemplos e evidências de unidades são derivados do `perfilCombate` que já chega pelo endpoint de tropas e, portanto, continuam sob controle do MongoDB/Admin.

## Princípio de confiança

A interface diferencia três estados:

- 🟢 **Confirmado / alta confiança** — informação oficial ou fortemente comprovada;
- 🟡 **Experimental / evidência forte** — padrão observado repetidamente em testes ou relatórios;
- 🔴 **Não confirmado / hipótese** — interpretação ainda em investigação.

Uma observação experimental nunca deve ser convertida em fórmula oficial apenas porque apareceu em uma batalha.

## Funções táticas

A página explica `Melee`, `Ranged`, `Speed`, `Tank` e `Supply` sem misturá-las com `tipoOficial`. As funções exibidas nas evidências de tropas são lidas de `perfilCombate.funcoesTaticas` e não são inferidas/persistidas pela página.

## Fatores documentados

A área apresenta os fatores que devem ser registrados ao comparar batalhas: quantidade, ataques melee/ranged, vida/defesa, alcance, velocidade, nível/aprimoramento, composição, dragão, general, pesquisas, counters e prioridade de alvo.

O texto evita fórmulas não comprovadas. Alcance, velocidade, counters e targeting são descritos como fatores relevantes ou em investigação quando a mecânica exata ainda não foi demonstrada.

## Evidências experimentais

A seção inclui o caso Crusader fornecido ao projeto e a hipótese atacante × defensor, ambos explicitamente marcados como investigação. O caso é usado para demonstrar que quantidade total isolada não explica o vencedor; ele não atribui causalidade a um fator específico.

A hipótese de processamento em grupos/proteção também permanece experimental. O comportamento do Escaravelho de Guerra pode ser compatível com proteção, mas a página não afirma fila fixa, prioridade universal ou fórmula de Tank.

## Integração

- rota pública: `mecanicas_combate`;
- entrada própria na Home;
- conteúdo fixo da interface traduzido em PT-BR e EN-US;
- evidências de tropas carregadas do mesmo `GameDataContext`/MongoDB usado pela Enciclopédia;
- links diretos para Enciclopédia e Comparador de Tropas.
