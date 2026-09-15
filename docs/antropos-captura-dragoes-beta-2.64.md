# Beta 2.64 — Antropos, transporte e captura de dragões

## Objetivo

Esta versão conecta recomendações de Antropos, capacidade de carga, Campos, itens de captura, Dragões e Tutoriais em uma única fonte de dados. As imagens fornecidas pelo usuário são usadas somente como evidência; **nenhuma imagem foi gerada**.

## Antropos

As recomendações normais exibidas são apenas:

1. tropas premium já existentes, mantidas em **500** unidades e no topo;
2. Arqueiros / LBM;
3. Magmassauros / Lava Jaws;
4. Dragões de Ataque Rápido / SSD.

As três marchas normais recebem **20% de margem**, sempre arredondando para cima. Não são combinadas com outra tropa ofensiva.

Capacidades usadas para carga:

- LBM: 25
- Lava Jaws: 10
- SSD: 100
- Carregador: 200
- Transporte Blindado: 5.000

Depois de aplicar os 20%, o sistema calcula quanto recurso a tropa principal já transporta. Se faltar carga, mostra a quantidade mínima de **Transportes Blindados OU Carregadores**, cada alternativa suficiente sozinha para trazer o restante.

SSD Nv.9 usa a referência isolada de 160.000, exibida como 192.000 após a margem e ainda marcada com possíveis perdas. Para Nv.10 não há quantidade isolada confirmada de SSD, então o sistema informa que a configuração isolada não está confirmada em vez de inventar um valor.

## Captura de dragões

Cada dragão capturável exige **100 itens**. Os níveis onde cada item aparece são derivados diretamente das recompensas dos Campos.

Regra dos Campos:

- Savana: tem recompensas também nos Nv.1–5; o **Emblema do Dragão do Trovão** aparece nos Nv.6–10.
- Lago, Floresta, Montanha e Morro: não têm recompensas nos Nv.1–5; os itens de dragão aparecem nos Nv.6–10.

O **Dragão da Água** possui duas formas legítimas de obtenção: contas novas / entrada elegível em um Reino novo podem recebê-lo como recompensa de novo usuário; contas antigas que não receberam essa recompensa podem capturá-lo com **100 Emblemas do Dragão da Água** no Lago Nv.6–10.

O **Grande Dragão** é inicial e não usa captura.

## Evidências adicionais da Beta 2.64

- Floresta Nv.2: **100 Canibais + 50 Fedor**.
- Savana Nv.6–10: item azul confirmado como **Emblema do Dragão do Trovão**.

## Interface

- detalhes de Antropos abrem as seções expandidas por padrão;
- tutorial de Antropos usa as mesmas regras do motor de recomendações;
- novo tutorial de captura de dragões usa os mesmos dados dos Campos;
- detalhes dos dragões oferecem atalho para o tutorial e para o Campo correspondente;
- botão de copiar tutorial copia o idioma ativo;
- margens laterais de Dicas/Tutoriais foram reduzidas no celular;
- novo conteúdo possui PT-BR e EN-US.
