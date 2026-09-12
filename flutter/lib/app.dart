import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/config/app_config.dart';
import 'core/storage/profile_store.dart';
import 'core/theme/guia_theme.dart';
import 'features/catalog/presentation/game_data_controller.dart';
import 'features/home/presentation/home_page.dart';
import 'features/profile/presentation/onboarding_page.dart';

class GuiaDoaApp extends StatelessWidget {
  const GuiaDoaApp({
    super.key,
    required this.gameData,
    required this.profileStore,
  });

  final GameDataController gameData;
  final ProfileStore profileStore;

  Locale _localeFromTag(String tag) {
    final parts = tag.split('-');
    return Locale(parts.first, parts.length > 1 ? parts[1] : null);
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: Listenable.merge(<Listenable>[gameData, profileStore]),
        builder: (context, _) => MaterialApp(
          title: AppConfig.appName,
          debugShowCheckedModeBanner: false,
          theme: buildGuiaTheme(),
          locale: _localeFromTag(profileStore.locale),
          supportedLocales: const <Locale>[
            Locale('pt', 'BR'),
            Locale('en', 'US'),
          ],
          localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: profileStore.hasProfile
              ? HomePage(gameData: gameData, profileStore: profileStore)
              : OnboardingPage(profileStore: profileStore, gameData: gameData),
        ),
      );
}
