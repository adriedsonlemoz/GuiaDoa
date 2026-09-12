import 'dart:math' as math;

const List<String> troopFilterIds = <String>[
  'all',
  'melee',
  'ranged',
  'ranged_only',
  'hybrid',
  'speed',
  'tank',
  'supply',
];

const List<String> troopSortIds = <String>[
  'name',
  'life',
  'defense',
  'speed',
  'load',
  'ranged_attack',
  'melee_attack',
  'range',
  'power',
  'balance',
];

const List<String> tacticalRoleIds = <String>['melee', 'ranged', 'speed', 'tank', 'supply'];

const Map<String, String> _metricFields = <String, String>{
  'life': 'vida',
  'defense': 'def',
  'speed': 'vel',
  'load': 'car',
  'ranged_attack': 'atqDist',
  'melee_attack': 'atqPerto',
  'range': 'alcance',
  'power': 'poder',
};

const List<String> highlightMetrics = <String>[
  'life',
  'defense',
  'melee_attack',
  'ranged_attack',
  'speed',
  'load',
  'range',
];

const List<String> _balanceMetrics = <String>['life', 'defense', 'main_attack', 'speed'];

num troopNumber(dynamic value) {
  if (value is num) return value;
  return num.tryParse(value?.toString() ?? '') ?? 0;
}

String troopLocalizedText(Map<String, dynamic> troop, String field, String locale) {
  final i18n = troop['i18n'];
  if (i18n is Map<Object?, Object?>) {
    final localized = i18n[locale];
    if (localized is Map<Object?, Object?>) {
      final value = localized[field]?.toString().trim();
      if (value != null && value.isNotEmpty) return value;
    }
    if (locale.toLowerCase().startsWith('en')) {
      final english = i18n['en-US'];
      if (english is Map<Object?, Object?>) {
        final value = english[field]?.toString().trim();
        if (value != null && value.isNotEmpty) return value;
      }
    }
  }
  return troop[field]?.toString().trim() ?? '';
}

String troopName(Map<String, dynamic> troop, String locale) {
  final localized = troopLocalizedText(troop, 'nome', locale);
  if (localized.isNotEmpty) return localized;
  return troop['name']?.toString().trim().isNotEmpty == true ? troop['name'].toString().trim() : 'Tropa';
}

String troopDescription(Map<String, dynamic> troop, String locale) => troopLocalizedText(troop, 'desc', locale);

num troopMetricValue(Map<String, dynamic> troop, String metric) {
  if (metric == 'main_attack') {
    return math.max(troopNumber(troop['atqPerto']), troopNumber(troop['atqDist']));
  }
  final field = _metricFields[metric];
  return field == null ? 0 : troopNumber(troop[field]);
}

class TroopAttackProfile {
  const TroopAttackProfile({
    required this.melee,
    required this.ranged,
  });

  final num melee;
  final num ranged;

  bool get hasMelee => melee > 0;
  bool get hasRanged => ranged > 0;
  bool get pureRanged => ranged > 0 && melee == 0;
  bool get hybrid => melee > 0 && ranged > 0;
}

TroopAttackProfile attackProfile(Map<String, dynamic> troop) => TroopAttackProfile(
      melee: troopNumber(troop['atqPerto']),
      ranged: troopNumber(troop['atqDist']),
    );

String combatClass(Map<String, dynamic> troop) {
  final attack = attackProfile(troop);
  if (attack.hasRanged && attack.ranged > attack.melee) return 'ranged';
  if (attack.hasMelee) return 'melee';
  if (attack.hasRanged) return 'ranged';
  if (troop['combate'] == 'distancia') return 'ranged';
  if (troop['combate'] == 'corpo_a_corpo') return 'melee';
  return 'support';
}

List<String> explicitTacticalRoles(Map<String, dynamic> troop) {
  final profile = troop['perfilCombate'];
  if (profile is! Map<Object?, Object?>) return const <String>[];
  final raw = profile['funcoesTaticas'];
  if (raw is! List<Object?>) return const <String>[];
  return raw
      .map((value) => value.toString())
      .where(tacticalRoleIds.contains)
      .toSet()
      .toList(growable: false);
}

class TroopCatalogAnalysis {
  const TroopCatalogAnalysis({
    required this.total,
    required this.speedCutoff,
    required this.distributions,
  });

  final int total;
  final num speedCutoff;
  final Map<String, List<num>> distributions;
}

TroopCatalogAnalysis analyzeTroops(List<Map<String, dynamic>> troops) {
  final metrics = <String>{...highlightMetrics, ..._balanceMetrics, 'power'};
  final distributions = <String, List<num>>{};
  for (final metric in metrics) {
    final values = troops
        .map((troop) => troopMetricValue(troop, metric))
        .where((value) => value > 0)
        .toList(growable: true)
      ..sort();
    distributions[metric] = values;
  }
  final speedValues = distributions['speed'] ?? const <num>[];
  final speedCutoff = speedValues.isEmpty
      ? 0
      : speedValues[math.max(0, (speedValues.length * .75).ceil() - 1)];
  return TroopCatalogAnalysis(
    total: troops.length,
    speedCutoff: speedCutoff,
    distributions: distributions,
  );
}

double metricPercentile(TroopCatalogAnalysis analysis, String metric, num value) {
  final values = analysis.distributions[metric] ?? const <num>[];
  if (values.isEmpty || value <= 0) return 0;
  var count = 0;
  for (final candidate in values) {
    if (candidate <= value) count += 1;
  }
  return count / values.length;
}

bool isFastTroop(Map<String, dynamic> troop, TroopCatalogAnalysis analysis) {
  if (explicitTacticalRoles(troop).contains('speed') || troop['rapida'] == true) return true;
  final speed = troopNumber(troop['vel']);
  return speed > 0 && analysis.speedCutoff > 0 && speed >= analysis.speedCutoff;
}

