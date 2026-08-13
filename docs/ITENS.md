# Itens / Armazém

## Beta 2.19

O Armazém usa exclusivamente a coleção `guiadoa_itens` como fonte pública de dados.
Não existe catálogo paralelo fixo no frontend.

Campos suportados no catálogo:

- nome
- ícone e imagem opcional
- categoria
- raridade
- quantidade por pacote, quando aplicável
- descrição
- origem
- utilização
- limites
- ordem de exibição
- conteúdo traduzido em `i18n`

A migração de dados `1.0.0-beta.2.9` adiciona um pequeno catálogo inicial recuperado das referências visuais disponíveis. O merge de seed preenche dados ausentes sem substituir edições existentes no MongoDB.

No frontend, o Armazém oferece busca, filtros de categoria, grade/lista e detalhes do item. Se a API não retornar itens, a interface informa que o catálogo oficial está vazio em vez de criar dados locais.
