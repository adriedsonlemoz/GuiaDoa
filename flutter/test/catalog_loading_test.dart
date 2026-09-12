import 'dart:convert';
import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:guia_doa/core/network/api_client.dart';
import 'package:guia_doa/features/catalog/data/game_data_repository.dart';
import 'package:guia_doa/features/catalog/presentation/game_data_controller.dart';

void main() {
  test('a failed unrelated module does not discard realms and their UTC', () async {
    final client = MockClient((request) async {
      if (request.url.path == '/api/eventos') return http.Response('failure', 503);
      if (request.url.path == '/api/reinos') return http.Response(jsonEncode({'reinos': [{'id': 348, 'nome': 'Zulanka', 'fuso': 'UTC-4'}]}), 200);
      return http.Response('[]', 200);
    });
    SharedPreferences.setMockInitialValues({});
    final controller = GameDataController(GameDataRepository(ApiClient(client: client)), await SharedPreferences.getInstance());
    await controller.refresh();
    expect(controller.section('reinos').single['fuso'], 'UTC-4');
    expect(controller.sectionError('eventos'), isNotNull);
    expect(controller.sectionError('reinos'), isNull);
    expect(controller.loading, isFalse);
    client.close();
  });
  test('realms become available before other slow catalog requests finish', () async {
    final slow = Completer<http.Response>();
    final client = MockClient((request) async {
      if (request.url.path == '/api/eventos') return slow.future;
      if (request.url.path == '/api/reinos') return http.Response('{"reinos":[{"nome":"Corvith","fuso":"UTC"}]}', 200);
      return http.Response('[]', 200);
    });
    SharedPreferences.setMockInitialValues({});
    final controller = GameDataController(GameDataRepository(ApiClient(client: client)), await SharedPreferences.getInstance());
    final ready = Completer<void>();
    controller.addListener(() { if (controller.sectionAvailable('reinos') && !ready.isCompleted) ready.complete(); });
    final refresh = controller.refresh();
    await ready.future;
    expect(controller.loading, isTrue);
    expect(controller.sectionLoading('reinos'), isFalse);
    slow.complete(http.Response('[]', 200));
    await refresh;
    expect(controller.error, isNull);
    client.close();
  });
  test('malformed realm response preserves cached data and is not reported as empty success', () async {
    SharedPreferences.setMockInitialValues({
      'guiadoa_flutter_catalog_snapshot_v1': jsonEncode({'reinos': [{'id': 345, 'nome': 'Corvith', 'fuso': 'UTC+0'}]}),
      'guiadoa_flutter_catalog_snapshot_time_v1': '2026-09-10T00:00:00Z',
    });
    final client = MockClient((request) async => http.Response(request.url.path == '/api/reinos' ? '{"unexpected":[]}' : '[]', 200));
    final controller = GameDataController(GameDataRepository(ApiClient(client: client)), await SharedPreferences.getInstance());
    await controller.restoreCache();
    await controller.refresh();
    expect(controller.section('reinos').single['id'], 345);
    expect(controller.sectionError('reinos'), isNotNull);
    expect(controller.lastUpdated, DateTime.utc(2026,9,10));
    expect(controller.fromCache, isTrue);
    client.close();
  });
}
