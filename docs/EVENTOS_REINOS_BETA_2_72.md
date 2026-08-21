# Beta 2.72 — Eventos, Reinos e experiência

## Reinos

- Catálogo fechado em 33 reinos canônicos; `Fabrica` não existe.
- IDs reais do jogo substituem IDs artificiais antigos via migração por nome.
- Datas conhecidas: #337–340 = 12/08/2024; #341–344 = 12/08/2025; #345–348 = 12/08/2026. Nenhuma outra data é estimada.
- Idade derivada da abertura: dias (<1 mês), meses+dias (>=1 mês), anos+meses (>=1 ano). Sem abertura, sem idade.
- Filtros por fuso são cards e mostram quantidade + hora atual.
- Naxos UTC-7; Sicyon UTC+0; Gibia Hardcore; Megara/Naxos/Sicyon Idade do Dragão.
- Classificação Ápice/Excelência/Avançado/Crescente é apenas explicativa porque muda semanalmente.

## Horários

Valores confirmados nesta versão são guardados como relógio oficial UTC do jogo:

- UTC+0: Zyrvorthian 19:00.
- UTC-3: Zyrvorthian 22:00; Batalha do Dragão 17:00.
- UTC-7: Batalha do Dragão 20:00.
- UTC+1: Batalha do Dragão 06:00.
- UTC-4: Batalha do Dragão 00:00.

Campos não confirmados ficam vazios.

## Eventos

- Corrida Armamentista corrigida para Dia 1 de observação e início da Fase 1 em 22/08/2026 00:00 UTC.
- Fases ligadas a calculadores estruturados.
- Home mostra somente evento vigente do reino confirmado. Encerrado vira evento passado automaticamente.
- Admin modular mantém clonagem segura, seleção de reinos, recompensas, regras e histórico separados.
- Tutoriais possuem ação de copiar no idioma atual.

## Aplicativo

- Doação separada de Sobre; aviso opcional de apoio exibido uma vez após inicialização bem-sucedida.
- APK de produção exige `VITE_API_URL` HTTPS e não aceita localhost.
- Splash centralizado sem scroll; conexão possui timeout/tentativas limitadas e diagnóstico copiável.
