import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/game_data_repository.dart';

class GameDataController extends ChangeNotifier {
  GameDataController(this._repository, this._prefs);

  static const String _cacheKey = 'guiadoa_flutter_catalog_snapshot_v1';
  static const String _cacheTimeKey = 'guiadoa_flutter_catalog_snapshot_time_v1';

  final GameDataRepository _repository;
  final SharedPreferences _prefs;

  Map<String, List<Map<String, dynamic>>> _sections = <String, List<Map<String, dynamic>>>{};
  bool _loading = false;
  String? _error;
  DateTime? _lastUpdated;
  bool _fromCache = false;

  Map<String, List<Map<String, dynamic>>> get sections => _sections;
  bool get loading => _loading;
  String? get error => _error;
  DateTime? get lastUpdated => _lastUpdated;
  bool get fromCache => _fromCache;
  bool get hasData => _sections.values.any((items) => items.isNotEmpty);

  List<Map<String, dynamic>> section(String key) => _sections[key] ?? const <Map<String, dynamic>>[];

  Future<void> restoreCache() async {
    final raw = _prefs.getString(_cacheKey);
    if (raw == null || raw.isEmpty) return;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map<String, dynamic>) return;
      final next = <String, List<Map<String, dynamic>>>{};
      for (final entry in decoded.entries) {
        if (entry.value is List<Object?>) {
          next[entry.key] = (entry.value as List<Object?>)
              .whereType<Map<Object?, Object?>>()
              .map((item) => Map<String, dynamic>.from(item))
              .toList(growable: false);
        }
      }
      _sections = next;
      final cacheTime = _prefs.getString(_cacheTimeKey);
      _lastUpdated = cacheTime == null ? null : DateTime.tryParse(cacheTime);
      _fromCache = true;
      notifyListeners();
    } on FormatException {
      // Cache corrompido não impede o aplicativo de abrir.
    }
  }

  Future<void> refresh() async {
    if (_loading) return;
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final next = await _repository.fetchCatalog();
      _sections = next;
      _lastUpdated = DateTime.now().toUtc();
      _fromCache = false;
      await _prefs.setString(_cacheKey, jsonEncode(next));
      await _prefs.setString(_cacheTimeKey, _lastUpdated!.toIso8601String());
    } catch (error) {
      _error = error.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
