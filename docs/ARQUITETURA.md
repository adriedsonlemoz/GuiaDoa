# Arquitetura — GUIA DOA

## Objetivo

A partir da Beta 2.6, módulos de domínio devem manter UI, estado e serviços separados sempre que houver responsabilidades distintas. A regra prática é evitar arquivos que concentrem navegação, acesso à API, cálculo e renderização ao mesmo tempo.

## Frontend

- `src/App.jsx`: composição principal da aplicação.
- `src/app/useHashRouter.js`: navegação e histórico por hash.
- `src/app/useAppSync.js`: estado de conexão e sincronização do serviço de dados.
- `src/app/routes.jsx`: mapa de rotas e labels.
- `src/app/*`: componentes estruturais compartilhados do shell.
- `src/components/assistente/`: UI, configuração e estado do Conselheiro Tático.
- `src/components/ProfileLogin/`: fluxo de idioma e perfil dividido em etapas independentes.
- `src/components/*`: módulos funcionais do jogo.
- `src/data/GameDataContext.jsx`: fonte única de dados públicos do jogo via API/MongoDB.
- `src/data/syncService.js`: somente limpeza de caches legados e compatibilidade; não armazena dados do jogo.
- `src/hooks/`: hooks compartilhados.
- `src/ui/`: componentes de UI genéricos, incluindo estados de erro reutilizáveis.
- `src/errors/`: classificação de falhas e geração de diagnósticos copiáveis; a interface pública exibe códigos de suporte, não detalhes técnicos.


## Fonte de dados (Beta 2.8+)

- MongoDB é a fonte única de verdade para tropas, níveis, dragões, edifícios, pesquisas, reinos, itens, dicas e demais conteúdos administráveis.
- `api/seeds/` contém apenas os dados canônicos usados pela migração automática do backend; esses seeds não são importados pelo frontend.
- A migração canônica possui uma versão de dados própria (`DATA_MIGRATION_VERSION`), independente da versão visual do aplicativo. Atualizações de interface não reexecutam seeds. A versão de dados só muda quando existir uma migração real de conteúdo.
- `FORCE_DATA_MIGRATION=true` existe apenas como recuperação avançada para reexecutar a migração de dados atual; deve ser removida após o deploy de recuperação.
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

## Beta 2.10 — modularização de domínio

A segunda fase de modularização prioriza fronteiras que também servirão à internacionalização:

- `src/components/ilhas/`: estado/persistência, regras e cálculos, tabela, status e resumos de produção.
- `src/components/niveis/`: cálculo de progressão, estado do jogador, diálogos, cartão de nível e tabela.
- `src/components/dragoes/ui/`: cartão, divisor e painel de comparação.
- `src/components/dicas/`: feed, artigo, lightbox, cards e carregamento de dados.
- `src/components/tropas/comparar/`: picker, slots, tabela e configuração de comparação.
- `src/components/tropas/simulador/`: estado do simulador, formação de marcha, comparação e seletor de unidades.
- `src/components/home/`: relógio, perfil, divisores e grade de ferramentas.
- `src/config/api.js`: origem única da URL do serviço online no frontend.

### Critério para parar de dividir

Nem todo arquivo grande deve ser quebrado. Um módulo pode permanecer maior quando representa uma única responsabilidade coesa (por exemplo, um modo específico do Color Builder ou um editor de domínio do Admin). A divisão só deve continuar quando houver mistura clara de estado, regra de negócio, acesso a dados e apresentação, ou quando um trecho for reutilizável/testável isoladamente.

## Beta 2.11 — internacionalização

A internacionalização possui duas camadas independentes:

- **Interface fixa:** `src/locales/pt-BR.js`, `src/locales/en-US.js` e `src/hooks/useI18n.jsx`. Componentes usam chaves com `t(...)` e não consultam serviços externos de tradução.
- **Conteúdo administrável:** a tradução permanece no mesmo documento do domínio, em `i18n.<locale>`. Português é o conteúdo-base/fallback; inglês é opcional e pode ser editado no mesmo formulário do Admin.

A localização de conteúdo é apenas de apresentação. IDs, slugs, nomes técnicos usados por regras, valores de cálculo e o registro bruto vindo de `GameDataContext` permanecem estáveis. Isso evita que uma troca de idioma altere identidade, persistência ou cálculos.

O antigo módulo central de traduções e a integração automática externa foram removidos. Novos Dragões, Tropas, Itens e demais conteúdos não precisam de arquivo de tradução próprio: a tradução acompanha o próprio registro e pode ser atualizada sem redeploy do frontend.
