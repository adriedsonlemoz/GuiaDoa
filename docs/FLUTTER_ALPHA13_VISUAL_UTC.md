# Guia Doa — beta.2.90 / Flutter alpha.13

Versão: `1.0.0-beta.2.90`; versionCode: `100090`.
APK esperado: `GuiaDOA-FLUTTER-beta.2.90-alpha.13.apk`.

## Interface

- Home com brasão sem texto, cenário panorâmico, títulos serifados com fonte embarcada, verde profundo e molduras douradas desenhadas em vetor.
- Removido o selo grande de alpha no cabeçalho. Identificação técnica preservada em Sobre, Configurações, rodapé e nome do APK.
- Oito ilustrações de categorias independentes com transparência; arte principal centralizada acima de título/descrição, sem emojis duplicados e sem recortes retangulares do catálogo.
- Cards compactos, duas colunas no celular estreito e quatro quando a largura e a escala de texto comportarem. Altura acompanha o texto; a fonte ampliada não depende de uma altura rígida.
- Atalhos com ícones vetoriais e distribuição responsiva; destaques com arte integrada e identificação de guia, sem o selo técnico Flutter.
- Resumo com evento confirmado no reino selecionado, favoritos reais e horário da última sincronização completa. Evento ausente não é presumido global; dados incompletos/cache são identificados.
- Navegação vetorial, estados de seleção e espaçamento inferior do conteúdo.
- Chaves `tool.*` em português e inglês, mais textos faltantes usados diretamente por Tropas, Dragões e Configurações. Verificação automática de duplicação e cobertura das chaves literais.
- Campos de entrada de módulos escuros com contraste adequado e filtros legíveis.

## Reinos e UTC

O modelo da API fornece `fuso`. A implementação Flutter também aceita aliases textuais `timezone` e `utc`. Campos ausentes, vazios ou inválidos permanecem desconhecidos; cadastro manual não presume UTC+0.

- Parser central de offsets: UTC, UTC+0, UTC-4, UTC+5:30, UTC-3:30 etc., com validação de minutos e limites.
- Seleção pelo ID real; perfis antigos continuam legíveis e recebem ID/fuso atual quando o reino é reconhecido.
- Nome e fuso do perfil são atualizados pelo catálogo. Trocar idioma preserva o ID do reino.
- Reinos aparecem assim que sua requisição termina, sem esperar a conclusão dos demais módulos.
- Falha em outro módulo não descarta os reinos. Falha no próprio módulo preserva o cache e exibe mensagem de erro distinta de lista vazia.
- Tela de Reinos com busca por nome/ID/UTC, filtro por fuso e relógio atualizado a cada minuto. Detalhes do registro permanecem acessíveis.
- Relógio do reino parte do instante UTC; timestamps oficiais dos eventos não recebem o deslocamento do reino novamente.
- Eventos da Home exigem ocorrência explicitamente confirmada para o reino. O término é exclusivo, exatamente no instante registrado.
- Banco, seeds e regras do backend não foram modificados.

## Recursos gráficos

- `flutter/assets/ui/`: oito PNGs de categoria em 512 px, brasão transparente e cenário panorâmico.
- `flutter/assets/ui/symbols/`: 16 SVGs independentes de navegação/ações.
- `flutter/lib/core/widgets/guia_symbol.dart`: renderização vetorial com os mesmos caminhos dos SVGs.
- `flutter/tool/ui_masters/`: originais das ilustrações para futuras exportações.
- `flutter/tool/android_adaptive_icon/`: foreground transparente e fallbacks por densidade, sem texto miúdo nem quadrado dentro do círculo.
- `flutter/tool/ios_appicon/` e `flutter/tool/web_icons/`: exportações correspondentes.
- `flutter/tool/export_ui_assets.mjs`: exporta os tamanhos a partir do brasão; requer `sharp`, executado na pasta Flutter. O bootstrap usa os arquivos exportados e não depende de sharp.
- `flutter/assets/fonts/`: fontes DejaVu Serif e licença.

As ilustrações e o brasão foram produzidos com o gerador de imagens integrado; os símbolos/molduras são vetoriais. Não foi criado mockup de tela. Prompts-base: objeto isolado por categoria, fantasia pintada em verde esmeralda e ouro antigo, fundo transparente, sem texto/moldura; cenário panorâmico com castelo, cachoeiras e dragão à direita; edição do brasão mantendo dragão/escudo e removendo letras e microdetalhes.

## Validação

Executado nesta entrega:

- 31 testes existentes de eventos/reinos/UTC do backend e da base legada: aprovados.
- Parser de sintaxe em todos os 33 arquivos Dart (incluindo testes): sem erros sintáticos.
- `python3 flutter/tool/verify_release.py`: metadados, traduções, referências de assets e dimensões de launcher aprovados.
- Sintaxe do bootstrap shell e do exportador Node verificada.
- Transparência dos nove assets de objeto/brasão e exportações do launcher inspecionadas.

Acrescentados 13 casos de teste Flutter: UTC/desconhecido/meia hora/virada de dia, migração e persistência do perfil, eventos por reino e fim UTC, falha parcial/cache/resposta malformada/carregamento progressivo e quatro combinações de largura/escala de texto da Home.

**Pendente de execução no workflow:** `flutter analyze`, `flutter test`, build Web, APK Android e iOS. A preparação do SDK local foi interrompida pela revisão automática por tentativa de acesso a metadados da infraestrutura; nenhum build nem teste Flutter local é declarado aprovado. A checagem de sintaxe não substitui análise de tipos ou validação visual em aparelho. O workflow mantém análise e testes obrigatórios antes do build/publicação.

## Reprodução

Na raiz: `python3 flutter/tool/verify_release.py`.

Com Flutter instalado:

```sh
cd flutter
bash tool/bootstrap_platforms.sh
flutter analyze
flutter test
flutter build apk --release
```

O workflow principal publica o APK diretamente como asset da Release, com versão/canal derivados do projeto. React/Capacitor continua como legado temporário.
