# Alliance Tracker (Admin privado)

O Alliance Tracker é uma ferramenta privada do painel administrativo. Ele não aparece no frontend público.

## Objetivo

Criar histórico da Alliance a partir de screenshots da tela **Aliança > Membros** do jogo. O importador reconhece três colunas:

- Poder
- Última Conexão
- Data de Entrada na Aliança

Desde a Beta 2.42, a leitura de screenshots é **100% local**. Na Beta 2.43 o fluxo foi reforçado para: **screenshot → tipo automático ou fixado pelo Admin → ROI → OCR Tesseract.js → reconstrução por posição visual → pareamento de nickname/valor por colunas → resolvedor local → validação estrita → reconciliação → revisão manual**. O Alliance Tracker não chama Groq nem qualquer outro leitor visual externo.

O OCR roda no backend com Tesseract.js e os dados de idioma instalados nas dependências da API. O resolvedor local cruza nickname, aliases conhecidos, poder anterior, data de entrada e correções manuais já confirmadas. Similaridades comuns de OCR são apenas evidência: correção automática exige pontuação alta e margem segura sobre outros candidatos.

Se uma linha, valor ou cabeçalho não puder ser reconstruído com segurança, o módulo **não inventa o dado e não interrompe o lote**. O caso fica marcado para revisão manual, as linhas seguras são preservadas e a próxima imagem é processada normalmente. O Admin pode confirmar, corrigir, remover ou adicionar linhas antes da importação.

Na Beta 2.41, esse resolvedor local já existia, mas ainda havia um fallback externo restrito a falhas estruturais. A Beta 2.42 removeu esse fallback por completo.

## Configuração opcional do OCR

- `ALLIANCE_OCR_ENABLED=true` — desative apenas para diagnóstico;
- `ALLIANCE_OCR_MIN_CONFIDENCE=0.82` — confiança média mínima das linhas seguras;
- `ALLIANCE_OCR_LINE_MIN_CONFIDENCE=0.76` — confiança mínima por linha antes de marcá-la como exceção;
- `ALLIANCE_OCR_MIN_ROWS=1` — mínimo técnico de linhas para considerar uma página utilizável; uma última tela com apenas um membro continua válida.

Não existe configuração de modelo visual ou chave de IA para o Alliance Tracker. `GROQ_API_KEY`, se configurada no backend, pertence a recursos separados como o Assistente e não participa da importação da Alliance.

## Privacidade e armazenamento

Durante processamento e revisão, screenshots são mantidos somente no armazenamento temporário privado do backend. Isso permite recuperação após refresh/reconexão e permite que o Admin abra a **origem temporária** de uma linha duvidosa. Quando há coordenadas OCR, a revisão destaca o trecho correspondente. Screenshots idênticos no mesmo envio são detectados por SHA-256 e não são processados duas vezes.

O checkpoint da imagem atual guarda texto/linhas/diagnóstico apenas para retomada. Depois que a imagem conclui, o checkpoint bruto é compactado; o arquivo de imagem permanece temporário somente até a revisão terminar. Ao confirmar/cancelar, o lote é removido; lotes concluídos não revisados expiram em janela curta e lotes abandonados também expiram automaticamente. Nenhuma imagem é gravada no MongoDB.

O MongoDB recebe somente dados estruturados revisados/confirmados e a memória de correções de nickname. Screenshots nunca viram memória permanente.

Coleções:

- `guiadoa_alliance_workspaces`
- `guiadoa_alliance_members`
- `guiadoa_alliance_snapshots`
- `guiadoa_alliance_ocr_corrections` — memória estruturada de correções manuais de nickname; nunca armazena screenshot.

## Validação avançada e revisão por exceções

- confiança é medida por linha, e não apenas pela média da imagem;
- linhas seguras são preservadas mesmo quando outras ficam inconclusivas;
- sobreposições entre screenshots são unidas sem duplicar membros;
- mesmo valor + nickname parecido em leituras diferentes gera conflito para confirmação, nunca renomeação silenciosa;
- a lista atual de membros serve como evidência para sugestões locais;
- correções confirmadas pelo Admin podem ser reaproveitadas em leituras futuras;
- mais de 120 membros gera alerta e impede importação até a lista ser corrigida;
- o Admin abre primeiro em **Exceções** quando existem dúvidas, com acesso à lista completa em **Todas**;
- uma imagem totalmente inconclusiva vira caso de revisão manual e não derruba as outras imagens;
- o resumo do lote mostra processamento local, duplicatas, correções locais e imagens que exigiram revisão manual.

O OCR tem recuperação própria: timeout/erro do worker reinicia o Tesseract uma vez e tenta uma leitura local limpa. Se ainda assim não concluir, a imagem vai para revisão manual e o lote continua.

## Hardening da Beta 2.43

- o Admin pode fixar o tipo da captura (`Poder`, `Última conexão`, `Data de entrada`) e pular a leitura do cabeçalho;
- o TSV é reconstruído por coordenadas visuais, inclusive quando nickname e valor vêm em blocos diferentes do Tesseract;
- se necessário, nickname e valor são reconhecidos em regiões separadas e pareados pela coordenada vertical;
- imagens estruturalmente incompletas, valores inválidos e tipos conflitantes deixam `coverageComplete=false`;
- `coverageComplete=false` desabilita **Lista completa** no Admin e também é validado no backend, impedindo falsas saídas;
- conflitos do mesmo nickname com valores diferentes preservam **valor + confiança da mesma leitura** e exigem revisão;
- datas são validadas por calendário antes da conversão (`2026-02-31` é inválido) e Poder aceita somente inteiro seguro em formatos conhecidos;
- a importação MongoDB usa transação para membros, snapshot, mudanças e correções de OCR; erro aborta tudo sem commit parcial;
- buffers de upload são liberados após o lote ser persistido temporariamente; heartbeat mantém o lock da leitura viva durante OCR demorado;
- a rota legada `/extract` está depreciada; o fluxo operacional recomendado é o lote retomável `/extract-stream`.

## Progresso e retomada

- as imagens são processadas uma por vez;
- o progresso usa imagens realmente concluídas, por exemplo `3/7`;
- resultados já concluídos não são relidos;
- o checkpoint do OCR pode ser reaproveitado após reconexão;
- **Continuar leitura** retoma da próxima imagem pendente;
- se o backend ainda estiver finalizando a tentativa anterior, um clique coloca o Admin em acompanhamento automático e a retomada acontece assim que o lock for liberado;
- o identificador do lote é mantido no Admin para recuperação após refresh/reconexão.

A retomada usa armazenamento temporário local da instância do backend. Uma reinicialização/substituição da instância do Render pode invalidar um lote ainda não concluído.

## Entrada e saída

Uma importação pode ser marcada como **lista completa**. A primeira lista completa vira a baseline e não gera falsas entradas. A partir da segunda lista completa:

- nome novo = entrada;
- membro ativo ausente = saída;
- membro que estava fora e reaparece = retorno.

Capturas parciais nunca marcam membros ausentes como saída.

## Troca de nickname

O sistema apenas sugere uma possível troca usando sinais como nome, histórico e poder próximo. A união de históricos exige confirmação manual no Admin.

## Limite

O módulo aplica o limite de 120 membros por Alliance.
