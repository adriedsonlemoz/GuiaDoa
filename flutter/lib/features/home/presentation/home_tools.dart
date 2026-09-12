class HomeTool {
  const HomeTool({
    required this.keyName,
    required this.labelKey,
    required this.emoji,
    required this.subtitle,
    this.catalogKey,
  });

  final String keyName;
  final String labelKey;
  final String emoji;
  final String subtitle;
  final String? catalogKey;

  bool get migrated => catalogKey != null;
}

// Mesma ordem visual da Home React/Capacitor atual.
const List<HomeTool> homeTools = <HomeTool>[
  HomeTool(keyName: 'tropas', labelKey: 'tool.tropas', emoji: '⚔️', subtitle: 'Unidades e atributos', catalogKey: 'tropas'),
  HomeTool(keyName: 'dragoes', labelKey: 'tool.dragoes', emoji: '🐉', subtitle: 'Evolução e poder', catalogKey: 'dragoes'),
  HomeTool(keyName: 'edificios', labelKey: 'tool.edificios', emoji: '🏗️', subtitle: 'Construções e níveis', catalogKey: 'edificios'),
  HomeTool(keyName: 'pesquisas', labelKey: 'tool.pesquisas', emoji: '🔬', subtitle: 'Centro de conhecimento', catalogKey: 'pesquisas'),
  HomeTool(keyName: 'itens', labelKey: 'tool.itens', emoji: '🎒', subtitle: 'Recursos e utilidades', catalogKey: 'itens'),
  HomeTool(keyName: 'campanha', labelKey: 'tool.campanha', emoji: '🗺️', subtitle: 'Mapas e inimigos'),
  HomeTool(keyName: 'ilhas', labelKey: 'tool.ilhas', emoji: '🏝️', subtitle: 'Planejamento e recursos'),
  HomeTool(keyName: 'niveis', labelKey: 'tool.niveis', emoji: '🏰', subtitle: 'Progressão de poder', catalogKey: 'niveis'),
  HomeTool(keyName: 'torneios', labelKey: 'tool.torneios', emoji: '🏆', subtitle: 'Calculadoras e guias'),
  HomeTool(keyName: 'dicas', labelKey: 'tool.dicas', emoji: '💡', subtitle: 'Guias e tutoriais', catalogKey: 'dicas'),
  HomeTool(keyName: 'eventos', labelKey: 'tool.eventos', emoji: '⚡', subtitle: 'Calendário e ocorrências', catalogKey: 'eventos'),
  HomeTool(keyName: 'extras', labelKey: 'tool.extras', emoji: '🧰', subtitle: 'Ferramentas extras'),
];
