# Códigos de erro do aplicativo

A interface pública usa mensagens simples e códigos de suporte. Detalhes técnicos ficam disponíveis somente ao copiar o diagnóstico.

- `GD-UI-001` — falha inesperada ao renderizar uma tela ou componente.
- `GD-NET-001` — falha de conexão com o serviço de dados.
- `GD-NET-002` — tempo limite de conexão excedido.
- `GD-SRV-001` — serviço remoto temporariamente indisponível.
- `GD-DATA-001` — falha não classificada ao carregar dados do jogo.
- `GD-START-001` — falha de conexão durante a inicialização.
- `GD-START-002` — preparação inicial dos dados não concluída.
- `GD-START-003` — conteúdo essencial ainda indisponível.
- `GD-CONFIG-001` — build de produção/nativo sem `VITE_API_URL` válida.
- `GD-SETUP-001` a `GD-SETUP-004` — validação ou criação do primeiro acesso administrativo.

## Diretriz de interface

Nunca exibir nomes de tecnologias, provedores, URLs internas, stacks ou segredos diretamente para o jogador. A tela deve mostrar uma mensagem acionável, o código de suporte e a opção **Copiar diagnóstico** quando houver informação técnica útil.


## Inicialização e APK

Desde a Beta 2.73, falha de rede/cold start **não é motivo para bloquear a interface pública**. O aplicativo abre o shell imediatamente, tenta acordar o Render por `/api/health` e sincroniza os módulos em segundo plano. Se houver snapshot local, ele continua disponível enquanto isso.

Retentativas automáticas usam backoff progressivo (5s → 15s → 30s → 60s, mantendo o teto de 60s) e também são disparadas quando o navegador/WebView informa que a conexão voltou. O usuário pode solicitar uma sincronização manual pelo aviso compacto.

O CORS da API inclui `https://localhost`, origem usada pelo Capacitor Android quando `androidScheme` é `https`, além de origens nativas compatíveis. Isso evita o cenário em que o site na Vercel funciona e o APK não consegue falar com a mesma API.

Builds Android devem receber `VITE_API_URL` HTTPS; `localhost` e `127.0.0.1` são rejeitados no workflow de APK. `MONGO_URI` nunca deve ser enviada ao frontend/APK.
