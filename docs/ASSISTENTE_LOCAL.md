# Proposta — Assistente local do GUIA DOA

O projeto já possui um assistente conectado ao Groq. Para perguntas estruturadas do jogo, porém, uma API de IA não é obrigatória.

## Objetivo

Responder com os próprios dados do GUIA DOA antes de consultar qualquer modelo externo.

Exemplos:

- "O que faz o Pedaço de Frango?"
- "Onde encontro o Ticket de Campanha de Devastar?"
- "Como atacar o Grodz?"
- "Qual tropa tem o maior ataque à distância?"
- "Compare Magmassauros com Leviatã Ártico."
- "Para que serve a Gruta?"

## Arquitetura sugerida

1. Normalizar a pergunta: minúsculas, remover acentos, aliases e plural.
2. Resolver entidades antes da intenção: procurar nomes/aliases de item, tropa, dragão, construção, campanha e tutorial.
3. Detectar uma intenção determinística: `definicao`, `origem`, `uso`, `comparacao`, `ranking`, `tutorial`, `localizacao`.
4. Executar consulta direta aos dados do projeto.
5. Montar a resposta usando templates PT/EN e links internos para o módulo correspondente.
6. Usar Groq apenas como fallback opcional para perguntas abertas ou ambíguas.

## Por que funciona sem IA

Perguntas de catálogo, ranking e comparação são consultas de banco, não tarefas generativas. Ex.: "maior ataque à distância" = ordenar tropas por `atqDist`; "compare X com Y" = buscar duas tropas e calcular diferenças; "onde acho item X" = ler `origem/onde`; "como atacar Grodz" = abrir a estratégia já cadastrada em Campanha.

## Vantagens

- Respostas muito rápidas.
- Sem limite ou custo de tokens.
- Não depende da disponibilidade do Groq.
- Não inventa números: responde diretamente da base.
- Fica automaticamente melhor conforme novos módulos são cadastrados.
- Groq pode continuar existindo como camada opcional para linguagem mais livre.

## Prioridade futura

Antes de criar um novo modelo de IA, implementar um `knowledge resolver` central que indexe os módulos existentes e devolva `entidade + intenção + dados + rota interna`. Essa camada poderá alimentar tanto um assistente 100% local quanto o Groq atual.
