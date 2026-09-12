import 'dart:async';
import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
import '../../../core/widgets/ornament_frame.dart';
import '../../../core/widgets/guia_symbol.dart';
import '../../../core/domain/realm_time.dart';
import '../../../core/domain/active_event.dart';
import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/feature_store.dart';
import '../../../core/storage/profile_store.dart';
import '../../../core/theme/guia_theme.dart';
import '../../catalog/presentation/game_data_controller.dart';
import '../../profile/presentation/profile_page.dart';
import '../../settings/presentation/settings_page.dart';
import '../../modules/presentation/module_pages.dart';
import '../../troops/presentation/troops_page.dart';
import 'home_tools.dart';

class HomePage extends StatefulWidget {
  const HomePage({
    super.key,
    required this.gameData,
    required this.profileStore,
    required this.featureStore,
  });

  final GameDataController gameData;
  final ProfileStore profileStore;
  final FeatureStore featureStore;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final TextEditingController _searchController = TextEditingController();
  String _query = '';
  Timer? _clockTimer;
  @override
  void initState() {
    super.initState();
    _clockTimer = Timer.periodic(const Duration(minutes: 1), (_) { if (mounted) setState(() {}); });
  }

  @override
  void dispose() {
    _clockTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    final profile = widget.profileStore.profile!;

    return Scaffold(
      backgroundColor: GuiaColors.premiumBackground,
      body: SafeArea(
        child: AnimatedBuilder(
          animation: Listenable.merge([widget.gameData, widget.profileStore, widget.featureStore]),
          builder: (context, _) {
            final primaryTools = homeTools
                .where((tool) => primaryHomeToolKeys.contains(tool.keyName))
                .where((tool) {
                  final normalized = _query.trim().toLowerCase();
                  if (normalized.isEmpty) return true;
                  final haystack = '${strings.t(tool.labelKey)} ${strings.t(tool.subtitleKey)}'.toLowerCase();
                  return haystack.contains(normalized);
                })
                .toList(growable: false);

            return RefreshIndicator(
              color: GuiaColors.premiumEmerald,
              onRefresh: widget.gameData.refresh,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.zero,
                children: <Widget>[
                  _HeroHeader(
                    strings: strings,
                    name: profile.name,
                    realm: profile.realm,
                    timezone: profile.timezone,
                    searchController: _searchController,
                    onSearchChanged: (value) => setState(() => _query = value),
                    onSettings: _openSettings,
                    onProfile: _openProfile,
                  ),
                  Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 1050),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(12, 12, 12, 26),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: <Widget>[
                            _SummaryPanel(gameData: widget.gameData, strings: strings, profileStore: widget.profileStore, featureStore: widget.featureStore, onEvents: () => _openTool(_toolByKey('eventos'), strings), onFavorites: () => _push(FavoritesPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore))),
                            const SizedBox(height: 16),
                            _PrimaryToolGrid(
                              tools: primaryTools,
                              strings: strings,
                              onOpen: (tool) => _openTool(tool, strings),
                            ),
                            const SizedBox(height: 18),
                            _SectionHeader(
                              icon: Icons.auto_awesome,
                              title: strings.t('home.quick'),
                              subtitle: strings.t('home.quick.subtitle'),
                            ),
                            const SizedBox(height: 10),
                            _QuickActions(
                              strings: strings,
                              onCompare: () => Navigator.of(context).push(
                                MaterialPageRoute<void>(
                                  builder: (_) => TroopsPage(
                                    controller: widget.gameData,
                                    profileStore: widget.profileStore,
                                    startCompareMode: true,
                                  ),
                                ),
                              ),
                              onCalculator: () => _push(MarchCalculatorPage(controller: widget.gameData, profileStore: widget.profileStore)),
                              onBackup: () => _push(BackupPage(profileStore: widget.profileStore, featureStore: widget.featureStore)),
                            ),
                            const SizedBox(height: 18),
                            _SectionHeader(
                              icon: Icons.campaign_outlined,
                              title: strings.t('home.highlights'),
                            ),
                            const SizedBox(height: 10),
                            _Highlights(
                              strings: strings,
                              onTournament: () => _openTool(_toolByKey('torneios'), strings),
                              onTroops: () => _push(TroopUpgradePage(profileStore: widget.profileStore)),
                            ),
                            const SizedBox(height: 18),
                            _SyncStrip(gameData: widget.gameData, strings: strings),
                            const SizedBox(height: 14),
                            const Text(
                              '${AppConfig.apkFlavor} · ${AppConfig.displayVersion}',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: GuiaColors.premiumMuted,
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                                letterSpacing: .45,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
      bottomNavigationBar: _PremiumBottomBar(
        strings: strings,
        onHome: () {},
        onGuides: () => _push(GuidesPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore)),
        onTracker: () => _push(TrackerHubPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore)),
        onFavorites: () => _push(FavoritesPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore)),
        onMore: () => _push(MorePage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore)),
      ),
    );
  }

  HomeTool _toolByKey(String key) => homeTools.firstWhere((tool) => tool.keyName == key);

  void _push(Widget page) {
    Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => page));
  }

  void _openSettings() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => SettingsPage(profileStore: widget.profileStore, gameData: widget.gameData),
      ),
    );
  }

  void _openProfile() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ProfilePage(store: widget.profileStore, gameData: widget.gameData),
      ),
    );
  }

  void _openTool(HomeTool tool, AppStrings strings) {
    final Widget page = switch (tool.keyName) {
      'torneios' => TournamentsPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      'tropas' => TroopsPage(controller: widget.gameData, profileStore: widget.profileStore),
      'dragoes' => DragonsPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      'edificios' => BuildingsPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      'itens' => ItemsPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      'pesquisas' => ResearchPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      'ilhas' => IslandsPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      'dicas' => GuidesPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      'campanha' => CampaignPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      'niveis' => LevelsPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      'eventos' => EventsPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      'extras' => ExtrasPage(controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
      _ => CatalogModulePage(title: strings.t(tool.labelKey), sectionKey: tool.catalogKey ?? tool.keyName, controller: widget.gameData, profileStore: widget.profileStore, featureStore: widget.featureStore),
    };
    _push(page);
  }
}

