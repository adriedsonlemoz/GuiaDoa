import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
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

  @override
  void dispose() {
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
          animation: widget.gameData,
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
                            _SummaryPanel(gameData: widget.gameData, strings: strings),
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
                                fontSize: 10.5,
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
  const _HeroHeader({
    required this.strings,
    required this.name,
    required this.realm,
    required this.searchController,
    required this.onSearchChanged,
    required this.onSettings,
    required this.onProfile,
  });

  final AppStrings strings;
  final String name;
  final String realm;
  final TextEditingController searchController;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onSettings;
  final VoidCallback onProfile;

  @override
  Widget build(BuildContext context) => Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: <Color>[Color(0xFF0A4A3B), Color(0xFF052A24), GuiaColors.premiumBackground],
          ),
          border: Border(bottom: BorderSide(color: GuiaColors.premiumGold, width: 1.1)),
        ),
        child: Stack(
          children: <Widget>[
            Positioned(
              right: -34,
              top: -20,
              child: Opacity(
                opacity: .20,
                child: Image.asset(
                  'assets/public/assets/dragons/dragao_dourado.webp',
                  width: 210,
                  height: 210,
                  fit: BoxFit.contain,
                ),
              ),
            ),
            Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1050),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 16),
                  child: Column(
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(15),
                              border: Border.all(color: GuiaColors.premiumGoldLight, width: 1.2),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.asset('assets/img/app-icon.png', width: 58, height: 58, fit: BoxFit.cover),
                            ),
                          ),
                          const SizedBox(width: 11),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                const Text(
                                  'GUIA DOA',
                                  style: TextStyle(
                                    color: GuiaColors.premiumGoldLight,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 24,
                                    letterSpacing: .8,
                                  ),
                                ),
                                Text(
                                  strings.t('app.subtitle'),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: GuiaColors.premiumText, fontSize: 11.5, fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 3),
                                GestureDetector(
                                  onTap: onProfile,
                                  child: Text(
                                    '$name · $realm',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 10.5),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: GuiaColors.premiumEmerald.withValues(alpha: .65),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .72)),
                            ),
                            child: Text(
                              AppConfig.flutterChannel.replaceFirst('Flutter ', 'FLUTTER '),
                              style: const TextStyle(color: GuiaColors.premiumGoldLight, fontSize: 9.5, fontWeight: FontWeight.w900),
                            ),
                          ),
                          const SizedBox(width: 3),
                          IconButton(
                            onPressed: onSettings,
                            tooltip: strings.t('settings.title'),
                            icon: const Icon(Icons.settings_outlined, color: GuiaColors.premiumGoldLight),
                          ),
                        ],
                      ),
                      const SizedBox(height: 13),
                      TextField(
                        controller: searchController,
                        onChanged: onSearchChanged,
                        style: const TextStyle(color: GuiaColors.premiumText),
                        cursorColor: GuiaColors.premiumGoldLight,
                        decoration: InputDecoration(
                          hintText: strings.t('home.search'),
                          hintStyle: const TextStyle(color: GuiaColors.premiumMuted),
                          prefixIcon: const Icon(Icons.search, color: GuiaColors.premiumGoldLight),
                          suffixIcon: searchController.text.isEmpty
                              ? null
                              : IconButton(
                                  onPressed: () {
                                    searchController.clear();
                                    onSearchChanged('');
                                  },
                                  icon: const Icon(Icons.close, color: GuiaColors.premiumMuted),
                                ),
                          filled: true,
                          fillColor: GuiaColors.premiumBackground.withValues(alpha: .76),
                          contentPadding: const EdgeInsets.symmetric(vertical: 13),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(15),
                            borderSide: const BorderSide(color: GuiaColors.premiumGold, width: 1.2),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(15),
                            borderSide: const BorderSide(color: GuiaColors.premiumGoldLight, width: 1.8),
                          ),
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
}

class _SummaryPanel extends StatelessWidget {
  const _SummaryPanel({required this.gameData, required this.strings});

  final GameDataController gameData;
  final AppStrings strings;

