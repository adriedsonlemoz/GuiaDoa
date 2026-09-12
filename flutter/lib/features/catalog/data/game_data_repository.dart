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

  Future<Map<String, List<Map<String, dynamic>>>> fetchCatalog({
    void Function(String, List<Map<String, dynamic>>)? onLoaded,
    void Function(String, Object)? onError,
  }) async {
    final result = <String, List<Map<String, dynamic>>>{};
    final errors = <String, Object>{};
    await Future.wait(endpoints.map((endpoint) async {
      try {
        final json = await _api.getJson(endpoint.path, timeout: const Duration(seconds: 45));
        final rows = parseList(json, responseKey: endpoint.responseKey);
        result[endpoint.key] = rows;
        onLoaded?.call(endpoint.key, rows);
      } catch (error) {
        errors[endpoint.key] = error;
        onError?.call(endpoint.key, error);
      }
    }));
    if (result.isEmpty && errors.isNotEmpty) throw errors.values.first;
    return result;
  }

  static List<Map<String, dynamic>> parseList(dynamic json, {String? responseKey}) {
    dynamic value = json;
    if (responseKey != null && json is Map<String, dynamic>) {
      value = json[responseKey];
    }
    if (value is! List<Object?>) throw const FormatException('Resposta de catálogo inválida: lista ausente.');
    return value
        .whereType<Map<Object?, Object?>>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
  }
}
