import 'dart:convert';

import 'package:flutter/material.dart';

import '../../../core/config/app_config.dart';
import '../../../core/i18n/app_strings.dart';
import '../../../core/storage/profile_store.dart';
import '../../../core/theme/guia_theme.dart';
import 'game_data_controller.dart';

class CatalogListPage extends StatefulWidget {
  const CatalogListPage({
    super.key,
    required this.sectionKey,
    required this.title,
    required this.controller,
    required this.profileStore,
  });

  final String sectionKey;
  final String title;
  final GameDataController controller;
  final ProfileStore profileStore;

  @override
  State<CatalogListPage> createState() => _CatalogListPageState();
}

class _CatalogListPageState extends State<CatalogListPage> {
  String _query = '';

  String _titleOf(Map<String, dynamic> item) {
    for (final key in const <String>['nome', 'nome_pt', 'name', 'titulo', 'title', 'slug']) {
      final value = item[key]?.toString().trim();
      if (value != null && value.isNotEmpty) return value;
    }
    return 'Registro';
  }

  String _subtitleOf(Map<String, dynamic> item) {
    final parts = <String>[];
    for (final key in const <String>['tipo', 'categoria', 'raridade', 'nivel', 'poder', 'descricao_curta']) {
      final value = item[key];
      if (value != null && value.toString().trim().isNotEmpty) {
        parts.add(value.toString());
      }
      if (parts.length == 2) break;
    }
    return parts.join(' · ');
  }

  String? _imageOf(Map<String, dynamic> item) {
    for (final key in const <String>['imagem', 'image', 'icone', 'icon']) {
      final value = item[key]?.toString().trim();
      if (value == null || value.isEmpty) continue;
      if (value.startsWith('http://') || value.startsWith('https://')) return value;
      if (value.startsWith('/')) return '${AppConfig.apiUrl}$value';
      return '${AppConfig.apiUrl}/$value';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings(widget.profileStore.locale);
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: SafeArea(
        top: false,
        child: AnimatedBuilder(
          animation: widget.controller,
          builder: (context, _) {
            final all = widget.controller.section(widget.sectionKey);
            final normalized = _query.toLowerCase().trim();
            final items = normalized.isEmpty
                ? all
                : all.where((item) => _titleOf(item).toLowerCase().contains(normalized)).toList(growable: false);

            return Column(
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 6),
                  child: TextField(
                    onChanged: (value) => setState(() => _query = value),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.search),
                      hintText: strings.t('catalog.search'),
                      suffixText: '${items.length}',
                    ),
                  ),
                ),
                if (widget.controller.fromCache)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    child: _InfoStrip(
                      icon: Icons.offline_bolt_outlined,
                      text: strings.t('catalog.offline'),
                    ),
                  ),
                Expanded(
                  child: items.isEmpty
                      ? Center(child: Text(strings.t('catalog.empty')))
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(12, 6, 12, 24),
                          itemCount: items.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (context, index) {
                            final item = items[index];
                            final image = _imageOf(item);
                            final subtitle = _subtitleOf(item);
                            return Card(
                              child: ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                                leading: image == null
                                    ? const CircleAvatar(
                                        backgroundColor: GuiaColors.green,
                                        foregroundColor: GuiaColors.gold,
                                        child: Icon(Icons.auto_awesome),
                                      )
                                    : ClipRRect(
                                        borderRadius: BorderRadius.circular(8),
                                        child: Image.network(
                                          image,
                                          width: 52,
                                          height: 52,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => const SizedBox(
                                            width: 52,
                                            height: 52,
                                            child: Icon(Icons.image_not_supported_outlined),
                                          ),
                                        ),
                                      ),
                                title: Text(
                                  _titleOf(item),
                                  style: const TextStyle(fontWeight: FontWeight.w800, color: GuiaColors.ink),
                                ),
                                subtitle: subtitle.isEmpty ? null : Text(subtitle),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () => showModalBottomSheet<void>(
                                  context: context,
                                  showDragHandle: true,
                                  isScrollControlled: true,
                                  builder: (context) => _RecordSheet(title: _titleOf(item), data: item),
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _InfoStrip extends StatelessWidget {
  const _InfoStrip({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: GuiaColors.green.withValues(alpha: .09),
          border: Border.all(color: GuiaColors.green.withValues(alpha: .25)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: <Widget>[
            Icon(icon, size: 18, color: GuiaColors.green),
            const SizedBox(width: 8),
            Expanded(child: Text(text, style: const TextStyle(fontSize: 12))),
          ],
        ),
      );
}

class _RecordSheet extends StatelessWidget {
  const _RecordSheet({required this.title, required this.data});

  final String title;
  final Map<String, dynamic> data;

  @override
  Widget build(BuildContext context) {
    final visible = data.entries.where((entry) => !const <String>{'_id', '__v'}.contains(entry.key)).toList();
    return SafeArea(
      child: FractionallySizedBox(
        heightFactor: .82,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              Expanded(
                child: ListView.separated(
                  itemCount: visible.length,
                  separatorBuilder: (_, __) => const Divider(height: 16),
                  itemBuilder: (context, index) {
                    final entry = visible[index];
                    final value = entry.value is Map<Object?, Object?> || entry.value is List<Object?>
                        ? const JsonEncoder.withIndent('  ').convert(entry.value)
                        : entry.value?.toString() ?? '—';
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(entry.key, style: const TextStyle(fontWeight: FontWeight.w800, color: GuiaColors.green)),
                        const SizedBox(height: 3),
                        SelectableText(value, style: const TextStyle(color: GuiaColors.ink2)),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
