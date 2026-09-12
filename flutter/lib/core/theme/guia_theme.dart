import 'package:flutter/material.dart';

class GuiaColors {
  static const Color parchment = Color(0xFFD9CEAA);
  static const Color parchmentLight = Color(0xFFEADFC0);
  static const Color parchmentDark = Color(0xFFD0C39C);
  static const Color green = Color(0xFF2F5652);
  static const Color green2 = Color(0xFF3C6863);
  static const Color greenDark = Color(0xFF213F3C);
  static const Color gold = Color(0xFFC7A85F);
  static const Color goldDark = Color(0xFF806A3B);
  static const Color border = Color(0xFFA68C57);
  static const Color ink = Color(0xFF2E342F);
  static const Color ink2 = Color(0xFF4F574D);
  static const Color muted = Color(0xFF687064);

  // Identidade Flutter inspirada no mockup aprovado.
  static const Color premiumBackground = Color(0xFF031713);
  static const Color premiumBackground2 = Color(0xFF06241E);
  static const Color premiumPanel = Color(0xFF07362D);
  static const Color premiumPanel2 = Color(0xFF0A493B);
  static const Color premiumEmerald = Color(0xFF0B6B50);
  static const Color premiumEmeraldLight = Color(0xFF15976E);
  static const Color premiumGold = Color(0xFFD6B65C);
  static const Color premiumGoldLight = Color(0xFFF1D58A);
  static const Color premiumText = Color(0xFFFFF6D8);
  static const Color premiumMuted = Color(0xFFC7D1C8);
}

ThemeData buildGuiaTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: GuiaColors.green,
    brightness: Brightness.light,
    primary: GuiaColors.green,
    secondary: GuiaColors.gold,
    surface: GuiaColors.parchmentLight,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: GuiaColors.parchment,
    fontFamily: null,
    appBarTheme: const AppBarTheme(
      backgroundColor: GuiaColors.green,
      foregroundColor: Colors.white,
      centerTitle: true,
      elevation: 2,
      surfaceTintColor: Colors.transparent,
    ),
    cardTheme: CardThemeData(
      color: GuiaColors.parchmentLight,
      elevation: 2,
      shadowColor: Colors.black.withValues(alpha: .16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: const BorderSide(color: GuiaColors.border),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFFF7F1DC),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(9),
        borderSide: const BorderSide(color: GuiaColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(9),
        borderSide: const BorderSide(color: GuiaColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(9),
        borderSide: const BorderSide(color: GuiaColors.green, width: 1.5),
      ),
    ),
  );
}
