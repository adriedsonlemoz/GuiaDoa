# Campos — Savana — revisão de recompensas da Beta 2.63

Fonte: screenshots enviados em 20/08/2026 (`savanas.zip`).

## Cobertura

As telas cobrem Savana Nv.1 a Nv.10. A progressão de produção por hora permanece a mesma já cadastrada no módulo de Campos.

## Recompensas confirmadas

- Nv.1–5: 1 **Pedaço de carne carneiro**.
- Nv.6–9: item azul de nome ainda não identificado + 1 **Pedaço de carne carneiro** + 1 **Pedaço de carne bovina**.
- Nv.10: os três itens anteriores + 1 **Pedaço de Frango**.

Os tooltips enviados confirmam explicitamente os nomes de carneiro, carne bovina e frango. O item azul aparece visualmente em Nv.6–10, porém nenhuma das capturas mostra seu tooltip; portanto o código estável `savana-r1` e o ícone são preservados sem inventar um nome.

## Assets

As quatro imagens em `public/assets/items/fields/savanna/` são recortes das capturas fornecidas pelo usuário. Nenhuma arte foi gerada.

## Estado para tutoriais

A estrutura semântica marca as carnes como itens de `treinamento-dragao`. Nv.1–5 ficam com recompensas `confirmado`; Nv.6–10 ficam `parcial` até o nome do item azul ser confirmado.
