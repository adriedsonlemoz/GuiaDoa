# Alliance Tracker (Admin privado)

O Alliance Tracker é uma ferramenta privada do painel administrativo. Ele não aparece no frontend público.

## Objetivo

Criar histórico da Aliança a partir de screenshots da tela **Aliança > Membros** do jogo. O importador reconhece três colunas:

- Poder
- Última Conexão
- Data de Entrada na Aliança

A leitura usa um pipeline único e conservador: **screenshot → regiões de interesse (ROI) → OCR local → validação linha a linha → reconciliação → Groq somente nas exceções**. O OCR roda no próprio backend com Tesseract.js e os dados locais de idioma inglês instalados junto das dependências da API; portanto, uma captura que passa pela validação local não gera chamada à IA visual.

Na Beta 2.40, o leitor tenta primeiro uma região ampla do cabeçalho para identificar **Poder**, **Última Conexão** ou **Data de Entrada**. Depois lê somente a região da tabela. Se a primeira leitura não for suficiente, uma segunda passada local usa segmentação e binarização adaptativas antes de qualquer IA. O parser mede confiança por linha: linhas seguras são preservadas mesmo quando outras linhas da mesma captura ficam duvidosas. Ele não tenta adivinhar letras parecidas com números.

Quando restam exceções, a Groq recebe a captura como fallback com o resultado OCR seguro como contexto, e o backend reconcilia as duas leituras sem apagar silenciosamente divergências de nickname. Nomes conflitantes, baixa confiança e variações parecidas com membros já conhecidos ficam marcados para confirmação manual no Admin. O modelo pode ser trocado sem alterar código através de `GROQ_VISION_MODEL`. A leitura continua sequencial, uma imagem por vez. Em HTTP 429 do fallback Groq, o serviço respeita `Retry-After` quando disponível e aplica retry/backoff automático antes de tentar o modelo alternativo.

Configuração opcional do OCR no backend:

- `ALLIANCE_OCR_ENABLED=true` — desativa apenas em caso de diagnóstico;
- `ALLIANCE_OCR_MIN_CONFIDENCE=0.82` — confiança média mínima das linhas seguras;
- `ALLIANCE_OCR_LINE_MIN_CONFIDENCE=0.76` — confiança mínima por linha antes de marcá-la como exceção;
- `ALLIANCE_OCR_MIN_ROWS=2` — mínimo de linhas seguras para considerar o OCR local utilizável.

Se o OCR resolver a captura, a Groq não é necessária. Se o OCR rejeitar uma leitura ambígua e não houver `GROQ_API_KEY`, o lote informa que o fallback não está configurado em vez de inventar valores.

## Privacidade e armazenamento

Durante um lote ativo, os screenshots são mantidos somente em armazenamento temporário do backend para que a leitura possa sobreviver a refresh/reconexão do Admin. Screenshots idênticos no mesmo envio são detectados por hash SHA-256 e não são processados duas vezes. Quando o OCR de uma imagem termina, um checkpoint temporário preserva apenas texto/linhas/diagnóstico necessários para que uma reconexão não obrigue o Tesseract a reler aquela captura antes do fallback. Ao concluir a imagem, o screenshot e o OCR bruto deixam de ser necessários: fica somente o resultado estruturado. Assim que o lote conclui ou é cancelado, todos os arquivos temporários restantes são removidos. Lotes abandonados expiram automaticamente. O MongoDB continua recebendo somente os dados estruturados que o administrador revisa e confirma.

Coleções:

- `guiadoa_alliance_workspaces`
- `guiadoa_alliance_members`
- `guiadoa_alliance_snapshots`


## Validação avançada e revisão por exceções

- o OCR mede confiança em cada linha, em vez de decidir apenas pela média da imagem;
- linhas seguras são preservadas quando outras linhas precisam de fallback;
- sobreposições entre screenshots são unidas sem duplicar membros;
- mesmo valor + nickname parecido em duas leituras gera **conflito de nickname**, nunca renomeação silenciosa;
- a lista atual de membros da Alliance é usada apenas como evidência para destacar grafias parecidas;
- mais de 120 linhas gera alerta estrutural e impede confirmação até a lista ser corrigida;
- o Admin abre primeiro em **Exceções** quando há dúvidas, mas permite alternar para **Todas**;
- exceções precisam ser confirmadas manualmente antes de salvar;
- o resumo do lote mostra imagens únicas, duplicadas, resolvidas só por OCR, fallbacks de IA e percentual de imagens resolvidas sem IA.

O OCR também tem recuperação própria: timeout/erro do worker reinicia o Tesseract uma vez e tenta uma leitura local limpa antes de acionar a Groq.

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
