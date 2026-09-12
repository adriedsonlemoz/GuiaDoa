import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/profile_store.dart';
import '../../../core/theme/guia_theme.dart';
import '../../catalog/presentation/game_data_controller.dart';
import 'language_selector.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({
    super.key,
    required this.profileStore,
    required this.gameData,
  });

  final ProfileStore profileStore;
  final GameDataController gameData;

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _nameController = TextEditingController();
  final _realmController = TextEditingController();
  String _locale = 'pt-BR';
  String? _realm;

  @override
  void initState() {
    super.initState();
    _locale = widget.profileStore.locale;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _realmController.dispose();
    super.dispose();
  }

  Future<void> _changeLocale(String locale) async {
    if (_locale == locale) return;
    setState(() => _locale = locale);
    await widget.profileStore.setLocale(locale);
  }

  InputDecoration _fieldDecoration(String label, {IconData? icon}) => InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: GuiaColors.premiumMuted),
        prefixIcon: icon == null ? null : Icon(icon, color: GuiaColors.premiumGold),
        filled: true,
        fillColor: GuiaColors.premiumBackground.withValues(alpha: .72),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: GuiaColors.premiumGold.withValues(alpha: .58)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: GuiaColors.premiumGoldLight, width: 1.7),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(_locale);

    return Scaffold(
      backgroundColor: GuiaColors.premiumBackground,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: <Color>[
              Color(0xFF0A3F34),
              GuiaColors.premiumBackground2,
              GuiaColors.premiumBackground,
            ],
          ),
        ),
        child: SafeArea(
          child: AnimatedBuilder(
            animation: widget.gameData,
            builder: (context, _) {
              final realms = widget.gameData.section('reinos');
              return Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 560),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(18, 22, 18, 26),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        _BrandHeader(strings: strings),
                        const SizedBox(height: 22),
                        Text(
                          strings.t('onboarding.language_hint'),
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: GuiaColors.premiumGoldLight,
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 10),
                        LanguageSelector(locale: _locale, onChanged: _changeLocale),
                        const SizedBox(height: 18),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: GuiaColors.premiumPanel.withValues(alpha: .86),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: GuiaColors.premiumGold.withValues(alpha: .7)),
                            boxShadow: <BoxShadow>[
                              BoxShadow(
                                color: Colors.black.withValues(alpha: .28),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: <Widget>[
                              Row(
                                children: <Widget>[
                                  const Icon(Icons.shield_outlined, color: GuiaColors.premiumGoldLight),
                                  const SizedBox(width: 9),
                                  Text(
                                    strings.t('profile.title'),
                                    style: const TextStyle(
                                      color: GuiaColors.premiumText,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 20,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              TextField(
                                controller: _nameController,
                                textInputAction: TextInputAction.next,
                                style: const TextStyle(color: GuiaColors.premiumText),
                                cursorColor: GuiaColors.premiumGoldLight,
                                decoration: _fieldDecoration(strings.t('profile.name'), icon: Icons.person_outline),
                              ),
                              const SizedBox(height: 12),
                              if (realms.isNotEmpty)
                                DropdownButtonFormField<String>(
                                  initialValue: _realm,
                                  isExpanded: true,
                                  dropdownColor: GuiaColors.premiumPanel,
                                  iconEnabledColor: GuiaColors.premiumGoldLight,
                                  style: const TextStyle(color: GuiaColors.premiumText),
                                  decoration: _fieldDecoration(strings.t('profile.realm'), icon: Icons.public),
                                  items: realms
                                      .map((realm) {
                                        final name = (realm['nome'] ?? realm['name'] ?? realm['slug'] ?? '').toString();
                                        return DropdownMenuItem<String>(value: name, child: Text(name));
                                      })
                                      .where((item) => item.value != null && item.value!.isNotEmpty)
                                      .toList(growable: false),
                                  onChanged: (value) => setState(() => _realm = value),
                                )
                              else
                                TextField(
                                  controller: _realmController,
                                  textInputAction: TextInputAction.done,
                                  style: const TextStyle(color: GuiaColors.premiumText),
                                  cursorColor: GuiaColors.premiumGoldLight,
                                  decoration: _fieldDecoration(strings.t('onboarding.realm_manual'), icon: Icons.public),
                                ),
                              if (realms.isEmpty && widget.gameData.loading) ...<Widget>[
                                const SizedBox(height: 12),
                                const LinearProgressIndicator(
                                  color: GuiaColors.premiumGoldLight,
                                  backgroundColor: GuiaColors.premiumBackground,
                                ),
                                const SizedBox(height: 7),
                                Text(
                                  strings.t('onboarding.realm_loading'),
                                  style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 12),
                                ),
                              ],
                              if (widget.gameData.error != null && realms.isEmpty) ...<Widget>[
                                const SizedBox(height: 12),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    const Icon(Icons.cloud_off_outlined, size: 18, color: GuiaColors.premiumGold),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        strings.t('onboarding.realm_offline'),
                                        style: const TextStyle(color: GuiaColors.premiumMuted, fontSize: 12, height: 1.35),
                                      ),
                                    ),
                                  ],
                                ),
                                Align(
                                  alignment: Alignment.centerLeft,
                                  child: TextButton.icon(
                                    onPressed: widget.gameData.refresh,
                                    style: TextButton.styleFrom(foregroundColor: GuiaColors.premiumGoldLight),
                                    icon: const Icon(Icons.refresh),
                                    label: Text(strings.t('common.retry')),
                                  ),
                                ),
                              ],
                              const SizedBox(height: 18),
                              FilledButton.icon(
                                style: FilledButton.styleFrom(
                                  backgroundColor: GuiaColors.premiumEmerald,
                                  foregroundColor: Colors.white,
                                  minimumSize: const Size.fromHeight(54),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                    side: const BorderSide(color: GuiaColors.premiumGold, width: 1.1),
                                  ),
                                ),
                                onPressed: () => _continue(realms, strings),
                                icon: const Icon(Icons.arrow_forward),
                                label: Text(
                                  strings.t('profile.continue'),
                                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        const Text(
                          '${AppConfig.apkFlavor} · ${AppConfig.displayVersion}',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: GuiaColors.premiumMuted,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: .5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _continue(List<Map<String, dynamic>> realms, AppStrings strings) async {
    final name = _nameController.text.trim();
    final realmName = realms.isNotEmpty ? (_realm?.trim() ?? '') : _realmController.text.trim();
    if (name.isEmpty || realmName.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(strings.t('profile.validation'))));
      return;
    }

    Map<String, dynamic>? selected;
    for (final candidate in realms) {
      final candidateName = (candidate['nome'] ?? candidate['name'] ?? candidate['slug'] ?? '').toString();
      if (candidateName == realmName) {
        selected = candidate;
        break;
      }
    }

    final timezone = (selected?['fuso'] ?? selected?['timezone'] ?? 'UTC').toString();
    await widget.profileStore.save(PlayerProfile(
      name: name,
      realm: realmName,
      timezone: timezone,
      locale: _locale,
    ));
  }
}

class _BrandHeader extends StatelessWidget {
  const _BrandHeader({required this.strings});

  final AppStrings strings;

  @override
  Widget build(BuildContext context) => Column(
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: GuiaColors.premiumGoldLight, width: 1.4),
              boxShadow: <BoxShadow>[
                BoxShadow(color: GuiaColors.premiumGold.withValues(alpha: .22), blurRadius: 22),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset('assets/img/app-icon.png', width: 118, height: 118, fit: BoxFit.cover),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'GUIA DOA',
            style: TextStyle(
              fontSize: 31,
              fontWeight: FontWeight.w900,
              letterSpacing: 1,
              color: GuiaColors.premiumGoldLight,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            strings.t('onboarding.welcome'),
            textAlign: TextAlign.center,
            style: const TextStyle(color: GuiaColors.premiumText, fontSize: 14, fontWeight: FontWeight.w600),
          ),
        ],
      );
}
