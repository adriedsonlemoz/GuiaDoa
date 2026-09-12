class HomeTool {
  const HomeTool({
    required this.keyName,
    required this.labelKey,
    required this.emoji,
    required this.subtitleKey,
    this.catalogKey,
  });

  final String keyName;
  final String labelKey;
  final String emoji;
  final String subtitleKey;
  final String? catalogKey;

  bool get migrated => catalogKey != null || keyName == 'tropas';
}

const List<HomeTool> homeTools = <HomeTool>[
  HomeTool(keyName: 'tropas', labelKey: 'tool.tropas', emoji: '⚔️', subtitleKey: 'tool.tropas.sub', catalogKey: 'tropas'),
  HomeTool(keyName: 'dragoes', labelKey: 'tool.dragoes', emoji: '🐉', subtitleKey: 'tool.dragoes.sub', catalogKey: 'dragoes'),
  HomeTool(keyName: 'edificios', labelKey: 'tool.edificios', emoji: '🏗️', subtitleKey: 'tool.edificios.sub', catalogKey: 'edificios'),
  HomeTool(keyName: 'pesquisas', labelKey: 'tool.pesquisas', emoji: '🔬', subtitleKey: 'tool.pesquisas.sub', catalogKey: 'pesquisas'),
  HomeTool(keyName: 'itens', labelKey: 'tool.itens', emoji: '🎒', subtitleKey: 'tool.itens.sub', catalogKey: 'itens'),
  HomeTool(keyName: 'campanha', labelKey: 'tool.campanha', emoji: '🗺️', subtitleKey: 'tool.campanha.sub'),
  HomeTool(keyName: 'ilhas', labelKey: 'tool.ilhas', emoji: '🏝️', subtitleKey: 'tool.ilhas.sub'),
  HomeTool(keyName: 'niveis', labelKey: 'tool.niveis', emoji: '🏰', subtitleKey: 'tool.niveis.sub', catalogKey: 'niveis'),
  HomeTool(keyName: 'torneios', labelKey: 'tool.torneios', emoji: '🏆', subtitleKey: 'tool.torneios.sub'),
  HomeTool(keyName: 'dicas', labelKey: 'tool.dicas', emoji: '💡', subtitleKey: 'tool.dicas.sub', catalogKey: 'dicas'),
  HomeTool(keyName: 'eventos', labelKey: 'tool.eventos', emoji: '⚡', subtitleKey: 'tool.eventos.sub', catalogKey: 'eventos'),
  HomeTool(keyName: 'extras', labelKey: 'tool.extras', emoji: '🧰', subtitleKey: 'tool.extras.sub'),
];