class _HeroHeader extends StatelessWidget {
  const _HeroHeader({required this.strings, required this.name, required this.realm, required this.timezone,
    required this.searchController, required this.onSearchChanged, required this.onSettings, required this.onProfile});
  final AppStrings strings;
  final String name, realm, timezone;
  final TextEditingController searchController;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onSettings, onProfile;

  @override
  Widget build(BuildContext context) => Container(
    decoration: const BoxDecoration(
      image: DecorationImage(image: AssetImage('assets/ui/hero.png'), fit: BoxFit.cover, alignment: Alignment.centerRight),
      border: Border(bottom: BorderSide(color: GuiaColors.premiumGold))),
    child: Container(
      decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xDD031713), Color(0x66031713)])),
      child: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 1050),
        child: Padding(padding: const EdgeInsets.fromLTRB(12, 10, 12, 12), child: Column(children: [
          Row(children: [
            Image.asset('assets/ui/crest.png', width: 74, height: 92, fit: BoxFit.contain, excludeFromSemantics: true),
            const SizedBox(width: 8),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Guia Doa', style: TextStyle(fontFamily: 'GuiaSerif', color: GuiaColors.premiumGoldLight,
                fontSize: 29, fontWeight: FontWeight.bold, shadows: [Shadow(color: Colors.black, blurRadius: 4, offset: Offset(1, 2))])),
              Text(strings.t('app.subtitle'), style: const TextStyle(color: GuiaColors.premiumText, fontSize: 12)),
            ])),
            IconButton(onPressed: onSettings, tooltip: strings.t('settings.title'),
              icon: const GuiaSymbol('configuracoes')),
          ]),
          InkWell(onTap: onProfile, child: Padding(padding: const EdgeInsets.symmetric(vertical: 10), child: Wrap(spacing: 6, runSpacing: 5, crossAxisAlignment: WrapCrossAlignment.center, children: [
            const Icon(Icons.person_outline, color: GuiaColors.premiumGoldLight, size: 18), const SizedBox(width: 6),
            Text('$name · $realm', style: const TextStyle(color: GuiaColors.premiumText, fontSize: 12)),
            const SizedBox(width: 6), Text(timezone.isEmpty ? strings.t('realms.not_informed') : '${RealmTime.clock(timezone, DateTime.now())} · $timezone',
              style: const TextStyle(color: GuiaColors.premiumGoldLight, fontSize: 11)),
          ]))),
          TextField(controller: searchController, onChanged: onSearchChanged,
            style: const TextStyle(color: GuiaColors.premiumText, fontSize: 14), cursorColor: GuiaColors.premiumGoldLight,
            decoration: InputDecoration(hintText: strings.t('home.search'), hintStyle: const TextStyle(color: GuiaColors.premiumMuted),
              prefixIcon: const Padding(padding: EdgeInsets.all(12), child: GuiaSymbol('busca')),
              suffixIcon: searchController.text.isEmpty ? null : IconButton(tooltip: strings.t('common.clear'),
                onPressed: () { searchController.clear(); onSearchChanged(''); }, icon: const Icon(Icons.close, color: GuiaColors.premiumMuted)),
              filled: true, fillColor: const Color(0xDD031713), contentPadding: const EdgeInsets.symmetric(vertical: 12),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: GuiaColors.premiumGold, width: 1.5)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: GuiaColors.premiumGoldLight, width: 2)))),
        ]))),
      ),
    ),
  );
}

