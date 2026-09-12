# Flutter migration alpha.2 — Tropas

Base preservada: **Guia DOA 1.0.0-beta.2.79**.

A segunda etapa da migração paralela em `flutter/` transforma o módulo **Tropas** em uma experiência Flutter própria, em vez de usar apenas o catálogo genérico da alpha.1.

## Implementado

- Enciclopédia de Tropas conectada ao mesmo endpoint `/api/tropas/todas`.
- Reuso das 53 imagens reais já existentes em `public/assets/troops/` como assets locais Flutter, com fallback para URL da API.
- Busca por nome, nome oficial em inglês, aliases e descrição.
- Filtros: Todas, Melee, Ranged, Só distância, Híbrida, Speed, Tank e Supply.
- Classificação de Melee/Ranged baseada nos atributos numéricos atuais, preservando a mesma regra do frontend React.
- Speed derivado apenas na interface pelo quartil superior de velocidade, sem persistir inferência no MongoDB.
- Ordenação por nome, vida, defesa, velocidade, carga, ataques, alcance, poder e equilíbrio.
- Destaque dos atributos em que cada unidade melhor se posiciona no catálogo carregado.
- Tela de detalhe com atributos, counters, função recomendada, perfil de combate, confiança e dados de treinamento.
- Calculadora de treinamento por quantidade com custos totais, população e requisitos.
- Comparador rápido de duas tropas com destaque do maior valor em cada atributo.
- Strings novas em PT-BR e EN-US.
- Testes de domínio para filtros, localização, imagens e ordenação.

## Regras preservadas

- Nenhuma credencial MongoDB entra no Flutter.
- O Flutter continua consumindo a API Express no Render.
- Dados desconhecidos não são inventados.
- Counters e perfil de combate só aparecem conforme os campos já cadastrados.
- A comparação não é apresentada como fórmula de vitória; apenas compara os atributos existentes.
- O frontend React/Capacitor continua no repositório como fallback durante a migração.

## Próximo módulo sugerido

**Dragões**: catálogo próprio, detalhe, alimentação/evolução e preparação da base do tracker.
