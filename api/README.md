# 🛡️ Guia DOA — API Admin

Backend Express do Guia DOA. Ele conecta ao MongoDB Atlas, serve a API e o painel administrativo.
A partir da **Beta 2.8**, o MongoDB é a única fonte de verdade para os dados públicos do jogo.

## 📁 Estrutura principal

```text
api/
├── server.js                 # entrada do backend
├── app.js                    # configuração Express
├── models/                   # models MongoDB
├── routes/                   # API/CRUD
├── services/
│   ├── autoMigration.js      # migração canônica automática
│   └── bootstrapStatus.js    # estado do primeiro acesso
├── seeds/                    # dados canônicos usados SOMENTE por migrações
├── admin/                    # painel administrativo
└── tests/                    # testes do backend
```

## ⚡ Instalação e arranque

```bash
cd api
npm ci
npm start
```

Não existe mais `npm run setup` nem importação manual dos dados padrão.
Ao subir uma nova versão, o backend verifica `guiadoa_config` e executa a migração canônica automaticamente quando necessário.

## 🧭 Primeiro acesso

1. O backend conecta ao MongoDB.
2. A migração da versão de dados atual cria os registros canônicos que estiverem ausentes e completa somente campos vazios.
3. A migração é registrada em `guiadoa_config`.
4. Se ainda não houver administrador, o frontend e `/admin` exibem a criação do primeiro usuário e senha.
5. Depois disso, o aplicativo lê os dados exclusivamente da API/MongoDB.

Por padrão o primeiro administrador não pede chave técnica. Para exigir proteção adicional:

```env
REQUIRE_SETUP_KEY=true
SETUP_KEY=uma-chave-longa-e-aleatoria
```

## 🗄️ MongoDB compartilhado com AL Sistemas

Use a mesma `MONGO_URI`/database do AL Sistemas e mantenha um prefixo exclusivo:

```env
MONGO_URI=mongodb+srv://USUARIO:SENHA@CLUSTER.mongodb.net/SEU_BANCO
MONGO_DB_NAME=SEU_BANCO
MONGO_COLLECTION_PREFIX=guiadoa_
```

Principais coleções:

```text
guiadoa_config
guiadoa_users
guiadoa_tropas
guiadoa_niveis
guiadoa_dragoes
guiadoa_edificios
guiadoa_pesquisas
guiadoa_reinos
guiadoa_itens
guiadoa_traducoes
guiadoa_dicas
guiadoa_dicas_categorias
```

`guiadoa_config` registra a versão/estado da migração. A migração canônica usa uma **versão de dados independente da versão visual do aplicativo**. Atualizações apenas de interface não reimportam seeds. A versão de dados só deve avançar quando houver uma migração real de conteúdo; reiniciar o Render não recria registros apagados quando a migração já estiver concluída.

### Recuperação avançada

Se uma migração precisar ser repetida deliberadamente, configure temporariamente:

```env
FORCE_DATA_MIGRATION=true
```

Faça um deploy e depois remova/desative essa variável. Isso não é parte do fluxo normal do usuário/admin.

## 🔗 Frontend e modo online

O `GameDataProvider` busca tropas, níveis, dragões, edifícios, pesquisas, reinos e itens pela API com `cache: no-store`.
Não há fallback estático ou banco offline paralelo para dados do jogo. Se API/MongoDB estiver indisponível, o aplicativo informa a indisponibilidade.

O PWA ainda pode armazenar arquivos estáticos (HTML/CSS/JS/ícones) para carregamento, e preferências/calculadoras pessoais podem usar armazenamento local. Esses dados pessoais não são a base pública do jogo.

## 🔑 Variáveis principais

```env
MONGO_URI=mongodb+srv://...
MONGO_DB_NAME=...
MONGO_COLLECTION_PREFIX=guiadoa_
JWT_SECRET=uma-chave-longa-e-aleatoria
ALLOWED_ORIGINS=https://guia-doa.vercel.app

# opcionais
REQUIRE_SETUP_KEY=false
# SETUP_KEY=...
LOGIN_RATE_LIMIT_MAX=8
AI_RATE_LIMIT_MAX=20
# GROQ_API_KEY=...
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
# FORCE_DATA_MIGRATION=true  # somente recuperação de uma migração
```

Nunca envie `.env`, senhas, JWT secrets ou credenciais do MongoDB para o GitHub.

## ❤️ Health e diagnóstico

- `GET /api/health` — estado sanitizado da API/MongoDB e configuração dos serviços.
- `GET /api/health/deep` — exige administrador e testa integrações externas.
- `GET /api/setup/bootstrap-status` — estado mínimo do primeiro acesso/migração.

## 🧪 Testes

Na raiz do projeto:

```bash
npm test
npm run check
```

Smoke test de uma API publicada:

```bash
cd api
API_BASE_URL=https://sua-api.exemplo.com npm run test:smoke
```

Com uma conta administrativa de teste opcional:

```bash
API_BASE_URL=https://sua-api.exemplo.com \
TEST_ADMIN_USER=usuario_teste \
TEST_ADMIN_PASSWORD='senha_de_teste' \
npm run test:smoke
```

O smoke test não cria, altera nem apaga dados.
