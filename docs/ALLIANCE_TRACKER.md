# Alliance Tracker (Admin privado)

O Alliance Tracker é uma ferramenta privada do painel administrativo. Ele não aparece no frontend público.

## Objetivo

Criar histórico da Aliança a partir de screenshots da tela **Aliança > Membros** do jogo. O importador reconhece três colunas:

- Poder
- Última Conexão
- Data de Entrada na Aliança

A leitura visual usa a `GROQ_API_KEY` já utilizada pelo Assistente Tático. O modelo pode ser trocado sem alterar código através de `GROQ_VISION_MODEL`.

## Privacidade e armazenamento

Os screenshots são recebidos em memória apenas durante a leitura visual e não são persistidos pelo GUIA. O banco recebe somente os dados estruturados revisados pelo administrador.

Coleções:

- `guiadoa_alliance_workspaces`
- `guiadoa_alliance_members`
- `guiadoa_alliance_snapshots`

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
