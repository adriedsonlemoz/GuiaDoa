# Alliance Tracker (Admin privado)

O Alliance Tracker é uma ferramenta privada do painel administrativo. Ele não aparece no frontend público.

## Objetivo

Criar histórico da Aliança a partir de screenshots da tela **Aliança > Membros** do jogo. O importador reconhece três colunas:

- Poder
- Última Conexão
- Data de Entrada na Aliança

A leitura visual usa a `GROQ_API_KEY` já utilizada pelo Assistente Tático. O modelo pode ser trocado sem alterar código através de `GROQ_VISION_MODEL`. A leitura é sequencial, uma imagem por vez. Em HTTP 429, o serviço respeita `Retry-After` quando disponível e aplica retry/backoff automático antes de tentar o modelo alternativo.

## Privacidade e armazenamento

Durante um lote ativo, os screenshots são mantidos somente em armazenamento temporário do backend para que a leitura possa sobreviver a refresh/reconexão do Admin. Cada imagem concluída tem apenas o resultado estruturado preservado; ela não é relida ao continuar. Assim que o lote conclui ou é cancelado, os arquivos de imagem temporários são removidos. Lotes abandonados expiram automaticamente. O MongoDB continua recebendo somente os dados estruturados que o administrador revisa e confirma.

Coleções:

- `guiadoa_alliance_workspaces`
- `guiadoa_alliance_members`
- `guiadoa_alliance_snapshots`


## Rate limit e retomada

- HTTP 429 não cancela imediatamente o lote;
- `Retry-After` é respeitado quando o provedor o envia;
- sem `Retry-After`, é aplicado backoff exponencial automático;
- a narrativa mostra **“Limite temporário atingido → aguardando → tentando novamente”**;
- o progresso usa imagens realmente concluídas, por exemplo `3/7`;
- se todas as tentativas da imagem falharem, o lote fica pausado;
- **Continuar leitura** retoma da próxima imagem pendente, sem reler as anteriores;
- o identificador do lote é mantido no Admin para recuperação após refresh/reconexão.

A retomada usa armazenamento temporário local da instância do backend. Ela foi projetada para refresh e reconexões normais; uma reinicialização/substituição da instância do Render pode invalidar um lote ainda não concluído.

## Entrada e saída

Uma importação pode ser marcada como **lista completa**. A primeira lista completa vira a baseline e não gera falsas entradas. A partir da segunda lista completa:

- nome novo = entrada;
- membro ativo ausente = saída;
- membro que estava fora e reaparece = retorno.

Capturas parciais nunca marcam membros ausentes como saída.

## Troca de nickname

O sistema apenas sugere uma possível troca usando sinais como poder próximo. A união de históricos exige confirmação manual no Admin.

## Limite

O módulo aplica o limite de 120 membros por Aliança.
