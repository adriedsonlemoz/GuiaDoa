# Idiomas — GUIA DOA

## Princípio

O sistema de idiomas separa **interface fixa** de **conteúdo administrável**. Essa divisão evita depender de serviços externos de tradução e permite adicionar novos conteúdos bilíngues sem publicar uma nova versão do aplicativo.

## Interface fixa

Textos de navegação, botões, títulos, mensagens, estados de carregamento e demais rótulos da interface ficam em arquivos locais:

- `src/locales/pt-BR.js`
- `src/locales/en-US.js`
- `src/hooks/useI18n.jsx`

Componentes usam `t('chave')`. Português e inglês devem manter o mesmo conjunto de chaves. Os testes de arquitetura verificam essa paridade.

A interface fixa não consulta API externa de tradução e continua disponível junto com os arquivos do aplicativo.

## Conteúdo administrável

Tropas, Dragões, Edifícios, Itens, Pesquisas, Reinos e Dicas guardam suas traduções no **mesmo documento do conteúdo**.

Português é o conteúdo-base e também o fallback. O inglês fica no bloco `i18n.en-US`.

Exemplo de um Dragão:

```json
{
  "slug": "water-dragon",
  "nome": "Dragão de Água",
  "descricao": "Descrição em português",
  "i18n": {
    "en-US": {
      "nome": "Water Dragon",
      "descricao": "English description"
    }
  }
}
```

IDs, slugs, chaves técnicas, valores numéricos e dados usados em cálculos **não são traduzidos**. A tradução é aplicada somente na apresentação.

## Como adicionar um novo Dragão

1. Abra **Admin → Dragões**.
2. Crie o Dragão normalmente e preencha os campos-base em português.
3. No mesmo formulário, preencha a seção **English (opcional)**.
4. Salve.
5. O conteúdo fica disponível nos dois idiomas pela API imediatamente; não é necessário editar arquivo de idioma nem fazer novo deploy apenas para mudar a tradução desse Dragão.

Se o campo em inglês estiver vazio, o aplicativo mostra automaticamente o conteúdo em português.

O mesmo princípio vale para Tropas, Edifícios, Itens, Pesquisas, Reinos e Dicas.

## Módulo antigo de traduções

O módulo separado de traduções do Admin e a integração externa de tradução automática foram removidos. O aplicativo não usa mais MyMemory nem `/api/traducoes`.

Uma coleção legada `guiadoa_traducoes`, caso ainda exista em um banco antigo, não é mais lida nem alterada pelo aplicativo e pode ser removida manualmente depois de confirmar que não é usada por nenhuma versão antiga em produção.

## Adicionando outro idioma no futuro

Para um novo idioma de interface:

1. adicionar o arquivo em `src/locales/`;
2. registrar o locale no `useI18n`;
3. adicionar as mesmas chaves dos idiomas existentes;
4. habilitar o locale permitido na sanitização de conteúdo do backend;
5. habilitar a seção correspondente nos formulários do Admin.

Não é necessário voltar a criar uma coleção de traduções separada.
