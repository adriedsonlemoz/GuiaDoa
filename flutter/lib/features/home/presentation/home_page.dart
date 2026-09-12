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
            _TopBar(profileStore: profileStore),
            Expanded(
              child: RefreshIndicator(
                onRefresh: gameData.refresh,
                child: CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: <Widget>[
                    SliverToBoxAdapter(
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 980),
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
                            child: Column(
                              children: <Widget>[
                                _ProfileCard(
                                  name: profile.name,
                                  realm: profile.realm,
                                  timezone: profile.timezone,
                                  onEdit: () => Navigator.of(context).push(
                                    MaterialPageRoute<void>(
                                      builder: (_) => ProfilePage(store: profileStore, gameData: gameData),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                AnimatedBuilder(
                                  animation: gameData,
                                  builder: (context, _) => _SyncCard(gameData: gameData, strings: strings),
                                ),
                                const SizedBox(height: 14),
                                _SectionTitle(text: strings.t('home.arsenal')),
                                const SizedBox(height: 8),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(12, 0, 12, 24),
                      sliver: SliverLayoutBuilder(
                        builder: (context, constraints) {
                          final width = constraints.crossAxisExtent;
                          final columns = width >= 900 ? 4 : width >= 620 ? 3 : 2;
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
                              childAspectRatio: width >= 620 ? 1.55 : 1.28,
                              mainAxisSpacing: 9,
                              crossAxisSpacing: 9,
                            ),
                          );
                        },
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(12, 0, 12, 20),
                        child: Center(
                          child: Text(
                            'GUIA DOA · ${AppConfig.displayVersion}',
                            style: const TextStyle(color: GuiaColors.muted, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: .8),
                          ),
                        ),
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
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(strings.t('home.migrating'))));
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => CatalogListPage(
          sectionKey: tool.catalogKey!,
          title: strings.t(tool.labelKey),
          controller: gameData,
          profileStore: profileStore,
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.profileStore});

  final ProfileStore profileStore;

  @override
  Widget build(BuildContext context) => Container(
        minHeight: 60,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: const BoxDecoration(
          gradient: LinearGradient(colors: <Color>[GuiaColors.green2, GuiaColors.greenDark]),
          border: Border(bottom: BorderSide(color: GuiaColors.goldDark)),
        ),
        child: Row(
          children: <Widget>[
            ClipRRect(
              borderRadius: BorderRadius.circular(9),
              child: Image.asset('assets/img/app-icon.png', width: 43, height: 43),
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
            IconButton(
              onPressed: () => profileStore.setLocale(profileStore.locale == 'pt-BR' ? 'en-US' : 'pt-BR'),
              tooltip: 'Idioma / Language',
              color: GuiaColors.gold,
              icon: const Icon(Icons.translate),
            ),
          ],
        ),
      );
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({required this.name, required this.realm, required this.timezone, required this.onEdit});

  final String name;
  final String realm;
  final String timezone;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) => Card(
        margin: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: <Widget>[
              const CircleAvatar(
                radius: 23,
                backgroundColor: GuiaColors.green,
                foregroundColor: GuiaColors.gold,
                child: Icon(Icons.military_tech_outlined),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(name, style: const TextStyle(fontWeight: FontWeight.w900, color: GuiaColors.ink, fontSize: 17)),
                    const SizedBox(height: 2),
                    Text('$realm · $timezone', style: const TextStyle(color: GuiaColors.ink2, fontSize: 12)),
                  ],
                ),
              ),
              IconButton(onPressed: onEdit, icon: const Icon(Icons.edit_outlined), color: GuiaColors.green),
            ],
          ),
        ),
      );
}

class _SyncCard extends StatelessWidget {
  const _SyncCard({required this.gameData, required this.strings});

  final GameDataController gameData;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    final status = gameData.loading
        ? 'Sincronizando com a API…'
        : gameData.error != null
            ? (gameData.hasData ? strings.t('catalog.offline') : 'Não foi possível carregar os dados.')
            : gameData.fromCache
                ? strings.t('catalog.offline')
                : strings.t('catalog.online');
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 9),
      decoration: BoxDecoration(
        color: gameData.error == null ? GuiaColors.green.withValues(alpha: .08) : Colors.orange.withValues(alpha: .08),
        border: Border.all(color: gameData.error == null ? GuiaColors.green.withValues(alpha: .25) : Colors.orange.withValues(alpha: .28)),
        borderRadius: BorderRadius.circular(9),
      ),
      child: Row(
        children: <Widget>[
          if (gameData.loading)
            const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
          else
            Icon(gameData.error == null ? Icons.cloud_done_outlined : Icons.cloud_off_outlined, size: 19, color: GuiaColors.green),
          const SizedBox(width: 9),
          Expanded(child: Text(status, style: const TextStyle(fontSize: 12, color: GuiaColors.ink2))),
          IconButton(onPressed: gameData.loading ? null : gameData.refresh, icon: const Icon(Icons.refresh), tooltip: strings.t('home.sync')),
        ],
      ),
    );
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
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text(text, style: const TextStyle(color: GuiaColors.green, fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 1)),
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
  Widget build(BuildContext context) => Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Ink(
            decoration: BoxDecoration(
              gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: <Color>[GuiaColors.parchmentLight, GuiaColors.parchmentDark]),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: tool.migrated ? GuiaColors.border : GuiaColors.border.withValues(alpha: .48)),
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
                      width: 35,
                      height: 35,
                      decoration: BoxDecoration(color: GuiaColors.green, borderRadius: BorderRadius.circular(9), border: Border.all(color: GuiaColors.goldDark)),
                      child: Icon(tool.icon, color: GuiaColors.gold, size: 21),
                    ),
                    const Spacer(),
                    Icon(tool.migrated ? Icons.chevron_right : Icons.schedule, size: 19, color: tool.migrated ? GuiaColors.green : GuiaColors.muted),
                  ],
                ),
                const SizedBox(height: 8),
                Text(strings.t(tool.labelKey), maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: GuiaColors.ink, fontWeight: FontWeight.w900, fontSize: 14)),
                const SizedBox(height: 2),
                Text(tool.subtitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: tool.migrated ? GuiaColors.ink2 : GuiaColors.muted, fontSize: 10.5)),
              ],
            ),
          ),
        ),
      );
}
