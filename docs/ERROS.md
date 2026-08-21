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

A Beta 2.72 limita as novas tentativas automáticas de conexão e aplica timeout. Depois do limite, o Splash deixa de repetir indefinidamente e abre uma tela acionável com **Tentar novamente** e **Copiar diagnóstico**. O diagnóstico inclui versão, origem/configuração da API e número de tentativas, sem registrar senha, token ou segredo.

Builds Android devem receber `VITE_API_URL` HTTPS; `localhost` e `127.0.0.1` são rejeitados no workflow de APK.
