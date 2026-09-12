import 'package:flutter/material.dart';

import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/profile_store.dart';
import '../../../core/theme/guia_theme.dart';
import '../domain/troop_catalog.dart';
import 'troop_widgets.dart';

class TroopDetailPage extends StatefulWidget {
  const TroopDetailPage({
    super.key,
    required this.troop,
    required this.analysis,
    required this.profileStore,
  });

  final Map<String, dynamic> troop;
  final TroopCatalogAnalysis analysis;
  final ProfileStore profileStore;

  @override
  State<TroopDetailPage> createState() => _TroopDetailPageState();
}

class _TroopDetailPageState extends State<TroopDetailPage> {
  final TextEditingController _quantityController = TextEditingController(text: '1');

  @override
  void dispose() {
    _quantityController.dispose();
    super.dispose();
  }

  int get _quantity {
    final parsed = int.tryParse(_quantityController.text.replaceAll(RegExp(r'\D'), '')) ?? 1;
    return parsed <= 0 ? 1 : parsed;
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    final troop = widget.troop;
    final locale = widget.profileStore.locale;
    final name = troopName(troop, locale);
    final description = troopDescription(troop, locale);
    final roles = tacticalRolesForFilter(troop, widget.analysis);
    final strongest = strongestAttributeIds(troop, widget.analysis).toSet();
    final profile = troop['perfilCombate'] is Map<Object?, Object?> ? Map<String, dynamic>.from(troop['perfilCombate'] as Map<Object?, Object?>) : <String, dynamic>{};

    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: SafeArea(
        top: false,
        child: LayoutBuilder(
          builder: (context, constraints) => Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 760),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(12, 12, 12, 28),
                children: <Widget>[
                  _HeroCard(
                    troop: troop,
                    name: name,
                    description: description,
                    roles: roles,
                    strings: strings,
                  ),
                  const SizedBox(height: 12),
                  _MatchupsCard(troop: troop, profile: profile, strings: strings, locale: locale),
                  const SizedBox(height: 12),
                  _AttributesCard(
                    troop: troop,
                    strongest: strongest,
                    strings: strings,
                  ),
                  if (hasCombatProfile(troop)) ...<Widget>[
                    const SizedBox(height: 12),
                    _CombatDetailsCard(troop: troop, profile: profile, roles: roles, strings: strings, locale: locale),
                  ],
                  const SizedBox(height: 12),
                  _TrainingCard(
                    troop: troop,
                    quantityController: _quantityController,
                    quantity: _quantity,
                    strings: strings,
                    onQuantityChanged: () => setState(() {}),
                    onPreset: (value) {
                      _quantityController.text = '$value';
                      setState(() {});
                    },
                  ),
                  const SizedBox(height: 12),
                  _UnlockCard(troop: troop, strings: strings),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({
    required this.troop,
    required this.name,
    required this.description,
    required this.roles,
    required this.strings,
  });

  final Map<String, dynamic> troop;
  final String name;
  final String description;
  final List<String> roles;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    final combat = combatClass(troop);
    final type = combat == 'ranged'
        ? strings.t('troops.attack.ranged')
        : combat == 'melee'
            ? strings.t('troops.attack.melee')
            : strings.t('troops.attack.support');
    final isSpecial = troop['tipo']?.toString() == 'especial';

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(13),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            TroopPortrait(troop: troop, size: 104, radius: 12),
            const SizedBox(width: 13),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: GuiaColors.ink)),
                  const SizedBox(height: 4),
                  Wrap(
                    spacing: 6,
                    runSpacing: 5,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: <Widget>[
                      Text(type, style: const TextStyle(color: GuiaColors.ink2, fontSize: 12, fontWeight: FontWeight.w700)),
                      Container(width: 3, height: 3, decoration: const BoxDecoration(shape: BoxShape.circle, color: GuiaColors.muted)),
                      Text(
                        '${strings.t('common.power')} ${formatTroopNumber(troopNumber(troop['poder']))}',
                        style: const TextStyle(color: GuiaColors.goldDark, fontSize: 12, fontWeight: FontWeight.w900),
                      ),
                      if (isSpecial)
                        _MiniBadge(icon: Icons.auto_awesome, label: strings.t('troops.special')),
                    ],
                  ),
                  if (roles.isNotEmpty) ...<Widget>[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 5,
                      runSpacing: 5,
                      children: roles.map((role) => TroopRoleBadge(role: role, label: strings.t('troops.tactical.$role'))).toList(growable: false),
                    ),
                  ],
                  if (description.isNotEmpty) ...<Widget>[
                    const SizedBox(height: 9),
                    Text(description, style: const TextStyle(color: GuiaColors.ink2, fontSize: 12.5, height: 1.35)),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MatchupsCard extends StatelessWidget {
  const _MatchupsCard({
    required this.troop,
    required this.profile,
    required this.strings,
    required this.locale,
  });

  final Map<String, dynamic> troop;
  final Map<String, dynamic> profile;
  final AppStrings strings;
  final String locale;

  List<String> _localizedList(String key, String i18nKey) {
    final i18n = troop['i18n'];
    if (i18n is Map<Object?, Object?>) {
      final localized = i18n[locale];
      if (localized is Map<Object?, Object?>) {
        final value = localized[i18nKey];
        if (value is List<Object?>) return value.map((item) => item.toString()).where((item) => item.trim().isNotEmpty).toList(growable: false);
      }
    }
    final value = profile[key];
    if (value is List<Object?>) return value.map((item) => item.toString()).where((item) => item.trim().isNotEmpty).toList(growable: false);
    return const <String>[];
  }

  @override
  Widget build(BuildContext context) {
    final strong = _localizedList('forteContra', 'combateForteContra');
    final weak = _localizedList('fracoContra', 'combateFracoContra');
    final recommended = _localizedString(troop, profile, locale, 'funcaoRecomendada', 'combateFuncaoRecomendada');

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _SectionHeading(icon: Icons.swap_horiz, text: strings.t('troops.matchups')),
            const SizedBox(height: 10),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Expanded(
                  child: _MatchupColumn(
                    icon: Icons.trending_up,
                    title: strings.t('troops.strong_against'),
                    values: strong,
                    empty: strings.t('troops.matchup_unknown'),
                    positive: true,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _MatchupColumn(
                    icon: Icons.warning_amber_rounded,
                    title: strings.t('troops.weak_against'),
                    values: weak,
                    empty: strings.t('troops.matchup_unknown'),
                    positive: false,
                  ),
                ),
              ],
            ),
            if (recommended.isNotEmpty) ...<Widget>[
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: GuiaColors.green.withValues(alpha: .07),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: GuiaColors.green.withValues(alpha: .18)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(strings.t('troops.how_to_use'), style: const TextStyle(fontSize: 11, color: GuiaColors.green, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 4),
                    Text(recommended, style: const TextStyle(fontSize: 12.5, color: GuiaColors.ink2, height: 1.35)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _MatchupColumn extends StatelessWidget {
  const _MatchupColumn({
    required this.icon,
    required this.title,
    required this.values,
    required this.empty,
    required this.positive,
  });

  final IconData icon;
  final String title;
  final List<String> values;
  final String empty;
  final bool positive;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(9),
        decoration: BoxDecoration(
          color: positive ? Colors.green.withValues(alpha: .06) : Colors.orange.withValues(alpha: .07),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: positive ? Colors.green.withValues(alpha: .2) : Colors.orange.withValues(alpha: .22)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Icon(icon, size: 15, color: positive ? Colors.green.shade800 : Colors.orange.shade900),
                const SizedBox(width: 5),
                Expanded(child: Text(title, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900, color: GuiaColors.ink))),
              ],
            ),
            const SizedBox(height: 6),
            if (values.isEmpty)
              Text(empty, style: const TextStyle(fontSize: 11.5, color: GuiaColors.muted))
            else
              Wrap(
                spacing: 4,
                runSpacing: 4,
                children: values.map((value) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: .45),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: GuiaColors.border.withValues(alpha: .35)),
                  ),
                  child: Text(value, style: const TextStyle(fontSize: 10.5, color: GuiaColors.ink2, fontWeight: FontWeight.w700)),
                )).toList(growable: false),
              ),
          ],
        ),
      );
}

