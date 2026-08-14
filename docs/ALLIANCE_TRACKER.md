# Alliance Tracker (Admin privado)

O Alliance Tracker é uma ferramenta privada do painel administrativo. Ele não aparece no frontend público.

## Objetivo

Criar histórico da Alliance a partir de screenshots da tela **Aliança > Membros** do jogo. O importador reconhece três colunas:

- Poder
- Última Conexão
- Data de Entrada na Aliança

Desde a Beta 2.42, a leitura de screenshots é **100% local**: **screenshot → regiões de interesse (ROI) → OCR Tesseract.js → resolvedor local do GUIA DOA → validação linha a linha → reconciliação → revisão manual**. O Alliance Tracker não chama Groq nem qualquer outro leitor visual externo.

O OCR roda no backend com Tesseract.js e os dados de idioma instalados nas dependências da API. O resolvedor local cruza nickname, aliases conhecidos, poder anterior, data de entrada e correções manuais já confirmadas. Similaridades comuns de OCR são apenas evidência: correção automática exige pontuação alta e margem segura sobre outros candidatos.

Se uma linha, valor ou cabeçalho não puder ser reconstruído com segurança, o módulo **não inventa o dado e não interrompe o lote**. O caso fica marcado para revisão manual, as linhas seguras são preservadas e a próxima imagem é processada normalmente. O Admin pode confirmar, corrigir, remover ou adicionar linhas antes da importação.

Na Beta 2.41, esse resolvedor local já existia, mas ainda havia um fallback externo restrito a falhas estruturais. A Beta 2.42 removeu esse fallback por completo.

## Configuração opcional do OCR

- `ALLIANCE_OCR_ENABLED=true` — desative apenas para diagnóstico;
- `ALLIANCE_OCR_MIN_CONFIDENCE=0.82` — confiança média mínima das linhas seguras;
- `ALLIANCE_OCR_LINE_MIN_CONFIDENCE=0.76` — confiança mínima por linha antes de marcá-la como exceção;
- `ALLIANCE_OCR_MIN_ROWS=2` — mínimo de linhas para o parser considerar a leitura local utilizável.

Não existe configuração de modelo visual ou chave de IA para o Alliance Tracker. `GROQ_API_KEY`, se configurada no backend, pertence a recursos separados como o Assistente e não participa da importação da Alliance.

## Privacidade e armazenamento

Durante um lote ativo, screenshots são mantidos somente no armazenamento temporário do backend para permitir recuperação após refresh/reconexão. Screenshots idênticos no mesmo envio são detectados por SHA-256 e não são processados duas vezes.

Quando o OCR conclui uma imagem, um checkpoint temporário preserva apenas texto/linhas/diagnóstico necessários para a retomada. Quando aquela imagem termina, o screenshot e o OCR bruto são descartados; fica apenas o resultado estruturado. Ao concluir ou cancelar o lote, arquivos temporários restantes são removidos. Lotes abandonados expiram automaticamente.

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
