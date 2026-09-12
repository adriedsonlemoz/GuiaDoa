# API usada pelo cliente Flutter

Base padrão: `https://guiadoa-agrq.onrender.com`

A primeira etapa lê os mesmos endpoints públicos do frontend atual:

| Chave Flutter | Endpoint | Formato |
|---|---|---|
| tropas | `/api/tropas/todas` | lista |
| niveis | `/api/niveis/todas` | lista |
| dragoes | `/api/dragoes` | `{ dragoes: [] }` |
| edificios | `/api/edificios` | `{ edificios: [] }` |
| reinos | `/api/reinos` | `{ reinos: [] }` |
| pesquisas | `/api/pesquisas` | `{ pesquisas: [] }` |
| itens | `/api/itens?limite=500` | `{ itens: [] }` |
| eventos | `/api/eventos` | `{ eventos: [] }` |
| dicas | `/api/dicas` | lista |

O aplicativo nunca recebe `MONGO_URI`, `JWT_SECRET` ou credenciais administrativas. Escritas administrativas continuam no painel/API existente.
