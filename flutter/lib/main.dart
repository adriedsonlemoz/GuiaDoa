import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app.dart';
import 'core/network/api_client.dart';
import 'core/storage/feature_store.dart';
import 'core/storage/profile_store.dart';
import 'features/catalog/data/game_data_repository.dart';
import 'features/catalog/presentation/game_data_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
    await SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  } else if (!kIsWeb) {
    await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  }
  if (!kIsWeb) {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      systemNavigationBarColor: Colors.transparent,
    ));
  }

  final prefs = await SharedPreferences.getInstance();
  final profileStore = ProfileStore(prefs);
  final featureStore = FeatureStore(prefs);
  final api = ApiClient();
  final gameData = GameDataController(GameDataRepository(api), prefs);

  gameData.addListener(() {
    unawaited(profileStore.synchronizeRealm(gameData.section('reinos')));
  });
  await gameData.restoreCache();
  runApp(GuiaDoaApp(gameData: gameData, profileStore: profileStore, featureStore: featureStore));
  unawaited(gameData.refresh());
}
