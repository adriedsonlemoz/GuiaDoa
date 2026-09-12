import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/profile_store.dart';
import '../../../core/theme/guia_theme.dart';
import '../../catalog/presentation/catalog_list_page.dart';
import '../../catalog/presentation/game_data_controller.dart';
import '../../profile/presentation/profile_page.dart';
import '../../troops/presentation/troops_page.dart';
import 'home_tools.dart';

class HomePage extends StatelessWidget {
  const HomePage({
    super.key,
    required this.gameData,
    required this.profileStore,
  });

  final GameDataController gameData;
  final ProfileStore profileStore;

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(profileStore.locale);
    final profile = profileStore.profile!;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: <Widget>[
            const _TopBar(),
            Expanded(
              child: RefreshIndicator(
                onRefresh: gameData.refresh,
                child: CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: <Widget>[
                    SliverToBoxAdapter(
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 760),
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
                            child: Column(
                              children: <Widget>[
                                _ProfileCard(
                                  name: profile.name,
                                  realm: profile.realm,
                                  timezone: profile.timezone,
                                  onLanguage: () => profileStore.setLocale(
                                    profileStore.locale == 'pt-BR' ? 'en-US' : 'pt-BR',
                                  ),
                                  onEdit: () => Navigator.of(context).push(
                                    MaterialPageRoute<void>(
                                      builder: (_) => ProfilePage(store: profileStore, gameData: gameData),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                AnimatedBuilder(
                                  animation: gameData,
                                  builder: (context, _) => Column(
                                    children: <Widget>[
                                      _SyncStrip(gameData: gameData, strings: strings),
                                      const SizedBox(height: 10),
                                      _ActiveEventHighlight(
                                        events: gameData.section('eventos'),
                                        realmName: profile.realm,
                                        strings: strings,
                                        onOpen: () => _openCatalog(context, 'eventos', strings.t('tool.eventos')),
                                      ),
                                    ],
                                  ),
                                ),
                                _SectionTitle(text: strings.t('home.arsenal')),
                                const SizedBox(height: 8),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      sliver: SliverLayoutBuilder(
                        builder: (context, constraints) {
                          final width = constraints.crossAxisExtent;
                          final columns = width >= 720 ? 4 : width >= 480 ? 3 : 2;
                          return SliverGrid(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) => _ToolCard(
                                tool: homeTools[index],
                                strings: strings,
                                onTap: () => _openTool(context, homeTools[index], strings),
                              ),
                              childCount: homeTools.length,
                            ),
                            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: columns,
                              childAspectRatio: width >= 480 ? 1.42 : 1.28,
                              mainAxisSpacing: 9,
                              crossAxisSpacing: 9,
                            ),
                          );
                        },
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 760),
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(12, 14, 12, 0),
                            child: Column(
                              children: <Widget>[
                                _SectionTitle(text: strings.t('home.advisor')),
                                const SizedBox(height: 8),
                                _AdvisorCard(
                                  subtitle: strings.t('home.advisor_sub'),
                                  onTap: () => _showMigrating(context, strings),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.fromLTRB(12, 18, 12, 24),
                        child: Center(child: _FlutterIdentityFooter()),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openTool(BuildContext context, HomeTool tool, AppStrings strings) {
    if (tool.keyName == 'tropas') {
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => TroopsPage(controller: gameData, profileStore: profileStore),
        ),
      );
      return;
    }
    if (tool.catalogKey == null) {
      _showMigrating(context, strings);
      return;
    }
    _openCatalog(context, tool.catalogKey!, strings.t(tool.labelKey));
  }

  void _openCatalog(BuildContext context, String section, String title) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => CatalogListPage(
          sectionKey: section,
          title: title,
          controller: gameData,
          profileStore: profileStore,
        ),
      ),
    );
  }

  void _showMigrating(BuildContext context, AppStrings strings) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(strings.t('home.migrating'))));
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar();

  @override
  Widget build(BuildContext context) => Container(
        constraints: const BoxConstraints(minHeight: 64),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: const BoxDecoration(
          gradient: LinearGradient(colors: <Color>[GuiaColors.green2, GuiaColors.greenDark]),
          border: Border(bottom: BorderSide(color: GuiaColors.goldDark)),
        ),
        child: Row(
          children: <Widget>[
            ClipRRect(
              borderRadius: BorderRadius.circular(9),
              child: Image.asset('assets/img/app-icon.png', width: 44, height: 44),
            ),
            const SizedBox(width: 10),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  Text('GUIA DOA', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: .6)),
                  Text('Dragons of Atlantis', style: TextStyle(color: GuiaColors.gold, fontWeight: FontWeight.w600, fontSize: 11)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
              decoration: BoxDecoration(
                color: GuiaColors.gold,
                borderRadius: BorderRadius.circular(7),
                border: Border.all(color: const Color(0xFFFFE7A4)),
              ),
              child: const Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text('FLUTTER', style: TextStyle(color: GuiaColors.greenDark, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: .8)),
                  Text('α4', style: TextStyle(color: GuiaColors.greenDark, fontSize: 9, fontWeight: FontWeight.w800)),
                ],
              ),
            ),
          ],
        ),
      );
}

