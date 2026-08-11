# 🛡️ Guia DOA — API Admin

Backend local para gestão dos dados do Guia DOA.
Corre no Termux, conecta ao MongoDB Atlas, serve o painel admin.

---

## 📁 Estrutura

```
guiadoa-api/
├── server.js              ← Entrada principal
├── .env                   ← Variáveis de ambiente (não commitar)
├── package.json
├── models/
│   ├── User.js            ← coleção doa_users
│   └── Tropa.js           ← coleção doa_tropas
├── routes/
│   ├── auth.js            ← POST /api/auth/login
│   └── tropas.js          ← CRUD /api/tropas
├── middleware/
│   └── auth.js            ← Validação JWT
├── scripts/
│   └── setup.js           ← Seed inicial (usuário + 53 tropas)
└── admin/
    └── index.html         ← Painel visual
```

---

## ⚡ Instalação e arranque (Termux)

```bash
# 1. Entrar na pasta
cd ~/painel/projetos/guiadoa-api

# 2. Instalar dependências
npm install

# 3. Correr o setup UMA VEZ (cria usuário admin + importa tropas)
npm run setup

# 4. Iniciar o servidor
npm start

# Para desenvolvimento (reinicia ao guardar)
npm run dev
```

---

## 🌐 Endereços

| Serviço       | URL                            |
|---------------|--------------------------------|
| API           | http://localhost:3001          |
| Painel Admin  | http://localhost:3001/admin    |
| Health check  | http://localhost:3001/         |

**Login do painel:**
- Usuário: `adrilemoz`
- Senha: `@aL0524$`

---

## 📡 Endpoints da API

### Auth

| Método | Rota                  | Descrição              | Auth |
|--------|-----------------------|------------------------|------|
| POST   | `/api/auth/login`     | Fazer login            | ❌   |
| GET    | `/api/auth/verificar` | Verificar token JWT    | ✅   |

**Exemplo login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"adrilemoz","senha":"@aL0524$"}'
```

---

### Tropas

Todas as rotas abaixo exigem o header `Authorization: Bearer <token>`,
**excepto** `/api/tropas/todas` que é pública (usada pelo app React).

| Método | Rota                  | Descrição                    |
|--------|-----------------------|------------------------------|
| GET    | `/api/tropas/todas`   | Lista todas (sem paginação)  |
| GET    | `/api/tropas`         | Lista com filtros e páginas  |
| GET    | `/api/tropas/:id`     | Detalhe de uma tropa         |
| POST   | `/api/tropas`         | Criar nova tropa             |
| PUT    | `/api/tropas/:id`     | Atualizar tropa              |
| DELETE | `/api/tropas/:id`     | Remover tropa                |

**Parâmetros do GET `/api/tropas`:**

| Parâmetro | Tipo   | Padrão | Descrição                       |
|-----------|--------|--------|---------------------------------|
| `busca`   | string | `""`   | Filtrar por nome (regex)        |
| `tipo`    | string | `""`   | `treinavel` ou `especial`       |
| `pagina`  | number | `1`    | Página atual                    |
| `limite`  | number | `50`   | Itens por página                |
| `ordenar` | string | `nome` | Campo de ordenação              |
| `dir`     | string | `1`    | `1` = crescente, `-1` = decres. |

---

## 🗄️ MongoDB — coleções criadas

Todas as coleções usam o prefixo `doa_` para não misturar com outros projetos no mesmo cluster.

| Coleção       | Descrição                         |
|---------------|-----------------------------------|
| `doa_users`   | Usuários admin do painel          |
| `doa_tropas`  | Tropas do jogo (53 registros)     |

**Campos da tropa:**

| Campo        | Tipo   | Descrição                        |
|--------------|--------|----------------------------------|
| `nome`       | String | Nome único da tropa              |
| `tipo`       | String | `treinavel` ou `especial`        |
| `poder`      | Number | Poder base                       |
| `vida`       | Number | Pontos de vida                   |
| `def`        | Number | Defesa                           |
| `atqPerto`   | Number | Ataque corpo a corpo             |
| `atqDist`    | Number | Ataque à distância               |
| `alcance`    | Number | Alcance do ataque                |
| `vel`        | Number | Velocidade                       |
| `car`        | Number | Capacidade de carga              |
| `desc`       | String | Descrição/habilidade especial    |
| `atualizadoEm` | Date | Data da última edição           |

---

## 🔗 Integrar com o app React (guiadoa_tw)

Quando quiser que o app busque tropas da API em vez dos ficheiros locais,
edita `src/data/tropas.js` para fazer fetch:

```js
// src/data/tropas.js
const API_URL = 'http://localhost:3001';

export const carregarTropas = async () => {
  const r = await fetch(`${API_URL}/api/tropas/todas`);
  return r.json();
};
```

> A rota `/api/tropas/todas` é pública — não precisa de token.

---

## 🔑 Variáveis de ambiente (.env)

```env
MONGO_URI=mongodb+srv://...    # String de conexão MongoDB Atlas
JWT_SECRET=...                 # Chave secreta para assinar tokens
PORT=3001                      # Porta da API
```

> ⚠️ Nunca commites o `.env` para o GitHub.

---

## 🐞 Problemas comuns

**"ECONNREFUSED" ao iniciar:**
→ Verifica a ligação à internet. O MongoDB Atlas é remoto.

**"Token inválido" no painel:**
→ Faz logout e login novamente. O token expira em 12h.

**"Já existe uma tropa com esse nome":**
→ O campo `nome` é único. Usa a edição (✏) em vez de criar nova.

**Setup falha na metade:**
→ Corre `npm run setup` novamente — tropas já existentes são puladas.
