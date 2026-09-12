String localizedValue(Map<String, dynamic> record, String field, String locale) {
  final base = record[field];
  if (!locale.toLowerCase().startsWith('en')) return base?.toString() ?? '';
  final i18n = record['i18n'];
  if (i18n is Map<Object?, Object?>) {
    for (final localeKey in const <String>['en-US', 'en', 'en_US']) {
      final branch = i18n[localeKey];
      if (branch is Map<Object?, Object?> && branch[field] != null && branch[field].toString().trim().isNotEmpty) {
        return branch[field].toString();
      }
    }
  }
  return base?.toString() ?? '';
}

String recordTitle(Map<String, dynamic> item, String locale) {
  for (final key in const <String>['nome', 'nome_pt', 'name', 'titulo', 'title', 'slug']) {
    final value = localizedValue(item, key, locale).trim();
    if (value.isNotEmpty) return value;
  }
  return locale.toLowerCase().startsWith('en') ? 'Record' : 'Registro';
}

String recordSubtitle(Map<String, dynamic> item, String locale) {
  final parts = <String>[];
  for (final key in const <String>['elemento', 'tipo', 'categoria', 'raridade', 'nivel', 'poder', 'descricao_curta']) {
    final value = localizedValue(item, key, locale).trim();
    if (value.isNotEmpty) parts.add(value);
    if (parts.length == 2) break;
  }
  return parts.join(' · ');
}

double numberValue(dynamic value) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString().replaceAll(',', '.') ?? '') ?? 0;
}

int intValue(dynamic value) => numberValue(value).round();

String formatCompactNumber(num value) {
  final abs = value.abs();
  if (abs >= 1000000000) return '${(value / 1000000000).toStringAsFixed(abs >= 10000000000 ? 0 : 1)}B';
  if (abs >= 1000000) return '${(value / 1000000).toStringAsFixed(abs >= 10000000 ? 0 : 1)}M';
  if (abs >= 1000) return '${(value / 1000).toStringAsFixed(abs >= 10000 ? 0 : 1)}K';
  return value.toStringAsFixed(value % 1 == 0 ? 0 : 1);
}
