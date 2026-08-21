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
guiadoa_dicas
guiadoa_dicas_categorias
guiadoa_eventos
guiadoa_reino_fusoes
```

`guiadoa_config` registra a versão/estado da migração. A migração canônica usa uma **versão de dados independente da versão visual do aplicativo**. Atualizações apenas de interface não reimportam seeds. A versão de dados só deve avançar quando houver uma migração real de conteúdo; reiniciar o Render não recria registros apagados quando a migração já estiver concluída.

### Recuperação avançada

Se uma migração precisar ser repetida deliberadamente, configure temporariamente:

```env
FORCE_DATA_MIGRATION=true
```

Faça um deploy e depois remova/desative essa variável. Isso não é parte do fluxo normal do usuário/admin.


## 🌍 Eventos e Reinos — Beta 2.72

Eventos são armazenados em `guiadoa_eventos`. Fases, regras, ocorrências e recompensas são subdocumentos estruturados; itens de recompensa possuem estrutura própria. **Ausência de ocorrência para um reino significa evento não confirmado**.

O endpoint administrativo de clonagem (`POST /api/eventos/admin/:slug/clonar`) reaproveita a estrutura do evento, mas remove datas, ocorrências e histórico para evitar a reutilização acidental de confirmações antigas.

`guiadoa_reinos` usa os 33 IDs canônicos do jogo. A migração Beta 2.72 mantém data de abertura somente para #337–#348 nos três grupos anuais confirmados; datas desconhecidas ficam `null`. A idade é sempre calculada no frontend/Admin e nunca persistida.

Horários de reino são armazenados no relógio oficial UTC do jogo e somente quando confirmados. A arquitetura de fusões fica isolada em `guiadoa_reino_fusoes`; nenhuma fusão é criada automaticamente.

A migração `content:eventos-reinos:beta-2.72` também corrige o calendário da Corrida Armamentista para 21/08/2026 00:00 UTC → 28/08/2026 00:00 UTC, com Dia 1 de observação.

## 🔗 Frontend, APK e cache local — Beta 2.74

O endpoint público canônico usado pelo frontend e pelo APK é `https://guiadoa-agrq.onrender.com`. Esse endereço não contém segredo; `MONGO_URI`, `JWT_SECRET` e credenciais administrativas continuam somente nas variáveis privadas do serviço Render.

O `GameDataProvider` continua buscando tropas, níveis, dragões, edifícios, pesquisas, reinos, itens e eventos pela API com `cache: no-store`. **MongoDB/API permanece como fonte de verdade.**

A diferença é que o frontend agora mantém um **snapshot local somente de leitura** do último catálogo recebido com sucesso. O snapshot é persistido em IndexedDB e serve para abrir rapidamente o site/APK enquanto o Render acorda ou quando a rede cai. Assim que a API volta, o snapshot é substituído pelo conteúdo oficial novo.

Esse cache não contém `MONGO_URI`, senha do banco, JWT secret ou credenciais administrativas. O APK nunca acessa MongoDB diretamente.

No Android Capacitor, a origem do WebView é `https://localhost` neste projeto (`androidScheme: https`). A política CORS deve manter essa origem permitida; sem isso, a Vercel funciona e o APK recebe falha de CORS mesmo com o Render online.

## 🔑 Variáveis principais

```env
MONGO_URI=mongodb+srv://...
MONGO_DB_NAME=...
MONGO_COLLECTION_PREFIX=guiadoa_
JWT_SECRET=uma-chave-longa-e-aleatoria
ALLOWED_ORIGINS=https://guia-doa.vercel.app  # origens adicionais; as origens nativas do Capacitor já estão no allowlist interno

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


## Alliance Tracker privado

O painel Admin possui um Alliance Tracker que lê screenshots de **Poder**, **Última Conexão** e **Data de Entrada**. A leitura é 100% local: Tesseract.js + ROI + passada adaptativa + reconstrução de linhas pela geometria do TSV + pareamento independente das colunas de nickname/valor + resolvedor próprio com histórico e correções confirmadas. O Admin pode deixar o tipo em Automático ou fixar a coluna antes de ler, evitando depender do cabeçalho. Não existe chamada de Groq/IA externa neste módulo.

A Beta 2.43 endurece a integridade do lote: imagem estruturalmente incompleta ou tipo divergente marca `coverageComplete=false` e impede **Lista completa**, portanto não pode gerar falsas saídas. Valores conflitantes entre screenshots mantêm valor/confiança da mesma leitura e viram exceção; datas impossíveis e Poder inválido são rejeitados. A confirmação no MongoDB usa transação, de modo que membros, snapshot, alterações e aprendizado de correções são confirmados juntos ou não são aplicados.

Screenshots ficam em armazenamento temporário privado durante processamento **e revisão**, permitindo abrir a imagem de origem e destacar o trecho OCR. Eles são removidos ao confirmar/cancelar ou por expiração (lote concluído expira rapidamente). Duplicados são ignorados por SHA-256; checkpoints evitam releitura da imagem atual, upload buffers são liberados após persistência temporária e um Admin não processa dois lotes simultaneamente na mesma instância. Somente dados estruturados revisados são persistidos no MongoDB. A primeira captura completa válida vira baseline; as seguintes detectam entrada, saída e retorno, com limite de 120 membros.
