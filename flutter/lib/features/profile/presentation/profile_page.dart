import 'package:flutter/material.dart';

import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/profile_store.dart';
import '../../catalog/presentation/game_data_controller.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({
    super.key,
    required this.store,
    required this.gameData,
  });

  final ProfileStore store;
  final GameDataController gameData;

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late final TextEditingController _nameController;
  late String _locale;
  late String _realm;

  @override
  void initState() {
    super.initState();
    final profile = widget.store.profile!;
    _nameController = TextEditingController(text: profile.name);
    _locale = profile.locale;
    _realm = profile.realm;
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(_locale);
    final realms = widget.gameData.section('reinos');
    return Scaffold(
      appBar: AppBar(title: Text(strings.t('profile.title'))),
      body: SafeArea(
        top: false,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: <Widget>[
                TextField(controller: _nameController, decoration: InputDecoration(labelText: strings.t('profile.name'))),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _locale,
                  decoration: InputDecoration(labelText: strings.t('profile.language')),
                  items: const <DropdownMenuItem<String>>[
                    DropdownMenuItem(value: 'pt-BR', child: Text('Português')),
                    DropdownMenuItem(value: 'en-US', child: Text('English')),
                  ],
                  onChanged: (value) => setState(() => _locale = value ?? _locale),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: realms.any((realm) => (realm['nome'] ?? realm['name'] ?? realm['slug']).toString() == _realm) ? _realm : null,
                  isExpanded: true,
                  decoration: InputDecoration(labelText: strings.t('profile.realm')),
                  items: realms.map((realm) {
                    final name = (realm['nome'] ?? realm['name'] ?? realm['slug'] ?? '').toString();
                    return DropdownMenuItem<String>(value: name, child: Text(name));
                  }).where((item) => item.value != null && item.value!.isNotEmpty).toList(growable: false),
                  onChanged: (value) => setState(() => _realm = value ?? _realm),
                ),
                const SizedBox(height: 18),
                FilledButton.icon(
                  onPressed: () async {
                    Map<String, dynamic>? selected;
                    for (final candidate in realms) {
                      final candidateName = (candidate['nome'] ?? candidate['name'] ?? candidate['slug'] ?? '').toString();
                      if (candidateName == _realm) {
                        selected = candidate;
                        break;
                      }
                    }
                    await widget.store.save(PlayerProfile(
                      name: _nameController.text.trim(),
                      realm: _realm,
                      timezone: (selected?['fuso'] ?? selected?['timezone'] ?? widget.store.profile!.timezone).toString(),
                      locale: _locale,
                    ));
                    if (mounted) Navigator.of(context).pop();
                  },
                  icon: const Icon(Icons.save_outlined),
                  label: Text(strings.t('profile.save')),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
