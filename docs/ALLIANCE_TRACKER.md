# Alliance Tracker (Admin privado)

O Alliance Tracker é uma ferramenta privada do painel administrativo. Ele não aparece no frontend público.

## Objetivo

Criar histórico da Aliança a partir de screenshots da tela **Aliança > Membros** do jogo. O importador reconhece três colunas:

- Poder
- Última Conexão
- Data de Entrada na Aliança

A leitura usa um pipeline único e conservador: **screenshot → OCR local → validação por regras → Groq somente como fallback**. O OCR roda no próprio backend com Tesseract.js e os dados locais de idioma inglês instalados junto das dependências da API; portanto, uma captura que passa pela validação local não gera chamada à IA visual.

O parser local só aceita a imagem quando consegue confirmar o tipo da coluna, extrair um número mínimo de linhas e atingir o limiar de confiança configurado. Ele não tenta adivinhar letras parecidas com números: leituras ambíguas são encaminhadas ao fallback visual em vez de virarem dados oficiais. Quando o OCR local não é suficiente, a `GROQ_API_KEY` já usada pelo Assistente Tático é acionada apenas para aquela imagem. O modelo pode ser trocado sem alterar código através de `GROQ_VISION_MODEL`. A leitura continua sequencial, uma imagem por vez. Em HTTP 429 do fallback Groq, o serviço respeita `Retry-After` quando disponível e aplica retry/backoff automático antes de tentar o modelo alternativo.

Configuração opcional do OCR no backend:

- `ALLIANCE_OCR_ENABLED=true` — desativa apenas em caso de diagnóstico;
- `ALLIANCE_OCR_MIN_CONFIDENCE=0.82` — confiança mínima média para aceitar OCR sem IA;
- `ALLIANCE_OCR_MIN_ROWS=2` — mínimo de linhas confirmadas para aceitar a captura localmente.

Se o OCR resolver a captura, a Groq não é necessária. Se o OCR rejeitar uma leitura ambígua e não houver `GROQ_API_KEY`, o lote informa que o fallback não está configurado em vez de inventar valores.

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
