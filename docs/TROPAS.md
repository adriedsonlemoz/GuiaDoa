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
