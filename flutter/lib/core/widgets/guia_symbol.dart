import 'package:flutter/material.dart';
import '../theme/guia_theme.dart';

/// Same path sources as assets/ui/symbols; vector rendering at every density.
class GuiaSymbol extends StatelessWidget {
  const GuiaSymbol(this.name, {super.key, this.size = 24, this.color = GuiaColors.premiumGoldLight, this.filled = false});
  final String name;
  final double size;
  final Color color;
  final bool filled;
  @override Widget build(BuildContext context) => SizedBox(width: size, height: size,
    child: CustomPaint(painter: _SymbolPainter(name, color, filled)));
}
const _paths = <String, String>{
  'inicio': 'M 3 11 L 12 3 L 21 11 M 5 10 L 5 21 L 10 21 L 10 15 L 14 15 L 14 21 L 19 21 L 19 10',
  'guias': 'M 12 5 C 9 3 5 3 2 4 L 2 20 C 6 19 9 19 12 21 C 15 19 18 19 22 20 L 22 4 C 19 3 15 3 12 5 L 12 21',
  'tracker': 'M 3 21 L 3 14 L 7 14 L 7 21 Z M 10 21 L 10 8 L 14 8 L 14 21 Z M 17 21 L 17 3 L 21 3 L 21 21 Z',
  'favoritos': 'M 12 2 L 15 8 L 22 9 L 17 14 L 18 21 L 12 18 L 6 21 L 7 14 L 2 9 L 9 8 Z',
  'mais': 'M 3 5 L 21 5 M 3 12 L 21 12 M 3 19 L 21 19',
  'busca': 'M 17 10 C 17 14 14 17 10 17 C 6 17 3 14 3 10 C 3 6 6 3 10 3 C 14 3 17 6 17 10 Z M 15 15 L 22 22',
  'configuracoes': 'M 9 3 L 15 3 L 16 6 L 19 6 L 22 11 L 20 14 L 20 17 L 15 21 L 12 20 L 9 21 L 4 17 L 4 14 L 2 11 L 5 6 L 8 6 Z M 16 12 C 16 14 14 16 12 16 C 10 16 8 14 8 12 C 8 10 10 8 12 8 C 14 8 16 10 16 12 Z',
  'voltar': 'M 14 4 L 6 12 L 14 20 M 6 12 L 22 12',
  'avancar': 'M 9 4 L 17 12 L 9 20',
  'filtro': 'M 2 3 L 22 3 L 15 11 L 15 19 L 9 22 L 9 11 Z',
  'calendario': 'M 4 5 L 20 5 L 20 22 L 4 22 Z M 8 2 L 8 8 M 16 2 L 16 8 M 4 10 L 20 10 M 8 14 L 10 14 M 14 14 L 16 14 M 8 18 L 10 18 M 14 18 L 16 18',
  'relogio': 'M 22 12 C 22 18 18 22 12 22 C 6 22 2 18 2 12 C 2 6 6 2 12 2 C 18 2 22 6 22 12 Z M 12 6 L 12 12 L 16 15',
  'atualizar': 'M 20 8 C 17 2 9 1 5 6 C 1 11 4 20 11 21 C 15 22 20 19 21 15 M 20 2 L 20 8 L 14 8',
  'comparar': 'M 3 3 L 9 5 L 20 20 L 18 22 L 5 9 Z M 21 3 L 15 5 L 4 20 L 6 22 L 19 9 Z M 2 15 L 9 22 M 15 22 L 22 15',
  'calculadora': 'M 5 2 L 19 2 L 19 22 L 5 22 Z M 8 5 L 16 5 L 16 9 L 8 9 Z M 8 13 L 9 13 M 12 13 L 13 13 M 16 13 L 16 13.1 M 8 17 L 9 17 M 12 17 L 13 17 M 16 17 L 16 19',
  'backup': 'M 8 19 L 5 19 C 0 18 1 10 6 10 C 6 2 18 2 18 10 C 24 10 24 19 19 19 L 16 19 M 12 22 L 12 11 M 8 15 L 12 11 L 16 15',
};
final _vectorPaths = _paths.map((name, data) {
  final tokens = data.split(' ');
  final path = Path();
  var index = 0;
  double number() => double.parse(tokens[index++]);
  while (index < tokens.length) {
    final op = tokens[index++];
    switch (op) {
      case 'M': path.moveTo(number(), number()); break;
      case 'L': path.lineTo(number(), number()); break;
      case 'C': path.cubicTo(number(), number(), number(), number(), number(), number()); break;
      case 'Z': path.close(); break;
    }
  }
  return MapEntry(name, path);
});
class _SymbolPainter extends CustomPainter {
  const _SymbolPainter(this.name, this.color, this.filled);
  final String name;
  final Color color;
  final bool filled;
  @override void paint(Canvas canvas, Size size) {
    final path = _vectorPaths[name];
    if (path == null) return;
    canvas.save(); canvas.scale(size.width / 24, size.height / 24);
    if (filled) canvas.drawPath(path, Paint()..color = color.withValues(alpha: .22));
    canvas.drawPath(path, Paint()..color = color..style = PaintingStyle.stroke..strokeWidth = 1.7
      ..strokeCap = StrokeCap.round..strokeJoin = StrokeJoin.round);
    canvas.restore();
  }
  @override bool shouldRepaint(_SymbolPainter old) => name != old.name || color != old.color || filled != old.filled;
}