class _AttributesCard extends StatelessWidget {
  const _AttributesCard({
    required this.troop,
    required this.strongest,
    required this.strings,
  });

  final Map<String, dynamic> troop;
  final Set<String> strongest;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    final rows = <({String metric, String field, String key, IconData icon})>[
      (metric: 'life', field: 'vida', key: 'troops.stat.life', icon: Icons.favorite_outline),
      (metric: 'defense', field: 'def', key: 'troops.stat.defense', icon: Icons.shield_outlined),
      (metric: 'melee_attack', field: 'atqPerto', key: 'troops.stat.melee', icon: Icons.sports_martial_arts_outlined),
      (metric: 'ranged_attack', field: 'atqDist', key: 'troops.stat.ranged', icon: Icons.gps_fixed),
      (metric: 'range', field: 'alcance', key: 'troops.stat.range', icon: Icons.straighten),
      (metric: 'speed', field: 'vel', key: 'troops.stat.speed', icon: Icons.air),
      (metric: 'load', field: 'car', key: 'troops.stat.load', icon: Icons.inventory_2_outlined),
      (metric: 'power', field: 'poder', key: 'common.power', icon: Icons.bolt_outlined),
    ];

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _SectionHeading(icon: Icons.analytics_outlined, text: strings.t('troops.attributes')),
            const SizedBox(height: 9),
            ...rows.map((row) {
              final value = troopNumber(troop[row.field]);
              final highlighted = strongest.contains(row.metric);
              return Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 8),
                decoration: BoxDecoration(
                  color: highlighted ? GuiaColors.gold.withValues(alpha: .12) : Colors.white.withValues(alpha: .2),
                  borderRadius: BorderRadius.circular(7),
                  border: Border.all(color: highlighted ? GuiaColors.goldDark.withValues(alpha: .42) : GuiaColors.border.withValues(alpha: .28)),
                ),
                child: Row(
                  children: <Widget>[
                    Icon(row.icon, size: 17, color: highlighted ? GuiaColors.goldDark : GuiaColors.green),
                    const SizedBox(width: 8),
                    Expanded(child: Text(strings.t(row.key), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: GuiaColors.ink2))),
                    if (highlighted)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Text(strings.t('troops.attribute_highlight'), style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: GuiaColors.goldDark)),
                      ),
                    Text(value > 0 ? formatTroopNumber(value) : '—', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: GuiaColors.ink)),
                  ],
                ),
              );
            }),
            Text(strings.t('troops.attribute_highlight_help'), style: const TextStyle(fontSize: 10.5, color: GuiaColors.muted, height: 1.3)),
          ],
        ),
      ),
    );
  }
}

