class HomeTool {
  const HomeTool({
    required this.keyName,
    required this.labelKey,
    required this.emoji,
    required this.subtitleKey,
    this.catalogKey,
    this.assetPath,
  });

  final String keyName;
  final String labelKey;
  final String emoji;
  final String subtitleKey;
  final String? catalogKey;
  final String? assetPath;

  bool get migrated => true;
}

const List<HomeTool> homeTools = <HomeTool>[
  HomeTool(keyName: 'torneios', labelKey: 'tool.torneios', emoji: '🏆', subtitleKey: 'tool.torneios.sub'),
  HomeTool(
    keyName: 'tropas',
    labelKey: 'tool.tropas',
    emoji: '⚔️',
    subtitleKey: 'tool.tropas.sub',
    catalogKey: 'tropas',
    assetPath: 'assets/public/assets/troops/hoplita.webp',
  ),
  HomeTool(
    keyName: 'dragoes',
    labelKey: 'tool.dragoes',
    emoji: '🐉',
    subtitleKey: 'tool.dragoes.sub',
    catalogKey: 'dragoes',
    assetPath: 'assets/public/assets/dragons/dragao_dourado.webp',
  ),
  HomeTool(
    keyName: 'edificios',
    labelKey: 'tool.edificios',
    emoji: '🏰',
    subtitleKey: 'tool.edificios.sub',
    catalogKey: 'edificios',
    assetPath: 'assets/public/assets/edificios/especiais/basilica.webp',
  ),
  HomeTool(
    keyName: 'itens',
    labelKey: 'tool.itens',
    emoji: '🎒',
    subtitleKey: 'tool.itens.sub',
    catalogKey: 'itens',
    assetPath: 'assets/public/assets/items/catalog/recurso-ouro.webp',
  ),
  HomeTool(keyName: 'pesquisas', labelKey: 'tool.pesquisas', emoji: '🔬', subtitleKey: 'tool.pesquisas.sub', catalogKey: 'pesquisas'),
  HomeTool(keyName: 'ilhas', labelKey: 'tool.ilhas', emoji: '🏝️', subtitleKey: 'tool.ilhas.sub'),
  HomeTool(keyName: 'dicas', labelKey: 'tool.dicas', emoji: '💡', subtitleKey: 'tool.dicas.sub', catalogKey: 'dicas'),
  HomeTool(keyName: 'campanha', labelKey: 'tool.campanha', emoji: '🗺️', subtitleKey: 'tool.campanha.sub'),
  HomeTool(keyName: 'niveis', labelKey: 'tool.niveis', emoji: '📈', subtitleKey: 'tool.niveis.sub', catalogKey: 'niveis'),
  HomeTool(keyName: 'eventos', labelKey: 'tool.eventos', emoji: '⚡', subtitleKey: 'tool.eventos.sub', catalogKey: 'eventos'),
  HomeTool(keyName: 'extras', labelKey: 'tool.extras', emoji: '🧰', subtitleKey: 'tool.extras.sub'),
];

const List<String> primaryHomeToolKeys = <String>[
  'torneios',
  'tropas',
  'dragoes',
  'edificios',
  'itens',
  'pesquisas',
  'ilhas',
  'dicas',
];
