# Flutter migration alpha.11 — beta.2.88

Versão do repositório: **1.0.0-beta.2.88**  
Flutter: **1.0.0-beta.2.88+100088**  
Android versionCode: **100088**

## Objetivo desta etapa

A alpha.11 fecha a primeira passagem de migração funcional: a versão React/Capacitor continua no repositório apenas como referência/legado manual, enquanto o Flutter passa a ter caminhos funcionais para os módulos públicos da versão anterior em Android, Web e iOS.

O nome público do aplicativo volta a ser **Guia Doa**. `FLUTTER alpha.11` continua visível somente como identificação técnica de build dentro do aplicativo/arquivo de release.

## Mapa da versão antiga para Flutter

| Versão React/Capacitor | Flutter alpha.11 |
|---|---|
| Home | Home premium baseada no mockup aprovado |
| Torneios | Central + calculadoras + guias |
| Tropas | Enciclopédia, detalhe, filtros, comparação e custos |
| Cálculos de tropas | Calculadora de marcha/carga/poder/velocidade |
| Aprimoramento de tropas | Calculadora de fósseis, poções e relíquias |
| Dragões | Lista, detalhe, habilidades, níveis e tracker local |
| Edifícios / Gruta / Basílica | Catálogo unificado com detalhes completos dos registros especiais e normais |
| Itens | Catálogo pesquisável, categorias, detalhe e favoritos |
| Pesquisas | Catálogo pesquisável e detalhes completos |
| Ilhas | Planejador local persistente usando o catálogo real de edifícios |
| Níveis | Tabela oficial + progresso local/poder |
| Mapa & Campanha | Catálogo de locais, Grodz e Zyrvorthian fornecido pela API |
| Eventos | Catálogo de eventos e detalhes |
| Dicas | Guias pesquisáveis |
| Reinos | Catálogo de reinos |
| Assistente | Chat conectado à rota `/api/assistente` |
| Backup | Exportar/copiar e restaurar snapshot JSON local |
| Extras | Hub com Reinos, Assistente, Texto Colorido, Backup, Apoio e Sobre |
| Construtor de texto | Gerador de código colorido com cópia |
| Sobre | Identidade, targets e versão |
| Doação/Apoio | Módulo preservado sem inventar chave/dado de pagamento |
| Favoritos | Hub real dos registros marcados nos catálogos |
| Tracker | Hub de progresso de nível e dragões |
| Perfil/Idioma | Perfil local + PT-BR/EN-US persistentes |
| Configurações | Idioma, perfil, sincronização e build |

Os módulos que na versão React tinham múltiplas subrotas puramente de apresentação foram consolidados quando isso evita duplicação, sem remover o conteúdo entregue pela API. Exemplo: Gruta e Basílica continuam disponíveis dentro de Edifícios e abrem os seus registros completos.

## Launcher e identidade

O Android agora usa launcher **adaptativo** (`mipmap-anydpi-v26`) com camada de fundo esmeralda e foreground do brasão. Para Androids antigos existem PNGs circulares por densidade, evitando o quadrado visual visto na alpha.10. O iOS recebeu o conjunto de AppIcon regenerado a partir da arte segura para máscara e a Web reutiliza os ícones maskable.

Nome público nas três plataformas: **Guia Doa**.

APK esperado: `GuiaDOA-FLUTTER-beta.2.88-alpha.11.apk`.