class _CombatDetailsCard extends StatelessWidget {
  const _CombatDetailsCard({
    required this.troop,
    required this.profile,
    required this.roles,
    required this.strings,
    required this.locale,
  });

  final Map<String, dynamic> troop;
  final Map<String, dynamic> profile;
  final List<String> roles;
  final AppStrings strings;
  final String locale;

  @override
  Widget build(BuildContext context) {
    final officialType = profile['tipoOficial']?.toString() ?? '';
    final tier = profile['tier']?.toString() ?? '';
    final skills = _localizedList(troop, profile, locale, 'habilidadesEspeciais', 'combateHabilidades');
    final target = _localizedString(troop, profile, locale, 'prioridadeAlvo', 'combatePrioridadeAlvo');
    final notes = _localizedString(troop, profile, locale, 'observacoesEstrategicas', 'combateObservacoesEstrategicas');
    final source = _localizedString(troop, profile, locale, 'fonteInformacao', 'combateFonteInformacao');
    final confidence = profile['confianca']?.toString() ?? '';

    return Card(
      margin: EdgeInsets.zero,
      child: ExpansionTile(
        initiallyExpanded: false,
        leading: const Icon(Icons.sports_martial_arts_outlined, color: GuiaColors.green),
        title: Text(strings.t('troops.combat_details'), style: const TextStyle(fontWeight: FontWeight.w900, color: GuiaColors.ink)),
        subtitle: confidence.isEmpty ? null : _ConfidenceText(value: confidence, strings: strings),
        childrenPadding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
        children: <Widget>[
          if (officialType.isNotEmpty || tier.isNotEmpty || roles.isNotEmpty)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 9),
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: GuiaColors.green.withValues(alpha: .06),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: GuiaColors.green.withValues(alpha: .17)),
              ),
              child: Wrap(
                spacing: 14,
                runSpacing: 8,
                children: <Widget>[
                  if (officialType.isNotEmpty) _LabelValue(label: strings.t('troops.official_type'), value: strings.t('troops.official_type.$officialType')),
                  if (tier.isNotEmpty) _LabelValue(label: strings.t('troops.tier'), value: 'T$tier'),
                  if (roles.isNotEmpty) _LabelValue(label: strings.t('troops.tactical_roles'), value: roles.map((role) => strings.t('troops.tactical.$role')).join(' · ')),
                ],
              ),
            ),
          if (skills.isNotEmpty) _CombatBlock(title: strings.t('troops.special_abilities'), values: skills),
          if (target.isNotEmpty) _CombatBlock(title: strings.t('troops.target_priority'), text: target),
          if (notes.isNotEmpty) _CombatBlock(title: strings.t('troops.strategy_notes'), text: notes),
          if (source.isNotEmpty) _CombatBlock(title: strings.t('troops.information_source'), text: source),
          const SizedBox(height: 4),
          Wrap(
            spacing: 10,
            runSpacing: 5,
            children: <Widget>[
              Text('🟢 ${strings.t('troops.confidence.confirmed')}', style: const TextStyle(fontSize: 10.5, color: GuiaColors.muted)),
              Text('🟡 ${strings.t('troops.confidence.experimental')}', style: const TextStyle(fontSize: 10.5, color: GuiaColors.muted)),
              Text('🔴 ${strings.t('troops.confidence.hypothesis')}', style: const TextStyle(fontSize: 10.5, color: GuiaColors.muted)),
            ],
          ),
        ],
      ),
    );
  }
}

