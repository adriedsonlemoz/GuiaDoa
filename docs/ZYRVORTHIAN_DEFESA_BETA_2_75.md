# Zyrvorthian e defesa — Beta 2.75

Esta revisão transforma **Mapa & Campanha → Zyrvorthian** em um módulo especializado e adiciona o tutorial **Como se defender dos seus inimigos**.

## Zyrvorthian

- regras gerais das Provações da Calamidade estruturadas no backend;
- rotação do chefe às segundas-feiras, 00:00 UTC;
- chefe ativo por 7 dias e loja disponível por 14 dias;
- Aumentar com +5%, +10%, +15% ou +20%, até 50%;
- regras de Organizando, reposição automática, golpe final, Fúria e nível dinâmico;
- horário de batalha tratado por Reino: 19:00 é somente a referência confirmada de Corvith (UTC+0), sem inferir horários ausentes;
- Astrax com habilidades, materiais, golpe final, ranking confirmado até a faixa 11º–30º e receitas;
- Aetherion marcado como parcial, com materiais e receitas confirmadas, sem inventar habilidades/ranking ausentes.

## Defesa

- Proteção do Dragão cadastrada como material das missões diárias: 2 por dia ao completar as 5 missões;
- receita confirmada: 2 Proteções do Dragão + 100.000 Pedra + 100.000 Ouro → 1 Tratado de Cessar-fogo de 12h, produção de 4h;
- Paz do Dragão cadastrada com 3 dias e preço confirmado de 40 Rubis, além da origem por arcas/recompensas de torneios;
- Teleportador Sombrio: 30 Rubis, destino aleatório;
- Teleportador Direcionado: 75 Rubis, destino escolhido;
- calculadora de proteção para 1, 3, 7, 14 ou quantidade personalizada de dias;
- custos equivalentes por missões diárias, Astrax, Aetherion e Paz do Dragão.

## Dragão da Água e interface

- Paz do Dragão adicionada às habilidades/opções do Dragão da Água;
- modal de habilidades movido para `document.body` via portal, com backdrop e painel opacos em camada alta para eliminar o popup transparente.

## Assets

Os ícones desta revisão foram **recortados dos screenshots fornecidos pelo usuário** e normalizados em arquivos quadrados locais. Nenhuma imagem foi gerada.

## Assistente

O contexto do Assistente agora inclui preço em Rubis e efeito dos itens. Isso permite responder perguntas como custo de múltiplos teleportes ou proteções usando o catálogo canônico.

## Validação

A revisão possui testes específicos para Zyrvorthian, itens defensivos, Paz do Dragão, tutorial, calculadora e correção do modal. Dados não visíveis nos screenshots continuam marcados como parciais ou não cadastrados.
