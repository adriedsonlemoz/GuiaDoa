# Beta 2.74 — Backend canônico do APK

## Endpoint oficial

O frontend web e o APK usam por padrão:

`https://guiadoa-agrq.onrender.com`

O endereço é público e pode ficar no bundle. Ele não concede acesso direto ao MongoDB e não contém credenciais.

## Resolução da URL

1. `VITE_API_URL`, quando definido, sobrescreve o endpoint para ambientes alternativos.
2. Em desenvolvimento (`vite dev`), sem override, o frontend usa `http://localhost:3001`.
3. Em produção e no Capacitor, sem override, usa a URL canônica do Render.

O APK nunca deve interpretar `localhost` como backend de produção, pois no Android isso aponta para o próprio aparelho.

## GitHub Actions

O workflow de APK usa a URL canônica como fallback. O secret `VITE_API_URL` deixa de ser obrigatório para o backend oficial, mas continua aceito para staging/migração. URLs localhost, HTTP sem TLS e valores inválidos continuam bloqueados.

## Cold start

A Beta 2.74 mantém o fluxo offline-first da Beta 2.73: cache local → interface → health check do Render → sincronização em segundo plano. O MongoDB nunca é acessado diretamente pelo APK.
