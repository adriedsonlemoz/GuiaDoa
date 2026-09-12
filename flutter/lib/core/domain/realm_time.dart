/// Fixed UTC offsets from the realm catalog. Unknown offsets stay unknown.
class RealmTime {
  static String name(Map<String, dynamic> realm) =>
      (realm['nome'] ?? realm['name'] ?? realm['slug'] ?? '').toString().trim();

  static String selectionKey(Map<String, dynamic> realm) => id(realm) == null ? 'name:${name(realm)}' : 'id:${id(realm)}';

  static List<Map<String, dynamic>> choices(List<Map<String, dynamic>> realms) {
    final unique = <String, Map<String, dynamic>>{};
    for (final realm in realms) { if (name(realm).isNotEmpty) unique[selectionKey(realm)] = realm; }
    return unique.values.toList();
  }

  static int? id(Map<String, dynamic> realm) => int.tryParse('${realm['id']}');

  static Duration? offset(Object? value) {
    final raw = (value ?? '').toString().trim().toUpperCase().replaceAll('−', '-');
    if (raw == 'UTC' || raw == 'GMT' || raw == 'Z') return Duration.zero;
    final match = RegExp(r'^(?:UTC|GMT)?([+-])(\d{1,2})(?::([0-5]\d))?$').firstMatch(raw);
    if (match == null) return null;
    final hours = int.parse(match[2]!);
    final minutes = int.parse(match[3] ?? '0');
    if (hours > 14 || (hours == 14 && minutes != 0)) return null;
    return Duration(minutes: (hours * 60 + minutes) * (match[1] == '-' ? -1 : 1));
  }

  static String normalize(Object? value) {
    final duration = offset(value);
    if (duration == null) return '';
    final minutes = duration.inMinutes;
    final remainder = minutes.abs() % 60;
    return 'UTC${minutes < 0 ? '-' : '+'}${minutes.abs() ~/ 60}'
        '${remainder == 0 ? '' : ':${remainder.toString().padLeft(2, '0')}'}';
  }

  static String zone(Map<String, dynamic>? realm) {
    if (realm == null) return '';
    for (final key in ['fuso', 'timezone', 'utc']) {
      final parsed = normalize(realm[key]);
      if (parsed.isNotEmpty) return parsed;
    }
    return '';
  }

  static DateTime? wallClock(Object? zone, DateTime instant) {
    final delta = offset(zone);
    return delta == null ? null : instant.toUtc().add(delta);
  }

  static String clock(Object? zone, DateTime instant) {
    final time = wallClock(zone, instant);
    if (time == null) return '—';
    String pad(int v) => v.toString().padLeft(2, '0');
    return '${pad(time.hour)}:${pad(time.minute)}';
  }

  /// API server timestamps without suffix are UTC, never device-local time.
  static DateTime? serverInstant(Object? value) {
    final text = (value ?? '').toString().trim();
    if (text.isEmpty) return null;
    if (RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(text)) return DateTime.tryParse('${text}T00:00:00Z');
    final explicit = RegExp(r'(Z|[+-]\d{2}:?\d{2})$', caseSensitive: false).hasMatch(text);
    return DateTime.tryParse(explicit ? text : '${text}Z')?.toUtc();
  }

  static Map<String, dynamic>? find(List<Map<String, dynamic>> realms, {int? realmId, required String realmName}) {
    final matches = realms.where((realm) => realmId != null ? id(realm) == realmId : name(realm) == realmName).toList();
    return matches.length == 1 ? matches.single : null;
  }
}
