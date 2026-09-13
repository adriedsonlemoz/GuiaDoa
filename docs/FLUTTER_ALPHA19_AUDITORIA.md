# Flutter alpha.19 — auditoria de paridade com o projeto original

Versão: **Guia Doa 1.0.0-beta.2.96 / Flutter alpha.19 / versionCode 100096**.

## Método

O diretório React `src/` foi tratado como especificação funcional. A auditoria comparou rotas, componentes internos, persistência local, dados consumidos da API e estados de interface com as páginas em `flutter/lib/features/`.

## Matriz de paridade

| Área | Estado | O que já existe no Flutter | O que ainda falta do original |
|---|---|---|---|
| Home | Próximo | 4 colunas, resumo em 3 colunas, atalhos, destaques e navegação | Refinar proporções/arte após capturas da próxima build |
| Torneios | Parcial | 12 modalidades, filtros, persistência e cálculo ponderado | Reproduzir particularidades visuais e regras avançadas de cada calculadora |
| Tropas | Próximo | catálogo tático, detalhe, comparação e simulador de marcha | Afinar relações entre dicas e filtros do simulador antigo |
| Dragões | Próximo | catálogo, detalhe, níveis, habilidades e tracker persistente | Sessão rápida de XP e alguns resumos progressivos |
| Campanha | Parcial → melhorado | frentes, campos, níveis, tropas, recursos, recompensas e estratégias | Experiências exclusivas completas de Grodz e Zyrvorthian |
| Eventos | Parcial → melhorado | filtro por reino, UTC, status, contagem, fases, regras e recompensas | Tutorial rico, compartilhamento e ligações contextuais |
| Edifícios | Parcial | catálogo, detalhe, evolução e regras especiais | Hub e fluxo Gruta → Órbitas → Pedras → Basílica |
| Itens | Parcial | busca, categorias, favoritos e detalhe limpo | preço em rubis, conteúdo de arcas e referências navegáveis |
| Pesquisas | Próximo | catálogo, detalhe, nível/meta e tempos | totais agregados de tempo/custos quando a API os fornecer |
| Ilhas | Parcial | cinco ilhas, limites, quantidade, nível e métricas | população global, recomendação, comparação de planos e territórios |
| Níveis | Parcial | poder atual, nível, próxima meta e tabela oficial | histórico restaurável, meta manual e ganho/perda desde o último registro |
| Dicas | Parcial | lista, favoritos e artigo sem JSON bruto | renderização rica, imagens/lightbox e navegação dos relacionados |
| Texto | Parcial | cor, gradiente, especiais, 32 bandeiras e placar | transformações tipográficas completas e cores personalizadas salvas |
| Reinos | Próximo | catálogo independente, cache, ID canônico, filtro UTC e relógio | apenas refinamento visual |
| Backup/Perfil/Configurações | Próximo | persistência, importação/exportação, idioma e identidade | validação guiada e migração direta de backups React antigos |

## Correções desta entrega

- Campanha e Eventos não abrem mais o componente genérico de catálogo.
- O relógio de Eventos usa `RealmTime.serverInstant` para impedir que uma data sem sufixo seja interpretada no fuso do aparelho.
- Ocorrências só aparecem no escopo do jogador quando o ID do reino confere; nome é fallback apenas para perfis antigos.
- A barra inferior passa de 66 para 72 px sob ampliação de texto, cobrindo a soma real de ícone, rótulo e espaçamento.

## Próxima prioridade recomendada

1. Recuperar o sistema de Edifícios especiais.
2. Completar Ilhas com recomendação e comparação.
3. Criar detalhe próprio de Itens e Dicas relacionados.
4. Completar histórico/metas de Níveis.
5. Recuperar Grodz/Zyrvorthian e refinamentos individuais de Torneios.