class _SummaryPanel extends StatelessWidget {
  const _SummaryPanel({required this.gameData, required this.strings, required this.profileStore,
    required this.featureStore, required this.onEvents, required this.onFavorites});
  final GameDataController gameData;
  final AppStrings strings;
  final ProfileStore profileStore;
  final FeatureStore featureStore;
  final VoidCallback onEvents, onFavorites;
  String _updatedText() {
    final value = gameData.lastUpdated?.toLocal();
    if (value == null) return strings.t('home.summary.no_data');
    String pad(int n) => n.toString().padLeft(2, '0');
    return '${pad(value.day)}/${pad(value.month)} ${pad(value.hour)}:${pad(value.minute)}';
  }
  @override Widget build(BuildContext context) {
    final profile = profileStore.profile!;
    final current = ActiveEvent.forRealm(gameData.section('eventos'), realmId: profile.realmId, realmName: profile.realm, now: DateTime.now());
    final available = gameData.sectionAvailable('eventos');
    return OrnamentFrame(parchment: true, child: Padding(padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 3), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Expanded(child: _SummaryItem(icon: Icons.emoji_events_outlined, label: strings.t('home.summary.tournament'),
        value: current?.title(strings.locale) ?? strings.t(available ? 'home.summary.no_event' : 'home.summary.no_data'),
        detail: current == null ? '' : current.remaining(DateTime.now()), onTap: onEvents)),
      const _SummaryDivider(),
      Expanded(child: _SummaryItem(icon: Icons.star_outline, label: strings.t('nav.favorites'), value: '${featureStore.favorites.length}',
        detail: strings.t('home.summary.saved'), onTap: onFavorites)),
      const _SummaryDivider(),
      Expanded(child: _SummaryItem(icon: Icons.calendar_month_outlined, label: strings.t('home.summary.updated'), value: _updatedText(),
        detail: gameData.fromCache ? strings.t('home.summary.cached') : '', onTap: gameData.loading ? null : gameData.refresh)),
    ])));
  }
}
class _SummaryItem extends StatelessWidget {
  const _SummaryItem({required this.icon, required this.label, required this.value, this.detail = '', this.onTap});
  final IconData icon;
  final String label, value, detail;
  final VoidCallback? onTap;
  @override Widget build(BuildContext context) => InkWell(onTap: onTap, child: Padding(padding: const EdgeInsets.symmetric(horizontal: 3), child: Column(children: [
    Container(width: 32, height: 32, decoration: BoxDecoration(color: GuiaColors.premiumBackground2, shape: BoxShape.circle,
      border: Border.all(color: GuiaColors.goldDark)), child: Icon(icon, size: 21, color: GuiaColors.premiumGoldLight)),
    const SizedBox(height: 5), Text(label, textAlign: TextAlign.center, style: const TextStyle(color: GuiaColors.ink2, fontSize: 11)),
    const SizedBox(height: 3), Text(value, textAlign: TextAlign.center, style: const TextStyle(color: GuiaColors.ink, fontSize: 12, fontWeight: FontWeight.bold)),
    if (detail.isNotEmpty) Text(detail, textAlign: TextAlign.center, style: const TextStyle(color: GuiaColors.ink2, fontSize: 12)),
  ])));
}
class _SummaryDivider extends StatelessWidget {
  const _SummaryDivider();
  @override Widget build(BuildContext context) => Container(width: 1, height: 76, color: GuiaColors.goldDark.withValues(alpha: .4));
}
class _PrimaryToolGrid extends StatelessWidget {
  const _PrimaryToolGrid({required this.tools, required this.strings, required this.onOpen});
  final List<HomeTool> tools;
  final AppStrings strings;
  final ValueChanged<HomeTool> onOpen;
  @override Widget build(BuildContext context) {
    if (tools.isEmpty) return Padding(padding: const EdgeInsets.all(18), child: Text(strings.t('catalog.empty'),
      textAlign: TextAlign.center, style: const TextStyle(color: GuiaColors.premiumMuted)));
    return LayoutBuilder(builder: (context, constraints) {
      final scale = MediaQuery.textScalerOf(context).scale(14) / 14;
      final columns = constraints.maxWidth / scale >= 560 ? 4 : 2;
      final width = (constraints.maxWidth - (columns - 1) * 9) / columns;
      return Wrap(spacing: 9, runSpacing: 9, children: tools.map((tool) => SizedBox(width: width,
        child: _ToolCard(tool: tool, strings: strings, onTap: () => onOpen(tool)))).toList());
    });
  }
}
class _ToolCard extends StatelessWidget {
  const _ToolCard({required this.tool, required this.strings, required this.onTap});
  final HomeTool tool;
  final AppStrings strings;
  final VoidCallback onTap;
  @override Widget build(BuildContext context) => OrnamentFrame(onTap: onTap, child: Padding(
    padding: const EdgeInsets.fromLTRB(6, 7, 6, 9), child: Column(children: [
      Image.asset('assets/ui/${tool.keyName}.png', height: 76, fit: BoxFit.contain, excludeFromSemantics: true,
        cacheWidth: 256, filterQuality: FilterQuality.medium),
      const SizedBox(height: 5), Text(strings.t(tool.labelKey), textAlign: TextAlign.center,
        style: const TextStyle(fontFamily: 'GuiaSerif', color: GuiaColors.premiumText, fontSize: 16, fontWeight: FontWeight.bold)),
      const SizedBox(height: 3), Text(strings.t(tool.subtitleKey), textAlign: TextAlign.center,
        style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 12, height: 1.2)),
    ])));
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.icon, required this.title, this.subtitle});

  final IconData icon;
  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) => Row(
        children: <Widget>[
          Icon(icon, color: GuiaColors.premiumGoldLight, size: 22),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.bold, fontSize: 18, fontFamily: 'GuiaSerif'),
            ),
          ),
          if (subtitle != null)
            Flexible(
              child: Text(
                subtitle!,
                textAlign: TextAlign.right,
                style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 12),
              ),
            ),
        ],
      );
}

