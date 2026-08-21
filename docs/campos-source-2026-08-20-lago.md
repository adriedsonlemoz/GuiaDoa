# Campos — Lago — fonte de dados da Beta 2.59

Fonte: screenshots compactados e relatórios de batalha enviados em 20/08/2026. As imagens de interface serviram para conferência; somente recortes dos ícones das recompensas confirmadas foram incorporados como assets locais do projeto.

## Cobertura

O **Lago** possui dados estruturados para os níveis 1 a 10 e segue o mesmo fluxo público usado pelos demais Campos em **Mapa & Campanha**.

Foram estruturados por nível:

- composição e quantidade das tropas inimigas;
- alimento obtido no relatório de batalha;
- produção de comida por hora ao dominar o campo;
- recompensas possíveis e o estado de confirmação da lista;
- metadados semânticos de cada recompensa para reutilização futura em tutoriais.

## Recompensas confirmadas

- **Nv. 1–5:** não possuem recompensas.
- **Nv. 6–9:** Emblema do Dragão da Água, Emblema do Dragão do Gelo e Emblema do Dragão Paradisíaco.
- **Nv. 10:** os três emblemas acima + **Núcleo Sombrio**.

Nas referências fornecidas, o Nv. 10 mostra **um** item adicional além dos três emblemas: o Núcleo Sombrio. Nenhum segundo item extra foi cadastrado sem evidência visual confirmada.

## Estrutura modular

A implementação foi dividida em módulos de domínio:

- `api/seeds/campos/shared.js`: progressão comum dos Campos e factory de seed;
- `api/seeds/campos/savana.js`: dados exclusivos da Savana;
- `api/seeds/campos/lago.js`: dados e recompensas exclusivas do Lago;
- `src/components/campanha/fieldConfig.js`: catálogo visual dos tipos de campo;
- `src/components/campanha/FieldLanding.jsx`: seleção de Campos;
- `src/components/campanha/RewardsBlock.jsx`: apresentação das recompensas;
- `src/components/campanha/CollapsibleSection.jsx`: seção reutilizável dos detalhes.

Assim, novos tipos como Montanha, Morro e Floresta podem ganhar módulos próprios sem concentrar todas as regras em `CampanhaMapa.jsx` ou `api/seeds/campanha.js`.

## Preparação para tutoriais

As recompensas agora podem armazenar `categoria`, `finalidade`, `relacionadoA` e `tags`. O registro do nível também possui `recompensasStatus` e `tags`. Isso permite que um gerador de tutoriais consulte os mesmos dados usados pela tela, por exemplo para selecionar automaticamente níveis que fornecem itens de obtenção de dragões, sem duplicar textos ou regras no frontend.

## Regra de exibição

`recompensasStatus: "confirmado"` com uma lista vazia significa **ausência confirmada de recompensas**. Isso é diferente de `pendente`, que significa que ainda faltam dados. A interface apresenta esses dois estados separadamente.

## Beta 2.60 — hotfix de carregamento

A implementação de dados do Lago permanece modular no backend. O frontend de Campanha voltou a usar a estrutura estável da Beta 2.58, removendo a refatoração de imports introduzida na Beta 2.59. A única alteração visual específica é o estado explícito de “sem recompensas” para Lago Nv. 1–5.
