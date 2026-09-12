import '../../../core/network/api_client.dart';

class CatalogEndpoint {
  const CatalogEndpoint(this.key, this.path, {this.responseKey});

  final String key;
  final String path;
  final String? responseKey;
}

class GameDataRepository {
  GameDataRepository(this._api);

  final ApiClient _api;

  static const List<CatalogEndpoint> endpoints = <CatalogEndpoint>[
    CatalogEndpoint('tropas', '/api/tropas/todas'),
    CatalogEndpoint('niveis', '/api/niveis/todas'),
    CatalogEndpoint('dragoes', '/api/dragoes', responseKey: 'dragoes'),
    CatalogEndpoint('edificios', '/api/edificios', responseKey: 'edificios'),
    CatalogEndpoint('reinos', '/api/reinos', responseKey: 'reinos'),
    CatalogEndpoint('pesquisas', '/api/pesquisas', responseKey: 'pesquisas'),
    CatalogEndpoint('itens', '/api/itens?limite=500', responseKey: 'itens'),
    CatalogEndpoint('eventos', '/api/eventos', responseKey: 'eventos'),
    CatalogEndpoint('dicas', '/api/dicas'),
    CatalogEndpoint('campanha', '/api/campanha', responseKey: 'locais'),
  ];

  Future<Map<String, List<Map<String, dynamic>>>> fetchCatalog() async {
    await _api.healthCheck();
    final entries = await Future.wait(
      endpoints.map((endpoint) async {
        final json = await _api.getJson(endpoint.path);
        return MapEntry(endpoint.key, parseList(json, responseKey: endpoint.responseKey));
      }),
    );
    return Map<String, List<Map<String, dynamic>>>.fromEntries(entries);
  }

  static List<Map<String, dynamic>> parseList(dynamic json, {String? responseKey}) {
    dynamic value = json;
    if (responseKey != null && json is Map<String, dynamic>) {
      value = json[responseKey];
    }
    if (value is! List<Object?>) return const <Map<String, dynamic>>[];
    return value
        .whereType<Map<Object?, Object?>>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
  }
}
