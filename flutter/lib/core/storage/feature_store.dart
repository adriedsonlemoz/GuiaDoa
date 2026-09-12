import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FeatureStore extends ChangeNotifier {
  FeatureStore(this._prefs);

  final SharedPreferences _prefs;

  static const String _favoritesKey = 'guiadoa_flutter_favorites_v1';

  Set<String> get favorites {
    final raw = _prefs.getString(_favoritesKey);
    if (raw == null || raw.isEmpty) return <String>{};
    try {
      final decoded = jsonDecode(raw);
      if (decoded is List<Object?>) return decoded.map((e) => e.toString()).toSet();
    } catch (_) {}
    return <String>{};
  }

  bool isFavorite(String id) => favorites.contains(id);

  Future<void> toggleFavorite(String id) async {
    final next = favorites;
    if (!next.add(id)) next.remove(id);
    await _prefs.setString(_favoritesKey, jsonEncode(next.toList()..sort()));
    notifyListeners();
  }

  Map<String, dynamic> readMap(String key) {
    final raw = _prefs.getString(key);
    if (raw == null || raw.isEmpty) return <String, dynamic>{};
    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map<Object?, Object?>) return Map<String, dynamic>.from(decoded);
    } catch (_) {}
    return <String, dynamic>{};
  }

  List<dynamic> readList(String key) {
    final raw = _prefs.getString(key);
    if (raw == null || raw.isEmpty) return <dynamic>[];
    try {
      final decoded = jsonDecode(raw);
      if (decoded is List<Object?>) return decoded;
    } catch (_) {}
    return <dynamic>[];
  }

  Future<void> writeMap(String key, Map<String, dynamic> value) async {
    await _prefs.setString(key, jsonEncode(value));
    notifyListeners();
  }

  Future<void> writeList(String key, List<dynamic> value) async {
    await _prefs.setString(key, jsonEncode(value));
    notifyListeners();
  }

  Future<void> remove(String key) async {
    await _prefs.remove(key);
    notifyListeners();
  }

  Map<String, dynamic> exportSnapshot() {
    final out = <String, dynamic>{
      'schema': 1,
      'exportedAt': DateTime.now().toUtc().toIso8601String(),
      'source': 'Guia Doa Flutter',
      'values': <String, dynamic>{},
    };
    final values = out['values'] as Map<String, dynamic>;
    for (final key in _prefs.getKeys()) {
      final value = _prefs.get(key);
      if (value is String || value is bool || value is int || value is double || value is List<String>) {
        values[key] = value;
      }
    }
    return out;
  }

  Future<int> importSnapshot(Map<String, dynamic> snapshot) async {
    final rawValues = snapshot['values'];
    if (rawValues is! Map<Object?, Object?>) throw const FormatException('Backup inválido: campo values ausente.');
    var restored = 0;
    for (final entry in rawValues.entries) {
      final key = entry.key.toString();
      final value = entry.value;
      if (value is String) {
        await _prefs.setString(key, value);
        restored++;
      } else if (value is bool) {
        await _prefs.setBool(key, value);
        restored++;
      } else if (value is int) {
        await _prefs.setInt(key, value);
        restored++;
      } else if (value is double) {
        await _prefs.setDouble(key, value);
        restored++;
      } else if (value is List<Object?> && value.every((item) => item is String)) {
        await _prefs.setStringList(key, value.cast<String>());
        restored++;
      }
    }
    notifyListeners();
    return restored;
  }

  String exportPrettyJson() => const JsonEncoder.withIndent('  ').convert(exportSnapshot());
}
