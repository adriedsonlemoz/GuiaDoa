# Campos — Floresta — fonte de dados da Beta 2.61

Fonte: screenshots e relatórios de batalha enviados em 20/08/2026. As telas foram usadas como referência de implementação. Somente recortes dos ícones de recompensas confirmadas foram incorporados como assets locais; nenhuma imagem foi gerada ou recriada.

## Cobertura dos níveis

A Floresta foi estruturada do **Nv. 1 ao Nv. 10**.

As referências não estão completas no mesmo formato para todos os níveis:

- **Nv. 1:** pop-up do campo + relatório de batalha;
- **Nv. 2:** pop-up do campo, sem relatório de batalha;
- **Nv. 3–4:** relatório de batalha, sem pop-up do campo;
- **Nv. 5–10:** pop-up do campo + relatório de batalha.

Portanto, nenhum nível inteiro está ausente, mas existem lacunas de evidência. O projeto não preenche essas lacunas como se fossem confirmação visual.

## Recurso do campo

Floresta usa **madeira** como recurso principal. A progressão de produção por hora segue a configuração comum já utilizada pelos Campos:

- Nv. 1: 2.750/h
- Nv. 2: 5.500/h
- Nv. 3: 8.250/h
- Nv. 4: 11.000/h
- Nv. 5: 13.750/h
- Nv. 6: 16.500/h
- Nv. 7: 19.250/h
- Nv. 8: 22.000/h
- Nv. 9: 24.750/h
- Nv. 10: 27.500/h

## Recompensas

Recompensas confirmadas visualmente:

- **Nv. 1, 2 e 5:** sem recompensas no pop-up fornecido;
- **Nv. 3–4:** estado `pendente`, pois o pop-up do campo desses níveis não foi enviado;
- **Nv. 6–9:** Emblema do Dragão Beladona, Emblema do Dragão Tóxico e Emblema do Dragão Fada;
- **Nv. 10:** os três emblemas acima + **Essência da Fúria**.

Os nomes foram confirmados pelos tooltips das imagens enviadas. As quantidades de drop não foram cadastradas porque não são mostradas como quantidade garantida.

## Estrutura modular

A implementação fica em `api/seeds/campos/floresta.js`, reutilizando `api/seeds/campos/shared.js`. Isso mantém recurso, tropas e progressão comum separados das regras exclusivas de recompensas da Floresta.

A migração `content:campanha-floresta:beta-2.61` insere ou complementa os registros da Floresta sem exigir recriar o banco existente.

## Preparação para tutoriais

Os emblemas usam metadados `categoria`, `finalidade`, `relacionadoA` e `tags`, permitindo que futuros tutoriais consultem automaticamente quais níveis fornecem itens para obtenção de cada dragão.
