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

## Integração com Mecânicas de Combate — Beta 2.54

A nova página `mecanicas_combate` reutiliza `perfilCombate` diretamente do catálogo online. Ela não grava classificações inferidas nem mantém uma lista paralela de unidades. Alterações feitas no Admin/MongoDB passam a alimentar automaticamente a seção de evidências da página de mecânicas.
