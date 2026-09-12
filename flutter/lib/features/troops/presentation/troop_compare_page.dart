import 'package:flutter/material.dart';

import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/profile_store.dart';
import '../../../core/theme/guia_theme.dart';
import '../domain/troop_catalog.dart';
import 'troop_detail_page.dart';
import 'troop_widgets.dart';

class TroopComparePage extends StatelessWidget {
  const TroopComparePage({
    super.key,
    required this.troops,
    required this.analysis,
    required this.profileStore,
  }) : assert(troops.length == 2);

  final List<Map<String, dynamic>> troops;
  final TroopCatalogAnalysis analysis;
  final ProfileStore profileStore;

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(profileStore.locale);
    final left = troops[0];
    final right = troops[1];
    final stats = <({String metric, String field, String key, IconData icon})>[
      (metric: 'life', field: 'vida', key: 'troops.stat.life', icon: Icons.favorite_outline),
      (metric: 'defense', field: 'def', key: 'troops.stat.defense', icon: Icons.shield_outlined),
      (metric: 'melee_attack', field: 'atqPerto', key: 'troops.stat.melee', icon: Icons.sports_martial_arts_outlined),
      (metric: 'ranged_attack', field: 'atqDist', key: 'troops.stat.ranged', icon: Icons.gps_fixed),
      (metric: 'range', field: 'alcance', key: 'troops.stat.range', icon: Icons.straighten),
      (metric: 'speed', field: 'vel', key: 'troops.stat.speed', icon: Icons.air),
      (metric: 'load', field: 'car', key: 'troops.stat.load', icon: Icons.inventory_2_outlined),
      (metric: 'power', field: 'poder', key: 'common.power', icon: Icons.bolt_outlined),
    ];

    return Scaffold(
      appBar: AppBar(title: Text(strings.t('troops.compare'))),
      body: SafeArea(
        top: false,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 860),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 28),
              children: <Widget>[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Expanded(child: _CompareHeader(troop: left, analysis: analysis, store: profileStore)),
                    const SizedBox(width: 8),
                    Expanded(child: _CompareHeader(troop: right, analysis: analysis, store: profileStore)),
                  ],
                ),
                const SizedBox(height: 10),
                Card(
                  margin: EdgeInsets.zero,
                  child: Padding(
                    padding: const EdgeInsets.all(10),
                    child: Column(
                      children: stats.map((stat) {
                        final leftValue = troopNumber(left[stat.field]);
                        final rightValue = troopNumber(right[stat.field]);
                        final leftWins = leftValue > rightValue;
                        final rightWins = rightValue > leftValue;
                        return _CompareStatRow(
                          icon: stat.icon,
                          label: strings.t(stat.key),
                          leftValue: leftValue,
                          rightValue: rightValue,
                          leftWins: leftWins,
                          rightWins: rightWins,
                        );
                      }).toList(growable: false),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: GuiaColors.green.withValues(alpha: .06),
                    borderRadius: BorderRadius.circular(9),
                    border: Border.all(color: GuiaColors.green.withValues(alpha: .18)),
                  ),
                  child: Text(
                    strings.t('troops.compare_note'),
                    style: const TextStyle(fontSize: 11, color: GuiaColors.ink2, height: 1.35),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _CompareHeader extends StatelessWidget {
  const _CompareHeader({required this.troop, required this.analysis, required this.store});

  final Map<String, dynamic> troop;
  final TroopCatalogAnalysis analysis;
  final ProfileStore store;

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(store.locale);
    final roles = tacticalRolesForFilter(troop, analysis);
    return InkWell(
      onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(
        builder: (_) => TroopDetailPage(troop: troop, analysis: analysis, profileStore: store),
      )),
      borderRadius: BorderRadius.circular(10),
      child: Ink(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: <Color>[GuiaColors.parchmentLight, GuiaColors.parchmentDark],
          ),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: GuiaColors.border),
        ),
        child: Column(
          children: <Widget>[
            TroopPortrait(troop: troop, size: 88, radius: 11),
            const SizedBox(height: 8),
            Text(
              troopName(troop, store.locale),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: GuiaColors.ink),
            ),
            const SizedBox(height: 6),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 4,
              runSpacing: 4,
              children: roles.take(2).map((role) => TroopRoleBadge(role: role, label: strings.t('troops.tactical.$role'))).toList(growable: false),
            ),
          ],
        ),
      ),
    );
  }
}

class _CompareStatRow extends StatelessWidget {
  const _CompareStatRow({
    required this.icon,
    required this.label,
    required this.leftValue,
    required this.rightValue,
    required this.leftWins,
    required this.rightWins,
  });

  final IconData icon;
  final String label;
  final num leftValue;
  final num rightValue;
  final bool leftWins;
  final bool rightWins;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 9),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0x337F6A3B)))),
        child: Row(
          children: <Widget>[
            Expanded(
              child: _Value(value: leftValue, winner: leftWins, textAlign: TextAlign.left),
            ),
            SizedBox(
              width: 118,
              child: Column(
                children: <Widget>[
                  Icon(icon, size: 15, color: GuiaColors.green),
                  const SizedBox(height: 2),
                  Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: GuiaColors.muted)),
                ],
              ),
            ),
            Expanded(
              child: _Value(value: rightValue, winner: rightWins, textAlign: TextAlign.right),
            ),
          ],
        ),
      );
}

class _Value extends StatelessWidget {
  const _Value({required this.value, required this.winner, required this.textAlign});

  final num value;
  final bool winner;
  final TextAlign textAlign;

  @override
  Widget build(BuildContext context) => Text(
        value > 0 ? formatTroopNumber(value) : '—',
        textAlign: textAlign,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w900,
          color: winner ? GuiaColors.greenDark : GuiaColors.ink2,
          backgroundColor: winner ? GuiaColors.gold.withValues(alpha: .18) : null,
        ),
      );
}
