# Catálogo de Itens e Arcas

## Beta 2.58

O módulo público **Itens** continua usando a coleção oficial de itens do backend. A Beta 2.58 amplia o modelo existente sem criar um catálogo paralelo e sem exigir recadastro dos registros antigos.

### Organização principal

O campo `grupo` controla as abas principais:

- `recursos`
- `aceleracoes`
- `geral`
- `arcas`

`destaque` é independente do grupo. Assim, uma Arca ou Aceleração pode aparecer em Destaques sem perder sua categoria real. O campo legado `categoria` foi preservado e continua servindo como classificação mais específica.

### Preços

`preco.valor` guarda o preço atual e `preco.valorOriginal` pode guardar o preço anterior de uma promoção. A interface usa um destaque verde inspirado na apresentação observada no jogo. Preço desconhecido permanece vazio; não é convertido para zero.

### Efeitos estruturados

O objeto `efeito` permite registrar, quando conhecido:

- tipo do efeito;
- valor;
- unidade.

Isso permite representar aceleração, recurso, bônus de produção e outros efeitos sem depender apenas do texto da descrição.

### Conteúdo de Arcas

Arcas usam `conteudo[]`, com:

- `itemSlug`: referência estável a outro item do catálogo;
- `quantidade`;
- `observacao` opcional.

O frontend resolve essa referência usando o mesmo catálogo. Isso permite tanto mostrar **Conteúdo da Arca** quanto a relação inversa **Pode ser obtido em**.

Quando o screenshot indica recompensa aleatória, mas não permite confirmar a tabela completa, o registro usa `conteudoObservacao` e não cria relações exatas inventadas.

### Tutoriais

`Dica.relacionados.itens` aceita slugs de itens. O tutorial pode, portanto, exibir um card reutilizável vindo do catálogo oficial. Nome, imagem, descrição e preço continuam centralizados no item e não precisam ser copiados para cada tutorial.

### Migração segura

A migração de conteúdo `content:itens-catalogo:beta-2.58` é separada da versão canônica dos seeds. Ela:

1. procura um registro existente por `slug` ou nome;
2. completa somente campos ausentes;
3. mescla conteúdos relacionais pela chave `itemSlug`;
4. não substitui edições já feitas no banco;
5. cria apenas itens que ainda não existem.

A versão global de migração de dados permanece inalterada.

### Referências visuais desta etapa

A primeira expansão foi montada a partir das imagens fornecidas para a Beta 2.58. Foram usados apenas nomes, preços, efeitos e conteúdos legíveis com segurança. Itens aleatórios ou campos duvidosos permanecem sem valor exato até nova evidência.
