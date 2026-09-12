import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiClient {
  ApiClient({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        baseUrl = (baseUrl ?? AppConfig.apiUrl).replaceFirst(RegExp(r'/$'), '');

  final http.Client _client;
  final String baseUrl;

  Uri uri(String path) => Uri.parse('$baseUrl${path.startsWith('/') ? path : '/$path'}');

  Future<dynamic> getJson(String path, {Duration timeout = const Duration(seconds: 20)}) async {
    final response = await _client
        .get(uri(path), headers: const {'Accept': 'application/json'})
        .timeout(timeout);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        'A API respondeu HTTP ${response.statusCode}.',
        statusCode: response.statusCode,
      );
    }

    try {
      return jsonDecode(utf8.decode(response.bodyBytes));
    } on FormatException {
      throw const ApiException('A API retornou uma resposta JSON inválida.');
    }
  }

  Future<void> healthCheck() async {
    await getJson('/api/health', timeout: const Duration(seconds: 45));
  }

  void close() => _client.close();
}
