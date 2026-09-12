import 'package:flutter/material.dart';
import '../../../core/domain/realm_time.dart';
import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/profile_store.dart';
import '../../catalog/presentation/game_data_controller.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key, required this.store, required this.gameData});
  final ProfileStore store;
  final GameDataController gameData;
  @override State<ProfilePage> createState() => _ProfilePageState();
}
class _ProfilePageState extends State<ProfilePage> {
  late final TextEditingController _nameController;
  late String _locale;
  String? _selection;
  @override void initState() {
    super.initState();
    final profile = widget.store.profile!;
    _nameController = TextEditingController(text: profile.name);
    _locale = profile.locale;
    _selection = profile.realmId == null ? 'name:${profile.realm}' : 'id:${profile.realmId}';
  }
  @override void dispose() { _nameController.dispose(); super.dispose(); }
  @override Widget build(BuildContext context) => AnimatedBuilder(animation: widget.gameData, builder: (context, _) {
    final strings = AppStrings(_locale);
    final realms = RealmTime.choices(widget.gameData.section('reinos'));
    Map<String, dynamic>? selected;
    for (final realm in realms) {
      if (RealmTime.selectionKey(realm) == _selection) { selected = realm; break; }
    }
    if (selected == null && (_selection?.startsWith('name:') ?? false)) {
      selected = RealmTime.find(realms, realmName: _selection!.substring(5));
    }
    final selectedRealm = selected;
    return Scaffold(appBar: AppBar(title: Text(strings.t('profile.title'))), body: SafeArea(top: false, child: Center(
      child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 560), child: ListView(padding: const EdgeInsets.all(16), children: [
        TextField(controller: _nameController, decoration: InputDecoration(labelText: strings.t('profile.name'))),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(initialValue: _locale, decoration: InputDecoration(labelText: strings.t('profile.language')),
          items: const [DropdownMenuItem(value: 'pt-BR', child: Text('Português')), DropdownMenuItem(value: 'en-US', child: Text('English'))],
          onChanged: (value) => setState(() => _locale = value ?? _locale)),
        const SizedBox(height: 12),
        if (widget.gameData.sectionLoading('reinos')) const LinearProgressIndicator(),
        DropdownButtonFormField<String>(key: ValueKey(selectedRealm == null ? 'unknown' : RealmTime.selectionKey(selectedRealm)),
          initialValue: selectedRealm == null ? null : RealmTime.selectionKey(selectedRealm), isExpanded: true,
          decoration: InputDecoration(labelText: strings.t('profile.realm'), hintText: widget.store.profile!.realm),
          items: realms.map((realm) { final zone = RealmTime.zone(realm); return DropdownMenuItem(value: RealmTime.selectionKey(realm),
            child: Text('#${realm['id'] ?? '—'} · ${RealmTime.name(realm)} · ${zone.isEmpty ? strings.t('realms.not_informed') : zone}', overflow: TextOverflow.ellipsis)); }).toList(),
          onChanged: (value) => setState(() => _selection = value)),
        const SizedBox(height: 8),
        if (selectedRealm != null) Text('${strings.t('profile.realm_clock')}: ${RealmTime.zone(selectedRealm).isEmpty ? strings.t('realms.not_informed') : '${RealmTime.clock(RealmTime.zone(selectedRealm), DateTime.now())} · ${RealmTime.zone(selectedRealm)}'}'),
        if (widget.gameData.sectionError('reinos') != null) TextButton.icon(onPressed: widget.gameData.loading ? null : widget.gameData.refresh,
          icon: const Icon(Icons.refresh), label: Text(strings.t('onboarding.realm_offline'))),
        const SizedBox(height: 18),
        FilledButton.icon(onPressed: () async {
          final name = _nameController.text.trim();
          if (name.isEmpty) { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(strings.t('profile.validation')))); return; }
          final current = widget.store.profile!;
          await widget.store.save(PlayerProfile(name: name,
            realm: selectedRealm == null ? current.realm : RealmTime.name(selectedRealm),
            realmId: selectedRealm == null ? current.realmId : RealmTime.id(selectedRealm),
            timezone: selectedRealm == null ? current.timezone : RealmTime.zone(selectedRealm), locale: _locale));
          if (context.mounted) Navigator.of(context).pop();
        }, icon: const Icon(Icons.save_outlined), label: Text(strings.t('profile.save'))),
      ])),
    )));
  });
}