class _ProfileCard extends StatefulWidget {
  const _ProfileCard({
    required this.name,
    required this.realm,
    required this.timezone,
    required this.onLanguage,
    required this.onEdit,
  });

  final String name;
  final String realm;
  final String timezone;
  final VoidCallback onLanguage;
  final VoidCallback onEdit;

  @override
  State<_ProfileCard> createState() => _ProfileCardState();
}

class _ProfileCardState extends State<_ProfileCard> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final realmTime = _realmTime(widget.timezone);
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: <Widget>[
            const CircleAvatar(
              radius: 23,
              backgroundColor: GuiaColors.green,
              foregroundColor: GuiaColors.gold,
              child: Text('🎖️', style: TextStyle(fontSize: 20)),
            ),
            const SizedBox(width: 11),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(widget.name, style: const TextStyle(fontWeight: FontWeight.w900, color: GuiaColors.ink, fontSize: 17)),
                  const SizedBox(height: 3),
                  Text('${widget.realm} · ${_two(realmTime.hour)}:${_two(realmTime.minute)} · ${widget.timezone}',
                      style: const TextStyle(color: GuiaColors.ink2, fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            IconButton(onPressed: widget.onLanguage, tooltip: 'Idioma / Language', icon: const Icon(Icons.translate), color: GuiaColors.green),
            IconButton(onPressed: widget.onEdit, tooltip: 'Editar perfil', icon: const Icon(Icons.edit_outlined), color: GuiaColors.green),
          ],
        ),
      ),
    );
  }

  static DateTime _realmTime(String timezone) {
    final utc = DateTime.now().toUtc();
    final match = RegExp(r'UTC\s*([+-])\s*(\d{1,2})(?::(\d{2}))?', caseSensitive: false).firstMatch(timezone);
    if (match == null) return utc;
    final sign = match.group(1) == '-' ? -1 : 1;
    final hours = int.tryParse(match.group(2) ?? '') ?? 0;
    final minutes = int.tryParse(match.group(3) ?? '') ?? 0;
    return utc.add(Duration(minutes: sign * (hours * 60 + minutes)));
  }

  static String _two(int value) => value.toString().padLeft(2, '0');
}

class _SyncStrip extends StatelessWidget {
  const _SyncStrip({required this.gameData, required this.strings});

  final GameDataController gameData;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    final failed = gameData.error != null;
    final label = gameData.loading
        ? 'Sincronizando…'
        : failed
            ? (gameData.hasData ? strings.t('catalog.offline') : 'Sem conexão com a API')
            : gameData.fromCache
                ? strings.t('catalog.offline')
                : strings.t('catalog.online');
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: (failed ? Colors.orange : GuiaColors.green).withValues(alpha: .08),
        border: Border.all(color: (failed ? Colors.orange : GuiaColors.green).withValues(alpha: .20)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: <Widget>[
          Icon(failed ? Icons.cloud_off_outlined : Icons.cloud_done_outlined, size: 16, color: failed ? Colors.orange.shade800 : GuiaColors.green),
          const SizedBox(width: 7),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 11.5, color: GuiaColors.ink2, fontWeight: FontWeight.w700))),
          if (!gameData.loading)
            InkWell(
              onTap: gameData.refresh,
              child: const Padding(
                padding: EdgeInsets.all(3),
                child: Icon(Icons.refresh, size: 17, color: GuiaColors.green),
              ),
            ),
        ],
      ),
    );
  }
}

class _ActiveEventHighlight extends StatefulWidget {
  const _ActiveEventHighlight({
    required this.events,
    required this.realmName,
    required this.strings,
    required this.onOpen,
  });

  final List<Map<String, dynamic>> events;
  final String realmName;
  final AppStrings strings;
  final VoidCallback onOpen;

  @override
  State<_ActiveEventHighlight> createState() => _ActiveEventHighlightState();
}

