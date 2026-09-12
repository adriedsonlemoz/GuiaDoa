# Flutter alpha.18 — recuperação de paridade

Versão: **Guia Doa 1.0.0-beta.2.95 / Flutter alpha.18 / versionCode 100095**.

## Diagnóstico

O React antigo continua no repositório e foi usado como especificação funcional. A revisão encontrou três regressões sistêmicas no Flutter: campos de API lidos com nomes incorretos, emoji tratado como URL e uma ficha genérica que imprimia mapas/JSON diretamente na interface.

## Alterações

| Área | Correção |
|---|---|
| Home | Quatro cards por linha em escala normal; três ou dois apenas com ampliação de texto. |
| Níveis | `poderNecessario`, nível atual, próxima meta, diferença restante e tabela contextual. |
| Tropas | Rótulos traduzidos para Vida, Defesa, ataques, Alcance, Velocidade e Carga. |
| Pesquisas | Ícone emoji correto, detalhe próprio, nível atual/meta salvos e tempos por nível. |
| Edifícios | Detalhe próprio com descrição, tabela de evolução e regras/bônus. |
| Dicas | Conteúdo do artigo legível; metadados internos e JSON relacionado não são exibidos. |
| Ilhas | Seleção das cinco ilhas, quantidades, níveis, limites e resumo de população, cura, produção e trabalhadores. |
| Texto | Código `[HEX]texto` e gradiente por caractere, como no projeto anterior. |
| Bandeiras | Prévia em faixas e código colorido copiável, em vez de copiar apenas o emoji. |

## Validação

- O verificador offline confere metadados, identidade, quatro colunas, chave de poder, traduções, ausência do dump JSON e persistência dos planejadores.
- O workflow executa `flutter analyze`, `flutter test`, build Web, APK e iOS sem assinatura.