List<String> tacticalRolesForFilter(Map<String, dynamic> troop, TroopCatalogAnalysis analysis) {
  final explicit = explicitTacticalRoles(troop);
  final attack = attackProfile(troop);
  final roles = <String>{
    ...explicit.where((role) => role == 'tank' || role == 'supply'),
  };

  if (attack.hasMelee || attack.hasRanged) {
    final primary = combatClass(troop);
    if (primary == 'melee' || primary == 'ranged') roles.add(primary);
  } else {
    final explicitAttack = explicit.where((role) => role == 'melee' || role == 'ranged').firstOrNull;
    final fallback = explicitAttack ?? combatClass(troop);
    if (fallback == 'melee' || fallback == 'ranged') roles.add(fallback);
  }

  if (isFastTroop(troop, analysis)) roles.add('speed');
  final profile = troop['perfilCombate'];
  final officialType = profile is Map<Object?, Object?> ? profile['tipoOficial']?.toString() : null;
  if (troop['categoria'] == 'transporte' || officialType == 'supply') roles.add('supply');
  return tacticalRoleIds.where(roles.contains).toList(growable: false);
}

bool matchesTroopFilter(Map<String, dynamic> troop, String filter, TroopCatalogAnalysis analysis) {
  if (filter == 'all') return true;
  final attack = attackProfile(troop);
  if (filter == 'ranged_only') return attack.pureRanged;
  if (filter == 'hybrid') return attack.hybrid;
  return tacticalRolesForFilter(troop, analysis).contains(filter);
}

double troopBalanceScore(Map<String, dynamic> troop, TroopCatalogAnalysis analysis) {
  final values = _balanceMetrics
      .map((metric) => metricPercentile(analysis, metric, troopMetricValue(troop, metric)))
      .toList(growable: false);
  if (values.any((value) => value <= 0)) return 0;
  final product = values.fold<double>(1, (total, value) => total * value);
  return math.pow(product, 1 / values.length).toDouble();
}

List<String> strongestAttributeIds(
  Map<String, dynamic> troop,
  TroopCatalogAnalysis analysis, {
  int max = 2,
}) {
  final values = highlightMetrics
      .map((metric) => (
            metric: metric,
            value: troopMetricValue(troop, metric),
            percentile: metricPercentile(analysis, metric, troopMetricValue(troop, metric)),
          ))
      .where((entry) => entry.value > 0)
      .toList(growable: true)
    ..sort((a, b) {
      final percentile = b.percentile.compareTo(a.percentile);
      return percentile != 0 ? percentile : b.value.compareTo(a.value);
    });
  return values.take(math.max(1, max)).map((entry) => entry.metric).toList(growable: false);
}

List<Map<String, dynamic>> sortTroops(
  Iterable<Map<String, dynamic>> troops,
  String sortId,
  TroopCatalogAnalysis analysis,
  String locale,
) {
  final list = troops.toList(growable: true);
  int byName(Map<String, dynamic> a, Map<String, dynamic> b) =>
      troopName(a, locale).toLowerCase().compareTo(troopName(b, locale).toLowerCase());

  if (sortId == 'name') {
    list.sort(byName);
    return list;
  }

  list.sort((a, b) {
    final aValue = sortId == 'balance' ? troopBalanceScore(a, analysis) : troopMetricValue(a, sortId).toDouble();
    final bValue = sortId == 'balance' ? troopBalanceScore(b, analysis) : troopMetricValue(b, sortId).toDouble();
    final value = bValue.compareTo(aValue);
    return value != 0 ? value : byName(a, b);
  });
  return list;
}

bool hasCombatProfile(Map<String, dynamic> troop) {
  final profile = troop['perfilCombate'];
  if (profile is! Map<Object?, Object?>) return false;
  bool nonEmpty(String key) {
    final value = profile[key];
    if (value is List<Object?>) return value.isNotEmpty;
    return value != null && value.toString().trim().isNotEmpty;
  }

  return nonEmpty('tipoOficial') ||
      explicitTacticalRoles(troop).isNotEmpty ||
      nonEmpty('tier') ||
      nonEmpty('forteContra') ||
      nonEmpty('fracoContra') ||
      nonEmpty('habilidadesEspeciais') ||
      nonEmpty('funcaoRecomendada') ||
      nonEmpty('observacoesEstrategicas') ||
      nonEmpty('prioridadeAlvo') ||
      nonEmpty('fonteInformacao') ||
      nonEmpty('confianca');
}

String slugifyTroop(String value) => value
    .toLowerCase()
    .replaceAll(RegExp(r'[áàâãä]'), 'a')
    .replaceAll(RegExp(r'[éèêë]'), 'e')
    .replaceAll(RegExp(r'[íìîï]'), 'i')
    .replaceAll(RegExp(r'[óòôõö]'), 'o')
    .replaceAll(RegExp(r'[úùûü]'), 'u')
    .replaceAll('ç', 'c')
    .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
    .replaceAll(RegExp(r'^-+|-+$'), '');

String? troopLocalAssetPath(Map<String, dynamic> troop) {
  final image = troop['imagem']?.toString().trim() ?? '';
  if (image.contains('/assets/troops/')) {
    final fileName = image.split('/').last;
    return 'assets/public/assets/troops/$fileName';
  }
  final slug = troop['slug']?.toString().trim();
  if (slug != null && slug.isNotEmpty) {
    return 'assets/public/assets/troops/$slug.webp';
  }
  final name = troop['nome']?.toString().trim();
  if (name != null && name.isNotEmpty) {
    return 'assets/public/assets/troops/${slugifyTroop(name)}.webp';
  }
  return null;
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
