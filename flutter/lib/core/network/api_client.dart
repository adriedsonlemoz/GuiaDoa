import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        baseUrl = (baseUrl ?? AppConfig.apiUrl).replaceFirst(RegExp(r'/$'), '');

  final http.Client _client;
  final String baseUrl;

  Uri uri(String path) => Uri.parse('$baseUrl${path.startsWith('/') ? path : '/$path'}');

  Future<dynamic> getJson(String path, {Duration timeout = const Duration(seconds: 20)}) async {
    late final http.Response response;
    try {
      response = await _client
          .get(uri(path), headers: const {'Accept': 'application/json'})
          .timeout(timeout);
    } on TimeoutException {
      throw const ApiException('O servidor demorou para responder. Tente novamente.');
    } on http.ClientException {
      throw const ApiException('Não foi possível conectar ao servidor do Guia Doa. Verifique sua internet e tente novamente.');
    }

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

  Future<dynamic> postJson(
    String path,
    Map<String, dynamic> body, {
    Duration timeout = const Duration(seconds: 30),
  }) async {
    late final http.Response response;
    try {
      response = await _client
          .post(
            uri(path),
            headers: const {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: jsonEncode(body),
          )
          .timeout(timeout);
    } on TimeoutException {
      throw const ApiException('O servidor demorou para responder. Tente novamente.');
    } on http.ClientException {
      throw const ApiException('Não foi possível conectar ao servidor do Guia Doa. Verifique sua internet e tente novamente.');
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      String message = 'A API respondeu HTTP ${response.statusCode}.';
      try {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
        if (decoded is Map<Object?, Object?> && decoded['erro'] != null) message = decoded['erro'].toString();
      } catch (_) {}
      throw ApiException(message, statusCode: response.statusCode);
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