class _QuickActions extends StatelessWidget {
  const _QuickActions({required this.strings, required this.onCompare, required this.onCalculator, required this.onBackup});
  final AppStrings strings;
  final VoidCallback onCompare, onCalculator, onBackup;
  @override Widget build(BuildContext context) => LayoutBuilder(builder: (context, constraints) {
    final scale = MediaQuery.textScalerOf(context).scale(14) / 14;
    final columns = constraints.maxWidth / scale >= 330 ? 3 : 1;
    final width = (constraints.maxWidth - (columns - 1) * 8) / columns;
    final items = [
      ('comparar', 'home.quick.compare', 'home.quick.compare.sub', onCompare),
      ('calculadora', 'home.quick.calculator', 'home.quick.calculator.sub', onCalculator),
      ('backup', 'home.quick.backup', 'home.quick.backup.sub', onBackup),
    ];
    return Wrap(spacing: 8, runSpacing: 8, children: items.map((item) => SizedBox(width: width, child: OrnamentFrame(onTap: item.$4,
      child: Padding(padding: const EdgeInsets.all(8), child: Column(children: [
        GuiaSymbol(item.$1, size: 30), const SizedBox(height: 7),
        Text(strings.t(item.$2), textAlign: TextAlign.center, style: const TextStyle(color: GuiaColors.premiumText, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4), Text(strings.t(item.$3), textAlign: TextAlign.center, style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 11)),
      ]))))).toList());
  });
}

class _Highlights extends StatelessWidget {
  const _Highlights({required this.strings, required this.onTournament, required this.onTroops});

  final AppStrings strings;
  final VoidCallback onTournament;
  final VoidCallback onTroops;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
        builder: (context, constraints) {
          final first = _HighlightCard(
            icon: Icons.emoji_events_outlined,
            badge: strings.t('home.badge.guide'),
            title: strings.t('home.highlight.power'),
            subtitle: strings.t('home.highlight.power.sub'),
            onTap: onTournament,
          );
          final second = _HighlightCard(
            icon: Icons.military_tech_outlined,
            badge: strings.t('home.badge.guide'),
            title: strings.t('home.highlight.troops'),
            subtitle: strings.t('home.highlight.troops.sub'),
            onTap: onTroops,
          );
          if (constraints.maxWidth / (MediaQuery.textScalerOf(context).scale(14) / 14) >= 420) {
            return Row(children: <Widget>[Expanded(child: first), const SizedBox(width: 10), Expanded(child: second)]);
          }
          return Column(children: <Widget>[first, const SizedBox(height: 10), second]);
        },
      );
}

class _HighlightCard extends StatelessWidget {
  const _HighlightCard({required this.icon, required this.badge, required this.title, required this.subtitle, required this.onTap});