class _TrainingCard extends StatelessWidget {
  const _TrainingCard({
    required this.troop,
    required this.quantityController,
    required this.quantity,
    required this.strings,
    required this.onQuantityChanged,
    required this.onPreset,
  });

  final Map<String, dynamic> troop;
  final TextEditingController quantityController;
  final int quantity;
  final AppStrings strings;
  final VoidCallback onQuantityChanged;
  final ValueChanged<int> onPreset;

  @override
  Widget build(BuildContext context) {
    final training = troop['treinamento'] is Map<Object?, Object?> ? Map<String, dynamic>.from(troop['treinamento'] as Map<Object?, Object?>) : null;
    final obtaining = training == null ? null : training['obtencao'];
    final available = training == null ? null : training['disponivel'];
    final costsRaw = training == null ? null : training['custos'];
    final requirementsRaw = training == null ? null : training['requisitos'];
    final populationRaw = training == null ? null : training['populacao'];
    final complete = training == null ? false : training['dadosCompletos'] == true;
    final isEventOnly = troop['tipo']?.toString() == 'especial' || obtaining?.toString() == 'evento' || available == false;
    final costs = costsRaw is List<Object?> ? List<dynamic>.from(costsRaw) : const <dynamic>[];
    final requirements = requirementsRaw is List<Object?> ? List<dynamic>.from(requirementsRaw) : const <dynamic>[];
    final population = troopNumber(populationRaw);
    final hasKnownData = complete && (costs.isNotEmpty || requirements.isNotEmpty || population > 0);

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _SectionHeading(icon: Icons.construction_outlined, text: strings.t('troops.training')),
            const SizedBox(height: 9),
            if (isEventOnly)
              _MessageBox(icon: Icons.event_outlined, text: strings.t('troops.event_only'))
            else if (!hasKnownData)
              _MessageBox(icon: Icons.hourglass_empty, text: strings.t('troops.training_data_pending'))
            else ...<Widget>[
              Row(
                children: <Widget>[
                  Expanded(
                    child: TextField(
                      controller: quantityController,
                      keyboardType: TextInputType.number,
                      onChanged: (_) => onQuantityChanged(),
                      decoration: InputDecoration(
                        labelText: strings.t('troops.quantity_to_train'),
                        prefixIcon: const Icon(Icons.numbers),
                        isDense: true,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 7),
              Wrap(
                spacing: 6,
                children: <Widget>[
                  for (final value in const <int>[1000, 10000, 100000])
                    OutlinedButton(
                      onPressed: () => onPreset(value),
                      style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), minimumSize: Size.zero),
                      child: Text(value == 1000 ? '1k' : value == 10000 ? '10k' : '100k'),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: <Color>[GuiaColors.green.withValues(alpha: .11), GuiaColors.gold.withValues(alpha: .11)]),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: GuiaColors.green.withValues(alpha: .22)),
                ),
                child: Row(
                  children: <Widget>[
                    const Icon(Icons.bolt, color: GuiaColors.goldDark),
                    const SizedBox(width: 8),
                    Expanded(child: Text(strings.t('troops.power_gained'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: GuiaColors.ink2))),
                    Text(formatTroopNumber(quantity * troopNumber(troop['poder'])), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: GuiaColors.greenDark)),
                  ],
                ),
              ),
              if (costs.isNotEmpty) ...<Widget>[
                const SizedBox(height: 11),
                Text(strings.t('troops.training_cost'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: GuiaColors.green)),
                const SizedBox(height: 5),
                ...costs.whereType<Map<Object?, Object?>>().map((raw) {
                  final item = Map<String, dynamic>.from(raw);
                  final perUnit = troopNumber(item['quantidade']);
                  final name = item['nome']?.toString().trim().isNotEmpty == true ? item['nome'].toString() : item['id']?.toString() ?? 'Recurso';
                  return _TrainingRow(
                    name: name,
                    perUnit: perUnit,
                    total: perUnit * quantity,
                  );
                }),
                if (population > 0)
                  _TrainingRow(
                    name: strings.t('troops.idle_population'),
                    perUnit: population,
                    total: population * quantity,
                    icon: Icons.people_outline,
                  ),
              ],
              if (requirements.isNotEmpty) ...<Widget>[
                const SizedBox(height: 11),
                Text(strings.t('troops.requirements'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: GuiaColors.green)),
                const SizedBox(height: 5),
                ...requirements.whereType<Map<Object?, Object?>>().map((raw) {
                  final item = Map<String, dynamic>.from(raw);
                  final type = item['tipo']?.toString();
                  return Container(
                    margin: const EdgeInsets.only(bottom: 5),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: .22),
                      borderRadius: BorderRadius.circular(7),
                      border: Border.all(color: GuiaColors.border.withValues(alpha: .28)),
                    ),
                    child: Row(
                      children: <Widget>[
                        Icon(type == 'pesquisa' ? Icons.science_outlined : Icons.castle_outlined, size: 16, color: GuiaColors.green),
                        const SizedBox(width: 7),
                        Expanded(child: Text(item['nome']?.toString() ?? '—', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: GuiaColors.ink2))),
                        Text('${strings.t('common.level_short')} ${item['nivel'] ?? '—'}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: GuiaColors.ink)),
                      ],
                    ),
                  );
                }),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

class _TrainingRow extends StatelessWidget {
  const _TrainingRow({required this.name, required this.perUnit, required this.total, this.icon = Icons.circle});

  final String name;
  final num perUnit;
  final num total;
  final IconData icon;

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 4),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: .22),
          borderRadius: BorderRadius.circular(7),
          border: Border.all(color: GuiaColors.border.withValues(alpha: .25)),
        ),
        child: Row(
          children: <Widget>[
            Icon(icon, size: icon == Icons.circle ? 7 : 15, color: GuiaColors.goldDark),
            const SizedBox(width: 7),
            Expanded(child: Text(name, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: GuiaColors.ink2))),
            Text(formatTroopNumber(perUnit), style: const TextStyle(fontSize: 10.5, color: GuiaColors.muted)),
            const SizedBox(width: 14),
            SizedBox(width: 82, child: Text(formatTroopNumber(total), textAlign: TextAlign.right, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: GuiaColors.ink))),
          ],
        ),
      );
}

