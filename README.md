# GUIA DOA

Guia comunitário e não oficial para **Dragons of Atlantis**, com frontend React/Vite, API Node/Express, MongoDB e painel administrativo próprio.

## Versão

**1.0.0-beta.2.70**

## Principais módulos

- Tropas, dragões, construções, pesquisas e itens
- Mapa & Campanha, níveis, cidade/ilhas e torneios
- Dicas e tutoriais
- **Eventos por reino**: ocorrências confirmadas, fases, recompensas, status e histórico
- Extras: Sobre, Texto Colorido e Backup
- Painel Admin para manutenção dos conteúdos do MongoDB

## Eventos por reino

Eventos não são tratados como globais. Cada evento possui ocorrências explícitas vinculadas a reinos. Se não houver ocorrência cadastrada para um reino, o sistema mostra **não confirmado** e não conclui que o evento está ausente.

O modelo separa o **fuso do reino** do **relógio oficial do evento**. Eventos que seguem o reset geral usam `00:00 UTC` como referência global; o fuso do reino é exibido apenas como contexto e não desloca o encerramento.

A Home destaca somente eventos **ativos** do reino salvo no perfil. O módulo Eventos permite consultar também ocorrências próximas e encerradas, preservando histórico.

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

Copie `.env.example` e `api/.env.example` conforme o ambiente. A API exige `MONGO_URI` e `JWT_SECRET`. O frontend usa a configuração já existente de URL da API.

## Qualidade

```bash
npm test
npm run check
npm run build
```

## Beta 2.70

- Módulo Eventos com ocorrências por reino, fases, recompensas e histórico.
- Status `próximo`, `ativo` e `encerrado` calculado por ocorrência.
- Regra explícita: ausência de ocorrência = **não confirmado**.
- Reset global de eventos separado dos fusos dos reinos.
- Home mostra apenas eventos ativos do reino selecionado.
- Admin permite criar/editar eventos e ocorrências por reino.
- Sobre, Texto Colorido e Backup foram agrupados em Extras.
- Primeiro cadastro de evento extraído das capturas fornecidas: **Corrida Armamentista**.
