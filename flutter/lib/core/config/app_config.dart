class AppConfig {
  static const String canonicalApiUrl = 'https://guiadoa-agrq.onrender.com';

  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: canonicalApiUrl,
  );

  static const String appName = 'Guia DOA';
  static const String displayVersion = '1.0.0-beta.2.79 · Flutter alpha.1';
}
