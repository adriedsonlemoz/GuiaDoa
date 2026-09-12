import 'realm_time.dart';

class ActiveEvent {
  const ActiveEvent(this.event, this.end);
  final Map<String, dynamic> event;
  final DateTime end;
  String title(String locale) {
    final i18n = event['i18n'];
    if (locale.startsWith('en') && i18n is Map<Object?, Object?>) {
      final en = i18n['en-US'] ?? i18n['en'];
      if (en is Map<Object?, Object?> && (en['nome'] ?? '').toString().trim().isNotEmpty) return en['nome'].toString();
    }
    return (event['nome'] ?? event['name'] ?? '').toString();
  }
  String remaining(DateTime now) {
    final minutes = end.difference(now.toUtc()).inMinutes;
    if (minutes < 1) return '< 1 min';
    if (minutes >= 1440) return '${minutes ~/ 1440}d ${(minutes % 1440) ~/ 60}h';
    return '${minutes ~/ 60}h ${minutes % 60}min';
  }
  static ActiveEvent? forRealm(List<Map<String, dynamic>> events, {int? realmId, required String realmName, required DateTime now}) {
    final active = <ActiveEvent>[];
    for (final event in events) {
      if (event['ativo'] == false || event['ocorrencias'] is! List<Object?>) continue;
      for (final occurrence in event['ocorrencias'] as List<Object?>) {
        if (occurrence is! Map<Object?, Object?> || occurrence['confirmado'] != true) continue;
        final matches = realmId != null ? '${occurrence['reinoId']}' == '$realmId' : occurrence['reinoNome'] == realmName;
        if (!matches) continue;
        final start = RealmTime.serverInstant(occurrence['inicioServidor']);
        final end = RealmTime.serverInstant(occurrence['fimServidor']);
        if (start != null && end != null && !now.toUtc().isBefore(start) && now.toUtc().isBefore(end)) active.add(ActiveEvent(event, end));
      }
    }
    active.sort((a, b) => a.end.compareTo(b.end));
    return active.isEmpty ? null : active.first;
  }
}
