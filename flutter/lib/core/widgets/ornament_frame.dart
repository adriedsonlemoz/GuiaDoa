import 'package:flutter/material.dart';
import '../theme/guia_theme.dart';

/// Lightweight vector ornament: no raster frame stretching at different sizes.
class OrnamentFrame extends StatelessWidget {
  const OrnamentFrame({super.key, required this.child, this.onTap, this.parchment = false});
  final Widget child;
  final VoidCallback? onTap;
  final bool parchment;

  @override
  Widget build(BuildContext context) => Material(
    color: Colors.transparent,
    child: DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: parchment ? const [Color(0xFFF2E5C2), Color(0xFFD5C094), Color(0xFFEBDCBA)]
            : const [Color(0xFF0A493B), Color(0xFF04251F), Color(0xFF031713)]),
        boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 6, offset: Offset(0, 3))],
      ),
      child: InkWell(onTap: onTap, child: CustomPaint(
        foregroundPainter: _OrnamentPainter(),
        child: Padding(padding: const EdgeInsets.all(5), child: child),
      )),
    ),
  );
}

class _OrnamentPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final paint = Paint()..style = PaintingStyle.stroke..strokeWidth = 1.3
      ..shader = const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight,
        colors: [GuiaColors.premiumGoldLight, Color(0xFF8D682B), GuiaColors.premiumGoldLight, Color(0xFFAE843D)]).createShader(rect);
    final w = size.width - 1, h = size.height - 1;
    final path = Path()..moveTo(10, 1)..lineTo(w - 10, 1)..lineTo(w, 11)..lineTo(w, h - 10)
      ..lineTo(w - 10, h)..lineTo(11, h)..lineTo(1, h - 10)..lineTo(1, 11)..close();
    canvas.drawPath(path, paint);
    canvas.drawRect(Rect.fromLTRB(4, 4, w - 3, h - 3), paint..strokeWidth = .5);
    for (final corner in [const Offset(0, 0), Offset(w, 0), Offset(0, h), Offset(w, h)]) {
      canvas.save(); canvas.translate(corner.dx, corner.dy);
      canvas.scale(corner.dx == 0 ? 1 : -1, corner.dy == 0 ? 1 : -1);
      canvas.drawPath(Path()..moveTo(2, 19)..lineTo(2, 11)..lineTo(11, 2)..lineTo(19, 2)
        ..moveTo(6, 16)..lineTo(6, 6)..lineTo(16, 6)..close(), paint..strokeWidth = 1.1);
      canvas.restore();
    }
  }
  @override bool shouldRepaint(_OrnamentPainter oldDelegate) => false;
}
