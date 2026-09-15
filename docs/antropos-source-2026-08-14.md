# Antropos — fonte de dados da Beta 2.44

Fonte: relatórios de batalha do jogo fornecidos em 14/08/2026. As screenshots não são armazenadas no projeto; somente os dados estruturados confirmados abaixo foram incorporados.

| Nv. | Composição inimiga | Recursos exibidos (Pedra · Metais · Madeira · Ouro · Comida) |
|---|---|---|
| 1 | Pirralho 500; Canibal 500 | 500 · 500 · 5.00k · 2.50k · 112k |
| 2 | Pirralho 1.000; Canibal 1.000; Fedor 500; Demônia 500 | 1.00k · 1.00k · 10.0k · 5.00k · 225k |
| 3 | Pirralho 2.000; Canibal 2.000; Fedor 1.000; Demônia 1.000; Porreteiro 500 | 1.50k · 1.50k · 15.0k · 7.50k · 337k |
| 4 | Pirralho 5.000; Canibal 5.000; Fedor 2.000; Demônia 2.000; Porreteiro 1.000; Lançadores 500 | 2.00k · 2.00k · 20.0k · 10.0k · 450k |
| 5 | Pirralho 10.000; Canibal 10.000; Fedor 5.000; Demônia 5.000; Porreteiro 2.000; Lançadores 1.000; Retalhador 500 | 2.50k · 2.50k · 25.0k · 12.5k · 562k |
| 6 | Pirralho 15.000; Canibal 15.000; Fedor 10.000; Demônia 10.000; Porreteiro 5.000; Lançadores 2.000; Retalhador 1.000 | 3.00k · 3.00k · 30.0k · 15.0k · 675k |
| 7 | Pirralho 30.000; Canibal 30.000; Fedor 15.000; Demônia 15.000; Porreteiro 10.000; Lançadores 5.000; Retalhador 2.000; Chefes 500 | 3.50k · 3.50k · 35.0k · 17.5k · 787k |
| 8 | Pirralho 60.000; Canibal 60.000; Fedor 30.000; Demônia 30.000; Porreteiro 15.000; Lançadores 10.000; Retalhador 5.000; Chefes 1.000 | 4.00k · 4.00k · 40.0k · 20.0k · 900k |
| 9 | Pirralho 120.000; Canibal 120.000; Fedor 60.000; Demônia 60.000; Porreteiro 30.000; Lançadores 15.000; Retalhador 10.000; Chefes 2.000; Sanguíneos 1.000 | 4.50k · 4.50k · 45.0k · 22.5k · 1.01m |
| 10 | Pirralho 250.000; Canibal 250.000; Fedor 120.000; Demônia 120.000; Porreteiro 60.000; Lançadores 30.000; Retalhador 15.000; Chefes 4.000; Sanguíneos 2.000; Raivoso 1.000 | 5.00k · 5.00k · 50.0k · 25.0k · 1.12m |

## Regra de precisão

A interface do jogo abrevia alguns recursos. O seed mantém `exibicao` exatamente como aparece no relatório. Quando a abreviação não permite garantir o inteiro completo, `exato=false` e o valor numérico serve apenas como normalização aproximada para ordenação/uso interno.

## Próximas categorias

A arquitetura já aceita `campos`, `zyrvorthian` e `grodz`, mas nenhuma delas recebe dados nesta versão sem uma fonte confirmada.
