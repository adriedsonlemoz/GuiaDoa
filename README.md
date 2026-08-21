# GUIA DOA

Guia comunitário e não oficial para **Dragons of Atlantis**, com frontend React/Vite, API Node/Express, MongoDB e painel administrativo próprio.

## Versão

**1.0.0-beta.2.71**

## Principais módulos

- Tropas, dragões, construções, pesquisas e itens
- Mapa & Campanha, níveis, cidade/ilhas e torneios
- Dicas e tutoriais
- **Eventos por reino** com ocorrências confirmadas, fases, regras, recompensas, status e histórico
- **Extras → Reinos** para consulta de abertura, idade calculada, fuso, horários, eventos ativos e histórico
- Extras: Sobre, Texto Colorido e Backup
- Painel Admin para manutenção dos conteúdos do MongoDB

## Eventos por reino

Eventos **não são globais por padrão**. A fonte de verdade é a ocorrência do evento vinculada a um reino:

- ocorrência cadastrada → evento confirmado naquele reino;
- nenhuma ocorrência → **não confirmado** naquele reino.

O Admin permite selecionar reinos individualmente, pesquisar e usar o atalho **Selecionar 4 reinos mais recentes**. O atalho apenas preenche a seleção; não cria uma regra global para eventos futuros.

O período do evento fica centralizado em **Datas e fases**. As ocorrências confirmadas usam o mesmo relógio oficial/reset do servidor. O fuso de cada reino é informação própria do reino e não transforma o encerramento global em meia-noite local.

A Home recalcula o status e mostra somente eventos **ativos** do reino selecionado. Quando o evento termina, o destaque desaparece automaticamente sem exigir desativação manual.

## Admin de Eventos

O cadastro deixou de ser um formulário único. Depois de selecionar um evento, o gerenciamento é dividido em:

- Informações gerais
- Datas e fases
- Reinos
- Recompensas
- Regras
- Histórico

As fases armazenam datas/horários estruturados e a interface calcula automaticamente o dia do evento, o dia da semana e o status (`próxima`, `ativa`, `encerrada`).

As recompensas aceitam:

- metas individuais sem limite fixo;
- ranking por posição única ou faixa;
- múltiplos itens por recompensa;
- referências internas para Tropas, Itens, Dragões, Edifícios e Pesquisas.

Quando uma referência existe no guia, o item pode abrir diretamente o conteúdo correspondente.

## Reinos

O cadastro de Reino contém identificação, tempo, horários e histórico. A idade nunca é armazenada manualmente: é calculada a partir da data de abertura.

Campos atuais:

- nome, número/ID e status;
- data de abertura;
- fuso horário;
- fim dos torneios;
- Zyrvorthian;
- Batalha do Dragão;
- histórico.

Idioma e região do mundo deixaram de fazer parte do modelo de Reino. Dados antigos nesses campos são removidos pela migração.

A arquitetura inclui uma coleção separada para futuras fusões de reinos, mas **nenhuma fusão fictícia é criada**.

### Catálogo canônico e datas conhecidas

A Beta 2.71 usa somente os **33 reinos confirmados** e seus números reais do jogo. IDs artificiais antigos são remapeados por nome durante a migração e o registro fictício `Fabrica` é removido.

Datas confirmadas:

- #345–#348: 12/08/2026;
- #341–#344: 12/08/2025;
- #337–#340: 12/08/2024.

Nenhuma data é estimada para os demais reinos. O catálogo também registra **Gibia (#325)** como Hardcore e **Megara (#286), Naxos (#287) e Sicyon (#291)** como Idade do Dragão.

Fusos confirmados nos screenshots e pelo usuário incluem **Naxos UTC-7** e **Sicyon UTC+0**. A tela pública usa cards tocáveis para filtrar por fuso, sem selects/dropdowns.

A seção superior de Extras → Reinos explica a Marca de Poder sem persistir Ápice/Excelência/Avançado/Crescente em cada card, pois essa classificação é recalculada semanalmente. Também apresenta uma referência comunitária dos idiomas mais frequentes para UTC-7, UTC+0, UTC-3 e UTC-4, sem transformar isso em atributo individual de cada reino.

## Migração Beta 2.71

A migração `content:eventos-reinos:beta-2.71` normaliza eventos antigos sem descartá-los, converte regras legadas para a estrutura atual, preserva ocorrências/recompensas/histórico, remove os campos legados de idioma/região e remapeia os IDs artificiais de reinos para o catálogo canônico de 33 servidores.

Para a **Corrida Armamentista**, a Beta 2.71 registra a confirmação informada para os quatro reinos mais recentes já conhecidos no projeto (#345–#348), mantendo o mesmo período global do evento.

## Desenvolvimento

Requisitos: Node.js >= 20.19 e uma instância MongoDB para a API.

```bash
npm install
npm --prefix api install
npm run dev
```

Em outro terminal:

```bash
npm --prefix api run dev
```

## Variáveis de ambiente

Copie `.env.example` e `api/.env.example` conforme o ambiente. A API exige `MONGO_URI` e `JWT_SECRET`. O frontend usa a configuração existente de URL da API.

## Qualidade

```bash
npm test
npm run check
npm run build
```

## Beta 2.71

- Correção da causa do erro de ocorrências em múltiplos reinos.
- Validação detalhada de reino, datas, períodos, duplicações e payload.
- Atalho para selecionar os 4 reinos mais recentes sem assumir confirmação global.
- Admin de Eventos modular e mobile-first.
- Recompensas individuais, ranking/faixas e múltiplos itens estruturados.
- Links internos de recompensas para outros módulos do guia.
- Botão para copiar instruções do evento para a aliança.
- Fases com dia do evento, dia da semana e status calculados.
- Eventos encerrados removidos automaticamente do destaque da Home.
- Cadastro de Reinos reorganizado e nova consulta em Extras → Reinos.
- Catálogo canônico com 33 reinos, números reais, fusos confirmados e remoção do reino fictício Fabrica.
- Filtros de fuso em cards/chips, explicação da Marca de Poder e perfis comunitários de idioma por fuso.
- Indicadores 🐉 para Idade do Dragão e ⚔️ para Hardcore, sem gravar a classificação semanal de poder em cada reino.
- Perfil local sincroniza automaticamente nome corrigido/fuso com o catálogo do servidor.
- Estrutura separada para futuras fusões de reinos.
- Migração compatível com eventos e reinos anteriores.
- Revisão tipográfica e responsiva das telas novas.

## Beta 2.70

- Introdução do módulo Eventos por reino.
- Ocorrências, fases, recompensas e histórico.
- Regra ausência de ocorrência = não confirmado.
- Reset global separado do fuso do reino.
- Home com destaque de eventos ativos do reino selecionado.
