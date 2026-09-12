import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PlayerProfile {
  const PlayerProfile({
    required this.name,
    required this.realm,
    required this.timezone,
    required this.locale,
  });

  final String name;
  final String realm;
  final String timezone;
  final String locale;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'nome': name,
        'reino': realm,
        'fuso': timezone,
        'locale': locale,
      };

  factory PlayerProfile.fromJson(Map<String, dynamic> json) => PlayerProfile(
        name: (json['nome'] ?? '').toString(),
        realm: (json['reino'] ?? '').toString(),
        timezone: (json['fuso'] ?? '').toString(),
        locale: (json['locale'] ?? 'pt-BR').toString(),
      );
}

class ProfileStore extends ChangeNotifier {
  ProfileStore(this._prefs) {
    _load();
  }

  static const String _key = 'doa_profile_data_flutter';
  static const String _localeKey = 'doa_locale_flutter';

  final SharedPreferences _prefs;
  PlayerProfile? _profile;
  String _locale = 'pt-BR';

  PlayerProfile? get profile => _profile;
  String get locale => _locale;
  bool get hasProfile => _profile != null;

  void _load() {
    _locale = _prefs.getString(_localeKey) ?? 'pt-BR';
    final raw = _prefs.getString(_key);
    if (raw == null || raw.isEmpty) return;
    try {
      final json = jsonDecode(raw);
      if (json is Map<String, dynamic>) {
        _profile = PlayerProfile.fromJson(json);
        _locale = _profile!.locale;
      }
    } on FormatException {
      _profile = null;
    }
  }

  Future<void> save(PlayerProfile profile) async {
    _profile = profile;
    _locale = profile.locale;
    await _prefs.setString(_key, jsonEncode(profile.toJson()));
    await _prefs.setString(_localeKey, _locale);
    notifyListeners();
  }

  Future<void> setLocale(String locale) async {
    _locale = locale;
    final current = _profile;
    if (current != null) {
      _profile = PlayerProfile(
        name: current.name,
        realm: current.realm,
        timezone: current.timezone,
        locale: locale,
      );
      await _prefs.setString(_key, jsonEncode(_profile!.toJson()));
    }
    await _prefs.setString(_localeKey, locale);
    notifyListeners();
  }

  Future<void> clear() async {
    _profile = null;
    await _prefs.remove(_key);
    notifyListeners();
  }
}
