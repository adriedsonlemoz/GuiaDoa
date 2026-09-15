# Comparação de Tropas — Beta 2.80

Versão: `1.0.0-beta.2.80`. Android: `versionCode 100080`. Data: 2026-09-14.

## Objetivo

Melhorar a leitura da tela **Comparar Tropas** no celular sem alterar os dados ou as regras de atributos existentes.

## Mudanças

- A tabela usa sempre a estrutura `Atributo + Tropa 1 + Tropa 2 + Tropa 3`.
- Slots vazios continuam ocupando sua coluna, impedindo que as unidades selecionadas mudem de posição quando a terceira tropa ainda não foi escolhida.
- O cabeçalho de cada coluna recebe a cor do slot correspondente para ligar visualmente o card aos valores da tabela.
- Nomes usam o conteúdo localizado completo; o corte é somente visual quando a largura não comporta todo o texto.
- Cards preenchidos agora também abrem o seletor, permitindo substituir a unidade diretamente. O botão de remover continua independente.
- O maior valor de cada atributo continua destacado; empates mantêm destaque múltiplo e a tela passa a explicar esse comportamento.

## Responsividade

A grade continua com quatro colunas em telas estreitas. A coluna de atributo mantém largura mínima própria e as três colunas de tropas dividem o espaço restante igualmente, preservando o alinhamento.