class _UnlockCard extends StatelessWidget {
  const _UnlockCard({required this.troop, required this.strings});

  final Map<String, dynamic> troop;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    if (troop['treinamento'] != null) return const SizedBox.shrink();
    final unlock = troop['desbloqueio'];
    if (unlock is! Map<Object?, Object?>) return const SizedBox.shrink();
    final source = unlock['fonte']?.toString().trim() ?? '';
    final note = unlock['observacao']?.toString().trim() ?? '';
    final level = unlock['nivel'];
    if (source.isEmpty && note.isEmpty) return const SizedBox.shrink();

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _SectionHeading(icon: Icons.lock_open_outlined, text: strings.t('troops.training_requirement')),
            const SizedBox(height: 7),
            Text('$source${level == null ? '' : ' · ${strings.t('common.level_short')} $level'}', style: const TextStyle(fontWeight: FontWeight.w900, color: GuiaColors.ink)),
            if (note.isNotEmpty) ...<Widget>[
              const SizedBox(height: 4),
              Text(note, style: const TextStyle(fontSize: 12, color: GuiaColors.ink2, height: 1.35)),
            ],
          ],
        ),
      ),
    );
  }
}

class _SectionHeading extends StatelessWidget {
  const _SectionHeading({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) => Row(
        children: <Widget>[
          Icon(icon, size: 18, color: GuiaColors.green),
          const SizedBox(width: 7),
          Expanded(child: Text(text.toUpperCase(), style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, letterSpacing: .8, color: GuiaColors.greenDark))),
        ],
      );
}

