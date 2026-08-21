# GUIA DOA

Guia comunitário e não oficial para **Dragons of Atlantis**, com frontend React/Vite, API Node/Express, MongoDB e painel administrativo próprio.

## Versão

**1.0.0-beta.2.72**

## Principais módulos

- Tropas, dragões, construções, pesquisas e itens
- Mapa & Campanha, níveis, cidade/ilhas e torneios
- Dicas e tutoriais com ação de copiar em PT-BR e EN-US
- **Eventos por reino** com ocorrências confirmadas, fases, regras, recompensas, histórico e tutoriais conectados aos calculadores
- **Extras → Reinos** com catálogo canônico, abertura/idade calculada, fuso, horários confirmados, eventos ativos e histórico
- Extras: Reinos, Doação, Sobre, Texto Colorido e Backup
- Painel Admin para manutenção dos conteúdos do MongoDB

## Eventos por reino

Eventos **não são globais por padrão**. A fonte de verdade é a ocorrência vinculada ao reino:

- ocorrência cadastrada → evento confirmado naquele reino;
- nenhuma ocorrência → **não confirmado** naquele reino.

O Admin permite selecionar reinos individualmente, pesquisar e usar **Selecionar 4 reinos mais recentes**. O atalho facilita o cadastro, mas não confirma automaticamente futuros eventos.

O período fica concentrado em **Datas e fases**. As ocorrências confirmadas usam o relógio oficial/reset do jogo em UTC; o fuso do reino permanece metadado do reino e não desloca o encerramento global.

Na Home, um evento aparece somente enquanto sua ocorrência do reino selecionado estiver no período vigente. Quando o fim é alcançado, ele sai automaticamente do destaque e permanece consultável em **Eventos passados**.

### Corrida Armamentista — calendário atual

O evento confirmado para #345 Corvith, #346 Kenorax, #347 Eisenhold e #348 Zulanka usa:

- início geral: **21/08/2026 00:00 UTC**;
- Dia 1: **Observação**;
- Fase 1 — Acelerações: **22/08/2026 00:00 UTC**;
- Fase 2 — Aprimoramento de General: Dia 3;
- Fase 3 — Recrutamento de Tropas: Dia 4;
- Fase 4 — Eliminação de Tropas Inimigas: Dias 5 e 6;
- Dia 7: classificação final;
- fim geral: **28/08/2026 00:00 UTC**.

A Fase 1 usa **1 minuto de aceleração = 1 ponto**. Generais usam o XP efetivamente adicionado, sem tabela de raridade inventada. Recrutamento e eliminações usam os dados estruturados de poder das tropas. Cada fase pode abrir o calculador correspondente em Torneios.

## Admin de Eventos

O cadastro é dividido em interfaces menores, pensadas primeiro para celular:

- Informações gerais
- Datas e fases
- Reinos
- Recompensas
- Regras
- Histórico

As fases armazenam período estruturado e a interface calcula dia do evento, dia da semana e status (`próxima`, `ativa`, `encerrada`). As recompensas aceitam metas individuais, ranking por posição/faixa, múltiplos itens e referências internas para Tropas, Itens, Dragões, Edifícios e Pesquisas.

O Admin também oferece **Clonar evento**. A clonagem reaproveita a estrutura útil, mas limpa datas, ocorrências e histórico para não confirmar reinos ou períodos antigos por acidente.

## Reinos

A Beta 2.72 usa somente os **33 reinos confirmados** e seus números reais do jogo. IDs artificiais antigos são remapeados pelo nome durante a migração e o registro fictício `Fabrica` é removido.

Campos atuais:

- nome, número/ID e status;
- data de abertura, quando conhecida;
- fuso horário;
- fim dos torneios, Zyrvorthian e Batalha do Dragão, apenas quando cadastrados;
- histórico e estrutura separada para futuras fusões.

Idioma e região do mundo não fazem parte do modelo de Reino. Nenhuma fusão fictícia é cadastrada.

### Datas de abertura confirmadas

Somente estas datas são preenchidas:

- #345–#348: 12/08/2026;
- #341–#344: 12/08/2025;
- #337–#340: 12/08/2024.

Os demais reinos permanecem **sem data e sem idade**. A idade é sempre derivada da abertura e nunca armazenada manualmente. A apresentação usa:

- menos de 1 mês: `9 dias`;
- a partir de 1 mês: `2 meses e 13 dias`;
- a partir de 1 ano: `1 ano e 4 meses`.

### Fusos e filtros

Extras → Reinos usa cards tocáveis em vez de selects. Cada card mostra **fuso, quantidade de reinos e hora atual naquele fuso**. A distribuição do catálogo atual é:

- UTC-7: 9;
- UTC-4: 2;
- UTC-3: 1;
- UTC+0: 8;
- UTC+1: 10;
- UTC+3: 2;
- UTC+9: 1.

