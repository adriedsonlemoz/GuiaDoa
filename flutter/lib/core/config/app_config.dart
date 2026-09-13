class AppConfig {
  static const String flutterChannel = 'Flutter alpha.19';
  static const String apkFlavor = 'FLUTTER';
  static const String canonicalApiUrl = 'https://guiadoa-agrq.onrender.com';

  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: canonicalApiUrl,
  );

  static const String appName = 'Guia Doa';
  static const String displayVersion = '1.0.0-beta.2.96 · Flutter alpha.19';
}