  String _updatedText() {
    final value = gameData.lastUpdated;
    if (value == null) return strings.t('home.summary.no_data');
    final local = value.toLocal();
    String pad(int n) => n.toString().padLeft(2, '0');
    return '${pad(local.day)}/${pad(local.month)} ${pad(local.hour)}:${pad(local.minute)}';
  }

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 13),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: <Color>[Color(0xFFE8DDBB), Color(0xFFD4C08B)]),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: GuiaColors.premiumGold, width: 1.2),
          boxShadow: <BoxShadow>[BoxShadow(color: Colors.black.withValues(alpha: .25), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Row(
          children: <Widget>[
            Expanded(
              child: _SummaryItem(
                icon: Icons.military_tech_outlined,
                label: strings.t('home.summary.troops'),
                value: '${gameData.section('tropas').length}',
              ),
            ),
            const _SummaryDivider(),
            Expanded(
              child: _SummaryItem(
                icon: Icons.pets_outlined,
                label: strings.t('home.summary.dragons'),
                value: '${gameData.section('dragoes').length}',
              ),
            ),
            const _SummaryDivider(),
            Expanded(
              child: _SummaryItem(
                icon: gameData.fromCache ? Icons.offline_bolt_outlined : Icons.cloud_done_outlined,
                label: strings.t('home.summary.updated'),
                value: gameData.fromCache ? strings.t('home.summary.cached') : _updatedText(),
              ),
            ),
          ],
        ),
      );
}

class _SummaryItem extends StatelessWidget {
  const _SummaryItem({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Column(
        children: <Widget>[
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(color: GuiaColors.greenDark, shape: BoxShape.circle),
            child: Icon(icon, size: 19, color: GuiaColors.premiumGoldLight),
          ),
          const SizedBox(height: 6),
          Text(label, textAlign: TextAlign.center, style: const TextStyle(color: GuiaColors.ink2, fontSize: 9.5, fontWeight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text(
            value,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: GuiaColors.ink, fontSize: 12, fontWeight: FontWeight.w900),
          ),
        ],
      );
}

class _SummaryDivider extends StatelessWidget {
  const _SummaryDivider();

  @override
  Widget build(BuildContext context) => Container(width: 1, height: 72, color: GuiaColors.goldDark.withValues(alpha: .45));
}

class _PrimaryToolGrid extends StatelessWidget {
  const _PrimaryToolGrid({required this.tools, required this.strings, required this.onOpen});

  final List<HomeTool> tools;
  final AppStrings strings;
  final ValueChanged<HomeTool> onOpen;

  @override
  Widget build(BuildContext context) {
    if (tools.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: GuiaColors.premiumPanel,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .45)),
        ),
        child: Text(strings.t('catalog.empty'), textAlign: TextAlign.center, style: const TextStyle(color: GuiaColors.premiumMuted)),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 900 ? 4 : constraints.maxWidth >= 600 ? 4 : 2;
        final aspect = constraints.maxWidth >= 600 ? 1.12 : 1.03;
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: tools.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            childAspectRatio: aspect,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
          ),
          itemBuilder: (context, index) => _ToolCard(tool: tools[index], strings: strings, onTap: () => onOpen(tools[index])),
        );
      },
    );
  }
}

class _ToolCard extends StatelessWidget {
  const _ToolCard({required this.tool, required this.strings, required this.onTap});

  final HomeTool tool;
  final AppStrings strings;
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
                colors: <Color>[GuiaColors.premiumPanel2, GuiaColors.premiumPanel, Color(0xFF052A24)],
              ),
              borderRadius: BorderRadius.circular(15),
              border: Border.all(color: tool.migrated ? GuiaColors.premiumGold : GuiaColors.premiumGold.withValues(alpha: .45)),
              boxShadow: <BoxShadow>[BoxShadow(color: Colors.black.withValues(alpha: .24), blurRadius: 8, offset: const Offset(0, 4))],
            ),
            child: Stack(
              children: <Widget>[
                if (tool.assetPath != null)
                  Positioned(
                    right: -12,
                    top: -10,
                    child: Opacity(
                      opacity: .42,
                      child: Image.asset(tool.assetPath!, width: 100, height: 100, fit: BoxFit.contain),
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: <Widget>[
                      Text(tool.emoji, style: const TextStyle(fontSize: 30)),
                      const Spacer(),
                      Text(
                        strings.t(tool.labelKey),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 15),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        strings.t(tool.subtitleKey),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: GuiaColors.premiumText, fontSize: 10.5, height: 1.2),
                      ),
                      if (!tool.migrated) ...<Widget>[
                        const SizedBox(height: 5),
                        const Icon(Icons.schedule, size: 14, color: GuiaColors.premiumMuted),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
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
              style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 18),
            ),
          ),
          if (subtitle != null)
            Flexible(
              child: Text(
                subtitle!,
                textAlign: TextAlign.right,
                style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 10.5),
              ),
            ),
        ],
      );
}

