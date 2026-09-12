import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
import '../../../core/theme/guia_theme.dart';
import '../domain/troop_catalog.dart';

String formatTroopNumber(num value) {
  final integer = value.round();
  final raw = integer.toString();
  final out = StringBuffer();
  for (var index = 0; index < raw.length; index++) {
    if (index > 0 && (raw.length - index) % 3 == 0) out.write('.');
    out.write(raw[index]);
  }
  return out.toString();
}

class TroopPortrait extends StatelessWidget {
  const TroopPortrait({
    super.key,
    required this.troop,
    this.size = 68,
    this.radius = 10,
  });

  final Map<String, dynamic> troop;
  final double size;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final local = troopLocalAssetPath(troop);
    final image = troop['imagem']?.toString().trim() ?? '';
    final remote = image.isEmpty
        ? null
        : image.startsWith('http://') || image.startsWith('https://')
            ? image
            : '${AppConfig.apiUrl}${image.startsWith('/') ? image : '/$image'}';

    Widget fallback() => Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: <Color>[GuiaColors.green2, GuiaColors.greenDark],
            ),
            borderRadius: BorderRadius.circular(radius),
            border: Border.all(color: GuiaColors.goldDark),
          ),
          child: const Icon(Icons.shield_outlined, color: GuiaColors.gold, size: 30),
        );

    Widget networkOrFallback() {
      if (remote == null) return fallback();
      return Image.network(
        remote,
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => fallback(),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: local == null
          ? networkOrFallback()
          : Image.asset(
              local,
              width: size,
              height: size,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => networkOrFallback(),
            ),
    );
  }
}

class TroopRoleBadge extends StatelessWidget {
  const TroopRoleBadge({super.key, required this.role, required this.label});

  final String role;
  final String label;

  IconData get _icon => switch (role) {
        'ranged' => Icons.gps_fixed,
        'speed' => Icons.air,
        'tank' => Icons.shield_outlined,
        'supply' => Icons.inventory_2_outlined,
        _ => Icons.sports_martial_arts_outlined,
      };

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
        decoration: BoxDecoration(
          color: GuiaColors.green.withValues(alpha: .08),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: GuiaColors.green.withValues(alpha: .22)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(_icon, size: 12, color: GuiaColors.green),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: GuiaColors.greenDark)),
          ],
        ),
      );
}

class TroopStatPill extends StatelessWidget {
  const TroopStatPill({
    super.key,
    required this.icon,
    required this.value,
    this.highlighted = false,
  });

  final IconData icon;
  final num value;
  final bool highlighted;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        decoration: BoxDecoration(
          color: highlighted ? GuiaColors.gold.withValues(alpha: .18) : Colors.white.withValues(alpha: .28),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: highlighted ? GuiaColors.goldDark.withValues(alpha: .5) : GuiaColors.border.withValues(alpha: .35),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(icon, size: 12, color: highlighted ? GuiaColors.goldDark : GuiaColors.ink2),
            const SizedBox(width: 3),
            Text(
              formatTroopNumber(value),
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: highlighted ? FontWeight.w900 : FontWeight.w700,
                color: highlighted ? GuiaColors.goldDark : GuiaColors.ink2,
              ),
            ),
          ],
        ),
      );
}
