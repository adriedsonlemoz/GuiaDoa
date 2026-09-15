# Beta 2.73 — APK offline-first e cold start do Render

## Problema encontrado

O APK e o site não chegavam à API da mesma forma. O site publicado na Vercel usava uma origem permitida pelo CORS, enquanto o Android Capacitor deste projeto usa `androidScheme: https` e envia a origem `https://localhost`. Essa origem não estava na allowlist da API.

Além disso, a inicialização pública tinha duas barreiras online consecutivas: `StartupGate` consultava o estado do backend antes de liberar o app e, depois, `GameDataProvider` bloqueava novamente enquanto carregava todos os módulos. Sem dados previamente persistidos, um cold start do Render podia manter o usuário na tela de conexão.

## Solução

- `https://localhost`, `http://localhost`, `capacitor://localhost` e `ionic://localhost` são aceitos pelo CORS da API.
- O shell público não espera mais o Render para aparecer.
- `GameDataProvider` lê primeiro o último snapshot persistido em IndexedDB.
- A API é acordada em segundo plano por `GET /api/health` com timeout próprio para cold start.
- Depois do health, os catálogos são buscados normalmente com `cache: no-store`.
- Um sincronismo bem-sucedido substitui o snapshot local de forma integral.
- Em falha, os dados salvos permanecem visíveis e as novas tentativas usam backoff progressivo.

## Segurança

O cache local contém apenas dados públicos que já foram entregues pela API. Ele não transforma o APK em cliente MongoDB.

Nunca colocar no frontend:

- `MONGO_URI`;
- usuário/senha do cluster;
- `JWT_SECRET`;
- chaves administrativas.

Conectar o APK diretamente ao MongoDB exigiria embutir ou obter credenciais reutilizáveis no cliente, que podem ser extraídas do aplicativo. O desenho correto continua sendo APK → API → MongoDB.

## Primeiro uso

Em uma instalação nova, ainda não existe snapshot local. Mesmo assim o shell abre; os módulos são preenchidos quando a API acorda. A partir do primeiro sincronismo bem-sucedido, as próximas aberturas já podem mostrar o catálogo imediatamente.

## Atualização do cache

A janela de frescor registrada é de 12 horas, mas ela é **soft TTL**. Dados com mais de 12 horas não são apagados automaticamente: continuam sendo fallback até que uma sincronização nova tenha sucesso. Isso evita voltar à tela vazia só porque o Render está dormindo ou o aparelho está sem conexão.

## Continuidade na Beta 2.74

A Beta 2.74 fixa `https://guiadoa-agrq.onrender.com` como endpoint canônico de produção, mantendo toda a estratégia offline-first descrita acima.
