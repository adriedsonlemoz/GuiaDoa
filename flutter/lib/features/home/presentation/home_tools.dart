import 'package:flutter/material.dart';

class HomeTool {
  const HomeTool({
    required this.keyName,
    required this.labelKey,
    required this.icon,
    required this.subtitle,
    this.catalogKey,
  });

  final String keyName;
  final String labelKey;
  final IconData icon;
  final String subtitle;
  final String? catalogKey;

  bool get migrated => catalogKey != null;
}

const List<HomeTool> homeTools = <HomeTool>[
  HomeTool(keyName: 'tropas', labelKey: 'tool.tropas', icon: Icons.shield_outlined, subtitle: 'Unidades e atributos', catalogKey: 'tropas'),
  HomeTool(keyName: 'dragoes', labelKey: 'tool.dragoes', icon: Icons.local_fire_department_outlined, subtitle: 'Evolução e poder', catalogKey: 'dragoes'),
  HomeTool(keyName: 'edificios', labelKey: 'tool.edificios', icon: Icons.castle_outlined, subtitle: 'Construções e níveis', catalogKey: 'edificios'),
  HomeTool(keyName: 'pesquisas', labelKey: 'tool.pesquisas', icon: Icons.science_outlined, subtitle: 'Centro de conhecimento', catalogKey: 'pesquisas'),
  HomeTool(keyName: 'itens', labelKey: 'tool.itens', icon: Icons.inventory_2_outlined, subtitle: 'Recursos e utilidades', catalogKey: 'itens'),
  HomeTool(keyName: 'reinos', labelKey: 'tool.reinos', icon: Icons.public_outlined, subtitle: 'Catálogo de reinos', catalogKey: 'reinos'),
  HomeTool(keyName: 'niveis', labelKey: 'tool.niveis', icon: Icons.trending_up_outlined, subtitle: 'Progressão de poder', catalogKey: 'niveis'),
  HomeTool(keyName: 'eventos', labelKey: 'tool.eventos', icon: Icons.bolt_outlined, subtitle: 'Calendário e ocorrências', catalogKey: 'eventos'),
  HomeTool(keyName: 'torneios', labelKey: 'tool.torneios', icon: Icons.emoji_events_outlined, subtitle: 'Calculadoras e guias'),
  HomeTool(keyName: 'dicas', labelKey: 'tool.dicas', icon: Icons.lightbulb_outline, subtitle: 'Guias e tutoriais', catalogKey: 'dicas'),
  HomeTool(keyName: 'campanha', labelKey: 'tool.campanha', icon: Icons.map_outlined, subtitle: 'Mapas e inimigos'),
  HomeTool(keyName: 'ilhas', labelKey: 'tool.ilhas', icon: Icons.landscape_outlined, subtitle: 'Planejamento e recursos'),
];
