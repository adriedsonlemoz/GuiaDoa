class AppConfig {
  static const String canonicalApiUrl = 'https://guiadoa-agrq.onrender.com';

  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: canonicalApiUrl,
  );

  static const String appName = 'Guia DOA';
  static const String buildFamily = 'FLUTTER';
  static const String buildChannel = 'alpha.4';
  static const String installedName = 'Guia DOA Flutter';
  static const String displayVersion = '1.0.0-beta.2.81 · Flutter alpha.4';
}