class _ActiveEventHighlightState extends State<_ActiveEventHighlight> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(minutes: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final active = _activeForRealm(widget.events, widget.realmName);
    if (active == null) return const SizedBox.shrink();
    final event = active.$1;
    final occurrence = active.$2;
    final end = DateTime.tryParse((occurrence['fimServidor'] ?? '').toString())?.toUtc();
    final remaining = end?.difference(DateTime.now().toUtc());
    final name = (event['nome'] ?? event['titulo'] ?? event['slug'] ?? 'Evento').toString();
    final time = remaining == null || remaining.isNegative ? '' : _remaining(remaining);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              const Text('⚡', style: TextStyle(fontSize: 15)),
              const SizedBox(width: 6),
              Expanded(child: Text(widget.strings.t('home.active_event'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: GuiaColors.ink2, letterSpacing: .45))),
              TextButton(onPressed: widget.onOpen, child: Text(widget.strings.t('home.view_all'))),
            ],
          ),
          InkWell(
            onTap: widget.onOpen,
            borderRadius: BorderRadius.circular(10),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(11),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: <Color>[GuiaColors.green.withValues(alpha: .16), GuiaColors.parchmentLight]),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: GuiaColors.goldDark),
              ),
              child: Row(
                children: <Widget>[
                  const CircleAvatar(backgroundColor: GuiaColors.green, foregroundColor: GuiaColors.gold, child: Icon(Icons.bolt)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(widget.realmName, style: const TextStyle(color: GuiaColors.muted, fontSize: 10, fontWeight: FontWeight.w700)),
                        Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: GuiaColors.ink, fontWeight: FontWeight.w900, fontSize: 14)),
                        if (time.isNotEmpty) Text('⏳ $time', style: const TextStyle(color: GuiaColors.ink2, fontSize: 11)),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: GuiaColors.green),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  static (Map<String, dynamic>, Map<String, dynamic>)? _activeForRealm(List<Map<String, dynamic>> events, String realm) {
    final wanted = realm.trim().toLowerCase();
    final now = DateTime.now().toUtc();
    for (final event in events) {
      final occurrences = event['ocorrencias'];
      if (occurrences is! List<Object?>) continue;
      for (final raw in occurrences) {
        if (raw is! Map<Object?, Object?>) continue;
        final occurrence = Map<String, dynamic>.from(raw);
        if (occurrence['confirmado'] == false) continue;
        if ((occurrence['reinoNome'] ?? '').toString().trim().toLowerCase() != wanted) continue;
        final start = DateTime.tryParse((occurrence['inicioServidor'] ?? '').toString())?.toUtc();
        final end = DateTime.tryParse((occurrence['fimServidor'] ?? '').toString())?.toUtc();
        if (start != null && end != null && !now.isBefore(start) && now.isBefore(end)) return (event, occurrence);
      }
    }
    return null;
  }

  static String _remaining(Duration value) {
    final days = value.inDays;
    final hours = value.inHours.remainder(24);
    final minutes = value.inMinutes.remainder(60);
    return '${days > 0 ? '${days}d ' : ''}${hours}h ${minutes}m';
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) => Row(
        children: <Widget>[
          const Expanded(child: Divider(color: GuiaColors.border)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 9),
            child: Text(text, style: const TextStyle(color: GuiaColors.ink2, fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: .65)),
          ),
          const Expanded(child: Divider(color: GuiaColors.border)),
        ],
      );
}

class _ToolCard extends StatelessWidget {
  const _ToolCard({required this.tool, required this.strings, required this.onTap});

  final HomeTool tool;
  final AppStrings strings;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Opacity(
        opacity: tool.migrated ? 1 : .76,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(10),
            child: Ink(
              decoration: BoxDecoration(
                gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: <Color>[GuiaColors.parchmentLight, GuiaColors.parchmentDark]),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: tool.migrated ? GuiaColors.border : GuiaColors.border.withValues(alpha: .55)),
                boxShadow: <BoxShadow>[BoxShadow(color: Colors.black.withValues(alpha: .07), blurRadius: 5, offset: const Offset(0, 2))],
              ),
              padding: const EdgeInsets.all(11),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Container(
                        width: 38,
                        height: 38,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(color: GuiaColors.green, borderRadius: BorderRadius.circular(9), border: Border.all(color: GuiaColors.goldDark)),
                        child: Text(tool.emoji, style: const TextStyle(fontSize: 20)),
                      ),
                      const Spacer(),
                      Icon(tool.migrated ? Icons.chevron_right : Icons.schedule, size: 18, color: tool.migrated ? GuiaColors.green : GuiaColors.muted),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(strings.t(tool.labelKey), maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: GuiaColors.ink, fontWeight: FontWeight.w900, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(tool.subtitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: GuiaColors.ink2, fontSize: 10.5)),
                ],
              ),
            ),
          ),
        ),
      );
}

class _AdvisorCard extends StatelessWidget {
  const _AdvisorCard({required this.subtitle, required this.onTap});

  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
        margin: EdgeInsets.zero,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: <Widget>[
                const CircleAvatar(backgroundColor: GuiaColors.green, child: Text('🤖', style: TextStyle(fontSize: 20))),
                const SizedBox(width: 11),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Text('Assistente Tático', style: TextStyle(color: GuiaColors.ink, fontWeight: FontWeight.w900)),
                      const SizedBox(height: 2),
                      Text(subtitle, style: const TextStyle(color: GuiaColors.muted, fontSize: 11)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                  decoration: BoxDecoration(color: GuiaColors.gold.withValues(alpha: .25), borderRadius: BorderRadius.circular(6)),
                  child: const Text('MIGRAÇÃO', style: TextStyle(color: GuiaColors.goldDark, fontWeight: FontWeight.w900, fontSize: 9)),
                ),
              ],
            ),
          ),
        ),
      );
}

class _FlutterIdentityFooter extends StatelessWidget {
  const _FlutterIdentityFooter();

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: GuiaColors.green.withValues(alpha: .08),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: GuiaColors.green.withValues(alpha: .22)),
        ),
        child: const Text(
          'NOVA VERSÃO FLUTTER · ${AppConfig.displayVersion}',
          textAlign: TextAlign.center,
          style: TextStyle(color: GuiaColors.greenDark, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: .55),
        ),
      );
}
