# Corrida Armamentista — dados confirmados (Beta 2.72)

Fontes: capturas do jogo fornecidas em 20/08/2026 e ajustes de calendário/mecânicas confirmados pelo usuário em 21/08/2026.

## Regra de relógio

- O evento usa o reset global do jogo às **00:00 UTC**.
- O fuso de um reino não muda o momento do reset.
- Período geral confirmado: **21/08/2026 00:00 UTC até 28/08/2026 00:00 UTC**.
- Em 21/08/2026 o evento está em **Observação**, não na Fase 1.

## Fases

1. **Dia 1 — Observação**: preparação; a primeira fase competitiva ainda não começou.
2. **Dia 2 — Fase 1: Acelerações**: começa em 22/08/2026 00:00 UTC. Cada 1 minuto de aceleração usado vale 1 ponto.
3. **Dia 3 — Fase 2: Aprimoramento de General**: escolher um General e aumentar seu XP usando cartas/outros Generais. A pontuação usa o XP efetivamente adicionado. Não existe no guia uma tabela de raridade inventada.
4. **Dia 4 — Fase 3: Recrutamento de Tropas**: treinar tropas; a pontuação usa quantidade treinada e poder cadastrado da tropa.
5. **Dias 5 e 6 — Fase 4: Eliminação de Tropas Inimigas**: quantidade eliminada × poder da tropa. Exemplo confirmado pelos dados de Tropas: 10.000 Espiões (poder 2) = 20.000 pontos; 10.000 Espelhos de Fogo (poder 10) = 100.000 pontos.
6. **Dia 7 — Classificação final**.

Cada fase competitiva pode abrir o calculador correspondente do módulo Torneios.

## Ocorrências confirmadas

- #345 Corvith — UTC+0
- #346 Kenorax — UTC-7
- #347 Eisenhold — UTC+1
- #348 Zulanka — UTC-4

A confirmação desses quatro reinos não cria regra para eventos futuros. Sem ocorrência cadastrada, o evento permanece **não confirmado** para o reino.

## Ciclo de vida

Enquanto estiver no período, o evento pode aparecer na Home do reino confirmado. Ao atingir `fimServidor`, sai automaticamente da Home e permanece consultável em **Eventos passados**. Não é necessário desativar manualmente.

## Recompensas

O seed `api/seeds/eventos.js` preserva somente itens/quantidades confirmados nas capturas. A faixa 21º–50º não é completada por inferência. Na meta de 1000 pontos da Fase 4 permanecem apenas os três itens realmente visíveis na captura.

As recompensas suportam metas individuais, ranking por posição/faixa e múltiplos itens. Quando um item possui referência interna conhecida (por exemplo, uma tropa), a interface pode abrir a ficha correspondente no guia.
