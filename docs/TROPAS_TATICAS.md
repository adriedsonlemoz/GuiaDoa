# Catálogo Tático de Tropas

A partir da Beta 2.15, o módulo Tropas usa uma taxonomia explícita para separar apresentação, filtros e requisitos de desbloqueio.

## Campos táticos

Cada tropa pode armazenar:

- `combate`: corpo a corpo ou distância;
- `categoria`: infantaria, distância, cavalaria, dragão, pesada, transporte ou outro;
- `funcoes`: ataque, defesa, farming, suporte e/ou equilibrada;
- `desbloqueio`: tipo, fonte, nível e observação;
- `taxonomiaVersao`: versão da classificação aplicada ao registro.

## Migração Beta 2.15

A migração `content:tropas-taticas:beta-2.15` roda uma única vez e corrige documentos antigos que herdaram `corpo_a_corpo` por padrão mesmo quando os atributos indicavam alcance. Também cadastra somente requisitos que podem ser confirmados pelos dados atuais de Fábrica/Viveiro.

Depois de aplicada, alterações feitas pelo Admin são a fonte de verdade e não são substituídas a cada reinício.

## Progresso pessoal

O Catálogo permite ao jogador informar os níveis atuais de Fábrica e Viveiro para calcular desbloqueios conhecidos. Esse progresso é pessoal e permanece no dispositivo; os dados oficiais das tropas continuam vindo da API.

Unidades sem requisito confirmado não são apresentadas como bloqueadas ou disponíveis, evitando inferências falsas.

## Dicas relacionadas

Dicas podem relacionar tropas pelo nome-base do registro. Ao abrir uma tropa, o catálogo consulta dicas relacionadas e permite abrir diretamente o artigo na Biblioteca Tática.
