import 'package:flutter/material.dart';

import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/profile_store.dart';
import '../../../core/theme/guia_theme.dart';
import '../../catalog/presentation/game_data_controller.dart';
import '../domain/troop_catalog.dart';
import 'troop_compare_page.dart';
import 'troop_detail_page.dart';
import 'troop_widgets.dart';

class TroopsPage extends StatefulWidget {
  const TroopsPage({
    super.key,
    required this.controller,
    required this.profileStore,
    this.startCompareMode = false,
  });

  final GameDataController controller;
  final ProfileStore profileStore;
  final bool startCompareMode;

  @override
  State<TroopsPage> createState() => _TroopsPageState();
}

class _TroopsPageState extends State<TroopsPage> {
  String _query = '';
  String _filter = 'all';
  String _sort = 'name';
  bool _compareMode = false;
  final List<Map<String, dynamic>> _compare = <Map<String, dynamic>>[];

  @override
  void initState() {
    super.initState();
    _compareMode = widget.startCompareMode;
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);

    return Scaffold(
      appBar: AppBar(
        title: Text(strings.t('troops.encyclopedia')),
        actions: <Widget>[
          IconButton(
            onPressed: widget.controller.loading ? null : widget.controller.refresh,
            tooltip: strings.t('home.sync'),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: AnimatedBuilder(
          animation: widget.controller,
          builder: (context, _) {
            final all = widget.controller.section('tropas');
            final analysis = analyzeTroops(all);
            final counts = <String, int>{
              for (final id in troopFilterIds) id: all.where((troop) => matchesTroopFilter(troop, id, analysis)).length,
            };
            final normalized = _query.trim().toLowerCase();
            final filtered = all.where((troop) {
              if (!matchesTroopFilter(troop, _filter, analysis)) return false;
              if (normalized.isEmpty) return true;
              final aliases = troop['aliases'] is List<Object?> ? (troop['aliases'] as List<Object?>).join(' ') : '';
              final haystack = <String>[
                troopName(troop, widget.profileStore.locale),
                troop['nome']?.toString() ?? '',
                aliases,
                troopDescription(troop, widget.profileStore.locale),
              ].join(' ').toLowerCase();
              return haystack.contains(normalized);
            });
            final shown = sortTroops(filtered, _sort, analysis, widget.profileStore.locale);

            return Column(
              children: <Widget>[
                Expanded(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 760),
                      child: CustomScrollView(
                        slivers: <Widget>[
                          SliverToBoxAdapter(
                            child: Padding(
                              padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
                              child: Column(
                                children: <Widget>[
                                  _IntroCard(strings: strings, total: all.length),
                                  const SizedBox(height: 10),
                                  TextField(
                                    onChanged: (value) => setState(() => _query = value),
                                    decoration: InputDecoration(
                                      prefixIcon: const Icon(Icons.search),
                                      hintText: strings.t('troops.search'),
                                      suffixText: '${shown.length}',
                                    ),
                                  ),
                                  const SizedBox(height: 9),
                                  SizedBox(
                                    height: 39,
                                    child: ListView.separated(
                                      scrollDirection: Axis.horizontal,
                                      itemCount: troopFilterIds.length,
                                      separatorBuilder: (_, __) => const SizedBox(width: 6),
                                      itemBuilder: (context, index) {
                                        final id = troopFilterIds[index];
                                        final selected = _filter == id;
                                        return FilterChip(
                                          selected: selected,
                                          showCheckmark: false,
                                          label: Text('${strings.t('troops.filter.$id')} ${counts[id] ?? 0}'),
                                          labelStyle: TextStyle(
                                            fontSize: 10.5,
                                            fontWeight: FontWeight.w800,
                                            color: selected ? Colors.white : GuiaColors.ink2,
                                          ),
                                          selectedColor: GuiaColors.green,
                                          backgroundColor: GuiaColors.parchmentLight,
                                          side: BorderSide(color: selected ? GuiaColors.greenDark : GuiaColors.border),
                                          onSelected: (_) => setState(() => _filter = id),
                                        );
                                      },
                                    ),
                                  ),
                                  const SizedBox(height: 9),
                                  _Toolbar(
                                    strings: strings,
                                    count: shown.length,
                                    sort: _sort,
                                    compareMode: _compareMode,
                                    compareCount: _compare.length,
                                    onSortChanged: (value) => setState(() => _sort = value),
                                    onToggleCompare: () => setState(() {
                                      _compareMode = !_compareMode;
                                      if (!_compareMode) _compare.clear();
                                    }),
                                  ),
                                  if (widget.controller.fromCache) ...<Widget>[
                                    const SizedBox(height: 7),
                                    _StatusStrip(icon: Icons.offline_bolt_outlined, text: strings.t('catalog.offline')),
                                  ],
                                  if (widget.controller.error != null && all.isNotEmpty) ...<Widget>[
                                    const SizedBox(height: 7),
                                    _StatusStrip(icon: Icons.cloud_off_outlined, text: strings.t('troops.sync_warning')),
                                  ],
                                  const SizedBox(height: 8),
                                ],
                              ),
                            ),
                          ),
                          if (widget.controller.loading && all.isEmpty)
                            const SliverFillRemaining(
                              hasScrollBody: false,
                              child: Center(child: CircularProgressIndicator()),
                            )
                          else if (shown.isEmpty)
                            SliverFillRemaining(
                              hasScrollBody: false,
                              child: Center(child: Text(strings.t('troops.no_results'), style: const TextStyle(color: GuiaColors.muted))),
                            )
                          else
                            SliverPadding(
                              padding: EdgeInsets.fromLTRB(12, 0, 12, _compareMode ? 94 : 24),
                              sliver: SliverList.separated(
                                itemCount: shown.length,
                                separatorBuilder: (_, __) => const SizedBox(height: 8),
                                itemBuilder: (context, index) {
                                  final troop = shown[index];
                                  final selected = _compare.contains(troop);
                                  return _TroopRow(
                                    troop: troop,
                                    analysis: analysis,
                                    store: widget.profileStore,
                                    selected: selected,
                                    compareMode: _compareMode,
                                    strings: strings,
                                    onTap: () {
                                      if (_compareMode) {
                                        _toggleCompare(troop);
                                      } else {
                                        Navigator.of(context).push(MaterialPageRoute<void>(
                                          builder: (_) => TroopDetailPage(
                                            troop: troop,
                                            analysis: analysis,
                                            profileStore: widget.profileStore,
                                          ),
                                        ));
                                      }
                                    },
                                  );
                                },
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
                if (_compareMode)
                  _CompareBar(
                    strings: strings,
                    selected: _compare,
                    onCancel: () => setState(() {
                      _compareMode = false;
                      _compare.clear();
                    }),
                    onCompare: _compare.length == 2
                        ? () => Navigator.of(context).push(MaterialPageRoute<void>(
                              builder: (_) => TroopComparePage(
                                troops: List<Map<String, dynamic>>.from(_compare),
                                analysis: analysis,
                                profileStore: widget.profileStore,
                              ),
                            ))
                        : null,
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  void _toggleCompare(Map<String, dynamic> troop) {
    setState(() {
      if (_compare.contains(troop)) {
        _compare.remove(troop);
        return;
      }
      if (_compare.length >= 2) _compare.removeAt(0);
      _compare.add(troop);
    });
  }
}

class _IntroCard extends StatelessWidget {
  const _IntroCard({required this.strings, required this.total});

  final AppStrings strings;
  final int total;

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: <Color>[GuiaColors.green2, GuiaColors.greenDark],
          ),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: GuiaColors.goldDark),
          boxShadow: <BoxShadow>[BoxShadow(color: Colors.black.withValues(alpha: .12), blurRadius: 6, offset: const Offset(0, 2))],
        ),
        child: Row(
          children: <Widget>[
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: GuiaColors.gold.withValues(alpha: .13),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: GuiaColors.gold.withValues(alpha: .55)),
              ),
              child: const Icon(Icons.shield_outlined, color: GuiaColors.gold),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(strings.t('troops.encyclopedia'), style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 2),
                  Text(strings.t('troops.simple_intro'), style: const TextStyle(color: Color(0xFFE6E4D5), fontSize: 11.5, height: 1.3)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
              decoration: BoxDecoration(color: Colors.black.withValues(alpha: .15), borderRadius: BorderRadius.circular(8)),
              child: Text('$total', style: const TextStyle(color: GuiaColors.gold, fontWeight: FontWeight.w900, fontSize: 16)),
            ),
          ],
        ),
      );
}

class _Toolbar extends StatelessWidget {
  const _Toolbar({
    required this.strings,
    required this.count,
    required this.sort,
    required this.compareMode,
    required this.compareCount,
    required this.onSortChanged,
    required this.onToggleCompare,
  });

  final AppStrings strings;
  final int count;
  final String sort;
  final bool compareMode;
  final int compareCount;
  final ValueChanged<String> onSortChanged;
  final VoidCallback onToggleCompare;

  @override
  Widget build(BuildContext context) => Row(
        children: <Widget>[
          Expanded(
            child: Text(
              strings.t('troops.count').replaceAll('{count}', '$count'),
              style: const TextStyle(fontSize: 11.5, color: GuiaColors.ink2, fontWeight: FontWeight.w800),
            ),
          ),
          PopupMenuButton<String>(
            initialValue: sort,
            onSelected: onSortChanged,
            tooltip: strings.t('troops.sort.label'),
            itemBuilder: (_) => troopSortIds.map((id) => PopupMenuItem<String>(
              value: id,
              child: Text(strings.t('troops.sort.$id')),
            )).toList(growable: false),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
              decoration: BoxDecoration(
                color: GuiaColors.parchmentLight,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: GuiaColors.border),
              ),
              child: Row(
                children: <Widget>[
                  const Icon(Icons.swap_vert, size: 17, color: GuiaColors.green),
                  const SizedBox(width: 4),
                  Text(strings.t('troops.sort.$sort'), style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: GuiaColors.ink2)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 6),
          IconButton.filledTonal(
            onPressed: onToggleCompare,
            tooltip: strings.t('troops.compare'),
            style: IconButton.styleFrom(
              backgroundColor: compareMode ? GuiaColors.green : GuiaColors.green.withValues(alpha: .1),
              foregroundColor: compareMode ? Colors.white : GuiaColors.green,
            ),
            icon: compareMode
                ? Badge(label: Text('$compareCount'), child: const Icon(Icons.compare_arrows, size: 19))
                : const Icon(Icons.compare_arrows, size: 19),
          ),
        ],
      );
}

class _TroopRow extends StatelessWidget {
  const _TroopRow({
    required this.troop,
    required this.analysis,
    required this.store,
    required this.selected,
    required this.compareMode,
    required this.strings,
    required this.onTap,
  });

  final Map<String, dynamic> troop;
  final TroopCatalogAnalysis analysis;
  final ProfileStore store;
  final bool selected;
  final bool compareMode;
  final AppStrings strings;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final roles = tacticalRolesForFilter(troop, analysis);
    final strongest = strongestAttributeIds(troop, analysis).toSet();
    final description = troopDescription(troop, store.locale);
    final combat = combatClass(troop);
    final attackLabel = combat == 'ranged'
        ? strings.t('troops.attack.ranged')
        : combat == 'melee'
            ? strings.t('troops.attack.melee')
            : strings.t('troops.attack.support');
    final stats = <({String metric, IconData icon, num value})>[
      (metric: 'life', icon: Icons.favorite_outline, value: troopNumber(troop['vida'])),
      (metric: 'defense', icon: Icons.shield_outlined, value: troopNumber(troop['def'])),
      (metric: 'melee_attack', icon: Icons.sports_martial_arts_outlined, value: troopNumber(troop['atqPerto'])),
      (metric: 'ranged_attack', icon: Icons.gps_fixed, value: troopNumber(troop['atqDist'])),
      (metric: 'speed', icon: Icons.air, value: troopNumber(troop['vel'])),
      (metric: 'load', icon: Icons.inventory_2_outlined, value: troopNumber(troop['car'])),
    ].where((entry) => entry.value > 0).toList(growable: false);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Ink(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: selected
                  ? <Color>[const Color(0xFFF3E2AE), const Color(0xFFE4C97D)]
                  : const <Color>[GuiaColors.parchmentLight, GuiaColors.parchmentDark],
            ),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: selected ? GuiaColors.green : GuiaColors.border, width: selected ? 1.5 : 1),
            boxShadow: <BoxShadow>[BoxShadow(color: Colors.black.withValues(alpha: .06), blurRadius: 4, offset: const Offset(0, 2))],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              TroopPortrait(troop: troop, size: 72, radius: 9),
              const SizedBox(width: 9),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            troopName(troop, store.locale),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: GuiaColors.ink),
                          ),
                        ),
                        if (troop['tipo']?.toString() == 'especial')
                          const Padding(
                            padding: EdgeInsets.only(left: 4),
                            child: Icon(Icons.auto_awesome, size: 14, color: GuiaColors.goldDark),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(attackLabel, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: GuiaColors.muted)),
                    if (roles.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 5),
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: roles.map((role) => TroopRoleBadge(role: role, label: strings.t('troops.tactical.$role'))).toList(growable: false),
                      ),
                    ],
                    if (stats.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: stats.map((stat) => TroopStatPill(
                          icon: stat.icon,
                          value: stat.value,
                          highlighted: strongest.contains(stat.metric),
                        )).toList(growable: false),
                      ),
                    ],
                    if (description.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 6),
                      Text(description, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 10.5, color: GuiaColors.ink2, height: 1.28)),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 6),
              SizedBox(
                width: 45,
                child: Column(
                  children: <Widget>[
                    Text(strings.t('common.power').toUpperCase(), style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: GuiaColors.muted)),
                    const SizedBox(height: 2),
                    Text(formatTroopNumber(troopNumber(troop['poder'])), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: GuiaColors.greenDark)),
                    const SizedBox(height: 10),
                    if (compareMode)
                      Container(
                        width: 26,
                        height: 26,
                        decoration: BoxDecoration(
                          color: selected ? GuiaColors.green : Colors.transparent,
                          borderRadius: BorderRadius.circular(7),
                          border: Border.all(color: selected ? GuiaColors.greenDark : GuiaColors.border),
                        ),
                        child: Icon(selected ? Icons.check : Icons.add, size: 17, color: selected ? Colors.white : GuiaColors.green),
                      )
                    else
                      const Icon(Icons.chevron_right, color: GuiaColors.muted),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CompareBar extends StatelessWidget {
  const _CompareBar({required this.strings, required this.selected, required this.onCancel, required this.onCompare});

  final AppStrings strings;
  final List<Map<String, dynamic>> selected;
  final VoidCallback onCancel;
  final VoidCallback? onCompare;

  @override
  Widget build(BuildContext context) => SafeArea(
        top: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
          decoration: const BoxDecoration(
            color: GuiaColors.greenDark,
            border: Border(top: BorderSide(color: GuiaColors.goldDark)),
          ),
          child: Row(
            children: <Widget>[
              IconButton(onPressed: onCancel, icon: const Icon(Icons.close), color: Colors.white, tooltip: strings.t('common.cancel')),
              Expanded(
                child: Text(
                  selected.length < 2 ? strings.t('troops.compare_select_two') : strings.t('troops.compare_ready'),
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w800),
                ),
              ),
              FilledButton.icon(
                onPressed: onCompare,
                style: FilledButton.styleFrom(backgroundColor: GuiaColors.goldDark, foregroundColor: Colors.white),
                icon: const Icon(Icons.compare_arrows, size: 17),
                label: Text(strings.t('troops.compare')),
              ),
            ],
          ),
        ),
      );
}

class _StatusStrip extends StatelessWidget {
  const _StatusStrip({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 7),
        decoration: BoxDecoration(
          color: Colors.orange.withValues(alpha: .07),
          borderRadius: BorderRadius.circular(7),
          border: Border.all(color: Colors.orange.withValues(alpha: .2)),
        ),
        child: Row(
          children: <Widget>[
            Icon(icon, size: 15, color: Colors.orange.shade900),
            const SizedBox(width: 6),
            Expanded(child: Text(text, style: const TextStyle(fontSize: 10.5, color: GuiaColors.ink2))),
          ],
        ),
      );
}