  final IconData icon;
  final String badge;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(15),
          child: Ink(

            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: <Color>[Color(0xFF105C47), GuiaColors.premiumPanel, Color(0xFF031C18)],
              ),
              borderRadius: BorderRadius.circular(15),
              border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .82)),
            ),
            child: Stack(
              children: <Widget>[
                Positioned(
                  right: 12,
                  top: 18,
                  child: Image.asset(icon == Icons.emoji_events_outlined ? 'assets/ui/torneios.png' : 'assets/ui/tropas.png', width: 86, height: 86, fit: BoxFit.contain, excludeFromSemantics: true),
                ),
                Padding(
                  padding: const EdgeInsets.all(13),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: GuiaColors.premiumEmerald.withValues(alpha: .78),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .75)),
                        ),
                        child: Text(badge, style: const TextStyle(color: GuiaColors.premiumGoldLight, fontSize: 9, fontWeight: FontWeight.w900)),
                      ),
                      const SizedBox(height: 30),
                      Text(title, style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 16)),
                      const SizedBox(height: 3),
                      Row(
                        children: <Widget>[
                          Expanded(child: Text(subtitle, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: GuiaColors.premiumText, fontSize: 12, height: 1.25))),
                          const GuiaSymbol('avancar', size: 18),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
}

class _SyncStrip extends StatelessWidget {
  const _SyncStrip({required this.gameData, required this.strings});

  final GameDataController gameData;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    final text = gameData.loading
        ? strings.t('home.sync.loading')
        : gameData.error != null
            ? strings.t('catalog.offline')
            : gameData.fromCache
                ? strings.t('catalog.offline')
                : strings.t('catalog.online');
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 9),
      decoration: BoxDecoration(
        color: GuiaColors.premiumPanel.withValues(alpha: .72),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .38)),
      ),
      child: Row(
        children: <Widget>[
          if (gameData.loading)
            const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: GuiaColors.premiumGoldLight))
          else
            Icon(gameData.error == null ? Icons.cloud_done_outlined : Icons.cloud_off_outlined, size: 18, color: GuiaColors.premiumGoldLight),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 11))),
          IconButton(
            onPressed: gameData.loading ? null : gameData.refresh,
            tooltip: strings.t('home.sync'),
            visualDensity: VisualDensity.compact,
            icon: const GuiaSymbol('atualizar'),
          ),
        ],
      ),
    );
  }
}

class _PremiumBottomBar extends StatelessWidget {
  const _PremiumBottomBar({
    required this.strings,
    required this.onHome,
    required this.onGuides,
    required this.onTracker,
    required this.onFavorites,
    required this.onMore,
  });

  final AppStrings strings;
  final VoidCallback onHome;
  final VoidCallback onGuides;
  final VoidCallback onTracker;
  final VoidCallback onFavorites;
  final VoidCallback onMore;

  @override
  Widget build(BuildContext context) => Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: GuiaColors.premiumGold, width: 1)),
          boxShadow: <BoxShadow>[BoxShadow(color: Colors.black38, blurRadius: 8, offset: Offset(0, -2))],
        ),
        child: BottomNavigationBar(
          currentIndex: 0,
          type: BottomNavigationBarType.fixed,
          backgroundColor: GuiaColors.premiumBackground2,
          selectedItemColor: GuiaColors.premiumGoldLight,
          unselectedItemColor: GuiaColors.premiumMuted,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
          onTap: (index) {
            switch (index) {
              case 0:
                onHome();
                return;
              case 1:
                onGuides();
                return;
              case 2:
                onTracker();
                return;
              case 3:
                onFavorites();
                return;
              case 4:
                onMore();
                return;
            }
          },
          items: <BottomNavigationBarItem>[
            BottomNavigationBarItem(icon: const GuiaSymbol('inicio', color: GuiaColors.premiumMuted), activeIcon: const GuiaSymbol('inicio', filled: true), label: strings.t('nav.home')),
            BottomNavigationBarItem(icon: const GuiaSymbol('guias', color: GuiaColors.premiumMuted), label: strings.t('nav.guides')),
            BottomNavigationBarItem(icon: const GuiaSymbol('tracker', color: GuiaColors.premiumMuted), label: strings.t('nav.tracker')),
            BottomNavigationBarItem(icon: const GuiaSymbol('favoritos', color: GuiaColors.premiumMuted), label: strings.t('nav.favorites')),
            BottomNavigationBarItem(icon: const GuiaSymbol('mais', color: GuiaColors.premiumMuted), label: strings.t('nav.more')),
          ],
        ),
      );
}
