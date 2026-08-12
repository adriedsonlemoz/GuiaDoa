# Arquitetura — GUIA DOA

## Objetivo

A partir da Beta 2.6, módulos de domínio devem manter UI, estado e serviços separados sempre que houver responsabilidades distintas. A regra prática é evitar arquivos que concentrem navegação, acesso à API, cálculo e renderização ao mesmo tempo.

## Frontend

- `src/App.jsx`: composição principal da aplicação.
- `src/app/useHashRouter.js`: navegação e histórico por hash.
- `src/app/useAppSync.js`: estado de conexão e atualização da fonte MongoDB.
- `src/app/routes.jsx`: mapa de rotas e labels.
- `src/app/*`: componentes estruturais compartilhados do shell.
- `src/components/assistente/`: UI, configuração e estado do Conselheiro Tático.
- `src/components/*`: módulos funcionais do jogo.
- `src/data/GameDataContext.jsx`: fonte única de dados públicos do jogo via API/MongoDB.
- `src/data/syncService.js`: somente limpeza de caches legados e compatibilidade; não armazena dados do jogo.
- `src/hooks/`: hooks compartilhados.
- `src/ui/`: componentes de UI genéricos.


## Fonte de dados (Beta 2.8+)

- MongoDB é a fonte única de verdade para tropas, níveis, dragões, edifícios, pesquisas, reinos, itens, dicas e demais conteúdos administráveis.
- `api/seeds/` contém apenas os dados canônicos usados pela migração automática do backend; esses seeds não são importados pelo frontend.
- A migração canônica roda uma vez por versão do aplicativo. Depois de marcada como concluída em `guiadoa_config`, reinícios da mesma versão não repõem nem sobrescrevem dados: o MongoDB passa a ser a única fonte de verdade.
- `FORCE_DATA_MIGRATION=true` existe apenas como recuperação avançada para reexecutar a migração de uma versão; deve ser removida após o deploy de recuperação.
- `api/services/autoMigration.js` roda antes de a API começar a escutar a porta, cria registros ausentes e completa campos vazios sem substituir edições existentes.
- O frontend não possui fallback estático/offline de dados do jogo. Se API/MongoDB estiver indisponível, o aplicativo informa a indisponibilidade.
- `localStorage` pode continuar sendo usado para estado pessoal de calculadoras, preferências e trackers do dispositivo. Isso não é uma segunda base de referência do jogo.

## Admin

`api/admin/index.html` é somente o shell HTML e os modais estáticos. A lógica fica em `api/admin/js/`:

- `admin-core.js`: utilidades seguras e compartilhadas.
- `admin-state.js`: configuração e estado global mínimo.
- `admin-auth.js`: autenticação.
- `admin-diagnostic.js`: diagnóstico.
- `admin-shell.js`: home, navegação, modal e toast.
- `admin-tropas.js`, `admin-niveis.js`, `admin-dragoes.js`, `admin-edificios.js`, `admin-itens.js`, `admin-pesquisas.js`, `admin-reinos.js`: módulos de domínio.
- `admin-traducoes-catalogo.js`, `admin-traducoes.js`, `admin-traducoes-editor.js`: tradução.
- `admin-dicas.js`: gestão de dicas.
- `api/admin/css/admin.css`: estilos do painel.

## Backend

As rotas Express devem coordenar requisição/resposta; regras reutilizáveis ficam em serviços.

O Assistente é o primeiro módulo convertido para esse padrão:

- `api/routes/assistente.js`: endpoint HTTP.
- `api/services/assistente/models.js`: schemas/consultas usados pelo Assistente.
- `context.js`: transformação dos dados do jogo em contexto.
- `analytics.js`: análise e ranking pré-calculados.
- `intent.js`: detecção de intenção.
- `prompt.js`: montagem do prompt de sistema.
- `groq.js`: integração HTTP com Groq.
- `aprimoramento.js`: regras estáticas de aprimoramento.

## Convenções para novos módulos

1. Não colocar novas regras de domínio diretamente em `App.jsx` ou `api/admin/index.html`.
2. Funções puras de cálculo devem ficar fora dos componentes React.
3. Integrações externas devem ser isoladas em serviços.
4. Componentes devem receber dados por props ou hooks, evitando dependências globais novas.
5. Todo novo serviço de cálculo ou roteamento relevante deve ter pelo menos um teste unitário.
