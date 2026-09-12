import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:guia_doa/core/network/api_client.dart';
import 'package:guia_doa/core/storage/profile_store.dart';
import 'package:guia_doa/core/storage/feature_store.dart';
import 'package:guia_doa/core/theme/guia_theme.dart';
import 'package:guia_doa/features/catalog/data/game_data_repository.dart';
import 'package:guia_doa/features/catalog/presentation/game_data_controller.dart';
import 'package:guia_doa/features/home/presentation/home_page.dart';

void main() {
  for (final width in [360.0, 600.0]) {
    for (final scale in [1.0, 2.0]) {
      testWidgets('home navigation and text fit at width $width and scale $scale', (tester) async {
        tester.view.devicePixelRatio = 1;
        tester.view.physicalSize = Size(width, 900);
        addTearDown(tester.view.resetDevicePixelRatio);
        addTearDown(tester.view.resetPhysicalSize);
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();
        final profile = ProfileStore(prefs);
        await profile.save(const PlayerProfile(name: 'Player', realm: 'Corvith', realmId: 345, timezone: 'UTC+0', locale: 'pt-BR'));
        final api = ApiClient();
        final controller = GameDataController(GameDataRepository(api), prefs);
        await tester.pumpWidget(MaterialApp(theme: buildGuiaTheme(), home: MediaQuery(
          data: MediaQueryData(size: Size(width, 900), textScaler: TextScaler.linear(scale)),
          child: HomePage(gameData: controller, profileStore: profile, featureStore: FeatureStore(prefs)))));
        await tester.pumpAndSettle();
        expect(find.text('Guia Doa'), findsOneWidget);
        expect(find.text('tool.torneios'), findsNothing);
        expect(find.byKey(const ValueKey('home-bottom-navigation')), findsOneWidget);
        final homeContext = tester.element(find.byKey(const ValueKey('home-scroll')));
        final homeScale = MediaQuery.textScalerOf(homeContext).scale(14) / 14;
        expect(homeScale, closeTo(width < 400 ? scale.clamp(1.0, 1.5) : scale, .01));
        expect(tester.takeException(), isNull);
        if (scale == 1.0) {
          final tournament = tester.getTopLeft(find.byKey(const ValueKey('home-tool-torneios')));
          final troops = tester.getTopLeft(find.byKey(const ValueKey('home-tool-tropas')));
          final dragons = tester.getTopLeft(find.byKey(const ValueKey('home-tool-dragoes')));
          final buildings = tester.getTopLeft(find.byKey(const ValueKey('home-tool-edificios')));
          expect(tournament.dy, troops.dy);
          expect(troops.dy, dragons.dy);
          expect(dragons.dy, buildings.dy);
          expect(tournament.dx, lessThan(troops.dx));
          expect(troops.dx, lessThan(dragons.dx));
          expect(dragons.dx, lessThan(buildings.dx));
        }
        await tester.drag(find.byType(ListView).first, const Offset(0,-600));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        await tester.pumpWidget(const SizedBox.shrink());
        controller.dispose(); profile.dispose(); api.close();
      });
    }
  }
}