Naxos é UTC-7 e Sicyon é UTC+0. **Gibia (#325)** é Hardcore; **Megara (#286), Naxos (#287) e Sicyon (#291)** são Idade do Dragão.

A explicação superior descreve a Marca de Poder sem persistir Ápice/Excelência/Avançado/Crescente em cada reino, pois essa classificação muda semanalmente. As referências comunitárias de idioma são apenas gerais para os fusos confirmados pelo usuário: UTC-7 (mais inglês/América do Norte), UTC+0 (internacional/multilíngue), UTC-3 (português) e UTC-4 (misto, com forte presença de português e espanhol).

### Horários confirmados nesta versão

Os horários abaixo são armazenados no **relógio oficial UTC do jogo**. Lacunas não são inferidas:

- UTC+0 — Zyrvorthian: 19:00 UTC;
- UTC-3 — Zyrvorthian: 22:00 UTC; Batalha do Dragão: 17:00 UTC;
- UTC-7 — Batalha do Dragão: 20:00 UTC;
- UTC+1 — Batalha do Dragão: 06:00 UTC;
- UTC-4 — Batalha do Dragão: 00:00 UTC.

O fim dos torneios continua vazio quando não houver valor confirmado no cadastro/migração.

## Doação e primeiro acesso

**Doação** foi separada de Sobre em Extras. O PIX atual fica nessa área; PayPal e criptomoedas permanecem preparados como campos futuros, sem links/endereço inventados.

Após a primeira inicialização bem-sucedida, o usuário recebe uma única mensagem informando que o GUIA DOA é gratuito e oferecendo um atalho opcional para apoiar o projeto. Ao ajudar, fechar ou escolher “Agora não”, a mensagem é marcada como vista naquela instalação/navegador.

## APK, Splash e diagnóstico

Builds de produção/nativos não usam mais `localhost` silenciosamente. Para APK, `VITE_API_URL` é obrigatório, deve ser HTTPS e não pode apontar para `localhost`/`127.0.0.1`.

A inicialização aplica timeout e número máximo de novas tentativas. Se a API não responder, a tela deixa de carregar indefinidamente e oferece **Tentar novamente** e **Copiar diagnóstico**. O Splash fica centralizado em `100dvh`, com rolagem bloqueada durante a inicialização.

## Migrações

### Beta 2.72

A migração `content:eventos-reinos:beta-2.72` reforça o catálogo canônico, remove datas herdadas dos reinos cuja abertura é desconhecida, preserva horários já cadastrados quando não há dado novo confirmado e atualiza a Corrida Armamentista para o calendário de observação/fases confirmado em 21/08/2026.

### Beta 2.71

A migração `content:eventos-reinos:beta-2.71` introduziu a normalização de eventos legados, regras/recompensas estruturadas, remapeamento dos IDs artificiais e catálogo canônico dos 33 reinos.

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

Copie `.env.example` e `api/.env.example`. A API exige `MONGO_URI` e `JWT_SECRET`. O frontend de produção/APK exige `VITE_API_URL` apontando para a API publicada.

## Qualidade

```bash
npm test
npm run check
npm run build
```

## Beta 2.72

- Corrida Armamentista corrigida para iniciar em observação e trocar de fase pelo reset oficial UTC.
- Fases ligadas aos calculadores de Acelerações, Generais, Recrutamento e Eliminação.
- Eventos encerrados saem da Home e permanecem automaticamente em Eventos passados.
- Manual estruturado do evento e botão Copiar em tutoriais PT-BR/EN-US.
- Clonagem segura de eventos no Admin.
- Idade dos reinos com formato dias → meses+dias → anos+meses e sem idade para abertura desconhecida.
- Cards de fuso com quantidade e hora atual.
- Horários confirmados de Zyrvorthian/Batalha do Dragão armazenados em UTC do jogo, sem preencher lacunas.
- Doação separada de Sobre e aviso opcional exibido apenas uma vez no primeiro uso.
- APK sem fallback silencioso para localhost; Splash sem scroll e falhas de conexão com diagnóstico copiável.
- Sobre/changelog com cinco destaques atuais e documentação revisada.

## Beta 2.71

- Correção da causa do erro de ocorrências em múltiplos reinos.
- Atalho para selecionar os 4 reinos mais recentes sem assumir confirmação global.
- Admin de Eventos modular/mobile-first e recompensas estruturadas.
- Catálogo canônico dos 33 reinos e Extras → Reinos.
- Estrutura para futuras fusões e migração compatível com dados antigos.

## Beta 2.70

- Introdução do módulo Eventos por reino.
- Ocorrências, fases, recompensas e histórico.
- Regra ausência de ocorrência = não confirmado.
- Reset global separado do fuso do reino.