class _QuickActions extends StatelessWidget {
  const _QuickActions({
    required this.strings,
    required this.onCompare,
    required this.onCalculator,
    required this.onBackup,
  });

  final AppStrings strings;
  final VoidCallback onCompare;
  final VoidCallback onCalculator;
  final VoidCallback onBackup;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
        builder: (context, constraints) {
          final items = <Widget>[
            _QuickCard(
              icon: Icons.compare_arrows,
              title: strings.t('home.quick.compare'),
              subtitle: strings.t('home.quick.compare.sub'),
              onTap: onCompare,
            ),
            _QuickCard(
              icon: Icons.calculate_outlined,
              title: strings.t('home.quick.calculator'),
              subtitle: strings.t('home.quick.calculator.sub'),
              onTap: onCalculator,
            ),
            _QuickCard(
              icon: Icons.cloud_upload_outlined,
              title: strings.t('home.quick.backup'),
              subtitle: strings.t('home.quick.backup.sub'),
              onTap: onBackup,
            ),
          ];

          if (constraints.maxWidth >= 700) {
            return Row(
              children: <Widget>[
                Expanded(child: items[0]),
                const SizedBox(width: 9),
                Expanded(child: items[1]),
                const SizedBox(width: 9),
                Expanded(child: items[2]),
              ],
            );
          }
          return Column(
            children: <Widget>[
              items[0],
              const SizedBox(height: 8),
              items[1],
              const SizedBox(height: 8),
              items[2],
            ],
          );
        },
      );
}

class _QuickCard extends StatelessWidget {
  const _QuickCard({required this.icon, required this.title, required this.subtitle, required this.onTap});

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(13),
          child: Ink(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: GuiaColors.premiumPanel.withValues(alpha: .92),
              borderRadius: BorderRadius.circular(13),
              border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .65)),
            ),
            child: Row(
              children: <Widget>[
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: GuiaColors.premiumEmerald.withValues(alpha: .62),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .5)),
                  ),
                  child: Icon(icon, color: GuiaColors.premiumGoldLight),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(title, style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w900, fontSize: 13)),
                      const SizedBox(height: 2),
                      Text(subtitle, style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 10.5)),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: GuiaColors.premiumGoldLight),
              ],
            ),
          ),
        ),
      );
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
            badge: strings.t('home.badge.flutter'),
            title: strings.t('home.highlight.troops'),
            subtitle: strings.t('home.highlight.troops.sub'),
            onTap: onTroops,
          );
          if (constraints.maxWidth >= 700) {
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
            height: 138,
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
                  child: Icon(icon, size: 78, color: GuiaColors.premiumGold.withValues(alpha: .16)),
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
                      const Spacer(),
                      Text(title, style: const TextStyle(color: GuiaColors.premiumGoldLight, fontWeight: FontWeight.w900, fontSize: 16)),
                      const SizedBox(height: 3),
                      Row(
                        children: <Widget>[
                          Expanded(child: Text(subtitle, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: GuiaColors.premiumText, fontSize: 10.5, height: 1.25))),
                          const Icon(Icons.chevron_right, color: GuiaColors.premiumGoldLight),
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
        ? strings.t('onboarding.realm_loading')
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
            icon: const Icon(Icons.refresh, color: GuiaColors.premiumGoldLight),
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
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10.5),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 10),
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
            BottomNavigationBarItem(icon: const Icon(Icons.home_outlined), activeIcon: const Icon(Icons.home), label: strings.t('nav.home')),
            BottomNavigationBarItem(icon: const Icon(Icons.menu_book_outlined), label: strings.t('nav.guides')),
            BottomNavigationBarItem(icon: const Icon(Icons.bar_chart_outlined), label: strings.t('nav.tracker')),
            BottomNavigationBarItem(icon: const Icon(Icons.star_border), label: strings.t('nav.favorites')),
            BottomNavigationBarItem(icon: const Icon(Icons.menu), label: strings.t('nav.more')),
          ],
        ),
      );
}
