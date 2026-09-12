import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:guia_doa/core/domain/realm_time.dart';
import 'package:guia_doa/core/domain/active_event.dart';
import 'package:guia_doa/core/storage/profile_store.dart';

void main() {
  test('UTC zero is known; missing and invalid offsets remain unknown', () {
    expect(RealmTime.zone({'fuso': 'UTC'}), 'UTC+0');
    expect(RealmTime.zone({'fuso': '', 'timezone': 'UTC-4'}), 'UTC-4');
    expect(RealmTime.zone({'utc': 'UTC+5:30'}), 'UTC+5:30');
    for (final value in ['', 'unknown', 'UTC+25', 'UTC+14:30', 'UTC+5:99']) {
      expect(RealmTime.offset(value), isNull);
    }
    expect(RealmTime.clock('', DateTime.utc(2026)), '—');
  });
  test('realm offsets cross day boundaries and preserve half hours', () {
    final instant = DateTime.parse('2026-09-12T02:00:00Z');
    expect(RealmTime.wallClock('UTC-4', instant), DateTime.utc(2026, 9, 11, 22));
    expect(RealmTime.clock('UTC+5:30', instant), '07:30');
    expect(RealmTime.clock('UTC-3:30', instant), '22:30');
    expect(RealmTime.clock('UTC', DateTime.parse('2026-09-11T23:00:00-03:00')), '02:00');
  });
  test('server timestamps have the same instant regardless of device or realm zone', () {
    expect(RealmTime.serverInstant('2026-09-12T00:00:00'), DateTime.utc(2026, 9, 12));
    expect(RealmTime.serverInstant('2026-09-11T21:00:00-03:00'), DateTime.utc(2026, 9, 12));
  });
  test('old profiles migrate to realm ID and refreshed catalog corrects stale timezone', () async {
    SharedPreferences.setMockInitialValues({});
    final store = ProfileStore(await SharedPreferences.getInstance());
    await store.save(const PlayerProfile(name: 'Player', realm: 'Corvith', timezone: 'UTC-3', locale: 'pt-BR'));
    await store.synchronizeRealm([{'id': 345, 'nome': 'Corvith', 'fuso': 'UTC'}]);
    expect(store.profile!.realmId, 345);
    expect(store.profile!.timezone, 'UTC+0');
    await store.setLocale('en-US');
    expect(store.profile!.realmId, 345);
    await store.synchronizeRealm([{'id': 345, 'nome': 'Corvith', 'fuso': ''}]);
    expect(store.profile!.timezone, '');
    final restored = ProfileStore(await SharedPreferences.getInstance());
    expect(restored.profile!.realmId, 345);
    expect(restored.profile!.timezone, '');
    expect(restored.locale, 'en-US');
  });
  test('same-name realms retain separate IDs and unrelated updates do not overwrite profile', () async {
    final choices = RealmTime.choices([{'id': 1, 'nome': 'A'}, {'id': 2, 'nome': 'A'}, {'id': 1, 'nome': 'A'}]);
    expect(choices, hasLength(2));
    SharedPreferences.setMockInitialValues({});
    final store = ProfileStore(await SharedPreferences.getInstance());
    await store.save(const PlayerProfile(name: 'Player', realm: 'A', realmId: 2, timezone: 'UTC-4', locale: 'pt-BR'));
    await store.synchronizeRealm([{'id': 1, 'nome': 'A', 'fuso': 'UTC+1'}]);
    expect(store.profile!.timezone, 'UTC-4');
  });
  test('home events require realm confirmation and end exactly at the UTC deadline', () {
    final events = <Map<String, dynamic>>[{'nome': 'Power', 'ativo': true, 'ocorrencias': [
      {'reinoId': 345, 'reinoNome': 'Corvith', 'confirmado': true, 'inicioServidor': '2026-09-11T00:00:00Z', 'fimServidor': '2026-09-12T00:00:00Z'},
    ]}];
    expect(ActiveEvent.forRealm(events, realmId: 345, realmName: 'Corvith', now: DateTime.utc(2026,9,11,23)), isNotNull);
    expect(ActiveEvent.forRealm(events, realmId: 345, realmName: 'Corvith', now: DateTime.utc(2026,9,12)), isNull);
    expect(ActiveEvent.forRealm(events, realmId: 348, realmName: 'Zulanka', now: DateTime.utc(2026,9,11,23)), isNull);
    final occurrences = events.first['ocorrencias'] as List<Object?>;
    (occurrences.first as Map<String, dynamic>)['confirmado'] = false;
    expect(ActiveEvent.forRealm(events, realmId: 345, realmName: 'Corvith', now: DateTime.utc(2026,9,11,23)), isNull);
  });
}
