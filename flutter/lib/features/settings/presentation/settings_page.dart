import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/profile_store.dart';
import '../../../core/theme/guia_theme.dart';
import '../../catalog/presentation/game_data_controller.dart';
import '../../profile/presentation/language_selector.dart';
import '../../profile/presentation/profile_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({
    super.key,
    required this.profileStore,
    required this.gameData,
  });

  final ProfileStore profileStore;
  final GameDataController gameData;

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  Future<void> _changeLocale(String locale) async {
    await widget.profileStore.setLocale(locale);
    if (!mounted) return;
    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppStrings(locale).t('settings.saved'))),
    );
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    final profile = widget.profileStore.profile;

    return Scaffold(
      backgroundColor: GuiaColors.premiumBackground,
      appBar: AppBar(
        title: Text(strings.t('settings.title')),
        backgroundColor: GuiaColors.premiumPanel,
        foregroundColor: GuiaColors.premiumText,
        surfaceTintColor: Colors.transparent,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: GuiaColors.premiumGold),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: <Color>[GuiaColors.premiumBackground2, GuiaColors.premiumBackground],
          ),
        ),
        child: SafeArea(
          top: false,
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 720),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(14, 16, 14, 30),
                children: <Widget>[
                  _SettingsSection(
                    icon: Icons.translate,
                    title: strings.t('settings.language'),
                    subtitle: strings.t('settings.language.subtitle'),
                    child: LanguageSelector(
                      locale: widget.profileStore.locale,
                      onChanged: _changeLocale,
                      compact: true,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _SettingsTile(
                    icon: Icons.person_outline,
                    title: strings.t('settings.profile'),
                    subtitle: profile == null
                        ? strings.t('home.noProfile')
                        : '${profile.name} · ${profile.realm}',
                    onTap: profile == null
                        ? null
                        : () => Navigator.of(context).push(
                              MaterialPageRoute<void>(
                                builder: (_) => ProfilePage(store: widget.profileStore, gameData: widget.gameData),
                              ),
                            ),
                  ),
                  const SizedBox(height: 12),
                  AnimatedBuilder(
                    animation: widget.gameData,
                    builder: (context, _) => _SettingsTile(
                      icon: widget.gameData.error == null ? Icons.cloud_done_outlined : Icons.cloud_off_outlined,
                      title: strings.t('settings.sync'),
                      subtitle: widget.gameData.loading
                          ? strings.t('onboarding.realm_loading')
                          : widget.gameData.error != null
                              ? strings.t('catalog.offline')
                              : strings.t('settings.sync.subtitle'),
                      trailing: widget.gameData.loading
                          ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: GuiaColors.premiumGoldLight))
                          : const Icon(Icons.refresh, color: GuiaColors.premiumGoldLight),
                      onTap: widget.gameData.loading ? null : widget.gameData.refresh,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _SettingsSection(
                    icon: Icons.info_outline,
                    title: strings.t('settings.about'),
                    subtitle: strings.t('settings.about.subtitle'),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        _InfoLine(label: 'Build', value: AppConfig.displayVersion),
                        const SizedBox(height: 6),
                        _InfoLine(label: 'Family', value: AppConfig.apkFlavor),
                        const SizedBox(height: 6),
                        const _InfoLine(label: 'Targets', value: 'Android · Web · iOS'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  const _SettingsSection({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: GuiaColors.premiumPanel.withValues(alpha: .9),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .58)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: GuiaColors.premiumEmerald.withValues(alpha: .55),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .55)),
                  ),
                  child: Icon(icon, color: GuiaColors.premiumGoldLight, size: 21),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(title, style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w900, fontSize: 15)),
                      const SizedBox(height: 2),
                      Text(subtitle, style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 11.5, height: 1.35)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            child,
          ],
        ),
      );
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Ink(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: GuiaColors.premiumPanel.withValues(alpha: .9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .5)),
            ),
            child: Row(
              children: <Widget>[
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: GuiaColors.premiumEmerald.withValues(alpha: .58),
                    borderRadius: BorderRadius.circular(11),
                    border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .5)),
                  ),
                  child: Icon(icon, color: GuiaColors.premiumGoldLight),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(title, style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w900, fontSize: 14)),
                      const SizedBox(height: 3),
                      Text(subtitle, style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 11.5)),
                    ],
                  ),
                ),
                trailing ?? const Icon(Icons.chevron_right, color: GuiaColors.premiumGoldLight),
              ],
            ),
          ),
        ),
      );
}

class _InfoLine extends StatelessWidget {
  const _InfoLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 64,
            child: Text(label, style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 11)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(color: GuiaColors.premiumText, fontWeight: FontWeight.w700, fontSize: 11.5)),
          ),
        ],
      );
}
