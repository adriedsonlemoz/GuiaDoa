# Planejador de Ilhas

A partir da Beta 2.22, o módulo **Cidade / Ilhas** usa o catálogo oficial de Construções carregado pela API. O frontend não mantém uma segunda tabela de níveis de edifícios.

## Regras de espaço

- Cidade principal: 25 espaços para construções normais.
- Campos da cidade principal: começam em 11 e aumentam conforme os dados `areas` dos níveis da Fortaleza.
- Ilha da Água: 4 espaços normais e 6 espaços exclusivos para Fazenda de Pérolas; sem expansão no planejador atual.
- Fogo, Belladonna e Terra: 6 espaços normais + 4 exclusivos inicialmente.
- A expansão dessas três ilhas libera mais 6 espaços normais e mais 4 exclusivos.
- Recursos exclusivos: Fogo → Fosso de Fogo/Enxofre; Belladonna → Viveiro de Sementes/Sementes; Terra → Mina de Geodos/Geodos.

## População

Casas aumentam a população disponível. Campos normais e recursos exclusivos consomem trabalhadores conforme o nível cadastrado em Construções. O resumo global mostra população, trabalhadores e população livre em tempo real.

## Planejamento

O usuário pode alterar quantidades com controles +/−, escolher níveis, adicionar construções opcionais da cidade principal, selecionar foco de estratégia e fixar um plano-base para comparar as alterações em tempo real.
