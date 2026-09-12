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
  HomeTool(keyName: 'torneios', assetPath: 'assets/ui/torneios.png', labelKey: 'tool.torneios', emoji: '🏆', subtitleKey: 'tool.torneios.sub'),
  HomeTool(
    keyName: 'tropas',
    labelKey: 'tool.tropas',
    emoji: '⚔️',
    subtitleKey: 'tool.tropas.sub',
    catalogKey: 'tropas',
    assetPath: 'assets/ui/tropas.png',
  ),
  HomeTool(
    keyName: 'dragoes',
    labelKey: 'tool.dragoes',
    emoji: '🐉',
    subtitleKey: 'tool.dragoes.sub',
    catalogKey: 'dragoes',
    assetPath: 'assets/ui/dragoes.png',
  ),
  HomeTool(
    keyName: 'edificios',
    labelKey: 'tool.edificios',
    emoji: '🏰',
    subtitleKey: 'tool.edificios.sub',
    catalogKey: 'edificios',
    assetPath: 'assets/ui/edificios.png',
  ),
  HomeTool(
    keyName: 'itens',
    labelKey: 'tool.itens',
    emoji: '🎒',
    subtitleKey: 'tool.itens.sub',
    catalogKey: 'itens',
    assetPath: 'assets/ui/itens.png',
  ),
  HomeTool(keyName: 'pesquisas', assetPath: 'assets/ui/pesquisas.png', labelKey: 'tool.pesquisas', emoji: '🔬', subtitleKey: 'tool.pesquisas.sub', catalogKey: 'pesquisas'),
  HomeTool(keyName: 'ilhas', assetPath: 'assets/ui/ilhas.png', labelKey: 'tool.ilhas', emoji: '🏝️', subtitleKey: 'tool.ilhas.sub'),
  HomeTool(keyName: 'dicas', assetPath: 'assets/ui/dicas.png', labelKey: 'tool.dicas', emoji: '💡', subtitleKey: 'tool.dicas.sub', catalogKey: 'dicas'),
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
