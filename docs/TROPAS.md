# Catálogo de Tropas

## Fonte dos dados de treinamento

Os custos, população e requisitos de treinamento da Beta 2.31 foram transcritos das telas de Guarnição fornecidas para o projeto. A coluna **Possui** nunca é persistida, pois representa dados pessoais da conta usada nas capturas.

Os atributos de combate já existentes no catálogo canônico foram preservados para tropas previamente cadastradas. Algumas capturas exibem aprimoramentos de tropa (`Nv.1`), portanto não são usadas para sobrescrever atributos-base sem confirmação.

## Imagens

Os retratos em `public/assets/troops/` são recortes dos próprios screenshots recebidos. Não são imagens geradas. Há 53 retratos locais, correspondentes às 53 tropas reais confirmadas nas capturas.

## Treinamento

`Tropa.treinamento` contém:

- disponibilidade / forma de obtenção;
- custos por unidade;
- população ociosa por unidade;
- requisitos de pesquisa/construção;
- flag `dadosCompletos` para evitar tratar ausência como zero.

O registro legado `Hoplitas Imortais` foi removido do catálogo canônico na Beta 2.31 e a migração de dados também o remove do MongoDB.

## IDs estáveis

O campo `slug` identifica a tropa entre módulos. `aliases` permite aceitar nomes antigos, singulares/plurais e variações exibidas pelo jogo. O Torneio de Treino preserva compatibilidade com planos antigos que salvavam somente o nome.

## Perfil de combate — Beta 2.53

A partir da Beta 2.53, a taxonomia histórica (`tipo`, `combate`, `categoria`, `funcoes`, `rapida`) continua preservada para compatibilidade, mas não é mais usada como armazenamento exclusivo da engenharia de combate.

A nova camada opcional `perfilCombate` mantém separadas duas ideias:

- `tipoOficial`: `supply`, `mounted`, `foot` ou `ranged`;
- `funcoesTaticas`: uma ou mais entre `melee`, `ranged`, `speed`, `tank` e `supply`.

O perfil também pode armazenar `tier`, counters (`forteContra`/`fracoContra`), habilidades especiais, função recomendada, observações estratégicas, prioridade de alvo, fonte/origem da informação e confiança. Os atributos numéricos-base continuam nos campos históricos `vida`, `def`, `atqPerto`, `atqDist`, `vel` e `alcance`, evitando duplicação e mantendo comparador/simulador compatíveis.

### Confiança

O catálogo diferencia explicitamente:

- 🟢 `confirmado`: informação oficial ou fortemente comprovada;
- 🟡 `experimental`: evidência forte e repetida em testes/relatórios;
- 🔴 `hipotese`: informação ainda em investigação.

Há confiança geral e confiança por grupo de campos. Isso permite, por exemplo, ter atributos conhecidos e prioridade de alvo ainda hipotética na mesma unidade.

### Migração segura

`content:tropas-combate-evidencias:beta-2.53` é uma migração de conteúdo separada da migração canônica de dados. Ela é idempotente e só preenche campos novos vazios. Não recria coleções, não incrementa `DATA_MIGRATION_VERSION` e não sobrescreve edições existentes no MongoDB.

## Evidências experimentais preservadas

As observações abaixo são registradas como evidência do projeto, não como fórmula oficial do jogo:

- **Escaravelho de Guerra:** comportamento compatível com `Melee + Tank`; em vários relatórios absorveu perdas enquanto tropas de retaguarda ficaram intactas ou sofreram muito menos. Classificação marcada como experimental.
- **Leviatã Ártico:** classificação provisória `Ranged`; permaneceu protegido em vários testes enquanto Escaravelhos sofreram perdas. Isso não significa que nunca seja atacado.
- **Espelhos de Fogo:** classificação provisória `Ranged`; existe relatório em que foram eliminados enquanto Leviatãs sobreviveram, indicando que duas tropas de distância não devem ser tratadas automaticamente como se tivessem a mesma prioridade de alvo.
- **Magmassauros:** resultados contraditórios (incluindo sobrevivência total em alguns relatórios e perdas severas em outro). Nenhuma regra de “ser ignorado” é cadastrada.

### Batalha contra Crusader

Um relatório recente registrou aproximadamente 3.066 tropas do atacante e cerca de 1.969 tropas na defesa. O exército de Crusader perdeu aproximadamente 2.283 unidades (cerca de 74,5%) e ainda venceu, enquanto a defesa foi eliminada. O resultado é preservado apenas como evidência de que quantidade total/poder isolados não explicam a batalha; nível, composição, dragão, general, pesquisas, counters e prioridades podem influenciar o resultado.

A impressão de que o atacante costuma obter resultados melhores continua **em investigação**. Nenhum bônus matemático ofensivo foi cadastrado. A vantagem observada também pode decorrer da capacidade do atacante de escolher alvo, composição, general, dragão, counters e quantidade.


## Experiência pública — Beta 2.55

A central pública separada de Mecânicas de Combate foi removida. O perfil de combate permanece no cadastro da própria tropa e continua administrável pelo Admin.

Na lista pública, as funções táticas explícitas (`Melee`, `Ranged`, `Speed`, `Tank`, `Supply`) aparecem como badges compactos. Ao abrir uma unidade, a descrição é acompanhada, quando houver dados cadastrados, por `Bom contra`, `Fraco contra` e `Como usar esta tropa?`. Habilidades, prioridade de alvo, observações, fonte e confiança continuam em `Detalhes de combate` para não aumentar demais o card/tela.

Campos desconhecidos permanecem ocultos. A interface não infere counters nem inventa atributos.


## Counters visíveis — Beta 2.56

- O detalhe de qualquer tropa mostra sempre **Bom contra** e **Fraco contra** logo após a descrição.
- Quando ainda não existe counter confiável cadastrado, o campo mostra **Ainda não identificado** em vez de desaparecer.
- O Admin usa os mesmos campos `perfilCombate.forteContra` e `perfilCombate.fracoContra`, agora rotulados de forma mais direta.
- Nenhum counter é inferido ou criado automaticamente; nomes de tropas/categorias só aparecem quando cadastrados com evidência.

## Filtros e ordenação por atributos — Beta 2.57

A Enciclopédia pública não depende mais apenas de `perfilCombate.funcoesTaticas` ou do booleano legado `rapida` para classificar a lista.

- **Melee**: ataque corpo a corpo é o ataque dominante (`atqPerto >= atqDist`, com ataque conhecido).
- **Ranged**: ataque à distância é dominante (`atqDist > atqPerto`).
- **Só distância**: `atqDist > 0` e `atqPerto = 0`.
- **Híbrida**: os dois ataques são maiores que zero, independentemente de qual é dominante.
- **Speed**: classificação explícita continua válida; além disso, a interface identifica automaticamente o quartil superior de `vel` no catálogo atualmente carregado. Essa inferência é somente de interface e não é persistida como dado oficial.
- **Tank/Supply**: continuam usando os campos explícitos/legados compatíveis, sem inventar uma função apenas por um atributo isolado.

O usuário também pode ordenar a lista por nome, vida, defesa, velocidade, carga, ataque à distância, ataque corpo a corpo, alcance, poder e **equilíbrio**. O equilíbrio é um índice apenas de ordenação do GUIA: utiliza percentis de vida, defesa, melhor ataque e velocidade, evitando comparar diretamente escalas numéricas diferentes. Não é uma estatística oficial do jogo.

A lista e o detalhe destacam os atributos em que a tropa melhor se posiciona em relação às demais unidades cadastradas. Nenhum valor novo é criado; o destaque usa somente os números já presentes no catálogo online.
