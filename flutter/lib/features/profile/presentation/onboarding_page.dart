import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/profile_store.dart';
import '../../../core/theme/guia_theme.dart';
import '../../catalog/presentation/game_data_controller.dart';

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
  String _locale = 'pt-BR';
  String? _realm;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(_locale);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: AnimatedBuilder(
                animation: widget.gameData,
                builder: (context, _) {
                  final realms = widget.gameData.section('reinos');
                  return Column(
                    children: <Widget>[
                      Image.asset('assets/img/app-icon.png', width: 112, height: 112),
                      const SizedBox(height: 10),
                      const Text(
                        'GUIA DOA',
                        style: TextStyle(fontSize: 29, fontWeight: FontWeight.w900, color: GuiaColors.green),
                      ),
                      Text(strings.t('app.subtitle'), style: const TextStyle(color: GuiaColors.ink2)),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                        decoration: BoxDecoration(
                          color: GuiaColors.green,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: GuiaColors.goldDark),
                        ),
                        child: const Text(
                          'NOVA VERSÃO FLUTTER · ${AppConfig.displayVersion}',
                          style: TextStyle(color: GuiaColors.gold, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: .45),
                        ),
                      ),
                      const SizedBox(height: 22),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: <Widget>[
                              Text(strings.t('profile.title'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
                              const SizedBox(height: 14),
                              DropdownButtonFormField<String>(
                                initialValue: _locale,
                                decoration: InputDecoration(labelText: strings.t('profile.language')),
                                items: const <DropdownMenuItem<String>>[
                                  DropdownMenuItem(value: 'pt-BR', child: Text('Português')),
                                  DropdownMenuItem(value: 'en-US', child: Text('English')),
                                ],
                                onChanged: (value) => setState(() => _locale = value ?? 'pt-BR'),
                              ),
                              const SizedBox(height: 12),
                              TextField(
                                controller: _nameController,
                                textInputAction: TextInputAction.next,
                                decoration: InputDecoration(labelText: strings.t('profile.name')),
                              ),
                              const SizedBox(height: 12),
                              DropdownButtonFormField<String>(
                                initialValue: _realm,
                                isExpanded: true,
                                decoration: InputDecoration(labelText: strings.t('profile.realm')),
                                items: realms.map((realm) {
                                  final name = (realm['nome'] ?? realm['name'] ?? realm['slug'] ?? '').toString();
                                  return DropdownMenuItem<String>(value: name, child: Text(name));
                                }).where((item) => item.value != null && item.value!.isNotEmpty).toList(growable: false),
                                onChanged: (value) => setState(() => _realm = value),
                              ),
                              if (realms.isEmpty && widget.gameData.loading) ...<Widget>[
                                const SizedBox(height: 10),
                                const LinearProgressIndicator(),
                              ],
                              if (widget.gameData.error != null && realms.isEmpty) ...<Widget>[
                                const SizedBox(height: 10),
                                Text(widget.gameData.error!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                                TextButton.icon(
                                  onPressed: widget.gameData.refresh,
                                  icon: const Icon(Icons.refresh),
                                  label: Text(strings.t('common.retry')),
                                ),
                              ],
                              const SizedBox(height: 16),
                              FilledButton.icon(
                                onPressed: () async {
                                  final name = _nameController.text.trim();
                                  final realmName = _realm?.trim() ?? '';
                                  if (name.isEmpty || realmName.isEmpty) {
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
                                },
                                icon: const Icon(Icons.arrow_forward),
                                label: Text(strings.t('profile.continue')),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}
