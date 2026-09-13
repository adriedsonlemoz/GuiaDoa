# Changelog

## 1.0.0-beta.2.96 — Flutter alpha.19 (2026-09-13)

- Auditoria direta entre as rotas React e as experiências Flutter; documentação deixa de confundir cobertura com paridade completa.
- Campanha ganhou quatro frentes, filtros de campo, cartões com contagens e detalhes próprios de tropas, recursos, recompensas e estratégias.
- Eventos ganhou seleção por reino/todos, estados ativo/próximo/encerrado, contagem regressiva e fases/regras/recompensas expansíveis.
- Datas de Eventos são interpretadas como instantes UTC e exibidas no fuso confirmado da ocorrência.
- Barra inferior cresce com texto ampliado, corrigindo o overflow de 1 px confirmado no workflow 15.
- Metadados sincronizados: beta.2.96 / alpha.19 / 100096.

## 1.0.0-beta.2.95 — Flutter alpha.18 (2026-09-12)

- Home restaurada para quatro colunas no celular, com fallback acessível para texto ampliado.
- Níveis passou a ler `poderNecessario`, calcular nível atual, próxima meta e poder restante sem exibir “Registro 0”.
- Comparação de tropas recebeu as traduções ausentes de todos os atributos.
- Detalhes genéricos deixaram de expor slug, ordem, mapas e JSON técnico; Guias agora exibem conteúdo legível.
- Pesquisas recuperou planejamento persistente de nível atual/meta e tempos por nível.
- Edifícios recuperou ficha, evolução por nível e regras/bônus estruturados.
- Ilhas deixou a grade mock de 12 slots e passou a planejar por ilha, quantidade, nível, limite e resumo calculado.
- Texto Colorido e Bandeiras voltaram ao formato de código aceito pelo jogo, com 32 bandeiras e confirmação de cópia.
- Metadados sincronizados: beta.2.95 / alpha.18 / 100095.

## 1.0.0-beta.2.94 — Flutter alpha.17 (2026-09-12)

- Workflow 15 confirmou que o overflow de 1 px não estava restrito à navegação inferior.
- Em larguras abaixo de 400 px, a Home inteira agora limita a escala de texto a 150%, eliminando overflows internos em acessibilidade a 200%.
- Telas a partir de 400 px e todas as páginas abertas pela Home preservam a escala configurada no aparelho.
- Teste responsivo agora verifica explicitamente a escala efetiva dentro da Home.
- Identidade do GitHub Manager permanece sincronizada.
- Metadados sincronizados: beta.2.94 / alpha.17 / 100094.

## 1.0.0-beta.2.93 — Flutter alpha.16 (2026-09-12)

- Adicionado `github-manager.json` na raiz com nome, versão, versionCode, applicationId, namespace, linguagem e tipo sincronizados.
- Título das novas Releases Flutter padronizado como `Guia Doa v<versão>`.
- Navegação inferior padrão foi substituída por uma barra própria de cinco itens, removendo a limitação estrutural de altura em 360 px com texto a 200%.
- Rótulos da barra usam uma linha com ajuste automático, mantendo os mesmos ícones, destinos e destaque da Home.
- Teste legado do GitHub Manager deixou de exigir a alpha.11 e agora valida dinamicamente a versão atual.
- Metadados sincronizados: beta.2.93 / alpha.16 / 100093.

## 1.0.0-beta.2.92 — Flutter alpha.15 (2026-09-12)

- Corrigido o overflow vertical de 1 px da Home em largura de 360 px com texto ampliado a 200%.
- Cards ganham altura adicional apenas na combinação de tela estreita e texto ampliado; a escala dos rótulos da barra inferior fica limitada a 150%.
- Adicionada identificação estável da barra inferior ao teste responsivo.
- Metadados sincronizados: beta.2.92 / alpha.15 / 100092.

## 1.0.0-beta.2.91 — Flutter alpha.14 (2026-09-12)

- Cards principais reorganizados em três colunas no celular, com altura, arte e tipografia mais compactas.
- Resumo preserva três indicadores; Favoritos exibe somente a contagem.
- Comparar Tropas e Calculadora ficaram sem descrições para impedir quebras de texto; Backup preserva sua explicação curta.
- Destaque de tropas virou Calculadora de Evolução, com ação e ilustração coerentes com a ferramenta.
- Removidas da Home a faixa de sincronização e a assinatura técnica Flutter; atualização permanece no resumo e por gesto.
- Pacote-fonte passa a omitir originais e exportações duplicadas; imagens de interface foram redimensionadas sem mudar o desenho.
- Metadados sincronizados: beta.2.91 / alpha.14 / 100091.

## 1.0.0-beta.2.90 — Flutter alpha.13 (2026-09-12)

- Home com brasão nítido, cenário, molduras vetoriais e cards compactos com ilustrações transparentes.
- Pacote com oito ícones ilustrados e 16 símbolos SVG; launcher sem texto miúdo, exportado para Android/iOS/Web.
- Corrigidas traduções faltantes, contraste de campos escuros e layouts com texto ampliado.
- Reinos carregam independentemente dos demais catálogos; falhas preservam cache e têm estado explícito.
- UTC centralizado, perfil por ID e atualização do fuso a partir do catálogo; horários desconhecidos não presumem UTC+0.
- Resumo da Home usa evento confirmado por reino, favoritos reais e sincronização completa.
- Metadados sincronizados: beta.2.90 / alpha.13 / 100090; testes Flutter adicionados e verificação de pacote no workflow.
- Validação e limitações: [relatório da entrega](docs/FLUTTER_ALPHA13_VISUAL_UTC.md).