class _MiniBadge extends StatelessWidget {
  const _MiniBadge({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
        decoration: BoxDecoration(
          color: GuiaColors.gold.withValues(alpha: .17),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: GuiaColors.goldDark.withValues(alpha: .35)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(icon, size: 11, color: GuiaColors.goldDark),
            const SizedBox(width: 3),
            Text(label, style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: GuiaColors.goldDark)),
          ],
        ),
      );
}

class _MessageBox extends StatelessWidget {
  const _MessageBox({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: GuiaColors.green.withValues(alpha: .06),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: GuiaColors.green.withValues(alpha: .18)),
        ),
        child: Row(
          children: <Widget>[
            Icon(icon, size: 18, color: GuiaColors.green),
            const SizedBox(width: 8),
            Expanded(child: Text(text, style: const TextStyle(fontSize: 12, color: GuiaColors.ink2))),
          ],
        ),
      );
}

class _CombatBlock extends StatelessWidget {
  const _CombatBlock({required this.title, this.text, this.values = const <String>[]});

  final String title;
  final String? text;
  final List<String> values;

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(9),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: .2),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: GuiaColors.border.withValues(alpha: .28)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(title, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900, color: GuiaColors.green)),
            const SizedBox(height: 4),
            if (values.isNotEmpty)
              Wrap(
                spacing: 4,
                runSpacing: 4,
                children: values.map((value) => Chip(
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  label: Text(value, style: const TextStyle(fontSize: 10.5)),
                )).toList(growable: false),
              )
            else if (text != null)
              Text(text!, style: const TextStyle(fontSize: 12, color: GuiaColors.ink2, height: 1.35)),
          ],
        ),
      );
}

class _LabelValue extends StatelessWidget {
  const _LabelValue({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(label, style: const TextStyle(fontSize: 9.5, color: GuiaColors.muted, fontWeight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 11.5, color: GuiaColors.ink, fontWeight: FontWeight.w900)),
        ],
      );
}

class _ConfidenceText extends StatelessWidget {
  const _ConfidenceText({required this.value, required this.strings});

  final String value;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    final icon = value == 'confirmado' ? '🟢' : value == 'experimental' ? '🟡' : '🔴';
    final key = value == 'confirmado'
        ? 'troops.confidence.confirmed'
        : value == 'experimental'
            ? 'troops.confidence.experimental'
            : 'troops.confidence.hypothesis';
    return Text('$icon ${strings.t(key)}', style: const TextStyle(fontSize: 10.5, color: GuiaColors.muted));
  }
}

List<String> _localizedList(
  Map<String, dynamic> troop,
  Map<String, dynamic> profile,
  String locale,
  String profileKey,
  String i18nKey,
) {
  final i18n = troop['i18n'];
  if (i18n is Map<Object?, Object?>) {
    final localized = i18n[locale];
    if (localized is Map<Object?, Object?>) {
      final value = localized[i18nKey];
      if (value is List<Object?>) return value.map((item) => item.toString()).where((item) => item.trim().isNotEmpty).toList(growable: false);
    }
  }
  final value = profile[profileKey];
  if (value is List<Object?>) return value.map((item) => item.toString()).where((item) => item.trim().isNotEmpty).toList(growable: false);
  return const <String>[];
}

String _localizedString(
  Map<String, dynamic> troop,
  Map<String, dynamic> profile,
  String locale,
  String profileKey,
  String i18nKey,
) {
  final i18n = troop['i18n'];
  if (i18n is Map<Object?, Object?>) {
    final localized = i18n[locale];
    if (localized is Map<Object?, Object?>) {
      final value = localized[i18nKey]?.toString().trim();
      if (value != null && value.isNotEmpty) return value;
    }
  }
  return profile[profileKey]?.toString().trim() ?? '';
}
